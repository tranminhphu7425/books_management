const mongoose = require('mongoose');

const cauHinhHeThongSchema = new mongoose.Schema(
  {
    KhoaCauHinh: {
      type: String,
      required: true,
      unique: true,
      default: 'QUY_DINH_MUON'
    },
    SoSachMuonToiDa: {
      type: Number,
      default: 3,
      min: 1
    },
    SoNgayMuonToiDa: {
      type: Number,
      default: 14,
      min: 1
    },
    ThoiGianGiuSachGio: {
      type: Number,
      default: 48,
      min: 1
    },
    SoNgayGiaHan: {
      type: Number,
      default: 7,
      min: 1
    },
    SoLanGiaHanToiDa: {
      type: Number,
      default: 1,
      min: 1
    },
    SoNgayTreHanVaoDanhSachDen: {
      type: Number,
      default: 15,
      min: 1
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CauHinhHeThong', cauHinhHeThongSchema, 'CauHinhHeThong');
