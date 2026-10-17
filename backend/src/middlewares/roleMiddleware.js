const { sendError } = require('./responseEnvelope');

/**
 * Chỉ cho phép Quản trị viên (ADMIN)
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.userType !== 'STAFF' || req.user.ChucVu !== 'ADMIN') {
    return sendError(res, {
      code: 'AUTH_FORBIDDEN',
      message: 'Bạn không có quyền quản trị tối cao để thực hiện thao tác này.',
      statusCode: 403
    });
  }
  next();
};

/**
 * Cho phép cả Quản trị viên và Thủ thư / Quản lý sách (ADMIN, BOOK_MANAGER)
 */
const requireStaff = (req, res, next) => {
  if (!req.user || req.userType !== 'STAFF' || !['ADMIN', 'BOOK_MANAGER'].includes(req.user.ChucVu)) {
    return sendError(res, {
      code: 'AUTH_FORBIDDEN',
      message: 'Yêu cầu quyền hạn nhân viên thư viện để thực hiện thao tác này.',
      statusCode: 403
    });
  }
  next();
};

/**
 * Cho phép độc giả (USER)
 */
const requireUser = (req, res, next) => {
  if (!req.user || req.userType !== 'READER') {
    return sendError(res, {
      code: 'AUTH_FORBIDDEN',
      message: 'Chỉ tài khoản độc giả mới có thể thực hiện thao tác này.',
      statusCode: 403
    });
  }
  next();
};

module.exports = { requireAdmin, requireStaff, requireUser };
