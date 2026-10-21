const Sach = require("../models/Sach");
const NhaXuatBan = require("../models/NhaXuatBan");
const TheLoai = require("../models/TheLoai");
const { sendSuccess, sendError } = require("../middlewares/responseEnvelope");
const { logAuditTrail } = require("../utils/auditLogger");
const { generateNextCode } = require("../utils/codeGenerator");

const { buildVietnameseRegex } = require("../utils/vietnameseUtils");

// Lấy danh sách sách có phân trang và bộ lọc
exports.getBooks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      theLoai,
      maNXB,
      availableOnly,
      status,
      sort = "MaSach",
      order = "asc",
    } = req.query;

    const andConditions = [];

    // Mặc định chỉ hiển thị ACTIVE nếu không chỉ định cụ thể
    if (status && status !== "ALL" && status !== "Tất cả") {
      andConditions.push({ TrangThai: status });
    } else if (!status) {
      andConditions.push({ TrangThai: "ACTIVE" });
    }

    if (
      theLoai &&
      theLoai !== "Tất cả" &&
      theLoai !== "ALL" &&
      theLoai.trim() !== ""
    ) {
      const tl = theLoai.trim();
      andConditions.push({
        $or: [
          { TheLoai: tl },
          { MaTheLoai: tl }
        ]
      });
    }

    if (maNXB && maNXB !== "Tất cả" && maNXB !== "ALL" && maNXB.trim() !== "") {
      andConditions.push({ MaNXB: maNXB.trim() });
    }

    if (availableOnly === "true" || availableOnly === true) {
      andConditions.push({ SoQuyenKhaDung: { $gt: 0 } });
    }

    if (search && search.trim() !== "") {
      const searchRegex = buildVietnameseRegex(search.trim());
      andConditions.push({
        $or: [
          { TenSach: { $regex: searchRegex, $options: "i" } },
          { TacGia: { $regex: searchRegex, $options: "i" } },
          { ISBN: { $regex: searchRegex, $options: "i" } },
          { MaSach: { $regex: searchRegex, $options: "i" } },
        ]
      });
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    // Dynamic sorting hỗ trợ đầy đủ các trường quản lý kho ấn phẩm
    const validSortFields = [
      "MaSach",
      "TenSach",
      "DonGia",
      "SoQuyen",
      "SoQuyenKhaDung",
      "SoQuyenDangMuon",
      "NamXuatBan",
      "createdAt",
    ];
    const sortField = validSortFields.includes(sort) ? sort : "MaSach";
    const sortOrder = order === "asc" || order === "1" || order === 1 ? 1 : -1;
    
    // Đảm bảo thứ tự sắp xếp luôn tất định (deterministic) với khóa phụ MaSach và _id
    const sortOptions = { [sortField]: sortOrder };
    if (sortField !== "MaSach") {
      sortOptions.MaSach = 1;
    }
    sortOptions._id = sortOrder;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [books, totalRecords, nxbList] = await Promise.all([
      Sach.find(query)
        .collation({ locale: "vi", numericOrdering: true, strength: 2 })
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Sach.countDocuments(query),
      NhaXuatBan.find({}).lean()
    ]);

    const nxbMap = new Map(nxbList.map((n) => [n.MaNXB, n]));
    const formattedBooks = books.map((b) => {
      const obj = b.toObject ? b.toObject() : b;
      const nxb = nxbMap.get(b.MaNXB);
      return {
        ...obj,
        TenNXB: nxb ? nxb.TenNXB : b.MaNXB,
        NhaXuatBan: nxb ? nxb.TenNXB : b.MaNXB,
        NhaXuatBanInfo: nxb || null
      };
    });

    return sendSuccess(res, {
      data: formattedBooks,
      meta: {
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRecords,
          totalPages: Math.ceil(totalRecords / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết sách theo ID hoặc Mã sách
exports.getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let book = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      book = await Sach.findById(id);
    } else {
      book = await Sach.findOne({ MaSach: id });
    }

    if (!book) {
      return sendError(res, {
        code: "RESOURCE_NOT_FOUND",
        message: "Không tìm thấy đầu sách yêu cầu.",
        statusCode: 404,
      });
    }

    // Lấy thêm thông tin NXB và Thể loại
    const [nxb, theLoaiDoc] = await Promise.all([
      NhaXuatBan.findOne({ MaNXB: book.MaNXB }).lean(),
      TheLoai.findOne({
        $or: [
          { MaTheLoai: book.MaTheLoai || book.TheLoai },
          { TenTheLoai: book.TheLoai }
        ]
      }).lean()
    ]);

    const bookObj = book.toObject ? book.toObject() : book;

    return sendSuccess(res, {
      data: {
        ...bookObj,
        TenNXB: nxb ? nxb.TenNXB : book.MaNXB,
        NhaXuatBan: nxb ? nxb.TenNXB : book.MaNXB,
        NhaXuatBanInfo: nxb || null,
        TheLoaiInfo: theLoaiDoc || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Thêm sách mới (Quyền: ADMIN, BOOK_MANAGER)
exports.createBook = async (req, res, next) => {
  try {
    const maSach = req.body.maSach || req.body.MaSach;
    const tenSach = req.body.tenSach || req.body.TenSach;
    const donGia = req.body.donGia !== undefined ? req.body.donGia : req.body.DonGia;
    const soQuyen = req.body.soQuyen !== undefined ? req.body.soQuyen : req.body.SoQuyen;
    const namXuatBan = req.body.namXuatBan !== undefined ? req.body.namXuatBan : req.body.NamXuatBan;
    const maNXB = req.body.maNXB || req.body.MaNXB;
    const tacGia = req.body.tacGia || req.body.TacGia;
    const nguonGoc = req.body.nguonGoc || req.body.NguonGoc || tacGia;
    const theLoai = req.body.theLoai || req.body.TheLoai;
    const maTheLoai = req.body.maTheLoai || req.body.MaTheLoai;
    const isbn = req.body.isbn || req.body.ISBN || req.body.Isbn;
    const hinhAnh = req.body.hinhAnh || req.body.HinhAnh;
    const moTa = req.body.moTa !== undefined ? req.body.moTa : req.body.MoTa;
    const viTri = req.body.viTri || req.body.ViTri;

    if (!tenSach || donGia === undefined || !soQuyen || !maNXB || !tacGia) {
      return sendError(res, {
        code: "VALIDATION_FAILED",
        message:
          "Vui lòng điền đầy đủ các trường bắt buộc: Tên sách, Đơn giá, Số quyển, Mã NXB, Tác giả.",
        statusCode: 422,
      });
    }

    // Tự động sinh mã sách duy nhất nếu không cung cấp
    let code = maSach;
    if (!code) {
      code = await generateNextCode(Sach, "MaSach", "S", 3);
    }

    const existing = await Sach.findOne({ MaSach: code });
    if (existing) {
      return sendError(res, {
        code: "DUPLICATE_KEY_ERROR",
        message: `Mã sách '${code}' đã tồn tại trong hệ thống.`,
        statusCode: 400,
      });
    }

    let genreName = theLoai ? String(theLoai).trim() : "Chung";
    let genreCode = maTheLoai ? String(maTheLoai).trim() : "";

    if (theLoai || maTheLoai) {
      const foundGenre = await TheLoai.findOne({
        $or: [
          { MaTheLoai: maTheLoai || theLoai },
          { TenTheLoai: theLoai || maTheLoai }
        ]
      });
      if (foundGenre) {
        genreName = foundGenre.TenTheLoai;
        genreCode = foundGenre.MaTheLoai;
      }
    }

    const totalCopies = parseInt(soQuyen, 10);
    const cleanNXB = typeof maNXB === 'object' && maNXB !== null ? maNXB.MaNXB : String(maNXB);

    const newBook = await Sach.create({
      MaSach: code,
      TenSach: String(tenSach).trim(),
      DonGia: Number(donGia),
      SoQuyen: totalCopies,
      NamXuatBan: namXuatBan ? Number(namXuatBan) : new Date().getFullYear(),
      MaNXB: cleanNXB.trim(),
      TacGia: String(tacGia).trim(),
      NguonGoc: nguonGoc ? String(nguonGoc).trim() : String(tacGia).trim(),
      TheLoai: genreName,
      MaTheLoai: genreCode,
      ISBN: isbn ? String(isbn).trim() : "",
      HinhAnh: hinhAnh ? String(hinhAnh).trim() : "/uploads/covers/default-book.png",
      MoTa: moTa ? String(moTa) : "",
      ViTri: viTri ? String(viTri).trim() : "Kệ A1-01",
      SoQuyenKhaDung: totalCopies,
      SoQuyenDangMuon: 0,
      SoQuyenHuHong: 0,
      TrangThai: "ACTIVE",
    });

    await logAuditTrail(req, {
      hanhDong: "CREATE_BOOK",
      collection: "Sach",
      documentId: newBook._id,
      maDinhDanh: newBook.MaSach,
      chiTiet: `Đã thêm mới đầu sách '${newBook.TenSach}' (${newBook.MaSach})`,
      duLieuMoi: newBook.toObject(),
    });

    return sendSuccess(res, {
      data: newBook,
      message: "Thêm mới sách thành công!",
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật thông tin sách (Quyền: ADMIN, BOOK_MANAGER)
exports.updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Sach.findById(id);

    if (!book) {
      return sendError(res, {
        code: "RESOURCE_NOT_FOUND",
        message: "Không tìm thấy đầu sách cần cập nhật.",
        statusCode: 404,
      });
    }

    const oldData = book.toObject();
    const tenSach = req.body.tenSach !== undefined ? req.body.tenSach : req.body.TenSach;
    const donGia = req.body.donGia !== undefined ? req.body.donGia : req.body.DonGia;
    const soQuyen = req.body.soQuyen !== undefined ? req.body.soQuyen : req.body.SoQuyen;
    const namXuatBan = req.body.namXuatBan !== undefined ? req.body.namXuatBan : req.body.NamXuatBan;
    const maNXB = req.body.maNXB !== undefined ? req.body.maNXB : req.body.MaNXB;
    const tacGia = req.body.tacGia !== undefined ? req.body.tacGia : req.body.TacGia;
    const nguonGoc = req.body.nguonGoc !== undefined ? req.body.nguonGoc : req.body.NguonGoc;
    const theLoai = req.body.theLoai !== undefined ? req.body.theLoai : req.body.TheLoai;
    const maTheLoai = req.body.maTheLoai !== undefined ? req.body.maTheLoai : req.body.MaTheLoai;
    const isbn = req.body.isbn !== undefined ? req.body.isbn : (req.body.ISBN !== undefined ? req.body.ISBN : req.body.Isbn);
    const hinhAnh = req.body.hinhAnh !== undefined ? req.body.hinhAnh : req.body.HinhAnh;
    const moTa = req.body.moTa !== undefined ? req.body.moTa : req.body.MoTa;
    const viTri = req.body.viTri !== undefined ? req.body.viTri : req.body.ViTri;
    const trangThai = req.body.trangThai !== undefined ? req.body.trangThai : req.body.TrangThai;

    if (tenSach !== undefined && tenSach !== null) book.TenSach = String(tenSach).trim();
    if (donGia !== undefined && donGia !== null) book.DonGia = Number(donGia);
    if (namXuatBan !== undefined && namXuatBan !== null) book.NamXuatBan = Number(namXuatBan);
    if (maNXB !== undefined && maNXB !== null) {
      const cleanNXB = typeof maNXB === 'object' && maNXB !== null ? maNXB.MaNXB : String(maNXB);
      book.MaNXB = cleanNXB.trim();
    }
    if (tacGia !== undefined && tacGia !== null) {
      book.TacGia = String(tacGia).trim();
      if (!book.NguonGoc) book.NguonGoc = String(tacGia).trim();
    }
    if (nguonGoc !== undefined && nguonGoc !== null) book.NguonGoc = String(nguonGoc).trim();
    
    if (theLoai !== undefined || maTheLoai !== undefined) {
      const searchCat = maTheLoai || theLoai;
      if (searchCat) {
        const foundGenre = await TheLoai.findOne({
          $or: [
            { MaTheLoai: searchCat },
            { TenTheLoai: searchCat }
          ]
        });
        if (foundGenre) {
          book.TheLoai = foundGenre.TenTheLoai;
          book.MaTheLoai = foundGenre.MaTheLoai;
        } else {
          if (theLoai !== undefined && theLoai !== null) book.TheLoai = String(theLoai).trim();
          if (maTheLoai !== undefined && maTheLoai !== null) book.MaTheLoai = String(maTheLoai).trim();
        }
      }
    }

    if (isbn !== undefined && isbn !== null) book.ISBN = String(isbn).trim();
    if (hinhAnh !== undefined && hinhAnh !== null) book.HinhAnh = String(hinhAnh).trim();
    if (moTa !== undefined && moTa !== null) book.MoTa = String(moTa);
    if (viTri !== undefined && viTri !== null) book.ViTri = String(viTri).trim();
    if (trangThai !== undefined && trangThai !== null) book.TrangThai = String(trangThai).trim();

    // Tính toán lại số lượng bản rảnh nếu tổng số quyển thay đổi
    if (soQuyen !== undefined && soQuyen !== null) {
      const newTotal = Number(soQuyen);
      if (newTotal < book.SoQuyenDangMuon) {
        return sendError(res, {
          code: "VALIDATION_FAILED",
          message: `Tổng số quyển (${newTotal}) không thể nhỏ hơn số bản đang được mượn (${book.SoQuyenDangMuon}).`,
          statusCode: 400,
        });
      }
      book.SoQuyen = newTotal;
      book.SoQuyenKhaDung = Math.max(
        0,
        newTotal - (book.SoQuyenDangMuon || 0) - (book.SoQuyenHuHong || 0),
      );
    }

    await book.save();

    await logAuditTrail(req, {
      hanhDong: "UPDATE_BOOK",
      collection: "Sach",
      documentId: book._id,
      maDinhDanh: book.MaSach,
      chiTiet: `Đã cập nhật thông tin đầu sách '${book.TenSach}' (${book.MaSach})`,
      duLieuCu: oldData,
      duLieuMoi: book.toObject(),
    });

    return sendSuccess(res, {
      data: book,
      message: "Cập nhật thông tin sách thành công!",
    });
  } catch (error) {
    next(error);
  }
};

// Xóa an toàn / Chuyển vào kho lưu trữ (Quyền: ADMIN, BOOK_MANAGER)
exports.deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Sach.findById(id);

    if (!book) {
      return sendError(res, {
        code: "RESOURCE_NOT_FOUND",
        message: "Không tìm thấy đầu sách cần xóa.",
        statusCode: 404,
      });
    }

    // 🛑 CHẶN XÓA NẾU ĐANG CÓ NGƯỜI MƯỢN
    if (book.SoQuyenDangMuon > 0) {
      return sendError(res, {
        code: "BOOK_CANNOT_DELETE_BORROWED",
        message: `Không thể chuyển cuốn sách này vào kho lưu trữ vì hiện có ${book.SoQuyenDangMuon} bản sách đang được độc giả mượn chưa trả.`,
        statusCode: 400,
      });
    }

    const oldStatus = book.TrangThai;
    book.TrangThai = "ARCHIVED";
    await book.save();

    await logAuditTrail(req, {
      hanhDong: "ARCHIVE_BOOK",
      collection: "Sach",
      documentId: book._id,
      maDinhDanh: book.MaSach,
      chiTiet: `Đã chuyển đầu sách '${book.TenSach}' (${book.MaSach}) vào kho lưu trữ (Soft Delete)`,
      duLieuCu: { TrangThai: oldStatus },
      duLieuMoi: { TrangThai: "ARCHIVED" },
    });

    return sendSuccess(res, {
      message: `Đã chuyển cuốn sách '${book.TenSach}' vào kho lưu trữ an toàn!`,
    });
  } catch (error) {
    next(error);
  }
};

// Khôi phục ấn phẩm từ kho lưu trữ (Quyền: ADMIN, BOOK_MANAGER)
exports.restoreBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Sach.findById(id);

    if (!book) {
      return sendError(res, {
        code: "RESOURCE_NOT_FOUND",
        message: "Không tìm thấy đầu sách cần khôi phục.",
        statusCode: 404,
      });
    }

    const oldStatus = book.TrangThai;
    book.TrangThai = "ACTIVE";
    await book.save();

    await logAuditTrail(req, {
      hanhDong: "RESTORE_BOOK",
      collection: "Sach",
      documentId: book._id,
      maDinhDanh: book.MaSach,
      chiTiet: `Đã khôi phục đầu sách '${book.TenSach}' (${book.MaSach}) từ kho lưu trữ về trạng thái lưu hành`,
      duLieuCu: { TrangThai: oldStatus },
      duLieuMoi: { TrangThai: "ACTIVE" },
    });

    return sendSuccess(res, {
      data: book,
      message: `Đã khôi phục ấn phẩm '${book.TenSach}' về kho lưu hành thành công!`,
    });
  } catch (error) {
    next(error);
  }
};
