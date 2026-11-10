# Hệ Thống Quản Lý Sách và Mượn Trả Trực Tuyến (Books Management System)

> **Đồ án môn học / Dự án:** Xây dựng Hệ thống Quản lý Sách và Mượn trả Trực tuyến  
> **Kiến trúc:** Monorepo (2 Cổng Frontend Vue 3 + 1 Máy chủ Backend RESTful API)  
> **Công nghệ:** Node.js, Express.js, MongoDB Atlas, Cloudinary, Vue 3, Vite, Pinia, Bootstrap 5, JWT & Google OAuth 2.0  
> **Mô hình triển khai:** Vercel (Frontends) + Render (Backend API) + MongoDB Atlas (Database Cluster) + Cloudinary (Media Storage)

---

## 1. Tổng quan Kiến trúc Hệ thống

Dự án được xây dựng theo mô hình **Monorepo** với 3 phân hệ hoạt động độc lập trên các cổng localhost mặc định:

| Phân hệ | Cổng Localhost | Công nghệ chính | Mục đích sử dụng |
| :--- | :---: | :--- | :--- |
| **User Portal** (Cổng Độc giả) | `http://localhost:3000` | Vue 3, Vite, Pinia, Bootstrap 5 | Bạn đọc tra cứu sách, đăng ký mượn, gia hạn và quản lý thông tin cá nhân. |
| **Admin Portal** (Cổng Quản trị & Thủ thư) | `http://localhost:3001` | Vue 3, Vite, Pinia, Chart.js | Thủ thư & Admin quản lý kho sách, duyệt mượn, nhận trả, bồi thường, phân quyền. |
| **Backend API** (Máy chủ Ứng dụng) | `http://localhost:5000` | Node.js, Express.js, MongoDB, JWT | Cung cấp RESTful API tập trung, xác thực bảo mật, xử lý giao dịch dữ liệu. |

---

## 2. Các Tính Năng Nổi Bật

### 2.1. Phân hệ Độc giả (User Portal - Port 3000)
- **Đăng ký & Đăng nhập linh hoạt:** Đăng ký tài khoản độc giả với kiểm soát độ tuổi tự động (chặn ngày sinh trong tương lai, yêu cầu bắt buộc từ đủ 18 tuổi trở lên), đăng nhập truyền thống (Email/SĐT + Mật khẩu mã hóa bcrypt) và đăng nhập 1 chạm qua Google OAuth 2.0.
- **Tra cứu sách chuyên sâu:** Tìm kiếm sách tiếng Việt không dấu (Accent-insensitive), lọc theo thể loại, NXB, sắp xếp giá/tên, phân trang mượt mà.
- **Quy trình mượn sách trực tuyến:** Đăng ký mượn sách tức thời, hiển thị trạng thái mượn (Chờ duyệt, Đang mượn, Đã trả, Quá hạn), tính năng gia hạn sách 1 lần thêm 7 ngày.
- **Quản lý bồi hoàn & Lịch sử cá nhân:** Tra cứu biên bản sách hỏng/mất và số tiền cần nộp bồi thường minh bạch.

### 2.2. Phân hệ Quản trị & Thủ thư (Admin Portal - Port 3001)
- **Phân quyền vai trò RBAC chặt chẽ:** Phân tách rõ ràng giữa Quản trị viên tối cao (`ADMIN`) và Thủ thư chuyên trách kho (`BOOK_MANAGER`).
- **Quản lý Kho sách & NXB:** Thêm mới, chỉnh sửa, xóa mềm (Soft Delete), quản lý số lượng tồn và bản khả dụng, tải lên ảnh bìa sách và ảnh đại diện độc giả trực tiếp lên Cloudinary (tự động nén WebP, crop theo tỷ lệ chuẩn).
- **Quy trình Mượn - Trả chuẩn thư viện:** Duyệt yêu cầu mượn (giữ sách 48h), xuất sách (Check-out 14 ngày), nhận trả (Check-in hoàn kho) và lập biên bản sự cố.
- **Quản lý Người dùng & Blacklist:** Khóa thẻ độc giả vi phạm quy chế, mở khóa khi hoàn tất bồi thường, phân quyền nhân sự.
- **Báo cáo Thống kê & Audit Logs:** Biểu đồ xu hướng mượn sách, xuất báo cáo CSV, tra cứu nhật ký kiểm toán hệ thống.

---

## 3. Cài Đặt và Khởi Chạy Dự Án

### Yêu cầu tiên quyết:
- **Node.js:** Phiên bản `>= 18.x` hoặc `20.x LTS`
- **npm:** Phiên bản `>= 9.x`
- **MongoDB:** MongoDB Community Server 7.x+ chạy tại `mongodb://localhost:27017` hoặc cụm MongoDB Atlas đám mây.

### Bước 1: Cài đặt Dependencies cho toàn bộ Monorepo
Từ thư mục gốc dự án, thực thi lệnh cài đặt tự động cho Root, Backend và 2 Frontend:
```bash
npm run install:all
```

### Bước 2: Cấu hình Biến môi trường
Sao chép các tệp `.env.example` thành `.env` tại từng phân hệ:
- **Backend:** `cp backend/.env.example backend/.env` *(Điền đầy đủ `MONGODB_URI`, `JWT_SECRET`, và cấu hình `CLOUDINARY_*`)*
- **Frontend User:** `cp frontend-user/.env.example frontend-user/.env`
- **Frontend Admin:** `cp frontend-admin/.env.example frontend-admin/.env`

### Bước 3: Nạp dữ liệu mẫu ban đầu (Seed Data)
```bash
npm run seed
```

### Bước 4: Khởi chạy đồng thời 3 dịch vụ
Chỉ với 1 câu lệnh duy nhất tại thư mục gốc:
```bash
npm run dev
```

Hệ thống sẽ đồng thời khởi chạy:
- Backend API tại: `http://localhost:5000`
- Cổng Độc giả tại: `http://localhost:3000`
- Cổng Quản trị tại: `http://localhost:3001`

---

## 4. Tài Khoản Kiểm Thử Hệ Thống

| Phân hệ | Tài khoản | Mật khẩu | Quyền hạn (Role) |
| :--- | :--- | :--- | :--- |
| **Admin Portal** | `admin@library.com` | `Admin@123` | **`ADMIN`** (Toàn quyền quản trị) |
| **Admin Portal** | `manager@library.com` | `Manager@123` | **`BOOK_MANAGER`** (Thủ thư kho sách) |
| **User Portal** | `reader1@gmail.com` | `User@123` | **`USER`** (Độc giả có sẵn đơn mượn) |
| **User Portal** | `reader2@gmail.com` | `User@123` | **`USER`** (Độc giả mới) |

---

## 5. Cấu Trúc Thư Mục Dự Án

```text
books_management/
├── backend/                  # Máy chủ Node.js & Express RESTful API
│   ├── src/
│   │   ├── config/           # Cấu hình Database, JWT, OAuth, Logger
│   │   ├── controllers/      # Bộ điều phối xử lý logic nghiệp vụ
│   │   ├── middlewares/      # Bảo mật, Auth, Role, Upload, Rate Limiting
│   │   ├── models/           # 8 Schema Mongoose ODM
│   │   ├── routes/           # Định tuyến API endpoints
│   │   ├── scripts/          # Script Seed data & E2E Testing
│   │   └── server.js         # Entrypoint server với Graceful Shutdown
│   └── uploads/              # Thư mục lưu trữ ảnh tải lên
├── frontend-user/            # Cổng Độc giả (Vue 3 + Vite, Port 3000)
│   └── src/
│       ├── components/       # UI Components dùng chung (Navbar, BookCard,...)
│       ├── stores/           # Pinia Stores (auth, books, borrows)
│       └── views/            # Các trang giao diện độc giả
├── frontend-admin/           # Cổng Quản trị (Vue 3 + Vite, Port 3001)
│   └── src/
│       ├── components/       # Header, Sidebar, Modals tác nghiệp
│       ├── stores/           # Pinia Stores quản trị
│       └── views/            # Các trang nghiệp vụ thủ thư & quản trị
├── DATABASE_SCHEMA.sql       # Lược đồ cơ sở dữ liệu mẫu
├── package.json              # Điều phối Monorepo (concurrently)
├── README.md                 # Tài liệu hướng dẫn dự án
└── .gitignore                # Quy tắc loại trừ tệp Git
```

---

## 6. Triển Khai Đám Mây (Cloud Deployment)

- **Frontend Hosting:** Vercel (Hỗ trợ cấu hình `vercel.json` SPA URL rewrite).
- **Backend Service:** Render Web Service (Chạy container Node.js với Health Check `/api/health`).
- **Database Service:** MongoDB Atlas M0 Cluster (Singapore `ap-southeast-1`, bảo mật IP Whitelist và TLS 1.3).
- **Media Cloud Storage:** Cloudinary (Lưu trữ và phân phối CDN cho ảnh bìa sách và avatar người dùng, giải quyết triệt để vấn đề mất file trên môi trường máy chủ tạm thời Ephemeral Filesystem của Render).
