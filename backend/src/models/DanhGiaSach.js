const mongoose = require('mongoose');

const danhGiaSachSchema = new mongoose.Schema(
  {
    SachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sach',
      required: [true, 'ID ấn phẩm là bắt buộc'],
      index: true
    },
    MaSach: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    DocGiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DocGia',
      required: [true, 'ID độc giả là bắt buộc'],
      index: true
    },
    MaDocGia: {
      type: String,
      required: true,
      trim: true
    },
    HoTenDocGia: {
      type: String,
      required: true,
      trim: true
    },
    AvatarDocGia: {
      type: String,
      default: ''
    },
    SoSao: {
      type: Number,
      required: [true, 'Số sao đánh giá là bắt buộc'],
      min: [1, 'Số sao tối thiểu là 1'],
      max: [5, 'Số sao tối đa là 5'],
      default: 5
    },
    NoiDung: {
      type: String,
      required: [true, 'Nội dung nhận xét không được để trống'],
      trim: true,
      minlength: [2, 'Nội dung nhận xét tối thiểu 2 ký tự'],
      maxlength: [2000, 'Nội dung nhận xét tối đa 2000 ký tự']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Mỗi độc giả duy trì tối đa 1 đánh giá trên mỗi cuốn sách
danhGiaSachSchema.index({ SachId: 1, DocGiaId: 1 }, { unique: true });

module.exports = mongoose.model('DanhGiaSach', danhGiaSachSchema, 'DanhGiaSach');

