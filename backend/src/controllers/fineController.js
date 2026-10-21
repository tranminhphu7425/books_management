const BienBanBoiThuong = require('../models/BienBanBoiThuong');
const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
const Sach = require('../models/Sach');
const DocGia = require('../models/DocGia');
const { sendSuccess, sendError } = require('../middlewares/responseEnvelope');
const { logAuditTrail } = require('../utils/auditLogger');
const { generateNextCode } = require('../utils/codeGenerator');

// Thủ thư lập biên bản sự cố rách/mất sách (Quyền: STAFF)
exports.createFine = async (req, res, next) => {
  try {
    const { theoDoiMuonId, loaiSuCo, moTa, soTienBoiThuong } = req.body;
    const staff = req.user;

    if (!theoDoiMuonId || !loaiSuCo || !moTa || soTienBoiThuong === undefined) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Vui lòng cung cấp đầy đủ: Mã phiếu mượn, Loại sự cố, Mô tả và Số tiền bồi thường thẩm định.',
        statusCode: 422
      });
    }

    const borrow = await TheoDoiMuonSach.findById(theoDoiMuonId);
    if (!borrow) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy phiếu mượn tương ứng để lập biên bản.',
        statusCode: 404
      });
    }

    // Sinh mã biên bản BBxxxx duy nhất, an toàn chống trùng lặp
    const maBienBan = await generateNextCode(BienBanBoiThuong, 'MaBienBan', 'BB', 4);

    const newFine = await BienBanBoiThuong.create({
      MaBienBan: maBienBan,
      MaTheoDoiMuon: borrow._id.toString(),
      TheoDoiMuonId: borrow._id,
      MaDocGia: borrow.MaDocGia,
      DocGiaId: borrow.DocGiaId,
      MaSach: borrow.MaSach,
      SachId: borrow.SachId,
      LoaiSuCo: loaiSuCo,
      MoTa: moTa.trim(),
      SoTienBoiThuong: Number(soTienBoiThuong),
      TrangThai: 'UNPAID',
      NgayLap: new Date()
    });

    // Nếu sách bị mất hoặc hỏng nặng, cập nhật số lượng hư hỏng trong kho
    const book = await Sach.findById(borrow.SachId);
    if (book) {
      book.SoQuyenHuHong = (book.SoQuyenHuHong || 0) + 1;
      book.SoQuyenDangMuon = Math.max(0, (book.SoQuyenDangMuon || 1) - 1);
      await book.save();
    }

    // Đánh dấu phiếu mượn đã hoàn thành trả (kèm sự cố)
    borrow.TrangThai = 'RETURNED';
    borrow.NgayTra = new Date();
    await borrow.save();

    await logAuditTrail(req, {
      hanhDong: 'CREATE_FINE',
      collection: 'BienBanBoiThuong',
      documentId: newFine._id,
      maDinhDanh: newFine.MaBienBan,
      chiTiet: `Đã lập biên bản sự cố ${newFine.LoaiSuCo === 'LOST' ? 'Mất sách' : 'Rách/Hỏng sách'} (${newFine.MaBienBan}) - Tiền thẩm định: ${newFine.SoTienBoiThuong.toLocaleString('vi-VN')} đ cho độc giả ${borrow.MaDocGia}`
    });

    return sendSuccess(res, {
      data: newFine,
      message: 'Lập biên bản bồi thường sự cố thành công! Tài khoản độc giả tạm khóa quyền mượn sách mới cho đến khi hoàn tất nộp tiền tại quầy.',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

// Thủ thư xem danh sách toàn bộ biên bản bồi thường (Quyền: STAFF)
exports.getAllFines = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== 'ALL') {
      query.TrangThai = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [fines, totalRecords] = await Promise.all([
      BienBanBoiThuong.find(query)
        .populate('DocGiaId', 'MaDocGia HoLot Ten Email DienThoai')
        .populate('SachId', 'MaSach TenSach DonGia')
        .populate('NhanVienThuTienId', 'MSNV HoTenNV')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      BienBanBoiThuong.countDocuments(query)
    ]);

    return sendSuccess(res, {
      data: fines,
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

// Độc giả xem danh sách biên bản bồi thường của bản thân (Quyền: USER)
exports.getMyFines = async (req, res, next) => {
  try {
    const user = req.user;
    const query = {
      $or: [
        { DocGiaId: user._id },
        { MaDocGia: user.MaDocGia }
      ]
    };
    const fines = await BienBanBoiThuong.find(query)
      .populate('SachId', 'MaSach TenSach HinhAnh TacGia DonGia')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { data: fines });
  } catch (error) {
    next(error);
  }
};

// Thủ thư xác nhận đã thu tiền bồi thường tại quầy (Quyền: STAFF)
exports.payFine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ghiChu } = req.body;
    const staff = req.user;

    const fine = await BienBanBoiThuong.findById(id).populate('DocGiaId');
    if (!fine) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy biên bản bồi thường yêu cầu.',
        statusCode: 404
      });
    }

    if (fine.TrangThai === 'PAID') {
      return sendError(res, {
        code: 'FINE_ALREADY_PAID',
        message: 'Biên bản bồi thường này đã được thanh toán trước đó.',
        statusCode: 400
      });
    }

    fine.TrangThai = 'PAID';
    fine.NgayGiaiQuyet = new Date();
    fine.MSNVThuTien = staff.MSNV;
    fine.NhanVienThuTienId = staff._id;
    fine.GhiChu = ghiChu ? ghiChu.trim() : 'Đã thu tiền bồi thường tại quầy thư viện.';
    await fine.save();

    await logAuditTrail(req, {
      hanhDong: 'PAY_FINE',
      collection: 'BienBanBoiThuong',
      documentId: fine._id,
      maDinhDanh: fine.MaBienBan,
      chiTiet: `Đã xác nhận thu tiền bồi thường (${fine.SoTienBoiThuong.toLocaleString('vi-VN')} đ) tại quầy cho biên bản ${fine.MaBienBan}`
    });

    return sendSuccess(res, {
      data: fine,
      message: 'Xác nhận thu tiền bồi thường tại quầy thành công! Quyền mượn sách của độc giả đã được giải tỏa.'
    });
  } catch (error) {
    next(error);
  }
};
