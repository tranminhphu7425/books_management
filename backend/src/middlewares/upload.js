const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục lưu trữ tồn tại
const coversDir = path.join(__dirname, '../../uploads/covers');
const avatarsDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

// Bộ lọc định dạng MIME Type và phần mở rộng an toàn
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error('Định dạng tệp không hợp lệ. Chỉ chấp nhận các tệp ảnh định dạng .jpg, .jpeg, .png, .webp.');
    error.code = 'FILE_INVALID_TYPE';
    error.statusCode = 400;
    cb(error, false);
  }
};

// Cấu hình lưu trữ ảnh bìa sách
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, coversDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'cover-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

// Cấu hình lưu trữ avatar
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

// Giới hạn dung lượng: Bìa sách 5MB, Avatar 2MB
const uploadCover = multer({
  storage: coverStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

module.exports = { uploadCover, uploadAvatar };
