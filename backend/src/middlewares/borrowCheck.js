const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
const Sach = require('../models/Sach');
const BienBanBoiThuong = require('../models/BienBanBoiThuong');
const CauHinhHeThong = require('../models/CauHinhHeThong');
const { sendError } = require('./responseEnvelope');

const borrowCheck = async (req, res, next) => {
  try {
    const user = req.user;
    const { sachId } = req.body;

    if (!sachId) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Mã sách (sachId) cần mượn là bắt buộc.',
        statusCode: 422
      });
    }

    // Lấy cấu hình hệ thống
    const config = await CauHinhHeThong.findOne({ KhoaCauHinh: 'QUY_DINH_MUON' });
    const maxBooks = config ? config.SoSachMuonToiDa : 3;

    // 1. Kiểm tra Blacklist
    if (user.DaBiKhoa) {
      return sendError(res, {
        code: 'BORROW_BLACKLISTED',
        message: `Tài khoản tạm thời bị khóa quyền mượn sách do vi phạm quy chế. Lý do: ${user.LyDoKhoa || 'Chưa giải quyết vi phạm'}.`,
        statusCode: 403
      });
    }

    // 2. Kiểm tra sách có tồn tại và còn bản rảnh trên kệ không
    const book = await Sach.findById(sachId);
    if (!book || book.TrangThai !== 'ACTIVE') {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Cuốn sách này không tồn tại hoặc đã được chuyển vào kho lưu trữ.',
        statusCode: 404
      });
    }

    if (book.SoQuyenKhaDung <= 0) {
      return sendError(res, {
        code: 'BOOK_OUT_OF_STOCK',
        message: 'Cuốn sách này hiện đã tạm hết bản rảnh trên kệ. Vui lòng quay lại sau.',
        statusCode: 400
      });
    }

    // 3. Đếm tổng số sách đang giữ + đang chờ duyệt
    const currentActiveBorrows = await TheoDoiMuonSach.find({
      DocGiaId: user._id,
      TrangThai: { $in: ['PENDING', 'APPROVED', 'BORROWED'] }
    });

    if (currentActiveBorrows.length >= maxBooks) {
      return sendError(res, {
        code: 'BORROW_LIMIT_EXCEEDED',
        message: `Bạn đã đạt giới hạn mượn tối đa ${maxBooks} cuốn sách theo quy định thư viện.`,
        details: {
          dangMuon: currentActiveBorrows.filter(b => b.TrangThai === 'BORROWED').length,
          choDuyet: currentActiveBorrows.filter(b => ['PENDING', 'APPROVED'].includes(b.TrangThai)).length,
          toiDa: maxBooks
        },
        statusCode: 400
      });
    }

    // 4. Kiểm tra mượn trùng đầu sách
    const isDuplicate = currentActiveBorrows.some(b => b.SachId.toString() === sachId.toString());
    if (isDuplicate) {
      return sendError(res, {
        code: 'BORROW_DUPLICATE_BOOK',
        message: 'Bạn đang mượn hoặc có yêu cầu chờ nhận cuốn sách này rồi. Vui lòng chọn đầu sách khác.',
        statusCode: 400
      });
    }

    // 5. Kiểm tra sách mượn quá hạn chưa trả
    const now = new Date();
    const hasOverdue = currentActiveBorrows.some(b => b.TrangThai === 'BORROWED' && b.HanTra && new Date(b.HanTra) < now);
    if (hasOverdue) {
      return sendError(res, {
        code: 'BORROW_OVERDUE_DEBT',
        message: 'Bạn có sách mượn đã quá hạn trả tại thư viện. Vui lòng mang sách đến quầy trả trước khi mượn cuốn mới.',
        statusCode: 400
      });
    }

    // 6. Kiểm tra nợ biên bản bồi thường UNPAID
    const unpaidFine = await BienBanBoiThuong.findOne({
      DocGiaId: user._id,
      TrangThai: 'UNPAID'
    });

    if (unpaidFine) {
      return sendError(res, {
        code: 'BORROW_UNPAID_FINE',
        message: `Bạn đang có biên bản bồi thường chưa giải quyết tại quầy (Số tiền: ${unpaidFine.SoTienBoiThuong.toLocaleString('vi-VN')} đ). Vui lòng thanh toán để mở lại quyền mượn sách.`,
        details: {
          maBienBan: unpaidFine.MaBienBan,
          soTien: unpaidFine.SoTienBoiThuong
        },
        statusCode: 400
      });
    }

    req.bookToBorrow = book;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = borrowCheck;
