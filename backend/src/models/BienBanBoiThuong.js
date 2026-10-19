const mongoose = require('mongoose');

const bienBanBoiThuongSchema = new mongoose.Schema(
  {
    MaBienBan: {
      type: String,
      required: [true, 'Mã biên bản là bắt buộc'],
      unique: true,
      trim: true,
      index: true
    },
    MaTheoDoiMuon: {
      type: String,
      default: ''
    },
    TheoDoiMuonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TheoDoiMuonSach',
      required: true,
      index: true
    },
    MaDocGia: {
      type: String,
      default: ''
    },
    DocGiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DocGia',
      required: true,
      index: true
    },
    MaSach: {
      type: String,
      default: ''
    },
    SachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sach',
      required: true
    },
    LoaiSuCo: {
      type: String,
      required: true,
      enum: ['DAMAGED', 'LOST']
    },
    MoTa: {
      type: String,
      required: [true, 'Mô tả sự cố là bắt buộc'],
      trim: true
    },
    SoTienBoiThuong: {
      type: Number,
      required: [true, 'Số tiền bồi thường là bắt buộc'],
      min: [0, 'Số tiền bồi thường không thể âm']
    },
    TrangThai: {
      type: String,
      enum: ['UNPAID', 'PAID'],
      default: 'UNPAID',
      index: true
    },
    NgayLap: {
      type: Date,
      default: Date.now
    },
    NgayGiaiQuyet: {
      type: Date,
      default: null
    },
    MSNVThuTien: {
      type: String,
      default: null
    },
    NhanVienThuTienId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NhanVien',
      default: null
    },
    GhiChu: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('BienBanBoiThuong', bienBanBoiThuongSchema, 'BienBanBoiThuong');
