const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DocGia = require('../models/DocGia');
const NhanVien = require('../models/NhanVien');
const { secret, expiresIn, refreshSecret, refreshExpiresIn } = require('../config/jwt');
const { verifyGoogleToken } = require('../config/googleOAuth');
const { sendSuccess, sendError } = require('../middlewares/responseEnvelope');
const { generateNextCode } = require('../utils/codeGenerator');

// Helper cấp Access và Refresh Token
const generateTokens = (user, role) => {
  const payload = {
    id: user._id,
    email: user.Email,
    role: role
  };
  const accessToken = jwt.sign(payload, secret, { expiresIn });
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiresIn });
  return { accessToken, refreshToken };
};

// Đăng ký độc giả mới
exports.register = async (req, res, next) => {
  try {
    // Chấp nhận cả camelCase (frontend gửi) lẫn PascalCase
    const hoLot = req.body.hoLot || req.body.HoLot;
    const ten = req.body.ten || req.body.Ten;
    const email = req.body.email || req.body.Email;
    const password = req.body.password || req.body.Password;
    const rawDienThoai = req.body.dienThoai || req.body.DienThoai || '';
    const dienThoai = rawDienThoai.toString().replace(/\D/g, '');
    const diaChi = req.body.diaChi || req.body.DiaChi;
    const phai = req.body.phai || req.body.Phai;
    const ngaySinh = req.body.ngaySinh || req.body.NgaySinh;

    if (!email || !password || !hoLot || !ten) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Vui lòng cung cấp đầy đủ thông tin: Họ lót, Tên, Email và Mật khẩu.',
        statusCode: 422
      });
    }

    const existingUser = await DocGia.findOne({ Email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, {
        code: 'AUTH_EMAIL_EXISTS',
        message: 'Địa chỉ email này đã được đăng ký tài khoản trong hệ thống.',
        statusCode: 400
      });
    }

    // Tự động sinh mã độc giả DGxxx duy nhất, an toàn chống trùng lặp
    const maDocGia = await generateNextCode(DocGia, 'MaDocGia', 'DG', 3);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newDocGia = await DocGia.create({
      MaDocGia: maDocGia,
      HoLot: hoLot.trim(),
      Ten: ten.trim(),
      Email: email.toLowerCase().trim(),
      Password: hashedPassword,
      DienThoai: dienThoai || '',
      DiaChi: diaChi || '',
      Phai: phai || 'Nam',
      NgaySinh: ngaySinh ? new Date(ngaySinh) : null
    });

    const tokens = generateTokens(newDocGia, 'USER');
    const hoTen = `${newDocGia.HoLot} ${newDocGia.Ten}`.trim();

    return sendSuccess(res, {
      data: {
        user: {
          id: newDocGia._id,
          maDocGia: newDocGia.MaDocGia,
          hoTen,
          email: newDocGia.Email,
          role: 'USER',
          avatar: newDocGia.HinhAnh
        },
        ...tokens
      },
      message: 'Đăng ký tài khoản độc giả thành công!',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 1. Đăng nhập Cổng Độc giả (User Portal)
// Chỉ dành riêng cho Độc giả (USER). Chặn tài khoản nhân viên / quản trị viên.
// =========================================================================
exports.readerLogin = async (req, res, next) => {
  try {
    const rawEmail = req.body.email || req.body.emailOrPhone;
    const { password } = req.body;

    if (!rawEmail || !password) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Vui lòng nhập đầy đủ Email/Số điện thoại và Mật khẩu đăng nhập.',
        statusCode: 422
      });
    }

    const cleanInput = rawEmail.trim();
    const searchEmail = cleanInput.toLowerCase();
    const phoneDigits = cleanInput.replace(/\D/g, '');

    // 1. Chặn ngay lập tức nếu tài khoản là Nhân viên / Quản trị viên (ADMIN, BOOK_MANAGER)
    let staffQuery = [{ Email: searchEmail }];
    if (phoneDigits && phoneDigits.length >= 9) {
      staffQuery.push({ SoDienThoai: phoneDigits });
    }
    const staff = await NhanVien.findOne({ $or: staffQuery });
    if (staff) {
      return sendError(res, {
        code: 'AUTH_FORBIDDEN',
        message: 'Tài khoản quản trị viên / nhân viên không được phép đăng nhập tại Cổng Độc giả. Vui lòng truy cập Cổng Quản Trị.',
        statusCode: 403
      });
    }

    // 2. Tìm kiếm trong DocGia (USER)
    let readerQuery = [{ Email: searchEmail }];
    if (phoneDigits && phoneDigits.length >= 9) {
      readerQuery.push({ DienThoai: phoneDigits });
    }
    const reader = await DocGia.findOne({ $or: readerQuery });

    if (!reader) {
      return sendError(res, {
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
        statusCode: 401
      });
    }

    // Kiểm tra nếu tài khoản bị khóa trong Blacklist
    if (reader.DaBiKhoa) {
      return sendError(res, {
        code: 'BORROW_BLACKLISTED',
        message: `Tài khoản độc giả đang bị khóa do vi phạm quy chế. Lý do: ${reader.LyDoKhoa || 'Vi phạm thư viện'}.`,
        statusCode: 403
      });
    }

    // Nếu tài khoản Google chưa khởi tạo mật khẩu
    if (!reader.Password) {
      return sendError(res, {
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Tài khoản này được đăng ký bằng Google. Vui lòng sử dụng tính năng "Đăng nhập với Google".',
        statusCode: 401
      });
    }

    const isMatch = await reader.comparePassword(password);
    if (!isMatch) {
      return sendError(res, {
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
        statusCode: 401
      });
    }

    const hoTen = `${reader.HoLot || ''} ${reader.Ten || ''}`.trim();
    const tokens = generateTokens(reader, 'USER');

    return sendSuccess(res, {
      data: {
        user: {
          id: reader._id,
          _id: reader._id,
          maDocGia: reader.MaDocGia,
          MaDocGia: reader.MaDocGia,
          hoTen,
          HoLot: reader.HoLot,
          Ten: reader.Ten,
          email: reader.Email,
          Email: reader.Email,
          role: 'USER',
          Role: 'USER',
          avatar: reader.HinhAnh,
          HinhAnh: reader.HinhAnh,
          dienThoai: reader.DienThoai,
          diaChi: reader.DiaChi,
          phai: reader.Phai,
          ngaySinh: reader.NgaySinh
        },
        ...tokens
      },
      message: 'Đăng nhập cổng độc giả thành công!'
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 2. Đăng nhập Cổng Quản trị & Thủ thư (Admin Portal)
// Chỉ dành riêng cho Nhân viên (ADMIN, BOOK_MANAGER). Chặn tài khoản độc giả.
// =========================================================================
exports.adminLogin = async (req, res, next) => {
  try {
    const rawEmail = req.body.email || req.body.emailOrPhone;
    const { password } = req.body;

    if (!rawEmail || !password) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Vui lòng nhập đầy đủ Email/Số điện thoại và Mật khẩu đăng nhập.',
        statusCode: 422
      });
    }

    const cleanInput = rawEmail.trim();
    const searchEmail = cleanInput.toLowerCase();
    const phoneDigits = cleanInput.replace(/\D/g, '');

    // 1. Chặn ngay lập tức nếu tài khoản là Độc giả (DocGia / USER)
    let readerQuery = [{ Email: searchEmail }];
    if (phoneDigits && phoneDigits.length >= 9) {
      readerQuery.push({ DienThoai: phoneDigits });
    }
    const reader = await DocGia.findOne({ $or: readerQuery });
    if (reader) {
      return sendError(res, {
        code: 'AUTH_FORBIDDEN',
        message: 'Tài khoản độc giả không có thẩm quyền truy cập Cổng Quản Trị & Thủ Thư.',
        statusCode: 403
      });
    }

    // 2. Tìm kiếm trong NhanVien (ADMIN hoặc BOOK_MANAGER)
    let staffQuery = [{ Email: searchEmail }];
    if (phoneDigits && phoneDigits.length >= 9) {
      staffQuery.push({ SoDienThoai: phoneDigits });
    }
    const staff = await NhanVien.findOne({ $or: staffQuery });

    if (!staff) {
      return sendError(res, {
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
        statusCode: 401
      });
    }

    const isMatch = await staff.comparePassword(password);
    if (!isMatch) {
      return sendError(res, {
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
        statusCode: 401
      });
    }

    const tokens = generateTokens(staff, staff.ChucVu);

    return sendSuccess(res, {
      data: {
        user: {
          id: staff._id,
          _id: staff._id,
          msnv: staff.MSNV,
          MSNV: staff.MSNV,
          hoTen: staff.HoTenNV,
          HoTenNV: staff.HoTenNV,
          email: staff.Email,
          Email: staff.Email,
          role: staff.ChucVu,
          Role: staff.ChucVu,
          avatar: staff.HinhAnh,
          HinhAnh: staff.HinhAnh,
          soDienThoai: staff.SoDienThoai,
          diaChi: staff.DiaChi
        },
        ...tokens
      },
      message: 'Đăng nhập cổng quản trị thành công!'
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 3. Đăng nhập tương thích ngược (/api/auth/login)
// Điều hướng dựa trên tham số portal hoặc tự động nhận diện loại tài khoản
// =========================================================================
exports.login = async (req, res, next) => {
  try {
    const portal = req.body.portal || req.headers['x-portal'];
    if (portal === 'admin' || portal === 'staff') {
      return exports.adminLogin(req, res, next);
    }
    if (portal === 'reader' || portal === 'user') {
      return exports.readerLogin(req, res, next);
    }

    // Tự động phân luồng để tương thích ngược với API test/client cũ:
    const rawEmail = req.body.email || req.body.emailOrPhone;
    if (rawEmail) {
      const cleanInput = rawEmail.trim();
      const searchEmail = cleanInput.toLowerCase();
      const phoneDigits = cleanInput.replace(/\D/g, '');

      let staffQuery = [{ Email: searchEmail }];
      if (phoneDigits && phoneDigits.length >= 9) {
        staffQuery.push({ SoDienThoai: phoneDigits });
      }
      const staff = await NhanVien.findOne({ $or: staffQuery });
      if (staff) {
        return exports.adminLogin(req, res, next);
      }
    }

    return exports.readerLogin(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Aliases
exports.userLogin = exports.readerLogin;
exports.staffLogin = exports.adminLogin;

// Đăng nhập / Đăng ký qua Google OAuth 2.0
exports.googleLogin = async (req, res, next) => {
  try {
    const idToken = req.body.idToken || req.body.credential || req.body.token;
    if (!idToken) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Google ID Token là bắt buộc.',
        statusCode: 422
      });
    }

    const payload = await verifyGoogleToken(idToken);
    const { email, name, picture, sub: googleId, given_name, family_name } = payload;

    if (!email) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Không tìm thấy địa chỉ email trong thông tin Google trả về.',
        statusCode: 422
      });
    }

    // Chặn tài khoản nhân sự / quản trị viên sử dụng Google login trên Cổng Độc giả
    const staff = await NhanVien.findOne({ Email: email.toLowerCase() });
    if (staff) {
      return sendError(res, {
        code: 'AUTH_FORBIDDEN',
        message: 'Tài khoản quản trị viên / nhân viên không được phép đăng nhập tại Cổng Độc giả.',
        statusCode: 403
      });
    }

    let reader = await DocGia.findOne({ $or: [{ Email: email.toLowerCase() }, { GoogleId: googleId }] });

    if (!reader) {
      const maDocGia = await generateNextCode(DocGia, 'MaDocGia', 'DG', 3);
      let ten = given_name || '';
      let hoLot = family_name || '';
      if (!ten && name) {
        const nameParts = name.trim().split(' ');
        ten = nameParts.pop() || 'Độc Giả';
        hoLot = nameParts.join(' ') || 'Bạn Đọc';
      }

      reader = await DocGia.create({
        MaDocGia: maDocGia,
        HoLot: hoLot || 'Bạn Đọc',
        Ten: ten || 'Độc Giả',
        Email: email.toLowerCase(),
        GoogleId: googleId,
        HinhAnh: picture || '',
        Phai: 'Khác',
        DaBiKhoa: false
      });
    } else {
      if (reader.DaBiKhoa) {
        return sendError(res, {
          code: 'BORROW_BLACKLISTED',
          message: `Tài khoản của bạn đã bị khóa do vi phạm quy chế. Lý do: ${reader.LyDoKhoa || 'Vi phạm thư viện'}.`,
          statusCode: 403
        });
      }
      if (!reader.GoogleId) {
        reader.GoogleId = googleId;
      }
      if (picture && (!reader.HinhAnh || reader.HinhAnh.includes('default.png'))) {
        reader.HinhAnh = picture;
      }
      await reader.save();
    }

    const hoTen = `${reader.HoLot} ${reader.Ten}`.trim();
    const tokens = generateTokens(reader, 'USER');
    return sendSuccess(res, {
      data: {
        user: {
          id: reader._id,
          _id: reader._id,
          maDocGia: reader.MaDocGia,
          MaDocGia: reader.MaDocGia,
          hoTen,
          HoLot: reader.HoLot,
          Ten: reader.Ten,
          email: reader.Email,
          Email: reader.Email,
          role: 'USER',
          Role: 'USER',
          avatar: reader.HinhAnh,
          HinhAnh: reader.HinhAnh,
          Phai: reader.Phai,
          DienThoai: reader.DienThoai,
          DiaChi: reader.DiaChi,
          NgaySinh: reader.NgaySinh
        },
        ...tokens
      },
      message: 'Đăng nhập Google thành công!'
    });
  } catch (error) {
    next(error);
  }
};

// Cấp mới Access Token qua Refresh Token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return sendError(res, {
        code: 'AUTH_UNAUTHORIZED',
        message: 'Refresh Token là bắt buộc.',
        statusCode: 401
      });
    }

    jwt.verify(refreshToken, refreshSecret, async (err, decoded) => {
      if (err) {
        return sendError(res, {
          code: 'AUTH_TOKEN_EXPIRED',
          message: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
          statusCode: 401
        });
      }

      let user = await NhanVien.findById(decoded.id);
      let role = user ? user.ChucVu : 'USER';
      if (!user) {
        user = await DocGia.findById(decoded.id);
      }

      if (!user) {
        return sendError(res, {
          code: 'AUTH_UNAUTHORIZED',
          message: 'Tài khoản không còn tồn tại.',
          statusCode: 401
        });
      }

      const newAccessToken = jwt.sign(
        { id: user._id, email: user.Email, role },
        secret,
        { expiresIn }
      );

      return sendSuccess(res, {
        data: { accessToken: newAccessToken },
        message: 'Làm mới Access Token thành công!'
      });
    });
  } catch (error) {
    next(error);
  }
};

// Lấy thông tin tài khoản hiện tại
exports.getMe = async (req, res) => {
  return sendSuccess(res, {
    data: {
      user: req.user,
      userType: req.userType
    }
  });
};

// Cập nhật thông tin cá nhân (SĐT, Địa chỉ, Họ tên, Giới tính, Ngày sinh)
exports.updateProfile = async (req, res, next) => {
  try {
    const hoLot = req.body.hoLot || req.body.HoLot;
    const ten = req.body.ten || req.body.Ten;
    const hoTenNV = req.body.hoTenNV || req.body.HoTenNV;
    const dienThoai = req.body.dienThoai !== undefined ? req.body.dienThoai : req.body.DienThoai;
    const diaChi = req.body.diaChi !== undefined ? req.body.diaChi : req.body.DiaChi;
    const phai = req.body.phai !== undefined ? req.body.phai : req.body.Phai;
    const ngaySinh = req.body.ngaySinh !== undefined ? req.body.ngaySinh : req.body.NgaySinh;
    const user = req.user;

    if (req.userType === 'READER') {
      if (hoLot) user.HoLot = hoLot.trim();
      if (ten) user.Ten = ten.trim();
      if (dienThoai !== undefined) user.DienThoai = dienThoai.toString().replace(/\D/g, '');
      if (diaChi !== undefined) user.DiaChi = diaChi.trim();
      if (phai && ['Nam', 'Nữ', 'Khác'].includes(phai)) user.Phai = phai;
      if (ngaySinh !== undefined) {
        user.NgaySinh = (ngaySinh && ngaySinh !== '') ? new Date(ngaySinh) : null;
      }
    } else {
      if (hoTenNV) user.HoTenNV = hoTenNV.trim();
      if (dienThoai !== undefined) user.SoDienThoai = dienThoai.toString().replace(/\D/g, '');
      if (diaChi !== undefined) user.DiaChi = diaChi.trim();
    }

    await user.save();
    return sendSuccess(res, {
      data: user,
      message: 'Cập nhật thông tin cá nhân thành công!'
    });
  } catch (error) {
    next(error);
  }
};

// Đổi mật khẩu cá nhân
exports.changePassword = async (req, res, next) => {
  try {
    const oldPassword = req.body.oldPassword || req.body.currentPassword;
    const { newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Vui lòng cung cấp mật khẩu cũ và mật khẩu mới.',
        statusCode: 422
      });
    }

    if (newPassword.length < 6) {
      return sendError(res, {
        code: 'VALIDATION_FAILED',
        message: 'Mật khẩu mới phải có độ dài tối thiểu 6 ký tự.',
        statusCode: 422
      });
    }

    // authMiddleware loại trừ trường Password để bảo mật, nên cần query lại từ DB để lấy Password phục vụ đối soát
    const Model = req.userType === 'STAFF' ? NhanVien : DocGia;
    const user = await Model.findById(req.user._id);

    if (!user) {
      return sendError(res, {
        code: 'AUTH_UNAUTHORIZED',
        message: 'Tài khoản không tồn tại trên hệ thống.',
        statusCode: 401
      });
    }

    // Nếu tài khoản Google chưa từng khởi tạo Password thì cho phép thiết lập trực tiếp
    if (!user.Password) {
      user.Password = await bcrypt.hash(newPassword, 10);
      await user.save();
      return sendSuccess(res, {
        message: 'Thiết lập mật khẩu mới thành công!'
      });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return sendError(res, {
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Mật khẩu hiện tại không chính xác.',
        statusCode: 400
      });
    }

    user.Password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return sendSuccess(res, {
      message: 'Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho lần đăng nhập sau.'
    });
  } catch (error) {
    next(error);
  }
};
