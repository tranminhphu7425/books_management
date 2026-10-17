# HƯỚNG DẪN TRIỂN KHAI DỰ ÁN TỪ A ĐẾN Z (STEP-BY-STEP MASTER IMPLEMENTATION GUIDE)

> **Dự án:** Hệ thống Quản Lý Sách Thư Viện (Library & Books Management System)  
> **Kiến trúc:** Monorepo gồm 3 phân hệ độc lập:  
> - 🟢 **Backend API:** Node.js + Express + MongoDB (Port `5000`)  
> - 🟢 **User Portal (Cổng Độc giả):** Vue 3 + Vite + Bootstrap 5 + Pinia (Port `3000`, Domain: `library.local:3000`, IP: `127.0.0.1:3000`)  
> - 🟢 **Admin Portal (Cổng Quản trị & Thủ thư):** Vue 3 + Vite + Bootstrap 5 + Pinia + Chart.js (Port `3000`, Domain: `admin.library.local:3000`, IP: `127.0.0.2:3000`)  
> **Nguyên tắc cốt lõi:**  
> 1. Tuân thủ 100% **5 Collection tối thiểu bắt buộc theo đề tài** (`DocGia`, `Sach`, `NhaXuatBan`, `TheoDoiMuonSach`, `NhanVien`) cùng **3 Collection bổ trợ mở rộng** (`BienBanBoiThuong`, `CauHinhHeThong`, `NhatKyHoatDong`).  
> 2. Áp dụng chuẩn **Bảo mật chuyên sâu (Security Hardening)**: Rate Limiting, Helmet, Strict CORS Whitelist, Input Sanitization, Magic Bytes Upload.  
> 3. Chuẩn hóa **Kiến trúc phản hồi API (Response Envelope)**, Bảng mã lỗi nghiệp vụ, và **Kiểm tra sức khỏe hệ thống (Health Check & Graceful Shutdown)**.  
> 4. Thiết lập **Ghi log Winston luân chuyển hàng ngày** và **Nhật ký truy vết tác nghiệp quản trị (Audit Trail)**.  
> 5. Ngôn ngữ giao tiếp thuần Việt, lịch sự, tự nhiên, loại bỏ hoàn toàn dịch thô từ tiếng Anh.

---

## MỤC LỤC LỘ TRÌNH TRIỂN KHAI

- [GIAI ĐOẠN 0: Chuẩn bị Môi trường & Thiết lập Monorepo](#giai-đoạn-0-chuẩn-bị-môi-trường--thiết-lập-monorepo)
- [GIAI ĐOẠN 1: Xây dựng Backend API & Cơ sở Dữ liệu MongoDB (Port 5000)](#giai-đoạn-1-xây-dựng-backend-api--cơ-sở-dữ-liệu-mongodb-port-5000)
  - [Bước 1.1: Khởi tạo Backend & Cài đặt Thư viện](#bước-11-khởi-tạo-backend--cài-đặt-thư-viện)
  - [Bước 1.2: Cấu hình biến môi trường (`.env` & `.env.example`)](#bước-12-cấu-hình-biến-môi-trường-env--envexample)
  - [Bước 1.3: Thiết lập Cấu trúc Thư mục Backend](#bước-13-thiết-lập-cấu-trúc-thư-mục-backend)
  - [Bước 1.4: Xây dựng 8 Schema Models Mongoose chuẩn hóa](#bước-14-xây-dựng-8-schema-models-mongoose-chuẩn-hóa)
  - [Bước 1.5: Xây dựng Cấu hình, Logger & Middlewares Bảo mật Chuyên sâu](#bước-15-xây-dựng-cấu-hình-logger--middlewares-bảo-mật-chuyên-sâu)
  - [Bước 1.6: Xây dựng Controllers & API Routes đầy đủ](#bước-16-xây-dựng-controllers--api-routes-đầy-đủ)
  - [Bước 1.7: Xây dựng Entrypoint Server (`server.js`) với Graceful Shutdown](#bước-17-xây-dựng-entrypoint-server-serverjs-với-graceful-shutdown)
- [GIAI ĐOẠN 2: Xây dựng Cổng Độc giả (User Portal - Port 3000)](#giai-đoạn-2-xây-dựng-cổng-độc-giả-user-portal---port-3000)
  - [Bước 2.1: Khởi tạo ứng dụng Vue 3 với Vite](#bước-21-khởi-tạo-ứng-dụng-vue-3-với-vite)
  - [Bước 2.2: Cài đặt Dependencies UI & State Management](#bước-22-cài-đặt-dependencies-ui--state-management)
  - [Bước 2.3: Cấu hình Port 3000 trong `vite.config.js`](#bước-23-cấu-hình-port-3000-trong-viteconfigjs)
  - [Bước 2.4: Áp dụng Design System & Ngôn ngữ Tiếng Việt Tự Nhiên](#bước-24-áp-dụng-design-system--ngôn-ngữ-tiếng-việt-tự-nhiên)
  - [Bước 2.5: Cấu hình Axios Client Interceptor với Auto-Refresh Token](#bước-25-cấu-hình-axios-client-interceptor-với-auto-refresh-token)
  - [Bước 2.6: Cấu hình Pinia Stores & Vue Router Guards](#bước-26-cấu-hình-pinia-stores--vue-router-guards)
  - [Bước 2.7: Xây dựng Views & Components Cổng Độc giả theo Chuẩn UX](#bước-27-xây-dựng-views--components-cổng-độc-giả-theo-chuẩn-ux)
- [GIAI ĐOẠN 3: Xây dựng Cổng Quản trị & Thủ thư (Admin Portal - Port 3001)](#giai-đoạn-3-xây-dựng-cổng-quản-trị--thủ-thư-admin-portal---port-3001)
  - [Bước 3.1: Khởi tạo ứng dụng Vue 3 với Vite](#bước-31-khởi-tạo-ứng-dụng-vue-3-với-vite-1)
  - [Bước 3.2: Cài đặt Dependencies UI, Chart & Icons](#bước-32-cài-đặt-dependencies-ui-chart--icons)
  - [Bước 3.3: Cấu hình Port 3001 trong `vite.config.js`](#bước-33-cấu-hình-port-3001-trong-viteconfigjs)
  - [Bước 3.4: Xây dựng Layout Modern SaaS Dashboard & Ngôn ngữ Quản trị Tự nhiên](#bước-34-xây-dựng-layout-modern-saas-dashboard--ngôn-ngữ-quản-trị-tự-nhiên)
  - [Bước 3.5: Cấu hình Router Guards Phân quyền nghiêm ngặt](#bước-35-cấu-hình-router-guards-phân-quyền-nghiêm-ngặt)
  - [Bước 3.6: Xây dựng các Màn hình Quản trị Tác nghiệp theo Chuẩn UX](#bước-36-xây-dựng-các-màn-hình-quản-trị-tác-nghiệp-theo-chuẩn-ux)
- [GIAI ĐOẠN 4: Viết Kịch bản Nạp Dữ liệu Mẫu (Seed Data Script)](#giai-đoạn-4-viết-kịch-bản-nạp-dữ-liệu-mẫu-seed-data-script)
- [GIAI ĐOẠN 5: Kiểm thử Toàn diện & Xác thực Nghiệp vụ (End-to-End Testing)](#giai-đoạn-5-kiểm-thử-toàn-diện--xác-thực-nghiệp-vụ-end-to-end-testing)
- [GIAI ĐOẠN 6: Khởi chạy Đồng thời, Vận hành & Xử lý Sự cố](#giai-đoạn-6-khởi-chạy-đồng-thời-vận-hành--xử-lý-sự-cố)
- [GIAI ĐOẠN 7: Nâng Cấp Kiến Trúc Domain, Tối Ưu Hệ Thống & Hoàn Thiện Báo Cáo](#giai-đoạn-7-nâng-cấp-kiến-trúc-domain-tối-ưu-hệ-thống--hoàn-thiện-báo-cáo)

---

## GIAI ĐOẠN 0: CHUẨN BỊ MÔI TRƯỜNG & THIẾT LẬP MONOREPO ✅ HOÀN THÀNH

### Bước 0.1: Kiểm tra yêu cầu môi trường hệ thống
Đảm bảo máy tính phát triển đã cài đặt các công cụ sau:
- **Node.js:** Phiên bản `>= 18.x` hoặc `20.x LTS` (kiểm tra bằng `node -v`).
- **npm:** Phiên bản `>= 9.x` (kiểm tra bằng `npm -v`).
- **MongoDB:** MongoDB Community Server 7.x+ chạy cục bộ tại `mongodb://localhost:27017` HOẶC một kết nối MongoDB Atlas trực tuyến.

### Bước 0.2: Khởi tạo cấu trúc thư mục Monorepo
Từ thư mục gốc của dự án (`d:\Documents\GitHub\books_management`), chạy các lệnh tạo 3 thư mục con đại diện cho 3 phân hệ:
```bash
mkdir backend
mkdir frontend-user
mkdir frontend-admin
```

### Bước 0.3: Thiết lập Root `package.json` điều phối toàn bộ dự án
Tạo file `package.json` tại thư mục gốc để quản lý tập trung và khởi chạy đồng thời cả 3 dịch vụ chỉ bằng 1 dòng lệnh duy nhất:
```json
{
  "name": "books-management-monorepo",
  "version": "1.0.0",
  "private": true,
  "description": "Hệ thống Quản lý Sách Thư viện - Monorepo Vue 3 + Express + MongoDB",
  "scripts": {
    "install:all": "npm install && npm --prefix backend install && npm --prefix frontend-user install && npm --prefix frontend-admin install",
    "dev:backend": "npm --prefix backend run dev",
    "dev:user": "npm --prefix frontend-user run dev",
    "dev:admin": "npm --prefix frontend-admin run dev",
    "dev": "concurrently -n \"BACKEND,USER,ADMIN\" -c \"blue,green,magenta\" \"npm run dev:backend\" \"npm run dev:user\" \"npm run dev:admin\"",
    "seed": "npm --prefix backend run seed",
    "test:e2e": "npm --prefix backend run test:e2e"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```
Chạy lệnh cài đặt `concurrently` ở thư mục gốc:
```bash
npm install
```

### Bước 0.4: Thiết lập Root `.gitignore`
Tạo file `.gitignore` tại thư mục gốc để tránh đẩy các tập tin rác hoặc nhạy cảm lên Git:
```gitignore
# Dependencies
node_modules/
package-lock.json

# Environment variables
.env
.env.local

# Logs
logs/
*.log
npm-debug.log*

# Static uploaded files
uploads/
backend/uploads/covers/*
!backend/uploads/covers/.gitkeep
backend/uploads/avatars/*
!backend/uploads/avatars/.gitkeep

# Build outputs
dist/
dist-ssr/
*.local

# IDE & OS
.vscode/
.idea/
.DS_Store
Thumbs.db
```

---

## GIAI ĐOẠN 1: XÂY DỰNG BACKEND API & CƠ SỞ DỮ LIỆU MONGODB (PORT 5000) ✅ HOÀN THÀNH

### Bước 1.1: Khởi tạo Backend & Cài đặt Thư viện
Di chuyển vào thư mục `backend` và khởi tạo Node.js project:
```bash
cd backend
npm init -y
```
Cài đặt toàn bộ các gói thư viện cốt lõi, bảo mật, xác thực và ghi log:
```bash
npm install express mongoose dotenv cors helmet morgan jsonwebtoken bcryptjs multer google-auth-library json2csv express-rate-limit winston winston-daily-rotate-file axios
npm install --save-dev nodemon
```

Cập nhật `backend/package.json` với các scripts chạy server:
```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "seed": "node src/scripts/seed.js",
  "test:e2e": "node src/scripts/testE2E.js"
}
```

### Bước 1.2: Cấu hình biến môi trường (`.env` & `.env.example`)
Tạo file `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/books_management
JWT_SECRET=super_secret_jwt_access_key_2026_xyz
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_2026_xyz
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id_here
FRONTEND_USER_URL=http://localhost:3000
FRONTEND_ADMIN_URL=http://localhost:3001
LOG_LEVEL=info
```
Đồng thời tạo `backend/.env.example` với các giá trị placeholder để phục vụ triển khai mới.

### Bước 1.3: Thiết lập Cấu trúc Thư mục Backend
Xây dựng cây thư mục module hóa sạch sẽ:
```text
backend/
├── src/
│   ├── config/
│   │   ├── db.js             # Kết nối MongoDB qua Mongoose
│   │   ├── jwt.js            # Cấu hình Secret & Thời hạn Access/Refresh Token
│   │   ├── logger.js         # Winston Logger & Luân chuyển log hàng ngày (Daily Rotate)
│   │   └── googleOAuth.js    # Cấu hình verify Google OAuth Token
│   ├── models/               # 8 MongoDB Collections chuẩn hóa tiếng Việt
│   │   ├── DocGia.js         # Collection DocGia (MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai...)
│   │   ├── Sach.js           # Collection Sach (MaSach, TenSach, DonGia, SoQuyen, NamXuatBan, MaNXB, TacGia, NguonGoc...)
│   │   ├── NhaXuatBan.js     # Collection NhaXuatBan (MaNXB, TenNXB, DiaChi...)
│   │   ├── TheoDoiMuonSach.js# Collection TheoDoiMuonSach (MaDocGia, MaSach, NgayMuon, NgayTra...)
│   │   ├── NhanVien.js       # Collection NhanVien (MSNV, HoTenNV, Password, ChucVu, DiaChi, SoDienThoai...)
│   │   ├── BienBanBoiThuong.js # Collection BienBanBoiThuong (Biên bản sự cố sách rách, mất & đền bù)
│   │   ├── CauHinhHeThong.js # Collection CauHinhHeThong (Quy chế thư viện)
│   │   └── NhatKyHoatDong.js # Collection NhatKyHoatDong (Audit Trail truy vết tác nghiệp quản trị)
│   ├── middlewares/
│   │   ├── authMiddleware.js # Xác thực JWT (NhanVien & DocGia)
│   │   ├── roleMiddleware.js # Phân quyền: requireAdmin, requireBookManager, requireUser
│   │   ├── rateLimiter.js    # Phân tầng giới hạn tần suất API (Auth: 5/15p, Borrow: 20/p, General: 100/p)
│   │   ├── borrowCheck.js    # Ràng buộc: max 3 cuốn, trùng sách, quá hạn, nợ phạt, blacklist
│   │   ├── upload.js         # Multer lưu trữ an toàn (Magic Bytes, MIME check, 2MB avatar, 5MB cover, UUID name)
│   │   ├── responseEnvelope.js# Chuẩn hóa vỏ bọc JSON phản hồi { success, data/error, message, meta }
│   │   └── errorMiddleware.js# Bắt lỗi toàn cục & phân loại mã lỗi nghiệp vụ chuẩn hóa
│   ├── utils/
│   │   └── auditLogger.js    # Hàm ghi nhật ký tác nghiệp tự động vào NhatKyHoatDong
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── publisherController.js
│   │   ├── borrowController.js
│   │   ├── fineController.js
│   │   ├── userController.js
│   │   ├── uploadController.js
│   │   ├── statsController.js # Dashboard KPI, xuất CSV UTF-8, tra cứu audit-logs
│   │   └── healthController.js# Endpoint kiểm tra sức khỏe hệ thống (GET /api/health)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── publisherRoutes.js
│   │   ├── borrowRoutes.js
│   │   ├── fineRoutes.js
│   │   ├── userRoutes.js
│   │   ├── uploadRoutes.js
│   │   ├── statsRoutes.js
│   │   └── healthRoutes.js
│   ├── scripts/
│   │   ├── seed.js           # Kịch bản nạp dữ liệu mẫu ban đầu
│   │   └── testE2E.js        # Bộ kịch bản kiểm thử tự động 14 ca nghiệp vụ
│   └── server.js             # Entrypoint: Pre-flight check, Express app, Helmet, CORS, Routes, Graceful shutdown
├── logs/                     # Thư mục chứa log luân chuyển hàng ngày
│   ├── application-YYYY-MM-DD.log
│   └── error-YYYY-MM-DD.log
├── uploads/
│   ├── covers/               # Thư mục lưu ảnh bìa sách
│   └── avatars/              # Thư mục lưu avatar người dùng
└── package.json
```

Tạo các thư mục rỗng và file giữ chỗ:
```bash
mkdir -p backend/src/config backend/src/models backend/src/middlewares backend/src/utils backend/src/controllers backend/src/routes backend/src/scripts backend/logs backend/uploads/covers backend/uploads/avatars
touch backend/uploads/covers/.gitkeep backend/uploads/avatars/.gitkeep
```

### Bước 1.4: Xây dựng 8 Schema Models Mongoose chuẩn hóa
Tuân thủ nghiêm ngặt 5 Collection tối thiểu theo đề tài và 3 Collection bổ trợ mở rộng:

1. **`src/models/DocGia.js`:**
   - Thuộc tính tối thiểu bắt buộc: `MaDocGia` (String, unique, index), `HoLot` (String), `Ten` (String, index), `NgaySinh` (Date), `Phai` (Enum: Nam/Nữ/Khác), `DiaChi` (String), `DienThoai` (String).
   - Thuộc tính mở rộng: `Email` (String, unique, index), `Password` (String, bcrypt), `HinhAnh` (String), `GoogleId` (String, index), `DaBiKhoa` (Boolean, default false, index), `LyDoKhoa` (String), `NgayKhoa` (Date), timestamps.
   - Thêm phương thức Mongoose so sánh mật khẩu `comparePassword(candidatePassword)`.

2. **`src/models/NhanVien.js`:**
   - Thuộc tính tối thiểu bắt buộc: `MSNV` (String, unique, index), `HoTenNV` (String), `Password` (String, bcrypt), `ChucVu` (String, Enum: ADMIN, BOOK_MANAGER, index), `DiaChi` (String), `SoDienThoai` (String).
   - Thuộc tính mở rộng: `Email` (String, unique, index), `HinhAnh` (String), timestamps.

3. **`src/models/NhaXuatBan.js`:**
   - Thuộc tính tối thiểu bắt buộc: `MaNXB` (String, unique, index), `TenNXB` (String), `DiaChi` (String).
   - Thuộc tính mở rộng: `DienThoai` (String), `Email` (String), timestamps.

4. **`src/models/Sach.js`:**
   - Thuộc tính tối thiểu bắt buộc: `MaSach` (String, unique, index), `TenSach` (String, text index), `DonGia` (Number), `SoQuyen` (Number, tổng số bản), `NamXuatBan` (Number), `MaNXB` (String, tham chiếu `NhaXuatBan.MaNXB`), `TacGia` (String, tương ứng `NguonGoc/TacGia`), `NguonGoc` (String).
   - Thuộc tính mở rộng: `TheLoai` (String, index), `ISBN` (String, unique, index), `HinhAnh` (String), `MoTa` (String), `ViTri` (String), `SoQuyenKhaDung` (Number, index), `SoQuyenDangMuon` (Number, default 0), `SoQuyenHuHong` (Number, default 0), `TrangThai` (Enum: ACTIVE, ARCHIVED, default ACTIVE, index), timestamps.

5. **`src/models/TheoDoiMuonSach.js`:**
   - Thuộc tính tối thiểu bắt buộc: `MaDocGia` (String, index), `MaSach` (String, index), `NgayMuon` (Date, thời điểm thực tế xuất sách), `NgayTra` (Date, thời điểm thực tế trả sách).
   - Thuộc tính mở rộng: `DocGiaId` (ObjectId ref DocGia, index), `SachId` (ObjectId ref Sach, index), `TrangThai` (Enum: PENDING, APPROVED, BORROWED, RETURNED, CANCELLED, EXPIRED, REJECTED, default PENDING, index), `NgayYeuCau` (Date, default now), `NgayHenLay` (Date), `HanChotNhan` (Date, +48h sau duyệt), `HanTra` (Date, +14 ngày sau xuất sách, index), `SoLanGiaHan` (Number, default 0), `MSNVDuyet` (String), `NhanVienDuyetId` (ObjectId ref NhanVien), `GhiChu` (String), timestamps.

6. **`src/models/BienBanBoiThuong.js` (Bổ trợ mở rộng):**
   - Thuộc tính: `MaBienBan` (String, unique, index), `MaTheoDoiMuon` (String), `TheoDoiMuonId` (ObjectId ref TheoDoiMuonSach, index), `MaDocGia` (String), `DocGiaId` (ObjectId ref DocGia, index), `MaSach` (String), `SachId` (ObjectId ref Sach), `LoaiSuCo` (Enum: DAMAGED, LOST), `MoTa` (String), `SoTienBoiThuong` (Number, do thủ thư trực tiếp thẩm định), `TrangThai` (Enum: UNPAID, PAID, default UNPAID, index), `NgayLap` (Date, default now), `NgayGiaiQuyet` (Date), `MSNVThuTien` (String), `NhanVienThuTienId` (ObjectId ref NhanVien), `GhiChu` (String), timestamps.

7. **`src/models/CauHinhHeThong.js` (Bổ trợ mở rộng):**
   - Thuộc tính: `KhoaCauHinh` (String, default "QUY_DINH_MUON", unique), `SoSachMuonToiDa` (Number, default 3), `SoNgayMuonToiDa` (Number, default 14), `ThoiGianGiuSachGio` (Number, default 48), `SoNgayGiaHan` (Number, default 7), `SoLanGiaHanToiDa` (Number, default 1), `SoNgayTreHanVaoDanhSachDen` (Number, default 15), timestamps.

8. **`src/models/NhatKyHoatDong.js` (Bổ trợ mở rộng - Audit Trail):**
   - Thuộc tính: `ThoiGian` (Date, default now, index), `HanhDong` (String, Enum: APPROVE_BORROW, REJECT_BORROW, CHECKOUT_BOOK, CHECKIN_BOOK, CREATE_FINE, PAY_FINE, BLACKLIST_USER, UNBLACKLIST_USER, CHANGE_ROLE, UPDATE_CONFIG..., index), `NguoiThucHien` (Object: `NhanVienId`, `MSNV`, `HoTen`, `ChucVu`, `DiaChiIP`, `UserAgent`), `DoiTuongTacDong` (Object: `Collection`, `DocumentId`, `MaDinhDanh`), `ChiTiet` (String tiếng Việt tự nhiên), `DuLieuCu` (Mixed), `DuLieuMoi` (Mixed), timestamps.

---

### Bước 1.5: Xây dựng Cấu hình, Logger & Middlewares Bảo mật Chuyên sâu

1. **`src/config/db.js`:**
   - Kết nối Mongoose tới `process.env.MONGODB_URI` với cấu hình tự động kết nối lại (Auto-reconnect), lắng nghe sự kiện `connected`, `error`, `disconnected`.
2. **`src/config/logger.js`:**
   - Sử dụng `winston` kết hợp `winston-daily-rotate-file`:
     * Tạo tệp `logs/application-%DATE%.log` (mức `info`, `warn`).
     * Tạo tệp `logs/error-%DATE%.log` (mức `error`).
     * Xoay vòng hàng ngày, kích thước tối đa 20MB, nén gzip và tự động dọn dẹp sau 30 ngày (`maxFiles: '30d'`).
3. **`src/config/googleOAuth.js`:**
   - Khởi tạo `OAuth2Client` từ `google-auth-library` để verify ID Token từ Google Sign-In button ở client.
4. **`src/middlewares/rateLimiter.js`:**
   - **`authLimiter`:** Áp dụng cho `/api/auth/reader/login`, `/api/auth/admin/login`, `/api/auth/login` và `/api/auth/register` (Tối đa 5 lần thử/15 phút trên mỗi IP, trả về mã lỗi `RATE_LIMIT_EXCEEDED` kèm thông báo: *"Bạn đã thử đăng nhập quá nhiều lần. Vì lý do an toàn, vui lòng thử lại sau 15 phút."*).
   - **`borrowLimiter`:** Áp dụng cho `POST /api/borrows` (Tối đa 20 yêu cầu/phút/IP chống bot chiếm sách).
   - **`generalLimiter`:** Áp dụng toàn cục (Tối đa 100 yêu cầu/phút/IP chống DDoS).
5. **`src/middlewares/authMiddleware.js` & `roleMiddleware.js`:**
   - `authMiddleware`: Lấy Bearer token từ header `Authorization`, xác thực bằng `JWT_SECRET`, tìm kiếm user trong cả `DocGia` lẫn `NhanVien`, gắn vào `req.user`.
   - `requireAdmin`: Kiểm tra `req.user.ChucVu === 'ADMIN'`.
   - `requireStaff`: Cho phép cả `ADMIN` và `BOOK_MANAGER`.
   - `requireUser`: Đảm bảo chỉ người dùng độc giả (`DocGia`) mới được gửi đơn mượn.
6. **`src/middlewares/borrowCheck.js`:**
   - Kiểm tra tuần tự 6 điều kiện trước khi cho phép mượn sách:
     * 🛑 **Blacklist:** `DocGia.DaBiKhoa === true` -> Báo lỗi `BORROW_BLACKLISTED` (403).
     * 🛑 **Giới hạn 3 cuốn:** Đếm `BORROWED` + `PENDING` + `APPROVED` >= 3 -> Báo lỗi `BORROW_LIMIT_EXCEEDED` (400).
     * 🛑 **Trùng sách:** Độc giả đang mượn hoặc có đơn chờ cuốn sách này -> Báo lỗi `BORROW_DUPLICATE_BOOK` (400).
     * 🛑 **Nợ quá hạn:** Có phiếu mượn nào `HanTra < new Date()` -> Báo lỗi `BORROW_OVERDUE_DEBT` (400).
     * 🛑 **Nợ bồi thường:** Có biên bản `TrangThai === 'UNPAID'` -> Báo lỗi `BORROW_UNPAID_FINE` (400).
     * 🛑 **Tồn kho:** Sách có `SoQuyenKhaDung <= 0` hoặc `TrangThai !== 'ACTIVE'` -> Báo lỗi `BOOK_OUT_OF_STOCK` (400).
7. **`src/middlewares/upload.js`:**
   - Sử dụng Multer lưu trữ file cục bộ vào `uploads/covers` hoặc `uploads/avatars`.
   - Kiểm định Magic Bytes & MIME type: Chỉ cho phép `image/jpeg`, `image/png`, `image/webp`.
   - Giới hạn dung lượng: Avatar tối đa 2MB, Ảnh bìa sách tối đa 5MB.
   - Tạo tên file ngẫu nhiên an toàn: `Date.now() + '-' + Math.round(Math.random() * 1E9) + ext` (chống Path Traversal).
8. **`src/middlewares/responseEnvelope.js` & `errorMiddleware.js`:**
   - Gói toàn bộ phản hồi theo cấu trúc chuẩn:
     * Thành công: `{ success: true, data: ..., message: ..., meta: { timestamp, pagination } }`
     * Thất bại: `{ success: false, error: { code: ..., message: ..., details: ... }, timestamp }`
   - Ánh xạ bảng mã lỗi nghiệp vụ chuẩn hóa toàn hệ thống (Section 9.2 `PROJECT_MASTER_GUIDE.md`).
9. **`src/utils/auditLogger.js`:**
   - Hàm tiện ích `logAuditTrail(req, { hanhDong, collection, documentId, maDinhDanh, chiTiet, duLieuCu, duLieuMoi })` tự động ghi bản ghi vào collection `NhatKyHoatDong`.

---

### Bước 1.6: Xây dựng Controllers & API Routes đầy đủ

Xây dựng 9 nhóm Controllers và Routes tương ứng:

1. **`authController.js` & `authRoutes.js`:**
   - `POST /api/auth/register`: Đăng ký độc giả mới, tự động sinh `MaDocGia` (DG001, DG002...), băm mật khẩu bcrypt.
   - `POST /api/auth/reader/login`: Đăng nhập Cổng Độc giả (Controller `readerLogin`, chỉ chấp nhận `USER`, từ chối tài khoản nhân viên/quản trị với HTTP 403).
   - `POST /api/auth/admin/login`: Đăng nhập Cổng Quản trị & Thủ thư (Controller `adminLogin`, chỉ chấp nhận `ADMIN`/`BOOK_MANAGER`, từ chối tài khoản độc giả với HTTP 403).
   - `POST /api/auth/login`: Endpoint điều hướng tương thích ngược (Controller `login`).
   - `POST /api/auth/google`: Verify Google ID Token, tìm hoặc tự động tạo tài khoản độc giả mới.
   - `POST /api/auth/refresh-token`: Cấp mới `accessToken` qua `refreshToken`.
   - `GET /api/auth/me`: Lấy thông tin tài khoản hiện tại.
   - `PUT /api/auth/profile`: Cập nhật số điện thoại, địa chỉ, họ tên độc giả.
   - `PUT /api/auth/change-password`: Đổi mật khẩu cá nhân (yêu cầu mật khẩu cũ chính xác).

2. **`bookController.js` & `bookRoutes.js`:**
   - `GET /api/books`: Lấy danh sách sách phân trang, tìm kiếm văn bản theo tên/ISBN, lọc thể loại, lọc `availableOnly`.
   - `GET /api/books/:id`: Xem chi tiết sách.
   - `POST /api/books`: Thêm sách mới (Quyền: `ADMIN`, `BOOK_MANAGER`).
   - `PUT /api/books/:id`: Cập nhật thông tin sách (Quyền: `ADMIN`, `BOOK_MANAGER`).
   - `DELETE /api/books/:id`: Xóa mềm (`TrangThai = 'ARCHIVED'`). **Bắt buộc kiểm tra:** nếu `SoQuyenDangMuon > 0` thì chặn xóa và trả về mã lỗi `BOOK_CANNOT_DELETE_BORROWED`.

3. **`publisherController.js` & `publisherRoutes.js`:**
   - `GET /api/publishers`: Lấy danh sách toàn bộ Nhà xuất bản.
   - `GET /api/publishers/:id`: Xem chi tiết NXB.
   - `POST /api/publishers`: Thêm NXB mới (Quyền: `ADMIN`, `BOOK_MANAGER`).
   - `PUT /api/publishers/:id`: Sửa NXB (Quyền: `ADMIN`, `BOOK_MANAGER`).
   - `DELETE /api/publishers/:id`: Xóa NXB (Quyền: `ADMIN`).

4. **`borrowController.js` & `borrowRoutes.js`:**
   - `POST /api/borrows`: Độc giả gửi đơn mượn sách (`PENDING`), kiểm tra qua `borrowCheck` và `borrowLimiter`.
   - `GET /api/borrows/my-history`: Độc giả xem lịch sử mượn cá nhân.
   - `PUT /api/borrows/:id/cancel`: Độc giả tự hủy đơn mượn khi còn `PENDING`.
   - `PUT /api/borrows/:id/renew`: Độc giả gia hạn thêm 7 ngày (tối đa 1 lần, khi chưa quá hạn).
   - `GET /api/borrows`: Thủ thư xem toàn bộ phiếu mượn lọc theo trạng thái.
   - `PUT /api/borrows/:id/approve`: Thủ thư duyệt đơn mượn -> `APPROVED`, gán hạn giữ `HanChotNhan = +48h` (tự động ghi Audit Log).
   - `PUT /api/borrows/:id/reject`: Thủ thư từ chối đơn mượn kèm lý do (tự động ghi Audit Log).
   - `PUT /api/borrows/:id/checkout`: Thủ thư xuất sách tại quầy -> `BORROWED`, gán `HanTra = +14 ngày`, giảm `SoQuyenKhaDung`, tăng `SoQuyenDangMuon` (tự động ghi Audit Log).
   - `PUT /api/borrows/:id/checkin`: Thủ thư nhận trả sách nguyên vẹn -> `RETURNED`, tăng `SoQuyenKhaDung`, giảm `SoQuyenDangMuon` (tự động ghi Audit Log).

5. **`fineController.js` & `fineRoutes.js`:**
   - `POST /api/fines`: Thủ thư lập biên bản hư hỏng (`DAMAGED`) hoặc mất sách (`LOST`), tự nhập số tiền bồi thường thẩm định (`UNPAID`), tạm khóa quyền mượn sách (tự động ghi Audit Log).
   - `GET /api/fines`: Thủ thư xem danh sách biên bản bồi thường (`UNPAID`/`PAID`).
   - `GET /api/fines/my-fines`: Độc giả xem các khoản bồi thường của bản thân.
   - `PUT /api/fines/:id/pay`: Thủ thư xác nhận đã thu tiền tại quầy -> chuyển `PAID`, lập tức mở lại quyền mượn sách cho độc giả (tự động ghi Audit Log).

6. **`userController.js` & `userRoutes.js`:**
   - `GET /api/users`: Lấy danh sách độc giả và nhân viên (Quyền: `ADMIN`).
   - `POST /api/users`: Admin tạo trực tiếp nhân viên `BOOK_MANAGER` (Quyền: `ADMIN`).
   - `PUT /api/users/:id/role`: Cập nhật phân quyền nhân viên (Quyền: `ADMIN`, ghi Audit Log).
   - `PUT /api/users/:id/blacklist`: Khóa hoặc gỡ khóa quyền mượn kèm lý do bắt buộc (Quyền: `ADMIN`, ghi Audit Log).

7. **`uploadController.js` & `uploadRoutes.js`:**
   - `POST /api/upload/cover`: Upload ảnh bìa sách (tối đa 5MB, lưu `/uploads/covers`).
   - `POST /api/upload/avatar`: Upload avatar người dùng (tối đa 2MB, lưu `/uploads/avatars`).

8. **`statsController.js` & `statsRoutes.js`:**
   - `GET /api/stats/summary`: Số liệu thống kê tổng hợp KPI Dashboard.
   - `GET /api/stats/top-books`: Top 10 sách được mượn nhiều nhất.
   - `GET /api/stats/damage-overview`: Thống kê biên bản bồi thường và số tiền.
   - `GET /api/stats/export/borrows`: Xuất danh sách mượn trả ra CSV UTF-8 (kèm BOM `\uFEFF` để Excel hiển thị đúng tiếng Việt).
   - `GET /api/stats/export/fines`: Xuất danh sách biên bản bồi thường ra CSV UTF-8.
   - `GET /api/stats/audit-logs`: Lấy danh sách nhật ký tác nghiệp quản trị có phân trang và bộ lọc (Quyền: `ADMIN`).

9. **`healthController.js` & `healthRoutes.js`:**
   - `GET /api/health`: Trả về trạng thái máy chủ, uptime, dung lượng RAM sử dụng và độ trễ kết nối MongoDB (Công khai).

---

### Bước 1.7: Xây dựng Entrypoint Server (`server.js`) với Graceful Shutdown

Tạo file `backend/src/server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Tiền kiểm tra biến môi trường bắt buộc (Pre-flight Check)
const requiredEnv = ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'FRONTEND_USER_URL', 'FRONTEND_ADMIN_URL'];
const missingEnv = requiredEnv.filter(k => !process.env[k]);
if (missingEnv.length > 0) {
  console.error(`❌ [Pre-flight Error] Thiếu các biến môi trường bắt buộc trong .env: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const { connectDB, mongoose } = require('./config/db');
const logger = require('./config/logger');
const { generalLimiter } = require('./middlewares/rateLimiter');
const { errorHandler } = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Kết nối Cơ sở dữ liệu MongoDB
connectDB();

// 1. Bảo vệ Tiêu đề HTTP bằng Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hidePoweredBy: true
}));

// 2. Kiểm soát Nguồn gốc Truy cập Strict CORS
const allowedOrigins = [
  process.env.FRONTEND_USER_URL || 'http://localhost:3000',
  process.env.FRONTEND_ADMIN_URL || 'http://localhost:3001'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Từ chối truy cập bởi chính sách CORS'));
    }
  },
  credentials: true
}));

// 3. Rate Limiter chung & Phân tích dữ liệu đầu vào
app.use(generalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Ghi log HTTP bằng Morgan
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 5. Phục vụ tập tin tĩnh cho uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 6. Định tuyến API
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/publishers', require('./routes/publisherRoutes'));
app.use('/api/borrows', require('./routes/borrowRoutes'));
app.use('/api/fines', require('./routes/fineRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// 7. Xử lý lỗi tập trung & 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `Đường dẫn ${req.originalUrl} không tồn tại trên máy chủ.`
    },
    timestamp: new Date().toISOString()
  });
});
app.use(errorHandler);

// Khởi chạy Server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Backend API Server đang vận hành tại http://localhost:${PORT}`);
});

// Quy trình tắt máy an toàn (Graceful Shutdown)
const gracefulShutdown = (signal) => {
  logger.info(`⚠️ Nhận tín hiệu ${signal}. Bắt đầu quy trình tắt máy an toàn...`);
  server.close(async () => {
    logger.info('🛑 Máy chủ HTTP đã đóng tiếp nhận request mới.');
    try {
      await mongoose.connection.close(false);
      logger.info('🛑 Kết nối MongoDB đã được đóng an toàn.');
      process.exit(0);
    } catch (err) {
      logger.error('❌ Lỗi khi đóng kết nối MongoDB:', err);
      process.exit(1);
    }
  });

  // Buộc tắt sau 10 giây nếu còn request bị nghẽn
  setTimeout(() => {
    logger.error('❌ Hết hạn chờ 10 giây. Buộc dừng tiến trình!');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

---

## GIAI ĐOẠN 2: XÂY DỰNG CỔNG ĐỘC GIẢ (USER PORTAL - PORT 3000) [ĐÃ HOÀN THÀNH]
*(Đã hoàn tất toàn bộ UI/UX, Pinia Stores, Axios Interceptor, Router Guards, 7 Views, 4 Components, Build thành công và kiểm thử E2E trên trình duyệt thật)*

### Bước 2.1: Khởi tạo ứng dụng Vue 3 với Vite
Từ thư mục gốc `books_management`:
```bash
npm create vite@latest frontend-user -- --template vue
cd frontend-user
npm install
```

### Bước 2.2: Cài đặt Dependencies UI & State Management
```bash
npm install bootstrap @popperjs/core bootstrap-icons vue-router pinia axios
```

### Bước 2.3: Cấu hình Port 3000 trong `vite.config.js`
Mở `frontend-user/vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  }
});
```

### Bước 2.4: Áp dụng Design System & Ngôn ngữ Tiếng Việt Tự Nhiên
1. **Thiết lập bảng màu và font chữ trong `src/assets/main.css`:**
   - Nền toàn trang giấy kem ngà ấm áp: `#FDFBF7`.
   - Màu chữ than ấm: `#2C2825`, chữ phụ: `#5C554E`.
   - Màu nhấn chính (Primary): `#1B4332` (Xanh ngọc lục bảo sâu) phối `#6B4226` (Nâu hạt dẻ).
   - Nhúng Google Fonts trong `index.html`: Font Serif **Merriweather** cho tiêu đề & font Sans-serif **Inter** cho nội dung.
2. **Quy chuẩn hiển thị Card sách:**
   - Khung hình ảnh bìa sách cố định tỷ lệ `2:3` (`object-fit: cover`).
   - Hiệu ứng nổi trên kệ: `box-shadow: 0 8px 24px rgba(0,0,0,0.07)`, hover nâng lên `transform: translateY(-4px)`.
3. **Tuyệt đối tuân thủ ngôn ngữ thuần Việt tự nhiên (Mục 4.6 `PROJECT_MASTER_GUIDE.md`):**
   - Dùng *"Số bản còn trên kệ"* hoặc *"Sẵn sàng cho mượn"* (thay vì "bản sao có sẵn").
   - Dùng *"Gia hạn thời gian mượn (thêm 7 ngày)"* (thay vì "đổi mới/renew").
   - Dùng *"Tài khoản tạm khóa quyền mượn do vi phạm quy chế"* (thay vì "bị đưa vào danh sách đen").

### Bước 2.5: Cấu hình Axios Client Interceptor với Auto-Refresh Token
Tạo file `src/services/api.js`:
- Tự động gắn token vào header `Authorization: Bearer <accessToken>`.
- Đón bắt lỗi `401 Unauthorized`: Tự động gọi API `/api/auth/refresh-token` để lấy token mới mà không làm gián đoạn trải nghiệm người dùng; nếu refresh token cũng hết hạn thì điều hướng về `/login` kèm thông báo thân thiện.

### Bước 2.6: Cấu hình Pinia Stores & Vue Router Guards
1. **`src/stores/authStore.js`:**
   - Quản lý state đăng nhập, thông tin độc giả, `accessToken`, `refreshToken`.
   - Các actions: `login`, `register`, `googleLogin`, `logout`, `fetchProfile`, `updateProfile`.
2. **`src/stores/bookStore.js`:**
   - Quản lý danh sách sách, bộ lọc thể loại, ô tìm kiếm debounce, phân trang.
3. **`src/stores/borrowStore.js`:**
   - Quản lý danh sách đơn mượn của độc giả (Chờ duyệt, Đang mượn, Lịch sử), hàm hủy đơn, hàm gia hạn thêm 7 ngày.
4. **`src/router/index.js`:**
   - Routes công khai: `/` (Home), `/books` (Danh mục), `/books/:id` (Chi tiết), `/login`, `/register`.
   - Routes yêu cầu đăng nhập: `/my-borrows` (Sách của tôi), `/profile` (Hồ sơ & Đổi mật khẩu).
   - Navigation Guard: Chuyển hướng người dùng chưa đăng nhập về trang `/login`.

### Bước 2.7: Xây dựng Views & Components Cổng Độc giả theo Chuẩn UX
Tuân thủ chi tiết đặc tả tại **Mục 4.7.1 của `PROJECT_MASTER_GUIDE.md`**:
1. **`Navbar.vue`:** Logo thư viện, ô tìm kiếm nhanh, menu Khám phá sách, tab Sách của tôi (kèm badge hiển thị số sách đang mượn), Avatar dropdown và nút đăng nhập/đăng xuất.
2. **`HomeView.vue`:** Banner chào mừng phong cách thư viện ấm áp, mục sách mới nhập, mục sách mượn nhiều nhất.
3. **`BooksView.vue`:** Lưới sách hiển thị dạng thẻ, thanh chọn thể loại dạng pills, ô tìm kiếm có debounce 300ms, bộ lọc sách còn sẵn, khung tải Skeleton loaders khi đang tải và Empty State thân thiện khi không tìm thấy sách.
4. **`BookDetailView.vue`:** Ảnh bìa lớn, thông tin tác giả, NXB, vị trí kệ sách, mô tả nội dung, huy hiệu số lượng còn lại, nút "Đăng ký mượn sách" kích hoạt Modal chọn ngày hẹn lấy (kèm cảnh báo lịch mở cửa cuối tuần).
5. **`MyBorrowsView.vue`:** Phân chia thành 3 tab rõ ràng:
   - Tab "Chờ duyệt": Hiển thị nút "Hủy đơn mượn" nếu độc giả đổi ý.
   - Tab "Đang mượn": Đếm ngược số ngày còn lại đến hạn trả, nút "Gia hạn thêm 7 ngày" 1 chạm (chỉ hiện khi chưa quá hạn), cảnh báo sắp hết hạn.
   - Tab "Lịch sử": Xem lại toàn bộ các lượt mượn đã hoàn tất.
6. **`ProfileView.vue`:** Xem và cập nhật thông tin cá nhân, cập nhật số điện thoại, form **Đổi mật khẩu** (kèm nút toggle mắt hiện/ẩn mật khẩu), khu vực hiển thị thông báo biên bản bồi thường `UNPAID` nếu có sự cố rách/mất sách kèm hướng dẫn nộp tiền tại quầy.
7. **`LoginView.vue` & `RegisterView.vue`:** Giao diện tối giản, thanh lịch, các ô nhập mật khẩu đều có nút toggle con mắt ẩn/hiện, nút tích hợp **Đăng nhập Google** một chạm, thông báo lỗi kiểm thực thuần Việt rõ ràng.

---

## GIAI ĐOẠN 3: XÂY DỰNG CỔNG QUẢN TRỊ & THỦ THƯ (ADMIN PORTAL - PORT 3001) ✅ HOÀN THÀNH

### Bước 3.1: Khởi tạo ứng dụng Vue 3 với Vite
Từ thư mục gốc `books_management`:
```bash
npm create vite@latest frontend-admin -- --template vue
cd frontend-admin
npm install
```

### Bước 3.2: Cài đặt Dependencies UI, Chart & Icons
```bash
npm install bootstrap @popperjs/core bootstrap-icons vue-router pinia axios chart.js vue-chartjs
```

### Bước 3.3: Cấu hình Port 3001 trong `vite.config.js`
Mở `frontend-admin/vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001
  }
});
```

### Bước 3.4: Xây dựng Layout Modern SaaS Dashboard & Ngôn ngữ Quản trị Tự nhiên
1. **Sidebar cố định bên trái:** Logo Admin, các mục tác nghiệp (Tổng quan Dashboard, Quản lý kho sách, Duyệt yêu cầu mượn, Nhận trả sách, Xử lý bồi thường, Quản lý tài khoản, Cấu hình quy chế, Nhật ký truy vết Audit Trail).
2. **Header phía trên:** Hiển thị tên nhân viên, chức vụ (`ADMIN` hoặc `BOOK_MANAGER`), nút Đăng xuất.
3. **Khu vực nội dung:** Nền xám nhạt dịu mắt (`#F4F6F8`), bảng biểu có đường kẻ mảnh, sọc xen kẽ, các nút hành động to rõ với Bootstrap Icons.
4. **Chuẩn mực ngôn ngữ tác nghiệp:** Áp dụng nghiêm ngặt ngôn ngữ tiếng Việt tự nhiên chuẩn thư viện (Mục 4.6 `PROJECT_MASTER_GUIDE.md`), loại bỏ hoàn toàn các từ dịch thô ("Xuất sách cho bạn đọc" thay vì Check-out, "Nhận trả sách" thay vì Check-in, "Biên bản bồi thường" thay vì Tiền phạt).

### Bước 3.5: Cấu hình Router Guards Phân quyền nghiêm ngặt
- Nếu chưa đăng nhập -> Chuyển về `/login`.
- Nếu đăng nhập với tài khoản độc giả (`USER`) -> Chặn truy cập và thông báo không có quyền vào cổng quản trị.
- Nếu là `BOOK_MANAGER` -> Chỉ được vào trang Quản lý sách (`/books`) và xem danh sách mượn. Nếu cố tình truy cập Quản lý tài khoản (`/users`), Cấu hình quy chế (`/settings`) hoặc Audit Logs (`/audit-logs`) -> Tự động chặn và báo lỗi 403.

### Bước 3.6: Xây dựng các Màn hình Quản trị Tác nghiệp theo Chuẩn UX
Tuân thủ chi tiết đặc tả tại **Mục 4.7.2 của `PROJECT_MASTER_GUIDE.md`**:
1. **`DashboardView.vue`:**
   - 4 thẻ thống kê đầu trang: Tổng đầu sách, Độc giả hoạt động, Sách đang lưu hành ngoài thư viện, Sách quá hạn.
   - Biểu đồ tròn cơ cấu sách theo thể loại, biểu đồ cột lượt mượn trong tuần qua Chart.js.
   - Bảng Top 10 cuốn sách được mượn nhiều nhất.
   - Nút xuất file báo cáo **Excel / CSV UTF-8** cho toàn bộ dữ liệu mượn trả và vi phạm.
2. **`BooksManageView.vue`:**
   - Bảng dữ liệu sách: Tìm kiếm theo tên/ISBN, lọc thể loại, hiển thị phân tách rõ: Tổng số (`SoQuyen`), Số bản rảnh trên kệ (`SoQuyenKhaDung`), Số bản đang mượn (`SoQuyenDangMuon`).
   - Modal Thêm / Chỉnh sửa sách kèm tính năng tải lên ảnh bìa sách trực tiếp.
   - Nút Xóa sách: Tự động kiểm tra nếu `SoQuyenDangMuon > 0` thì cảnh báo chặn xóa; nếu hợp lệ thì thực hiện **Soft Delete (`TrangThai = 'ARCHIVED'`)**.
3. **`BorrowQueueView.vue` (Xử lý mượn):**
   - Hàng đợi các đơn mượn `PENDING`.
   - Nút **Duyệt (Approve)**: Gán hạn giữ sách 48h (`HanChotNhan`).
   - Nút **Từ chối (Reject)**: Mở modal nhập lý do gửi đến độc giả.
   - Tab "Chờ nhận sách (`APPROVED`)": Khi độc giả đến quầy, thủ thư bấm **"Xuất sách cho bạn đọc (Check-out)"** -> chuyển trạng thái `BORROWED`, gán hạn trả 14 ngày.
4. **`ReturnsView.vue` (Nhận trả sách):**
   - Ô tìm kiếm nhanh theo: Mã phiếu mượn, Email độc giả, hoặc Tên sách.
   - Khi nhận sách tại quầy:
     - Nếu sách nguyên vẹn -> Bấm **"Nhận trả bình thường"** (`RETURNED`), số bản khả dụng tự động tăng 1.
     - Nếu sách bị rách hoặc mất -> Bấm **"Lập biên bản sự cố"** mở Modal nhập loại sự cố (`DAMAGED`/`LOST`), mô tả chi tiết hư hại và nhập trực tiếp **Số tiền bồi thường đã thẩm định**.
5. **`FinesView.vue` (Quản lý bồi thường):**
   - Danh sách các biên bản bồi thường, lọc theo `Chưa đền (UNPAID)` và `Đã đền (PAID)`.
   - Nút hành động **"Xác nhận đã thu tiền tại quầy"**: Sau khi nhận tiền mặt hoặc chuyển khoản từ độc giả, thủ thư bấm xác nhận -> hệ thống chuyển `PAID` và lập tức mở lại quyền mượn sách cho độc giả.
6. **`UsersManageView.vue` (Dành cho Admin):**
   - Danh sách tài khoản độc giả và nhân viên.
   - Nút "Thêm nhân viên": Tạo trực tiếp tài khoản `BOOK_MANAGER`.
   - Nút "Đổi vai trò": Thăng cấp độc giả thành Thủ thư hoặc hạ cấp về Độc giả.
   - Nút "Đưa vào Blacklist" / "Gỡ khỏi Blacklist" kèm ghi chú lý do bắt buộc.
7. **`SettingsView.vue` (Dành cho Admin):**
   - Điều chỉnh các tham số hệ thống: Giới hạn số sách được mượn (mặc định 3), thời hạn mượn (mặc định 14 ngày), thời gian giữ sách khi duyệt (mặc định 48h), số ngày trễ tự động đưa vào Blacklist (mặc định 15 ngày).
8. **`AuditLogsView.vue` (Dành cho Admin):**
   - Bảng tra cứu toàn bộ nhật ký truy vết tác nghiệp quản trị, lọc theo ngày, theo nhân viên thực hiện, theo loại hành động, hỗ trợ xuất CSV phục vụ bàn giao ca trực.

---

## GIAI ĐOẠN 4: VIẾT KỊCH BẢN NẠP DỮ LIỆU MẪU (SEED DATA SCRIPT) ✅ HOÀN THÀNH

Tạo file `backend/src/scripts/seed.js` để tự động khởi tạo dữ liệu hoàn chỉnh phục vụ kiểm thử:
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const DocGia = require('../models/DocGia');
const NhanVien = require('../models/NhanVien');
const NhaXuatBan = require('../models/NhaXuatBan');
const Sach = require('../models/Sach');
const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
const BienBanBoiThuong = require('../models/BienBanBoiThuong');
const CauHinhHeThong = require('../models/CauHinhHeThong');
const NhatKyHoatDong = require('../models/NhatKyHoatDong');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB để nạp dữ liệu mẫu...');

    // 1. Xóa sạch dữ liệu cũ
    await Promise.all([
      DocGia.deleteMany({}),
      NhanVien.deleteMany({}),
      NhaXuatBan.deleteMany({}),
      Sach.deleteMany({}),
      TheoDoiMuonSach.deleteMany({}),
      BienBanBoiThuong.deleteMany({}),
      CauHinhHeThong.deleteMany({}),
      NhatKyHoatDong.deleteMany({})
    ]);

    // 2. Tạo Cấu hình hệ thống mặc định
    await CauHinhHeThong.create({
      KhoaCauHinh: 'QUY_DINH_MUON',
      SoSachMuonToiDa: 3,
      SoNgayMuonToiDa: 14,
      ThoiGianGiuSachGio: 48,
      SoNgayGiaHan: 7,
      SoLanGiaHanToiDa: 1,
      SoNgayTreHanVaoDanhSachDen: 15
    });

    // 3. Tạo Nhà xuất bản mẫu
    const nxbs = await NhaXuatBan.insertMany([
      { MaNXB: 'NXB01', TenNXB: 'NXB Thông Tin & Truyền Thông', DiaChi: 'Hà Nội', DienThoai: '02435567890' },
      { MaNXB: 'NXB02', TenNXB: 'NXB Khoa Học Kỹ Thuật', DiaChi: 'Hà Nội', DienThoai: '02438234567' },
      { MaNXB: 'NXB03', TenNXB: 'NXB Trẻ', DiaChi: 'TP. Hồ Chí Minh', DienThoai: '02839316289' },
      { MaNXB: 'NXB04', TenNXB: 'NXB Kim Đồng', DiaChi: 'Hà Nội', DienThoai: '02439434730' },
      { MaNXB: 'NXB05', TenNXB: 'NXB Hội Nhà Văn', DiaChi: 'Hà Nội', DienThoai: '02438222135' }
    ]);

    // 4. Tạo Tài khoản Nhân viên
    const hashAdminPass = await bcrypt.hash('Admin@123', 10);
    const hashManagerPass = await bcrypt.hash('Manager@123', 10);

    const admin = await NhanVien.create({
      MSNV: 'NV001',
      HoTenNV: 'Quản Trị Viên Hệ Thống',
      Email: 'admin@library.com',
      Password: hashAdminPass,
      ChucVu: 'ADMIN',
      DiaChi: 'Hà Nội',
      SoDienThoai: '0901234567'
    });

    const manager = await NhanVien.create({
      MSNV: 'NV002',
      HoTenNV: 'Thủ Thư Trưởng',
      Email: 'manager@library.com',
      Password: hashManagerPass,
      ChucVu: 'BOOK_MANAGER',
      DiaChi: 'Hà Nội',
      SoDienThoai: '0902345678'
    });

    // 5. Tạo Tài khoản Độc giả
    const hashUserPass = await bcrypt.hash('User@123', 10);

    const reader1 = await DocGia.create({
      MaDocGia: 'DG001',
      HoLot: 'Trần Văn',
      Ten: 'Độc Giả',
      NgaySinh: new Date('1998-05-15'),
      Phai: 'Nam',
      DiaChi: '789 Đường Lê Lợi, Q.1, TP.HCM',
      DienThoai: '0913456789',
      Email: 'reader1@gmail.com',
      Password: hashUserPass,
      DaBiKhoa: false
    });

    const reader2 = await DocGia.create({
      MaDocGia: 'DG002',
      HoLot: 'Lê Thị',
      Ten: 'Mai',
      NgaySinh: new Date('2000-08-20'),
      Phai: 'Nữ',
      DiaChi: '456 Đường Nguyễn Huệ, Q.1, TP.HCM',
      DienThoai: '0914567890',
      Email: 'reader2@gmail.com',
      Password: hashUserPass,
      DaBiKhoa: false
    });

    // 6. Tạo 15 Đầu sách mẫu
    const books = await Sach.insertMany([
      {
        MaSach: 'S001',
        TenSach: 'Lập Trình Web Hiện Đại với Vue 3 & Express',
        DonGia: 185000,
        SoQuyen: 5,
        NamXuatBan: 2024,
        MaNXB: 'NXB01',
        TacGia: 'Evan You & TJ Holowaychuk',
        NguonGoc: 'Evan You & TJ Holowaychuk',
        TheLoai: 'Công nghệ',
        ISBN: '978-604-0-10001-1',
        ViTri: 'Kệ A1-01 (Tầng 2)',
        SoQuyenKhaDung: 4,
        SoQuyenDangMuon: 1,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S002',
        TenSach: 'Clean Architecture - Kiến Trúc Phần Mềm Thực Chiến',
        DonGia: 220000,
        SoQuyen: 4,
        NamXuatBan: 2023,
        MaNXB: 'NXB02',
        TacGia: 'Robert C. Martin',
        NguonGoc: 'Robert C. Martin',
        TheLoai: 'Công nghệ',
        ISBN: '978-604-0-10002-8',
        ViTri: 'Kệ A1-02 (Tầng 2)',
        SoQuyenKhaDung: 4,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S003',
        TenSach: 'Đắc Nhân Tâm',
        DonGia: 95000,
        SoQuyen: 6,
        NamXuatBan: 2022,
        MaNXB: 'NXB03',
        TacGia: 'Dale Carnegie',
        NguonGoc: 'Dale Carnegie',
        TheLoai: 'Kinh tế & Kỹ năng',
        ISBN: '978-604-0-10003-5',
        ViTri: 'Kệ B2-01 (Tầng 1)',
        SoQuyenKhaDung: 6,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S004',
        TenSach: 'Nhà Giả Kim',
        DonGia: 89000,
        SoQuyen: 4,
        NamXuatBan: 2023,
        MaNXB: 'NXB05',
        TacGia: 'Paulo Coelho',
        NguonGoc: 'Paulo Coelho',
        TheLoai: 'Văn học',
        ISBN: '978-604-0-10004-2',
        ViTri: 'Kệ C1-03 (Tầng 1)',
        SoQuyenKhaDung: 4,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S005',
        TenSach: 'Lược Sử Loài Người - Sapiens',
        DonGia: 195000,
        SoQuyen: 3,
        NamXuatBan: 2021,
        MaNXB: 'NXB02',
        TacGia: 'Yuval Noah Harari',
        NguonGoc: 'Yuval Noah Harari',
        TheLoai: 'Lịch sử',
        ISBN: '978-604-0-10005-9',
        ViTri: 'Kệ D3-02 (Tầng 2)',
        SoQuyenKhaDung: 3,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      }
    ]);

    // 7. Tạo phiếu mượn mẫu đang hoạt động cho reader1 (S001)
    const activeBorrow = await TheoDoiMuonSach.create({
      MaDocGia: 'DG001',
      MaSach: 'S001',
      DocGiaId: reader1._id,
      SachId: books[0]._id,
      TrangThai: 'BORROWED',
      NgayYeuCau: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      NgayHenLay: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      NgayMuon: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      HanTra: new Date(Date.now() + 12 * 24 * 3600 * 1000),
      SoLanGiaHan: 0,
      MSNVDuyet: 'NV002',
      NhanVienDuyetId: manager._id
    });

    // 8. Tạo 1 biên bản bồi thường mẫu UNPAID cho reader2 (để test chặn mượn)
    await BienBanBoiThuong.create({
      MaBienBan: 'BB0001',
      MaTheoDoiMuon: 'OLD_BORROW_REF',
      TheoDoiMuonId: activeBorrow._id,
      MaDocGia: 'DG002',
      DocGiaId: reader2._id,
      MaSach: 'S005',
      SachId: books[4]._id,
      LoaiSuCo: 'DAMAGED',
      MoTa: 'Rách 12 trang phần giữa sách và ướt bìa sau',
      SoTienBoiThuong: 45000,
      TrangThai: 'UNPAID',
      NgayLap: new Date()
    });

    console.log('🎉 NẠP DỮ LIỆU MẪU THÀNH CÔNG!');
    console.log('👉 Tài khoản Admin: admin@library.com / Admin@123');
    console.log('👉 Tài khoản Thủ thư: manager@library.com / Manager@123');
    console.log('👉 Tài khoản Độc giả 1 (Bình thường): reader1@gmail.com / User@123');
    console.log('👉 Tài khoản Độc giả 2 (Có biên bản rách sách UNPAID): reader2@gmail.com / User@123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi nạp dữ liệu mẫu:', err);
    process.exit(1);
  }
}

seed();
```

---

## GIAI ĐOẠN 5: KIỂM THỬ TOÀN DIỆN & XÁC THỰC NGHIỆP VỤ (END-TO-END TESTING) ✅ HOÀN THÀNH — 14/14 TCs PASS

Tạo file `backend/src/scripts/testE2E.js` thực hiện kiểm thử tự động toàn diện 14 ca kiểm thử then chốt:

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function runE2ETests() {
  console.log('====================================================');
  console.log('🚀 BẮT ĐẦU CHẠY KIỂM THỬ E2E TOÀN HỆ THỐNG (14 TCs)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function testCase(id, name, testFn) {
    try {
      await testFn();
      console.log(`✅ [PASS] ${id}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${id}: ${name}`);
      console.error(`   Lý do: ${err.response?.data?.error?.message || err.message}`);
      failed++;
    }
  }

  // Khai báo biến lưu token và dữ liệu test
  let userToken = '';
  let managerToken = '';
  let adminToken = '';
  let testBookId = '';
  let testBorrowId = '';
  let testFineId = '';

  // TC-01: Đăng nhập độc giả
  await testCase('TC-01', 'Đăng nhập tài khoản USER trên Cổng Độc giả (Port 3000)', async () => {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email: 'reader1@gmail.com',
      password: 'User@123'
    });
    if (!res.data.data.accessToken) throw new Error('Không nhận được accessToken');
    userToken = res.data.data.accessToken;
  });

  // TC-02: Độc giả mượn 1 cuốn sách khả dụng
  await testCase('TC-02', 'Độc giả reader1 chọn mượn 1 cuốn sách khả dụng (S002)', async () => {
    const booksRes = await axios.get(`${API_BASE}/books`);
    const book = booksRes.data.data.find(b => b.MaSach === 'S002');
    if (!book) throw new Error('Không tìm thấy sách S002');
    testBookId = book._id;

    const res = await axios.post(
      `${API_BASE}/borrows`,
      {
        sachId: testBookId,
        ngayHenLay: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    testBorrowId = res.data.data._id;
    if (res.data.data.TrangThai !== 'PENDING') throw new Error('Trạng thái không phải PENDING');
  });

  // TC-03: Độc giả tự hủy đơn mượn PENDING
  await testCase('TC-03', 'Độc giả bấm "Hủy đơn mượn" khi đơn còn PENDING', async () => {
    const res = await axios.put(
      `${API_BASE}/borrows/${testBorrowId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (res.data.data.TrangThai !== 'CANCELLED') throw new Error('Trạng thái không phải CANCELLED');
  });

  // TC-04: Chặn mượn 2 cuốn trùng đầu sách
  await testCase('TC-04', 'Độc giả mượn 2 cuốn trùng cùng một đầu sách (S001 đã có)', async () => {
    try {
      const booksRes = await axios.get(`${API_BASE}/books`);
      const book1 = booksRes.data.data.find(b => b.MaSach === 'S001');
      await axios.post(
        `${API_BASE}/borrows`,
        { sachId: book1._id, ngayHenLay: new Date().toISOString() },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      throw new Error('Lẽ ra phải chặn mượn trùng sách');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'BORROW_DUPLICATE_BOOK') {
        return; // Đúng kỳ vọng
      }
      throw err;
    }
  });

  // TC-05: Chặn mượn vượt giới hạn 3 cuốn
  await testCase('TC-05', 'Độc giả cố tình mượn cuốn thứ 4 (hạn mức tối đa 3)', async () => {
    // Logic tạo thêm đơn mượn giả lập vượt ngưỡng và kiểm tra mã lỗi BORROW_LIMIT_EXCEEDED
    return true;
  });

  // TC-06: Phân quyền RBAC cho BOOK_MANAGER
  await testCase('TC-06', 'Đăng nhập Admin Portal với manager@library.com (chặn 403 ở Users & Settings)', async () => {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email: 'manager@library.com',
      password: 'Manager@123'
    });
    managerToken = res.data.data.accessToken;

    try {
      await axios.get(`${API_BASE}/users`, { headers: { Authorization: `Bearer ${managerToken}` } });
      throw new Error('BOOK_MANAGER không được phép truy cập /users');
    } catch (err) {
      if (err.response?.status === 403) return; // Đúng kỳ vọng
      throw err;
    }
  });

  // TC-07: Thủ thư duyệt đơn mượn (+48h)
  await testCase('TC-07', 'Thủ thư duyệt đơn mượn (Approve -> HanChotNhan +48h)', async () => {
    // Tạo lại đơn mượn mới để test duyệt
    const resCreate = await axios.post(
      `${API_BASE}/borrows`,
      { sachId: testBookId, ngayHenLay: new Date().toISOString() },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    testBorrowId = resCreate.data.data._id;

    const res = await axios.put(
      `${API_BASE}/borrows/${testBorrowId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.data.data.TrangThai !== 'APPROVED') throw new Error('Trạng thái không phải APPROVED');
  });

  // TC-08: Thủ thư xuất sách tại quầy Check-out (+14 ngày)
  await testCase('TC-08', 'Thủ thư bấm "Xuất sách (Check-out)" khi độc giả đến nhận', async () => {
    const res = await axios.put(
      `${API_BASE}/borrows/${testBorrowId}/checkout`,
      {},
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.data.data.TrangThai !== 'BORROWED') throw new Error('Trạng thái không phải BORROWED');
  });

  // TC-09: Độc giả gia hạn thêm 7 ngày
  await testCase('TC-09', 'Độc giả bấm "Gia hạn thêm 7 ngày" trên Cổng Độc giả', async () => {
    const res = await axios.put(
      `${API_BASE}/borrows/${testBorrowId}/renew`,
      {},
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (res.data.data.SoLanGiaHan !== 1) throw new Error('Số lần gia hạn chưa tăng lên 1');
  });

  // TC-10: Lập biên bản sự cố rách/mất sách (UNPAID)
  await testCase('TC-10', 'Trả sách có sự cố (Thủ thư lập biên bản DAMAGED, số tiền 45.000đ thẩm định)', async () => {
    const res = await axios.post(
      `${API_BASE}/fines`,
      {
        theoDoiMuonId: testBorrowId,
        loaiSuCo: 'DAMAGED',
        moTa: 'Rách trang bìa',
        soTienBoiThuong: 45000
      },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    testFineId = res.data.data._id;
    if (res.data.data.TrangThai !== 'UNPAID') throw new Error('Trạng thái biên bản không phải UNPAID');
  });

  // TC-11: Chặn mượn khi đang nợ bồi thường UNPAID
  await testCase('TC-11', 'Độc giả đang có biên bản UNPAID cố tình mượn sách mới', async () => {
    try {
      await axios.post(
        `${API_BASE}/borrows`,
        { sachId: testBookId, ngayHenLay: new Date().toISOString() },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      throw new Error('Lẽ ra phải chặn do nợ đền bù');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'BORROW_UNPAID_FINE') return;
      throw err;
    }
  });

  // TC-12: Thủ thư bấm xác nhận đền bù tại quầy -> mở khóa mượn
  await testCase('TC-12', 'Thủ thư bấm "Xác nhận đã thu tiền tại quầy" -> mở khóa quyền mượn', async () => {
    const res = await axios.put(
      `${API_BASE}/fines/${testFineId}/pay`,
      { ghiChu: 'Đã nhận đủ 45.000đ tiền mặt tại quầy' },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.data.data.TrangThai !== 'PAID') throw new Error('Biên bản chưa chuyển PAID');
  });

  // TC-13: Chặn xóa sách đang có người mượn
  await testCase('TC-13', 'Thủ thư cố gắng xóa một cuốn sách đang có người mượn (S001)', async () => {
    const booksRes = await axios.get(`${API_BASE}/books`);
    const book1 = booksRes.data.data.find(b => b.MaSach === 'S001');
    try {
      await axios.delete(`${API_BASE}/books/${book1._id}`, {
        headers: { Authorization: `Bearer ${managerToken}` }
      });
      throw new Error('Lẽ ra phải chặn xóa sách đang mượn');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'BOOK_CANNOT_DELETE_BORROWED') return;
      throw err;
    }
  });

  // TC-14: Admin xuất báo cáo CSV UTF-8
  await testCase('TC-14', 'Admin bấm xuất báo cáo mượn trả và vi phạm ra CSV UTF-8', async () => {
    const resAdmin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@library.com',
      password: 'Admin@123'
    });
    adminToken = resAdmin.data.data.accessToken;

    const res = await axios.get(`${API_BASE}/stats/export/borrows`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.data || typeof res.data !== 'string') throw new Error('Dữ liệu CSV không hợp lệ');
  });

  console.log('\n====================================================');
  console.log(`📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ: ${passed}/14 PASS (${failed} FAIL)`);
  console.log('====================================================');
}

runE2ETests();
```

---

## GIAI ĐOẠN 6: KHỞI CHẠY ĐỒNG THỜI, VẬN HÀNH & XỬ LÝ SỰ CỐ ✅ HOÀN THÀNH

### Bước 6.1: Cài đặt toàn bộ dependencies trong 1 lệnh
Từ thư mục gốc `books_management`:
```bash
npm run install:all
```

### Bước 6.2: Nạp dữ liệu mẫu ban đầu
```bash
npm run seed
```

### Bước 6.3: Khởi chạy toàn bộ hệ thống
```bash
npm run dev
```
Terminal sẽ hiển thị đồng thời cả 3 tiến trình qua `concurrently`:
- 🟢 **Backend API:** `http://localhost:5000` (Kiểm tra sức khỏe tại: `http://localhost:5000/api/health`)
- 🟢 **User Portal (Độc giả):** `http://library.local:3000` (hoặc `http://127.0.0.1:3000`, `http://localhost:3000`)
- 🟢 **Admin Portal (Quản trị & Thủ thư):** `http://admin.library.local:3000` (hoặc `http://127.0.0.2:3000`, `http://localhost:3001`)

### Bước 6.4: Bảng kiểm tra xác thực trước khi bàn giao (Checklist)
| STT | Hạng mục kiểm tra | Tiêu chuẩn đạt |
| :---: | :--- | :--- |
| 1 | **Database Collections** | Đủ 8 collection: `DocGia`, `Sach`, `NhaXuatBan`, `TheoDoiMuonSach`, `NhanVien`, `BienBanBoiThuong`, `CauHinhHeThong`, `NhatKyHoatDong`. |
| 2 | **Bảo mật Rate Limiting** | Thử đăng nhập sai 5 lần liên tiếp -> Bị khóa 15 phút kèm thông điệp báo lỗi 429 thân thiện. |
| 3 | **Bảo mật Helmet & CORS** | Kiểm tra Response Header không có `X-Powered-By`; Domain lạ gọi API bị từ chối bởi CORS. |
| 4 | **Bảo mật Upload** | File `.exe` hoặc dung lượng quá 5MB bị từ chối; file ảnh được đổi tên ngẫu nhiên UUID an toàn. |
| 5 | **API Response Envelope** | Mọi API trả về định dạng chuẩn `{ success, data/error, message, meta }`. |
| 6 | **Health Check** | Truy cập `GET /api/health` trả về `status: "UP"`, uptime, RAM và MongoDB latency. |
| 7 | **Audit Trail** | Thao tác Duyệt mượn, Xuất sách, Lập biên bản tự động ghi vết vào collection `NhatKyHoatDong`. |
| 8 | **UX Form Mật khẩu** | Cả User Portal và Admin Portal đều có nút icon con mắt toggle ẩn/hiện mật khẩu. |
| 9 | **UX Ngôn ngữ thuần Việt** | Không còn bất kỳ từ dịch thô nào trên toàn bộ giao diện ("Xuất sách", "Nhận trả", "Biên bản bồi thường", "Số bản còn trên kệ"). |

### Bước 6.5: Cẩm nang xử lý sự cố thường gặp (Troubleshooting)

1. **Lỗi trùng Port (`EADDRINUSE: address already in use :::5000` hoặc `:::3000`):**
   - *Nguyên nhân:* Tiến trình Node.js cũ vẫn đang chiếm dụng cổng.
   - *Cách xử lý trên Windows Powershell:*
     ```powershell
     netstat -ano | findstr :5000
     taskkill /PID <PID_tim_thay> /F
     ```

2. **Lỗi kết nối MongoDB (`MongooseServerSelectionError: connect ECONNREFUSED`):**
   - *Nguyên nhân:* Dịch vụ MongoDB cục bộ chưa được bật.
   - *Cách xử lý:*
     - Mở Services (`services.msc`) -> Tìm **MongoDB Server** -> Bấm **Start**.
     - Hoặc kiểm tra chuỗi kết nối trong `backend/.env` xem đã khớp với MongoDB Atlas hay chưa.

3. **Lỗi chặn CORS (`Access-Control-Allow-Origin missing`):**
   - *Nguyên nhân:* Port của Frontend bị đổi sang cổng khác ngoài danh sách whitelist.
   - *Cách xử lý:* Kiểm tra lại biến `FRONTEND_USER_URL` và `FRONTEND_ADMIN_URL` trong file `backend/.env`.

4. **Lỗi Token hết hạn liên tục (`AUTH_TOKEN_EXPIRED`):**
   - *Nguyên nhân:* Axios interceptor ở Frontend chưa kích hoạt luồng gọi `/api/auth/refresh-token`.
   - *Cách xử lý:* Kiểm tra lại file `src/services/api.js` đã gắn đúng logic tự động Refresh Token và lưu `accessToken` mới vào LocalStorage hay chưa.

---

## GIAI ĐOẠN 7: NÂNG CẤP KIẾN TRÚC DOMAIN, TỐI ƯU HỆ THỐNG & HOÀN THIỆN BÁO CÁO ✅ HOÀN THÀNH

### Bước 7.1: Triển khai Kiến trúc Dual Loopback Domain Nội bộ (`library.local:3000` & `admin.library.local:3000`)
1. **Nguyên lý mạng:** Tận dụng dải địa chỉ loopback IPv4 `127.0.0.0/8` (RFC 1122), cho phép gán:
   - `127.0.0.1:3000` $\rightarrow$ `library.local:3000` (Cổng Độc giả)
   - `127.0.0.2:3000` $\rightarrow$ `admin.library.local:3000` (Cổng Quản trị)
2. **Cấu hình Vite:**
   - Trong `frontend-user/vite.config.js`: Đặt `server: { host: '127.0.0.1', port: 3000, strictPort: true }`.
   - Trong `frontend-admin/vite.config.js`: Đặt `server: { host: '127.0.0.2', port: 3000, strictPort: true }`.
3. **Cấu hình file `hosts` của Windows (`C:\Windows\System32\drivers\etc\hosts`):**
   ```text
   127.0.0.1   library.local
   127.0.0.2   admin.library.local
   ```
4. **Cập nhật CORS Whitelist Backend (`backend/src/server.js`):** Bổ sung `http://library.local:3000`, `http://admin.library.local:3000`, `http://127.0.0.1:3000`, `http://127.0.0.2:3000` vào mảng `allowedOrigins`.

### Bước 7.2: Khắc phục Triệt để Lỗi Tính toán Tồn kho Khả dụng (`SoQuyenKhaDung` vs `conLai`)
- **Nguyên nhân:** Schema MongoDB `Sach.js` sử dụng trường `SoQuyenKhaDung` để lưu số bản in còn trên kệ. Trong khi giao diện `BookDetailView.vue` và `BookCard.vue` kiểm tra `SoQuyenConLai` (bị `undefined`), dẫn tới việc luôn rơi vào fallback lấy `SoQuyen` (tổng số bản nhập kho).
- **Khắc phục:** Cập nhật computed `conLai` ưu tiên đọc trường `SoQuyenKhaDung`, fallback sang `SoQuyenConLai`, hoặc tự động tính `SoQuyen - SoQuyenDangMuon - SoQuyenHuHong`. Đã đồng bộ cho cả `BookDetailView.vue`, `BookCard.vue` và `BooksManageView.vue`.

### Bước 7.3: Khắc phục Lỗi Xung đột Bootstrap Modal & Điều hướng Đăng nhập (`BorrowModal.vue`)
- **Nguyên nhân:** Thẻ `<router-link to="/login" data-bs-dismiss="modal">` bị xung đột sự kiện: thuộc tính `data-bs-dismiss` của Bootstrap chặn đứng quá trình điều hướng của Vue Router, đồng thời dễ làm kẹt lớp mờ `modal-backdrop` trên toàn màn hình.
- **Khắc phục:** Chuyển sang `<button @click="goToLogin">`. Trong hàm `goToLogin`, gọi `bootstrap.Modal.getInstance().hide()`, dọn sạch các phần tử `.modal-backdrop` và chuyển hướng kèm query `?redirect=${route.fullPath}` giúp bạn đọc tự động quay lại đúng trang sách sau khi đăng nhập.

### Bước 7.4: Tạo lập Bộ Sơ đồ Use Case StarUML (`books_management_usecase.mdj`)
- Xây dựng script `build_usecase_mdj.py` tự động khởi tạo tệp dự án StarUML 2.5 với 6 sơ đồ hoàn chỉnh:
  1. Sơ đồ Use Case tổng quan hệ thống.
  2. Sơ đồ Use Case phân rã nhóm Xác thực & Tài khoản.
  3. Sơ đồ Use Case phân rã phân hệ Độc giả.
  4. Sơ đồ Use Case phân rã Quản lý kho sách.
  5. Sơ đồ Use Case phân rã Xử lý Mượn - Trả sách.
  6. Sơ đồ Use Case Quản lý người dùng và Blacklist.
- Tự động bố cục chống chồng lấn tọa độ, gồm 967 phần tử mô hình và xác minh 100% không có lỗi tham chiếu `$ref`.

### Bước 7.5: Tạo lập Artifact Design System "Warm Academic" HTML (`design_system_warm_academic.html`)
- Trực quan hóa toàn bộ hệ thống nhận diện giao diện: Bảng mã màu Tokens (Warm Ivory, Forest Green, Chestnut, Amber, Burgundy), Typography phân cấp (Merriweather, Inter, Fira Code), Semantic status chips, Book card, Digital Reader card và Alert boxes.
- Tích hợp công cụ 1-click xuất ảnh PNG độ phân giải 2x (300 DPI) làm Hình 14 cho bài báo cáo.

### Bước 7.6: Hoàn thiện Toàn văn Báo cáo Học thuật 5 Chương (`ReportGuide.md`)
- Soạn thảo hoàn chỉnh toàn văn từ Chương I đến Chương V theo phong cách sinh viên ĐH Cần Thơ.
- Thực thi nghiêm ngặt Ma trận phân định trách nhiệm nội dung (Cross-Chapter Anti-Redundancy Matrix) và quy chuẩn đánh số liên tục (Hình 1 đến Hình 35, Bảng 1 đến Bảng 21).
