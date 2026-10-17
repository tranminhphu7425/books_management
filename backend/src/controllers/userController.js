const bcrypt = require('bcryptjs');
const DocGia = require('../models/DocGia');
const NhanVien = require('../models/NhanVien');
const { sendSuccess, sendError } = require('../middlewares/responseEnvelope');
const { logAuditTrail } = require('../utils/auditLogger');
const { generateNextCode } = require('../utils/codeGenerator');

const { buildVietnameseRegex } = require('../utils/vietnameseUtils');

// Admin lấy danh sách người dùng (Quyền: ADMIN)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let users = [];
    let totalRecords = 0;

    const mapReader = (doc) => {
      const obj = doc.toObject ? doc.toObject() : doc;
      return {
        ...obj,
        Role: 'USER',
        ChucVu: 'USER',
        HoTen: `${obj.HoLot || ''} ${obj.Ten || ''}`.trim(),
        HoTenNV: `${obj.HoLot || ''} ${obj.Ten || ''}`.trim(),
        SoDienThoai: obj.DienThoai || obj.SoDienThoai || '',
        TrangThai: obj.DaBiKhoa ? 'BLACKLISTED' : 'ACTIVE',
        IsBlacklisted: Boolean(obj.DaBiKhoa)
      };
    };

    const mapStaff = (staff) => {
      const obj = staff.toObject ? staff.toObject() : staff;
      return {
        ...obj,
        Role: obj.ChucVu,
        ChucVu: obj.ChucVu,
        HoTen: obj.HoTenNV,
        DienThoai: obj.SoDienThoai || '',
        TrangThai: 'ACTIVE',
        IsBlacklisted: false
      };
    };

    if (role === 'ADMIN' || role === 'BOOK_MANAGER') {
      const query = { ChucVu: role };
      if (search && search.trim() !== '') {
        const searchRegex = buildVietnameseRegex(search.trim());
        query.$or = [
          { HoTenNV: { $regex: searchRegex, $options: 'i' } },
          { Email: { $regex: searchRegex, $options: 'i' } },
          { MSNV: { $regex: searchRegex, $options: 'i' } }
        ];
      }
      const [rawStaffs, count] = await Promise.all([
        NhanVien.find(query).select('-Password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        NhanVien.countDocuments(query)
      ]);
      users = rawStaffs.map(mapStaff);
      totalRecords = count;
    } else if (role === 'USER') {
      const query = {};
      if (search && search.trim() !== '') {
        const searchRegex = buildVietnameseRegex(search.trim());
        query.$or = [
          { HoLot: { $regex: searchRegex, $options: 'i' } },
          { Ten: { $regex: searchRegex, $options: 'i' } },
          { Email: { $regex: searchRegex, $options: 'i' } },
          { MaDocGia: { $regex: searchRegex, $options: 'i' } }
        ];
      }
      const [rawReaders, count] = await Promise.all([
        DocGia.find(query).select('-Password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        DocGia.countDocuments(query)
      ]);
      users = rawReaders.map(mapReader);
      totalRecords = count;
    } else {
      // Khi không truyền role hoặc role === 'ALL': Lấy cả độc giả và nhân viên
      const readerQuery = {};
      const staffQuery = {};
      if (search && search.trim() !== '') {
        const searchRegex = buildVietnameseRegex(search.trim());
        readerQuery.$or = [
          { HoLot: { $regex: searchRegex, $options: 'i' } },
          { Ten: { $regex: searchRegex, $options: 'i' } },
          { Email: { $regex: searchRegex, $options: 'i' } },
          { MaDocGia: { $regex: searchRegex, $options: 'i' } }
        ];
        staffQuery.$or = [
          { HoTenNV: { $regex: searchRegex, $options: 'i' } },
          { Email: { $regex: searchRegex, $options: 'i' } },
          { MSNV: { $regex: searchRegex, $options: 'i' } }
        ];
      }

      const [rawStaffs, rawReaders, countStaffs, countReaders] = await Promise.all([
        NhanVien.find(staffQuery).select('-Password').sort({ createdAt: -1 }),
        DocGia.find(readerQuery).select('-Password').sort({ createdAt: -1 }),
        NhanVien.countDocuments(staffQuery),
        DocGia.countDocuments(readerQuery)
      ]);

      const allUsers = [
        ...rawStaffs.map(mapStaff),
        ...rawReaders.map(mapReader)
      ];

      totalRecords = countStaffs + countReaders;
      users = allUsers.slice(skip, skip + limitNum);
    }

    return sendSuccess(res, {
      data: users,
      meta: {
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRecords,
          totalPages: Math.ceil(totalRecords / limitNum) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin tạo trực tiếp nhân viên / thủ thư mới (Quyền: ADMIN)
exports.createStaff = async (req, res, next) => {
  try {
    const hoTenNV = (req.body.hoTenNV || req.body.HoTenNV || req.body.hoTen || req.body.HoTen || '').trim();
    const email = (req.body.email || req.body.Email || '').toLowerCase().trim();
    const password = req.body.password || req.body.Password;
    const chucVu = (req.body.chucVu || req.body.ChucVu || req.body.role || req.body.Role || 'BOOK_MANAGER').toUpperCase();
    const diaChi = (req.body.diaChi || req.body.DiaChi || '').trim();
    const soDienThoai = (req.body.soDienThoai || req.body.SoDienThoai || req.body.dienThoai || req.body.DienThoai || '').toString().replace(/\D/g, '');
    const msnv = (req.body.msnv || req.body.MSNV || '').trim();

    if (!hoTenNV || !email || !password) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Họ tên nhân viên, Email và Mật khẩu là bắt buộc.',
        statusCode: 422
      });
    }

    const existing = await NhanVien.findOne({ Email: email });
    if (existing) {
      return sendError(res, {
        code: 'AUTH_EMAIL_EXISTS',
        message: 'Email nhân viên đã tồn tại trên hệ thống.',
        statusCode: 400
      });
    }

    let code = msnv;
    if (!code) {
      code = await generateNextCode(NhanVien, 'MSNV', 'NV', 3);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStaff = await NhanVien.create({
      MSNV: code,
      HoTenNV: hoTenNV,
      Email: email,
      Password: hashedPassword,
      ChucVu: chucVu,
      DiaChi: diaChi,
      SoDienThoai: soDienThoai
    });

    await logAuditTrail(req, {
      hanhDong: 'CREATE_STAFF',
      collection: 'NhanVien',
      documentId: newStaff._id,
      maDinhDanh: newStaff.MSNV,
      chiTiet: `Đã tạo tài khoản nhân viên '${newStaff.HoTenNV}' (${newStaff.MSNV}) - Chức vụ: ${newStaff.ChucVu}`
    });

    return sendSuccess(res, {
      data: {
        id: newStaff._id,
        msnv: newStaff.MSNV,
        hoTenNV: newStaff.HoTenNV,
        email: newStaff.Email,
        chucVu: newStaff.ChucVu
      },
      message: 'Tạo tài khoản nhân viên thành công!',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

// Admin cập nhật vai trò người dùng / nhân sự (Quyền: ADMIN)
exports.updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const chucVu = (req.body.chucVu || req.body.role || '').toUpperCase();

    if (!['ADMIN', 'BOOK_MANAGER', 'USER'].includes(chucVu)) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Chức vụ không hợp lệ. Chỉ chấp nhận ADMIN, BOOK_MANAGER hoặc USER.',
        statusCode: 422
      });
    }

    // 1. Kiểm tra đối tượng trong NhanVien
    let staff = await NhanVien.findById(id);

    // 2. Nếu không có trong NhanVien, kiểm tra trong DocGia
    let reader = null;
    if (!staff) {
      reader = await DocGia.findById(id);
    }

    if (!staff && !reader) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy tài khoản cần cập nhật chức vụ.',
        statusCode: 404
      });
    }

    // TH1: Thao tác trên tài khoản NhanVien
    if (staff) {
      if (staff._id.toString() === req.user._id.toString() && chucVu !== 'ADMIN') {
        return sendError(res, {
          code: 'FORBIDDEN_ACTION',
          message: 'Quản trị viên không thể tự hạ quyền của chính mình.',
          statusCode: 403
        });
      }

      if (chucVu === 'ADMIN' || chucVu === 'BOOK_MANAGER') {
        const oldRole = staff.ChucVu;
        staff.ChucVu = chucVu;
        await staff.save();

        await logAuditTrail(req, {
          hanhDong: 'UPDATE_ROLE',
          collection: 'NhanVien',
          documentId: staff._id,
          maDinhDanh: staff.MSNV,
          chiTiet: `Đã đổi vai trò nhân viên ${staff.HoTenNV} (${staff.MSNV}) từ ${oldRole} sang ${chucVu}`,
          duLieuCu: { ChucVu: oldRole },
          duLieuMoi: { ChucVu: chucVu }
        });

        return sendSuccess(res, {
          data: staff,
          message: `Đã cập nhật vai trò nhân viên thành ${chucVu === 'ADMIN' ? 'Quản trị viên' : 'Thủ thư'}!`
        });
      } else if (chucVu === 'USER') {
        // Chuyển từ Nhân viên -> Độc giả (USER)
        let existingReader = await DocGia.findOne({ Email: staff.Email });
        if (!existingReader) {
          const maDocGia = await generateNextCode(DocGia, 'MaDocGia', 'DG', 3);
          const nameParts = (staff.HoTenNV || '').trim().split(' ');
          const ten = nameParts.length > 1 ? nameParts.pop() : nameParts[0] || 'User';
          const hoLot = nameParts.join(' ') || 'Độc giả';

          existingReader = await DocGia.create({
            MaDocGia: maDocGia,
            HoLot: hoLot,
            Ten: ten,
            Email: staff.Email,
            Password: staff.Password,
            DienThoai: staff.SoDienThoai || '',
            DiaChi: staff.DiaChi || ''
          });
        }

        const oldMsnv = staff.MSNV;
        const oldName = staff.HoTenNV;
        await NhanVien.findByIdAndDelete(staff._id);

        await logAuditTrail(req, {
          hanhDong: 'CONVERT_STAFF_TO_READER',
          collection: 'DocGia',
          documentId: existingReader._id,
          maDinhDanh: existingReader.MaDocGia,
          chiTiet: `Đã chuyển nhân viên ${oldName} (${oldMsnv}) thành bạn đọc / độc giả (${existingReader.MaDocGia})`
        });

        return sendSuccess(res, {
          data: existingReader,
          message: `Đã chuyển đổi tài khoản nhân sự thành bạn đọc (USER) thành công!`
        });
      }
    }

    // TH2: Thao tác trên tài khoản DocGia (Độc giả)
    if (reader) {
      if (chucVu === 'USER') {
        return sendSuccess(res, {
          data: reader,
          message: 'Tài khoản hiện tại đã là Độc giả (USER).'
        });
      }

      // Nâng quyền Độc giả -> Nhân viên (BOOK_MANAGER hoặc ADMIN)
      let existingStaff = await NhanVien.findOne({ Email: reader.Email });
      let staffPassword = reader.Password;
      if (!staffPassword) {
        staffPassword = await bcrypt.hash('Library@123', 10);
      }

      if (!existingStaff) {
        const msnv = await generateNextCode(NhanVien, 'MSNV', 'NV', 3);
        const hoTen = reader.HoTen || `${reader.HoLot || ''} ${reader.Ten || ''}`.trim() || 'Nhân viên';

        existingStaff = await NhanVien.create({
          MSNV: msnv,
          HoTenNV: hoTen,
          Email: reader.Email,
          Password: staffPassword,
          ChucVu: chucVu,
          DiaChi: reader.DiaChi || '',
          SoDienThoai: reader.DienThoai || ''
        });
      } else {
        existingStaff.ChucVu = chucVu;
        await existingStaff.save();
      }

      await logAuditTrail(req, {
        hanhDong: 'PROMOTE_READER_TO_STAFF',
        collection: 'NhanVien',
        documentId: existingStaff._id,
        maDinhDanh: existingStaff.MSNV,
        chiTiet: `Đã nâng quyền độc giả ${reader.HoTen || reader.Ten} (${reader.MaDocGia}) thành nhân sự (${existingStaff.MSNV}) với vai trò ${chucVu}`
      });

      return sendSuccess(res, {
        data: existingStaff,
        message: `Đã nâng quyền bạn đọc thành ${chucVu === 'ADMIN' ? 'Quản trị viên' : 'Thủ thư'} thành công!`
      });
    }
  } catch (error) {
    next(error);
  }
};

// Admin đưa vào Blacklist hoặc Gỡ khỏi Blacklist (Quyền: ADMIN)
exports.toggleBlacklist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const daBiKhoa = req.body.daBiKhoa !== undefined ? req.body.daBiKhoa : req.body.isBlacklisted;
    const lyDoKhoa = req.body.lyDoKhoa !== undefined ? req.body.lyDoKhoa : req.body.reason;

    const reader = await DocGia.findById(id);
    if (!reader) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy độc giả cần thao tác.',
        statusCode: 404
      });
    }

    const oldState = reader.DaBiKhoa;
    reader.DaBiKhoa = Boolean(daBiKhoa);
    reader.LyDoKhoa = reader.DaBiKhoa ? (lyDoKhoa ? lyDoKhoa.trim() : 'Vi phạm quy chế mượn trả thư viện') : null;
    reader.NgayKhoa = reader.DaBiKhoa ? new Date() : null;
    await reader.save();

    await logAuditTrail(req, {
      hanhDong: reader.DaBiKhoa ? 'BLACKLIST_USER' : 'UNBLACKLIST_USER',
      collection: 'DocGia',
      documentId: reader._id,
      maDinhDanh: reader.MaDocGia,
      chiTiet: reader.DaBiKhoa
        ? `Đã khóa quyền mượn sách độc giả ${reader.HoTen || reader.Ten} (${reader.MaDocGia}). Lý do: ${reader.LyDoKhoa}`
        : `Đã mở khóa quyền mượn sách cho độc giả ${reader.HoTen || reader.Ten} (${reader.MaDocGia})`,
      duLieuCu: { DaBiKhoa: oldState },
      duLieuMoi: { DaBiKhoa: reader.DaBiKhoa, LyDoKhoa: reader.LyDoKhoa }
    });

    return sendSuccess(res, {
      data: reader,
      message: reader.DaBiKhoa
        ? `Đã khóa quyền mượn sách của độc giả ${reader.HoTen || reader.Ten}.`
        : `Đã mở khóa quyền mượn sách cho độc giả ${reader.HoTen || reader.Ten}.`
    });
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết người dùng / độc giả theo ID hoặc Mã (Quyền: STAFF)
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let user = null;
    let role = 'USER';

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await DocGia.findById(id).select('-Password');
      if (!user) {
        user = await NhanVien.findById(id).select('-Password');
        if (user) role = user.ChucVu;
      }
    } else {
      user = await DocGia.findOne({ MaDocGia: id }).select('-Password');
      if (!user) {
        user = await NhanVien.findOne({ MSNV: id }).select('-Password');
        if (user) role = user.ChucVu;
      }
    }

    if (!user) {
      return sendError(res, {
        code: 'RESOURCE_NOT_FOUND',
        message: 'Không tìm thấy tài khoản người dùng yêu cầu.',
        statusCode: 404
      });
    }

    const userObj = user.toObject ? user.toObject() : user;
    const isStaff = ['ADMIN', 'BOOK_MANAGER'].includes(role);

    return sendSuccess(res, {
      data: {
        ...userObj,
        Role: role,
        ChucVu: role,
        HoTen: isStaff ? userObj.HoTenNV : `${userObj.HoLot || ''} ${userObj.Ten || ''}`.trim(),
        SoDienThoai: userObj.DienThoai || userObj.SoDienThoai || '',
        TrangThai: userObj.DaBiKhoa ? 'BLACKLISTED' : 'ACTIVE',
        IsBlacklisted: Boolean(userObj.DaBiKhoa)
      }
    });
  } catch (error) {
    next(error);
  }
};
