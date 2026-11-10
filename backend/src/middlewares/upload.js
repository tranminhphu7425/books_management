const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Bộ lọc định dạng ảnh hợp lệ
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      "Định dạng tệp không hợp lệ. Chỉ chấp nhận .jpg, .jpeg, .png, .webp.",
    );
    error.code = "FILE_INVALID_TYPE";
    error.statusCode = 400;
    cb(error, false);
  }
};

// Cấu hình lưu trữ ảnh bìa sách trên Cloudinary (Folder: books_management/covers)
const coverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "books_management/covers",
    allowed_formats: ["jpg", "png", "webp", "jpeg"],
    transformation: [
      { width: 800, height: 1200, crop: "limit", quality: "auto" },
    ], // Tự động tối ưu dung lượng
  },
});

// Cấu hình lưu trữ Avatar trên Cloudinary (Folder: books_management/avatars)
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "books_management/avatars",
    allowed_formats: ["jpg", "png", "webp", "jpeg"],
    transformation: [
      {
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "face",
        quality: "auto",
      },
    ], // Tự động canh giữa khuôn mặt
  },
});

const uploadCover = multer({
  storage: coverStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = { uploadCover, uploadAvatar };
