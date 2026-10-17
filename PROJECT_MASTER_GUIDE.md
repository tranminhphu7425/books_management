# TÀI LIỆU ĐẶC TẢ VÀ THIẾT KẾ DỰ ÁN HỆ THỐNG QUẢN LÝ SÁCH (PROJECT MASTER GUIDE)

> **Dự án:** Hệ thống Quản Lý Sách (Library / Book Management System)  
> **Kiến trúc:** Monorepo gồm 2 cổng giao diện độc lập (User Portal & Admin Portal) + Backend RESTful API  
> **Công nghệ chủ đạo:** Vue 3 (Bootstrap 5) + Express.js (Node.js) + MongoDB (Truy vấn thuần/Native Queries) + JWT & Google OAuth 2.0  
> **Cập nhật lần cuối:** 2026-10-10 (Phân tách độc lập 2 hàm xử lý đăng nhập readerLogin & adminLogin, chống đăng nhập chéo tài khoản giữa User Portal và Admin Portal, cập nhật tài liệu API và ca kiểm thử)

---

## 1. TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW)

Hệ thống quản lý sách được xây dựng theo mô hình **Monorepo** với 3 thành phần chạy độc lập trên 3 cổng/địa chỉ riêng biệt:

1. **User Portal (Cổng Độc giả):**
   - **Tên miền nội bộ:** `http://library.local:3000` (Lắng nghe tại IP `127.0.0.1:3000`, fallback `http://localhost:3000`).
   - **Mục tiêu:** Trải nghiệm đọc giả trực quan, tinh gọn, thân thiện trên cả PC và di động.
   - **Chức năng chính:** Tra cứu sách khả dụng, đăng ký mượn, theo dõi hạn trả, lịch sử mượn và biên bản bồi thường cá nhân.

2. **Admin Portal (Cổng Quản trị & Thủ thư):**
   - **Tên miền nội bộ:** `http://admin.library.local:3000` (Lắng nghe tại IP `127.0.0.2:3000`, fallback `http://localhost:3001`).
   - **Mục tiêu:** Tối ưu hóa tác nghiệp hàng ngày cho thủ thư và ban quản trị.
   - **Chức năng chính:** Kiểm kê kho sách, duyệt yêu cầu mượn, xuất sách (check-out), nhận trả sách (check-in), lập biên bản sách hư/mất, quản lý Blacklist và bảng điều khiển thống kê.

3. **Backend API Server:**
   - **Port:** `5000` (hoặc `http://localhost:5000`, domain `api.library.local`).
   - **Nhiệm vụ:** Cung cấp toàn bộ RESTful API tập trung, xử lý xác thực (JWT + Google OAuth 2.0), quản lý phiên, thực thi ràng buộc mượn sách và tương tác cơ sở dữ liệu MongoDB.

### 1.1. Kiến Trúc Dual Loopback IP & Đồng Bộ Cùng Port 3000
Hệ thống tận dụng dải mạng loopback `127.0.0.0/8` (RFC 1122) của hệ điều hành:
- `127.0.0.1:3000` dành cho User Portal (`library.local:3000`)
- `127.0.0.2:3000` dành cho Admin Portal (`admin.library.local:3000`)
Cả hai cổng cùng chạy song song trên cổng `3000` mà không hề xảy ra xung đột socket (`EADDRINUSE`), đồng thời phân tách độc lập 100% cookie và LocalStorage giữa bạn đọc và thủ thư.

**Cấu hình trong file `C:\Windows\System32\drivers\etc\hosts`:**
```text
127.0.0.1   library.local
127.0.0.2   admin.library.local
```

---

## 2. PHÂN QUYỀN VÀ BẢO MẬT HỆ THỐNG (RBAC & SECURITY HARDENING)

### 2.1. Phân quyền Người dùng theo Vai trò (Role-Based Access Control - RBAC)

Hệ thống phân tách quyền hạn thành 3 vai trò rõ ràng:

| Vai trò (Role) | Cổng truy cập | Quyền hạn chi tiết |
| :--- | :--- | :--- |
| **`ADMIN`** (Quản trị viên) | Admin Portal | - Toàn quyền cấu hình hệ thống (hạn mức mượn, thời gian mượn, tiền phạt).<br>- Quản lý tài khoản người dùng và phân quyền nhân viên (`BOOK_MANAGER`).<br>- Quản lý kho sách (thêm/sửa/xóa, phân loại).<br>- Xử lý duyệt mượn, xác nhận xuất sách, nhận trả sách.<br>- Lập biên bản sách rách/mất, xác nhận hoàn thành đền bù, quản lý Blacklist.<br>- Xem báo cáo thống kê chuyên sâu toàn hệ thống và nhật ký truy vết tác nghiệp (Audit Logs). |
| **`BOOK_MANAGER`** (Thủ thư / Quản lý sách) | Admin Portal | - **Chỉ chuyên trách quản lý kho sách:** Thêm, sửa thông tin sách, cập nhật số lượng, thể loại, tác giả, vị trí kệ sách.<br>- Xem danh sách mượn sách để nắm tình trạng sách trong kho.<br>- *Không có quyền:* Can thiệp tài khoản độc giả, thay đổi cấu hình quy chế thư viện, xóa tài khoản, phân quyền, xem audit log nhạy cảm. |
| **`USER`** (Độc giả / Bạn đọc) | User Portal | - Xem danh mục sách đang có sẵn trong thư viện (`SoQuyenKhaDung > 0`).<br>- Đăng ký mượn sách trực tuyến (tuân thủ giới hạn mượn).<br>- Theo dõi trạng thái mượn (Chờ duyệt, Đang mượn, Đã trả, Quá hạn).<br>- Xem lịch sử mượn sách cá nhân.<br>- Xem các biên bản sách hư hỏng/mất và số tiền cần bồi hoàn.<br>- *Tuyệt đối không được phép đăng nhập vào Admin Portal (Bị chặn trực tiếp từ backend qua `adminLogin` với mã lỗi HTTP 403 `AUTH_FORBIDDEN`).* |

> 🔒 **Cơ chế Phân Tách Nghiệp Vụ Đăng Nhập Cấp Backend (Dual Isolated Login):**  
> Hệ thống tách biệt hoàn toàn 2 hàm xử lý và 2 endpoint đăng nhập riêng:  
> - **Cổng Độc giả:** Sử dụng endpoint `POST /api/auth/reader/login` (Controller: `readerLogin`). Nếu tài khoản tồn tại trong `NhanVien`, hệ thống từ chối ngay lập tức và trả về mã HTTP 403 kèm thông báo *"Tài khoản quản trị viên / nhân viên không được phép đăng nhập tại Cổng Độc giả. Vui lòng truy cập Cổng Quản Trị."*.  
> - **Cổng Quản trị:** Sử dụng endpoint `POST /api/auth/admin/login` (Controller: `adminLogin`). Nếu tài khoản tồn tại trong `DocGia`, hệ thống từ chối ngay lập tức và trả về mã HTTP 403 kèm thông báo *"Tài khoản độc giả không có thẩm quyền truy cập Cổng Quản Trị & Thủ Thư."*.  
> - Đồng thời vẫn duy trì endpoint `POST /api/auth/login` (Controller: `login`) hỗ trợ tự động điều hướng thông minh để tương thích ngược 100% với các client cũ và kịch bản kiểm thử E2E.

### 2.2. Tăng Cường Bảo Mật Chuyên Sâu (Security Hardening Standard)

Hệ thống thiết lập hàng rào bảo mật đa lớp (Defense-in-depth) tuân thủ tiêu chuẩn an toàn web hiện đại:

1. **Giới hạn tần suất gọi API (Rate Limiting & Anti-Brute Force):**
   - Tích hợp middleware `express-rate-limit` phân tầng theo mức độ nhạy cảm của tài nguyên:
     * **Nhóm Xác thực (`/api/auth/reader/login`, `/api/auth/admin/login`, `/api/auth/login`, `/api/auth/register`):** Giới hạn tối đa **5 lần thử sai trong vòng 15 phút** trên cùng một địa chỉ IP. Khi vượt ngưỡng, hệ thống trả về HTTP `429 Too Many Requests` kèm thông điệp thân thiện: *"Bạn đã thử đăng nhập quá nhiều lần. Vì lý do an toàn, vui lòng thử lại sau 15 phút."*
     * **Nhóm Tạo đơn mượn (`POST /api/borrows`):** Giới hạn tối đa **20 yêu cầu / phút** để ngăn chặn bot tự động chiếm giữ sách.
     * **Toàn bộ API chung:** Giới hạn tối đa **100 yêu cầu / phút / IP** nhằm chống tấn công từ chối dịch vụ (DDoS tầng ứng dụng).
2. **Kiểm soát Nguồn gốc Truy cập (Strict CORS Policy):**
   - Chỉ chấp nhận các yêu cầu HTTP từ các nguồn gốc nằm trong danh sách trắng (Origin Whitelist):
     * Cổng Độc giả: `http://library.local:3000`, `http://127.0.0.1:3000`, `http://localhost:3000`.
     * Cổng Quản trị: `http://admin.library.local:3000`, `http://127.0.0.2:3000`, `http://localhost:3001`.
   - Cấu hình `credentials: true` để cho phép truyền Cookie an toàn, đồng thời tự động từ chối ngay lập tức mọi request xuất phát từ các domain không xác định.
3. **Bảo vệ Tiêu đề HTTP (HTTP Security Headers với Helmet):**
   - Sử dụng thư viện `helmet` với cấu hình an toàn tối đa:
     * `X-Frame-Options: DENY`: Chống tấn công Clickjacking bằng cách cấm hoàn toàn việc nhúng website vào thẻ `<iframe>` từ bên ngoài.
     * `X-Content-Type-Options: nosniff`: Ngăn chặn trình duyệt tự ý đoán định dạng tập tin (MIME-sniffing).
     * `Strict-Transport-Security: max-age=31536000; includeSubDomains`: Ép buộc sử dụng kết nối HTTPS an toàn.
     * `Content-Security-Policy (CSP)`: Hạn chế nguồn nạp script, style, font chỉ từ domain nội bộ và Google Fonts/Bootstrap CDN hợp lệ.
     * **Ẩn dấu vết máy chủ:** Tự động loại bỏ hoàn toàn header `X-Powered-By: Express` để giấu thông tin công nghệ trước các công cụ quét lỗ hổng tự động.
4. **Làm sạch Dữ liệu Đầu vào & Chống Injection (Input Sanitization & Schema Validation):**
   - Bắt buộc kiểm thực kiểu dữ liệu và cấu trúc đầu vào tại tầng Controller/Middleware trước khi đưa vào Database:
     * **Chống NoSQL Injection:** Lọc sạch các toán tử MongoDB nhạy cảm (`$gt`, `$ne`, `$where`, `$regex`) trong query parameters và request body.
     * **Chống XSS (Cross-Site Scripting):** Tự động mã hóa (escape) các ký tự HTML (`<`, `>`, `&`, `"`, `'`) đối với các trường văn bản nhập tự do (như tìm kiếm sách, ghi chú biên bản, lý do từ chối).
5. **Bảo mật Tải lên Tập tin Hình ảnh (File Upload Hardening):**
   - **Giới hạn dung lượng:** Ảnh đại diện Avatar tối đa **2MB**; Ảnh bìa sách tối đa **5MB**.
   - **Kiểm định tệp tin nghiêm ngặt:**
     * Kiểm tra đuôi mở rộng: Chỉ cho phép `.jpg`, `.jpeg`, `.png`, `.webp`.
     * Kiểm tra định dạng thực tế qua Magic Bytes / MIME Type (`image/jpeg`, `image/png`, `image/webp`), chặn đứng các tập tin mã độc giả mạo đuôi ảnh (`shell.php.png`, `malware.exe.jpg`).
   - **Tạo tên tệp ngẫu nhiên và an toàn:** Tự động đổi tên tệp tải lên theo định dạng `Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(...)`, tuyệt đối không dùng tên file gốc của người dùng nhằm ngăn ngừa tấn công leo thang thư mục (Path Traversal `../`).

---

## 3. ĐẶC TẢ TÍNH NĂNG VÀ NGHIỆP VỤ CHI TIẾT

### 3.1. Phân hệ Người Dùng (User Portal - Port 3000)
1. **Xác thực tài khoản & Bảo mật cá nhân:**
   - Đăng ký & Đăng nhập bằng Email + Mật khẩu (mã hóa an toàn bằng `bcrypt`).
   - Đăng ký & Đăng nhập 1 chạm bằng Google qua giao thức **OAuth 2.0 / Google Identity Services** (tự động tạo hồ sơ độc giả với `MaDocGia` tăng dần chuẩn hóa, đồng bộ họ tên và ảnh đại diện).
   - Cấp phát cặp JWT Token: `accessToken` (thời hạn 15 phút) và `refreshToken` (thời hạn 7 ngày).
   - **Đổi mật khẩu an toàn:** Cho phép người dùng tự đổi mật khẩu trong trang Hồ sơ cá nhân (yêu cầu xác thực chính xác mật khẩu hiện tại).
2. **Khám phá & Tìm kiếm sách:**
   - Danh sách sách hiển thị dạng lưới thẻ (Book Cards) hoặc bảng danh sách.
   - Bộ lọc linh hoạt: Theo thể loại, tác giả, trạng thái còn sách (`available_copies > 0`).
   - Ô tìm kiếm tức thì theo tiêu đề, tác giả, mã ISBN.
   - Trang chi tiết sách: Xem ảnh bìa, tóm tắt nội dung, nhà xuất bản, năm phát hành, vị trí kệ sách.
3. **Đăng ký mượn sách & Kiểm tra ràng buộc:**
   - Chọn sách cần mượn và gửi yêu cầu mượn.
   - **Ràng buộc kiểm tra tự động trước khi cho mượn:**
     - 🛑 **Blacklist check:** Nếu tài khoản đang nằm trong Blacklist -> Từ chối lập tức.
     - 🛑 **Hạn mức mượn:** Độc giả chỉ được mượn **tối đa 3 cuốn sách** cùng một lúc (tính cả số sách đang mượn + các đơn đang chờ duyệt).
     - 🛑 **Nợ sách quá hạn:** Có sách nào đang mượn đã quá hạn chưa trả -> Khóa mượn mới.
     - 🛑 **Nợ đền bù:** Đang có biên bản sách rách / mất chưa đền (`UNPAID`) -> Khóa mượn mới.
     - 🛑 **Tồn kho:** Sách phải có `available_copies > 0`.
   - Chọn ngày hẹn đến thư viện nhận sách (`pickup_date`).
4. **Theo dõi mượn trả & Lịch sử cá nhân:**
   - Quản lý các đơn mượn theo trạng thái:
     - `PENDING`: Đang chờ thủ thư duyệt. **(Độc giả có thể bấm nút "Hủy đơn" tại đây nếu đổi ý)**.
     - `APPROVED`: Đã duyệt, chờ bạn đọc đến nhận sách tại quầy trong vòng 48h. *(Không thể tự hủy, cần liên hệ thủ thư nếu không lấy)*.
     - `BORROWED`: Đang cầm sách về đọc (kèm ngày phải trả `due_date`, đếm ngược số ngày).
     - `RETURNED`: Đã trả xong.
     - `CANCELLED` / `EXPIRED`: Đơn đã bị hủy bởi độc giả hoặc hết hạn 48h không đến lấy.
     - `REJECTED`: Bị từ chối (kèm lý do).
   - **Gia hạn sách:** Cho phép độc giả bấm gia hạn **1 lần duy nhất thêm 7 ngày** với điều kiện sách chưa bị quá hạn (`due_date >= ngày hiện tại`).
   - Xem biên bản sách hư hại/mất của bản thân: Số tiền cần bồi hoàn, hướng dẫn đến quầy nộp tiền để được mở lại quyền mượn.

---

### 3.2. Phân hệ Quản Trị & Nhân Viên (Admin Portal - Port 3001)
1. **Quản lý kho sách (Dành cho Admin & Book Manager):**
   - Thêm mới, chỉnh sửa thông tin sách, tải lên ảnh bìa sách.
   - **Tích hợp chọn & thêm nhanh Nhà xuất bản (`PublisherSelect.vue`):** Hỗ trợ tìm kiếm tức thì theo tên/mã/địa chỉ NXB (hỗ trợ tiếng Việt không dấu) và cho phép tạo mới trực tiếp Nhà xuất bản ngay trong modal thêm sách mà không làm gián đoạn việc nhập liệu.
   - **Xóa sách an toàn (Soft Delete):** 
     - Sách khi xóa sẽ chuyển sang trạng thái lưu trữ (`status = 'ARCHIVED'`) để không hiển thị cho độc giả nhưng bảo toàn lịch sử mượn trả trong quá khứ.
     - **Chặn xóa sách đang mượn:** Nếu sách đang có ít nhất 1 bản in được độc giả mượn chưa trả (`borrowedCopies > 0`), hệ thống sẽ từ chối thao tác xóa và hiển thị cảnh báo cụ thể.
   - Quản lý số lượng phân tách rõ ràng:
     - `total_copies`: Tổng số bản sách của thư viện.
     - `available_copies`: Số bản đang nằm trên kệ, sẵn sàng cho mượn.
     - `borrowed_copies`: Số bản đang được độc giả mượn về.
     - `damaged_or_lost_copies`: Số bản đang bị hư hỏng hoặc thất lạc.
   - Quản lý danh mục thể loại (Categories) và tác giả (Authors).
2. **Xử lý yêu cầu mượn sách:**
   - Tiếp nhận danh sách đơn mượn ở trạng thái `PENDING`.
   - Hành động của thủ thư:
     - **Duyệt đơn (Approve):** Đánh dấu chấp thuận, giữ sách cho bạn đọc trong **48 giờ (2 ngày)**. Hệ thống tạo mốc `pickup_deadline`. Quá 48h nếu bạn đọc không đến nhận, đơn sẽ tự động chuyển sang `CANCELLED`/`EXPIRED` và số lượng sách được hoàn trả về kho.
     - **Từ chối (Reject):** Nhập lý do từ chối gửi đến bạn đọc.
     - **Xác nhận xuất sách (Check-out):** Khi bạn đọc đến quầy xuất trình thông tin, thủ thư bấm giao sách. Trạng thái chuyển thành `BORROWED`, ngày mượn tính từ thời điểm này, hạn trả được gán mặc định là **14 ngày**, `available_copies` giảm 1, `borrowed_copies` tăng 1.
3. **Xử lý trả sách (Check-in) & Kiểm tra chất lượng:**
   - Độc giả mang sách tới quầy để trả:
     - **Trường hợp 1 (Sách nguyên vẹn):** Thủ thư chọn "Hoàn trả bình thường", trạng thái chuyển sang `RETURNED`, `available_copies` tăng 1, `borrowed_copies` giảm 1.
     - **Trường hợp 2 (Sách rách trang, hư hại nặng hoặc Mất sách):** Chuyển sang bước lập biên bản bồi thường.
4. **Xử lý mất sách, rách sách & Quy trình bồi thường tại quầy:**
   - Lập biên bản sự cố:
     - Loại sự cố: `DAMAGED` (Rách bìa, vẽ bẩn, ướt nước, mất trang) hoặc `LOST` (Mất hẳn cuốn sách).
     - Ghi nhận chi tiết mô tả thiệt hại thực tế.
     - **Thẩm định bồi thường:** Thủ thư trực tiếp thẩm định mức độ hư hại thực tế tại quầy và nhập trực tiếp số tiền bồi thường tương ứng vào hệ thống.
     - Trạng thái ban đầu: `UNPAID` (Chưa đền).
   - Tác động lên tài khoản độc giả:
     - Hệ thống lập tức khóa quyền mượn sách mới của độc giả cho đến khi khoản bồi thường này được giải quyết.
   - **Quy trình thu tiền & Xác nhận đền bù tại quầy:**
     - Độc giả nộp tiền mặt hoặc chuyển khoản trực tiếp cho thủ thư tại quầy.
     - Thủ thư/Admin bấm nút **"Xác nhận đã đền bù"** trong hệ thống -> Trạng thái chuyển sang `RESOLVED` / `PAID`.
     - Quyền mượn sách của độc giả được tự động khôi phục (nếu không còn vi phạm khác).
5. **Hệ thống Quản lý Tài khoản & Phân quyền (User & Staff Management):**
   - **Tạo tài khoản linh hoạt:** Admin có quyền tạo mới trực tiếp tài khoản nhân viên / thủ thư (`BOOK_MANAGER`) hoặc độc giả (`USER`).
   - **Chuyển đổi vai trò:** Admin có thể thăng cấp một độc giả sẵn có thành `BOOK_MANAGER` hoặc hạ cấp về `USER`.
   - **Quản lý Blacklist (Danh sách đen):**
     - **Cơ chế tự động đưa vào Blacklist:**
       - Quá hạn trả sách vượt quá **15 ngày** kể từ ngày hết hạn (`due_date`) mà không liên hệ trả sách.
       - Có biên bản làm mất/hư hỏng sách chưa đền bù quá **7 ngày** kể từ ngày lập biên bản.
     - **Cơ chế thủ công:** Admin có quyền thêm bất kỳ tài khoản nào vào Blacklist kèm lý do (ví dụ: gây rối tại thư viện, mượn hộ thẻ,...).
     - **Ràng buộc hiệu lực:** Toàn bộ tài khoản có cờ `is_blacklisted = true` sẽ bị chặn tạo bất kỳ yêu cầu mượn sách nào tại User Portal.
     - **Gỡ khỏi Blacklist:** Admin có nút thao tác gỡ khỏi Blacklist kèm nhật ký ghi chú lý do gỡ.
6. **Bảng điều khiển Thống kê & Xuất báo cáo (Dashboard, Analytics & Export):**
   - Số liệu tổng quan: Tổng đầu sách, tổng số bản sách, số độc giả, số sách đang cho mượn, số lượt mượn trong tháng.
   - Tỷ lệ mượn theo danh mục thể loại (Biểu đồ tròn / thanh).
   - Danh sách Top 10 cuốn sách được mượn nhiều nhất.
   - Thống kê tỷ lệ trả sách đúng hạn vs quá hạn.
   - Thống kê sự cố: Số sách rách/mất trong kỳ, tổng số tiền bồi thường đã thu được và số tiền còn đang nợ.
   - **Xuất báo cáo dữ liệu:** Tích hợp tính năng xuất file **Excel / CSV** cho:
     - Danh sách toàn bộ phiếu mượn - trả theo mốc thời gian.
     - Danh sách sách đang quá hạn cần đôn đốc thu hồi.
     - Danh sách các biên bản vi phạm, sách hỏng/mất và tình trạng đền bù.
7. **Trải nghiệm Tra Cứu Nhanh & Tương Tác Đồng Bộ (Quick Detail Modals & Deep Linking):**
   - Trên toàn bộ các trang quản trị của Admin Portal (`DashboardView`, `BorrowQueueView`, `ReturnsView`, `FinesView`, `BooksManageView`, `UsersManageView`), khi bấm vào tên/mã/ảnh ấn phẩm hoặc tên/mã độc giả:
     - **Modal Chi Tiết Ấn Phẩm (`BookDetailModal.vue`):** Hiển thị đầy đủ thông tin sách (ảnh bìa lớn, nhan đề, mã sách, ISBN, tác giả, nhà xuất bản, năm xuất bản, đơn giá, vị trí kệ kho, mô tả nội dung, số lượng khả dụng/đang mượn/hư hỏng, trạng thái lưu hành). Có nút bấm *"Quản Lý & Chỉnh Sửa Ấn Phẩm Này"* điều hướng ngay sang `/books`, tự động cuộn đến đúng dòng của sách, kích hoạt hiệu ứng phát sáng (pulsating highlight) và tự động mở modal form chỉnh sửa sách.
     - **Modal Chi Tiết Độc Giả / Người Dùng (`UserDetailModal.vue`):** Hiển thị ảnh đại diện avatar/ký tự đầu, họ và tên, mã định danh (`MaDocGia`/`MSNV`), email, số điện thoại, địa chỉ, ngày sinh, giới tính, vai trò quyền hạn, trạng thái tài khoản (`ACTIVE` / `BLACKLISTED` kèm lý do vi phạm và ngày khóa) và ngày tham gia hệ thống. Dành riêng cho Quản trị viên (ADMIN) nút *"Quản Lý & Phân Quyền Người Dùng"* điều hướng sang `/users`, tự động chuyển đúng tab (Độc giả / Nhân sự / Blacklist), cuộn tới dòng tài khoản và kích hoạt hiệu ứng phát sáng nhận diện.

---

## 4. QUY CHUẨN THIẾT KẾ GIAO DIỆN (UI/UX DESIGN SYSTEM)

Dự án áp dụng phong cách thiết kế **"Warm Academic / Modern Library" (Thư viện Hàn lâm Ấm áp & Hiện đại)** kết hợp với hệ thống component của **Bootstrap 5**, mang đến trải nghiệm thẩm mỹ cao cấp, truyền cảm hứng đọc sách nhưng vẫn cực kỳ tối ưu về mặt công năng.

### 4.1. Triết lý & Cảm xúc Thiết kế
- **Ý tưởng cốt lõi:** Lấy cảm hứng từ không gian các thư viện cổ điển phương Tây kết hợp giao diện số hiện đại (tương tự *Apple Books*, *Goodreads Redesign* hay ấn bản của các nhà xuất bản sách nghệ thuật).
- **Cảm xúc mang lại:** Thư thái, trí thức, ấm cúng, gợi cảm hứng đọc sách, không gây mỏi mắt khi tra cứu và đọc tài liệu trong thời gian dài.

### 4.2. Bảng Màu Chuẩn (Color Palette & Tokens)
- **Màu nền chủ đạo (Background):** Màu nền giấy ngà/kem ấm (`#FDFBF7` hoặc `#F9F6F0`) tạo cảm giác như trang sách thật, loại bỏ hoàn toàn độ chói gắt của nền trắng tinh truyền thống.
- **Màu văn bản (Typography Color):** 
  - Màu chữ chính: Màu than đậm ấm (`#2C2825`) giúp độ tương phản đạt chuẩn WCAG mà vẫn dịu mắt.
  - Màu chữ phụ / Meta text: Màu nâu xám ấm (`#5C554E` hoặc `#78716C`).
- **Màu nhấn (Accent & Primary CTA):**
  - Xanh ngọc lục bảo sâu (`#1B4332` hoặc `#2D6A4F`): Màu thương hiệu chính, nút "Mượn sách", nút xác nhận chính.
  - Nâu hạt dẻ ấm (`#6B4226`): Dành cho viền, thanh chia tách, thẻ danh mục.
  - Vàng hổ phách (`#D97706`): Điểm nhấn trạng thái chờ, đánh giá sao, huy hiệu nổi bật.
- **Màu sắc trạng thái (Semantic Status Colors):**
  - Khả dụng / Đã trả (`AVAILABLE`, `RETURNED`): Xanh lá rừng (`#2D6A4F`, badge `.bg-success-subtle`).
  - Đang mượn / Chờ duyệt (`BORROWED`, `PENDING`): Xanh navy dịu (`#1E3A8A`) / Vàng hổ phách (`#D97706`).
  - Quá hạn / Sách hỏng / Mất (`OVERDUE`, `DAMAGED`, `LOST`): Đỏ rượu vang trầm (`#991B1B`, badge `.bg-danger-subtle`).

### 4.3. Nghệ Thuật Chữ (Typography)
- **Tiêu đề (Headings H1-H4, Tên sách, Tên tác giả):** Sử dụng font **Serif** thanh lịch, quý phái (*Merriweather*, *Playfair Display* hoặc *Lora* từ Google Fonts).
- **Nội dung & Dữ liệu (Body, Bảng biểu, Nút bấm, Form):** Sử dụng font **Sans-serif** sắc nét, hiện đại, dễ đọc (*Inter* hoặc *Be Vietnam Pro*).

### 4.4. Quy cách Thẻ Sách (Book Cards) & Kệ Sách Số
- **Đổ bóng (Shadow):** Áp dụng hiệu ứng đổ bóng mềm dạng sách nổi (`box-shadow: 0 8px 24px rgba(0,0,0,0.07)` và chuyển động mượt mà khi hover: `transform: translateY(-4px)`, `box-shadow: 0 14px 32px rgba(0,0,0,0.12)`).
- **Bo góc (Border Radius):** Bo góc nhẹ tinh tế (`rounded-2` / `border-radius: 8px`), viền mờ màu be nhạt (`border border-secondary-subtle`).
- **Tỷ lệ ảnh bìa:** Cố định tỷ lệ khung hình bìa sách chuẩn `2:3` với kỹ thuật `object-fit: cover`, tạo cảm giác các cuốn sách ngay ngắn trên kệ gỗ.

### 4.5. Ứng dụng cho Cổng Quản Trị (Admin Portal - Port 3001)
- Kế thừa tone màu trang nhã chung, kết hợp cấu trúc **Modern SaaS Dashboard**:
  - Bảng dữ liệu (Data table) có đường kẻ mảnh, sọc xen kẽ nhẹ, hỗ trợ tìm kiếm và lọc tức thì.
  - Các nút hành động chính (Duyệt, Xuất sách, Trả sách, Lập biên bản đền bù) to rõ ràng, sử dụng icon từ **Bootstrap Icons**.
  - Các thẻ thống kê (Stats Card) hiển thị số liệu nổi bật, trực quan với các chỉ số phần trăm tăng trưởng.

### 4.6. Quy Chuẩn Ngôn Ngữ Hiển Thị & Trải Nghiệm Văn Bản (UX Writing & Bản Địa Hóa Tiếng Việt Tự Nhiên)

Để mang lại trải nghiệm đọc sách và tác nghiệp chuyên nghiệp, ấm áp và gần gũi, hệ thống **bắt buộc tuân thủ bộ quy chuẩn viết văn bản giao diện (UX Writing Standard)**, loại bỏ triệt để các lỗi dịch thô, máy móc (word-by-word translation) từ tiếng Anh sang tiếng Việt:

#### 1. Bốn nguyên tắc vàng trong diễn đạt ngôn ngữ hệ thống:
1. **Thuần Việt & Tự nhiên (Natural & Idiomatic):**
   - Diễn đạt trôi chảy theo thói quen ngôn ngữ của người Việt, sử dụng thuật ngữ chính xác trong ngành thư viện học và văn hóa đọc Việt Nam.
   - Tránh cấu trúc câu bị động gượng gạo (không dùng: *"Sách được mượn bởi bạn"*, thay bằng: *"Sách bạn đang mượn"*).
   - Loại bỏ các đại từ sở hữu rườm rà thừa thãi (không dùng: *"Đổi mật khẩu tài khoản của bạn"*, thay bằng: *"Đổi mật khẩu"*).
2. **Hướng dẫn hành động rõ ràng (Actionable & Empowering):**
   - Khi có lỗi hoặc từ chối thao tác, không chỉ dừng lại ở việc báo lỗi cộc lốc mà phải chỉ ra rõ ràng: **Nguyên nhân là gì?** và **Bạn đọc/Thủ thư cần làm gì tiếp theo?**
   - *Ví dụ:* Thay vì *"Lỗi: Không được mượn"* ➔ *"Bạn đã đạt giới hạn mượn 3 cuốn sách. Vui lòng hoàn trả bớt sách trước khi đăng ký mượn cuốn mới."*
3. **Thân thiện & Tôn trọng (Empathetic & Courteous):**
   - Giao tiếp nhã nhặn, tôn trọng bạn đọc và nhân viên thư viện; không dùng từ ngữ mang tính chỉ trích, đe dọa hoặc dán nhãn tiêu cực (như *"Người dùng bị phạt"*, *"Kẻ vi phạm"*).
   - *Ví dụ:* Thay vì *"Tài khoản của bạn bị đưa vào danh sách đen"* ➔ *"Tài khoản tạm thời bị khóa quyền mượn sách do quá hạn. Bạn vui lòng liên hệ thủ thư tại quầy để được hướng dẫn mở khóa nhé!"*
4. **Nhất quán thuật ngữ trên toàn hệ thống (System Consistency):**
   - Cùng một khái niệm phải dùng thống nhất 1 từ ngữ xuyên suốt cả 2 cổng User Portal và Admin Portal, tránh tình trạng trang này gọi là *"Bản in"*, trang kia gọi là *"Bản sao"*, trang khác lại gọi là *"Số lượng"*.

#### 2. Bảng đối chiếu & chuẩn hóa thuật ngữ giao diện (UX Microcopy Dictionary):

| Thuật ngữ tiếng Anh gốc | Dịch thô máy móc (❌ TUYỆT ĐỐI TRÁNH) | Văn phong tiếng Việt tự nhiên (✅ BẮT BUỘC DÙNG) | Ngữ cảnh áp dụng thực tế |
| :--- | :--- | :--- | :--- |
| **Check-out (Book)** | Kiểm tra ra / Check-out sách | **Xuất sách cho bạn đọc** / **Giao sách tại quầy** | Thao tác của thủ thư khi trao sách cho bạn đọc |
| **Check-in (Book)** | Kiểm tra vào / Check-in sách | **Nhận trả sách** / **Xác nhận bạn đọc đã trả sách** | Thao tác của thủ thư khi kiểm tra và nhận lại sách |
| **Available copies** | Các bản sao có sẵn / Số lượng có sẵn | **Số bản còn trên kệ** / **Sẵn sàng cho mượn** | Thẻ sách, bảng kiểm kê kho |
| **Borrowed copies** | Các bản sao đang được mượn | **Số bản đang được mượn** / **Đang lưu hành** | Báo cáo kho sách, chi tiết sách |
| **Total copies** | Tổng số bản sao | **Tổng số bản nhập kho** / **Tổng ấn bản** | Thông tin đầu sách trong kho |
| **Damaged / Lost copies**| Bản sao bị hỏng hoặc mất | **Số bản bị hư hại / thất lạc** | Quản lý kho sách và kiểm kê |
| **Borrow limit reached** | Giới hạn mượn đã đạt tới | **Đã đạt giới hạn tối đa 3 cuốn sách** | Thông báo khi bấm đăng ký mượn |
| **Duplicate book request**| Yêu cầu sách trùng lặp | **Bạn đang mượn cuốn sách này rồi, vui lòng chọn đầu sách khác** | Thông báo ràng buộc mượn trùng đầu sách |
| **User is blacklisted** | Người dùng nằm trong danh sách đen | **Tài khoản tạm khóa quyền mượn do vi phạm quy chế** | Huy hiệu trạng thái, thông báo từ chối mượn |
| **Damage / Lost Fine** | Hư hại tiền phạt / Tiền phạt hư hỏng | **Biên bản bồi thường hư hại / mất sách** | Quản lý bồi hoàn tại quầy |
| **Unpaid fine** | Tiền phạt chưa thanh toán | **Biên bản chờ đền bù tại quầy** | Danh sách bồi thường cá nhân & Admin |
| **Paid fine** | Tiền phạt đã thanh toán | **Đã hoàn tất đền bù** | Xác nhận giải tỏa quyền mượn |
| **Pickup deadline** | Hạn chót lấy sách | **Thời hạn nhận sách tại quầy (trong 48 giờ)** | Thông báo sau khi thủ thư duyệt đơn mượn |
| **Due date** | Ngày đáo hạn / Ngày đến hạn | **Hạn trả sách** / **Ngày phải hoàn trả** | Phiếu mượn, email nhắc nhở, lịch sử mượn |
| **Overdue** | Quá hạn / Quá ngày đến hạn | **Đã quá hạn trả sách** | Huy hiệu trạng thái màu đỏ cảnh báo |
| **Renew book** | Gia hạn sách / Đổi mới sách | **Gia hạn thời gian mượn (thêm 7 ngày)** | Nút bấm thao tác trên User Portal |
| **Soft delete book** | Xóa mềm sách | **Đưa vào kho lưu trữ (Ẩn khỏi tìm kiếm)** | Nút xóa sách trong Admin Portal |
| **Cannot delete borrowed**| Không thể xóa sách đang được mượn | **Không thể lưu trữ vì đang có bạn đọc mượn cuốn sách này** | Cảnh báo bảo vệ dữ liệu khi bấm xóa |
| **No results found** | Không có kết quả nào được tìm thấy | **Không tìm thấy cuốn sách nào phù hợp với từ khóa của bạn** | Giao diện tìm kiếm rỗng (Empty State) |
| **Internal server error**| Đã xảy ra lỗi máy chủ nội bộ | **Hệ thống đang bận hoặc gián đoạn kết nối. Vui lòng thử lại sau ít phút** | Thông báo bắt lỗi toàn cục |
| **Show/Hide password** | Chuyển đổi hiện/ẩn mật khẩu | **Hiện mật khẩu** / **Ẩn mật khẩu** | Nút toggle mắt trên các ô nhập liệu |

#### 3. Mẫu câu thông báo chuẩn mực trên giao diện:

- **Thông báo thành công (Success Toast / Alert):**
  - Gửi yêu cầu mượn: *"Đăng ký mượn sách thành công! Yêu cầu của bạn đang được chuyển đến thủ thư để chuẩn bị sách."*
  - Duyệt đơn mượn: *"Đã duyệt yêu cầu mượn sách. Sách sẽ được giữ tại quầy trong vòng 48 giờ để bạn đọc đến nhận."*
  - Xuất sách tại quầy: *"Xuất sách thành công. Thời hạn mượn là 14 ngày (hạn trả: [DD/MM/YYYY])."*
  - Nhận trả sách nguyên vẹn: *"Xác nhận nhận trả sách thành công. Sách đã được hoàn về kệ sẵn sàng cho bạn đọc tiếp theo."*
  - Gia hạn thành công: *"Gia hạn thành công thêm 7 ngày. Hạn trả sách mới của bạn là: [DD/MM/YYYY]."*
  - Đổi mật khẩu: *"Đổi mật khẩu thành công. Vui lòng sử dụng mật khẩu mới cho các lần đăng nhập tiếp theo."*
  - Cập nhật thông tin: *"Cập nhật thông tin cá nhân thành công."*
  - Hoàn tất bồi thường: *"Đã xác nhận thu tiền bồi thường tại quầy. Quyền mượn sách của bạn đọc đã được mở khóa trở lại."*

- **Thông báo nhắc nhở & Hướng dẫn (Informational & Reminders):**
  - Đơn chờ lấy: *"Đơn mượn của bạn đã sẵn sàng tại quầy! Xin vui lòng ghé thư viện nhận sách trước [Giờ - Ngày]."*
  - Nhắc sắp đến hạn trả: *"Cuốn sách '[Tên sách]' của bạn còn 2 ngày nữa là đến hạn trả. Bạn có thể bấm 'Gia hạn' nếu cần thêm thời gian đọc nhé!"*

- **Trạng thái danh sách rỗng (Empty States - Gần gũi, khích lệ):**
  - Giỏ/Đơn mượn chưa có: *"Bạn chưa đăng ký mượn cuốn sách nào. Hãy ghé thăm kệ sách để chọn những cuốn sách yêu thích nhé!"*
  - Lịch sử mượn trống: *"Bạn chưa có lượt mượn sách nào tại thư viện. Hành trình tri thức đang chờ bạn bắt đầu!"*
  - Không có biên bản bồi thường: *"Tuyệt vời! Bạn không có bất kỳ biên bản sự cố hay khoản bồi thường nào. Cảm ơn bạn đã luôn trân quý và giữ gìn sách cẩn thận!"*

---

### 4.7. Đặc Tả Chi Tiết Trải Nghiệm Người Dùng (UX Specification) Cho Từng Trang

Để đạt tới đỉnh cao về trải nghiệm người dùng (UX) và tối ưu hóa tác nghiệp thực tế, mỗi trang trong hệ thống được thiết kế tỉ mỉ với các yêu cầu công năng và tương tác vi mô (Micro-interactions) riêng biệt:

#### 4.7.1. Phân hệ Cổng Độc Giả (User Portal - Port 3000)

##### 1. Trang Chủ (`HomeView.vue` - Route: `/`)
- **Mục tiêu UX:** Tạo ấn tượng đầu tiên sang trọng, ấm cúng và truyền cảm hứng đọc sách; hỗ trợ tìm sách tức thì ngay khi truy cập.
- **Hero Section:**
  - Tiêu đề nghệ thuật Serif (*Merriweather*), thông điệp chào mừng trang nhã (*"Khám phá kho tàng tri thức bất tận"*).
  - Thanh tìm kiếm trung tâm to bản, có placeholder động (*"Tìm theo tên sách, tác giả, thể loại hoặc mã ISBN..."*).
  - Nút bấm nhanh dẫn tới các danh mục phổ biến (Công nghệ, Văn học, Kinh tế, Lịch sử).
- **Kệ Sách Nổi Bật (Featured & New Books Shelf):**
  - Trưng bày dạng thẻ sách (Book Cards) nổi trên nền giấy kem ấm; hiệu ứng hover nhấc nhẹ (`translateY(-4px)` kèm đổ bóng mềm).
  - Huy hiệu trạng thái trên từng thẻ: Xanh lá rừng (`Còn 4 bản trên kệ`) hoặc Xám dịu (`Tạm hết`).
- **Thống kê thư viện ngắn gọn (Stats Pill):**
  - Hiển thị số lượng đầu sách, nhà xuất bản đồng hành và số lượt mượn thành công nhằm xây dựng niềm tin và sự hào hứng.
- **Micro-interactions:**
  - Nút cuộn mượt mà (Smooth scroll) từ Hero Section xuống kệ sách; Lazy loading ảnh bìa tránh giật khung hình.

##### 2. Trang Danh Mục & Khám Phá Sách (`BooksView.vue` - Route: `/books`)
- **Mục tiêu UX:** Giúp bạn đọc tìm được cuốn sách mong muốn trong thời gian ngắn nhất (dưới 5 giây) với bộ lọc linh hoạt.
- **Thanh tìm kiếm & Bộ lọc đa năng (Faceted Search):**
  - **Tìm kiếm tức thì & Hỗ trợ tiếng Việt không dấu (Debounced Search 300ms + Accent-Insensitive Search):** Bạn đọc gõ từ khóa có dấu hoặc không dấu (ví dụ: `Kien` -> tìm ra `Kiến`, `lap trinh` -> `Lập trình`, `dac nhan tam` -> `Đắc Nhân Tâm`), danh sách tự động cập nhật mượt mà; có nút xóa nhanh (Clear button "x").
  - **Lọc theo thể loại:** Dạng các nút pill chọn nhanh hoặc dropdown đa lựa chọn.
  - **Lọc theo tình trạng sách:** Checkbox *"Chỉ hiển thị sách còn sẵn trên kệ"* (ẩn sách đã mượn hết để bạn đọc đỡ mất công bấm vào).
  - **Sắp xếp linh hoạt:** Theo sách mới nhất (`createdAt_desc`), cũ nhất (`createdAt_asc`), tên A-Z (`TenSach_asc`), tên Z-A (`TenSach_desc`), giá tăng dần (`DonGia_asc`), giá giảm dần (`DonGia_desc`), năm xuất bản mới nhất (`NamXuatBan_desc`).
  - **Thẻ hiển thị bộ lọc đang chọn (Active Filter Chips):** Hiển thị trực quan các tiêu chí lọc đang áp dụng kèm nút "x" xóa nhanh từng tiêu chí hoặc nút "Xóa tất cả".
- **Chế độ hiển thị kép (View Switcher):**
  - Hỗ trợ chuyển đổi giữa **Dạng Lưới Thẻ (Grid View)** (tối ưu thị giác bìa sách) và **Dạng Danh Sách (List View)** (tối ưu so sánh thông số nhanh).
- **Trạng thái tải & Rỗng (Loading & Empty States):**
  - Hiển thị **Skeleton Cards** (khung mờ nhấp nháy màu be) khi đang tải dữ liệu, tuyệt đối không giật layout.
  - Khi không tìm thấy kết quả: Hiển thị minh họa hộp sách rỗng, thông báo thân thiện: *"Không tìm thấy cuốn sách nào khớp với từ khóa '[Từ khóa]'. Bạn thử kiểm tra lại chính tả hoặc tìm theo tên tác giả nhé!"* kèm nút *"Xóa bộ lọc"*.
- **Phân trang thông minh & Đồng bộ URL Query (URL-driven State Synchronization):**
  - Tự động đồng bộ toàn bộ từ khóa tìm kiếm (`search`), thể loại (`theLoai`), nhà xuất bản (`maNXB`), sắp xếp (`sort`, `order`) và số trang (`page`) lên URL Query Parameters (`/books?search=...&theLoai=...&page=2`).
  - Ghi nhớ chính xác và điền lại toàn bộ form lọc, kết quả danh sách khi bạn đọc bấm vào xem chi tiết (`/books/:id`) rồi quay lại qua nút Back trình duyệt hoặc nút "Quay lại" trên trang chi tiết.

##### 3. Trang Chi Tiết Sách (`BookDetailView.vue` - Route: `/books/:id`)
- **Mục tiêu UX:** Cung cấp thông tin toàn diện, minh bạch về cuốn sách và đưa ra lời kêu gọi mượn sách không ma sát.
- **Bố cục 2 cột tiêu chuẩn:**
  - **Cột trái:** Ảnh bìa sách sắc nét (tỷ lệ 2:3), huy hiệu trạng thái to bản, thông tin vị trí kệ thực tế (*"Kệ A1-02, Tầng 2"* - hỗ trợ độc giả tự tìm sách khi đến thư viện).
  - **Cột phải:** Tiêu đề sách trang trọng, tác giả, nhà xuất bản, năm xuất bản, mã chuẩn ISBN, đơn giá thẩm định.
- **Khối kiểm soát số lượng trực quan:**
  - Hiển thị rõ: *Tổng ấn bản: 5* | *Còn sẵn trên kệ: 4* | *Đang cho mượn: 1*.
- **Tóm tắt nội dung:**
  - Đoạn trích giới thiệu sách với nút *"Đọc thêm / Thu gọn"* nếu phần mô tả dài, tránh chiếm diện tích trang.
- **Nút hành động mượn sách ("Call to Action"):**
  - Nếu sách còn trên kệ và bạn đọc đủ điều kiện: Nút to màu xanh lục bảo nổi bật: **"Đăng ký mượn sách này"**.
  - Nếu sách đã hết trên kệ: Nút chuyển màu xám với nhãn *"Tạm hết sách trên kệ (0 bản rảnh)"*, hiển thị thông báo ngày dự kiến có sách trả về.
  - Nếu tài khoản độc giả chưa đăng nhập: Nút chuyển thành *"Đăng nhập để mượn sách"* dẫn tới modal đăng nhập nhanh.
  - Nếu tài khoản đang bị hạn chế (đã mượn 3 cuốn, quá hạn, nợ phạt): Nút bị vô hiệu hóa (disabled) kèm Tooltip giải thích rõ ràng nguyên nhân và cách xử lý.
- **Hộp thoại xác nhận mượn sách (`BorrowModal.vue`):**
  - Hiển thị tóm tắt cuốn sách, ảnh bìa nhỏ.
  - Bộ chọn ngày hẹn lấy sách (`pickup_date`): Chỉ cho phép chọn trong vòng **48 giờ tới** (chặn chọn ngày quá khứ hoặc quá xa).
  - Nhắc nhở quy chế mượn: *"Thời hạn mượn là 14 ngày kể từ khi nhận sách tại quầy. Bạn được phép gia hạn thêm 7 ngày nếu không quá hạn."*
  - Nút bấm: *"Xác nhận mượn"* và nút *"Để sau"*.

##### 4. Trang Sách Của Tôi & Lịch Sử Mượn (`MyBorrowsView.vue` - Route: `/my-borrows`)
- **Mục tiêu UX:** Giúp bạn đọc quản lý toàn bộ các đơn mượn chủ động, minh bạch thời hạn, không bao giờ bị quên ngày trả sách.
- **Hệ thống Tab trạng thái kèm huy hiệu số lượng:**
  1. **Tab "Chờ duyệt" (`PENDING`):**
     - Danh sách các yêu cầu vừa gửi.
     - Hiển thị thời gian gửi yêu cầu và ngày hẹn lấy dự kiến.
     - **Tính năng độc quyền:** Nút **"Hủy yêu cầu"** (màu xám viền đỏ nhạt) giúp bạn đọc chủ động hủy nếu đổi ý, có modal xác nhận *"Bạn có chắc chắn muốn hủy yêu cầu mượn cuốn sách này?"*.
  2. **Tab "Chờ nhận tại quầy" (`APPROVED`):**
     - Sách đã được thủ thư chuẩn bị sẵn trên quầy.
     - **Đồng hồ đếm ngược 48 giờ:** Hiển thị nổi bật: *"Vui lòng đến quầy nhận sách trước: 16:30 - 28/09/2026 (Còn 32 giờ)"*.
     - Hướng dẫn nhận sách: *"Xuất trình mã độc giả [DG001] hoặc email tại quầy số 1 để nhận sách."*
  3. **Tab "Đang mượn" (`BORROWED`):**
     - Thẻ sách đang cầm về đọc: Hiển thị ngày mượn thực tế và hạn trả sách (`HanTra`).
     - **Thanh đo thời hạn (Visual Progress Bar):**
       * Còn > 3 ngày: Màu xanh lá rừng dịu (*"Còn 10 ngày"*).
       * Còn <= 2 ngày: Màu vàng hổ phách cảnh báo (*"Sắp đến hạn trả - Còn 2 ngày"*).
       * Quá hạn: Màu đỏ rượu vang trầm (*"Đã trễ hạn 3 ngày - Vui lòng hoàn trả sớm!"*).
     - **Nút "Gia hạn thêm 7 ngày":**
       * Nếu sách chưa quá hạn và chưa gia hạn: Nút bấm sáng rõ, bấm 1 chạm xác nhận cộng ngay 7 ngày.
       * Nếu đã gia hạn rồi (hạn mức 1 lần) hoặc sách đã quá hạn: Nút mờ đi kèm thông báo lý do rõ ràng.
  4. **Tab "Lịch sử mượn" (`RETURNED` / `CANCELLED`):**
     - Xem lại toàn bộ sách đã từng đọc qua, ngày mượn, ngày trả thực tế.
     - Nút *"Mượn lại cuốn này"* dẫn thẳng đến trang chi tiết sách để đăng ký nhanh.
- **Giao diện khi chưa có sách mượn (Empty State):**
  - Trình bày ấm áp, thân thiện: *"Bạn hiện chưa có cuốn sách nào trong danh sách mượn. Hãy ghé kệ sách để chọn những cuốn sách hay nhé!"* kèm nút dẫn tới `/books`.

##### 5. Trang Hồ Sơ Cá Nhân (`ProfileView.vue` - Route: `/profile`)
- **Mục tiêu UX:** Quản lý thông tin cá nhân thuận tiện, đổi mật khẩu an toàn và minh bạch tuyệt đối về tình trạng thẻ thư viện.
- **Thẻ thông tin thẻ bạn đọc (Digital Library Card):**
  - Thiết kế giả lập thẻ thư viện sang trọng: Hiển thị Ảnh đại diện (Avatar), Họ và tên, Mã số độc giả (`MaDocGia`), Ngày sinh, Phái, Hạng thẻ bạn đọc.
  - Tính năng cập nhật Avatar: Xem trước ảnh tức thì (Preview), kiểm tra dung lượng (< 2MB) và định dạng ảnh (.jpg, .png, .webp).
- **Cập nhật thông tin liên lạc:**
  - Cho phép bạn đọc tự cập nhật **Số điện thoại** và **Địa chỉ** bất kỳ lúc nào để thư viện tiện liên hệ thông báo.
- **Đổi mật khẩu an toàn:**
  - Nhập Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới.
  - **Nút toggle con mắt:** Cho phép bật/tắt hiển thị mật khẩu trên từng ô nhập liệu.
  - **Thanh đo độ mạnh mật khẩu (Password Strength Indicator):** Phản hồi trực tiếp theo thời gian thực (Yếu / Trung bình / Mạnh) kèm gợi ý độ dài tối thiểu 6 ký tự.
- **Khu vực Cảnh báo Biên bản Sự cố & Bồi thường (Special Incident Alert Box):**
  - Nếu tài khoản có biên bản sách rách / mất ở trạng thái `UNPAID`:
    * Hiển thị Banner cảnh báo viền đỏ nổi bật đầu trang.
    * Ghi rõ: Mã biên bản, Cuốn sách gặp sự cố, Mô tả hư hại thực tế (ví dụ: *"Rách 8 trang chương 3 và ướt bìa"*), Số tiền bồi thường cần thanh toán (thẩm định tại quầy).
    * Hướng dẫn giải quyết: *"Tài khoản tạm thời bị khóa quyền mượn sách mới. Xin vui lòng mang tiền mặt hoặc chuyển khoản tại quầy thư viện để được thủ thư giải tỏa biên bản và khôi phục quyền mượn."*
  - Nếu không có sự cố: Hiển thị dòng chữ xanh nhẹ nhàng: *"Thẻ bạn đọc đang hoạt động tốt. Cảm ơn bạn đã luôn giữ gìn sách nguyên vẹn!"*

##### 6. Trang Đăng Nhập & Đăng Ký (`LoginView.vue`, `RegisterView.vue`)
- **Mục tiêu UX:** Tối giản ma sát gia nhập hệ thống, hỗ trợ đăng nhập 1 chạm, chống nhập sai mật khẩu.
- **Bố cục chia đôi (Split Screen Layout):**
  - Nửa trái (trên màn hình máy tính): Hình ảnh không gian đọc sách cổ điển ấm áp, trích dẫn danh ngôn về sách (*"Một cuốn sách hay là một người bạn tốt"*).
  - Nửa phải: Khung form đăng nhập / đăng ký sạch sẽ, viền nhẹ, đổ bóng tinh tế.
- **Đăng ký & Đăng nhập Google OAuth 2.0 (Google Identity Services):**
  - Tích hợp component `GoogleAuthButton` chuyên biệt cho cả đăng ký (`mode="signup"`) và đăng nhập (`mode="signin"`), hiển thị chuẩn phong cách Google One-Tap / GIS.
  - Tự động tách Họ lót và Tên từ hồ sơ Google, khởi tạo mã độc giả `MaDocGia` (DGxxx) và lưu ảnh đại diện `HinhAnh`.
- **Form đăng nhập / đăng ký thông minh:**
  - Tự động autofocus vào ô Email khi vừa vào trang.
  - Hỗ trợ phím Enter để gửi form.
  - Ô mật khẩu tích hợp nút icon con mắt để ẩn/hiện mật khẩu tránh gõ sai.
  - Form Đăng ký: Có trường nhập Họ tên lót, Tên, Số điện thoại, Địa chỉ, Ngày sinh, Giới tính đầy đủ theo 5 collection chuẩn đề tài, xác thực định dạng số điện thoại Việt Nam (10 chữ số).
- **Thông báo lỗi tức thì (Inline Validation):**
  - Báo lỗi ngay dưới ô nhập nếu email không đúng định dạng hoặc để trống, không dùng popup alert chặn màn hình.

---

#### 4.7.2. Phân hệ Cổng Quản Trị & Thủ Thư (Admin Portal - Port 3001)

##### 1. Trang Bảng Điều Khiển Tổng Quan (`DashboardView.vue` - Route: `/`)
- **Mục tiêu UX:** Cung cấp "bức tranh toàn cảnh" về hoạt động của thư viện trong ngày chỉ trong một cái nhìn; cảnh báo khẩn cấp các vấn đề phát sinh.
- **Hàng thẻ chỉ số chính (Key Metrics Cards):**
  - **Tổng đầu sách trong kho:** Kèm số bản rảnh trên kệ.
  - **Sách đang lưu hành (Đang cho mượn):** Kèm tỷ lệ mượn/tổng kho.
  - **Sách quá hạn cần thu hồi:** Màu đỏ rượu vang nổi bật, bấm vào nhảy thẳng tới danh sách sách quá hạn.
  - **Biên bản bồi thường chưa giải quyết:** Kèm tổng số tiền đền bù còn nợ.
- **Biểu đồ trực quan (Interactive Charts):**
  - Biểu đồ phân bổ sách theo danh mục / thể loại (Pie/Doughnut Chart).
  - Biểu đồ xu hướng mượn và trả sách theo 7 ngày qua (Bar/Line Chart).
- **Bảng Top 10 Sách "Hot" được bạn đọc yêu thích nhất:**
  - Giúp thủ thư lập kế hoạch mua sắm / nhập bổ sung các đầu sách có nhu cầu cao.
- **Thanh công cụ xuất báo cáo (Data Export Toolbar):**
  - Nút **"Xuất báo cáo Excel / CSV"** kèm bộ chọn ngày (Hôm nay, Tuần này, Tháng này, Tùy chọn). Hỗ trợ tải ngay file sạch định dạng UTF-8 không lỗi tiếng Việt.

##### 2. Trang Quản Lý Kho Sách (`BooksManageView.vue` - Route: `/books`)
- **Mục tiêu UX:** Thao tác nhập sách, sửa thông tin, kiểm kê và lưu trữ sách diễn ra nhanh chóng, chính xác, ngăn chặn sai sót dữ liệu.
- **Bảng dữ liệu sách thông minh (Data Table):**
  - Cột ảnh bìa sách thu nhỏ (Thumbnail 40x60px), click vào phóng to xem ảnh gốc.
  - Cột Mã sách (`MaSach`), Tên sách (`TenSach`), Thể loại (`TheLoai`), Tác giả (`TacGia`), Nhà xuất bản (`MaNXB`), Đơn giá (`DonGia`).
  - **Cột Số lượng phân tách màu trực quan:** Tổng số (`SoQuyen`) / Sẵn sàng (`SoQuyenKhaDung` - Xanh lá) / Đang mượn (`SoQuyenDangMuon` - Xanh dương) / Hư hỏng (`SoQuyenHuHong` - Đỏ).
  - Cột Vị trí kệ sách (`ViTri`): Giúp thủ thư dễ dàng kiểm kê thực địa.
- **Hộp thoại Thêm / Chỉnh Sửa Sách (`BookModal.vue`):**
  - Bố cục lưới 2 cột khoa học, chia nhóm thông tin: *Thông tin xuất bản* (Mã sách, Tên sách, NXB, Năm XB, Tác giả, Nguồn gốc) và *Thông tin quản lý kho* (Đơn giá, Thể loại, Vị trí kệ, Số quyển).
  - Khu vực tải ảnh bìa sách: Kéo thả file hoặc chọn file, xem trước ngay lập tức ảnh vừa chọn trước khi lưu.
- **Cơ chế Xóa / Lưu trữ sách an toàn tuyệt đối:**
  - Nút **"Lưu trữ"** (Soft Delete):
    * Khi click, hệ thống tự động kiểm tra: Nếu `SoQuyenDangMuon > 0`, lập tức hiện Modal cảnh báo an toàn: *"Không thể đưa vào kho lưu trữ! Đầu sách này hiện đang có [X] bản được bạn đọc mượn chưa trả. Vui lòng thu hồi toàn bộ sách trước khi lưu trữ."*
    * Nếu sách không có ai mượn: Hiển thị Modal xác nhận với lời giải thích: *"Sách sẽ được chuyển vào kho lưu trữ, ẩn khỏi tìm kiếm của độc giả nhưng toàn bộ lịch sử mượn trả trong quá khứ vẫn được giữ nguyên vẹn."*

##### 3. Trang Hàng Đợi Duyệt & Xuất Sách (`BorrowQueueView.vue` - Route: `/borrows`)
- **Mục tiêu UX:** Tối ưu hóa tốc độ phục vụ tại quầy thư viện; thủ thư thao tác duyệt và giao sách chỉ bằng 1-2 lần nhấp chuột.
- **Tab 1: Yêu cầu chờ duyệt (`PENDING`):**
  - Danh sách sắp xếp theo thời gian gửi (đơn gửi trước lên đầu).
  - Hiển thị rõ: Bạn đọc, Số điện thoại, Tên sách, Số bản rảnh hiện tại trong kho, Ngày bạn đọc hẹn đến lấy.
  - Nút **"Duyệt đơn" (Approve - Màu xanh):** Bấm duyệt 1 chạm, hệ thống lập tức kích hoạt bộ đếm thời gian giữ sách 48h.
  - Nút **"Từ chối" (Reject - Màu đỏ):** Mở popup nhanh cho thủ thư chọn lý do phổ biến (*"Sách đang sửa chữa"*, *"Hết bản in khả dụng"*, hoặc tự gõ lý do).
- **Tab 2: Chờ bạn đọc đến lấy (`APPROVED`):**
  - Danh sách các cuốn sách đã được thủ thư giữ riêng trên quầy.
  - Đồng hồ đếm ngược 48h trực quan: Nếu quá 48h bạn đọc không đến lấy, có nút **"Hủy đơn quá hạn giữ"** để hoàn trả sách về kệ cho người khác mượn.
  - Khi bạn đọc đến quầy: Thủ thư tìm nhanh theo Mã độc giả hoặc Mã đơn, bấm nút **"Xuất sách cho bạn đọc" (Check-out)**. Hệ thống tự động:
    * Trừ 1 bản khả dụng trong kho, tăng 1 bản đang mượn.
    * Gán hạn trả mặc định là **14 ngày**.
    * Hiển thị thông báo toast xanh: *"Đã xuất sách thành công. Hạn trả: [DD/MM/YYYY]"*.

##### 4. Trang Nhận Trả Sách & Kiểm Tra Chất Lượng (`ReturnsView.vue` - Route: `/returns`)
- **Mục tiêu UX:** Giúp thủ thư tiếp nhận sách trả nhanh gọn, kiểm tra chất lượng sách ngay tại quầy và xử lý phát sinh tức thời.
- **Thanh tìm kiếm siêu tốc tại quầy:**
  - Ô tìm kiếm trung tâm lớn, hỗ trợ gõ hoặc quét mã vạch: Mã phiếu mượn, Mã độc giả, Số điện thoại độc giả, hoặc Tên sách.
  - Bấm Enter hoặc gõ xong là hiển thị ngay thông tin phiếu mượn tương ứng.
- **Khối đối soát thông tin:**
  - Hiển thị ảnh bìa sách, tên sách, họ tên bạn đọc, ngày mượn, hạn trả.
  - Huy hiệu trạng thái thời hạn: *"Đúng hạn"* (Xanh) hoặc *"Quá hạn [X] ngày"* (Đỏ).
- **Hai kịch bản hoàn trả rõ ràng:**
  - **Kịch bản 1: Sách nguyên vẹn (95% trường hợp):**
    * Thủ thư bấm nút to màu xanh lá: **"Xác nhận nhận trả sách nguyên vẹn"**.
    * Hoàn tất trong 1 giây: Phiếu mượn chuyển sang `RETURNED`, kho tự động tăng thêm 1 cuốn sẵn sàng cho bạn đọc tiếp theo.
  - **Kịch bản 2: Sách có sự cố rách trang, vẽ bẩn, ướt nước hoặc Mất sách:**
    * Thủ thư bấm nút màu đỏ cam: **"Lập biên bản sự cố hư hại / Mất sách"**.
    * Màn hình mở ngay Hộp thoại thẩm định sự cố (`DamageModal.vue`).

##### 5. Trang Quản Lý Biên Bản Bồi Thường (`FinesView.vue` - Route: `/fines`)
- **Mục tiêu UX:** Minh bạch quy trình xử lý tài sản thư viện bị hư hại, ghi nhận bồi thường công bằng và mở khóa tài khoản tức thì sau khi thu tiền.
- **Hộp thoại Lập Biên Bản & Thẩm Định Sự Cố (`DamageModal.vue`):**
  - Chọn Loại sự cố: Radio button chọn *"Sách bị hư hại/rách"* (`DAMAGED`) hoặc *"Làm mất sách"* (`LOST`).
  - Ô nhập Mô tả chi tiết mức độ hư hại thực tế: Gợi ý các mẫu (*"Rách bìa sau"*, *"Ướt nước 20 trang"*, *"Mất hoàn toàn sách gốc"*).
  - **Ô nhập Số tiền bồi thường thẩm định (VNĐ):** Thủ thư thẩm định trực tiếp tại quầy theo mức độ thiệt hại thực tế và nhập con số cụ thể vào ô (ví dụ: `45,000` VNĐ).
  - Bấm nút **"Lập biên bản"**: Hệ thống tạo bản ghi `BienBanBoiThuong` ở trạng thái `UNPAID` và tự động tạm khóa quyền mượn sách mới của độc giả.
- **Danh sách biên bản bồi thường:**
  - Lọc theo tab: *"Chưa nộp tiền"* (`UNPAID`) và *"Đã nộp tiền"* (`PAID`).
  - Hiển thị rõ: Mã biên bản, Bạn đọc, Tên sách, Thiệt hại, Số tiền bồi thường, Ngày lập biên bản.
- **Nút hành động "Xác nhận đã thu tiền tại quầy":**
  - Khi độc giả nộp tiền mặt hoặc chuyển khoản thành công tại quầy, thủ thư chỉ cần bấm nút này.
  - Hệ thống cập nhật biên bản thành `PAID`, gán mã nhân viên thu tiền (`MSNVThuTien`), ngày giải quyết (`NgayGiaiQuyet`) và **ngay lập tức mở khóa quyền mượn sách cho độc giả**, hiển thị thông báo toast thành công rực rỡ.

##### 6. Trang Quản Lý Người Dùng & Blacklist (`UsersManageView.vue` - Route: `/users`)
- **Mục tiêu UX:** Cung cấp quyền kiểm soát tài khoản bạn đọc và nhân viên chặt chẽ, an toàn, hỗ trợ phân quyền tức thì (Dành riêng cho `ADMIN`).
- **Phân loại người dùng theo Tabs:**
  - Tab "Bạn đọc / Độc giả" (`DocGia`) và Tab "Đội ngũ nhân viên / Thủ thư" (`NhanVien`).
- **Quản lý danh sách Blacklist:**
  - Cột trạng thái hiển thị rõ cờ đỏ: *"Đang bị khóa quyền mượn"* kèm lý do (Ví dụ: *"Quá hạn trả sách 18 ngày"*, *"Nợ đền bù biên bản BB0002"*).
  - Nút **"Khóa quyền mượn (Blacklist)"**: Dành cho trường hợp thủ công (gây mất trật tự thư viện, mượn hộ thẻ), mở popup bắt buộc nhập lý do khóa.
  - Nút **"Mở khóa quyền mượn"**: Cho phép Admin can thiệp gỡ khóa đặc cách kèm ghi chú nhật ký.
- **Nút "Thêm nhân viên mới":**
  - Mở modal nhập MSNV, Họ tên, Email, Mật khẩu, Chức vụ (`BOOK_MANAGER` hoặc `ADMIN`), Địa chỉ, Số điện thoại.

##### 7. Trang Cấu Hình Quy Chế Thư Viện (`SettingsView.vue` - Route: `/settings`)
- **Mục tiêu UX:** Giúp Admin điều chỉnh các tham số vận hành của toàn bộ thư viện một cách trực quan, có giải thích rõ ràng tác động của từng thông số mà không cần can thiệp code (Dành riêng cho `ADMIN`).
- **Các khối cấu hình trực quan (Setting Cards):**
  - **Hạn mức mượn sách:** Ô chọn số lượng (Mặc định: 3 cuốn) kèm chú thích *"Số cuốn tối đa một bạn đọc được giữ và chờ duyệt cùng lúc"*.
  - **Thời hạn mượn một lượt:** Ô chọn số ngày (Mặc định: 14 ngày) kèm chú thích *"Số ngày mượn tiêu chuẩn kể từ khi xuất sách tại quầy"*.
  - **Thời hạn giữ sách sau duyệt:** Ô chọn số giờ (Mặc định: 48 giờ) kèm chú thích *"Thời gian tối đa giữ sách trên quầy chờ bạn đọc đến lấy"*.
  - **Thời gian gia hạn thêm:** Ô chọn số ngày (Mặc định: 7 ngày) kèm giới hạn *"Chỉ cho phép gia hạn tối đa 1 lần/lượt mượn"*.
  - **Số ngày trễ hạn tự động vào Blacklist:** Ô chọn số ngày (Mặc định: 15 ngày) kèm chú thích *"Nếu quá hạn vượt quá số ngày này, hệ thống tự động khóa quyền mượn"*.
- **Nút hành động an toàn:**
  - Nút **"Lưu thay đổi cấu hình"** (Xanh ngọc lục bảo) hiển thị modal xác nhận tóm tắt các giá trị thay đổi.
  - Nút **"Khôi phục cấu hình mặc định"** để hoàn nguyên về cài đặt chuẩn thư viện khi cần.

---

## 5. QUY CHẾ VÀ RÀNG BUỘC NGHIỆP VỤ (BUSINESS RULES)

1. **Hạn mức mượn:** Mỗi độc giả được mượn tối đa **3 cuốn sách** cùng lúc (tính cả số sách đang mượn và các đơn đang chờ duyệt).
2. **Ràng buộc trùng đầu sách:** Mỗi độc giả chỉ được mượn **tối đa 1 bản in của cùng một đầu sách** trong cùng một thời điểm (ngăn chặn tình trạng một bạn đọc chiếm giữ hết toàn bộ bản in của một cuốn sách hot).
3. **Thời hạn mượn:** Mặc định là **14 ngày** kể từ thời điểm thủ thư bấm xác nhận xuất sách (Check-out).
4. **Thời hạn giữ sách sau khi duyệt (Pickup Window):** Sau khi đơn mượn chuyển sang trạng thái `APPROVED`, độc giả có **48 giờ (2 ngày)** để đến quầy nhận sách. Sau 48h nếu không đến nhận, hệ thống tự động hủy đơn (`EXPIRED`) và hoàn trả số lượng sách về kho (`available_copies`).
5. **Quy định hủy đơn mượn từ phía độc giả:**
   - Khi đơn ở trạng thái `PENDING` (Chờ duyệt): Độc giả được quyền tự bấm nút **"Hủy đơn mượn"** trên User Portal.
   - Khi đơn đã chuyển sang `APPROVED` (Đã duyệt, thủ thư đã giữ sách trên quầy): Độc giả không thể tự hủy trên giao diện, mà chỉ có Thủ thư/Admin mới có quyền hủy tại quầy.
6. **Gia hạn:** Độc giả được phép gia hạn tối đa **1 lần**, cộng thêm **7 ngày** vào hạn trả ban đầu, với điều kiện duy nhất:
   - Sách chưa bị quá hạn (`due_date >= ngày hiện tại`).
7. **Chính sách trễ hạn (Overdue Policy):**
   - **Không tính phí phạt tiền theo từng ngày trễ hạn.**
   - Ngay khi quá hạn: Tài khoản bị khóa quyền mượn sách mới ngay lập tức và nhận thông báo cảnh báo.
   - Nếu trễ hạn vượt quá **15 ngày**: Hệ thống tự động kích hoạt đưa tài khoản vào **Blacklist**.
8. **Điều kiện chặn mượn sách (Block Borrowing):**
   - Đang có cờ `is_blacklisted = true`.
   - Tổng số sách đang mượn + đang chờ duyệt >= 3 cuốn.
   - Đang mượn hoặc đang có đơn chờ duyệt đối với chính đầu sách đó.
   - Có ít nhất 1 cuốn sách đang mượn bị quá hạn (`due_date < ngày hiện tại`).
   - Có biên bản hư hỏng / mất sách ở trạng thái `UNPAID`.
9. **Quy tắc đền bù sách rách / mất:**
   - Thủ thư trực tiếp thẩm định mức độ hư hại thực tế tại quầy (rách bìa, vẽ bẩn, ướt nước, mất trang, mất sách) và nhập trực tiếp số tiền bồi thường vào biên bản.
   - Độc giả thanh toán trực tiếp tại quầy (tiền mặt hoặc chuyển khoản cho thủ thư). Thủ thư bấm nút **"Xác nhận đã đền bù"** để đóng biên bản và khôi phục quyền mượn.
10. **Chính sách xóa sách trong kho (Soft Delete & Data Protection):**
    - Sách khi xóa sẽ được đánh dấu lưu trữ (`status = 'ARCHIVED'`), ẩn khỏi danh mục tìm kiếm của độc giả nhưng giữ nguyên toàn vẹn dữ liệu lịch sử mượn trả.
    - **Tuyệt đối không cho phép xóa/lưu trữ** nếu cuốn sách đang có bạn đọc mượn chưa trả (`borrowedCopies > 0`).
11. **Quản lý tập tin hình ảnh (File Uploads):**
    - Ảnh bìa sách và ảnh đại diện người dùng được tải lên và lưu trữ trực tiếp trên Server Express tại thư mục cục bộ `/backend/uploads/covers` và `/backend/uploads/avatars`, phục vụ tĩnh qua `express.static`.
12. **Chuẩn mực giao tiếp và thông điệp hiển thị (UX Communication Standard):**
    - Toàn bộ nội dung hiển thị trên cả User Portal và Admin Portal (bao gồm nhãn nút, tiêu đề, hướng dẫn nhập liệu, thông báo Toast, hộp thoại Modal, thông báo lỗi kiểm thực) bắt buộc phải sử dụng **tiếng Việt tự nhiên, chuẩn mực, lịch sự và phù hợp với bạn đọc Việt Nam**.
    - **Nghiêm cấm** sử dụng văn phong dịch thô, dịch máy từng từ (word-by-word) từ tiếng Anh gây gượng gạo, khó hiểu hoặc xa cách (như *"Kiểm tra ra"*, *"Bản sao có sẵn"*, *"Đã xảy ra một lỗi trong bản ghi"*, v.v.).
    - Mọi thông báo lỗi hoặc từ chối phải giải thích nguyên nhân rõ ràng và cung cấp giải pháp hành động cụ thể để người dùng biết cách giải quyết (tuân thủ từ điển chuẩn hóa tại Mục 4.6).

---

## 6. THIẾT KẾ CƠ SỞ DỮ LIỆU MONGODB (SCHEMA & QUERY SPECIFICATION)

### 6.0. ĐẶC TẢ CƠ SỞ DỮ LIỆU BẮT BUỘC TỐI THIỂU & NGUYÊN TẮC MỞ RỘNG

#### 1. Yêu cầu đặc tả tối thiểu theo đề tài:
Hệ thống **BẮT BUỘC** phải có đầy đủ 5 collection và các thuộc tính tối thiểu sau đây, **TUYỆT ĐỐI KHÔNG ĐƯỢC THIẾU** bất kỳ thực thể hay thuộc tính nào:

1. **`DocGia`** (`MaDocGia`, `HoLot`, `Ten`, `NgaySinh`, `Phai`, `DiaChi`, `DienThoai`)
2. **`Sach`** (`MaSach`, `TenSach`, `DonGia`, `SoQuyen`, `NamXuatBan`, `MaNXB`, `NguonGoc/TacGia`)
3. **`NhaXuatBan`** (`MaNXB`, `TenNXB`, `DiaChi`)
4. **`TheoDoiMuonSach`** (`MaDocGia`, `MaSach`, `NgayMuon`, `NgayTra`)
5. **`NhanVien`** (`MSNV`, `HoTenNV`, `Password`, `ChucVu`, `DiaChi`, `SoDienThoai`)

#### 2. Nguyên tắc thiết kế và mở rộng hệ thống thực tế:
- **Bắt buộc đầy đủ, không được thiếu (Strict Mandatory Compliance):**
  - Mọi Collection bắt buộc phải định nghĩa và lưu trữ đầy đủ 100% các thuộc tính theo đúng danh sách đặc tả tối thiểu ở trên.
  - Sử dụng định dạng tiếng Việt chuẩn hóa, đồng nhất giữa Cơ sở dữ liệu (MongoDB), Backend Models/Controllers và Frontend UI/Forms.
- **Cho phép bổ sung và mở rộng (Permissible Extension):**
  - Để xây dựng một hệ thống thư viện trực tuyến hoàn chỉnh, an toàn và sẵn sàng cho môi trường thực tế, hệ thống được phép bổ sung và mở rộng thêm các thuộc tính kỹ thuật, xác thực, phân quyền và kiểm soát nghiệp vụ vào 5 collection trên (như `Email`, `HinhAnh`, `GoogleId`, `DaBiKhoa` cho `DocGia`; `TheLoai`, `ISBN`, `HinhAnh`, `ViTri`, `SoQuyenKhaDung`, `SoQuyenDangMuon`, `TrangThai` cho `Sach`; `DienThoai`, `Email` cho `NhaXuatBan`; `TrangThai`, `HanTra`, `HanChotNhan`, `SoLanGiaHan` cho `TheoDoiMuonSach`; `Email`, `HinhAnh` cho `NhanVien`).
  - Được phép bổ sung các Collection mở rộng nghiệp vụ chuyên biệt:
    + **`BienBanBoiThuong`**: Quản lý sự cố sách hư hại, rách, mất và quy trình bồi thường tại quầy.
    + **`CauHinhHeThong`**: Quản lý tập trung các quy định mượn trả động (hạn mức mượn, thời hạn mượn, thời gian giữ sách 48h, ngày trễ hạn tự động vào danh sách đen).

#### 3. Bảng đối chiếu đặc tả tối thiểu và các trường mở rộng thực tế:

| Collection | Thuộc tính tối thiểu bắt buộc theo đề tài | Thuộc tính mở rộng trong hệ thống đang triển khai | Mục đích nghiệp vụ của thuộc tính mở rộng |
| :--- | :--- | :--- | :--- |
| **`DocGia`** | `MaDocGia`, `HoLot`, `Ten`, `NgaySinh`, `Phai`, `DiaChi`, `DienThoai` | `Email`, `Password`, `HinhAnh`, `GoogleId`, `DaBiKhoa`, `LyDoKhoa`, `NgayKhoa`, `createdAt`, `updatedAt` | Xác thực đăng nhập (Email + Bcrypt / Google OAuth), hiển thị Avatar, quản lý Blacklist chặn mượn khi vi phạm quy chế |
| **`Sach`** | `MaSach`, `TenSach`, `DonGia`, `SoQuyen`, `NamXuatBan`, `MaNXB`, `NguonGoc/TacGia` | `TacGia`, `NguonGoc`, `TheLoai`, `ISBN`, `HinhAnh`, `MoTa`, `ViTri`, `SoQuyenKhaDung`, `SoQuyenDangMuon`, `SoQuyenHuHong`, `TrangThai`, `createdAt`, `updatedAt` | Tách bạch Tác giả và Nguồn gốc cung cấp, lọc thể loại, định danh ISBN, lưu vị trí kệ sách, giám sát số lượng tồn kho/đang mượn/hỏng và xóa mềm (Soft Delete) |
| **`NhaXuatBan`** | `MaNXB`, `TenNXB`, `DiaChi` | `DienThoai`, `Email`, `createdAt`, `updatedAt` | Thông tin liên hệ đầy đủ (Hotline, Email hỗ trợ) của NXB |
| **`TheoDoiMuonSach`** | `MaDocGia`, `MaSach`, `NgayMuon`, `NgayTra` | `DocGiaId`, `SachId`, `TrangThai`, `NgayYeuCau`, `NgayHenLay`, `HanChotNhan`, `HanTra`, `SoLanGiaHan`, `MSNVDuyet`, `NhanVienDuyetId`, `GhiChu`, `createdAt`, `updatedAt` | Kiểm soát vòng đời mượn sách đa bước: Đặt lịch hẹn -> Duyệt giữ sách 48h -> Xuất sách tại quầy (14 ngày) -> Gia hạn -> Nhận trả hoặc xử lý sự cố |
| **`NhanVien`** | `MSNV`, `HoTenNV`, `Password`, `ChucVu`, `DiaChi`, `SoDienThoai` | `Email`, `HinhAnh`, `createdAt`, `updatedAt` | Đăng nhập hệ thống quản trị bằng Email định danh, hiển thị Avatar nhân viên |
| **`TheLoai`** *(Mở rộng)* | *(Collection bổ trợ)* | `MaTheLoai`, `TenTheLoai`, `MoTa`, `TrangThai`, `createdAt`, `updatedAt` | Chuẩn hóa danh mục thể loại độc lập toàn hệ thống, tránh sai lệch và rỗng kết quả khi người dùng lọc sách |
| **`BienBanBoiThuong`** *(Mở rộng)* | *(Collection bổ trợ)* | `MaBienBan`, `MaTheoDoiMuon`, `TheoDoiMuonId`, `MaDocGia`, `DocGiaId`, `MaSach`, `SachId`, `LoaiSuCo`, `MoTa`, `SoTienBoiThuong`, `TrangThai`, `NgayLap`, `NgayGiaiQuyet`, `MSNVThuTien`, `NhanVienThuTienId`, `GhiChu` | Lập biên bản xử lý sách rách/mất, thẩm định tiền đền bù tại quầy và giải phóng quyền mượn sau khi độc giả thanh toán |
| **`CauHinhHeThong`** *(Mở rộng)* | *(Collection bổ trợ)* | `KhoaCauHinh`, `SoSachMuonToiDa`, `SoNgayMuonToiDa`, `ThoiGianGiuSachGio`, `SoNgayGiaHan`, `SoLanGiaHanToiDa`, `SoNgayTreHanVaoDanhSachDen` | Bảng điều khiển tham số quy chế động giúp thay đổi chính sách thư viện mà không cần sửa code |

---

### 6.1. Collection: `DocGia`
*Đặc tả tối thiểu theo đề tài: `DocGia(MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai)` + mở rộng hệ thống.*
```javascript
{
  _id: ObjectId("..."),
  // === THUỘC TÍNH TỐI THIỂU BẮT BUỘC THEO ĐỀ TÀI ===
  MaDocGia: "DG001",                   // Unique, index (Mã độc giả)
  HoLot: "Trần Văn",                   // Họ và tên đệm độc giả
  Ten: "Độc Giả",                      // Tên độc giả (Index)
  NgaySinh: ISODate("1998-05-15"),     // Ngày sinh
  Phai: "Nam",                         // Giới tính: "Nam", "Nữ", "Khác"
  DiaChi: "789 Đường Lê Lợi, Q.1, TP.HCM", // Địa chỉ liên hệ
  DienThoai: "0913456789",             // Số điện thoại
  // === THUỘC TÍNH BỔ SUNG & MỞ RỘNG HỆ THỐNG HIỆN TẠI ===
  Email: "reader1@gmail.com",          // Unique, index (Email đăng nhập)
  Password: "$2a$10$...",              // Mã hóa BCrypt (null nếu Google OAuth)
  HinhAnh: "/uploads/avatars/default.png",
  GoogleId: null,                      // Index (dùng cho Google OAuth 2.0)
  DaBiKhoa: false,                     // Index (Trạng thái Blacklist)
  LyDoKhoa: null,                      // Lý do đưa vào Blacklist
  NgayKhoa: null,                      // Thời điểm bị Blacklist
  createdAt: ISODate("2026-09-26T..."),
  updatedAt: ISODate("2026-09-26T...")
}
```

### 6.2. Collection: `NhanVien`
*Đặc tả tối thiểu theo đề tài: `NhanVien(MSNV, HoTenNV, Password, ChucVu, DiaChi, SoDienThoai)` + mở rộng hệ thống.*
```javascript
{
  _id: ObjectId("..."),
  // === THUỘC TÍNH TỐI THIỂU BẮT BUỘC THEO ĐỀ TÀI ===
  MSNV: "NV001",                       // Unique, index (Mã số nhân viên)
  HoTenNV: "Quản Trị Viên Hệ Thống",   // Họ tên nhân viên
  Password: "$2a$10$...",              // Mật khẩu mã hóa BCrypt
  ChucVu: "ADMIN",                     // Enum: "ADMIN", "BOOK_MANAGER", "Thủ thư", "Quản trị viên"
  DiaChi: "123 Đường Cầu Giấy, Hà Nội",
  SoDienThoai: "0901234567",
  // === THUỘC TÍNH BỔ SUNG & MỞ RỘNG HỆ THỐNG HIỆN TẠI ===
  Email: "admin@library.com",          // Unique, index
  HinhAnh: "/uploads/avatars/admin.png",
  createdAt: ISODate("2026-09-26T..."),
  updatedAt: ISODate("2026-09-26T...")
}
```

### 6.3. Collection: `NhaXuatBan`
*Đặc tả tối thiểu theo đề tài: `NhaXuatBan(MaNXB, TenNXB, DiaChi)` + mở rộng hệ thống.*
```javascript
{
  _id: ObjectId("..."),
  // === THUỘC TÍNH TỐI THIỂU BẮT BUỘC THEO ĐỀ TÀI ===
  MaNXB: "NXB01",                      // Unique, index (Mã nhà xuất bản)
  TenNXB: "NXB Thông Tin & Truyền Thông", // Tên nhà xuất bản
  DiaChi: "115 Trần Duy Hưng, Cầu Giấy, Hà Nội",
  // === THUỘC TÍNH BỔ SUNG & MỞ RỘNG HỆ THỐNG HIỆN TẠI ===
  DienThoai: "024.37820999",
  Email: "nxb.tttt@mic.gov.vn",
  createdAt: ISODate("2026-09-26T..."),
  updatedAt: ISODate("2026-09-26T...")
}
```

### 6.4. Collection: `TheLoai` *(Bổ trợ chuẩn hóa danh mục thể loại sách)*
*Mô tả: Lưu trữ danh mục các thể loại sách chuẩn hóa, phục vụ bộ lọc tìm kiếm chính xác và thống nhất toàn hệ thống.*
```javascript
{
  _id: ObjectId("..."),
  MaTheLoai: "TL01",                   // Unique, index (Mã thể loại)
  TenTheLoai: "Công nghệ thông tin",   // Unique, index (Tên thể loại chuẩn)
  MoTa: "Sách chuyên ngành công nghệ thông tin, khoa học máy tính, lập trình và phần mềm",
  TrangThai: "ACTIVE",                 // Enum: "ACTIVE", "INACTIVE"
  createdAt: ISODate("2026-09-28T..."),
  updatedAt: ISODate("2026-09-28T...")
}
```

### 6.5. Collection: `Sach`
*Đặc tả tối thiểu theo đề tài: `Sach(MaSach, TenSach, DonGia, SoQuyen, NamXuatBan, MaNXB, NguonGoc/TacGia)` + mở rộng hệ thống.*
```javascript
{
  _id: ObjectId("..."),
  // === THUỘC TÍNH TỐI THIỂU BẮT BUỘC THEO ĐỀ TÀI ===
  MaSach: "S001",                      // Unique, index (Mã sách)
  TenSach: "Lập Trình Web Hiện Đại với Vue 3 & Express", // Tên sách
  DonGia: 185000,                      // Đơn giá (VNĐ)
  SoQuyen: 5,                          // Tổng số quyển nhập kho
  NamXuatBan: 2024,                    // Năm phát hành
  MaNXB: "NXB01",                      // Tham chiếu NhaXuatBan.MaNXB
  TacGia: "Evan You & TJ Holowaychuk", // Tác giả chính (tương ứng NguonGoc/TacGia)
  NguonGoc: "Evan You & TJ Holowaychuk", // Nguồn gốc / Đơn vị cung cấp (tương ứng NguonGoc/TacGia)
  // === THUỘC TÍNH BỔ SUNG & MỞ RỘNG HỆ THỐNG HIỆN TẠI ===
  MaTheLoai: "TL01",                   // Tham chiếu TheLoai.MaTheLoai (Index)
  TheLoai: "Công nghệ thông tin",      // Index (Tên thể loại hiển thị)
  ISBN: "978-604-0-10001-1",           // Unique index
  HinhAnh: "https://...",              // Đường dẫn ảnh bìa sách
  MoTa: "Cẩm nang toàn diện về xây dựng Single Page Applications...",
  ViTri: "Kệ A1-01 (Tầng 2)",          // Vị trí kệ sách
  SoQuyenKhaDung: 4,                   // Số bản sách đang rảnh cho mượn (Index)
  SoQuyenDangMuon: 1,                  // Số bản sách đang được mượn
  SoQuyenHuHong: 0,                    // Số bản bị hư hại hoặc mất
  TrangThai: "ACTIVE",                 // Enum: "ACTIVE", "ARCHIVED" (Soft Delete, Index)
  createdAt: ISODate("2026-09-26T..."),
  updatedAt: ISODate("2026-09-26T...")
}
```

### 6.5. Collection: `TheoDoiMuonSach`
*Đặc tả tối thiểu theo đề tài: `TheoDoiMuonSach(MaDocGia, MaSach, NgayMuon, NgayTra)` + mở rộng hệ thống.*
```javascript
{
  _id: ObjectId("..."),
  // === THUỘC TÍNH TỐI THIỂU BẮT BUỘC THEO ĐỀ TÀI ===
  MaDocGia: "DG001",                   // Tham chiếu DocGia.MaDocGia (Index)
  MaSach: "S001",                      // Tham chiếu Sach.MaSach (Index)
  NgayMuon: ISODate("2026-09-21T..."), // Thời điểm thực tế xuất sách (Check-out)
  NgayTra: null,                       // Thời điểm thực tế nhận trả sách
  // === THUỘC TÍNH BỔ SUNG & MỞ RỘNG HỆ THỐNG HIỆN TẠI ===
  DocGiaId: ObjectId("..."),           // Ref DocGia, index
  SachId: ObjectId("..."),             // Ref Sach, index
  TrangThai: "BORROWED",               // Enum: "PENDING", "APPROVED", "BORROWED", "RETURNED", "CANCELLED", "EXPIRED", "REJECTED", "OVERDUE"
  NgayYeuCau: ISODate("2026-09-20T..."),
  NgayHenLay: ISODate("2026-09-21T..."), // Ngày hẹn đến quầy nhận sách
  HanChotNhan: ISODate("2026-09-23T..."),// Hết hạn giữ sách sau 48h nếu chưa lấy
  HanTra: ISODate("2026-10-05T..."),   // Hạn trả sách (14 ngày sau NgayMuon), index
  SoLanGiaHan: 0,                      // Số lần gia hạn (tối đa 1 lần)
  MSNVDuyet: "NV002",                  // Tham chiếu NhanVien.MSNV
  NhanVienDuyetId: ObjectId("..."),    // Ref NhanVien
  GhiChu: "Đã xuất sách tại quầy cho độc giả",
  createdAt: ISODate("2026-09-20T..."),
  updatedAt: ISODate("2026-09-21T...")
}
```

### 6.6. Collection: `BienBanBoiThuong`
*Mô tả: Biên bản sự cố sách rách, mất và bồi thường tại quầy.*
```javascript
{
  _id: ObjectId("..."),
  MaBienBan: "BB0001",                 // Unique index
  MaTheoDoiMuon: "66f4...",            // ID phiếu mượn
  TheoDoiMuonId: ObjectId("..."),      // Ref TheoDoiMuonSach, index
  MaDocGia: "DG002",                   // Tham chiếu DocGia.MaDocGia
  DocGiaId: ObjectId("..."),           // Ref DocGia, index
  MaSach: "S005",                      // Tham chiếu Sach.MaSach
  SachId: ObjectId("..."),             // Ref Sach
  LoaiSuCo: "DAMAGED",                 // Enum: "DAMAGED", "LOST"
  MoTa: "Rách 12 trang phần giữa sách và ướt bìa sau",
  SoTienBoiThuong: 45000,              // Số tiền bồi thường thủ thư thẩm định (VNĐ)
  TrangThai: "UNPAID",                 // Enum: "UNPAID", "PAID" (Index)
  NgayLap: ISODate("2026-09-26T..."),
  NgayGiaiQuyet: null,                 // Thời điểm đã đóng tiền bồi thường
  MSNVThuTien: null,                   // Tham chiếu NhanVien.MSNV
  NhanVienThuTienId: null,             // Ref NhanVien
  GhiChu: "Biên bản lập bởi nhân viên kiểm kê: Thủ Thư Trưởng",
  createdAt: ISODate("2026-09-26T..."),
  updatedAt: ISODate("2026-09-26T...")
}
```

### 6.7. Collection: `CauHinhHeThong`
*Mô tả: Cấu hình quy chế mượn - trả và tự động hóa toàn thư viện.*
```javascript
{
  _id: ObjectId("..."),
  KhoaCauHinh: "QUY_DINH_MUON",
  SoSachMuonToiDa: 3,                  // Số sách tối đa được mượn cùng lúc
  SoNgayMuonToiDa: 14,                 // Số ngày mượn 1 lượt
  ThoiGianGiuSachGio: 48,              // Thời hạn giữ sách sau khi duyệt (48 giờ)
  SoNgayGiaHan: 7,                     // Số ngày gia hạn thêm
  SoLanGiaHanToiDa: 1,                 // Số lần gia hạn tối đa
  SoNgayTreHanVaoDanhSachDen: 15       // Trễ quá 15 ngày tự động vào blacklist
}
```

### 6.8. Collection: `NhatKyHoatDong`
*Mô tả: Collection bổ trợ lưu trữ nhật ký truy vết tác nghiệp quản trị (Audit Trail) phục vụ giám sát và thanh tra.*
```javascript
{
  _id: ObjectId("..."),
  ThoiGian: ISODate("2026-09-26T20:45:00.000Z"), // Index
  HanhDong: "CHECKOUT_BOOK",                    // Index (Enum: APPROVE_BORROW, REJECT_BORROW, CHECKOUT_BOOK, CHECKIN_BOOK, CREATE_FINE, PAY_FINE, BLACKLIST_USER, UNBLACKLIST_USER, CHANGE_ROLE, UPDATE_CONFIG...)
  NguoiThucHien: {
    NhanVienId: ObjectId("..."),                // Ref NhanVien, index
    MSNV: "NV001",
    HoTen: "Quản Trị Viên Hệ Thống",
    ChucVu: "ADMIN",
    DiaChiIP: "192.168.1.50",
    UserAgent: "Mozilla/5.0..."
  },
  DoiTuongTacDong: {
    Collection: "TheoDoiMuonSach",              // Index
    DocumentId: ObjectId("..."),                // Index
    MaDinhDanh: "DG001 - S001"
  },
  ChiTiet: "Đã xuất sách 'Lập Trình Web Hiện Đại với Vue 3' cho độc giả Trần Văn Độc Giả (DG001) tại quầy",
  DuLieuCu: { TrangThai: "APPROVED", HanTra: null },
  DuLieuMoi: { TrangThai: "BORROWED", HanTra: ISODate("2026-10-10T...") }
}
```

---

## 7. CẤU TRÚC MONOREPO VÀ THIẾT KẾ MÃ NGUỒN

Dự án được bố trí theo cấu trúc Monorepo trong cùng thư mục `books_management`:

```text
books_management/
├── PROJECT_MASTER_GUIDE.md
├── package.json                    # Script chạy đồng thời cả 3 service (npm run dev)
│
├── backend/                        # RESTful API Server (Node.js + Express + MongoDB) -> Port 5000
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js               # Kết nối MongoDB Native / Mongoose
│   │   │   ├── jwt.js              # Cấu hình Secret & Expiration
│   │   │   ├── logger.js           # Cấu hình Winston Logger & Daily Rotate File
│   │   │   └── googleOAuth.js      # Cấu hình Google OAuth 2.0 Client
│   │   ├── controllers/
│   │   │   ├── authController.js      # Đăng nhập, đăng ký, Google callback, Refresh token
│   │   │   ├── bookController.js      # CRUD sách (Sach), kiểm kê kho, tìm kiếm
│   │   │   ├── categoryController.js  # CRUD Thể loại (TheLoai)
│   │   │   ├── publisherController.js # CRUD Nhà xuất bản (NhaXuatBan)
│   │   │   ├── borrowController.js    # Mượn trả (TheoDoiMuonSach), duyệt, xuất sách, gia hạn
│   │   │   ├── fineController.js      # Biên bản bồi thường (BienBanBoiThuong)
│   │   │   ├── userController.js      # Quản lý Độc giả (DocGia) & Nhân viên (NhanVien), Blacklist
│   │   │   ├── uploadController.js    # Xử lý upload ảnh bìa và avatar
│   │   │   ├── statsController.js     # Tổng hợp dashboard, thống kê vi phạm, top sách, audit logs
│   │   │   └── healthController.js    # Kiểm tra sức khỏe hệ thống (GET /api/health)
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js      # Verify JWT Access Token (hỗ trợ NhanVien & DocGia)
│   │   │   ├── roleMiddleware.js      # Phân quyền: requireAdmin, requireBookManager, requireUser
│   │   │   ├── rateLimiter.js         # Phân tầng giới hạn tần suất API (Auth, Borrow, General)
│   │   │   ├── borrowCheck.js         # Kiểm tra Blacklist, quá hạn, nợ phạt trước khi mượn
│   │   │   ├── uploadMiddleware.js    # Cấu hình Multer upload ảnh vào thư mục cục bộ
│   │   │   ├── responseEnvelope.js    # Đóng gói chuẩn JSON Success & Error Envelope
│   │   │   └── errorMiddleware.js     # Xử lý lỗi tập trung & phân loại mã lỗi nghiệp vụ
│   │   ├── models/                    # 9 MongoDB Collections (5 bắt buộc + 4 bổ trợ chuẩn hóa tiếng Việt)
│   │   │   ├── DocGia.js              # Collection DocGia (Mã độc giả, họ lót, tên, ngày sinh, phái...)
│   │   │   ├── NhanVien.js            # Collection NhanVien (MSNV, họ tên, password, chức vụ...)
│   │   │   ├── NhaXuatBan.js          # Collection NhaXuatBan (Mã NXB, tên NXB, địa chỉ...)
│   │   │   ├── TheLoai.js             # Collection TheLoai (Mã thể loại, tên thể loại, mô tả...)
│   │   │   ├── Sach.js                # Collection Sach (Mã sách, tên sách, đơn giá, số quyển, năm XB, mã NXB, mã thể loại...)
│   │   │   ├── TheoDoiMuonSach.js     # Collection TheoDoiMuonSach (Mã độc giả, mã sách, ngày mượn, ngày trả...)
│   │   │   ├── BienBanBoiThuong.js    # Collection BienBanBoiThuong (Mã biên bản, tiền phạt, trạng thái...)
│   │   │   ├── CauHinhHeThong.js      # Collection CauHinhHeThong (Quy chế thư viện)
│   │   │   └── NhatKyHoatDong.js      # Collection NhatKyHoatDong (Audit Trail truy vết tác nghiệp)
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── bookRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── publisherRoutes.js
│   │   │   ├── borrowRoutes.js
│   │   │   ├── fineRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── uploadRoutes.js
│   │   │   ├── statsRoutes.js
│   │   │   └── healthRoutes.js
│   │   └── server.js                  # Entrypoint: Pre-flight check, Express app, Helmet, CORS, Routes, Graceful shutdown
│   ├── logs/                          # Thư mục nhật ký xoay vòng hàng ngày (Daily Rotate Logs)
│   │   ├── application-YYYY-MM-DD.log # Log nghiệp vụ, Info, Warn
│   │   └── error-YYYY-MM-DD.log       # Log lỗi ngoại lệ hệ thống
│   ├── uploads/                    # Thư mục lưu trữ file ảnh cục bộ
│   │   ├── covers/                 # Ảnh bìa sách
│   │   └── avatars/                # Ảnh đại diện người dùng
│   ├── .env.example
│   └── package.json
│
├── frontend-user/                  # User Portal (Vue 3 + Bootstrap 5) -> Port 3000
│   ├── src/
│   │   ├── assets/                 # Custom CSS, logo
│   │   ├── components/
│   │   │   ├── Navbar.vue          # Thanh điều hướng, menu người dùng, giỏ đăng ký mượn
│   │   │   ├── BookCard.vue        # Thẻ hiển thị sách, nút mượn sách
│   │   │   ├── BorrowModal.vue     # Hộp thoại xác nhận đăng ký mượn sách
│   │   │   ├── StatusBadge.vue     # Huy hiệu trạng thái mượn / hạn trả
│   │   │   └── ToastContainer.vue  # Toast thông báo toàn cục (dùng useToast composable)
│   │   ├── composables/
│   │   │   └── useToast.js         # Reactive singleton quản lý trạng thái toast (success/error/warning/info)
│   │   ├── views/
│   │   │   ├── HomeView.vue        # Trang chủ: Giới thiệu & Sách nổi bật
│   │   │   ├── BooksView.vue       # Khám phá toàn bộ sách, bộ lọc, tìm kiếm
│   │   │   ├── BookDetailView.vue  # Chi tiết sách
│   │   │   ├── MyBorrowsView.vue   # Quản lý sách đang mượn & Lịch sử mượn
│   │   │   ├── ProfileView.vue     # Thông tin cá nhân, đổi mật khẩu (toggle ẩn/hiện), biên bản đền bù
│   │   │   ├── LoginView.vue       # Đăng nhập thường (toggle ẩn/hiện mật khẩu) & Google Sign-In
│   │   │   └── RegisterView.vue    # Đăng ký độc giả mới (toggle ẩn/hiện mật khẩu & xác nhận)
│   │   ├── router/                 # Vue Router (bảo vệ các trang MyBorrows, Profile)
│   │   ├── stores/                 # Pinia: authStore, cartStore
│   │   ├── services/api.js         # Cấu hình Axios + Auto Refresh Token Interceptor
│   │   └── App.vue
│   ├── index.html
│   ├── vite.config.js              # Cấu hình server port: 3000
│   └── package.json
│
└── frontend-admin/                 # Admin & Staff Portal (Vue 3 + Bootstrap 5) -> Port 3001
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── AdminSidebar.vue    # Menu điều hướng quản trị
    │   │   ├── AdminNavbar.vue     # Thông tin nhân viên, nút đăng xuất
    │   │   ├── BookModal.vue       # Modal thêm/sửa sách
    │   │   ├── DamageModal.vue     # Modal lập biên bản sách hỏng/mất & ghi nhận bồi thường
    │   │   ├── ConfirmDialog.vue   # Modal xác nhận thao tác
    │   │   └── ToastContainer.vue  # Toast thông báo toàn cục (dùng useToast composable)
    │   ├── composables/
    │   │   └── useToast.js         # Reactive singleton quản lý trạng thái toast (success/error/warning/info)
    │   ├── views/
    │   │   ├── DashboardView.vue   # Bảng điều khiển thống kê (Cards + Charts)
    │   │   ├── BooksManageView.vue # Danh sách sách, thêm/sửa/xóa, kiểm kê số lượng
    │   │   ├── BorrowQueueView.vue # Duyệt yêu cầu mượn, xác nhận xuất sách (Check-out)
    │   │   ├── ReturnsView.vue     # Nhận trả sách (Check-in), kiểm tra hư hại
    │   │   ├── FinesView.vue       # Quản lý biên bản bồi thường, thu tiền tại quầy
    │   │   ├── UsersManageView.vue # Quản lý tài khoản, quản lý Blacklist
    │   │   └── SettingsView.vue    # Cấu hình quy chế mượn (Admin only)
    │   ├── router/                 # Vue Router (Guard chặn người dùng thường, phân quyền BOOK_MANAGER)
    │   ├── stores/                 # Pinia: adminAuthStore, bookStore, borrowStore
    │   ├── services/api.js         # Axios client gọi API port 5000
    │   └── App.vue
    ├── index.html
    ├── vite.config.js              # Cấu hình server port: 3001
    └── package.json
```

---

## 8. BIỂU ĐỒ QUY TRÌNH NGHIỆP VỤ MƯỢN TRẢ & BỒI THƯỜNG

```mermaid
sequenceDiagram
    autonumber
    actor Độc Giả as Độc Giả (User Portal: 3000)
    actor Thủ Thư as Thủ Thư / Admin (Admin Portal: 3001)
    participant API as Backend Express API (Port 5000)
    participant DB as MongoDB

    Note over Độc Giả, API: 1. Đăng ký mượn sách
    Độc Giả->>API: POST /api/borrows (MaSach, NgayHenLay)
    API->>DB: Kiểm tra Blacklist, hạn mức (tối đa 3 cuốn), nợ phạt, số lượng còn lại
    alt Vi phạm ràng buộc
        API-->>Độc Giả: 400 Bad Request (Thông báo lý do từ chối bằng tiếng Việt tự nhiên)
    else Hợp lệ
        API->>DB: Lưu phiếu TheoDoiMuonSach (TrangThai = 'PENDING')
        API-->>Độc Giả: 201 Created (Đăng ký thành công, chờ duyệt)
    end

    Note over Thủ Thư, API: 2. Duyệt & Giao sách
    Thủ Thư->>API: PUT /api/borrows/:id/approve
    API->>DB: Cập nhật TrangThai = 'APPROVED', HanChotNhan = +48h
    Độc Giả->>Thủ Thư: Đến quầy thư viện nhận sách
    Thủ Thư->>API: PUT /api/borrows/:id/checkout
    API->>DB: TrangThai = 'BORROWED', HanTra = +14 ngày, SoQuyenKhaDung -= 1, SoQuyenDangMuon += 1

    Note over Độc Giả, Thủ Thư: 3. Trả sách & Xử lý sự cố
    Độc Giả->>Thủ Thư: Mang sách đến quầy trả
    alt Sách nguyên vẹn
        Thủ Thư->>API: PUT /api/borrows/:id/checkin (NORMAL)
        API->>DB: TrangThai = 'RETURNED', SoQuyenKhaDung += 1, SoQuyenDangMuon -= 1
        API-->>Thủ Thư: Hoàn tất nhận trả sách
    else Sách rách hoặc mất
        Thủ Thư->>API: POST /api/fines (Lập BienBanBoiThuong: LoaiSuCo, SoTienBoiThuong, TrangThai='UNPAID')
        API->>DB: Lưu BienBanBoiThuong, tạm khóa quyền mượn sách mới của Độc giả
        Thủ Thư-->>Độc Giả: Thông báo số tiền bồi thường
        Độc Giả->>Thủ Thư: Nộp tiền mặt / chuyển khoản tại quầy
        Thủ Thư->>API: PUT /api/fines/:id/pay
        API->>DB: TrangThai = 'PAID', mở lại quyền mượn sách cho Độc giả
    end
```

---

## 9. QUY CHUẨN KIẾN TRÚC PHẢN HỒI API, KIỂM TRA SỨC KHỎE & DANH SÁCH RESTFUL API

### 9.1. Chuẩn Hóa Kiến Trúc Phản Hồi API (API Response Envelope Specification)

Toàn bộ các API của hệ thống bắt buộc phải đóng gói dữ liệu phản hồi (Response Envelope) theo định dạng JSON thống nhất, giúp Client dễ dàng xử lý, bắt lỗi và hiển thị thông báo thân thiện:

#### 1. Định dạng Phản hồi Thành công (Success Response):
```json
{
  "success": true,
  "data": {
    /* Dữ liệu chính trả về (Object hoặc Array) */
  },
  "message": "Đăng ký mượn sách thành công! Yêu cầu đang chờ thủ thư duyệt.",
  "meta": {
    "timestamp": "2026-09-26T20:40:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 12,
      "totalRecords": 45,
      "totalPages": 4
    }
  }
}
```

#### 2. Định dạng Phản hồi Thất bại (Error Response):
```json
{
  "success": false,
  "error": {
    "code": "BORROW_LIMIT_EXCEEDED",
    "message": "Bạn đã đạt giới hạn mượn tối đa 3 cuốn sách theo quy định.",
    "details": {
      "currentBorrowing": 2,
      "pendingRequests": 1,
      "maxAllowed": 3
    }
  },
  "timestamp": "2026-09-26T20:40:00.000Z"
}
```

---

### 9.2. Bảng Mã Lỗi Nghiệp Vụ Chuẩn Hóa Toàn Hệ Thống (Standardized Error Codes)

| Mã lỗi (Error Code) | HTTP Status | Thông điệp tiếng Việt tự nhiên | Ý nghĩa & Hướng dẫn xử lý |
| :--- | :---: | :--- | :--- |
| `AUTH_INVALID_CREDENTIALS` | 401 | Email hoặc mật khẩu không chính xác. | Đăng nhập thất bại do sai thông tin xác thực |
| `AUTH_TOKEN_EXPIRED` | 401 | Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại. | Access Token hết hạn, kích hoạt tự động refresh token |
| `AUTH_UNAUTHORIZED` | 401 | Bạn cần đăng nhập để thực hiện tính năng này. | Chưa gửi Bearer token |
| `AUTH_FORBIDDEN` | 403 | Bạn không có quyền truy cập vào tài nguyên này. | Vi phạm phân quyền vai trò RBAC |
| `RATE_LIMIT_EXCEEDED` | 429 | Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau ít phút. | Vượt ngưỡng giới hạn tần suất gọi API |
| `BORROW_LIMIT_EXCEEDED` | 400 | Bạn đã đạt giới hạn mượn tối đa 3 cuốn sách. | Chặn mượn do vượt tổng hạn mức (đang giữ + chờ duyệt >= 3) |
| `BORROW_DUPLICATE_BOOK` | 400 | Bạn đang mượn cuốn sách này rồi, vui lòng chọn đầu sách khác. | Chặn mượn 2 cuốn trùng cùng một đầu sách |
| `BORROW_OVERDUE_DEBT` | 400 | Bạn có sách mượn đã quá hạn trả. Vui lòng trả sách trước khi mượn mới. | Chặn mượn do có sách trễ hạn |
| `BORROW_BLACKLISTED` | 403 | Tài khoản tạm thời bị khóa quyền mượn sách do vi phạm quy chế. | Độc giả nằm trong danh sách Blacklist |
| `BOOK_OUT_OF_STOCK` | 400 | Cuốn sách này hiện đã tạm hết bản rảnh trên kệ. | Số bản khả dụng `SoQuyenKhaDung === 0` |
| `BOOK_CANNOT_DELETE_BORROWED` | 400 | Không thể chuyển vào kho lưu trữ vì đang có bạn đọc mượn cuốn sách này. | Bảo vệ dữ liệu, cấm xóa sách khi `SoQuyenDangMuon > 0` |
| `FINE_ALREADY_PAID` | 400 | Biên bản bồi thường này đã được thanh toán trước đó. | Tránh xác nhận thu tiền 2 lần cho cùng 1 biên bản |
| `FILE_TOO_LARGE` | 400 | Kích thước tập tin vượt quá dung lượng cho phép. | Avatar > 2MB hoặc Ảnh bìa > 5MB |
| `FILE_INVALID_TYPE` | 400 | Định dạng tập tin không hợp lệ. Chỉ chấp nhận .jpg, .png, .webp. | Sai MIME Type thực tế |
| `VALIDATION_FAILED` | 422 | Dữ liệu gửi lên không đúng định dạng quy định. | Vi phạm ràng buộc kiểu dữ liệu hoặc thiếu trường bắt buộc |
| `RESOURCE_NOT_FOUND` | 404 | Không tìm thấy dữ liệu yêu cầu. | Bản ghi không tồn tại trong Database |
| `INTERNAL_SERVER_ERROR` | 500 | Hệ thống đang bận hoặc gián đoạn kết nối. Vui lòng thử lại sau ít phút. | Lỗi ngoại lệ hệ thống không mong muốn |

---

### 9.3. Kiểm Tra Sức Khỏe Hệ Thống & Vận Hành Bền Bỉ (Health Check & System Reliability)

1. **Endpoint Kiểm tra Sức khỏe Hệ thống (`GET /api/health`):**
   - Hỗ trợ giám sát tự động tình trạng sẵn sàng phục vụ của máy chủ Express và cơ sở dữ liệu MongoDB:
   - **Response mẫu:**
     ```json
     {
       "success": true,
       "status": "UP",
       "timestamp": "2026-09-26T20:40:00.000Z",
       "uptimeSeconds": 86400,
       "environment": "production",
       "database": {
         "status": "CONNECTED",
         "host": "localhost:27017",
         "name": "books_management",
         "latencyMs": 3
       },
       "system": {
         "memoryUsageMB": {
           "rss": 65.4,
           "heapTotal": 42.1,
           "heapUsed": 28.6
         },
         "nodeVersion": "v20.12.0"
       }
     }
     ```
2. **Quy trình Tắt Máy An Toàn (Graceful Shutdown):**
   - Lắng nghe các tín hiệu dừng tiến trình `SIGTERM` và `SIGINT` (Ctrl + C):
     * Ngừng tiếp nhận các request HTTP mới từ client.
     * Chờ đợi các request HTTP đang xử lý dở hoàn tất (thời hạn tối đa 10 giây).
     * Đóng an toàn kết nối MongoDB Client / Mongoose Connection để tránh rò rỉ hoặc hỏng tệp dữ liệu.
     * Thoát tiến trình Node.js với mã thành công (`process.exit(0)`).
3. **Tiền Kiểm Tra Biến Môi Trường (Environment Pre-flight Validation):**
   - Ngay khi server khởi động (trước khi gọi `app.listen`), hệ thống tự động kiểm tra sự hiện diện của toàn bộ biến môi trường bắt buộc trong `.env` (`PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_USER_URL`, `FRONTEND_ADMIN_URL`).
   - Nếu phát hiện thiếu bất kỳ biến nào, server lập tức in thông báo cảnh báo rõ ràng ra console và dừng khởi động ngay thay vì chạy với trạng thái lỗi ngầm.

---

### 9.4. Danh Sách RESTful API Chi Tiết (Backend Express - Port 5000)

#### 9.4.1. Nhóm Xác thực & Hồ sơ (`/api/auth`)
- `POST /api/auth/register`: Đăng ký tài khoản độc giả mới (kiểm tra trùng email, mã hóa BCrypt).
- `POST /api/auth/reader/login`: Đăng nhập chuyên biệt cho Cổng Độc giả (Controller: `readerLogin` - chỉ chấp nhận vai trò `USER`, từ chối tài khoản Quản trị / Nhân viên với HTTP 403).
- `POST /api/auth/admin/login`: Đăng nhập chuyên biệt cho Cổng Quản trị & Thủ thư (Controller: `adminLogin` - chỉ chấp nhận vai trò `ADMIN` hoặc `BOOK_MANAGER`, từ chối tài khoản Độc giả với HTTP 403).
- `POST /api/auth/login`: Endpoint đăng nhập điều hướng thông minh (Controller: `login` - hỗ trợ tương thích ngược cho các client cũ và script kiểm thử).
- `POST /api/auth/google`: Đăng nhập/Đăng ký qua Google OAuth 2.0 (nhận Google ID token từ client, chỉ dành cho độc giả).
- `POST /api/auth/refresh-token`: Cấp mới accessToken khi token cũ hết hạn qua refreshToken.
- `GET /api/auth/me`: Lấy thông tin tài khoản hiện tại kèm quyền hạn.
- `PUT /api/auth/profile`: Cập nhật thông tin cá nhân (Số điện thoại, địa chỉ, họ tên).
- `PUT /api/auth/change-password`: Đổi mật khẩu cá nhân (yêu cầu mật khẩu cũ + mật khẩu mới, kiểm tra độ mạnh).

#### 9.4.2. Nhóm Quản lý Sách (`/api/books`)
- `GET /api/books`: Lấy danh sách sách (hỗ trợ phân trang, lọc theo thể loại `theLoai`/`MaTheLoai`, tìm kiếm tiếng Việt không dấu tức thì, lọc `availableOnly`, sắp xếp có hỗ trợ Collation tiếng Việt).
- `GET /api/books/:id`: Lấy chi tiết sách theo ID hoặc Mã sách (trả kèm `TheLoaiInfo`).
- `POST /api/books`: Thêm sách mới *(Quyền: ADMIN, BOOK_MANAGER)*.
- `PUT /api/books/:id`: Cập nhật thông tin sách *(Quyền: ADMIN, BOOK_MANAGER)*.
- `DELETE /api/books/:id`: Xóa/Lưu trữ sách an toàn *(Quyền: ADMIN, BOOK_MANAGER - Chặn xóa nếu `SoQuyenDangMuon > 0`)*.

#### 9.4.3. Nhóm Quản lý Thể Loại Sách (`/api/categories`)
- `GET /api/categories`: Lấy danh sách toàn bộ danh mục thể loại chuẩn hóa (Public).
- `GET /api/categories/:id`: Lấy chi tiết thể loại theo ID hoặc Mã thể loại (Public).
- `POST /api/categories`: Thêm mới thể loại sách *(Quyền: ADMIN, BOOK_MANAGER)*.
- `PUT /api/categories/:id`: Cập nhật thể loại sách *(Quyền: ADMIN, BOOK_MANAGER)*.
- `DELETE /api/categories/:id`: Xóa thể loại sách *(Quyền: ADMIN)*.

#### 9.4.4. Nhóm Quản lý Nhà Xuất Bản (`/api/publishers`)
- `GET /api/publishers`: Lấy danh sách toàn bộ các Nhà xuất bản.
- `GET /api/publishers/:id`: Xem chi tiết thông tin Nhà xuất bản theo ID hoặc MaNXB.
- `POST /api/publishers`: Thêm mới Nhà xuất bản *(Quyền: ADMIN, BOOK_MANAGER)*.
- `PUT /api/publishers/:id`: Cập nhật thông tin Nhà xuất bản *(Quyền: ADMIN, BOOK_MANAGER)*.
- `DELETE /api/publishers/:id`: Xóa Nhà xuất bản *(Quyền: ADMIN)*.

#### 9.4.5. Nhóm Mượn - Trả Sách (`/api/borrows`)
- `POST /api/borrows`: Độc giả gửi yêu cầu mượn sách *(Quyền: USER - Kiểm tra 5 ràng buộc mượn, áp dụng Rate Limit)*.
- `GET /api/borrows/my-borrows` hoặc `GET /api/borrows/my-history`: Độc giả xem danh sách phiếu mượn và yêu cầu của chính mình *(Quyền: USER)*.
- `PUT /api/borrows/:id/cancel` hoặc `PATCH /api/borrows/:id/cancel`: Độc giả tự hủy yêu cầu mượn khi còn `PENDING` *(Quyền: USER)*.
- `PUT /api/borrows/:id/renew` hoặc `PATCH /api/borrows/:id/renew`: Độc giả gia hạn mượn thêm 7 ngày *(Quyền: USER - Tối đa 1 lần khi chưa quá hạn)*.
- `GET /api/borrows`: Lấy danh sách phiếu mượn toàn thư viện theo bộ lọc trạng thái *(Quyền: ADMIN, BOOK_MANAGER)*.
- `PUT /api/borrows/:id/approve`: Duyệt yêu cầu mượn, bắt đầu tính hạn giữ 48h *(Quyền: ADMIN)*.
- `PUT /api/borrows/:id/reject`: Từ chối yêu cầu mượn kèm lý do gửi bạn đọc *(Quyền: ADMIN)*.
- `PUT /api/borrows/:id/checkout`: Xác nhận xuất sách cho bạn đọc tại quầy, tính hạn trả 14 ngày *(Quyền: ADMIN)*.
- `PUT /api/borrows/:id/checkin`: Xác nhận nhận lại sách nguyên vẹn tại quầy, cộng lại kho *(Quyền: ADMIN)*.

#### 9.4.5. Nhóm Xử lý Sách Hư Hỏng / Mất & Đền Bù (`/api/fines`)
- `POST /api/fines`: Lập biên bản sách rách / mất kèm số tiền thủ thư thẩm định *(Quyền: ADMIN - Tạm khóa mượn của bạn đọc)*.
- `GET /api/fines`: Xem danh sách biên bản bồi thường, lọc theo `UNPAID` / `PAID` *(Quyền: ADMIN)*.
- `GET /api/fines/my-fines`: Độc giả xem các khoản bồi thường của bản thân *(Quyền: USER)*.
- `PUT /api/fines/:id/pay`: Xác nhận đã thu tiền bồi thường tại quầy và giải tỏa quyền mượn sách *(Quyền: ADMIN)*.

#### 9.4.6. Nhóm Quản lý Người Dùng & Blacklist (`/api/users`)
- `GET /api/users`: Danh sách người dùng hệ thống phân loại theo vai trò *(Quyền: ADMIN)*.
- `POST /api/users`: Admin tạo mới người dùng hoặc thủ thư trực tiếp *(Quyền: ADMIN)*.
- `PUT /api/users/:id/role`: Cập nhật phân quyền (`USER` <-> `BOOK_MANAGER`) *(Quyền: ADMIN)*.
- `PUT /api/users/:id/blacklist`: Khóa hoặc mở khóa quyền mượn kèm ghi chú lý do *(Quyền: ADMIN)*.

#### 9.4.7. Nhóm Tải lên Tập tin Hình ảnh (`/api/upload`)
- `POST /api/upload/cover`: Upload ảnh bìa sách (tối đa 5MB, kiểm tra MIME, lưu `/uploads/covers`) *(Quyền: ADMIN, BOOK_MANAGER)*.
- `POST /api/upload/avatar`: Upload avatar người dùng (tối đa 2MB, kiểm tra MIME, lưu `/uploads/avatars`) *(Quyền: Mọi tài khoản đăng nhập)*.

#### 9.4.8. Nhóm Thống kê, Báo cáo & Audit Log (`/api/stats`)
- `GET /api/stats/summary`: Số liệu tổng quan Dashboard KPI *(Quyền: ADMIN)*.
- `GET /api/stats/top-books`: Top 10 sách được mượn nhiều nhất *(Quyền: ADMIN)*.
- `GET /api/stats/damage-overview`: Thống kê sách hỏng/mất và tiền đền bù *(Quyền: ADMIN)*.
- `GET /api/stats/export/borrows`: Xuất danh sách mượn - trả ra file CSV UTF-8 *(Quyền: ADMIN)*.
- `GET /api/stats/export/fines`: Xuất danh sách vi phạm & đền bù ra file CSV UTF-8 *(Quyền: ADMIN)*.
- `GET /api/stats/audit-logs`: Xem danh sách nhật ký truy vết tác nghiệp quản trị hệ thống *(Quyền: ADMIN)*.

#### 9.4.9. Nhóm Kiểm tra Vận hành (`/api/health`)
- `GET /api/health`: Kiểm tra trạng thái máy chủ, bộ nhớ, uptime và kết nối cơ sở dữ liệu MongoDB *(Quyền: Công khai)*.

---

## 10. CHIẾN LƯỢC GHI LOG & NHẬT KÝ TRUY VẾT TÁC NGHIỆP (AUDIT TRAIL & LOGGING STRATEGY)

Để đảm bảo khả năng giám sát hệ thống, phát hiện sớm các sự cố kỹ thuật và minh bạch trách nhiệm trong toàn bộ các tác nghiệp quản trị, hệ thống thiết lập cơ chế ghi log và truy vết toàn diện:

### 10.1. Hệ Thống Ghi Log Đa Tầng (Multi-Tier Structured Logging)

1. **Tầng Ghi nhận Truy cập HTTP (HTTP Access Logging với `morgan`):**
   - Ghi nhận mọi lượt request gửi tới server: Phương thức HTTP, Endpoint, Mã phản hồi, Thời gian xử lý (`:method :url :status :response-time ms`).
   - Trong môi trường phát triển (`development`): In màu sắc trực quan ra terminal (`dev` format).
   - Trong môi trường sản xuất (`production`): Định dạng chuẩn JSON hoặc `combined` đẩy vào tệp nhật ký truy cập hàng ngày.
2. **Tầng Ghi nhận Lỗi & Nghiệp vụ (Application & Error Logging với `winston`):**
   - Phân cấp 4 mức độ log rõ ràng:
     * `ERROR`: Các lỗi nghiêm trọng (Database mất kết nối, lỗi 500 unhandled, lỗi giao dịch mượn sách).
     * `WARN`: Các tình huống bất thường cần lưu ý (Đăng nhập sai quá 3 lần, sách còn 1 cuốn khả dụng, request quá hạn 48h bị hủy).
     * `INFO`: Các mốc nghiệp vụ bình thường (Khởi động server thành công, nạp seed data thành công, tài khoản mới đăng ký).
     * `DEBUG`: Thông tin chi tiết phục vụ gỡ lỗi trong môi trường phát triển.
3. **Cơ chế Luân chuyển và Dọn dẹp Log (Daily Log Rotation):**
   - Sử dụng `winston-daily-rotate-file`:
     * Tự động tạo tệp log mới mỗi ngày: `logs/application-%DATE%.log` và `logs/error-%DATE%.log`.
     * Tự động nén các tệp log cũ (`zippedArchive: true`).
     * Giới hạn kích thước tệp log tối đa **20MB** và tự động xóa các bản log cũ hơn **30 ngày** (`maxFiles: '30d'`), chống tràn dung lượng ổ cứng máy chủ.

---

### 10.2. Hệ Thống Nhật Ký Truy Vết Tác Nghiệp Quản Trị (Audit Trail System)

Trong môi trường thư viện học, tính minh bạch về việc **"Ai đã làm gì? Vào thời điểm nào? Với đối tượng nào?"** là bắt buộc để giải quyết khiếu nại của bạn đọc và kiểm kê tài sản:

#### 1. Các sự kiện bắt buộc ghi vết tác nghiệp (Audit Events):
- **Quản lý mượn trả:**
  * Thủ thư bấm **Duyệt đơn mượn** hoặc **Từ chối đơn mượn** (kèm lý do từ chối).
  * Thủ thư bấm **Xuất sách cho bạn đọc** tại quầy.
  * Thủ thư bấm **Nhận trả sách** tại quầy.
- **Xử lý sự cố & Bồi thường:**
  * Thủ thư **Lập biên bản sách rách / mất** (ghi nhận số tiền thẩm định).
  * Thủ thư/Admin bấm **Xác nhận đã thu tiền bồi thường tại quầy**.
- **Quản lý tài khoản & Vi phạm:**
  * Admin đưa bạn đọc vào **Danh sách đen (Blacklist)** hoặc **Gỡ khỏi Blacklist** (kèm ghi chú lý do).
  * Admin thay đổi **Phân quyền vai trò** tài khoản người dùng.
- **Quản lý kho sách:**
  * Thêm sách mới, chỉnh sửa thông tin sách, đưa sách vào kho lưu trữ (Soft Delete).
- **Cấu hình hệ thống:**
  * Admin thay đổi các tham số quy chế thư viện (hạn mức mượn, thời hạn mượn, thời gian giữ sách).

#### 2. Cấu trúc một Bản ghi Nhật ký Tác nghiệp Chuẩn (Audit Log Record Structure):
```javascript
{
  _id: ObjectId("..."),
  ThoiGian: ISODate("2026-09-26T20:45:00.000Z"), // Mốc thời gian chính xác
  HanhDong: "CHECKOUT_BOOK",                    // Enum mã hành động
  NguoiThucHien: {
    NhanVienId: ObjectId("..."),
    MSNV: "NV001",
    HoTen: "Quản Trị Viên Hệ Thống",
    ChucVu: "ADMIN",
    DiaChiIP: "192.168.1.50",
    UserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
  },
  DoiTuongTacDong: {
    Collection: "TheoDoiMuonSach",
    DocumentId: ObjectId("..."),
    MaDinhDanh: "DG001 - S001"
  },
  ChiTiet: "Đã xuất sách 'Lập Trình Web Hiện Đại với Vue 3' cho độc giả Trần Văn Độc Giả (DG001) tại quầy",
  DuLieuCu: { TrangThai: "APPROVED", HanTra: null },
  DuLieuMoi: { TrangThai: "BORROWED", HanTra: ISODate("2026-10-10T...") }
}
```

#### 3. Khai thác & Giám sát Nhật ký Tác nghiệp:
- Cung cấp giao diện tra cứu và bộ lọc Audit Log trên Admin Portal (lọc theo ngày, theo nhân viên thực hiện, theo loại hành động).
- Hỗ trợ xuất dữ liệu nhật ký ra file CSV phục vụ công tác thanh tra và bàn giao ca trực thư viện.

---

## 11. LỘ TRÌNH TRIỂN KHAI CHI TIẾT (IMPLEMENTATION ROADMAP)

1. **Khởi tạo dự án Monorepo:**
   - Tạo cấu trúc 3 thư mục `backend`, `frontend-user`, `frontend-admin`.
   - Cài đặt các gói phụ thuộc (Express, MongoDB driver/Mongoose, JWT, Google Auth, Helmet, Rate Limit, Winston, Vue 3, Bootstrap 5, Axios, Pinia).
2. **Xây dựng Backend Express & Cơ sở dữ liệu MongoDB:**
   - Kết nối MongoDB, thiết lập Schema và Indexes cho 7 collection chuẩn hóa tiếng Việt: `DocGia`, `Sach`, `NhaXuatBan`, `TheoDoiMuonSach`, `NhanVien`, `BienBanBoiThuong`, `CauHinhHeThong`.
   - Viết các Controller, Route và Middleware bảo mật chuyên sâu (JWT, Role Check, Rate Limiter, Helmet, CORS Whitelist, Input Sanitization).
   - Thiết lập Middleware `borrowCheck` để kiểm soát chặt chẽ quy tắc mượn tối đa 3 cuốn, Blacklist, nợ phạt, trùng sách.
   - Thiết lập tầng ghi log Winston, Audit Logger và Endpoint `/api/health`.
3. **Phát triển Frontend User Portal (Port 3000):**
   - Thiết kế giao diện Bootstrap 5: Navbar, BookCard, giỏ mượn, modal đăng ký.
   - Luồng Đăng nhập/Đăng ký & Đăng nhập Google một chạm kèm toggle ẩn/hiện mật khẩu.
   - Trang danh mục sách, bộ lọc tức thì với debounce và khung tải Skeleton cards.
   - Trang lịch sử mượn sách cá nhân, thanh tiến trình đo thời hạn và chức năng gia hạn 1 chạm.
   - Trang hồ sơ cá nhân: cập nhật số điện thoại, đổi mật khẩu an toàn, cảnh báo nợ bồi thường.
4. **Phát triển Frontend Admin Portal (Port 3001) - [x] ĐÃ HOÀN THÀNH:**
   - Thiết kế Layout quản trị Modern SaaS Dashboard: Sidebar, Header, Thẻ thống kê KPI.
   - Quản lý danh mục & kho sách (CRUD sách, cập nhật số lượng, tải ảnh bìa, soft delete bảo vệ sách đang mượn).
   - Xử lý hàng đợi duyệt mượn (giữ 48h) và xuất sách (Check-out hạn 14 ngày).
   - Xử lý nhận trả sách (Check-in), lập biên bản sách hư hỏng/mất (thẩm định số tiền đền bù trực tiếp).
   - Xử lý xác nhận đền bù tại quầy (mở khóa quyền mượn sách) và quản lý danh sách Blacklist.
   - Bảng điều khiển thống kê (Dashboard Analytics) với biểu đồ Chart.js và nút xuất CSV.
5. **Kiểm thử tích hợp & Tinh chỉnh toàn diện - [x] ĐÃ HOÀN THÀNH (14/14 PASS):**
   - Bộ kịch bản tự động `npm run test:e2e` chạy thành công 100% (14/14 test cases).
   - Kiểm thử kịch bản giới hạn mượn tối đa 3 cuốn & chặn mượn 2 cuốn trùng đầu sách.
   - Kiểm thử kịch bản rách sách -> nợ phạt `UNPAID` -> bị chặn mượn mới -> đền bù tại quầy `PAID` -> mở lại quyền mượn sách.
   - Kiểm thử kịch bản phân quyền RBAC: chặn `USER` vào Admin Portal, chặn `BOOK_MANAGER` vào Users/Settings.
   - Kiểm thử an toàn Soft delete: chặn xóa đầu sách khi `SoQuyenDangMuon > 0`.
   - Kiểm thử xuất báo cáo CSV mượn-trả và vi phạm UTF-8.
6. **Chuẩn hóa API & Độ ổn định trên Môi trường Thực tế - [x] ĐÃ HOÀN THÀNH:**
   - **Đồng bộ hóa API Người dùng (`/api/users`):** Hỗ trợ trả về cả danh sách `DocGia` và `NhanVien` với các trường định danh chuẩn hóa (`Role`, `ChucVu`, `TrangThai`, `IsBlacklisted`). Các API cập nhật quyền và khóa blacklist chấp nhận linh hoạt cả camelCase và PascalCase.
   - **Đồng bộ hóa API Thống kê (`/api/stats/summary`):** Tự động tính toán phân bố cơ cấu ấn phẩm theo thể loại (`genreStats`) và xu hướng mượn sách 7 ngày gần nhất (`borrowTrend`) phục vụ trực quan hóa Chart.js tại Bảng điều khiển quản trị.
   - **Xử lý tiến trình Node.js trên Windows:** Thêm cấu hình `backend/nodemon.json` với tham số `delay: 1500ms` và bắt tín hiệu `SIGUSR2` trong `server.js` nhằm giải phóng cổng 5000 triệt để, ngăn ngừa xung đột `EADDRINUSE`.
   - **Chuẩn hóa Đầu vào Số điện thoại (Chỉ nhận số):** Áp dụng ràng buộc `inputmode="numeric"`, `maxlength="11"`, chặn phím phi số qua sự kiện `keypress` và lọc regex `.replace(/\D/g, '')` trên các form Đăng ký bạn đọc, Hồ sơ cá nhân và Thêm nhân viên. Phía backend thực hiện sanitize lọc sạch ký tự phi số trước khi lưu database.
   - **Cơ chế Sinh Mã Tự Tăng An Toàn Tuyệt Đối (`generateNextCode`):** Thay thế toàn bộ phương pháp đếm tài liệu `countDocuments()` dễ gây xung đột khi xóa bản ghi bằng thuật toán tự động quét mã lớn nhất theo tiền tố (`DG`, `NV`, `S`, `BB`, `NXB`), cộng tăng `+1` và lặp kiểm tra `exists()`, triệt tiêu hoàn toàn lỗi `E11000 duplicate key error` trên các collection `DocGia`, `NhanVien`, `Sach`, `BienBanBoiThuong`, `NhaXuatBan`.

    - **Chuẩn Hóa Quản Lý & Chỉnh Sửa Ấn Phẩm Toàn Diện:** Bộ controller `bookController.js` (`createBook`, `updateBook`) hỗ trợ linh hoạt cả hai định dạng đặt tên `camelCase` và `PascalCase` (`TenSach`, `DonGia`, `SoQuyen`, `NamXuatBan`, `MaNXB`, `TacGia`, `NguonGoc`, `TheLoai`, `ISBN`, `HinhAnh`, `MoTa`, `ViTri`). Giao diện `BooksManageView.vue` tích hợp đầy đủ trường ISBN, xem trước ảnh bìa trực tiếp (live preview thumbnail), tự động tính toán lại số bản khả dụng `SoQuyenKhaDung` khi điều chỉnh tổng số quyển trong kho và đồng bộ hóa tức thì trên giao diện quản trị.
    - **Hệ Thống Tải Ảnh Trực Tiếp Từ Máy Tính Cục Bộ Lên Server Express:** Tích hợp cơ chế upload ảnh bìa sách (`POST /api/upload/cover`, lưu tại `/uploads/covers`) và avatar người dùng (`POST /api/upload/avatar`, lưu tại `/uploads/avatars`) với Multer diskStorage, kiểm tra dung lượng (Avatar 2MB, Bìa sách 5MB) và định dạng an toàn (.jpg, .jpeg, .png, .webp). Giao diện `BooksManageView.vue` và `ProfileView.vue` cung cấp nút chọn file trực quan kèm xem trước tức thời. Cấu hình Vite proxy chuyển tiếp tự động `/uploads` tới Express server (Port 5000).
    - **Hệ thống Hộp Thoại Xác Nhận Toàn Cục (Unified Confirm Dialog System):** Thay thế toàn bộ hàm `window.confirm()` và `alert()` mặc định của trình duyệt bằng hệ thống Confirm Dialog hiện đại (`useConfirm` + `ConfirmModal.vue`) trên cả hai cổng User Portal và Admin Portal. Hộp thoại hỗ trợ tùy biến tiêu đề, mô tả, nút bấm, màu sắc phân loại (`danger`, `warning`, `success`, `primary`) và hiệu ứng chuyển cảnh mượt mà, nâng cao trải nghiệm người dùng.

7. **Nâng cấp Kiến trúc Local Domains, Tối ưu Tồn kho & Đồ án Báo cáo (2026-10-09) - [x] ĐÃ HOÀN THÀNH:**
   - **Triển khai Kiến trúc Dual Loopback Domain Nội Bộ (`library.local:3000` & `admin.library.local:3000`):**
     * Tận dụng dải mạng loopback `127.0.0.0/8` để gán `127.0.0.1:3000` cho Cổng Độc giả và `127.0.0.2:3000` cho Cổng Quản trị.
     * Cho phép cả hai ứng dụng Vite chạy song song trên cùng Port `3000` mà không hề bị xung đột socket (`EADDRINUSE`).
     * Tách biệt 100% cookie, LocalStorage và phiên làm việc giữa Độc giả và Quản trị viên trên cùng một trình duyệt.
     * Cập nhật CORS Whitelist tại Backend hỗ trợ đầy đủ các domain nội bộ và cấu hình file `hosts` Windows (`127.0.0.1 library.local`, `127.0.0.2 admin.library.local`).
   - **Khắc phục Triệt để Lỗi Tính toán Tồn kho Khả dụng (`SoQuyenKhaDung` vs `conLai`):**
     * Sửa đổi logic tính toán `conLai` trong `BookDetailView.vue`, `BookCard.vue`, `BooksManageView.vue` ưu tiên đọc trực tiếp trường `SoQuyenKhaDung` từ MongoDB Schema `Sach.js`.
     * Triệt tiêu hoàn toàn lỗi hiển thị sai tổng số bản nhập kho `SoQuyen` khi sách đã được bạn đọc mượn hết hoặc đang lưu hành ngoài thư viện.
   - **Khắc phục Lỗi Xung đột Bootstrap Modal & Điều hướng Đăng nhập (`BorrowModal.vue`):**
     * Thay thế thẻ `<router-link to="/login" data-bs-dismiss="modal">` bằng `<button @click="goToLogin">`.
     * Đóng modal an toàn qua `bootstrap.Modal.getInstance()`, dọn dẹp sạch sẽ các phần tử backdrop tồn đọng (`.modal-backdrop`, `body.modal-open`) và điều hướng kèm tham số `?redirect=${route.fullPath}` giúp bạn đọc tự động quay trở lại đúng trang sách sau khi đăng nhập thành công.
   - **Tạo lập Bộ Sơ đồ Use Case StarUML (`books_management_usecase.mdj`):**
     * Xây dựng script `build_usecase_mdj.py` tự động xuất ra tệp dự án StarUML 2.5 chứa đầy đủ 6 sơ đồ Use Case (Tổng quan, Xác thực & Tài khoản, Độc giả, Quản lý kho sách, Lưu thông Mượn - Trả, Quản trị & Blacklist).
     * Bố cục tự động chống đè lấn tọa độ, gồm 967 phần tử mô hình và kiểm tra 100% toàn vẹn tham chiếu `$ref`.
   - **Tạo lập Artifact Bảng màu & Thành phần Giao diện Design System "Warm Academic" (`design_system_warm_academic.html`):**
     * Trực quan hóa bảng mã màu Tokens, nghệ thuật chữ (Typography), huy hiệu trạng thái (Status Chips), thẻ sách (Book Card), thẻ bạn đọc điện tử (Digital Reader Card), thẻ KPI và cảnh báo.
     * Tích hợp tính năng 1-click xuất ảnh PNG độ phân giải cao 2x (300 DPI) làm Hình 14 cho bài báo cáo.
   - **Hoàn thiện Toàn văn Báo cáo Học thuật 5 Chương (`ReportGuide.md`):**
     * Hoàn thành từ Chương I đến Chương V theo văn phong sinh viên ĐH Cần Thơ, áp dụng Ma trận phân định trách nhiệm nội dung (Cross-Chapter Anti-Redundancy Matrix), quy chuẩn đánh số liên tục (Hình 1 đến Hình 35, Bảng 1 đến Bảng 21).

---

## 12. DỮ LIỆU KHỞI TẠO MẪU (SEED DATA & DEFAULT ACCOUNTS) - [x] ĐÃ HOÀN THÀNH

Hệ thống cung cấp sẵn script nạp dữ liệu mẫu (`npm run seed` trong thư mục `backend`) để kiểm thử toàn diện ngay sau khi cài đặt:

### 12.1. Tài khoản mặc định hệ thống
| Vai trò | Collection | Mã định danh | Email đăng nhập | Mật khẩu mặc định | Ghi chú |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`ADMIN`** | `NhanVien` | `NV001` | `admin@library.com` | `Admin@123` | Quản trị viên tối cao (Toàn quyền hệ thống) |
| **`BOOK_MANAGER`** | `NhanVien` | `NV002` | `manager@library.com` | `Manager@123` | Thủ thư / Nhân viên quản lý kho sách |
| **`USER` (Bình thường)** | `DocGia` | `DG001` | `reader1@gmail.com` | `User@123` | Độc giả mẫu (Đang mượn 1 cuốn sách) |
| **`USER` (Vi phạm)** | `DocGia` | `DG002` | `reader2@gmail.com` | `User@123` | Độc giả mẫu (Đang có biên bản sách rách `UNPAID` để test chặn mượn) |

### 12.2. Kho sách mẫu khởi tạo (~15 cuốn đa dạng thể loại trong collection `Sach` & liên kết `NhaXuatBan`)
- **Công nghệ thông tin:** Lập trình Web hiện đại với Vue 3 (NXB Thông Tin & Truyền Thông), Clean Architecture (NXB Khoa Học Kỹ Thuật), Thiết kế Hệ thống Thực chiến (NXB Thế Giới), Khám phá Trí tuệ Nhân tạo & LLM (NXB ĐHQG).
- **Văn học kinh điển:** Nhà Giả Kim (NXB Hội Nhà Văn), Rừng Na Uy (NXB Hội Nhà Văn), Không Gia Đình (NXB Kim Đồng), Trăm Năm Cô Đơn (NXB Văn Học).
- **Kinh tế & Kỹ năng:** Đắc Nhân Tâm (NXB Trẻ), Tâm Lý Học Về Tiền (NXB Trẻ), Tư Duy Nhanh Và Chậm (NXB Thế Giới), Khởi Nghiệp Tinh Gọn (NXB Tổng Hợp TP.HCM).
- **Khoa học & Lịch sử:** Lược Sử Loài Người - Sapiens (NXB Tri Thức), Vũ Trụ Trong Vỏ Hạt Dẻ (NXB Trẻ), Lịch Sử Văn Minh Phương Tây (NXB Hồng Đức).

### 12.3. Lệnh nạp dữ liệu tự động
```bash
cd backend
npm run seed
```
Script sẽ tự động:
1. Xóa sạch và tạo lại 7 collection MongoDB: `DocGia`, `NhanVien`, `NhaXuatBan`, `Sach`, `TheoDoiMuonSach`, `BienBanBoiThuong`, `CauHinhHeThong`.
2. Khởi tạo 11 Nhà xuất bản chuẩn vào collection `NhaXuatBan`.
3. Băm mật khẩu an toàn với `bcrypt` và khởi tạo tài khoản nhân viên vào `NhanVien`, độc giả vào `DocGia`.
4. Nạp 15 đầu sách mẫu có đầy đủ mã sách, mã NXB, tác giả/nguồn gốc, đơn giá, số quyển vào `Sach`.
5. Tạo sẵn các phiếu theo dõi mượn sách (`TheoDoiMuonSach`) ở trạng thái `PENDING`, `BORROWED`, `RETURNED` và 1 biên bản bồi thường mẫu (`BienBanBoiThuong`) ở trạng thái `UNPAID`.


