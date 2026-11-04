const CauHinhHeThong = require('../models/CauHinhHeThong');
const { sendSuccess, sendError } = require('../middlewares/responseEnvelope');
const { logAuditTrail } = require('../utils/auditLogger');

/**
 * Lấy cấu hình quy chế thư viện hiện hành (Public cho cả Admin & Độc giả)
 */
exports.getSettings = async (req, res, next) => {
  try {
    let config = await CauHinhHeThong.findOne({ KhoaCauHinh: 'QUY_DINH_MUON' });
    if (!config) {
      config = await CauHinhHeThong.create({
        KhoaCauHinh: 'QUY_DINH_MUON',
        SoSachMuonToiDa: 3,
        SoNgayMuonToiDa: 14,
        ThoiGianGiuSachGio: 48,
        SoNgayGiaHan: 7,
        SoLanGiaHanToiDa: 1,
        SoNgayTreHanVaoDanhSachDen: 15
      });
    }

    return sendSuccess(res, {
      data: {
        maxBooksPerReader: config.SoSachMuonToiDa,
        standardBorrowDays: config.SoNgayMuonToiDa,
        pickupHoldHours: config.ThoiGianGiuSachGio,
        renewExtensionDays: config.SoNgayGiaHan,
        maxRenewCount: config.SoLanGiaHanToiDa,
        blacklistAfterOverdueDays: config.SoNgayTreHanVaoDanhSachDen,
        // Dữ liệu gốc
        SoSachMuonToiDa: config.SoSachMuonToiDa,
        SoNgayMuonToiDa: config.SoNgayMuonToiDa,
        ThoiGianGiuSachGio: config.ThoiGianGiuSachGio,
        SoNgayGiaHan: config.SoNgayGiaHan,
        SoLanGiaHanToiDa: config.SoLanGiaHanToiDa,
        SoNgayTreHanVaoDanhSachDen: config.SoNgayTreHanVaoDanhSachDen
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật cấu hình quy chế thư viện (Chỉ Quản trị viên ADMIN)
 */
exports.updateSettings = async (req, res, next) => {
  try {
    const {
      maxBooksPerReader,
      standardBorrowDays,
      pickupHoldHours,
      renewExtensionDays,
      maxRenewCount,
      blacklistAfterOverdueDays,
      SoSachMuonToiDa,
      SoNgayMuonToiDa,
      ThoiGianGiuSachGio,
      SoNgayGiaHan,
      SoLanGiaHanToiDa,
      SoNgayTreHanVaoDanhSachDen
    } = req.body;

    let config = await CauHinhHeThong.findOne({ KhoaCauHinh: 'QUY_DINH_MUON' });
    if (!config) {
      config = new CauHinhHeThong({ KhoaCauHinh: 'QUY_DINH_MUON' });
    }

    const oldData = config.toObject();

    const maxBooks = Number(maxBooksPerReader ?? SoSachMuonToiDa);
    if (!isNaN(maxBooks) && maxBooks >= 1 && maxBooks <= 20) {
      config.SoSachMuonToiDa = maxBooks;
    }

    const borrowDays = Number(standardBorrowDays ?? SoNgayMuonToiDa);
    if (!isNaN(borrowDays) && borrowDays >= 1 && borrowDays <= 90) {
      config.SoNgayMuonToiDa = borrowDays;
    }

    const holdHours = Number(pickupHoldHours ?? ThoiGianGiuSachGio);
    if (!isNaN(holdHours) && holdHours >= 12 && holdHours <= 168) {
      config.ThoiGianGiuSachGio = holdHours;
    }

    const renewDays = Number(renewExtensionDays ?? SoNgayGiaHan);
    if (!isNaN(renewDays) && renewDays >= 1 && renewDays <= 30) {
      config.SoNgayGiaHan = renewDays;
    }

    const renewCount = Number(maxRenewCount ?? SoLanGiaHanToiDa);
    if (!isNaN(renewCount) && renewCount >= 0 && renewCount <= 5) {
      config.SoLanGiaHanToiDa = renewCount;
    }

    const blacklistDays = Number(blacklistAfterOverdueDays ?? SoNgayTreHanVaoDanhSachDen);
    if (!isNaN(blacklistDays) && blacklistDays >= 1 && blacklistDays <= 60) {
      config.SoNgayTreHanVaoDanhSachDen = blacklistDays;
    }

    await config.save();

    await logAuditTrail(req, {
      hanhDong: 'UPDATE_SETTINGS',
      collection: 'CauHinhHeThong',
      documentId: config._id,
      maDinhDanh: 'QUY_DINH_MUON',
      chiTiet: `Đã cập nhật quy chế thư viện: Mượn tối đa ${config.SoSachMuonToiDa} cuốn, Thời hạn ${config.SoNgayMuonToiDa} ngày, Giữ sách ${config.ThoiGianGiuSachGio}h, Gia hạn ${config.SoNgayGiaHan} ngày (${config.SoLanGiaHanToiDa} lần)`,
      duLieuCu: oldData,
      duLieuMoi: config.toObject()
    });

    return sendSuccess(res, {
      data: {
        maxBooksPerReader: config.SoSachMuonToiDa,
        standardBorrowDays: config.SoNgayMuonToiDa,
        pickupHoldHours: config.ThoiGianGiuSachGio,
        renewExtensionDays: config.SoNgayGiaHan,
        maxRenewCount: config.SoLanGiaHanToiDa,
        blacklistAfterOverdueDays: config.SoNgayTreHanVaoDanhSachDen
      },
      message: 'Đã lưu và áp dụng thành công các quy chế lưu thông mới của thư viện!'
    });
  } catch (error) {
    next(error);
  }
};

