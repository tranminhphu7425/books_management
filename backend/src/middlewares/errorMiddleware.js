const logger = require('../config/logger');
const { sendError } = require('./responseEnvelope');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled Exception: %s', err.stack || err.message);

  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Hệ thống đang bận hoặc gián đoạn kết nối. Vui lòng thử lại sau ít phút.';
  let details = err.details || null;

  // Lỗi Mongoose Validation
  if (err.name === 'ValidationError') {
    statusCode = 422;
    code = 'VALIDATION_FAILED';
    const errors = Object.values(err.errors).map(el => el.message);
    message = errors.join(', ');
  }

  // Lỗi Mongoose Duplicate Key (E11000)
  if (err.code === 11000) {
    statusCode = 400;
    code = 'DUPLICATE_KEY_ERROR';
    const field = Object.keys(err.keyValue)[0];
    message = `Dữ liệu '${field}' với giá trị '${err.keyValue[field]}' đã tồn tại trong hệ thống.`;
  }

  // Lỗi Mongoose CastError (Sai định dạng ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID_FORMAT';
    message = `Định dạng mã định danh (ID) '${err.value}' không hợp lệ.`;
  }

  // Lỗi JWT Token
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'AUTH_UNAUTHORIZED';
    message = 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.';
  }

  // Lỗi Multer File Upload
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    code = 'FILE_TOO_LARGE';
    message = 'Kích thước tập tin vượt quá dung lượng cho phép (Avatar tối đa 2MB, Bìa sách tối đa 5MB).';
  }

  if (err.code === 'FILE_INVALID_TYPE') {
    statusCode = 400;
    code = 'FILE_INVALID_TYPE';
    message = err.message || 'Định dạng tệp không hợp lệ. Chỉ chấp nhận các định dạng .jpg, .jpeg, .png, .webp.';
  }

  return sendError(res, { code, message, details, statusCode });
};

module.exports = { errorHandler };
