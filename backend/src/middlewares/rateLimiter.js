const rateLimit = require('express-rate-limit');
const { sendError } = require('./responseEnvelope');

// 1. Giới hạn tần suất cho Xác thực (Đăng nhập / Đăng ký)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // Nới lỏng trong development để không cản trở kiểm thử
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // Bỏ qua hoàn toàn trong development
  handler: (req, res) => {
    return sendError(res, {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Bạn đã thử đăng nhập quá nhiều lần. Vì lý do an toàn, vui lòng thử lại sau 15 phút.',
      statusCode: 429
    });
  }
});

// 2. Giới hạn tần suất cho Tạo đơn mượn sách
const borrowLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 20, // Tối đa 20 yêu cầu / phút
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Hệ thống đang tiếp nhận quá nhiều yêu cầu mượn sách. Vui lòng thử lại sau ít giây.',
      statusCode: 429
    });
  }
});

// 3. Giới hạn tần suất chung toàn hệ thống
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 100, // Tối đa 100 requests / phút / IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Bạn đã gửi yêu cầu quá nhanh. Vui lòng thử lại sau ít phút.',
      statusCode: 429
    });
  }
});

module.exports = { authLimiter, borrowLimiter, generalLimiter };
