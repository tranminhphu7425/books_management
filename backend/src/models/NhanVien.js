const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const nhanVienSchema = new mongoose.Schema(
  {
    // === THUỘC TÍNH TỐI THIỂU BẮT BUỘC THEO ĐỀ TÀI ===
    MSNV: {
      type: String,
      required: [true, 'Mã số nhân viên là bắt buộc'],
      unique: true,
      trim: true,
      index: true
    },
    HoTenNV: {
      type: String,
      required: [true, 'Họ tên nhân viên là bắt buộc'],
      trim: true
    },
    Password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc']
    },
    ChucVu: {
      type: String,
      required: [true, 'Chức vụ là bắt buộc'],
      enum: ['ADMIN', 'BOOK_MANAGER'],
      default: 'BOOK_MANAGER',
      index: true
    },
    DiaChi: {
      type: String,
      default: '',
      trim: true
    },
    SoDienThoai: {
      type: String,
      default: '',
      trim: true
    },

    // === THUỘC TÍNH BỔ SUNG & MỞ RỘNG HỆ THỐNG HIỆN TẠI ===
    Email: {
      type: String,
      required: [true, 'Email nhân viên là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    HinhAnh: {
      type: String,
      default: '/uploads/avatars/default-staff.png'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// So sánh mật khẩu
nhanVienSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.Password) return false;
  return bcrypt.compare(candidatePassword, this.Password);
};

module.exports = mongoose.model('NhanVien', nhanVienSchema, 'NhanVien');
