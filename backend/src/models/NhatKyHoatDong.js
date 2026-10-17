const mongoose = require('mongoose');

const nhatKyHoatDongSchema = new mongoose.Schema(
  {
    ThoiGian: {
      type: Date,
      default: Date.now,
      index: true
    },
    HanhDong: {
      type: String,
      required: true,
      index: true
    },
    NguoiThucHien: {
      NhanVienId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NhanVien',
        default: null,
        index: true
      },
      MSNV: { type: String, default: '' },
      HoTen: { type: String, default: '' },
      ChucVu: { type: String, default: '' },
      DiaChiIP: { type: String, default: '' },
      UserAgent: { type: String, default: '' }
    },
    DoiTuongTacDong: {
      Collection: { type: String, default: '', index: true },
      DocumentId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
      MaDinhDanh: { type: String, default: '' }
    },
    ChiTiet: {
      type: String,
      required: true
    },
    DuLieuCu: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    DuLieuMoi: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('NhatKyHoatDong', nhatKyHoatDongSchema, 'NhatKyHoatDong');
