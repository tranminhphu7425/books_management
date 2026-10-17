Dưới đây là **Dàn ý Mục lục Chi tiết** và **Hướng dẫn Nội dung Trình bày từng phần** chuẩn theo văn phong báo cáo học thuật trường ĐH Cần Thơ cho đề tài: **"XÂY DỰNG HỆ THỐNG QUẢN LÝ SÁCH VÀ MƯỢN TRẢ TRỰC TUYẾN"**.

---

# PHẦN I: KHUNG BÌA VÀ CÁC TRANG ĐẦU BÁO CÁO

### 1. Trang Bìa chính & Bìa phụ

- **Đơn vị:** ĐẠI HỌC CẦN THƠ – TRƯỜNG CÔNG NGHỆ THÔNG TIN & TRUYỀN THÔNG.
- **Tên báo cáo:** BÁO CÁO PHÁT TRIỂN ỨNG DỤNG WEB (hoặc BÁO CÁO NIÊN LUẬN CƠ SỞ / NGÀNH CNTT).
- **Đề tài:** **XÂY DỰNG WEBSITE QUẢN LÝ SÁCH VÀ MƯỢN TRẢ TRỰC TUYẾN**
- **Giảng viên hướng dẫn:** _Ths. [Tên Giảng Viên]_
- **Sinh viên thực hiện:** _[Họ tên Sinh viên] – MSSV: [Bxxxxxxx] – Mã lớp/Ngành: Kỹ thuật phần mềm / KHMT / CNTT._
- **Thời gian:** _Cần Thơ, Tháng ... năm 202..._

### 2. Lời Cảm Ơn (Bài mẫu chuẩn văn phong sinh viên)

> _"Để hoàn thành được báo cáo Phát triển ứng dụng web, đầu tiên cho em gửi một lời cảm ơn chân thành nhất đến toàn thể Quý Thầy Cô của Trường Công nghệ Thông tin & Truyền thông – Đại học Cần Thơ đã tận tình giảng dạy, truyền đạt cho em những kiến thức nền tảng và kỹ năng lập trình quý báu trong suốt quá trình học tập."_
>
> _"Đặc biệt, em xin gửi lời cảm ơn sâu sắc đến Thầy/Cô [Tên Giảng Viên Hướng Dẫn] đã dành thời gian quý báu tận tình chỉ bảo, định hướng và giúp đỡ em trong suốt quá trình triển khai đề tài 'Xây dựng website quản lý sách và mượn trả trực tuyến'. Những lời góp ý và nhận xét xác đáng của Thầy/Cô đã giúp em hoàn thiện tư duy phân tích hệ thống cũng như khắc phục được nhiều thiếu sót trong quá trình xây dựng ứng dụng."_
>
> _"Em cũng xin gửi lời cảm ơn đến gia đình và bạn bè đã luôn động viên, hỗ trợ và đóng góp những ý kiến hữu ích để em hoàn thành tốt đề tài này."_
>
> _"Mặc dù đã rất nỗ lực cố gắng, song do kiến thức và kinh nghiệm thực tế còn hạn chế, cuốn báo cáo chắc chắn khó tránh khỏi những thiếu sót nhất định. Em rất mong nhận được sự cảm thông và những ý kiến đóng góp quý báu từ Quý Thầy Cô để hệ thống được hoàn thiện hơn nữa._  
> _Em xin chân thành cảm ơn!"_
>
> _Cần Thơ, ngày ... tháng ... năm 202..._  
> _Sinh viên thực hiện: [Họ và tên]_

---

# PHẦN II: DÀN Ý MỤC LỤC CHI TIẾT (TABLE OF CONTENTS)

```text
LỜI CẢM ƠN .................................................................... 2
DANH MỤC HÌNH ................................................................. 4
DANH MỤC BẢNG ................................................................. 6
DANH MỤC TỪ VIẾT TẮT .......................................................... 7

CHƯƠNG I: GIỚI THIỆU ........................................................... 8
  1. Đặt vấn đề ................................................................ 8
  2. Mục tiêu đề tài ........................................................... 8
     2.1. Về nghiệp vụ và quản lý ............................................. 8
     2.2. Về trải nghiệm người dùng và giao diện .............................. 9
  3. Đối tượng và phạm vi nghiên cứu ........................................... 9
     3.1. Đối tượng nghiên cứu ................................................ 9
     3.2. Phạm vi đề tài ...................................................... 9
  4. Phương pháp nghiên cứu .................................................... 10
  5. Các chức năng chính của hệ thống .......................................... 10
     5.1. Phân hệ Cổng Độc giả (User Portal) .................................. 10
     5.2. Phân hệ Cổng Quản trị & Thủ thư (Admin Portal) ....................... 11

CHƯƠNG II: ĐẶC TẢ YÊU CẦU & CÔNG NGHỆ SỬ DỤNG ................................. 12
  1. Mô tả bài toán nghiệp vụ thư viện ........................................ 12
  2. Yêu cầu chi tiết hệ thống ................................................ 12
     2.1. Yêu cầu đối với Khách vãng lai (Guest) .............................. 12
     2.2. Yêu cầu đối với Độc giả đã đăng nhập (Reader/User) .................. 13
     2.3. Yêu cầu đối với Quản lý kho sách (Book Manager) ..................... 13
     2.4. Yêu cầu đối với Quản trị viên hệ thống (Admin) ...................... 14
     2.5. Các ràng buộc nghiệp vụ trọng yếu (Business Rules) ................... 14
  3. Ngôn ngữ lập trình, kiến trúc và công nghệ liên quan ...................... 15
     3.1. Kiến trúc Monorepo & Phân cổng độc lập .............................. 15
     3.2. Giao diện phía Client (Vue 3, Bootstrap 5, Vite) .................... 16
     3.3. Xử lý phía Server (Node.js & Express.js) ............................. 17
     3.4. Hệ quản trị cơ sở dữ liệu (MongoDB 7.x & Mongoose/Native Driver) .... 18
     3.5. Cơ chế Xác thực & Bảo mật (JWT, Google OAuth 2.0, Helmet, Rate Limit) 19
     3.6. Công cụ hỗ trợ phát triển (VS Code, Postman, Git) .................... 20

CHƯƠNG III: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG .................................... 21
  1. Phân tích mô hình Use Case ............................................... 21
     1.1. Sơ đồ Use Case tổng quát ............................................ 21
          1.1.1. Biểu đồ Use Case tổng quan hệ thống .......................... 21
          1.1.2. Bảng đặc tả tóm tắt danh sách Use Case ....................... 22
     1.2. Phân rã và đặc tả Use Case nhóm Xác thực & Tài khoản ................. 23
          1.2.1. Sơ đồ Use Case Đăng ký, Đăng nhập & Google OAuth 2.0 .......... 23
          1.2.2. Bảng đặc tả Use Case Đăng nhập (Local & Google) .............. 24
          1.2.3. Bảng đặc tả Use Case Đăng ký tài khoản độc giả ................ 25
     1.3. Phân rã và đặc tả Use Case phân hệ Độc giả (User Portal) ............ 26
          1.3.1. Sơ đồ Use Case Tra cứu và Đăng ký mượn sách .................. 26
          1.3.2. Bảng đặc tả Use Case Tìm kiếm & Lọc sách ..................... 27
          1.3.3. Bảng đặc tả Use Case Đặt mượn sách & Kiểm tra ràng buộc ...... 28
          1.3.4. Bảng đặc tả Use Case Gia hạn / Hủy đơn mượn .................. 29
     1.4. Phân rã và đặc tả Use Case phân hệ Quản trị (Admin Portal) ........... 30
          1.4.1. Sơ đồ Use Case Quản lý kho sách (Books & Publishers) ......... 30
          1.4.2. Bảng đặc tả Use Case Thêm / Sửa / Xóa mềm sách ............... 31
          1.4.3. Sơ đồ Use Case Xử lý Mượn - Trả sách ......................... 32
          1.4.4. Bảng đặc tả Use Case Duyệt đơn & Xuất sách (Check-out) ....... 33
          1.4.5. Bảng đặc tả Use Case Nhận trả sách & Lập biên bản sự cố ...... 34
          1.4.6. Sơ đồ & Đặc tả Use Case Quản lý người dùng và Blacklist ....... 35
  2. Thiết kế Cơ sở dữ liệu (Database Design) ................................. 36
     2.1. Mô hình quan hệ thực thể (ERD) / Mô hình dữ liệu khái niệm (CDM) .... 36
     2.2. Danh mục các bảng / Collections trong hệ thống ...................... 37
     2.3. Đặc tả chi tiết các Collection cốt lõi theo đề tài: .................. 38
          2.3.1. Collection DocGia (Thông tin bạn đọc & Tài khoản) ............ 38
          2.3.2. Collection NhanVien (Nhân viên, Thủ thư & Quản trị) .......... 39
          2.3.3. Collection NhaXuatBan (Nhà xuất bản) ......................... 40
          2.3.4. Collection Sach (Kho sách, bản in, trạng thái lưu hành) ...... 41
          2.3.5. Collection TheoDoiMuonSach (Theo dõi mượn - trả ấn phẩm) ..... 42
     2.4. Đặc tả chi tiết các Collection bổ trợ mở rộng: ....................... 43
          2.4.1. Collection TheLoai (Danh mục thể loại sách) ................... 43
          2.4.2. Collection BienBanBoiThuong (Biên bản hỏng/mất & thu tiền) .... 44
          2.4.3. Collection CauHinhHeThong (Quy định hạn mức mượn trả) ......... 45
          2.4.4. Collection NhatKyHoatDong (Audit Trail truy vết tác nghiệp) ... 46

CHƯƠNG IV: KẾT QUẢ THỰC HIỆN VÀ THIẾT KẾ GIAO DIỆN ............................ 47
  1. Phong cách thiết kế giao diện (Design System "Warm Academic") ............. 47
  2. Giao diện Phân hệ Quản trị (Admin Portal - admin.library.local:3000) ...... 48
     2.1. Giao diện Đăng nhập quản trị & Điều hướng phân quyền RBAC ............ 48
     2.2. Giao diện Bảng điều khiển tổng quan & Thống kê (Dashboard) ........... 49
     2.3. Giao diện Quản lý kho sách (Thêm sách, PublisherSelect, Danh sách) ... 50
     2.4. Giao diện Xử lý hàng đợi duyệt mượn (Borrow Queue & Check-out) ....... 51
     2.5. Giao diện Nhận trả sách & Kiểm tra chất lượng (Returns & Check-in) ... 52
     2.6. Giao diện Lập biên bản đền bù & Thu phí tại quầy (Fines/Compensations) 53
     2.7. Giao diện Quản lý người dùng, nhân sự và Blacklist .................. 54
     2.8. Giao diện Modal tra cứu nhanh (BookDetailModal & UserDetailModal) .... 55
  3. Giao diện Phân hệ Độc giả (User Portal - library.local:3000) ............... 56
     3.1. Giao diện Trang chủ & Khám phá tủ sách (Hero Banner, Book Cards) .... 56
     3.2. Giao diện Đăng ký, Đăng nhập và Tích hợp Google OAuth 2.0 ............ 57
     3.3. Giao diện Chi tiết sách & Form đăng ký mượn sách .................... 58
     3.4. Giao diện Lịch sử mượn trả cá nhân & Thao tác Gia hạn / Hủy đơn ...... 59
     3.5. Giao diện Biên bản sự cố cá nhân & Thông báo bồi hoàn ............... 60
     3.6. Giao diện Hồ sơ cá nhân & Đổi mật khẩu bảo mật ...................... 61

CHƯƠNG V: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN ........................................ 62
  1. Kết quả đạt được .......................................................... 62
     1.1. Về mặt lý thuyết và kỹ năng chuyên môn .............................. 62
     1.2. Về mặt sản phẩm phần mềm ............................................ 62
  2. Những hạn chế của hệ thống ................................................ 63
  3. Hướng phát triển trong tương lai .......................................... 64

TÀI LIỆU THAM KHẢO ............................................................ 65
```

---

# PHẦN III: HƯỚNG DẪN CHI TIẾT NỘI DUNG CẦN TRÌNH BÀY TRONG TỪNG PHẦN

Dưới đây là nội dung chi tiết cần điền vào từng mục để cuốn báo cáo đạt chuẩn công nghệ và bảo vệ tự tin trước hội đồng chấm thi:

### CHƯƠNG I: GIỚI THIỆU

- **1. Đặt vấn đề:**
  - Nêu thực trạng: Quy trình quản lý thư viện truyền thống bằng sổ tay hoặc Excel dễ gây thất thoát sách, khó đôn đốc sách quá hạn, độc giả mất công đến thư viện nhưng sách đã hết trên kệ.
  - Sự cần thiết của chuyển đổi số: Cần một hệ thống quản lý trực tuyến cho phép độc giả tra cứu tồn kho theo thời gian thực và đặt trước sách, đồng thời giúp thủ thư kiểm soát xuất/nhập/đền bù chuẩn xác.
- **2. Mục tiêu đề tài:**
  - _Về quản lý:_ Tự động hóa kiểm soát tồn kho (`SoQuyen`, `SoQuyenKhaDung`, `SoQuyenDangMuon`), phân tách quyền hạn chặt chẽ (Admin vs Book Manager), giám sát vi phạm và bồi thường rách/mất sách.
  - _Về trải nghiệm (UI/UX):_ Thiết kế giao diện theo phong cách _"Warm Academic"_ (Thư viện Hàn lâm ấm áp với màu nền giấy kem `#FDFBF7`, màu xanh lục bảo `#1B4332`), mang lại cảm giác thân thiện, dịu mắt cho người đọc.
- **3. Đối tượng và phạm vi nghiên cứu:**
  - _Đối tượng:_ Độc giả (sinh viên, bạn đọc), Thủ thư và Quản trị viên thư viện; quy trình quản lý vòng đời mượn - trả sách.
  - _Phạm vi:_ Ứng dụng Web chạy trên môi trường cục bộ/mạng nội bộ với mô hình Monorepo (Cổng Độc giả: `http://library.local:3000` / `127.0.0.1:3000`, Cổng Quản trị: `http://admin.library.local:3000` / `127.0.0.2:3000` hoặc port 3001, Backend API: port 5000).
- **4. Phương pháp nghiên cứu:**
  - Phương pháp phân tích thiết kế hướng đối tượng (UML: Use Case, ERD/CDM).
  - Nghiên cứu mô hình RESTful API, kiến trúc bảo mật đa lớp (JWT, OAuth 2.0, Helmet, Rate Limiter).
- **5. Các chức năng chính:** Liệt kê ngắn gọn các chức năng chia theo 2 phân hệ (User Portal và Admin Portal).

> [!IMPORTANT]
> **Ràng buộc phân định & Chống lặp ý của Chương I:**
> - **Được viết (Tầng Vĩ mô / Tầm nhìn):** Nêu thực trạng bất cập, lý do chọn đề tài, mục tiêu tổng quát (giao diện, quản lý), đối tượng, phạm vi cấp cao, phương pháp (chỉ nêu tên stack MEVN) và liệt kê 5-8 gạch đầu dòng tên nhóm chức năng chính.
> - **CẤM VIẾT (Để dành cho các chương sau):**
>   + KHÔNG mô tả kịch bản mượn trả từng bước (để dành cho Chương II.1).
>   + KHÔNG nêu các con số quy tắc cụ thể: 3 cuốn, giữ 48h, hạn 14 ngày, phạt tiền (để dành cho Chương II.2).
>   + KHÔNG phân tích sâu kỹ thuật, ưu nhược điểm Vue/Node/Mongo (để dành cho Chương II.3).
>   + KHÔNG vẽ sơ đồ Use Case, CDM hay bảng CSDL (để dành cho Chương III).
>   + KHÔNG nhắc đến các nút bấm, modal, form giao diện (để dành cho Chương IV).

---

### CHƯƠNG II: ĐẶC TẢ YÊU CẦU & CÔNG NGHỆ SỬ DỤNG

- **1. Mô tả bài toán nghiệp vụ:** Mô tả quy trình thực tế từ lúc bạn đọc tra cứu -> tạo đơn mượn trực tuyến -> hệ thống giữ sách 48h -> thủ thư duyệt -> độc giả đến nhận sách tại quầy (Check-out) -> đọc trong 14 ngày (gia hạn 1 lần 7 ngày) -> trả sách tại quầy (Check-in) -> thủ thư nghiệm thu (nguyên vẹn hoặc lập biên bản bồi thường nếu rách/mất).
- **2. Yêu cầu chi tiết hệ thống & Ràng buộc cốt lõi:**
  - _Khách vãng lai:_ Xem danh mục sách, lọc sách, tìm kiếm, xem trang giới thiệu quy định.
  - _Độc giả (User):_ Đăng nhập Local / Google, mượn sách, hủy đơn mượn chờ duyệt, gia hạn, xem biên bản đền bù.
  - _Quản lý kho sách (Book Manager):_ Quản lý ấn phẩm, thêm nhanh NXB, cập nhật số lượng, kệ sách.
  - _Quản trị viên (Admin):_ Toàn quyền kho sách, duyệt đơn mượn, xuất/nhận sách, lập biên bản, xử lý thu tiền đền bù, quản lý Blacklist, xem Dashboard thống kê và Audit Logs.
  - _Bộ quy tắc nghiệp vụ vàng (Business Rules - trích từ Master Guide):_
    - Mượn tối đa 3 cuốn sách cùng lúc.
    - Chặn mượn nếu: Bị Blacklist, có sách quá hạn chưa trả, có biên bản hỏng/mất sách chưa bồi thường (`UNPAID`), hoặc sách hết tồn kho khả dụng (`SoQuyenKhaDung <= 0`).
    - Thời hạn giữ sách sau duyệt: 48 giờ. Hạn mượn chuẩn: 14 ngày.
- **3. Ngôn ngữ & Công nghệ sử dụng:**
  - Trình bày kèm logo và lý do lựa chọn:
    - **Frontend:** Vue 3 (Composition API linh hoạt, Single Page Application), Bootstrap 5 (Responsive nhanh, chuẩn hóa UI), Vite (Build tool tốc độ cao).
    - **Backend:** Node.js & Express.js (Bất đồng bộ non-blocking I/O, nhẹ và nhanh khi xây dựng RESTful API).
    - **Database:** MongoDB (Linh hoạt cấu trúc NoSQL, kết hợp truy vấn Native Queries/Mongoose hiệu năng cao).
    - **Bảo mật:** JWT token cặp (Access + Refresh), Google OAuth 2.0, `express-rate-limit` (chống brute force), `helmet` (bảo vệ HTTP headers), `sanitize` (chống NoSQL & XSS Injection).
    - **Kiến trúc Mạng & Domain Local:** Cơ chế Dual Loopback Domain (`127.0.0.1` vs `127.0.0.2` mapping qua file `hosts` Windows) cho phép cả hai cổng User và Admin cùng chạy trên port chuẩn 3000 đồng thời mà không bị xung đột socket `EADDRINUSE`.

> [!IMPORTANT]
> **Ràng buộc phân định & Chống lặp ý của Chương II:**
> - **Được viết (Tầng Nghiệp vụ & Công cụ):** Kể câu chuyện nghiệp vụ thực tế dưới góc nhìn người dùng (Storytelling); phân loại yêu cầu theo 3 nhóm tác nhân; công bố trọn vẹn Bộ quy tắc nghiệp vụ vàng (Business Rules); phân tích sâu lý do chọn stack MEVN (Logo to ở giữa trang + thuyết minh nguồn gốc, năm, ưu điểm).
> - **CẤM VIẾT (Để dành cho các chương sau):**
>   + KHÔNG lặp lại lời than thở về bối cảnh cách mạng 4.0 đã viết ở Chương I.1.
>   + KHÔNG vẽ sơ đồ Use Case UML hay lập bảng đặc tả Use Case dạng cơ học từng bước (để dành cho Chương III.1).
>   + KHÔNG liệt kê cấu trúc trường dữ liệu, thuộc tính, khóa chính/khóa ngoại CSDL (để dành cho Chương III.2).
>   + KHÔNG chèn ảnh chụp màn hình giao diện thực tế của website (để dành cho Chương IV).

---

### CHƯƠNG III: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

_(Đây là chương trọng tâm lý thuyết và biểu đồ, sinh viên cần vẽ hình và bảng giống mẫu báo cáo đề tài len)_

- **1. Phân tích mô hình Use Case:**
  - **Sơ đồ Use Case tổng quát:** Vẽ hình gồm 3 tác nhân chính: _Khách vãng lai_, _Độc giả (User)_, và _Quản trị viên / Thủ thư (Admin & Book Manager)_ cùng các Use Case chính. *(Toàn bộ 6 sơ đồ Use Case từ tổng quan đến 5 phân hệ chuyên sâu đã được mô hình hóa tự động và lưu trữ hoàn chỉnh trong file StarUML `books_management_usecase.mdj`, có thể mở bằng StarUML và Export Image as PNG)*.
  - **Bảng đặc tả Use Case:** Lập các bảng theo đúng form mẫu của trường:
    - _Cột:_ Tác nhân, Mô tả, Điều kiện tiên quyết, Dòng sự kiện chính (Luồng chính), Dòng sự kiện rẽ nhánh (Luồng phụ/lỗi), Kết quả.
    - _Các ca sử dụng cần đặc tả chi tiết:_
      1. Đăng ký & Đăng nhập (Local + Google OAuth).
      2. Tra cứu & Lọc ấn phẩm.
      3. Đăng ký mượn sách (Kiểm tra 5 ràng buộc tự động).
      4. Duyệt yêu cầu & Xuất sách tại quầy (Check-out).
      5. Nhận trả sách & Lập biên bản đền bù hư hỏng/mất sách.
      6. Quản trị kho sách & Thêm nhanh Nhà xuất bản.
      7. Quản lý tài khoản & Danh sách đen (Blacklist).
- **2. Thiết kế Cơ sở dữ liệu (Database Design):**
  - **Sơ đồ CDM / ERD:** Vẽ sơ đồ thể hiện mối liên kết giữa các bảng/collections (`DocGia` 1-N `TheoDoiMuonSach`, `Sach` 1-N `TheoDoiMuonSach`, `NhaXuatBan` 1-N `Sach`, `TheoDoiMuonSach` 1-1 `BienBanBoiThuong`,...).
  - **Bảng danh mục các Collections:** Lập bảng tổng hợp 8 Collection (5 bảng bắt buộc theo đề tài + 3 bảng bổ trợ mở rộng).
  - **Đặc tả chi tiết các thuộc tính từng bảng (Lập bảng gồm: Thuộc tính, Kiểu dữ liệu, Khóa chính, Khóa ngoại, Mô tả):**
    - Trình bày chuẩn hóa theo [DATABASE_SCHEMA.sql](file:///d:/Documents/GitHub/books_management/DATABASE_SCHEMA.sql):
      - `DocGia`: `MaDocGia`, `HoLot`, `Ten`, `NgaySinh`, `Phai`, `DiaChi`, `DienThoai`, `Email`, `Password`, `GoogleId`, `DaBiKhoa`...
      - `NhanVien`: `MSNV`, `HoTenNV`, `Password`, `ChucVu` ('ADMIN', 'BOOK_MANAGER'), `DiaChi`, `SoDienThoai`, `Email`...
      - `NhaXuatBan`: `MaNXB`, `TenNXB`, `DiaChi`, `DienThoai`, `Email`...
      - `Sach`: `MaSach`, `TenSach`, `DonGia`, `SoQuyen`, `NamXuatBan`, `MaNXB`, `TacGia`, `NguonGoc`, `SoQuyenKhaDung`, `SoQuyenDangMuon`, `SoQuyenHuHong`, `TrangThai` ('ACTIVE', 'ARCHIVED')...
      - `TheoDoiMuonSach`: `MaDocGia`, `MaSach`, `NgayMuon`, `NgayTra`, `TrangThai` ('PENDING', 'APPROVED', 'BORROWED', 'RETURNED', 'OVERDUE'...), `HanTra`, `HanChotNhan`...
      - Bổ trợ: `TheLoai`, `BienBanBoiThuong` (`LoaiSuCo`, `SoTienBoiThuong`, `TrangThai`), `CauHinhHeThong`, `NhatKyHoatDong`.

> [!IMPORTANT]
> **Ràng buộc phân định & Chống lặp ý của Chương III:**
> - **Được viết (Tầng Bản vẽ Kỹ thuật & Kiến trúc):** Sơ đồ Use Case tổng quát + sơ đồ phân rã; Bảng đặc tả Use Case 6 trường (mô tả cơ học: Actor làm gì, Hệ thống phản hồi gì, kết thúc bằng 'UC kết thúc'); Sơ đồ CDM; Bảng danh mục Collections và Bảng từ điển dữ liệu (5 cột, đánh dấu 'x' ở khóa chính/ngoại).
> - **CẤM VIẾT (Để dành cho các chương sau):**
>   + KHÔNG viết văn xuôi kể chuyện hay lặp lại lý do chọn đề tài / công nghệ.
>   + KHÔNG chèn ảnh giao diện chụp màn hình (kể cả form mượn hay dashboard).
>   + KHÔNG bàn về màu sắc giao diện, font chữ, bố cục CSS.

---

### CHƯƠNG IV: KẾT QUẢ THỰC HIỆN VÀ THIẾT KẾ GIAO DIỆN

_(Chương này chụp ảnh màn hình giao diện thực tế của dự án, mỗi hình đều có mã số Hình và diễn giải chức năng bên dưới giống mẫu PDF)_

- **1. Phong cách thiết kế giao diện:**
  - Trình bày bảng mã màu Palette: Nền kem giấy ngà (`#FDFBF7`), Xanh ngọc lục bảo (`#1B4332`), Than ấm (`#2C2825`), Vàng hổ phách (`#D97706`).
  - Font chữ kết hợp Serif (tiêu đề trang trọng) và Sans-serif (nội dung rõ nét).
  - *(Tài liệu trực quan đính kèm: File `design_system_warm_academic.html` tích hợp sẵn nút "Tải ảnh PNG (2x)" chuẩn độ phân giải cao phục vụ chụp hình minh chứng cho Bảng màu & Thành phần giao diện Warm Academic - Hình 14)*.
- **2. Phân hệ Quản trị (Admin Portal - admin.library.local:3000 / Port 3001):**
  - _Hình: Giao diện Đăng nhập quản trị viên / Thủ thư._
  - _Hình: Dashboard tổng quan_ (Biểu đồ thống kê lượt mượn, top 10 sách mượn nhiều nhất, tỷ lệ đúng hạn vs trễ hạn, thống kê sự cố bồi thường).
  - _Hình: Quản lý kho sách_ (Bảng danh sách sách, modal thêm sách mới, component `PublisherSelect` tìm kiếm và tạo nhanh NXB).
  - _Hình: Cơ chế Xóa mềm (Soft-delete)_ và cảnh báo chặn xóa khi sách đang được mượn.
  - _Hình: Giao diện Hàng đợi duyệt mượn (Borrow Queue)_ (Nút Duyệt, Từ chối kèm lý do, Nút Xuất sách Check-out).
  - _Hình: Giao diện Nhận trả sách (Returns)_ (Xác nhận hoàn trả bình thường hoặc chuyển sang lập biên bản).
  - _Hình: Giao diện Lập biên bản sự cố và Thu tiền đền bù tại quầy_ (Thẩm định giá tiền, nút "Xác nhận đã đền bù").
  - _Hình: Giao diện Quản lý người dùng, phân quyền Book Manager và Quản lý Blacklist._
  - _Hình: Modal tra cứu nhanh độc giả và sách (`BookDetailModal`, `UserDetailModal`)_ với hiệu ứng phát sáng chuyển trang (Deep linking).
- **3. Phân hệ Độc giả (User Portal - library.local:3000 / Port 3000):**
  - _Hình: Trang chủ User_ (Banner thư viện hàn lâm, danh sách sách dạng lưới thẻ Book Cards với hiệu ứng nổi bóng).
  - _Hình: Thanh tìm kiếm tức thì và bộ lọc thể loại._
  - _Hình: Đăng nhập & Đăng nhập 1 chạm bằng Google OAuth 2.0._
  - _Hình: Chi tiết sách & Modal gửi yêu cầu mượn sách_ (Chọn ngày hẹn lấy, hiển thị cảnh báo nếu vi phạm quy định mượn).
  - _Hình: Trang Lịch sử mượn trả cá nhân_ (Theo dõi trạng thái thẻ đơn, nút Hủy đơn khi đang PENDING, nút Gia hạn thêm 7 ngày).
  - _Hình: Trang Biên bản bồi thường của độc giả_ (Xem chi tiết sách bị hư hỏng/mất và số tiền cần nộp tại quầy).
  - _Hình: Trang Thông tin cá nhân & Form đổi mật khẩu._

> [!IMPORTANT]
> **Ràng buộc phân định & Chống lặp ý của Chương IV:**
> - **Được viết (Tầng Hiện thực hóa & Trực quan):** Triết lý thiết kế (màu sắc, font chữ Warm Academic); Ảnh chụp màn hình thực tế có dữ liệu thật; Thuyết minh thao tác (Ai làm gì, nhập form nào, bấm nút nào, CSDL ghi nhận ra sao); Ảnh chụp các thông báo phản hồi (Modal, Toast, Alert).
> - **CẤM VIẾT (Để dành cho các chương sau):**
>   + KHÔNG chép lại định nghĩa hay các bước trong bảng đặc tả Use Case ở Chương III.
>   + KHÔNG vẽ lại hay liệt kê lại bảng thuộc tính CSDL từ Chương III.
>   + KHÔNG nhắc lại lý thuyết 'Vue là gì, Node là gì' từ Chương II.
>   + KHÔNG tự đánh giá khen chê hay nêu hạn chế ở chương này (để dành cho Chương V).

---

### CHƯƠNG V: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

- **1. Kết quả đạt được:**
  - _Về lý thuyết & Kỹ năng:_ Thành thạo xây dựng ứng dụng SPA với Vue 3, kiến trúc RESTful API chuẩn mực với Express.js, thiết kế cơ sở dữ liệu NoSQL MongoDB tối ưu với quan hệ khóa ngoại, áp dụng các kỹ thuật bảo mật web thực tế (Rate Limit, Helmet, Sanitize, JWT, OAuth 2.0).
  - _Về sản phẩm:_ Hoàn thành đầy đủ 100% các yêu cầu tối thiểu của đề tài (5 thực thể bắt buộc) và mở rộng thành công các phân hệ thực tế chuyên sâu (Quản lý biên bản bồi thường, Cấu hình quy định, Lịch sử truy vết, Blacklist tự động, 2 cổng giao diện độc lập).
- **2. Hạn chế:**
  - Chưa tích hợp cổng thanh toán trực tuyến tự động (như VNPay, MoMo) cho khoản tiền phạt bồi thường mà hiện vẫn phải thu và xác nhận thủ công tại quầy.
  - Chưa có tính năng quét mã vạch / QR Code trực tiếp qua camera để thủ thư bắn mã sách khi Check-out/Check-in.
  - Chưa gửi email tự động nhắc nhở khi sách sắp đến hạn trả hoặc thông báo đã duyệt đơn.
- **3. Hướng phát triển:**
  - Tích hợp cổng thanh toán trực tuyến VNPay / MoMo API để độc giả chủ động nộp tiền bồi thường online.
  - Xây dựng tính năng gửi email tự động (Nodemailer) thông báo khi sách sắp quá hạn.
  - Tích hợp thư viện quét mã vạch / QR code qua webcam để đẩy nhanh tốc độ xuất - trả sách tại quầy.
  - Phát triển ứng dụng di động (Mobile App) bằng Flutter hoặc React Native kết nối chung vào Backend API.

> [!IMPORTANT]
> **Ràng buộc phân định & Chống lặp ý của Chương V:**
> - **Được viết (Tầng Nghiệm thu & Chiêm nghiệm):** Tóm tắt cô đọng kết quả đạt được dưới dạng Checklist kiểm kê 2 phân hệ (Admin & User) đối chiếu lại mục tiêu Chương I; Nhận khuyết điểm chân thành ở mục Hạn chế; Vạch ra hướng phát triển tương lai khả thi.
> - **CẤM VIẾT:**
>   + KHÔNG mô tả lại chi tiết các bước hoạt động hay luồng thao tác của chức năng (đã có ở Chương II, III, IV).
>   + KHÔNG chèn thêm bất kỳ ảnh chụp màn hình hay bảng thuộc tính nào.
>   + KHÔNG tâng bốc hệ thống một cách sáo rỗng.

---

### TÀI LIỆU THAM KHẢO

1. [Vue.js 3 Documentation](https://vuejs.org/) – The Progressive JavaScript Framework.
2. [Express.js Documentation](https://expressjs.com/) – Fast, unopinionated, minimalist web framework for Node.js.
3. [MongoDB Manual](https://www.mongodb.com/docs/) – The Developer Data Platform.
4. [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/) – Powerful, extensible, and feature-packed frontend toolkit.
5. [Google Identity Services](https://developers.google.com/identity/gsi/web) – OAuth 2.0 Client Authentication.
6. Trang mã nguồn dự án: `https://github.com/.../books_management`

---

# PHẦN IV: QUY CHUẨN VĂN PHONG & RÀNG BUỘC HÀNH VĂN TỰ NHIÊN NHƯ NGƯỜI THẬT

_(Cẩm nang loại bỏ hoàn toàn dấu vết văn phong máy móc của AI, định hình phong cách sinh viên ĐH Cần Thơ chỉn chu, khiêm tốn và học thuật)_

Để cuốn báo cáo không bị giảng viên chấm thi nhận xét là "sao chép từ ChatGPT" hay "văn phong dịch thuật vô hồn", người viết cần tuân thủ nghiêm ngặt các nguyên tắc hành văn của người thật dưới đây:

### 1. Ràng buộc về Ngôi xưng & Đại từ nhân xưng

- **Trong Lời cảm ơn:**
  - Xưng: **"em"** – Gọi thầy cô: **"Thầy/Cô"**, **"Quý Thầy/Cô"**, **"giảng viên hướng dẫn"**.
  - Giọng điệu chân thành, lễ phép, tôn kính và cầu thị (khiêm tốn nhận thiếu sót).
- **Trong Thân bài (Chương I đến Chương IV):**
  - Tuyệt đối **KHÔNG xưng "tôi"**, **KHÔNG dùng "mình"**, **"chúng mình"**, **"bạn"** (đây là giọng văn trò chuyện, viết blog, cấm kỵ trong báo cáo khoa học).
  - Sử dụng ngôi thứ ba mang tính khách quan học thuật: **"Đề tài"**, **"Hệ thống"**, **"Tác giả"**, **"Sinh viên thực hiện"**, hoặc sử dụng các câu khách quan / bị động: _"Hệ thống được xây dựng nhằm..."_, _"Cơ sở dữ liệu được tổ chức thành các bộ sưu tập..."_, _"Chức năng này cho phép người dùng..."_.
- **Trong Chương V (Kết luận & Hạn chế):**
  - Có thể sử dụng cách xưng **"em"** hoặc **"sinh viên"** khi trình bày về những giới hạn về mặt kiến thức và thời gian thực hiện đề tài.

---

### 2. Loại bỏ các "Dấu hiệu nhận diện AI" (AI Hallmarks) phổ biến

AI thường có thói quen dùng các từ ngữ sáo rỗng, hoa mỹ, sáo ngữ hoặc cấu trúc câu cân đối một cách máy móc. Hãy áp dụng quy tắc chuyển đổi sau:

| Dấu hiệu văn phong AI (CẦN TRÁNH TUYỆT ĐỐI)                                                                    | Văn phong Người thật / Sinh viên viết (NÊN DÙNG)                                                                | Lý do                                                                 |
| :------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| _"Trong kỷ nguyên công nghệ số 4.0 phát triển vượt bậc như vũ bão hiện nay..."_                                | _"Hiện nay, công tác quản lý tài liệu và mượn trả tại các thư viện truyền thống vẫn còn gặp nhiều bất cập..."_  | Đi thẳng vào vấn đề thực tế, không dùng sáo ngữ "kỷ nguyên số".       |
| _"Hệ thống đóng vai trò như một ngọn hải đăng / chìa khóa vạn năng giải quyết triệt để..."_                    | _"Đề tài nhằm xây dựng một website hỗ trợ độc giả tra cứu nhanh và giúp thủ thư kiểm soát sách chính xác hơn."_ | Giọng văn khiêm tốn, thực tế, đúng tầm vóc đồ án môn học.             |
| _"Tóm lại,", "Nhìn chung,", "Không chỉ dừng lại ở đó,", "Một cách toàn diện"_ (lặp đi lặp lại ở đầu mỗi đoạn). | _"Do đó,", "Bên cạnh đó,", "Cụ thể,", "Ngoài ra,", "Đối với chức năng này,..."_                                 | Sử dụng liên từ tiếng Việt tự nhiên, linh hoạt ngữ cảnh.              |
| _"Một hành trình đầy hứa hẹn...", "Bức tranh sinh động về..."_                                                 | _"Quá trình thiết kế và hiện thực hóa các chức năng của hệ thống..."_                                           | Báo cáo kỹ thuật CNTT cần ngôn ngữ chính xác, không dùng văn miêu tả. |
| Liệt kê các câu có độ dài đều chặp, gạch đầu dòng vô tội vạ mà thiếu đoạn văn kết nối.                         | Kết hợp hài hòa giữa các đoạn văn diễn giải (2-4 câu) và danh sách gạch đầu dòng liệt kê thuộc tính/chức năng.  | Tạo nhịp điệu đọc tự nhiên (sentence length variation) của con người. |

---

### 3. Quy tắc dẫn dắt và thuyết minh Hình ảnh & Bảng biểu (Captions & References)

Một lỗi rất hay gặp khiến báo cáo giống như máy ghép là **chèn hình ảnh hoặc bảng biểu trơ trọi mà không có câu chữ dẫn dắt**.

- **Quy tắc bắt buộc:** Trước hoặc ngay sau mỗi Hình ảnh / Bảng biểu, bắt buộc phải có ít nhất 1-2 câu văn của người viết giới thiệu và phân tích nội dung.
- **Mẫu câu chuẩn người thật:**
  - _Câu dẫn trước hình:_
    > _"Quy trình mượn trả sách giữa độc giả và thủ thư được biểu diễn chi tiết qua sơ đồ Use Case ở Hình 3.2 dưới đây:"_
    > _(Chèn Hình 3.2)_
  - _Câu phân tích sau hình:_
    > _"Từ sơ đồ ở Hình 3.2, có thể nhận thấy tác nhân Độc giả chỉ có thể thực hiện thao tác Đặt mượn sau khi đã vượt qua bước kiểm tra điều kiện tài khoản (không nợ sách quá hạn và không nằm trong danh sách đen)."_
  - _Đối với bảng cơ sở dữ liệu:_
    > _"Cấu trúc lưu trữ thông tin ấn phẩm của hệ thống được chi tiết hóa trong Bảng 3.4 với các thuộc tính định danh và quản lý số lượng tồn kho."_

---

### 4. Quy tắc viết Đặc tả Luồng sự kiện Use Case (Luồng chính & Luồng rẽ nhánh)

Học hỏi trực tiếp từ mẫu báo cáo của sinh viên (Trần Thúy Ái - B1909880), các bước thực hiện phải mô tả thao tác tương tác thực tế giữa **Người dùng** và **Hệ thống**:

- **Không viết chung chung kiểu:** _"Người dùng tương tác giao diện và hệ thống xử lý logic rồi hiển thị kết quả."_
- **Viết từng bước cụ thể, gãy gọn:**
  - _Luồng sự kiện chính:_
    1. Độc giả truy cập vào trang chi tiết ấn phẩm cần mượn.
    2. Độc giả nhấn nút "Đăng ký mượn" trên giao diện.
    3. Hệ thống hiển thị biểu mẫu (Modal) xác nhận thông tin kèm ngày hẹn đến nhận sách.
    4. Độc giả chọn ngày hẹn nhận và nhấn "Xác nhận gửi yêu cầu".
    5. Hệ thống kiểm tra số lượng sách khả dụng (`SoQuyenKhaDung > 0`) và hạn mức mượn của độc giả.
    6. Hệ thống tạo bản ghi mượn ở trạng thái `PENDING`, giảm trừ 1 sách khả dụng và hiển thị thông báo thành công.
  - _Luồng sự kiện rẽ nhánh (Ngoại lệ / Lỗi):_
    - _Trường hợp 1 (Hết sách khả dụng):_ Hệ thống thông báo sách hiện đã được đặt hết, yêu cầu độc giả quay lại sau.
    - _Trường hợp 2 (Độc giả đang vi phạm quy định):_ Nếu độc giả có sách quá hạn chưa trả hoặc có biên bản phạt chưa đóng, hệ thống từ chối tạo đơn và thông báo rõ lý do vi phạm.

---

### 5. Văn phong Chương Kết luận: Thật thà, khiêm tốn và đúng mực

Giảng viên đại học đánh giá rất cao sự trung thực trong mục **Hạn chế** và **Hướng phát triển**. Thay vì vẽ ra những mục tiêu viển vông, hãy trình bày đúng thực tế những gì một sinh viên đối mặt:

- **Ví dụ mẫu văn phong người thật cho mục Hạn chế:**
  > _"Trong quá trình thực hiện đề tài, do thời gian có hạn cũng như năng lực chuyên môn của bản thân còn một số mặt hạn chế, hệ thống vẫn còn tồn tại các điểm thiếu sót sau:_
  > _- Hệ thống chưa tích hợp được cổng thanh toán trực tuyến (như VNPay hay MoMo) để độc giả nộp phạt bồi thường từ xa mà hiện vẫn phải thu nhận trực tiếp tại quầy thư viện._
  > _- Chưa xây dựng được tính năng gửi thư điện tử (Email) tự động nhằm đôn đốc, nhắc nhở bạn đọc khi sách sắp đến hạn trả._
  > _- Giao diện trên các thiết bị di động màn hình nhỏ đôi chỗ hiển thị bảng biểu còn phải cuộn ngang, chưa thật sự tối ưu trải nghiệm người dùng."_

---

### 6. Thống nhất Chuẩn hóa Thuật ngữ Chuyên ngành (Terminology)

Để văn bản mạch lạc và chuyên nghiệp:

- **Thuật ngữ giữ nguyên tiếng Anh (không dịch gượng gạo):** `Front-end`, `Back-end`, `Full-stack`, `Single Page Application (SPA)`, `RESTful API`, `Token JWT`, `OAuth 2.0 Client`, `Soft-delete`, `Blacklist`, `Admin Portal`, `User Portal`, `Audit Log`.
- **Thuật ngữ dùng tiếng Việt chuẩn mực học thuật:**
  - Dùng _Tác nhân_ (thay vì để trơ trọi Actor).
  - Dùng _Ca sử dụng / Sơ đồ Use Case_ (thay vì viết lẫn lộn trường hợp sử dụng).
  - Dùng _Mô hình quan hệ thực thể (ERD)_ hoặc _Mô hình dữ liệu khái niệm (CDM)_.
  - Dùng _Khóa chính_, _Khóa ngoại_, _Bản ghi (Document / Record)_, _Bộ sưu tập (Collection)_.
  - Dùng _Ấn phẩm / Đầu sách / Bản in_ khi nói về nghiệp vụ thư viện để câu văn trang trọng, chuẩn nghiệp vụ.

---

# PHẦN V: MA TRẬN PHÂN ĐỊNH TRÁCH NHIỆM NỘI DUNG & BỘ RÀNG BUỘC CHỐNG TRÙNG LẶP Ý KHI GOM TOÀN VĂN BÁO CÁO (CROSS-CHAPTER ANTI-REDUNDANCY FRAMEWORK)

Một lỗi rất phổ biến khiến cuốn báo cáo trở nên dày cộm nhưng nhàm chán là **"bệnh lặp ý"**: Chương I liệt kê chức năng, Chương II kể lại chức năng, Chương III đặc tả lại chức năng, Chương IV mô tả chức năng trên giao diện, và Chương V lại liệt kê lại chức năng một lần nữa!

Để khi ghép nối toàn bộ các phần thành một cuốn báo cáo hoàn chỉnh không bị trùng lặp, người viết bắt buộc phải tuân thủ **Khung phân định trách nhiệm nội dung** dưới đây:

---

### 1. Ma trận 5 Tầng Trừu Tượng (The 5 Abstraction Levels)

Mỗi chương trong báo cáo đóng một vai trò nhận thức hoàn toàn khác nhau, trả lời một câu hỏi cốt lõi duy nhất:

| Chương | Tầng Trừu Tượng | Câu hỏi cốt lõi phải trả lời | Trọng tâm duy nhất được viết | Dấu hiệu vi phạm (Lỗi trùng lặp) |
| :--- | :--- | :--- | :--- | :--- |
| **Chương I: Giới Thiệu** | **Tầm nhìn & Vĩ mô** (Vision & Scope) | *TẠI SAO phải làm đề tài này?* (Why) | Thực trạng khó khăn của thư viện truyền thống, mục tiêu hướng tới, phạm vi đề tài, gạch đầu dòng tên nhóm chức năng cấp cao nhất. | Viết kịch bản mượn trả chi tiết, nêu quy tắc 3 cuốn/48h, giải thích chi tiết Vue/Node. |
| **Chương II: Đặc Tả Yêu Cầu & Công Nghệ** | **Nghiệp vụ & Công cụ** (Workflow, Rules & Tools) | *NGHIỆP VỤ thực tế diễn ra thế nào & dùng CÔNG CỤ gì?* (What happens & Tools) | Kịch bản mượn trả đời thực theo góc nhìn người dùng (Storytelling); bộ 5 quy tắc nghiệp vụ vàng; phân tích sâu lý do chọn stack MEVN (Logo to + thuyết minh). | Vẽ sơ đồ Use Case UML, lập bảng trường dữ liệu CSDL, chèn ảnh chụp màn hình giao diện. |
| **Chương III: Phân Tích & Thiết Kế Hệ Thống** | **Bản vẽ Kỹ thuật** (Architecture & Blueprints) | *Hệ thống được MÔ HÌNH HÓA kỹ thuật ra sao?* (Formal Modeling) | Sơ đồ Use Case tổng quát và phân rã; Bảng đặc tả Use Case cơ học 6 trường (kết thúc `UC kết thúc`); Sơ đồ CDM; Bảng từ điển dữ liệu (5 cột, dấu `x` ở khóa). | Viết văn xuôi kể chuyện, bàn về lý do chọn công nghệ, chèn ảnh giao diện chụp màn hình. |
| **Chương IV: Kết Quả & Giao Diện** | **Hiện thực hóa Trực quan** (UI/UX & Evidence) | *Sản phẩm THỰC TẾ trông thế nào khi người dùng thao tác?* (Visual Evidence) | Bảng màu Warm Academic; Ảnh chụp màn hình thực tế có dữ liệu thật; Thuyết minh thao tác (form nhập, nút bấm, phản hồi CSDL); Ảnh chụp Modal/Toast/Alert. | Chép lại bảng đặc tả Use Case Chương III; vẽ lại bảng cấu trúc CSDL; giải thích lại lý thuyết Vue/Node. |
| **Chương V: Kết Luận & Hướng Phát Triển** | **Nghiệm thu & Đánh giá** (Evaluation & Roadmap) | *Đã LÀM ĐƯỢC GÌ và còn THIẾU SÓT GÌ?* (Checklist & Critical Gaps) | Tóm tắt cô đọng dạng checklist kiểm kê kết quả đạt được đối chiếu với Chương I; nhận lỗi trung thực ở mục Hạn chế; đề xuất định hướng tương lai. | Diễn giải lại cách hoạt động từng chức năng; chèn ảnh chụp giao diện; tâng bốc hệ thống hoàn hảo. |

---

### 2. Ma trận "Cắt Lát Thông Tin" (Information Slicing) cho 4 Chủ đề Dễ Bị Lặp Nhất

Khi cùng đề cập đến một nghiệp vụ cốt lõi, mỗi chương chỉ được phép khai thác **đúng một lát cắt góc nhìn riêng biệt**:

#### Chủ đề 1: Quy trình Mượn - Trả sách (Borrow & Return)
* **Chương I (Tầm nhìn):** Nêu mục tiêu tự động hóa lưu thông ấn phẩm, xóa bỏ tình trạng độc giả đến thư viện nhưng sách đã hết hoặc thất thoát tài liệu.
* **Chương II (Nghiệp vụ đời thực):** Kể câu chuyện trải nghiệm: Độc giả lên web tìm sách $\rightarrow$ đặt giữ sách trực tuyến $\rightarrow$ hệ thống giữ chỗ 48h $\rightarrow$ độc giả đến quầy nhận sách $\rightarrow$ thủ thư Check-out $\rightarrow$ độc giả đọc trong 14 ngày $\rightarrow$ mang trả tại quầy $\rightarrow$ thủ thư kiểm tra nguyên vẹn hoặc lập biên bản bồi thường nếu rách/mất.
* **Chương III (Đặc tả kỹ thuật):** Chuyển câu chuyện trên thành 2 Use Case phân rã: *Đăng ký mượn sách* và *Duyệt đơn & xuất sách tại quầy*, mô tả dạng bảng 6 trường cơ học với các bước số thứ tự rõ ràng (`1.`, `2.`, `3.`,..., `UC kết thúc`).
* **Chương IV (Trực quan hóa):** Minh chứng bằng ảnh chụp: Giao diện Hàng đợi duyệt mượn (`Borrow Queue`), Giao diện Nhận trả sách (`Returns`), Modal xác nhận mượn, Toast thông báo mượn thành công.
* **Chương V (Nghiệm thu):** Điểm danh 1 dòng trong checklist: *"- Phân hệ quản lý mượn trả: Hàng đợi duyệt mượn, Check-out xuất sách, Check-in nhận trả."*

#### Chủ đề 2: Nền tảng Công nghệ (MEVN Stack: Vue 3, Express, Node, MongoDB)
* **Chương I (Phương pháp):** Chỉ gọi tên phương pháp luận: *"Sử dụng stack công nghệ MEVN (MongoDB, Express.js, Vue.js, Node.js) để hiện thực hóa ứng dụng."* (Đúng 1 dòng bullet).
* **Chương II (Phân tích công cụ):** **Nơi duy nhất đào sâu công nghệ**: Mỗi công nghệ có Logo to ở giữa trang, caption dưới logo, và 1 đoạn văn 3-5 câu nêu người sáng lập, năm ra đời, tính năng nổi bật và lý do đề tài lựa chọn.
* **Chương III (Bản vẽ):** Áp dụng công nghệ vào thiết kế: Thể hiện qua cấu trúc NoSQL Collections trong CDM. **Tuyệt đối không giải thích lại Vue/Node là gì**.
* **Chương IV (Giao diện):** Thể hiện công nghệ qua thành phẩm: Trải nghiệm Single Page Application mượt mà, hệ thống component tái sử dụng, responsive Bootstrap 5 và bảng màu Warm Academic.
* **Chương V (Kết luận):** Tóm tắt 1 câu trong mục kết quả lý thuyết: *"Thành thạo kỹ năng xây dựng ứng dụng Full-stack MEVN hiện đại và kiến trúc RESTful API."*

#### Chủ đề 3: Bộ Quy tắc Nghiệp vụ Vàng (Business Rules: 3 cuốn, giữ 48h, hạn 14 ngày, đền bù)
* **Chương I:** Hoàn toàn **KHÔNG** nhắc đến các con số cụ thể này.
* **Chương II (Công bố chính sách):** **Nơi duy nhất phát biểu đầy đủ Bộ quy tắc nghiệp vụ vàng** trong mục *2.5. Các ràng buộc nghiệp vụ trọng yếu*.
* **Chương III (Cài đặt logic):** Đưa các ràng buộc này vào dòng *Điều kiện tiên quyết* và *Dòng sự kiện rẽ nhánh* trong bảng đặc tả Use case (ví dụ: Nếu độc giả có sách quá hạn $\rightarrow$ hệ thống từ chối tạo đơn).
* **Chương IV (Cảnh báo người dùng):** Thể hiện qua ảnh chụp **Modal cảnh báo vi phạm** hoặc **Toast báo lỗi** khi người dùng vi phạm quy tắc.
* **Chương V (Hạn chế thực tế):** Nhận diện điểm hạn chế liên quan đến quy tắc (ví dụ: chưa thu tiền đền bù trực tuyến qua VNPay/MoMo, chưa gửi email tự động đôn đốc hạn trả).

#### Chủ đề 4: Cơ sở Dữ liệu & Cấu trúc Dữ liệu (Database & Collections)
* **Chương I:** Chỉ nêu mục tiêu: *"Tổ chức lưu trữ thông tin độc giả và ấn phẩm một cách khoa học, bảo mật."*
* **Chương II:** Chỉ nêu tính năng NoSQL của MongoDB trong phần giới thiệu công nghệ.
* **Chương III (Thiết kế chi tiết):** **Nơi duy nhất trình bày trọn vẹn**: Sơ đồ CDM quan hệ thực thể, Bảng danh mục Collections và Bảng từ điển dữ liệu 5 cột (`Thuộc tính`, `Kiểu`, `Khóa chính`, `Khóa ngoại`, `Mô tả`).
* **Chương IV:** Thể hiện dữ liệu đã lưu trữ qua các bảng liệt kê và form hiển thị trên giao diện thực tế.
* **Chương V:** Đánh giá kỹ năng làm chủ CSDL NoSQL trong kết quả chuyên môn.

---

### 3. Bảng Quy Tắc "Đèn Đỏ" – Cấm Xuất Hiện Tại Từng Chương (Anti-Duplication Red Lines)

| Vị trí | ĐIỀU TUYỆT ĐỐI CẤM (ĐÈN ĐỎ) | Lý do |
| :--- | :--- | :--- |
| **Chương I** | ❌ Cấm nêu các con số quy tắc cụ thể (3 cuốn, 48h, 14 ngày).<br>❌ Cấm giải thích chi tiết ưu nhược điểm của Vue.js, Node.js.<br>❌ Cấm vẽ sơ đồ Use Case, CDM hay bảng dữ liệu.<br>❌ Cấm nói về form nhập liệu hay nút bấm giao diện. | Chương I chỉ dành cho tầm nhìn và phạm vi cấp cao. Đi sâu vào chi tiết sẽ làm mất tính bao quát và gây nhàm chán cho các chương sau. |
| **Chương II** | ❌ Cấm lặp lại đoạn văn than thở về bối cảnh cách mạng 4.0.<br>❌ Cấm vẽ sơ đồ Use Case UML hay lập bảng đặc tả 6 trường.<br>❌ Cấm liệt kê danh sách thuộc tính CSDL (cột, kiểu dữ liệu, khóa).<br>❌ Cấm chèn ảnh chụp màn hình giao diện website. | Chương II chỉ giải thích nghiệp vụ đời thực và nền tảng công nghệ. Biểu đồ và giao diện phải để dành cho Chương III & IV. |
| **Chương III** | ❌ Cấm viết văn xuôi kể lể dài dòng về hoàn cảnh.<br>❌ Cấm nhắc lại lý thuyết "Vue là gì, Node là gì".<br>❌ Cấm chèn ảnh chụp màn hình giao diện (kể cả form hay dashboard).<br>❌ Cấm bàn về mã màu CSS (`#FDFBF7`) hay font chữ. | Chương III là chương thuần bản vẽ kỹ thuật (UML & Schema). Mọi chữ viết đều phục vụ giải thích sơ đồ và bảng đặc tả. |
| **Chương IV** | ❌ Cấm chép lại định nghĩa hay các bước trong bảng Use Case.<br>❌ Cấm vẽ lại hay liệt kê lại bảng thuộc tính CSDL từ Chương III.<br>❌ Cấm nhắc lại lý do lựa chọn công nghệ ở Chương II.<br>❌ Cấm tự đưa ra đánh giá, phê bình hệ thống ở chương này. | Chương IV là triển lãm kết quả thực tế. Nội dung chỉ xoay quanh: Thao tác người dùng $\rightarrow$ Nút bấm $\rightarrow$ Kết quả CSDL $\rightarrow$ Thông báo hiển thị. |
| **Chương V** | ❌ Cấm mô tả lại cách hoạt động từng bước của chức năng.<br>❌ Cấm chèn thêm bất kỳ ảnh chụp giao diện hay bảng CSDL nào.<br>❌ Cấm dùng từ ngữ khen ngợi sáo rỗng hệ thống hoàn hảo. | Chương V chỉ làm 2 việc: Kiểm kê ngắn gọn danh mục đã làm và phân tích sâu các hạn chế thực tế cùng hướng mở rộng. |

---

### 4. Kỹ thuật viết "Câu Cầu Nối Tham Chiếu" (Bridge References)

Thay vì chép lại nguyên một đoạn văn từ chương trước để giải thích cho chương sau, người viết hãy sử dụng **kỹ thuật câu cầu nối tham chiếu** để tạo sự liên kết chặt chẽ mà không bị trùng chữ:

* **Từ Chương II sang Chương III (Chuyển từ Nghiệp vụ sang Mô hình Use Case):**
  > *❌ Cách viết sai (Lặp lại):* Chép lại 2 đoạn văn mô tả quy trình mượn sách ở Chương II.1 rồi mới vẽ sơ đồ Use Case.  
  > *✔️ Cách viết đúng (Câu cầu nối):* *"Dựa trên kịch bản nghiệp vụ mượn trả và bộ quy tắc ràng buộc đã xác lập tại Chương II, quy trình tương tác giữa tác nhân Độc giả và hệ thống được chuẩn hóa thành sơ đồ Use Case phân rã ở Hình 8 dưới đây:"*

* **Từ Chương III sang Chương IV (Chuyển từ Thiết kế sang Giao diện):**
  > *❌ Cách viết sai (Lặp lại):* Chép lại luồng sự kiện chính trong bảng Use Case mượn sách để thuyết minh cho ảnh chụp màn hình.  
  > *✔️ Cách viết đúng (Câu cầu nối):* *"Hiện thực hóa ca sử dụng Đăng ký mượn sách đã đặc tả tại Bảng 5, giao diện phiếu mượn (Hình 26) cho phép độc giả lựa chọn ngày hẹn nhận sách trong khung giờ quy định, hệ thống tự động kiểm tra điều kiện tồn kho và phản hồi bằng thông báo xác nhận ở Hình 27."*

* **Từ Chương IV sang Chương V (Chuyển từ Giao diện sang Kết luận):**
  > *❌ Cách viết sai (Lặp lại):* Mô tả lại chi tiết từng màn hình thêm sách, duyệt đơn mượn, trả sách ở phần kết quả.  
  > *✔️ Cách viết đúng (Câu cầu nối):* *"Đối chiếu với mục tiêu đặt ra ban đầu tại Chương I cùng các giao diện thực nghiệm đã hoàn thiện tại Chương IV, đồ án đã hoàn thành đầy đủ các phân hệ nghiệp vụ cốt lõi, cụ thể gồm:"* (sau đó liệt kê danh mục checklist ngắn gọn).

---

### 5. Checklist 6 Bước Tự Rà Soát Chống Trùng Lặp Trước Khi Đóng Cuốn Báo Cáo

> [!TIP]
> **Checklist kiểm soát trùng lặp ý tưởng toàn văn:**
> 1. [ ] **Kiểm tra Chức năng:** Danh sách chức năng ở Chương I có được giữ ở dạng gạch đầu dòng ngắn gọn (không quá 1 trang) chưa?
> 2. [ ] **Kiểm tra Quy tắc mượn trả:** Quy tắc 3 cuốn, giữ 48h, hạn 14 ngày có CHỈ được phát biểu chi tiết tại Chương II.2 và cài đặt trong Use Case Chương III chưa?
> 3. [ ] **Kiểm tra Công nghệ:** Logo và phân tích sâu Vue/Node/Mongo có CHỈ nằm tại Chương II.3 và không bị lặp lại lý thuyết ở Chương III, IV chưa?
> 4. [ ] **Kiểm tra Sơ đồ và Biểu đồ:** Các sơ đồ Use Case và bảng từ điển CSDL có CHỈ nằm gọn trong Chương III chưa?
> 5. [ ] **Kiểm tra Giao diện:** Toàn bộ ảnh chụp màn hình phần mềm và thông báo Modal/Toast có CHỈ nằm trong Chương IV chưa?
> 6. [ ] **Kiểm tra Kết luận:** Chương V có tập trung vào phân tích Hạn chế và Hướng phát triển thay vì chép lại văn thuyết minh chức năng chưa?
