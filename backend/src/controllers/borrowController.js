const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
const Sach = require('../models/Sach');
const DocGia = require('../models/DocGia');
const CauHinhHeThong = require('../models/CauHinhHeThong');
const { sendSuccess, sendError } = require('../middlewares/responseEnvelope');
const { logAuditTrail } = require('../utils/auditLogger');
const { buildVietnameseRegex } = require('../utils/vietnameseUtils');

// Độc giả gửi yêu cầu mượn sách (Quyền: USER)
exports.requestBorrow = async (req, res, next) => {
  try {
    const user = req.user;
    const { sachId, ngayHenLay } = req.body;
    const book = req.bookToBorrow; // Đã được load và validate qua borrowCheck middleware

    const newBorrow = await TheoDoiMuonSach.create({
      MaDocGia: user.MaDocGia,
      MaSach: book.MaSach,
      DocGiaId: user._id,
      SachId: book._id,
      TrangThai: 'PENDING',
      NgayYeuCau: new Date(),
      NgayHenLay: ngayHenLay ? new Date(ngayHenLay) : new Date(Date.now() + 24 * 3600 * 1000)
    });

    return sendSuccess(res, {
      data: newBorrow,
      message: 'Gửi yêu cầu mượn sách thành công! Yêu cầu đang chờ thủ thư xét duyệt.',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

// Độc giả xem danh sách phiếu mượn cá nhân (Quyền: USER)
exports.getMyBorrows = async (req, res, next) => {
  try {
    const user = req.user;
    const { status } = req.query;

    const query = {
      $or: [
        { DocGiaId: user._id },
        { MaDocGia: user.MaDocGia }
      ]
    };

    if (status && status !== 'ALL') {
      query.TrangThai = status;
    }

    const borrows = await TheoDoiMuonSach.find(query)
      .populate({
        path: 'SachId',
        select: 'TenSach TacGia NguonGoc HinhAnh TheLoai DonGia ViTri NamXuatBan MaNXB'
      })
      .sort({ createdAt: -1, NgayYeuCau: -1 });

    return sendSuccess(res, { data: borrows });
  } catch (error) {
    next(error);
  }
};

// Độc giả tự hủy yêu cầu khi còn PENDING (Quyền: USER)
exports.cancelMyBorrow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const borrow = await TheoDoiMuonSach.findOne({ _id: id, DocGiaId: user._id });
    if (!borrow) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy phiếu mượn sách yêu cầu.',
        statusCode: 404
      });
    }

    if (borrow.TrangThai !== 'PENDING') {
      return sendError(res, {
        code: 'ACTION_NOT_ALLOWED',
        message: 'Chỉ có thể tự hủy yêu cầu mượn khi đơn đang ở trạng thái chờ duyệt.',
        statusCode: 400
      });
    }

    borrow.TrangThai = 'CANCELLED';
    await borrow.save();

    return sendSuccess(res, {
      data: borrow,
      message: 'Đã hủy yêu cầu mượn sách thành công!'
    });
  } catch (error) {
    next(error);
  }
};

// Độc giả gia hạn thời gian mượn thêm 7 ngày (Quyền: USER)
exports.renewBorrow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const borrow = await TheoDoiMuonSach.findOne({ _id: id, DocGiaId: user._id });
    if (!borrow) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy phiếu mượn sách.',
        statusCode: 404
      });
    }

    if (borrow.TrangThai !== 'BORROWED') {
      return sendError(res, {
        code: 'ACTION_NOT_ALLOWED',
        message: 'Chỉ có thể gia hạn khi sách đang trong thời gian mượn đọc.',
        statusCode: 400
      });
    }

    const config = await CauHinhHeThong.findOne({ KhoaCauHinh: 'QUY_DINH_MUON' });
    const maxRenew = config ? config.SoLanGiaHanToiDa : 1;
    const renewDays = config ? config.SoNgayGiaHan : 7;

    if (borrow.SoLanGiaHan >= maxRenew) {
      return sendError(res, {
        code: 'RENEW_LIMIT_EXCEEDED',
        message: `Mỗi cuốn sách chỉ được phép gia hạn tối đa ${maxRenew} lần. Bạn đã hết lượt gia hạn cho cuốn sách này.`,
        statusCode: 400
      });
    }

    // Kiểm tra sách đã quá hạn chưa
    const now = new Date();
    if (borrow.HanTra && new Date(borrow.HanTra) < now) {
      return sendError(res, {
        code: 'BORROW_OVERDUE_DEBT',
        message: 'Sách đã quá hạn trả theo quy định. Không thể gia hạn trực tuyến, vui lòng mang sách đến quầy hoàn trả.',
        statusCode: 400
      });
    }

    const currentDue = borrow.HanTra ? new Date(borrow.HanTra) : now;
    borrow.HanTra = new Date(currentDue.getTime() + renewDays * 24 * 3600 * 1000);
    borrow.SoLanGiaHan += 1;
    await borrow.save();

    return sendSuccess(res, {
      data: borrow,
      message: `Gia hạn mượn sách thành công! Hạn trả mới đã được cộng thêm ${renewDays} ngày.`
    });
  } catch (error) {
    next(error);
  }
};

// Thủ thư xem danh sách toàn bộ phiếu mượn (Quyền: STAFF)
exports.getAllBorrows = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== 'ALL') {
      query.TrangThai = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = buildVietnameseRegex(search.trim());
      query.$or = [
        { MaDocGia: { $regex: searchRegex, $options: 'i' } },
        { MaSach: { $regex: searchRegex, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [borrows, totalRecords] = await Promise.all([
      TheoDoiMuonSach.find(query)
        .populate('DocGiaId', 'MaDocGia HoLot Ten Email DienThoai DaBiKhoa')
        .populate('SachId', 'MaSach TenSach TacGia TheLoai ViTri SoQuyenKhaDung DonGia HinhAnh')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      TheoDoiMuonSach.countDocuments(query)
    ]);

    return sendSuccess(res, {
      data: borrows,
      meta: {
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRecords,
          totalPages: Math.ceil(totalRecords / limitNum) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Thủ thư duyệt yêu cầu mượn sách (Quyền: STAFF)
exports.approveBorrow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staff = req.user;

    const borrow = await TheoDoiMuonSach.findById(id).populate('SachId').populate('DocGiaId');
    if (!borrow) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy phiếu yêu cầu mượn.',
        statusCode: 404
      });
    }

    if (borrow.TrangThai !== 'PENDING') {
      return sendError(res, {
        code: 'ACTION_NOT_ALLOWED',
        message: 'Chỉ có thể duyệt đơn ở trạng thái chờ duyệt.',
        statusCode: 400
      });
    }

    const config = await CauHinhHeThong.findOne({ KhoaCauHinh: 'QUY_DINH_MUON' });
    const holdHours = config ? config.ThoiGianGiuSachGio : 48;

    borrow.TrangThai = 'APPROVED';
    borrow.MSNVDuyet = staff.MSNV;
    borrow.NhanVienDuyetId = staff._id;
    borrow.HanChotNhan = new Date(Date.now() + holdHours * 3600 * 1000); // Giữ sách trong 48 giờ
    await borrow.save();

    await logAuditTrail(req, {
      hanhDong: 'APPROVE_BORROW',
      collection: 'TheoDoiMuonSach',
      documentId: borrow._id,
      maDinhDanh: `${borrow.MaDocGia} - ${borrow.MaSach}`,
      chiTiet: `Đã duyệt đơn mượn sách cho độc giả ${borrow.DocGiaId?.HoTen || borrow.MaDocGia} (Giữ sách ${holdHours}h)`,
      duLieuMoi: { TrangThai: 'APPROVED', HanChotNhan: borrow.HanChotNhan }
    });

    return sendSuccess(res, {
      data: borrow,
      message: `Đã duyệt đơn mượn sách! Thời hạn giữ sách tại quầy là ${holdHours} giờ.`
    });
  } catch (error) {
    next(error);
  }
};

// Thủ thư từ chối yêu cầu mượn sách (Quyền: STAFF)
exports.rejectBorrow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { lyDo } = req.body;
    const staff = req.user;

    const borrow = await TheoDoiMuonSach.findById(id);
    if (!borrow) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy phiếu yêu cầu mượn.',
        statusCode: 404
      });
    }

    if (borrow.TrangThai !== 'PENDING') {
      return sendError(res, {
        code: 'ACTION_NOT_ALLOWED',
        message: 'Chỉ có thể từ chối đơn ở trạng thái chờ duyệt.',
        statusCode: 400
      });
    }

    borrow.TrangThai = 'REJECTED';
    borrow.MSNVDuyet = staff.MSNV;
    borrow.NhanVienDuyetId = staff._id;
    borrow.GhiChu = lyDo ? `Từ chối bởi thủ thư: ${lyDo}` : 'Thủ thư từ chối đơn mượn.';
    await borrow.save();

    await logAuditTrail(req, {
      hanhDong: 'REJECT_BORROW',
      collection: 'TheoDoiMuonSach',
      documentId: borrow._id,
      maDinhDanh: `${borrow.MaDocGia} - ${borrow.MaSach}`,
      chiTiet: `Đã từ chối đơn mượn sách (${borrow.GhiChu})`
    });

    return sendSuccess(res, {
      data: borrow,
      message: 'Đã từ chối yêu cầu mượn sách.'
    });
  } catch (error) {
    next(error);
  }
};

// Thủ thư xuất sách cho bạn đọc tại quầy Check-out (Quyền: STAFF)
exports.checkoutBorrow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staff = req.user;

    const borrow = await TheoDoiMuonSach.findById(id).populate('SachId').populate('DocGiaId');
    if (!borrow) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy phiếu mượn.',
        statusCode: 404
      });
    }

    if (borrow.TrangThai !== 'APPROVED') {
      return sendError(res, {
        code: 'ACTION_NOT_ALLOWED',
        message: 'Chỉ có thể xuất sách khi đơn đã được duyệt và bạn đọc đến nhận.',
        statusCode: 400
      });
    }

    const book = await Sach.findById(borrow.SachId._id || borrow.SachId);
    if (!book || book.SoQuyenKhaDung <= 0) {
      return sendError(res, {
        code: 'BOOK_OUT_OF_STOCK',
        message: 'Số lượng sách khả dụng trong kho không đủ để xuất cho bạn đọc.',
        statusCode: 400
      });
    }

    const config = await CauHinhHeThong.findOne({ KhoaCauHinh: 'QUY_DINH_MUON' });
    const borrowDays = config ? config.SoNgayMuonToiDa : 14;

    const now = new Date();
    borrow.TrangThai = 'BORROWED';
    borrow.NgayMuon = now;
    borrow.HanTra = new Date(now.getTime() + borrowDays * 24 * 3600 * 1000);
    borrow.MSNVDuyet = staff.MSNV;
    borrow.NhanVienDuyetId = staff._id;
    await borrow.save();

    // Giảm số lượng rảnh trên kệ, tăng số lượng đang mượn
    book.SoQuyenKhaDung = Math.max(0, book.SoQuyenKhaDung - 1);
    book.SoQuyenDangMuon = (book.SoQuyenDangMuon || 0) + 1;
    await book.save();

    await logAuditTrail(req, {
      hanhDong: 'CHECKOUT_BOOK',
      collection: 'TheoDoiMuonSach',
      documentId: borrow._id,
      maDinhDanh: `${borrow.MaDocGia} - ${borrow.MaSach}`,
      chiTiet: `Đã xuất sách '${book.TenSach}' cho bạn đọc ${borrow.DocGiaId?.HoTen || borrow.MaDocGia} tại quầy (Thời hạn ${borrowDays} ngày)`
    });

    return sendSuccess(res, {
      data: borrow,
      message: `Đã xuất sách cho bạn đọc thành công! Hạn trả là ${borrowDays} ngày.`
    });
  } catch (error) {
    next(error);
  }
};

// Thủ thư nhận trả sách nguyên vẹn tại quầy Check-in (Quyền: STAFF)
exports.checkinBorrow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staff = req.user;

    const borrow = await TheoDoiMuonSach.findById(id).populate('SachId').populate('DocGiaId');
    if (!borrow) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy phiếu mượn.',
        statusCode: 404
      });
    }

    if (borrow.TrangThai !== 'BORROWED') {
      return sendError(res, {
        code: 'ACTION_NOT_ALLOWED',
        message: 'Chỉ có thể nhận trả cho các cuốn sách đang ở trạng thái mượn đọc.',
        statusCode: 400
      });
    }

    const now = new Date();
    borrow.TrangThai = 'RETURNED';
    borrow.NgayTra = now;
    await borrow.save();

    // Tăng số quyển khả dụng, giảm số quyển đang mượn
    const book = await Sach.findById(borrow.SachId._id || borrow.SachId);
    if (book) {
      book.SoQuyenKhaDung = Math.min(book.SoQuyen, book.SoQuyenKhaDung + 1);
      book.SoQuyenDangMuon = Math.max(0, (book.SoQuyenDangMuon || 1) - 1);
      await book.save();
    }

    await logAuditTrail(req, {
      hanhDong: 'CHECKIN_BOOK',
      collection: 'TheoDoiMuonSach',
      documentId: borrow._id,
      maDinhDanh: `${borrow.MaDocGia} - ${borrow.MaSach}`,
      chiTiet: `Đã nhận trả sách '${book?.TenSach || borrow.MaSach}' từ bạn đọc ${borrow.DocGiaId?.HoTen || borrow.MaDocGia} tại quầy`
    });

    return sendSuccess(res, {
      data: borrow,
      message: 'Nhận trả sách thành công! Đã hoàn trả 1 bản sách về kho khả dụng.'
    });
  } catch (error) {
    next(error);
  }
};
