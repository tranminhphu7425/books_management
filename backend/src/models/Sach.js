const mongoose = require('mongoose');

const sachSchema = new mongoose.Schema(
  {
    // === THUỘC TÍNH TỐI THIỂU BẮT BUỘC THEO ĐỀ TÀI ===
    MaSach: {
      type: String,
      required: [true, 'Mã sách là bắt buộc'],
      unique: true,
      trim: true,
      index: true
    },
    TenSach: {
      type: String,
      required: [true, 'Tên sách là bắt buộc'],
      trim: true,
      index: true
    },
    DonGia: {
      type: Number,
      required: [true, 'Đơn giá là bắt buộc'],
      min: [0, 'Đơn giá không thể âm'],
      default: 0
    },
    SoQuyen: {
      type: Number,
      required: [true, 'Số quyển là bắt buộc'],
      min: [0, 'Số quyển không thể âm'],
      default: 1
    },
    NamXuatBan: {
      type: Number,
      default: new Date().getFullYear()
    },
    MaNXB: {
      type: String,
      required: [true, 'Mã nhà xuất bản là bắt buộc'],
      trim: true,
      index: true
    },
    TacGia: {
      type: String,
      required: [true, 'Tác giả là bắt buộc'],
      trim: true,
      index: true
    },
    NguonGoc: {
      type: String,
      default: '',
      trim: true
    },

    // === THUỘC TÍNH BỔ SUNG & MỞ RỘNG HỆ THỐNG HIỆN TẠI ===
    TheLoai: {
      type: String,
      default: 'Chung',
      trim: true,
      index: true
    },
    MaTheLoai: {
      type: String,
      default: '',
      trim: true,
      index: true
    },
    ISBN: {
      type: String,
      default: '',
      trim: true,
      index: true
    },
    HinhAnh: {
      type: String,
      default: '/uploads/covers/default-book.png'
    },
    MoTa: {
      type: String,
      default: ''
    },
    ViTri: {
      type: String,
      default: 'Kệ trung tâm',
      trim: true
    },
    SoQuyenKhaDung: {
      type: Number,
      required: true,
      min: [0, 'Số quyển khả dụng không thể âm'],
      default: 1,
      index: true
    },
    SoQuyenDangMuon: {
      type: Number,
      min: [0, 'Số quyển đang mượn không thể âm'],
      default: 0
    },
    SoQuyenHuHong: {
      type: Number,
      min: [0, 'Số quyển hư hỏng không thể âm'],
      default: 0
    },
    TrangThai: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Tạo text search index trên TenSach và TacGia
sachSchema.index({ TenSach: 'text', TacGia: 'text', TheLoai: 'text' });

module.exports = mongoose.model('Sach', sachSchema, 'Sach');
