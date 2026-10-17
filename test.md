# TÀI LIỆU THIẾT KẾ & ĐẶC TẢ CA KIỂM THỬ TOÀN DIỆN (COMPREHENSIVE TEST SPECIFICATION)

Tài liệu này đặc tả chi tiết toàn bộ các Ca kiểm thử (Test Cases) cho cả 2 cổng phân hệ độc lập:
* **Cổng Độc giả (User Portal):** `http://library.local:3000` (IP Loopback `127.0.0.1:3000` hoặc `http://localhost:3000`)
* **Cổng Quản trị & Thủ thư (Admin Portal):** `http://admin.library.local:3000` (IP Loopback `127.0.0.2:3000` hoặc `http://localhost:3001` khi dùng port riêng)
* **Máy chủ Backend RESTful API:** `http://localhost:5000` (hoặc `http://api.library.local:5000`)

Tất cả các ca kiểm thử đều được ánh xạ trực tiếp đến các RESTful API được kích hoạt tại từng trang.

---

# PHẦN 1: CỔNG ĐỘC GIẢ (USER PORTAL - HTTP://LIBRARY.LOCAL:3000 / PORT 3000)

---

## 1. Trang Chủ (`HomeView.vue` - `/`)

### 1.1. Bảng Ca kiểm thử (Test Cases)

| Test Case ID | Loại | Tiêu đề Ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-USR-HOME-01** | Positive | Tải trang chủ hiển thị Hero Section & danh mục nổi bật | Máy chủ backend hoạt động | 1. Mở trình duyệt truy cập `http://library.local:3000/` (hoặc `http://localhost:3000/`). | URL: `/` | - Giao diện hiển thị banner chào mừng.<br>- Hiển thị thanh tìm kiếm nhanh.<br>- Nút chuyển hướng sang `/books` hoạt động tốt. |
| **TC-USR-HOME-02** | Positive | Hiển thị 8 ấn phẩm mới nhất | Trong DB có ít nhất 8 đầu sách | 1. Tải trang chủ.<br>2. Cuộn xuống phần "Ấn phẩm mới cập nhật". | Không có | - Render danh sách tối đa 8 thẻ sách.<br>- Mỗi thẻ có ảnh bìa, tên sách, tác giả, thể loại, đơn giá, số bản khả dụng. |
| **TC-USR-HOME-03** | Positive | Tìm kiếm nhanh từ thanh Search của Trang chủ | Sách "Lập trình Web" có trong kho | 1. Nhập "Lập trình Web" vào ô tìm kiếm nhanh.<br>2. Bấm phím Enter hoặc nút "Khám phá". | Keyword: `Lập trình Web` | - Trình duyệt điều hướng sang `/books?q=Lập trình Web`.<br>- Kết quả tìm kiếm lọc đúng sách liên quan. |
| **TC-USR-HOME-04** | Positive | Hiển thị đối tác Nhà Xuất Bản | DB có danh mục NXB | 1. Cuộn xuống chân trang danh mục NXB. | Không có | - Hiển thị logo/tên các NXB đối tác (Kim Đồng, Trẻ, Thông Tin & Truyền Thông,...). |

### 1.2. RESTful API liên quan
* **API 1: Lấy danh sách ấn phẩm mới nhất**
  * `Method`: `GET`
  * `Endpoint`: `/api/books?limit=8&sort=createdAt&order=desc`
  * `Headers`: `Content-Type: application/json`
  * `Response chuẩn`: `HTTP 200 OK`
    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "65f1a2b...",
          "MaSach": "S001",
          "TenSach": "Lập trình Web hiện đại với Vue 3",
          "DonGia": 125000,
          "SoQuyen": 10,
          "SoQuyenKhaDung": 8,
          "HinhAnh": "/uploads/books/sach1.jpg",
          "TacGia": "Trần Văn Cương"
        }
      ]
    }
    ```
* **API 2: Lấy danh sách Nhà xuất bản**
  * `Method`: `GET`
  * `Endpoint`: `/api/publishers`
  * `Response chuẩn`: `HTTP 200 OK` (`data`: danh sách NXB gồm `MaNXB`, `TenNXB`, `DiaChi`).

---

## 2. Trang Tra cứu & Danh mục Sách (`BooksView.vue` - `/books`)

### 2.1. Bảng Ca kiểm thử (Test Cases)

| Test Case ID | Loại | Tiêu đề Ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-USR-BOOK-01** | Positive | Lọc sách theo Thể loại | Có sách thuộc "Công nghệ thông tin" | 1. Chọn dropdown Thể loại: "Công nghệ thông tin".<br>2. Nhấn nút Tìm kiếm. | `theLoai`: `Công nghệ thông tin` | - Chỉ các cuốn thuộc thể loại CNTT được hiển thị.<br>- Cập nhật tổng số kết quả tìm thấy. |
| **TC-USR-BOOK-02** | Positive | Lọc sách theo Nhà xuất bản | Có sách liên kết mã NXB | 1. Chọn dropdown NXB: "NXB Trẻ".<br>2. Nhấn Tìm kiếm. | `maNXB`: `NXB001` | - Danh sách hiển thị các ấn phẩm do NXB Trẻ phát hành. |
| **TC-USR-BOOK-03** | Edge | Tìm kiếm không có kết quả | Từ khóa không khớp bất kỳ sách nào | 1. Nhập chuỗi ký tự lạ vào ô tìm kiếm: `XYZ123456789!@#`.<br>2. Nhấn Tìm. | `search`: `XYZ123456789!@#` | - Hiển thị khung thông báo thân thiện: "Không tìm thấy ấn phẩm nào phù hợp".<br>- Có nút "Đặt lại bộ lọc". |
| **TC-USR-BOOK-04** | Positive | Chuyển trang phân trang (Pagination) | Số lượng sách > 12 | 1. Cuộn xuống cuối trang.<br>2. Bấm vào nút trang số 2. | `page`: `2` | - Danh sách chuyển sang trang 2, URL cập nhật `?page=2`.<br>- Cuộn mượt mà lên đầu danh mục. |
| **TC-USR-BOOK-05** | Positive | Bấm thẻ sách mở trang Chi tiết | Danh mục hiển thị sách | 1. Click vào ảnh hoặc tiêu đề cuốn "Nhà Giả Kim". | `id`: `65f...` | - Điều hướng sang `/books/:id`. |
| **TC-USR-BOOK-06** | Positive | Tìm kiếm sách tiếng Việt không dấu (Accent-Insensitive Search) | Có sách "Kiến trúc máy tính" hoặc "Lập trình Web" | 1. Nhập từ khóa không dấu "Kien" hoặc "lap trinh".<br>2. Xem danh sách ấn phẩm trả về. | `search`: `Kien` | - Danh sách hiển thị chính xác các ấn phẩm có tên "Kiến trúc...", "Phạm Kiên" dù nhập không dấu. |
| **TC-USR-BOOK-07** | Positive | Ghi nhớ và khôi phục bộ lọc khi quay lại `/books` (URL Query State Sync) | Đang ở `/books` có bộ lọc & từ khóa | 1. Lọc sách (VD: Thể loại CNTT, từ khóa "Lập trình", trang 2).<br>2. Bấm vào xem chi tiết 1 cuốn sách (`/books/:id`).<br>3. Bấm nút "Quay lại" hoặc nút Back trên trình duyệt. | URL: `/books?search=Lập+trình&theLoai=...&page=2` | - Giao diện tự động điền lại từ khóa vào ô tìm kiếm, chọn lại đúng thể loại, sắp xếp và số trang đã chọn trước đó.<br>- Danh sách sách hiển thị đúng kết quả lọc. |
| **TC-USR-BOOK-08** | Positive | Sắp xếp & Lọc kết hợp nhiều tiêu chí (Faceted Filtering & Sorting) | Có danh mục sách đa dạng | 1. Chọn sắp xếp "Giá: Thấp đến cao" hoặc "Tên sách: A - Z".<br>2. Tích chọn "Chỉ sách còn sẵn trên kệ".<br>3. Chọn NXB hoặc Thể loại. | `sort`: `DonGia`, `order`: `asc`, `availableOnly`: `true` | - Danh sách tự động tải lại sắp xếp đúng thứ tự giá tăng dần.<br>- Chỉ hiển thị các cuốn có số quyển khả dụng > 0.<br>- Hiển thị thanh filter chips cho phép xóa nhanh từng tiêu chí. |

### 2.2. RESTful API liên quan
* **API: Tra cứu danh mục sách kèm bộ lọc & phân trang**
  * `Method`: `GET`
  * `Endpoint`: `/api/books`
  * `Query Parameters`: `?page=1&limit=12&search=lap+trinh&theLoai=CNTT&maNXB=NXB01`
  * `Response chuẩn`: `HTTP 200 OK`
    ```json
    {
      "success": true,
      "data": [ ... ],
      "meta": {
        "pagination": { "page": 1, "limit": 12, "totalRecords": 15, "totalPages": 2 }
      }
    }
    ```

* **API 2: Lấy danh mục Thể loại sách chuẩn hóa**
  * `Method`: `GET`
  * `Endpoint`: `/api/categories`
  * `Response chuẩn`: `HTTP 200 OK`
    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "...",
          "MaTheLoai": "TL01",
          "TenTheLoai": "Công nghệ thông tin",
          "MoTa": "Sách chuyên ngành CNTT, lập trình",
          "TrangThai": "ACTIVE"
        }
      ]
    }
    ```

---

## 3. Trang Chi tiết Ấn phẩm (`BookDetailView.vue` - `/books/:id`)

### 3.1. Bảng Ca kiểm thử (Test Cases)

| Test Case ID | Loại | Tiêu đề Ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-USR-DETAIL-01** | Positive | Xem đầy đủ thông tin sách | Sách tồn tại trong kho | 1. Truy cập `/books/:id`. | `id` hợp lệ | - Hiển thị chi tiết: Tên sách, Tác giả, ISBN, Năm xuất bản, NXB, Tình trạng còn sách (`SoQuyenKhaDung`). |
| **TC-USR-DETAIL-02** | Positive | Độc giả mượn sách thành công | Đã đăng nhập, chưa mượn cuốn này, số lượng khả dụng > 0, mượn < 3 cuốn | 1. Bấm nút "Đăng Ký Mượn Sách".<br>2. Nhập ghi chú (tùy chọn) trong Modal.<br>3. Bấm "Xác Nhận Đặt Mượn". | `GhiChu`: "Mượn làm đồ án" | - Toast thành công: *"Đăng ký mượn sách thành công! Vui lòng đến nhận trong 48h."*<br>- Nút chuyển sang trạng thái "Đã gửi yêu cầu mượn". |
| **TC-USR-DETAIL-03** | Negative | Độc giả chưa đăng nhập bấm mượn sách | Độc giả chưa đăng nhập | 1. Truy cập chi tiết sách khi chưa có token.<br>2. Nhấn nút "Đăng Ký Mượn Sách". | Không có | - Hệ thống hiển thị Toast cảnh báo yêu cầu đăng nhập.<br>- Tự động redirect về `/login?redirect=/books/:id`. |
| **TC-USR-DETAIL-04** | Negative | Chặn mượn khi sách đã hết bản khả dụng (`SoQuyenKhaDung = 0`) | Sách có `SoQuyenKhaDung = 0` | 1. Mở trang chi tiết cuốn sách hết hàng. | `SoQuyenKhaDung`: `0` | - Nút "Đăng Ký Mượn" bị `disabled`, hiển thị nhãn "Tạm thời hết sách khả dụng". |
| **TC-USR-DETAIL-05** | Negative | Chặn mượn trùng cuốn sách đang mượn/chờ duyệt | Độc giả đã mượn hoặc có đơn `PENDING` cuốn này | 1. Bấm mượn cuốn sách mà độc giả đang giữ. | `SachId` trùng | - Backend từ chối với mã lỗi `BORROW_ALREADY_EXISTS`.<br>- Toast báo lỗi: *"Bạn đang mượn hoặc có yêu cầu chờ duyệt cuốn sách này!"*. |
| **TC-USR-DETAIL-06** | Negative | Chặn mượn khi tài khoản bị Blacklist / Nợ phạt | Độc giả bị cờ `DaBiKhoa = true` hoặc có nợ phạt | 1. Đăng nhập tài khoản vi phạm.<br>2. Bấm mượn sách bất kỳ. | Tài khoản vi phạm | - Backend trả về `HTTP 403 Forbidden`.<br>- Toast thông báo tài khoản bị tạm khóa do vi phạm nội quy/nợ phạt. |
| **TC-USR-DETAIL-07** | Positive | Tính toán và hiển thị chính xác số lượng sách khả dụng (`conLai`) | Sách có `SoQuyen = 10`, `SoQuyenDangMuon = 3`, `SoQuyenKhaDung = 7` | 1. Mở trang chi tiết sách `/books/:id`.<br>2. Quan sát chỉ số "Còn lại trong kho" và tình trạng sẵn sàng. | `id` sách kiểm thử | - Hệ thống ưu tiên lấy đúng trường `SoQuyenKhaDung = 7` (không bị lỗi `undefined` biến `SoQuyenConLai`).<br>- Fallback tính `Math.max(0, SoQuyen - SoQuyenDangMuon)` nếu thiếu trường.<br>- Hiển thị nhãn "Còn 7 bản khả dụng". |
| **TC-USR-DETAIL-08** | Interaction | Nhấn "Đăng nhập ngay" trong BorrowModal dọn sạch Backdrop và giữ URL Redirect | Độc giả chưa đăng nhập, đang mở modal mượn sách | 1. Tại `/books/:id`, nhấn mở BorrowModal.<br>2. Nhấn nút "Đăng nhập ngay" trong khung cảnh báo vàng. | Không có | - Gọi `bootstrap.Modal.getInstance().hide()` đóng Modal.<br>- Dọn dẹp triệt để thẻ `.modal-backdrop` và gỡ class `modal-open` khỏi body.<br>- Vue Router điều hướng ngay sang `/login?redirect=/books/:id` mà không bị kẹt màn hình xám tối. |

### 3.2. RESTful API liên quan
* **API 1: Lấy chi tiết một ấn phẩm**
  * `Method`: `GET`
  * `Endpoint`: `/api/books/:id`
  * `Response chuẩn`: `HTTP 200 OK` (chi tiết sách và populate thông tin `MaNXB`).
* **API 2: Đăng ký mượn sách**
  * `Method`: `POST`
  * `Endpoint`: `/api/borrows`
  * `Headers`: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`
  * `Request Body`:
    ```json
    {
      "sachId": "65f1a2b...",
      "ghiChu": "Mượn nghiên cứu học phần"
    }
    ```
  * `Response thành công`: `HTTP 201 Created`
  * `Response thất bại (Quá 3 cuốn / Trùng sách / Hết sách)`: `HTTP 400 Bad Request` hoặc `HTTP 403 Forbidden`
    ```json
    {
      "success": false,
      "error": { "code": "BORROW_LIMIT_EXCEEDED", "message": "Bạn đã đạt giới hạn mượn tối đa 3 cuốn sách." }
    }
    ```

---

## 4. Trang Tủ Sách Của Tôi (`MyBorrowsView.vue` - `/my-borrows`)

### 4.1. Bảng Ca kiểm thử (Test Cases)

| Test Case ID | Loại | Tiêu đề Ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-USR-MB-01** | Positive | Hiển thị phân loại 3 trạng thái mượn sách & Thẻ Link chuyển hướng | Độc giả đã đăng nhập | 1. Truy cập `/my-borrows`.<br>2. Kiểm tra các Tab: "Chờ lấy & chờ duyệt", "Đang mượn đọc", "Lịch sử trả sách".<br>3. Bấm vào ảnh bìa hoặc tên sách ở bất kỳ danh sách nào. | Token bạn đọc | - Danh sách hiển thị đúng từng Tab.<br>- Hiển thị badge số lượng.<br>- Nhấp vào sách điều hướng chính xác sang trang chi tiết ấn phẩm `/books/:id`. |
| **TC-USR-MB-02** | Positive | Độc giả tự hủy yêu cầu mượn khi đang chờ (`PENDING`) | Có đơn ở trạng thái `PENDING` | 1. Tại tab "Chờ duyệt", nhấn nút "Hủy yêu cầu".<br>2. Xác nhận trong Dialog. | `_id`: Phiếu mượn `PENDING` | - Toast: *"Đã hủy yêu cầu mượn sách thành công!"*.<br>- Đơn bị xóa khỏi danh sách chờ, số lượng sách khả dụng của kho tăng lại +1. |
| **TC-USR-MB-03** | Positive | Gia hạn mượn sách lần 1 thành công (+7 ngày) | Đang mượn (`BORROWED`), chưa quá hạn, `SoLanGiaHan = 0` | 1. Tại tab "Đang mượn", bấm "Gia hạn thêm 7 ngày".<br>2. Xác nhận. | `_id`: Phiếu `BORROWED` | - Hạn trả (`HanTra`) tăng thêm 7 ngày.<br>- Số lần gia hạn hiển thị `1/1`.<br>- Toast thành công. |
| **TC-USR-MB-04** | Negative | Chặn gia hạn khi đã hết lượt (`SoLanGiaHan >= 1`) | Phiếu mượn đã gia hạn 1 lần | 1. Bấm nút "Gia hạn" trên sách đã gia hạn. | `SoLanGiaHan`: `1` | - Nút bị vô hiệu hóa hoặc API trả lỗi: *"Mỗi cuốn sách chỉ được phép gia hạn tối đa 01 lần."*. |
| **TC-USR-MB-05** | Negative | Chặn gia hạn khi sách đã bị quá hạn (`HanTra < Hiện tại`) | Sách bị quá hạn trả | 1. Bấm "Gia hạn" trên cuốn quá hạn. | `HanTra`: Quá khứ | - Toast báo lỗi: *"Sách đã quá hạn trả, không thể gia hạn. Vui lòng mang sách đến quầy trả."*. |

### 4.2. RESTful API liên quan
* **API 1: Lấy danh sách phiếu mượn của chính mình**
  * `Method`: `GET`
  * `Endpoint`: `/api/borrows/my-borrows`
  * `Headers`: `Authorization: Bearer <userToken>`
  * `Response chuẩn`: `HTTP 200 OK` (Mảng phiếu mượn populate chi tiết `SachId`).
* **API 2: Gia hạn mượn sách**
  * `Method`: `PUT`
  * `Endpoint`: `/api/borrows/:id/renew`
  * `Headers`: `Authorization: Bearer <userToken>`
  * `Response chuẩn`: `HTTP 200 OK` (Cập nhật `HanTra` và `SoLanGiaHan = 1`).
* **API 3: Hủy yêu cầu đặt mượn sách (chỉ khi PENDING)**
  * `Method`: `PUT` (hoặc `PATCH`)
  * `Endpoint`: `/api/borrows/:id/cancel`
  * `Headers`: `Authorization: Bearer <userToken>`
  * `Response chuẩn`: `HTTP 200 OK`.

---

## 5. Trang Đăng Nhập & Đăng Ký (`LoginView.vue`, `RegisterView.vue`)

### 5.1. Bảng Ca kiểm thử (Test Cases)

| Test Case ID | Loại | Tiêu đề Ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-USR-AUTH-01** | Positive | Đăng ký tài khoản độc giả thành công | Email chưa tồn tại | 1. Vào `/register`.<br>2. Nhập Họ lót, Tên, Email, Điện thoại, Mật khẩu.<br>3. Nhấn "Đăng ký thẻ bạn đọc". | Họ: "Trần", Tên: "Nam", Email: `test@gmail.com`, Pass: `Pass123!` | - Tạo mã bạn đọc `DGxxx`.<br>- Lưu token và tự động đăng nhập chuyển sang trang chủ. |
| **TC-USR-AUTH-02** | Negative | Đăng ký thất bại do Email trùng | Email đã có trong DB | 1. Đăng ký với Email đã tồn tại. | Email: `reader1@gmail.com` | - Toast báo lỗi: *"Email này đã được đăng ký trong hệ thống."* (HTTP 400). |
| **TC-USR-AUTH-03** | Positive | Đăng nhập thành công bằng Email hoặc Số điện thoại | Tài khoản đã kích hoạt | 1. Vào `/login`.<br>2. Nhập Email hoặc Số điện thoại + Mật khẩu.<br>3. Nhấn Đăng nhập. | Email: `reader1@gmail.com`, Pass: `User@123` | - Lưu `accessToken`, `refreshToken`, `user` vào `localStorage`.<br>- Toast chào mừng, chuyển về trang chủ hoặc trang redirect. |
| **TC-USR-AUTH-04** | Negative | Đăng nhập sai mật khẩu | Tài khoản tồn tại | 1. Nhập mật khẩu sai 3 lần. | Pass: `SaiMatKhau` | - Báo lỗi: *"Thông tin đăng nhập hoặc mật khẩu không chính xác."* (HTTP 401). |
| **TC-USR-AUTH-05** | Security | Phục hồi Access Token tự động khi hết hạn (Refresh Token) | Đang lưu Refresh Token hợp lệ | 1. Giả lập hết hạn accessToken (sau 15 phút).<br>2. Thực hiện gọi API bất kỳ. | Refresh Token | - Axios Interceptor tự động gọi `/api/auth/refresh-token`.<br>- Cập nhật Token mới ngầm, người dùng không bị văng đăng nhập. |
| **TC-USR-AUTH-06** | Security | Chặn Quản trị viên / Nhân viên (`ADMIN`, `BOOK_MANAGER`) đăng nhập Cổng Độc giả | Tài khoản thuộc `NhanVien` | 1. Dùng email quản trị viên (`admin@library.com`) đăng nhập tại Cổng Độc giả (`/login`). | Email: `admin@library.com`, Pass: `Admin@123` | - Backend từ chối ngay lập tức với HTTP 403 `AUTH_FORBIDDEN`.<br>- Báo lỗi: *"Tài khoản quản trị viên / nhân viên không được phép đăng nhập tại Cổng Độc giả. Vui lòng truy cập Cổng Quản Trị."*. Không cấp phiên bạn đọc. |

### 5.2. RESTful API liên quan
* **API Đăng ký**: `POST /api/auth/register` (Payload: `{ hoLot, ten, email, password, dienThoai, phai, diaChi }`)
* **API Đăng nhập Độc giả**: `POST /api/auth/reader/login` (hoặc `POST /api/auth/login`) (Payload: `{ emailOrPhone, password }`)
* **API Refresh Token**: `POST /api/auth/refresh-token` (Payload: `{ refreshToken }`)
* **API Đăng xuất**: `POST /api/auth/logout` (Payload: `{ refreshToken }`)

---

## 6. Trang Hồ Sơ Bạn Đọc (`ProfileView.vue` - `/profile`)

### 6.1. Bảng Ca kiểm thử (Test Cases)

| Test Case ID | Loại | Tiêu đề Ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-USR-PROF-01** | Positive | Cập nhật thông tin cá nhân (Họ tên, Giới tính, Ngày sinh, SĐT, Địa chỉ) | Đã đăng nhập | 1. Vào `/profile`.<br>2. Chỉnh sửa Họ tên, Giới tính (Nam/Nữ/Khác), Ngày sinh, Địa chỉ, Số điện thoại.<br>3. Bấm "Lưu thông tin cá nhân". | Phai: "Nữ", NgaySinh: "2000-08-20", DiaChi: "123 Đường 3/2, Q. Ninh Kiều, Cần Thơ" | - Cập nhật dữ liệu vào DB.<br>- Giao diện và Thẻ điện tử cập nhật ngay thông tin mới.<br>- Hiển thị Toast thành công: *"Cập nhật thông tin cá nhân thành công!"*. |
| **TC-USR-PROF-02** | Positive | Đổi mật khẩu tài khoản | Đã đăng nhập | 1. Nhập mật khẩu hiện tại.<br>2. Nhập mật khẩu mới (>= 6 ký tự) và xác nhận.<br>3. Bấm "Cập nhật mật khẩu". | Current: `User@123`, New: `NewUser@123` | - Mật khẩu được băm `bcrypt` và lưu mới.<br>- Toast báo thành công. |
| **TC-USR-PROF-03** | Negative | Đổi mật khẩu thất bại do mật khẩu cũ không đúng | Đã đăng nhập | 1. Nhập sai mật khẩu hiện tại. | Current: `SaiPass123` | - Toast báo lỗi: *"Mật khẩu hiện tại không chính xác."* (HTTP 400). |
| **TC-USR-PROF-04** | Positive | Tải lên ảnh đại diện Avatar | File định dạng hợp lệ | 1. Chọn file ảnh JPG/PNG (< 5MB).<br>2. Nhấn Tải lên. | File: `avatar.png` (800KB) | - API upload file trả về đường dẫn tĩnh `/uploads/avatars/...`.<br>- Avatar trên Header và Profile lập tức cập nhật. |

### 6.2. RESTful API liên quan
* **API 1: Lấy thông tin cá nhân**: `GET /api/auth/me`
* **API 2: Cập nhật thông tin**: `PUT /api/auth/profile` (Payload: `{ hoLot, ten, diaChi, dienThoai, phai, ngaySinh }`)
* **API 3: Đổi mật khẩu**: `PUT /api/auth/change-password` (Payload: `{ currentPassword, newPassword }`)
* **API 4: Tải ảnh đại diện**: `POST /api/upload/avatar` (`multipart/form-data`, file key: `avatar`)

---
---

# PHẦN 2: CỔNG QUẢN TRỊ & THỦ THƯ (ADMIN PORTAL - HTTP://ADMIN.LIBRARY.LOCAL:3000 / PORT 3001)

---

## 1. Trang Đăng Nhập Quản Trị (`LoginView.vue` - `/login`)

### 1.1. Bảng Ca kiểm thử (Test Cases)

| Test Case ID | Loại | Tiêu đề Ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-AUTH-01** | Positive | Đăng nhập tài khoản Quản trị viên (`ADMIN`) | Tài khoản tồn tại trong `NhanVien` | 1. Mở `http://admin.library.local:3000/login` (hoặc `http://127.0.0.2:3000/login`, `http://localhost:3001/login`).<br>2. Nhập Email và Mật khẩu Quản trị viên.<br>3. Nhấn "Đăng Nhập Quản Trị". | Email: `admin@library.com`, Pass: `Admin@123` | - Đăng nhập thành công, lưu `adminAccessToken`.<br>- Điều hướng vào Dashboard (`/`).<br>- Sidebar hiển thị đầy đủ 9 menu quản trị. |
| **TC-ADM-AUTH-02** | Positive | Đăng nhập tài khoản Thủ thư (`BOOK_MANAGER`) | Tài khoản `ChucVu = BOOK_MANAGER` | 1. Nhập tài khoản Thủ thư.<br>2. Đăng nhập. | Email: `manager@library.com`, Pass: `Manager@123` | - Vào Dashboard thành công.<br>- Menu bị ẩn các mục dành riêng cho Admin: Users, Settings, Audit-Logs. |
| **TC-ADM-AUTH-03** | Security | Chặn độc giả (`USER`) đăng nhập Cổng Quản trị | Tài khoản là độc giả `DocGia` | 1. Dùng email độc giả đăng nhập tại cổng Admin. | Email: `reader1@gmail.com`, Pass: `User@123` | - Hệ thống từ chối ngay lập tức.<br>- Báo lỗi: *"Tài khoản độc giả không có thẩm quyền truy cập Cổng Quản Trị & Thủ Thư."*. Không cấp quyền vào trang. |

### 1.2. RESTful API liên quan
* **API: Xác thực đăng nhập nhân sự**
  * `Method`: `POST`
  * `Endpoint`: `/api/auth/admin/login` (hoặc `POST /api/auth/login`)
  * `Response chuẩn`: `HTTP 200 OK` (Trả về `user.Role` là `ADMIN` hoặc `BOOK_MANAGER`).

---

## 2. Trang Tổng Quan Báo Cáo (`DashboardView.vue` - `/`)

### 2.1. Bảng Ca kiểm thử (Test Cases)

| Test Case ID | Loại | Tiêu đề Ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-DASH-01** | Positive | Hiển thị chính xác 4 thẻ chỉ số KPI tổng quan | Admin/Thủ thư đã đăng nhập | 1. Truy cập trang chủ Admin (`/`). | Token Staff | - Thẻ 1: Tổng đầu sách trong kho (số nguyên dương).<br>- Thẻ 2: Độc giả đang hoạt động.<br>- Thẻ 3: Sách đang lưu hành.<br>- Thẻ 4: Sách quá hạn cần thu hồi. |
| **TC-ADM-DASH-02** | Positive | Hiển thị Biểu đồ tròn Cơ cấu Ấn phẩm theo Thể loại | Có dữ liệu sách theo thể loại | 1. Quan sát Card biểu đồ Doughnut. | Không có | - Render biểu đồ Chart.js trực quan với các màu sắc phân biệt.<br>- Hiển thị chú thích các thể loại (CNTT, Văn học, Kinh tế,...). |
| **TC-ADM-DASH-03** | Positive | Hiển thị Biểu đồ cột Xu hướng Mượn sách 7 ngày qua | Có dữ liệu lượt mượn | 1. Quan sát Card biểu đồ Bar. | Không có | - Biểu đồ hiển thị đúng 7 cột đại diện 7 ngày gần nhất (định dạng `DD/MM`).<br>- Trục tung thể hiện số lượt mượn. |
| **TC-ADM-DASH-04** | Positive | Hiển thị Bảng Top 10 Ấn phẩm được mượn nhiều nhất | Có lịch sử mượn sách | 1. Cuộn xuống bảng Top 10. | Không có | - Liệt kê tối đa 10 cuốn sách có số lượt mượn cao nhất.<br>- Đánh số thứ hạng 1, 2, 3 nổi bật.<br>- Có đầy đủ mã sách, đơn giá, số lượt mượn. |
| **TC-ADM-DASH-05** | Positive | Xuất báo cáo Mượn - Trả sách sang file CSV | Quyền `ADMIN` | 1. Bấm nút "Xuất Báo Cáo Mượn Trả (CSV)". | `ADMIN` Token | - Trình duyệt tải về file `BaoCao_MuonTra_YYYY-MM-DD.csv`.<br>- Mở trên Excel không bị lỗi font Tiếng Việt (có đính kèm BOM UTF-8 `\uFEFF`). |
| **TC-ADM-DASH-06** | Positive | Xuất báo cáo Biên bản bồi thường sang CSV | Quyền `ADMIN` | 1. Bấm nút "Xuất Báo Cáo Bồi Thường (CSV)". | `ADMIN` Token | - Tải về file `BaoCao_BoiThuong_YYYY-MM-DD.csv` với đầy đủ thông tin độc giả, số tiền đền bù. |

### 2.2. RESTful API liên quan
* **API 1: Thống kê KPI & Biểu đồ**: `GET /api/stats/summary`
  * `Response chuẩn`:
    ```json
    {
      "success": true,
      "data": {
        "totalBooks": 15,
        "activeReaders": 5,
        "currentlyBorrowed": 3,
        "overdueBooks": 0,
        "genreStats": [{ "name": "Công nghệ thông tin", "count": 4 }, { "name": "Văn học", "count": 4 }],
        "borrowTrend": [{ "date": "21/09", "count": 2 }, { "date": "22/09", "count": 5 }]
      }
    }
    ```
* **API 2: Top sách mượn nhiều**: `GET /api/stats/top-books`
* **API 3: Tải file CSV mượn trả**: `GET /api/stats/export/borrows` (`responseType: blob`)
* **API 4: Tải file CSV biên bản phạt**: `GET /api/stats/export/fines` (`responseType: blob`)

---

## 3. Trang Quản Lý Kho Ấn Phẩm (`BooksManageView.vue` - `/books`)

### 3.1. Bảng Ca kiểm thử (Test Cases)

| Test Case ID | Loại | Tiêu đề Ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-BOOK-01** | Positive | Thêm mới ấn phẩm vào kho thành công | Thủ thư/Admin đăng nhập | 1. Bấm nút "Bổ Sung Ấn Phẩm Mới".<br>2. Nhập Mã sách, Tên sách, Đơn giá, Số quyển, Tác giả, Năm XB, chọn NXB.<br>3. Bấm "Thêm Vào Kho". | Mã: `S999`, Tên: `Kỹ nghệ Phần mềm`, Đơn giá: `150000`, SL: `5` | - Toast thành công.<br>- Danh mục sách hiển thị ấn phẩm mới với số quyển khả dụng = 5.<br>- Ghi nhận vào Audit Trail. |
| **TC-ADM-BOOK-02** | Negative | Chặn thêm sách nếu trùng Mã sách (`MaSach`) | Mã `S001` đã tồn tại | 1. Thêm sách với `MaSach = S001`. | `MaSach`: `S001` | - Backend trả lỗi `BOOK_CODE_EXISTS` (HTTP 400).<br>- Toast báo lỗi mã sách đã tồn tại. |
| **TC-ADM-BOOK-03** | Positive | Cập nhật thông tin sách (Sửa đơn giá, số lượng) | Sách có sẵn trong kho | 1. Nhấn nút "Sửa" tại dòng sách cần chỉnh.<br>2. Sửa đơn giá từ 100k -> 120k.<br>3. Bấm "Cập Nhật Ấn Phẩm". | `DonGia`: `120000` | - Thông tin được cập nhật.<br>- Toast thông báo thành công. |
| **TC-ADM-BOOK-04** | Security | Chặn xóa sách khi đang có người mượn (`SoQuyenDangMuon > 0`) | Cuốn sách có người đang mượn đọc | 1. Bấm icon "Xóa" tại cuốn sách đang có người mượn.<br>2. Xác nhận trong Dialog. | Sách có `SoQuyenDangMuon > 0` | - Backend từ chối với mã `BOOK_IN_BORROW` (HTTP 400).<br>- Toast báo lỗi: *"Không thể xóa ấn phẩm vì đang có độc giả mượn đọc lưu hành."*. |
| **TC-ADM-BOOK-05** | Positive | Xóa mềm sách (Soft Delete) khi không có người mượn | Sách không có ai mượn | 1. Nhấn xóa cuốn sách có `SoQuyenDangMuon = 0`.<br>2. Xác nhận trong Dialog. | Sách hợp lệ | - Sách chuyển trạng thái `TrangThai = ARCHIVED`.<br>- Ẩn khỏi cổng User Portal và danh mục sách đang lưu hành.<br>- Ghi nhận log `ARCHIVE_BOOK` trong Audit Trail. |
| **TC-ADM-BOOK-06** | Positive | Lọc sách trong Kho lưu trữ và Khôi phục ấn phẩm (`ARCHIVED` -> `ACTIVE`) | Có sách trong Kho lưu trữ | 1. Chọn bộ lọc Trạng thái: "Kho lưu trữ (ARCHIVED)".<br>2. Nhấn nút "Khôi phục" (<i class="bi bi-arrow-counterclockwise"></i>) tại sách cần khôi phục.<br>3. Xác nhận trong Dialog. | Sách trạng thái `ARCHIVED` | - Sách chuyển trạng thái thành `ACTIVE`.<br>- Hiển thị lại trên kệ sách lưu hành và User Portal.<br>- Ghi nhận log `RESTORE_BOOK` trong Audit Trail.<br>- Toast thông báo thành công. |

### 3.2. RESTful API liên quan
* **API 1: Lấy danh mục sách**: `GET /api/books?page=1&limit=10&search=...&theLoai=...&status=ACTIVE|ARCHIVED|ALL`
* **API 2: Thêm mới sách**: `POST /api/books` (Payload: `{ MaSach, TenSach, DonGia, SoQuyen, NamXuatBan, MaNXB, NguonGoc, TheLoai, HinhAnh }`)
* **API 3: Sửa sách**: `PUT /api/books/:id` (Payload các trường cần sửa)
* **API 4: Xóa mềm sách (Lưu trữ)**: `DELETE /api/books/:id`
* **API 5: Khôi phục sách từ kho lưu trữ**: `PATCH /api/books/:id/restore` hoặc `PUT /api/books/:id/restore`

---

## 4. Trang Hàng Đợi & Xuất Sách Cho Bạn Đọc (`BorrowQueueView.vue` - `/borrows`)

### 4.1. Bảng Ca kiểm thử (Test Cases)

| Test Case ID | Loại | Tiêu đề Ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-BRW-01** | Positive | Duyệt yêu cầu mượn trực tuyến (`PENDING` -> `APPROVED`) | Có đơn mượn `PENDING` | 1. Tại tab "Yêu Cầu Chờ Duyệt", bấm nút "Duyệt Yêu Cầu".<br>2. Xác nhận giữ sách tại quầy 48h. | Phiếu mượn `_id` | - Trạng thái chuyển sang `APPROVED`.<br>- Đơn nhảy sang tab "Đã Duyệt - Chờ Xuất Sách (48h)".<br>- Toast thành công: *"Đã duyệt đơn mượn và giữ sách tại quầy trong 48h."*. |
| **TC-ADM-BRW-02** | Positive | Thủ thư xuất sách khi độc giả đến quầy (`APPROVED` -> `BORROWED`) | Đơn ở trạng thái `APPROVED` | 1. Tại tab "Đã Duyệt", độc giả xuất trình thẻ thư viện.<br>2. Thủ thư bấm "Xuất Sách Cho Bạn Đọc".<br>3. Xác nhận. | Phiếu mượn `_id` | - Trạng thái chuyển thành `BORROWED`.<br>- Tự động ấn định ngày hẹn trả `HanTra = Hiện tại + 14 ngày`.<br>- Tăng số lượt mượn của sách (`LuotMuon + 1`). |
| **TC-ADM-BRW-03** | Positive | Từ chối yêu cầu mượn kèm lý do (`PENDING` -> `REJECTED`) | Có đơn mượn `PENDING` | 1. Bấm nút "Từ chối".<br>2. Nhập lý do từ chối vào Modal: "Sách đang được bảo quản đặc biệt".<br>3. Bấm "Xác Nhận Từ Chối". | Lý do: `"Sách đang bảo quản đặc biệt"` | - Trạng thái chuyển sang `REJECTED`.<br>- Hoàn lại số sách khả dụng (+1 `SoQuyenKhaDung`).<br>- Ghi nhận lý do từ chối để độc giả theo dõi. |

### 4.2. RESTful API liên quan
* **API 1: Lấy danh sách phiếu mượn toàn hệ thống**: `GET /api/borrows`
* **API 2: Duyệt mượn sách**: `PUT /api/borrows/:id/approve`
* **API 3: Xuất sách giao cho bạn đọc**: `PUT /api/borrows/:id/checkout`
* **API 4: Từ chối đơn mượn**: `PUT /api/borrows/:id/reject` (Payload: `{ lyDoTuChoi: "..." }`)

---

## 5. Trang Nhận Trả Sách & Xử Lý Sự Cố (`ReturnsView.vue` - `/returns`)

### 5.1. Bảng Ca kiểm thử (Test Cases)

| Test Case ID | Loại | Tiêu đề Ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-RET-01** | Positive | Nhận trả sách nguyên vẹn thành công (`BORROWED` -> `RETURNED`) | Phiếu mượn trạng thái `BORROWED` | 1. Nhập mã phiếu hoặc tìm độc giả.<br>2. Bấm nút "Xác Nhận Nhận Trả Sách (Nguyên vẹn)".<br>3. Xác nhận. | Phiếu mượn `_id` | - Trạng thái chuyển thành `RETURNED`.<br>- Cập nhật `NgayTra = Hiện tại`.<br>- Tăng số sách khả dụng trong kho +1.<br>- Giảm `SoQuyenDangMuon` của sách -1. |
| **TC-ADM-RET-02** | Positive | Lập biên bản sự cố Sách bị Hư hỏng/Rách (Mặc định tiền phạt bằng giá niêm yết của sách) | Sách trả về bị rách trang | 1. Bấm nút "Báo Cáo Sự Cố (Hư hại / Mất)".<br>2. Kiểm tra ô "Số tiền bồi thường" được tự động điền sẵn bằng đơn giá niêm yết của sách.<br>3. Chọn loại sự cố: "Hư hỏng / Rách".<br>4. Thủ thư có thể giữ nguyên hoặc điều chỉnh số tiền và nhập mô tả.<br>5. Bấm "Xác Nhận Lập Biên Bản". | `LoaiSuCo`: `DAMAGED`, `SoTien`: `DonGia` sách | - Modal tự động điền số tiền bồi thường mặc định bằng giá niêm yết của ấn phẩm.<br>- Tạo bản ghi trong `BienBanBoiThuong` trạng thái `UNPAID`.<br>- Phiếu mượn chuyển `RETURNED`, tăng `SoQuyenHuHong` trong kho.<br>- Quyền mượn sách mới của độc giả bị khóa cho đến khi nộp phạt. |
| **TC-ADM-RET-03** | Positive | Lập biên bản sự cố Làm mất sách | Độc giả làm mất sách | 1. Bấm "Báo Cáo Sự Cố".<br>2. Chọn loại sự cố: "Làm mất sách".<br>3. Hệ thống tự động gán số tiền mặc định bằng giá sách (thủ thư có thể điều chỉnh).<br>4. Bấm "Xác Nhận Lập Biên Bản". | `LoaiSuCo`: `LOST`, `SoTien`: `DonGia` sách | - Tăng `SoQuyenHuHong` / giảm sách khả dụng trong kho.<br>- Tạo biên bản bồi thường nợ phạt theo đúng đơn giá sách. |

### 5.2. RESTful API liên quan
* **API 1: Nhận trả sách nguyên vẹn**: `PUT /api/borrows/:id/return`
* **API 2: Lập biên bản bồi thường sự cố**:
  * `Method`: `POST`
  * `Endpoint`: `/api/fines`
  * `Payload`:
    ```json
    {
      "theoDoiMuonId": "65f1c2...",
      "loaiSuCo": "DAMAGED",
      "soTienBoiThuong": 50000,
      "moTa": "Bị rách bìa và mất 3 trang cuối"
    }
    ```

---

## 6. Trang Quản Lý Biên Bản Bồi Thường (`FinesView.vue` - `/fines`)

### 6.1. Bảng Ca kiểm thử (Test Cases)

| Test Case ID | Loại | Tiêu đề Ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-FINE-01** | Positive | Xem danh sách biên bản phạt & lọc trạng thái | Có biên bản trong hệ thống | 1. Truy cập `/fines`.<br>2. Lọc theo trạng thái "Chưa thanh toán (UNPAID)" và "Đã giải quyết (PAID)". | Filter tab | - Hiển thị đúng danh sách biên bản, họ tên độc giả, số tiền bồi thường. |
| **TC-ADM-FINE-02** | Positive | Xác nhận thu tiền phạt & Khôi phục quyền mượn sách | Biên bản ở trạng thái `UNPAID` | 1. Độc giả nộp tiền mặt/chuyển khoản tại quầy.<br>2. Thủ thư bấm nút "Xác Nhận Đã Thu Tiền".<br>3. Xác nhận trong Dialog. | Biên bản `_id` | - Trạng thái chuyển sang `PAID`.<br>- Tự động mở lại quyền mượn sách cho bạn đọc (nếu không còn vi phạm nào khác).<br>- Toast thông báo thành công. |

### 6.2. RESTful API liên quan
* **API 1: Lấy danh sách biên bản bồi thường**: `GET /api/fines`
* **API 2: Xác nhận đã bồi thường / Thu tiền phạt**:
  * `Method`: `PUT`
  * `Endpoint`: `/api/fines/:id/resolve`
  * `Response chuẩn`: `HTTP 200 OK` (Cập nhật `TrangThai: 'PAID'`, `NgayGiaiQuyet: Date.now`).

---

## 7. Trang Quản Lý Tài Khoản & Phân Quyền Nhân Sự (`UsersManageView.vue` - `/users`)

> **Quyền hạn truy cập bắt buộc:** Chỉ dành riêng cho `ADMIN` (Quản trị viên Tối cao).

### 7.1. Bảng Ca kiểm thử (Test Cases)

| Test Case ID | Loại | Tiêu đề Ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-USER-01** | Positive | Xem danh sách Bạn đọc, Nhân sự và Blacklist | Quyền `ADMIN` | 1. Truy cập `/users`.<br>2. Chuyển đổi giữa 3 tab: "Danh Sách Độc Giả", "Nhân Sự & Thủ Thư", "Danh Sách Vi Phạm Blacklist". | Token `ADMIN` | - Tab Độc giả hiển thị các tài khoản độc giả (DGxxx).<br>- Tab Nhân sự hiển thị Admin và Thủ thư (NVxxx).<br>- Tab Blacklist hiển thị độc giả đang bị khóa. |
| **TC-ADM-USER-02** | Positive | Tạo mới tài khoản Thủ thư (`BOOK_MANAGER`) | Quyền `ADMIN` | 1. Bấm "Thêm Nhân Viên Mới".<br>2. Nhập Họ tên, Email, SĐT, chọn vai trò: `BOOK_MANAGER`, Mật khẩu.<br>3. Bấm "Tạo Tài Khoản". | Tên: "Nguyễn Văn An", Email: `an.thuthu@library.com`, Pass: `An@12345` | - Tạo bản ghi trong collection `NhanVien`.<br>- Tự động sinh mã `NVxxx`.<br>- Tài khoản mới đăng nhập được vào Admin Portal với quyền Thủ thư. |
| **TC-ADM-USER-03** | Positive | Thay đổi phân quyền vai trò người dùng | Quyền `ADMIN` | 1. Tại dòng tài khoản nhân viên, bấm "Đổi quyền".<br>2. Nhập vai trò mới: `ADMIN`. | `Role`: `ADMIN` | - Cập nhật `ChucVu = ADMIN`.<br>- Nhân viên này được cấp toàn quyền quản trị hệ thống. |
| **TC-ADM-USER-04** | Positive | Khóa tài khoản đưa vào Blacklist thủ công | Độc giả vi phạm nội quy | 1. Tại dòng độc giả, bấm "Khóa Blacklist".<br>2. Nhập lý do khóa: "Gây rối trật tự phòng đọc".<br>3. Xác nhận. | Lý do: `"Gây rối trật tự phòng đọc"` | - Cập nhật `DaBiKhoa = true`, `LyDoKhoa`.<br>- Tài khoản độc giả bị chặn đặt mượn sách ngay lập tức tại User Portal. |
| **TC-ADM-USER-05** | Positive | Gỡ tài khoản khỏi Blacklist | Tài khoản đang bị khóa | 1. Tại tab Blacklist, bấm nút "Gỡ khóa".<br>2. Xác nhận. | Độc giả `_id` | - Cập nhật `DaBiKhoa = false`, `LyDoKhoa = null`.<br>- Độc giả được khôi phục quyền mượn sách. |
| **TC-ADM-USER-06** | Security | Chặn Thủ thư (`BOOK_MANAGER`) truy cập trang `/users` | Đăng nhập tài khoản `BOOK_MANAGER` | 1. Truy cập trực tiếp URL `http://localhost:3001/users`. | Token `BOOK_MANAGER` | - Router Guard RBAC chặn lại.<br>- Toast cảnh báo: *"Thao tác bị từ chối: Trang này yêu cầu quyền Quản trị viên Tối cao (ADMIN)."*<br>- Tự động redirect về `/`. |

### 7.2. RESTful API liên quan
* **API 1: Lấy danh sách toàn bộ người dùng (Độc giả & Nhân sự)**: `GET /api/users`
* **API 2: Tạo mới nhân viên/thủ thư**:
  * `Method`: `POST`
  * `Endpoint`: `/api/users`
  * `Payload`: `{ hoTenNV, email, password, chucVu, soDienThoai, diaChi }`
* **API 3: Cập nhật chức vụ vai trò**:
  * `Method`: `PUT`
  * `Endpoint`: `/api/users/:id/role`
  * `Payload`: `{ role: 'ADMIN' }` (hỗ trợ cả `{ chucVu: 'ADMIN' }`)
* **API 4: Khóa/Mở khóa Blacklist độc giả**:
  * `Method`: `PUT`
  * `Endpoint`: `/api/users/:id/blacklist`
  * `Payload`: `{ isBlacklisted: true, reason: 'Gây rối tại thư viện' }` (hỗ trợ cả `{ daBiKhoa, lyDoKhoa }`)

---

## 8. Trang Cấu Hình Quy Chế Lưu Thông Thư Viện (`SettingsView.vue` - `/settings`)

> **Quyền hạn truy cập bắt buộc:** Chỉ dành riêng cho `ADMIN`.

### 8.1. Bảng Ca kiểm thử (Test Cases)

| Test Case ID | Loại | Tiêu đề Ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-SET-01** | Positive | Tải và hiển thị các tham số quy chế thư viện | Quyền `ADMIN` | 1. Mở `/settings`. | Token `ADMIN` | - Hiển thị các trường cấu hình: Số sách mượn tối đa (3), Số ngày mượn tiêu chuẩn (14 ngày), Giờ giữ sách tại quầy (48h), Ngày gia hạn (+7 ngày). |
| **TC-ADM-SET-02** | Positive | Cập nhật tham số quy chế lưu thông mới | Quyền `ADMIN` | 1. Đổi số sách tối đa từ 3 lên 5 cuốn.<br>2. Bấm "Lưu Thay Đổi Quy Chế". | `maxBooksPerReader`: `5` | - Lưu thành công.<br>- Alert thông báo: *"Đã lưu và áp dụng thành công các quy chế lưu thông mới của thư viện!"*. |
| **TC-ADM-SET-03** | Negative | Chặn nhập số âm hoặc giá trị vượt khung cho phép | Quyền `ADMIN` | 1. Nhập số sách mượn tối đa = `-1` hoặc `99`. | `maxBooksPerReader`: `-1` | - Trình duyệt chặn submit form theo ràng buộc `min="1" max="10"`. |

---

## 9. Trang Nhật Ký Kiểm Toán Tác Nghiệp (`AuditLogsView.vue` - `/audit-logs`)

> **Quyền hạn truy cập bắt buộc:** Chỉ dành riêng cho `ADMIN`.

### 9.1. Bảng Ca kiểm thử (Test Cases)

| Test Case ID | Loại | Tiêu đề Ca kiểm thử | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-AUDIT-01** | Positive | Tự động ghi nhận và hiển thị lịch sử thao tác hệ thống | Đã thực hiện ít nhất 1 thao tác mượn/sửa/xóa sách | 1. Truy cập `/audit-logs`. | Token `ADMIN` | - Hiển thị bảng nhật ký tác nghiệp.<br>- Cột Thời gian: hiển thị chính xác ngày giờ thực hiện.<br>- Cột Người thực hiện: hiển thị họ tên và MSNV.<br>- Cột Hành động: badge phân loại rõ ràng (Thêm sách, Duyệt mượn, Xuất sách, Đổi quyền,...).<br>- Cột Chi tiết: mô tả cụ thể tài liệu bị tác động. |
| **TC-ADM-AUDIT-02** | Positive | Làm mới dữ liệu nhật ký kiểm toán | Quyền `ADMIN` | 1. Thực hiện duyệt 1 đơn mượn tại `/borrows`.<br>2. Mở `/audit-logs` bấm nút "Làm mới nhật ký". | Thao tác vừa làm | - Bản ghi hành động `APPROVE_BORROW` xuất hiện ngay tại dòng đầu tiên. |

### 9.2. RESTful API liên quan
* **API: Tra cứu nhật ký kiểm toán Audit Trail**
  * `Method`: `GET`
  * `Endpoint`: `/api/stats/audit-logs?page=1&limit=20`
  * `Headers`: `Authorization: Bearer <adminToken>`
  * `Response chuẩn`: `HTTP 200 OK`
    ```json
    {
      "success": true,
      "data": [
        {
          "_id": "65f1b...",
          "ThoiGian": "2026-09-27T09:15:00.000Z",
          "HanhDong": "CHECKOUT_BORROW",
          "NguoiThucHien": {
            "MSNV": "NV001",
            "HoTen": "Quản trị viên Hệ thống",
            "ChucVu": "ADMIN",
            "DiaChiIP": "127.0.0.1"
          },
          "DoiTuongTacDong": {
            "Collection": "TheoDoiMuonSach",
            "DocumentId": "65f1c...",
            "MaDinhDanh": "S001"
          },
          "ChiTiet": "Thủ thư Quản trị viên Hệ thống (NV001) đã xuất sách 'S001' cho bạn đọc Trần Nam (DG001) mang về."
        }
      ]
    }
    ```

---

## BẢNG TỔNG HỢP MATRIX RESTFUL API & CÁC TRANG SỬ DỤNG

| HTTP Method | RESTful API Endpoint | Cổng sử dụng | Các trang View gọi tới | Quyền hạn yêu cầu |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | User Portal | `RegisterView.vue` | Khách (Public) |
| `POST` | `/api/auth/reader/login` | User Portal | `LoginView.vue` (User Portal) | Khách (Public - Chỉ độc giả `USER`) |
| `POST` | `/api/auth/admin/login` | Admin Portal | `LoginView.vue` (Admin Portal) | Khách (Public - Chỉ nhân sự `ADMIN`/`BOOK_MANAGER`) |
| `POST` | `/api/auth/login` | Cả 2 Portals | Tương thích ngược / Scripts | Khách (Public) |
| `POST` | `/api/auth/logout` | Cả 2 Portals | Toàn hệ thống (Header / Navbar) | Đã đăng nhập |
| `POST` | `/api/auth/refresh-token` | Cả 2 Portals | `api.js` Axios Interceptor | Đã đăng nhập |
| `GET` | `/api/auth/me` | User Portal | `ProfileView.vue` | Độc giả (`USER`) |
| `PUT` | `/api/auth/profile` | User Portal | `ProfileView.vue` | Độc giả (`USER`) |
| `PUT` | `/api/auth/change-password` | User Portal | `ProfileView.vue` | Độc giả (`USER`) |
| `POST` | `/api/upload/avatar` | User Portal | `ProfileView.vue` | Độc giả (`USER`) |
| `GET` | `/api/books` | Cả 2 Portals | `HomeView`, `BooksView`, `BooksManageView` | Public / Staff |
| `GET` | `/api/books/:id` | Cả 2 Portals | `BookDetailView.vue` | Public |
| `POST` | `/api/books` | Admin Portal | `BooksManageView.vue` | Thủ thư / Admin |
| `PUT` | `/api/books/:id` | Admin Portal | `BooksManageView.vue` | Thủ thư / Admin |
| `DELETE` | `/api/books/:id` | Admin Portal | `BooksManageView.vue` | Thủ thư / Admin |
| `GET` | `/api/publishers` | Cả 2 Portals | `HomeView`, `BooksView`, `BooksManageView` | Public / Staff |
| `GET` | `/api/borrows/my-borrows` | User Portal | `MyBorrowsView.vue` | Độc giả (`USER`) |
| `POST` | `/api/borrows` | User Portal | `BookDetailView.vue` | Độc giả (`USER`) |
| `PUT` | `/api/borrows/:id/renew` | User Portal | `MyBorrowsView.vue` | Độc giả (`USER`) |
| `DELETE` | `/api/borrows/:id` | User Portal | `MyBorrowsView.vue` | Độc giả (`USER`) |
| `GET` | `/api/borrows` | Admin Portal | `BorrowQueueView`, `ReturnsView` | Thủ thư / Admin |
| `PUT` | `/api/borrows/:id/approve` | Admin Portal | `BorrowQueueView.vue` | Thủ thư / Admin |
| `PUT` | `/api/borrows/:id/checkout`| Admin Portal | `BorrowQueueView.vue` | Thủ thư / Admin |
| `PUT` | `/api/borrows/:id/reject` | Admin Portal | `BorrowQueueView.vue` | Thủ thư / Admin |
| `PUT` | `/api/borrows/:id/return` | Admin Portal | `ReturnsView.vue` | Thủ thư / Admin |
| `GET` | `/api/fines` | Admin Portal | `FinesView.vue` | Thủ thư / Admin |
| `POST` | `/api/fines` | Admin Portal | `ReturnsView.vue` | Thủ thư / Admin |
| `PUT` | `/api/fines/:id/resolve` | Admin Portal | `FinesView.vue` | Thủ thư / Admin |
| `GET` | `/api/users` | Admin Portal | `UsersManageView.vue` | `ADMIN` Tối cao |
| `POST` | `/api/users` | Admin Portal | `UsersManageView.vue` | `ADMIN` Tối cao |
| `PUT` | `/api/users/:id/role` | Admin Portal | `UsersManageView.vue` | `ADMIN` Tối cao |
| `PUT` | `/api/users/:id/blacklist` | Admin Portal | `UsersManageView.vue` | `ADMIN` Tối cao |
| `GET` | `/api/stats/summary` | Admin Portal | `DashboardView.vue` | Thủ thư / Admin |
| `GET` | `/api/stats/top-books` | Admin Portal | `DashboardView.vue` | Thủ thư / Admin |
| `GET` | `/api/stats/export/borrows`| Admin Portal | `DashboardView.vue` | `ADMIN` Tối cao |
| `GET` | `/api/stats/export/fines` | Admin Portal | `DashboardView.vue` | `ADMIN` Tối cao |
| `GET` | `/api/stats/audit-logs` | Admin Portal | `AuditLogsView.vue` | `ADMIN` Tối cao |