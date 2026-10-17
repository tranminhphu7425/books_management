const mongoose = require('mongoose');

const theLoaiSchema = new mongoose.Schema(
  {
    MaTheLoai: {
      type: String,
      required: [true, 'Mã thể loại là bắt buộc'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    TenTheLoai: {
      type: String,
      required: [true, 'Tên thể loại là bắt buộc'],
      unique: true,
      trim: true,
      index: true
    },
    MoTa: {
      type: String,
      default: '',
      trim: true
    },
    TrangThai: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
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

theLoaiSchema.index({ TenTheLoai: 'text' });

module.exports = mongoose.model('TheLoai', theLoaiSchema, 'TheLoai');
