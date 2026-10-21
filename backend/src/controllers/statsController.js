const { Parser } = require('json2csv');
const Sach = require('../models/Sach');
const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
const DocGia = require('../models/DocGia');
const BienBanBoiThuong = require('../models/BienBanBoiThuong');
const NhatKyHoatDong = require('../models/NhatKyHoatDong');
const { sendSuccess, sendError } = require('../middlewares/responseEnvelope');
const { buildVietnameseRegex } = require('../utils/vietnameseUtils');

// Thống kê tổng hợp Dashboard KPI
exports.getSummary = async (req, res, next) => {
  try {
    const now = new Date();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalBooks,
      activeReaders,
      borrowingBooks,
      overdueBorrows,
      pendingRequests,
      unpaidFines,
      rawGenres,
      rawTrends
    ] = await Promise.all([
      Sach.countDocuments({ TrangThai: 'ACTIVE' }),
      DocGia.countDocuments({ DaBiKhoa: false }),
      TheoDoiMuonSach.countDocuments({ TrangThai: 'BORROWED' }),
      TheoDoiMuonSach.countDocuments({ TrangThai: 'BORROWED', HanTra: { $lt: now } }),
      TheoDoiMuonSach.countDocuments({ TrangThai: 'PENDING' }),
      BienBanBoiThuong.countDocuments({ TrangThai: 'UNPAID' }),
      Sach.aggregate([
        { $match: { TrangThai: 'ACTIVE', TheLoai: { $ne: null } } },
        { $group: { _id: '$TheLoai', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      TheoDoiMuonSach.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%d/%m', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Format genreStats
    const genreStats = rawGenres.map((g) => ({
      name: g._id || 'Khác',
      count: g.count || 0
    }));

    // Format 7 ngày gần nhất cho borrowTrend
    const trendMap = {};
    rawTrends.forEach((t) => {
      trendMap[t._id] = t.count;
    });

    const borrowTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      borrowTrend.push({
        date: dayStr,
        count: trendMap[dayStr] || 0
      });
    }

    return sendSuccess(res, {
      data: {
        totalBooks,
        activeReaders,
        currentlyBorrowed: borrowingBooks,
        borrowingBooks,
        overdueBooks: overdueBorrows,
        overdueBorrows,
        pendingRequests,
        unpaidFines,
        genreStats,
        borrowTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

// Top 10 cuốn sách được mượn nhiều nhất
exports.getTopBooks = async (req, res, next) => {
  try {
    const topBorrows = await TheoDoiMuonSach.aggregate([
      { $match: { TrangThai: { $in: ['BORROWED', 'RETURNED'] } } },
      { $group: { _id: '$SachId', borrowCount: { $sum: 1 } } },
      { $sort: { borrowCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'Sach',
          localField: '_id',
          foreignField: '_id',
          as: 'bookInfo'
        }
      },
      { $unwind: '$bookInfo' },
      {
        $project: {
          _id: 1,
          borrowCount: 1,
          MaSach: '$bookInfo.MaSach',
          TenSach: '$bookInfo.TenSach',
          TacGia: '$bookInfo.TacGia',
          TheLoai: '$bookInfo.TheLoai',
          HinhAnh: '$bookInfo.HinhAnh',
          SoQuyenKhaDung: '$bookInfo.SoQuyenKhaDung'
        }
      }
    ]);

    return sendSuccess(res, { data: topBorrows });
  } catch (error) {
    next(error);
  }
};

// Thống kê sự cố sách hư hại / mất và tiền đền bù
exports.getDamageOverview = async (req, res, next) => {
  try {
    const [damagedCount, lostCount, unpaidTotal, paidTotal] = await Promise.all([
      BienBanBoiThuong.countDocuments({ LoaiSuCo: 'DAMAGED' }),
      BienBanBoiThuong.countDocuments({ LoaiSuCo: 'LOST' }),
      BienBanBoiThuong.aggregate([
        { $match: { TrangThai: 'UNPAID' } },
        { $group: { _id: null, total: { $sum: '$SoTienBoiThuong' } } }
      ]),
      BienBanBoiThuong.aggregate([
        { $match: { TrangThai: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$SoTienBoiThuong' } } }
      ])
    ]);

    return sendSuccess(res, {
      data: {
        damagedCount,
        lostCount,
        unpaidAmount: unpaidTotal[0]?.total || 0,
        paidAmount: paidTotal[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Xuất file CSV danh sách mượn trả (UTF-8 with BOM)
exports.exportBorrowsCSV = async (req, res, next) => {
  try {
    const borrows = await TheoDoiMuonSach.find()
      .populate('DocGiaId', 'MaDocGia HoLot Ten Email DienThoai')
      .populate('SachId', 'MaSach TenSach')
      .sort({ createdAt: -1 });

    const fields = [
      { label: 'Mã Phiếu Mượn', value: '_id' },
      { label: 'Mã Độc Giả', value: 'MaDocGia' },
      { label: 'Họ Tên Độc Giả', value: 'DocGiaId.HoTen' },
      { label: 'Email', value: 'DocGiaId.Email' },
      { label: 'Điện Thoại', value: 'DocGiaId.DienThoai' },
      { label: 'Mã Sách', value: 'MaSach' },
      { label: 'Tên Sách', value: 'SachId.TenSach' },
      { label: 'Trạng Thái', value: 'TrangThai' },
      { label: 'Ngày Mượn', value: 'NgayMuon' },
      { label: 'Hạn Trả', value: 'HanTra' },
      { label: 'Ngày Trả Thực Tế', value: 'NgayTra' }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(borrows);

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(`danh_sach_muon_tra_${Date.now()}.csv`);
    // Gửi kèm BOM \uFEFF để Excel mở UTF-8 không bị lỗi font tiếng Việt
    return res.send('\uFEFF' + csv);
  } catch (error) {
    next(error);
  }
};

// Xuất file CSV danh sách biên bản bồi thường
exports.exportFinesCSV = async (req, res, next) => {
  try {
    const fines = await BienBanBoiThuong.find()
      .populate('DocGiaId', 'MaDocGia HoLot Ten Email')
      .populate('SachId', 'MaSach TenSach')
      .sort({ createdAt: -1 });

    const fields = [
      { label: 'Mã Biên Bản', value: 'MaBienBan' },
      { label: 'Mã Độc Giả', value: 'MaDocGia' },
      { label: 'Tên Độc Giả', value: 'DocGiaId.HoTen' },
      { label: 'Mã Sách', value: 'MaSach' },
      { label: 'Tên Sách', value: 'SachId.TenSach' },
      { label: 'Loại Sự Cố', value: 'LoaiSuCo' },
      { label: 'Số Tiền Bồi Thường (VNĐ)', value: 'SoTienBoiThuong' },
      { label: 'Trạng Thái', value: 'TrangThai' },
      { label: 'Ngày Lập', value: 'NgayLap' },
      { label: 'Ngày Giải Quyết', value: 'NgayGiaiQuyet' }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(fines);

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(`danh_sach_boi_thuong_${Date.now()}.csv`);
    return res.send('\uFEFF' + csv);
  } catch (error) {
    next(error);
  }
};

// Tra cứu danh sách nhật ký tác nghiệp Audit Trail (Quyền: ADMIN)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { action, staff, page = 1, limit = 20 } = req.query;

    const query = {};
    if (action && action !== 'ALL') {
      query.HanhDong = action;
    }
    if (staff && staff.trim() !== '') {
      const staffRegex = buildVietnameseRegex(staff.trim());
      query.$or = [
        { 'NguoiThucHien.MSNV': { $regex: staffRegex, $options: 'i' } },
        { 'NguoiThucHien.HoTen': { $regex: staffRegex, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [logs, totalRecords] = await Promise.all([
      NhatKyHoatDong.find(query).sort({ ThoiGian: -1 }).skip(skip).limit(limitNum),
      NhatKyHoatDong.countDocuments(query)
    ]);

    return sendSuccess(res, {
      data: logs,
      meta: {
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRecords,
          totalPages: Math.ceil(totalRecords / limitNum) || 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
