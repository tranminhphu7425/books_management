-- =============================================================================
-- DATABASE SCHEMA DEFINITION & DOCUMENTATION
-- Project: Books Management System (Hệ Thống Quản Lý Sách)
-- Database Engine: MongoDB 7.x+ (Document Store with Relational Keys)
-- Driver: Mongoose / Native MongoDB Driver
-- Synchronized: 2026-09-26 (Đồng bộ chuẩn hóa Schema tiếng Việt theo đặc tả đề tài)
-- =============================================================================

-- =============================================================================
-- CÁC COLLECTION TỐI THIỂU BẮT BUỘC THEO ĐỀ TÀI:
-- 1. DocGia(MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai)
-- 2. Sach(MaSach, TenSach, DonGia, SoQuyen, NamXuatBan, MaNXB, NguonGoc/TacGia)
-- 3. NhaXuatBan(MaNXB, TenNXB, DiaChi)
-- 4. TheoDoiMuonSach(MaDocGia, MaSach, NgayMuon, NgayTra)
-- 5. NhanVien(MSNV, HoTenNV, Password, ChucVu, DiaChi, SoDienThoai)
--
-- CÁC COLLECTION BỔ TRỢ MỞ RỘNG HỆ THỐNG ĐANG TRIỂN KHAI:
-- 6. BienBanBoiThuong(MaBienBan, MaTheoDoiMuon, MaDocGia, MaSach, LoaiSuCo, MoTa, SoTienBoiThuong, TrangThai, ...)
-- 7. CauHinhHeThong(KhoaCauHinh, SoSachMuonToiDa, SoNgayMuonToiDa, ThoiGianGiuSachGio, ...)
-- 8. NhatKyHoatDong(ThoiGian, HanhDong, NguoiThucHien, DoiTuongTacDong, ChiTiet, ...)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. COLLECTION: DocGia
-- Mô tả: Lưu trữ thông tin bạn đọc / độc giả thư viện
-- Đặc tả tối thiểu: DocGia(MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai)
-- -----------------------------------------------------------------------------
CREATE TABLE DocGia (
  _id                 VARCHAR(24) PRIMARY KEY,     -- MongoDB ObjectId
  -- Thuộc tính tối thiểu bắt buộc theo đề tài:
  MaDocGia            VARCHAR(50) NOT NULL UNIQUE, -- Mã độc giả (e.g. DG001, DG002 - Index Unique)
  HoLot               VARCHAR(150) NOT NULL,       -- Họ và tên lót độc giả
  Ten                 VARCHAR(100) NOT NULL,       -- Tên độc giả (Index)
  NgaySinh            DATE DEFAULT NULL,           -- Ngày tháng năm sinh (Ràng buộc: Không ở tương lai & đủ 18 tuổi: NgaySinh <= CURRENT_DATE - INTERVAL 18 YEAR)
  Phai                VARCHAR(10) DEFAULT 'Nam',   -- Giới tính (Nam, Nữ, Khác)
  DiaChi              TEXT DEFAULT '',             -- Địa chỉ liên lạc
  DienThoai           VARCHAR(20) DEFAULT '',      -- Số điện thoại độc giả
  -- Thuộc tính bổ sung phục vụ hệ thống xác thực & kiểm soát hiện đại:
  Email               VARCHAR(255) NOT NULL UNIQUE,-- Email tài khoản đăng nhập (Index Unique)
  Password            VARCHAR(255) DEFAULT NULL,   -- Mật khẩu băm BCrypt (null nếu dùng Google OAuth)
  HinhAnh             VARCHAR(500) DEFAULT '',     -- Đường dẫn ảnh đại diện avatar
  GoogleId            VARCHAR(255) DEFAULT NULL,   -- Google Subject ID (OAuth 2.0, Index)
  DaBiKhoa            BOOLEAN NOT NULL DEFAULT FALSE, -- Trạng thái Blacklist (Index)
  LyDoKhoa            TEXT DEFAULT NULL,           -- Lý do đưa vào danh sách đen
  NgayKhoa            TIMESTAMP NULL DEFAULT NULL, -- Thời điểm bị khóa quyền mượn
  createdAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Ràng buộc toàn vẹn kiểm tra độ tuổi (CHECK CONSTRAINT):
  CONSTRAINT chk_DocGia_NgaySinh CHECK (NgaySinh IS NULL OR (NgaySinh <= CURRENT_DATE AND NgaySinh <= CURRENT_DATE - INTERVAL 18 YEAR))
);

CREATE UNIQUE INDEX idx_DocGia_MaDocGia ON DocGia(MaDocGia);
CREATE UNIQUE INDEX idx_DocGia_Email ON DocGia(Email);
CREATE INDEX idx_DocGia_Ten ON DocGia(Ten);
CREATE INDEX idx_DocGia_GoogleId ON DocGia(GoogleId);
CREATE INDEX idx_DocGia_DaBiKhoa ON DocGia(DaBiKhoa);


-- -----------------------------------------------------------------------------
-- 2. COLLECTION: NhanVien
-- Mô tả: Lưu trữ thông tin ban quản trị, thủ thư và nhân viên quản lý kho sách
-- Đặc tả tối thiểu: NhanVien(MSNV, HoTenNV, Password, ChucVu, DiaChi, SoDienThoai)
-- -----------------------------------------------------------------------------
CREATE TABLE NhanVien (
  _id                 VARCHAR(24) PRIMARY KEY,     -- MongoDB ObjectId
  -- Thuộc tính tối thiểu bắt buộc theo đề tài:
  MSNV                VARCHAR(50) NOT NULL UNIQUE, -- Mã số nhân viên (e.g. NV001, NV002 - Index Unique)
  HoTenNV             VARCHAR(150) NOT NULL,       -- Họ và tên nhân viên
  Password            VARCHAR(255) NOT NULL,       -- Mật khẩu băm BCrypt
  ChucVu              VARCHAR(50) NOT NULL,        -- Chức vụ: 'ADMIN', 'BOOK_MANAGER' (Index)
  DiaChi              TEXT DEFAULT '',             -- Địa chỉ liên lạc
  SoDienThoai         VARCHAR(20) DEFAULT '',      -- Số điện thoại liên hệ
  -- Thuộc tính bổ sung:
  Email               VARCHAR(255) NOT NULL UNIQUE,-- Email đăng nhập hệ thống quản trị (Index Unique)
  HinhAnh             VARCHAR(500) DEFAULT '',     -- Ảnh đại diện nhân viên
  createdAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_NhanVien_MSNV ON NhanVien(MSNV);
CREATE UNIQUE INDEX idx_NhanVien_Email ON NhanVien(Email);
CREATE INDEX idx_NhanVien_ChucVu ON NhanVien(ChucVu);


-- -----------------------------------------------------------------------------
-- 3. COLLECTION: NhaXuatBan
-- Mô tả: Lưu trữ danh mục các nhà xuất bản cung cấp ấn phẩm cho thư viện
-- Đặc tả tối thiểu: NhaXuatBan(MaNXB, TenNXB, DiaChi)
-- -----------------------------------------------------------------------------
CREATE TABLE NhaXuatBan (
  _id                 VARCHAR(24) PRIMARY KEY,     -- MongoDB ObjectId
  -- Thuộc tính tối thiểu bắt buộc theo đề tài:
  MaNXB               VARCHAR(50) NOT NULL UNIQUE, -- Mã nhà xuất bản (e.g. NXB01, NXB02 - Index Unique)
  TenNXB              VARCHAR(255) NOT NULL,       -- Tên nhà xuất bản
  DiaChi              TEXT DEFAULT '',             -- Địa chỉ trụ sở nhà xuất bản
  -- Thuộc tính bổ sung:
  DienThoai           VARCHAR(20) DEFAULT '',      -- Số điện thoại liên hệ
  Email               VARCHAR(255) DEFAULT '',     -- Email liên hệ
  createdAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_NhaXuatBan_MaNXB ON NhaXuatBan(MaNXB);
CREATE INDEX idx_NhaXuatBan_TenNXB ON NhaXuatBan(TenNXB);


-- -----------------------------------------------------------------------------
-- 4. COLLECTION: TheLoai (Bổ trợ chuẩn hóa danh mục phân loại sách)
-- Mô tả: Lưu trữ danh mục thể loại sách chuẩn hóa toàn hệ thống
-- -----------------------------------------------------------------------------
CREATE TABLE TheLoai (
  _id                 VARCHAR(24) PRIMARY KEY,     -- MongoDB ObjectId
  MaTheLoai           VARCHAR(50) NOT NULL UNIQUE, -- Mã thể loại (e.g. TL01, TL02 - Index Unique)
  TenTheLoai          VARCHAR(150) NOT NULL UNIQUE,-- Tên thể loại tiếng Việt (Index Unique)
  MoTa                TEXT DEFAULT '',             -- Mô tả thể loại
  TrangThai           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- Enum: 'ACTIVE', 'INACTIVE'
  createdAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_TheLoai_MaTheLoai ON TheLoai(MaTheLoai);
CREATE UNIQUE INDEX idx_TheLoai_TenTheLoai ON TheLoai(TenTheLoai);


-- -----------------------------------------------------------------------------
-- 5. COLLECTION: Sach
-- Mô tả: Lưu trữ danh mục các đầu sách, kiểm kê kho và tình trạng bản in
-- Đặc tả tối thiểu: Sach(MaSach, TenSach, DonGia, SoQuyen, NamXuatBan, MaNXB, NguonGoc/TacGia)
-- -----------------------------------------------------------------------------
CREATE TABLE Sach (
  _id                 VARCHAR(24) PRIMARY KEY,     -- MongoDB ObjectId
  -- Thuộc tính tối thiểu bắt buộc theo đề tài:
  MaSach              VARCHAR(50) NOT NULL UNIQUE, -- Mã sách duy nhất (e.g. S001, S002 - Index Unique)
  TenSach             VARCHAR(255) NOT NULL,       -- Tên đầu sách (Index)
  DonGia              DECIMAL(12, 2) NOT NULL,     -- Đơn giá mỗi cuốn sách (VNĐ)
  SoQuyen             INT NOT NULL DEFAULT 1,      -- Tổng số quyển sách nhập kho
  NamXuatBan          INT NOT NULL,                -- Năm xuất bản
  MaNXB               VARCHAR(50) NOT NULL,        -- Mã nhà xuất bản (Tham chiếu NhaXuatBan.MaNXB)
  TacGia              VARCHAR(255) NOT NULL,       -- Tác giả / Nguồn gốc (NguonGoc/TacGia)
  NguonGoc            VARCHAR(255) DEFAULT '',     -- Đơn vị cung cấp hoặc cơ quan phát hành
  -- Thuộc tính bổ sung phục vụ quản lý kho & tìm kiếm:
  NhaXuatBanId        VARCHAR(24) DEFAULT NULL,    -- Khóa ngoại tham chiếu NhaXuatBan._id
  MaTheLoai           VARCHAR(50) DEFAULT NULL,    -- Mã thể loại chuẩn (Tham chiếu TheLoai.MaTheLoai, Index)
  TheLoai             VARCHAR(100) DEFAULT 'Khác', -- Tên thể loại sách hiển thị (Index)
  ISBN                VARCHAR(50) DEFAULT NULL,    -- Mã tiêu chuẩn quốc tế ISBN (Index Unique)
  HinhAnh             VARCHAR(500) DEFAULT '',     -- Đường dẫn ảnh bìa sách
  MoTa                TEXT DEFAULT '',             -- Tóm tắt nội dung sách
  ViTri               VARCHAR(100) DEFAULT '',     -- Vị trí kệ sách (e.g. Kệ A1-01)
  SoQuyenKhaDung      INT NOT NULL DEFAULT 1,      -- Số bản sách còn rảnh sẵn sàng cho mượn (Index)
  SoQuyenDangMuon     INT NOT NULL DEFAULT 0,      -- Số bản sách hiện đang được mượn
  SoQuyenHuHong       INT NOT NULL DEFAULT 0,      -- Số bản sách bị rách/hỏng hoặc mất
  TrangThai           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- Enum: 'ACTIVE', 'ARCHIVED' (Soft Delete, Index)
  createdAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_Sach_NXB FOREIGN KEY (NhaXuatBanId) REFERENCES NhaXuatBan(_id),
  CONSTRAINT fk_Sach_TheLoai FOREIGN KEY (MaTheLoai) REFERENCES TheLoai(MaTheLoai)
);

CREATE UNIQUE INDEX idx_Sach_MaSach ON Sach(MaSach);
CREATE INDEX idx_Sach_TenSach ON Sach(TenSach);
CREATE INDEX idx_Sach_MaTheLoai ON Sach(MaTheLoai);
CREATE INDEX idx_Sach_TheLoai ON Sach(TheLoai);
CREATE INDEX idx_Sach_TrangThai ON Sach(TrangThai);
CREATE INDEX idx_Sach_SoQuyenKhaDung ON Sach(SoQuyenKhaDung);


-- -----------------------------------------------------------------------------
-- 5. COLLECTION: TheoDoiMuonSach
-- Mô tả: Phiếu theo dõi quá trình mượn - trả sách của độc giả
-- Đặc tả tối thiểu: TheoDoiMuonSach(MaDocGia, MaSach, NgayMuon, NgayTra)
-- -----------------------------------------------------------------------------
CREATE TABLE TheoDoiMuonSach (
  _id                 VARCHAR(24) PRIMARY KEY,     -- MongoDB ObjectId
  -- Thuộc tính tối thiểu bắt buộc theo đề tài:
  MaDocGia            VARCHAR(50) NOT NULL,        -- Mã độc giả mượn sách (Tham chiếu DocGia.MaDocGia, Index)
  MaSach              VARCHAR(50) NOT NULL,        -- Mã sách mượn (Tham chiếu Sach.MaSach, Index)
  NgayMuon            TIMESTAMP NULL DEFAULT NULL, -- Thời điểm thực tế nhận/xuất sách (Check-out)
  NgayTra             TIMESTAMP NULL DEFAULT NULL, -- Thời điểm thực tế hoàn trả sách
  -- Thuộc tính bổ sung phục vụ quy trình mượn, duyệt, hạn mức & gia hạn:
  DocGiaId            VARCHAR(24) NOT NULL,        -- Khóa ngoại tham chiếu DocGia._id (Index)
  SachId              VARCHAR(24) NOT NULL,        -- Khóa ngoại tham chiếu Sach._id (Index)
  TrangThai           VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                      -- Enum: 'PENDING', 'APPROVED', 'BORROWED', 'RETURNED', 'CANCELLED', 'EXPIRED', 'REJECTED', 'OVERDUE' (Index)
  NgayYeuCau          TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời điểm gửi đơn mượn
  NgayHenLay          TIMESTAMP NULL DEFAULT NULL, -- Ngày độc giả hẹn đến lấy
  HanChotNhan         TIMESTAMP NULL DEFAULT NULL, -- Hạn chót giữ sách sau duyệt (Duyệt + 48 giờ)
  HanTra              TIMESTAMP NULL DEFAULT NULL, -- Hạn chót phải trả sách (Check-out + 14 ngày, Index)
  SoLanGiaHan         INT NOT NULL DEFAULT 0,      -- Số lần gia hạn (Tối đa 1 lần thêm 7 ngày)
  MSNVDuyet           VARCHAR(50) DEFAULT NULL,    -- Mã nhân viên duyệt hoặc xuất sách (Tham chiếu NhanVien.MSNV)
  NhanVienDuyetId     VARCHAR(24) DEFAULT NULL,    -- Khóa ngoại tham chiếu NhanVien._id
  GhiChu              TEXT DEFAULT '',             -- Ghi chú phiếu mượn
  createdAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_Muon_DocGia FOREIGN KEY (DocGiaId) REFERENCES DocGia(_id),
  CONSTRAINT fk_Muon_Sach FOREIGN KEY (SachId) REFERENCES Sach(_id),
  CONSTRAINT fk_Muon_NhanVien FOREIGN KEY (NhanVienDuyetId) REFERENCES NhanVien(_id)
);

CREATE INDEX idx_TheoDoiMuon_MaDocGia ON TheoDoiMuonSach(MaDocGia);
CREATE INDEX idx_TheoDoiMuon_MaSach ON TheoDoiMuonSach(MaSach);
CREATE INDEX idx_TheoDoiMuon_DocGiaId ON TheoDoiMuonSach(DocGiaId);
CREATE INDEX idx_TheoDoiMuon_SachId ON TheoDoiMuonSach(SachId);
CREATE INDEX idx_TheoDoiMuon_TrangThai ON TheoDoiMuonSach(TrangThai);
CREATE INDEX idx_TheoDoiMuon_HanTra ON TheoDoiMuonSach(HanTra);


-- -----------------------------------------------------------------------------
-- 6. COLLECTION: BienBanBoiThuong (Bổ trợ mở rộng)
-- Mô tả: Biên bản sự cố sách rách, hư hỏng hoặc mất và ghi nhận bồi thường tại quầy
-- -----------------------------------------------------------------------------
CREATE TABLE BienBanBoiThuong (
  _id                 VARCHAR(24) PRIMARY KEY,     -- MongoDB ObjectId
  MaBienBan           VARCHAR(50) NOT NULL UNIQUE, -- Mã biên bản bồi thường (e.g. BB0001 - Index Unique)
  MaTheoDoiMuon       VARCHAR(50) DEFAULT '',      -- Mã phiếu mượn tương ứng
  TheoDoiMuonId       VARCHAR(24) NOT NULL,        -- Khóa ngoại tham chiếu TheoDoiMuonSach._id (Index)
  MaDocGia            VARCHAR(50) DEFAULT '',      -- Mã độc giả vi phạm
  DocGiaId            VARCHAR(24) NOT NULL,        -- Khóa ngoại tham chiếu DocGia._id (Index)
  MaSach              VARCHAR(50) DEFAULT '',      -- Mã sách bị sự cố
  SachId              VARCHAR(24) NOT NULL,        -- Khóa ngoại tham chiếu Sach._id
  LoaiSuCo            VARCHAR(20) NOT NULL,        -- Enum: 'DAMAGED' (Rách/Ướt/Hỏng), 'LOST' (Mất sách)
  MoTa                TEXT NOT NULL,               -- Mô tả chi tiết mức độ thiệt hại thực tế
  SoTienBoiThuong     DECIMAL(12, 2) NOT NULL,     -- Số tiền bồi thường thủ thư thẩm định trực tiếp (VNĐ)
  TrangThai           VARCHAR(20) NOT NULL DEFAULT 'UNPAID', -- Enum: 'UNPAID' (Chưa nộp), 'PAID' (Đã nộp) (Index)
  NgayLap             TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời điểm lập biên bản
  NgayGiaiQuyet       TIMESTAMP NULL DEFAULT NULL, -- Thời điểm thu tiền bồi thường tại quầy
  MSNVThuTien         VARCHAR(50) DEFAULT NULL,    -- Mã nhân viên thu tiền
  NhanVienThuTienId   VARCHAR(24) DEFAULT NULL,    -- Khóa ngoại tham chiếu NhanVien._id
  GhiChu              TEXT DEFAULT '',             -- Ghi chú thu tiền mặt/chuyển khoản
  createdAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_BoiThuong_Muon FOREIGN KEY (TheoDoiMuonId) REFERENCES TheoDoiMuonSach(_id),
  CONSTRAINT fk_BoiThuong_DocGia FOREIGN KEY (DocGiaId) REFERENCES DocGia(_id),
  CONSTRAINT fk_BoiThuong_Sach FOREIGN KEY (SachId) REFERENCES Sach(_id),
  CONSTRAINT fk_BoiThuong_ThuTien FOREIGN KEY (NhanVienThuTienId) REFERENCES NhanVien(_id)
);

CREATE UNIQUE INDEX idx_BienBanBoiThuong_MaBienBan ON BienBanBoiThuong(MaBienBan);
CREATE INDEX idx_BienBanBoiThuong_TheoDoiMuonId ON BienBanBoiThuong(TheoDoiMuonId);
CREATE INDEX idx_BienBanBoiThuong_DocGiaId ON BienBanBoiThuong(DocGiaId);
CREATE INDEX idx_BienBanBoiThuong_TrangThai ON BienBanBoiThuong(TrangThai);


-- -----------------------------------------------------------------------------
-- 7. COLLECTION: CauHinhHeThong (Bổ trợ mở rộng)
-- Mô tả: Cấu hình quy chế mượn - trả và các thông số vận hành tự động toàn thư viện
-- -----------------------------------------------------------------------------
CREATE TABLE CauHinhHeThong (
  _id                           VARCHAR(24) PRIMARY KEY,     -- MongoDB ObjectId
  KhoaCauHinh                   VARCHAR(100) NOT NULL UNIQUE,-- Khóa cấu hình (e.g. 'QUY_DINH_MUON' - Index Unique)
  SoSachMuonToiDa               INT NOT NULL DEFAULT 3,      -- Số lượng sách độc giả được mượn tối đa cùng lúc
  SoNgayMuonToiDa               INT NOT NULL DEFAULT 14,     -- Thời gian mượn tối đa cho mỗi lượt (ngày)
  ThoiGianGiuSachGio            INT NOT NULL DEFAULT 48,     -- Thời hạn giữ sách sau khi duyệt đơn (giờ)
  HanTraGiaHanNgay              INT NOT NULL DEFAULT 7,      -- Số ngày được gia hạn thêm cho mỗi lượt
  SoLanGiaHanToiDa              INT NOT NULL DEFAULT 1,      -- Số lần tối đa được phép gia hạn cho 1 cuốn sách
  SoNgayTreHanVaoDanhSachDen    INT NOT NULL DEFAULT 15,     -- Số ngày quá hạn tối đa trước khi đưa vào Blacklist
  createdAt                     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt                     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_CauHinhHeThong_Khoa ON CauHinhHeThong(KhoaCauHinh);


-- -----------------------------------------------------------------------------
-- 8. COLLECTION: NhatKyHoatDong (Bổ trợ mở rộng - Audit Trail)
-- Mô tả: Lưu trữ nhật ký truy vết mọi tác nghiệp quản trị, bàn giao ca và thanh tra
-- -----------------------------------------------------------------------------
CREATE TABLE NhatKyHoatDong (
  _id                 VARCHAR(24) PRIMARY KEY,     -- MongoDB ObjectId
  ThoiGian            TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời điểm thực hiện (Index)
  HanhDong            VARCHAR(50) NOT NULL,        -- Mã hành động Enum (Index)
  NhanVienId          VARCHAR(24) DEFAULT NULL,    -- Tham chiếu NhanVien._id (Index)
  MSNV                VARCHAR(50) DEFAULT '',      -- Mã số nhân viên thực hiện
  HoTenNhanVien       VARCHAR(150) DEFAULT '',     -- Họ tên nhân viên thực hiện
  ChucVuNhanVien      VARCHAR(50) DEFAULT '',      -- Chức vụ (ADMIN, BOOK_MANAGER)
  DiaChiIP            VARCHAR(45) DEFAULT '',      -- Địa chỉ IP của client
  UserAgent           TEXT DEFAULT '',             -- Trình duyệt/Thiết bị
  TenCollection       VARCHAR(100) DEFAULT '',     -- Bảng/Collection bị tác động (Index)
  DocumentId          VARCHAR(24) DEFAULT '',      -- ID bản ghi bị tác động (Index)
  MaDinhDanhDoiTuong  VARCHAR(100) DEFAULT '',     -- Mã nghiệp vụ đối tượng (VD: DG001 - S001)
  ChiTiet             TEXT NOT NULL,               -- Diễn giải chi tiết hành động bằng tiếng Việt tự nhiên
  DuLieuCu            JSON DEFAULT NULL,           -- Snapshot dữ liệu trước khi thay đổi
  DuLieuMoi           JSON DEFAULT NULL,           -- Snapshot dữ liệu sau khi thay đổi
  createdAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_NhatKy_ThoiGian ON NhatKyHoatDong(ThoiGian);
CREATE INDEX idx_NhatKy_HanhDong ON NhatKyHoatDong(HanhDong);
CREATE INDEX idx_NhatKy_NhanVienId ON NhatKyHoatDong(NhanVienId);
CREATE INDEX idx_NhatKy_TenCollection ON NhatKyHoatDong(TenCollection);
CREATE INDEX idx_NhatKy_DocumentId ON NhatKyHoatDong(DocumentId);
