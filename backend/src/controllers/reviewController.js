const DanhGiaSach = require('../models/DanhGiaSach');
const Sach = require('../models/Sach');
const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
const { sendSuccess, sendError } = require('../middlewares/responseEnvelope');
const { logAuditTrail } = require('../utils/auditLogger');

/**
 * Lấy danh sách nhận xét của một cuốn sách (Công khai cho mọi người dùng)
 */
exports.getReviewsByBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    let book = null;
    if (bookId.match(/^[0-9a-fA-F]{24}$/)) {
      book = await Sach.findById(bookId);
    } else {
      book = await Sach.findOne({ MaSach: bookId });
    }

    if (!book) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy thông tin ấn phẩm.',
        statusCode: 404
      });
    }

    const rawReviews = await DanhGiaSach.find({ SachId: book._id })
      .populate('DocGiaId', 'HoLot Ten HinhAnh Phai MaDocGia')
      .sort({ createdAt: -1 });

    const reviews = rawReviews.map((r) => {
      const docObj = r.toObject ? r.toObject() : { ...r };
      const reader = r.DocGiaId && typeof r.DocGiaId === 'object' ? r.DocGiaId : null;
      const currentAvatar = (reader && (reader.HinhAnh || reader.avatar)) || r.AvatarDocGia || '';
      const currentGender = (reader && (reader.Phai || reader.phai)) || 'Khác';
      const currentName = reader
        ? (`${reader.HoLot || ''} ${reader.Ten || ''}`.trim() || r.HoTenDocGia)
        : r.HoTenDocGia;

      return {
        ...docObj,
        AvatarDocGia: currentAvatar,
        HinhAnh: currentAvatar,
        PhaiDocGia: currentGender,
        HoTenDocGia: currentName,
        DocGiaId: reader?._id || r.DocGiaId
      };
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Number((reviews.reduce((sum, r) => sum + r.SoSao, 0) / totalReviews).toFixed(1))
      : 5.0;

    let canReview = false;
    let hasReturned = false;
    let myReview = null;

    if (req.user && req.userType === 'READER') {
      const returnedBorrow = await TheoDoiMuonSach.findOne({
        DocGiaId: req.user._id,
        SachId: book._id,
        TrangThai: 'RETURNED'
      });

      hasReturned = !!returnedBorrow;
      myReview = reviews.find(r => r.DocGiaId && r.DocGiaId.toString() === req.user._id.toString()) || null;
      canReview = hasReturned;
    }

    return sendSuccess(res, {
      data: {
        bookId: book._id,
        maSach: book.MaSach,
        tenSach: book.TenSach,
        reviews,
        totalReviews,
        averageRating,
        canReview,
        hasReturned,
        myReview
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Thêm hoặc Cập nhật nhận xét cho cuốn sách (Yêu cầu đã mượn và đã trả)
 */
exports.createReview = async (req, res, next) => {
  try {
    const { bookId, soSao, noiDung } = req.body;

    if (!bookId) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'ID hoặc Mã ấn phẩm là bắt buộc.',
        statusCode: 422
      });
    }

    if (!noiDung || noiDung.trim().length < 2) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Nội dung nhận xét tối thiểu từ 2 ký tự trở lên.',
        statusCode: 422
      });
    }

    if (soSao !== undefined && (isNaN(soSao) || Number(soSao) < 1 || Number(soSao) > 5)) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Điểm đánh giá phải là số nguyên từ 1 đến 5 sao.',
        statusCode: 400
      });
    }

    let book = null;
    if (bookId.match(/^[0-9a-fA-F]{24}$/)) {
      book = await Sach.findById(bookId);
    } else {
      book = await Sach.findOne({ MaSach: bookId });
    }

    if (!book) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy thông tin ấn phẩm.',
        statusCode: 404
      });
    }

    // KIỂM TRA ĐIỀU KIỆN NGHIỆP VỤ: Đã từng mượn và hoàn trả cuốn sách này thành công
    const hasReturned = await TheoDoiMuonSach.findOne({
      DocGiaId: req.user._id,
      SachId: book._id,
      TrangThai: 'RETURNED'
    });

    if (!hasReturned) {
      return sendError(res, {
        code: 'REVIEW_NOT_ELIGIBLE',
        message: 'Bạn chỉ có quyền nhận xét sau khi đã mượn và hoàn trả cuốn sách này thành công tại thư viện.',
        statusCode: 403
      });
    }

    const hoTen = `${req.user.HoLot || ''} ${req.user.Ten || ''}`.trim() || req.user.HoTen || 'Bạn đọc';
    const rating = Math.min(5, Math.max(1, Number(soSao) || 5));

    const review = await DanhGiaSach.findOneAndUpdate(
      { SachId: book._id, DocGiaId: req.user._id },
      {
        SachId: book._id,
        MaSach: book.MaSach,
        DocGiaId: req.user._id,
        MaDocGia: req.user.MaDocGia,
        HoTenDocGia: hoTen,
        AvatarDocGia: req.user.HinhAnh || req.user.avatar || req.user.Avatar || '',
        SoSao: rating,
        NoiDung: noiDung.trim()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return sendSuccess(res, {
      data: review,
      message: 'Cảm ơn bạn! Nhận xét ấn phẩm đã được đăng tải thành công.',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa nhận xét (Độc giả xóa nhận xét của mình, Staff xóa nhận xét bất kỳ nếu thấy không chuẩn xác)
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await DanhGiaSach.findById(id);
    if (!review) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy nhận xét cần xóa hoặc đã bị gỡ bỏ trước đó.',
        statusCode: 404
      });
    }

    const isStaff = req.userType === 'STAFF' && ['ADMIN', 'BOOK_MANAGER'].includes(req.user.ChucVu);
    const isOwner = req.userType === 'READER' && review.DocGiaId.toString() === req.user._id.toString();

    if (!isStaff && !isOwner) {
      return sendError(res, {
        code: 'AUTH_FORBIDDEN',
        message: 'Bạn không có quyền xóa nhận xét này.',
        statusCode: 403
      });
    }

    await DanhGiaSach.findByIdAndDelete(id);

    // Ghi nhật ký nếu là Nhân viên thư viện xóa nhận xét của bạn đọc
    if (isStaff) {
      await logAuditTrail(req, {
        hanhDong: 'DELETE_REVIEW',
        collection: 'DanhGiaSach',
        documentId: review._id,
        maDinhDanh: `${review.MaDocGia} - ${review.MaSach}`,
        chiTiet: `Thủ thư/Quản trị viên đã kiểm duyệt và xóa nhận xét của bạn đọc '${review.HoTenDocGia}' (${review.MaDocGia}) cho ấn phẩm ${review.MaSach}. Nội dung: "${review.NoiDung.substring(0, 100)}..."`,
        duLieuCu: review.toObject()
      });
    }

    return sendSuccess(res, {
      message: isStaff
        ? 'Đã xóa nhận xét của bạn đọc khỏi hệ thống thành công!'
        : 'Đã xóa nhận xét của bạn thành công!'
    });
  } catch (error) {
    next(error);
  }
};

