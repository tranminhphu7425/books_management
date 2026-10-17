/**
 * Chuẩn hóa cấu trúc phản hồi thành công (Success Response Envelope)
 */
const sendSuccess = (res, { data = null, message = 'Thao tác thành công.', meta = {}, statusCode = 200 }) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  });
};

/**
 * Chuẩn hóa cấu trúc phản hồi thất bại (Error Response Envelope)
 */
const sendError = (res, { code = 'INTERNAL_SERVER_ERROR', message = 'Đã xảy ra lỗi trong quá trình xử lý.', details = null, statusCode = 400 }) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = { sendSuccess, sendError };
