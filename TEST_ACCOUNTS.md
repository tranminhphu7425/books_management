# DANH SÁCH TÀI KHOẢN KIỂM THỬ HỆ THỐNG (TEST ACCOUNTS)

Tài liệu này tổng hợp toàn bộ các tài khoản thử nghiệm phục vụ kiểm thử hai phân hệ độc lập:
* **Cổng Quản trị & Thủ thư (Admin Portal):** [http://admin.library.local:3000](http://admin.library.local:3000) (hoặc `http://127.0.0.2:3000`, `http://localhost:3001`)
* **Cổng Độc giả (User Portal):** [http://library.local:3000](http://library.local:3000) (hoặc `http://127.0.0.1:3000`, `http://localhost:3000`)
* **Máy chủ Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 1. PHÂN HỆ QUẢN TRỊ & THỦ THƯ (ADMIN PORTAL)

> **Lưu ý bảo mật:** Tài khoản Độc giả (`USER`) sẽ bị hệ thống **từ chối ngay lập tức** nếu cố tình đăng nhập vào Cổng Quản trị.

| Mã NV | Họ và Tên | Email Đăng Nhập | Mật Khẩu | Vai Trò (Role) | Quyền Hạn & Mục Đích Kiểm Thử |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **NV001** | Quản Trị Viên Hệ Thống | `admin@library.com` | `Admin@123` | **`ADMIN`** | **Toàn quyền Quản trị Tối cao:**<br>- Quản lý kho sách, xóa NXB.<br>- Quản lý tài khoản, phân quyền (`/users`).<br>- Cấu hình quy chế mượn (`/settings`).<br>- Tra cứu Audit Logs (`/audit-logs`).<br>- Xuất báo cáo CSV toàn hệ thống. |
| **NV002** | Thủ Thư Trưởng | `manager@library.com` | `Manager@123` | **`BOOK_MANAGER`** | **Chuyên trách Kho sách & Tác nghiệp:**<br>- Nhập sách, cập nhật số lượng, kệ sách.<br>- Duyệt yêu cầu mượn, xuất sách (Check-out).<br>- Nhận trả (Check-in), lập biên bản bồi thường.<br>- *Bị chặn:* Không vào được `/users`, `/settings`, `/audit-logs`. |
| **NV005** | Phú Trần Minh | `admin1@library.com` | `Admin@123` *(hoặc pass lúc tạo)* | **`BOOK_MANAGER`** | Tài khoản Thủ thư tạo thêm từ giao diện Admin để test phân quyền nhân sự. |

---

## 2. PHÂN HỆ ĐỘC GIẢ (USER PORTAL)

> **Lưu ý:** Độc giả dùng Email hoặc Số điện thoại để đăng nhập.

| Mã Độc Giả | Họ và Tên | Email Đăng Nhập | Số Điện Thoại | Mật Khẩu | Trạng Thái | Kịch Bản Kiểm Thử Phù Hợp |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **DG001** | Trần Văn Độc Giả | `reader1@gmail.com` | `0913456789` | `User@123` | 🟢 Hoạt động (`ACTIVE`) | **Test mượn trả & gia hạn:**<br>- Đang có sẵn 1 đơn mượn mẫu.<br>- Test tính năng gia hạn thêm 7 ngày (`/my-borrows`).<br>- Test gửi đơn mượn sách mới. |
| **DG002** | Lê Thị Mai | `reader2@gmail.com` | `0914567890` | `User@123` | 🟢 Hoạt động (`ACTIVE`) | **Test tài khoản sạch:**<br>- Chưa có đơn mượn nào.<br>- Test luồng mượn sách từ đầu đến cuối.<br>- Test đạt giới hạn tối đa 3 cuốn sách. |
| **DG003** | Trần Minh Phú | `tranminhphu7.4.2005@gmail.com` | `0818768940` | `User@123` | 🟢 Hoạt động (`ACTIVE`) | Tài khoản đăng ký thực tế / Google OAuth. |
| **DG005** | Tran Minh Phu | `phub2306573@student.ctu.edu.vn` | — | `User@123` | 🔴 **BỊ KHÓA (`BLACKLISTED`)** | **Test chặn mượn tự động:**<br>- Đăng nhập kiểm tra cảnh báo khóa thẻ.<br>- Bấm đăng ký mượn sách ➔ Kiểm tra hệ thống từ chối do vi phạm Blacklist. |

---

## 3. MA TRẬN KỊCH BẢN KIỂM THỬ NHANH (QUICK TEST MATRIX)

### Kịch bản 1: Kiểm tra Phân quyền RBAC Cổng Quản Trị
1. Đăng nhập bằng `manager@library.com` (`BOOK_MANAGER`):
   * Vào được: Trang chủ `/`, Quản lý kho `/books`, Hàng đợi `/borrows`, Nhận trả `/returns`, Bồi thường `/fines`.
   * Thử gõ URL `/users` hoặc `/audit-logs` ➔ Hệ thống hiện cảnh báo và tự động đẩy về Dashboard.
2. Đăng xuất và đăng nhập bằng `admin@library.com` (`ADMIN`):
   * Sidebar xuất hiện thêm các menu: **Quản lý tài khoản**, **Cấu hình quy chế**, **Nhật ký kiểm toán**.

### Kịch bản 2: Kiểm tra Luồng Mượn - Duyệt - Xuất - Trả sách
1. Đăng nhập Cổng Độc giả bằng `reader2@gmail.com`:
   * Chọn cuốn sách còn sẵn ➔ Bấm **Đăng ký mượn**. Đơn chuyển sang trạng thái `PENDING`.
2. Mở tab Cổng Quản trị bằng `manager@library.com`:
   * Vào **Hàng đợi duyệt mượn** (`/borrows`) ➔ Bấm **Duyệt yêu cầu** (giữ sách 48h).
   * Chuyển sang tab **Chờ xuất sách** ➔ Bấm **Xuất sách cho bạn đọc** (Check-out 14 ngày).
3. Độc giả F5 lại trang **Sách của tôi** (`/my-borrows`) ➔ Trạng thái chuyển thành `Đang mượn đọc` với đồng hồ đếm ngược ngày trả.
4. Thủ thư vào **Nhận trả sách** (`/returns`) ➔ Nhập mã hoặc chọn độc giả ➔ Bấm **Nhận trả bình thường** ➔ Sách được hoàn kho `+1` khả dụng.

### Kịch bản 3: Kiểm tra Khóa thẻ Blacklist
1. Đăng nhập bằng `phub2306573@student.ctu.edu.vn` (`DG005`):
   * Mở xem chi tiết bất kỳ cuốn sách nào ➔ Bấm **Đăng ký mượn**.
   * Hệ thống hiển thị thông báo lỗi `403 Forbidden` chặn mượn do tài khoản đang nằm trong Danh sách đen.
