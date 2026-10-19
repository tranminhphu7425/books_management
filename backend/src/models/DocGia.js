const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const docGiaSchema = new mongoose.Schema(
  {
    // === THUỘC TÍNH TỐI THIỂU BẮT BUỘC THEO ĐỀ TÀI ===
    MaDocGia: {
      type: String,
      required: [true, 'Mã độc giả là bắt buộc'],
      unique: true,
      trim: true,
      index: true
    },
    HoLot: {
      type: String,
      required: [true, 'Họ lót là bắt buộc'],
      trim: true
    },
    Ten: {
      type: String,
      required: [true, 'Tên độc giả là bắt buộc'],
      trim: true,
      index: true
    },
    NgaySinh: {
      type: Date,
      default: null
    },
    Phai: {
      type: String,
      enum: ['Nam', 'Nữ', 'Khác'],
      default: 'Nam'
    },
    DiaChi: {
      type: String,
      default: '',
      trim: true
    },
    DienThoai: {
      type: String,
      default: '',
      trim: true
    },

    // === THUỘC TÍNH BỔ SUNG & MỞ RỘNG HỆ THỐNG HIỆN TẠI ===
    Email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    Password: {
      type: String,
      default: null // Cho phép null nếu đăng nhập hoàn toàn bằng Google
    },
    HinhAnh: {
      type: String,
      default: '/uploads/avatars/default.png'
    },
    GoogleId: {
      type: String,
      default: null,
      index: true
    },
    DaBiKhoa: {
      type: Boolean,
      default: false,
      index: true
    },
    LyDoKhoa: {
      type: String,
      default: null
    },
    NgayKhoa: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual họ và tên đầy đủ
docGiaSchema.virtual('HoTen').get(function () {
  return `${this.HoLot} ${this.Ten}`.trim();
});

// So sánh mật khẩu
docGiaSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.Password) return false;
  return bcrypt.compare(candidatePassword, this.Password);
};

module.exports = mongoose.model('DocGia', docGiaSchema, 'DocGia');
