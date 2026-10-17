const TheLoai = require('../models/TheLoai');
const Sach = require('../models/Sach');
const { sendSuccess, sendError } = require('../middlewares/responseEnvelope');
const { logAuditTrail } = require('../utils/auditLogger');
const { generateNextCode } = require('../utils/codeGenerator');
const { buildVietnameseRegex } = require('../utils/vietnameseUtils');

// Lấy danh sách tất cả Thể loại
exports.getCategories = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status) {
      query.TrangThai = status;
    } else {
      query.TrangThai = 'ACTIVE';
    }

    if (search && search.trim() !== '') {
      const searchRegex = buildVietnameseRegex(search.trim());
      query.$or = [
        { TenTheLoai: { $regex: searchRegex, $options: 'i' } },
        { MaTheLoai: { $regex: searchRegex, $options: 'i' } }
      ];
    }

    const categories = await TheLoai.find(query)
      .collation({ locale: 'vi', strength: 2 })
      .sort({ TenTheLoai: 1 });

    return sendSuccess(res, { data: categories });
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết thể loại theo ID hoặc MaTheLoai
exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let cat = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      cat = await TheLoai.findById(id);
    } else {
      cat = await TheLoai.findOne({ MaTheLoai: id });
    }

    if (!cat) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy thông tin thể loại ấn phẩm.',
        statusCode: 404
      });
    }

    return sendSuccess(res, { data: cat });
  } catch (error) {
    next(error);
  }
};

// Thêm Thể loại mới (Quyền: ADMIN, BOOK_MANAGER)
exports.createCategory = async (req, res, next) => {
  try {
    const { maTheLoai, tenTheLoai, moTa } = req.body;

    if (!tenTheLoai) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Tên thể loại là bắt buộc.',
        statusCode: 422
      });
    }

    let code = maTheLoai;
    if (!code) {
      code = await generateNextCode(TheLoai, 'MaTheLoai', 'TL', 2);
    }

    const existingCode = await TheLoai.findOne({ MaTheLoai: code });
    if (existingCode) {
      return sendError(res, {
        code: 'DUPLICATE_KEY_ERROR',
        message: `Mã thể loại '${code}' đã tồn tại trong hệ thống.`,
        statusCode: 400
      });
    }

    const existingName = await TheLoai.findOne({ TenTheLoai: tenTheLoai.trim() });
    if (existingName) {
      return sendError(res, {
        code: 'DUPLICATE_KEY_ERROR',
        message: `Tên thể loại '${tenTheLoai.trim()}' đã tồn tại trong hệ thống.`,
        statusCode: 400
      });
    }

    const newCategory = await TheLoai.create({
      MaTheLoai: code.toUpperCase(),
      TenTheLoai: tenTheLoai.trim(),
      MoTa: moTa ? moTa.trim() : '',
      TrangThai: 'ACTIVE'
    });

    await logAuditTrail(req, {
      hanhDong: 'CREATE_CATEGORY',
      collection: 'TheLoai',
      documentId: newCategory._id,
      maDinhDanh: newCategory.MaTheLoai,
      chiTiet: `Đã thêm mới thể loại '${newCategory.TenTheLoai}' (${newCategory.MaTheLoai})`,
      duLieuMoi: newCategory.toObject()
    });

    return sendSuccess(res, {
      data: newCategory,
      message: 'Thêm mới thể loại thành công!',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật thể loại (Quyền: ADMIN, BOOK_MANAGER)
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenTheLoai, moTa, trangThai } = req.body;

    const cat = await TheLoai.findById(id);
    if (!cat) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy thể loại cần cập nhật.',
        statusCode: 404
      });
    }

    const oldData = cat.toObject();

    if (tenTheLoai && tenTheLoai.trim() !== cat.TenTheLoai) {
      const existing = await TheLoai.findOne({
        TenTheLoai: tenTheLoai.trim(),
        _id: { $ne: cat._id }
      });
      if (existing) {
        return sendError(res, {
          code: 'DUPLICATE_KEY_ERROR',
          message: `Tên thể loại '${tenTheLoai.trim()}' đã được sử dụng.`,
          statusCode: 400
        });
      }
      cat.TenTheLoai = tenTheLoai.trim();
    }

    if (moTa !== undefined) cat.MoTa = moTa.trim();
    if (trangThai) cat.TrangThai = trangThai;

    await cat.save();

    await logAuditTrail(req, {
      hanhDong: 'UPDATE_CATEGORY',
      collection: 'TheLoai',
      documentId: cat._id,
      maDinhDanh: cat.MaTheLoai,
      chiTiet: `Đã cập nhật thông tin thể loại '${cat.TenTheLoai}' (${cat.MaTheLoai})`,
      duLieuCu: oldData,
      duLieuMoi: cat.toObject()
    });

    return sendSuccess(res, {
      data: cat,
      message: 'Cập nhật thể loại thành công!'
    });
  } catch (error) {
    next(error);
  }
};

// Xóa thể loại (Quyền: ADMIN, BOOK_MANAGER)
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cat = await TheLoai.findById(id);
    if (!cat) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy thể loại cần xóa.',
        statusCode: 404
      });
    }

    // Kiểm tra xem có sách nào đang gắn thể loại này không
    const bookCount = await Sach.countDocuments({
      $or: [
        { TheLoai: cat.TenTheLoai },
        { MaTheLoai: cat.MaTheLoai }
      ]
    });

    if (bookCount > 0) {
      return sendError(res, {
        code: 'CATEGORY_IN_USE',
        message: `Không thể xóa thể loại '${cat.TenTheLoai}' vì hiện có ${bookCount} đầu sách đang liên kết.`,
        statusCode: 400
      });
    }

    await TheLoai.findByIdAndDelete(id);

    await logAuditTrail(req, {
      hanhDong: 'DELETE_CATEGORY',
      collection: 'TheLoai',
      documentId: cat._id,
      maDinhDanh: cat.MaTheLoai,
      chiTiet: `Đã xóa vĩnh viễn thể loại '${cat.TenTheLoai}' (${cat.MaTheLoai})`,
      duLieuCu: cat.toObject()
    });

    return sendSuccess(res, {
      message: `Đã xóa thể loại '${cat.TenTheLoai}' thành công!`
    });
  } catch (error) {
    next(error);
  }
};
