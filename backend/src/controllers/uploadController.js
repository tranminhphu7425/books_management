const { sendSuccess, sendError } = require('../middlewares/responseEnvelope');

// Upload ảnh bìa sách
exports.uploadCover = (req, res) => {
  if (!req.file) {
    return sendError(res, {
      code: 'VALIDATION_FAILED',
      message: 'Vui lòng chọn tập tin ảnh bìa sách để tải lên.',
      statusCode: 400
    });
  }

  const fileUrl = `/uploads/covers/${req.file.filename}`;
  return sendSuccess(res, {
    data: {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    },
    message: 'Tải lên ảnh bìa sách thành công!'
  });
};

// Upload ảnh đại diện avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Vui lòng chọn tập tin ảnh đại diện để tải lên.',
        statusCode: 400
      });
    }

    const fileUrl = `/uploads/avatars/${req.file.filename}`;
    const user = req.user;
    user.HinhAnh = fileUrl;
    await user.save();

    return sendSuccess(res, {
      data: {
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size
      },
      message: 'Tải lên và cập nhật ảnh đại diện thành công!'
    });
  } catch (error) {
    next(error);
  }
};
