const NhaXuatBan = require('../models/NhaXuatBan');
const { sendSuccess, sendError } = require('../middlewares/responseEnvelope');
const { logAuditTrail } = require('../utils/auditLogger');
const { generateNextCode } = require('../utils/codeGenerator');
const { buildVietnameseRegex } = require('../utils/vietnameseUtils');

// Lấy danh sách tất cả Nhà xuất bản
exports.getPublishers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};
    if (search && search.trim() !== '') {
      const searchRegex = buildVietnameseRegex(search.trim());
      query.$or = [
        { TenNXB: { $regex: searchRegex, $options: 'i' } },
        { MaNXB: { $regex: searchRegex, $options: 'i' } }
      ];
    }
    const publishers = await NhaXuatBan.find(query).sort({ TenNXB: 1 });
    return sendSuccess(res, { data: publishers });
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết NXB theo ID hoặc MaNXB
exports.getPublisherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let pub = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      pub = await NhaXuatBan.findById(id);
    } else {
      pub = await NhaXuatBan.findOne({ MaNXB: id });
    }

    if (!pub) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy thông tin Nhà xuất bản.',
        statusCode: 404
      });
    }

    return sendSuccess(res, { data: pub });
  } catch (error) {
    next(error);
  }
};

// Thêm NXB mới (Quyền: ADMIN, BOOK_MANAGER)
exports.createPublisher = async (req, res, next) => {
  try {
    const { maNXB, tenNXB, diaChi, dienThoai, email } = req.body;

    if (!tenNXB) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Tên Nhà xuất bản là bắt buộc.',
        statusCode: 422
      });
    }

    let code = maNXB;
    if (!code) {
      code = await generateNextCode(NhaXuatBan, 'MaNXB', 'NXB', 2);
    }

    const existing = await NhaXuatBan.findOne({ MaNXB: code });
    if (existing) {
      return sendError(res, {
        code: 'DUPLICATE_KEY_ERROR',
        message: `Mã nhà xuất bản '${code}' đã tồn tại.`,
        statusCode: 400
      });
    }

    const newPub = await NhaXuatBan.create({
      MaNXB: code,
      TenNXB: tenNXB.trim(),
      DiaChi: diaChi || '',
      DienThoai: dienThoai || '',
      Email: email || ''
    });

    await logAuditTrail(req, {
      hanhDong: 'CREATE_PUBLISHER',
      collection: 'NhaXuatBan',
      documentId: newPub._id,
      maDinhDanh: newPub.MaNXB,
      chiTiet: `Đã thêm mới Nhà xuất bản '${newPub.TenNXB}' (${newPub.MaNXB})`
    });

    return sendSuccess(res, {
      data: newPub,
      message: 'Thêm mới Nhà xuất bản thành công!',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật NXB (Quyền: ADMIN, BOOK_MANAGER)
exports.updatePublisher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pub = await NhaXuatBan.findById(id);

    if (!pub) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy Nhà xuất bản cần cập nhật.',
        statusCode: 404
      });
    }

    const { tenNXB, diaChi, dienThoai, email } = req.body;
    if (tenNXB) pub.TenNXB = tenNXB.trim();
    if (diaChi !== undefined) pub.DiaChi = diaChi.trim();
    if (dienThoai !== undefined) pub.DienThoai = dienThoai.trim();
    if (email !== undefined) pub.Email = email.trim();

    await pub.save();

    await logAuditTrail(req, {
      hanhDong: 'UPDATE_PUBLISHER',
      collection: 'NhaXuatBan',
      documentId: pub._id,
      maDinhDanh: pub.MaNXB,
      chiTiet: `Đã cập nhật thông tin Nhà xuất bản '${pub.TenNXB}' (${pub.MaNXB})`
    });

    return sendSuccess(res, {
      data: pub,
      message: 'Cập nhật Nhà xuất bản thành công!'
    });
  } catch (error) {
    next(error);
  }
};

// Xóa NXB (Quyền: ADMIN)
exports.deletePublisher = async (req, res, next) => {
  try {
    const { id } = req.params;
    let pub = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      pub = await NhaXuatBan.findById(id);
    } else {
      pub = await NhaXuatBan.findOne({ MaNXB: id });
    }

    if (!pub) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy Nhà xuất bản cần xóa.',
        statusCode: 404
      });
    }

    // Kiểm tra ràng buộc: Không cho xóa nếu đang có sách liên kết với NXB này
    const Sach = require('../models/Sach');
    const bookCount = await Sach.countDocuments({ MaNXB: pub.MaNXB });
    if (bookCount > 0) {
      return sendError(res, {
        code: 'PUBLISHER_IN_USE',
        message: `Không thể xóa Nhà xuất bản '${pub.TenNXB}' vì đang có ${bookCount} ấn phẩm trong kho liên kết với NXB này.`,
        statusCode: 400
      });
    }

    await NhaXuatBan.findByIdAndDelete(pub._id);

    await logAuditTrail(req, {
      hanhDong: 'DELETE_PUBLISHER',
      collection: 'NhaXuatBan',
      documentId: pub._id,
      maDinhDanh: pub.MaNXB,
      chiTiet: `Đã xóa Nhà xuất bản '${pub.TenNXB}' (${pub.MaNXB})`
    });

    return sendSuccess(res, {
      message: `Đã xóa Nhà xuất bản '${pub.TenNXB}' thành công!`
    });
  } catch (error) {
    next(error);
  }
};
