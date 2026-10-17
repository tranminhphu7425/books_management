const mongoose = require('mongoose');

const nhaXuatBanSchema = new mongoose.Schema(
  {
    // === THUỘC TÍNH TỐI THIỂU BẮT BUỘC THEO ĐỀ TÀI ===
    MaNXB: {
      type: String,
      required: [true, 'Mã nhà xuất bản là bắt buộc'],
      unique: true,
      trim: true,
      index: true
    },
    TenNXB: {
      type: String,
      required: [true, 'Tên nhà xuất bản là bắt buộc'],
      trim: true
    },
    DiaChi: {
      type: String,
      default: '',
      trim: true
    },

    // === THUỘC TÍNH BỔ SUNG & MỞ RỘNG HỆ THỐNG HIỆN TẠI ===
    DienThoai: {
      type: String,
      default: '',
      trim: true
    },
    Email: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('NhaXuatBan', nhaXuatBanSchema, 'NhaXuatBan');
