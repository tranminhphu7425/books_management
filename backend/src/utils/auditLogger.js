const NhatKyHoatDong = require('../models/NhatKyHoatDong');
const logger = require('../config/logger');

/**
 * Ghi lại nhật ký truy vết tác nghiệp quản trị (Audit Trail)
 * @param {Object} req Express request
 * @param {Object} params Thông tin tác nghiệp
 */
const logAuditTrail = async (req, { hanhDong, collection, documentId, maDinhDanh, chiTiet, duLieuCu, duLieuMoi }) => {
  try {
    const user = req.user || {};
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    await NhatKyHoatDong.create({
      HanhDong: hanhDong,
      NguoiThucHien: {
        NhanVienId: user._id || null,
        MSNV: user.MSNV || '',
        HoTen: user.HoTenNV || user.HoTen || '',
        ChucVu: user.ChucVu || 'UNKNOWN',
        DiaChiIP: ip,
        UserAgent: userAgent
      },
      DoiTuongTacDong: {
        Collection: collection || '',
        DocumentId: documentId || null,
        MaDinhDanh: maDinhDanh || ''
      },
      ChiTiet: chiTiet,
      DuLieuCu: duLieuCu || null,
      DuLieuMoi: duLieuMoi || null
    });
  } catch (error) {
    logger.error('❌ Lỗi khi ghi Audit Log:', error);
  }
};

module.exports = { logAuditTrail };
