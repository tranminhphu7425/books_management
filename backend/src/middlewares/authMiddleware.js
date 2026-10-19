const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');
const DocGia = require('../models/DocGia');
const NhanVien = require('../models/NhanVien');
const { sendError } = require('./responseEnvelope');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, {
      code: 'AUTH_UNAUTHORIZED',
      message: 'Bạn cần đăng nhập để thực hiện tính năng này.',
      statusCode: 401
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secret);

    // Kiểm tra trong NhanVien trước (ADMIN hoặc BOOK_MANAGER)
    let user = await NhanVien.findById(decoded.id).select('-Password');
    let userType = 'STAFF';

    // Nếu không tìm thấy, kiểm tra trong DocGia (USER)
    if (!user) {
      user = await DocGia.findById(decoded.id).select('-Password');
      userType = 'READER';
    }

    if (!user) {
      return sendError(res, {
        code: 'AUTH_UNAUTHORIZED',
        message: 'Tài khoản không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.',
        statusCode: 401
      });
    }

    // Kiểm tra nếu tài khoản độc giả bị khóa
    if (userType === 'READER' && user.DaBiKhoa) {
      return sendError(res, {
        code: 'BORROW_BLACKLISTED',
        message: `Tài khoản của bạn đang bị khóa quyền mượn sách. Lý do: ${user.LyDoKhoa || 'Vi phạm quy chế thư viện'}.`,
        statusCode: 403
      });
    }

    req.user = user;
    req.userType = userType;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, {
        code: 'AUTH_TOKEN_EXPIRED',
        message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        statusCode: 401
      });
    }
    return sendError(res, {
      code: 'AUTH_UNAUTHORIZED',
      message: 'Phiên đăng nhập không hợp lệ.',
      statusCode: 401
    });
  }
};

module.exports = authMiddleware;
