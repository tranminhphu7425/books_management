const mongoose = require('mongoose');

const theoDoiMuonSachSchema = new mongoose.Schema(
  {
    // === THUỘC TÍNH TỐI THIỂU BẮT BUỘC THEO ĐỀ TÀI ===
    MaDocGia: {
      type: String,
      required: [true, 'Mã độc giả là bắt buộc'],
      trim: true,
      index: true
    },
    MaSach: {
      type: String,
      required: [true, 'Mã sách là bắt buộc'],
      trim: true,
      index: true
    },
    NgayMuon: {
      type: Date,
      default: null // Gán khi thủ thư xuất sách (Check-out)
    },
    NgayTra: {
      type: Date,
      default: null // Gán khi thủ thư nhận trả sách (Check-in)
    },

    // === THUỘC TÍNH BỔ SUNG & MỞ RỘNG HỆ THỐNG HIỆN TẠI ===
    DocGiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DocGia',
      required: true,
      index: true
    },
    SachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sach',
      required: true,
      index: true
    },
    TrangThai: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'BORROWED', 'RETURNED', 'CANCELLED', 'EXPIRED', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    NgayYeuCau: {
      type: Date,
      default: Date.now
    },
    NgayHenLay: {
      type: Date,
      default: null
    },
    HanChotNhan: {
      type: Date,
      default: null // +48h sau khi duyệt
    },
    HanTra: {
      type: Date,
      default: null, // +14 ngày sau khi xuất sách
      index: true
    },
    SoLanGiaHan: {
      type: Number,
      default: 0
    },
    MSNVDuyet: {
      type: String,
      default: null
    },
    NhanVienDuyetId: {
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

module.exports = mongoose.model('TheoDoiMuonSach', theoDoiMuonSachSchema, 'TheoDoiMuonSach');
