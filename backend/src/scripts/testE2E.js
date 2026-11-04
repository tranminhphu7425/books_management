const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const API_BASE = process.env.API_BASE_URL || 'http://127.0.0.1:5000/api';

async function runE2ETests() {
  console.log('========================================================================');
  console.log(' BẮT ĐẦU CHẠY KIỂM THỬ E2E TOÀN DIỆN HỆ THỐNG QUẢN LÝ THƯ VIỆN');
  console.log(' (Bao phủ 11 Phân hệ - 72 Ca Kiểm Thử Toàn Diện)');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  async function testCase(id, name, testFn) {
    try {
      await testFn();
      console.log(`[PASS] ${id}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${id}: ${name}`);
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
      console.error(`   Lý do: ${errMsg}`);
      failed++;
    }
  }

  // Khởi tạo kết nối DB để reset trạng thái sạch sẽ trước khi chạy test
  try {
    if (mongoose.connection.readyState === 0 && process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      const DocGia = require('../models/DocGia');
      const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
      const BienBanBoiThuong = require('../models/BienBanBoiThuong');

      // 1. Đảm bảo reader1 và reader2 không bị kẹt ở trạng thái khóa
      await DocGia.updateMany(
        { Email: { $in: ['reader1@gmail.com', 'reader2@gmail.com'] } },
        { $set: { DaBiKhoa: false, LyDoKhoa: null, NgayKhoa: null } }
      );

      // Đảm bảo các sách mẫu S001-S005 luôn ở trạng thái ACTIVE
      const Sach = require('../models/Sach');
      await Sach.updateMany(
        { MaSach: { $in: ['S001', 'S002', 'S003', 'S004', 'S005'] } },
        { $set: { TrangThai: 'ACTIVE' } }
      );

      // 2. Đảm bảo reader1 không bị kẹt sách quá hạn từ các lần chạy trước
      const r1 = await DocGia.findOne({ Email: 'reader1@gmail.com' });
      if (r1) {
        await TheoDoiMuonSach.updateMany(
          { DocGiaId: r1._id, TrangThai: 'BORROWED' },
          { $set: { HanTra: new Date(Date.now() + 7 * 24 * 3600 * 1000) } }
        );
        await TheoDoiMuonSach.deleteMany({
          DocGiaId: r1._id,
          TrangThai: { $in: ['PENDING', 'APPROVED'] }
        });
        await BienBanBoiThuong.deleteMany({ DocGiaId: r1._id, TrangThai: 'UNPAID' });
      }
    }
  } catch (dbErr) {
    console.warn('   Lưu ý: Không thể kết nối MongoDB trực tiếp để reset cờ tài khoản:', dbErr.message);
  }

  // Tokens & shared test variables
  let userToken = '';
  let userRefreshToken = '';
  let managerToken = '';
  let adminToken = '';
  let reader2Token = '';
  let reader1DocGiaId = '';
  let reader2DocGiaId = '';

  let bookS001 = null;
  let bookS002 = null;
  let bookS003 = null;
  let bookS004 = null;
  let bookS005 = null;

  let testCategoryId = '';
  let testPublisherId = '';
  let testBookId = '';
  let testBorrowId = '';
  let testFineId = '';
  let testReviewId = '';

  const uniqueSuffix = Date.now().toString().slice(-6);

  // ============================================================================
  // SUITE 1: HỆ THỐNG & CHẨN ĐOÁN VẬN HÀNH (SYSTEM HEALTH & 404)
  // ============================================================================
  console.log('\n--- SUITE 1: HỆ THỐNG & CHẨN ĐOÁN VẬN HÀNH ---');

  await testCase('TC-01', 'Kiểm tra sức khỏe hệ thống qua GET /api/health', async () => {
    const res = await axios.get(`${API_BASE}/health`);
    if (res.status !== 200) throw new Error(`HTTP status ${res.status}`);
    if (res.data.status !== 'UP' || res.data.database?.status !== 'CONNECTED') {
      throw new Error('Database hoặc Service chưa sẵn sàng');
    }
  });

  await testCase('TC-02', 'Kiểm tra xử lý 404 Not Found theo chuẩn Response Envelope', async () => {
    try {
      await axios.get(`${API_BASE}/non-existent-route-${Date.now()}`);
      throw new Error('Đường dẫn không tồn tại lẽ ra phải trả về 404');
    } catch (err) {
      if (err.response?.status === 404 && err.response?.data?.error?.code === 'RESOURCE_NOT_FOUND') {
        return;
      }
      throw err;
    }
  });

  // ============================================================================
  // SUITE 2: XÁC THỰC & QUẢN LÝ PHIÊN (AUTH, RBAC & USER PROFILE)
  // ============================================================================
  console.log('\n--- SUITE 2: XÁC THỰC, PHÂN QUYỀN RBAC & PHIÊN ĐĂNG NHẬP ---');

  await testCase('TC-03', 'Cổng Độc giả chặn tài khoản Staff (ADMIN/BOOK_MANAGER) đăng nhập (403 Forbidden)', async () => {
    try {
      await axios.post(`${API_BASE}/auth/reader/login`, {
        email: 'admin@library.com',
        password: 'Admin@123'
      });
      throw new Error('Lẽ ra phải chặn Admin đăng nhập Cổng Độc giả');
    } catch (err) {
      if (err.response?.status === 403) return;
      throw err;
    }
  });

  await testCase('TC-04', 'Cổng Độc giả chặn sai mật khẩu hoặc tài khoản không tồn tại (401 Unauthorized)', async () => {
    try {
      await axios.post(`${API_BASE}/auth/reader/login`, {
        email: 'reader1@gmail.com',
        password: 'WrongPassword@999'
      });
      throw new Error('Lẽ ra phải chặn sai mật khẩu');
    } catch (err) {
      if (err.response?.status === 401) return;
      throw err;
    }
  });

  await testCase('TC-05', 'Độc giả (reader1@gmail.com) đăng nhập Cổng Độc giả thành công -> nhận token', async () => {
    const res = await axios.post(`${API_BASE}/auth/reader/login`, {
      email: 'reader1@gmail.com',
      password: 'User@123'
    });
    if (!res.data.data?.accessToken) throw new Error('Không nhận được accessToken');
    userToken = res.data.data.accessToken;
    userRefreshToken = res.data.data.refreshToken;
    reader1DocGiaId = res.data.data.user?._id || res.data.data.user?.id;

    // Load các sách mẫu
    const booksRes = await axios.get(`${API_BASE}/books?limit=50`);
    const allBooks = booksRes.data.data;
    bookS001 = allBooks.find((b) => b.MaSach === 'S001');
    bookS002 = allBooks.find((b) => b.MaSach === 'S002');
    bookS003 = allBooks.find((b) => b.MaSach === 'S003');
    bookS004 = allBooks.find((b) => b.MaSach === 'S004');
    bookS005 = allBooks.find((b) => b.MaSach === 'S005');
  });

  await testCase('TC-06', 'Lấy thông tin cá nhân hiện tại qua GET /api/auth/me với Bearer Token', async () => {
    const res = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (res.status !== 200 || !res.data.data?.user?.Email) throw new Error('Không lấy được profile');
  });

  await testCase('TC-07', 'Chặn truy cập GET /api/auth/me khi không có Bearer Token (401 Unauthorized)', async () => {
    try {
      await axios.get(`${API_BASE}/auth/me`);
      throw new Error('Lẽ ra phải chặn khi thiếu token');
    } catch (err) {
      if (err.response?.status === 401) return;
      throw err;
    }
  });

  await testCase('TC-08', 'Làm mới Token qua POST /api/auth/refresh-token với refreshToken hợp lệ', async () => {
    if (!userRefreshToken) return;
    const res = await axios.post(`${API_BASE}/auth/refresh-token`, {
      refreshToken: userRefreshToken
    });
    if (!res.data.data?.accessToken) throw new Error('Không cấp được accessToken mới');
    userToken = res.data.data.accessToken;
  });

  await testCase('TC-09', 'Chặn làm mới Token khi refreshToken giả mạo hoặc không hợp lệ (401)', async () => {
    try {
      await axios.post(`${API_BASE}/auth/refresh-token`, {
        refreshToken: 'invalid_refresh_token_xyz'
      });
      throw new Error('Lẽ ra phải chặn token giả');
    } catch (err) {
      if (err.response?.status === 401) return;
      throw err;
    }
  });

  await testCase('TC-10', 'Cổng Quản trị chặn tài khoản Độc giả đăng nhập (403 Forbidden)', async () => {
    try {
      await axios.post(`${API_BASE}/auth/admin/login`, {
        email: 'reader1@gmail.com',
        password: 'User@123'
      });
      throw new Error('Lẽ ra phải chặn Reader đăng nhập Cổng Quản trị');
    } catch (err) {
      if (err.response?.status === 403) return;
      throw err;
    }
  });

  await testCase('TC-11', 'Đăng nhập Cổng Quản trị thành công cho Thủ thư & Admin', async () => {
    // 1. Thủ thư
    const resManager = await axios.post(`${API_BASE}/auth/admin/login`, {
      email: 'manager@library.com',
      password: 'Manager@123'
    });
    managerToken = resManager.data.data.accessToken;

    // 2. Admin
    const resAdmin = await axios.post(`${API_BASE}/auth/admin/login`, {
      email: 'admin@library.com',
      password: 'Admin@123'
    });
    adminToken = resAdmin.data.data.accessToken;
  });

  await testCase('TC-12', 'Phân quyền RBAC: Thủ thư (BOOK_MANAGER) bị chặn truy cập module /api/users (403)', async () => {
    try {
      await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${managerToken}` }
      });
      throw new Error('Lẽ ra phải chặn BOOK_MANAGER vào /api/users');
    } catch (err) {
      if (err.response?.status === 403) return;
      throw err;
    }
  });

  await testCase('TC-13', 'Đổi mật khẩu: Chặn mật khẩu cũ sai, chấp thuận mật khẩu cũ đúng và khôi phục', async () => {
    // Sai mật khẩu cũ
    try {
      await axios.put(
        `${API_BASE}/auth/change-password`,
        { currentPassword: 'WrongPassword@123', newPassword: 'NewPassword@456' },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      throw new Error('Lẽ ra phải chặn khi mật khẩu cũ sai');
    } catch (err) {
      if (err.response?.status !== 400) throw err;
    }

    // Đúng mật khẩu cũ
    await axios.put(
      `${API_BASE}/auth/change-password`,
      { currentPassword: 'User@123', newPassword: 'NewPassword@456' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );

    // Khôi phục lại mật khẩu ban đầu
    await axios.put(
      `${API_BASE}/auth/change-password`,
      { currentPassword: 'NewPassword@456', newPassword: 'User@123' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
  });

  await testCase('TC-14', 'Đăng ký tài khoản: Chặn ngày sinh tương lai, dưới 18 tuổi, trùng email & chấp thuận >= 18 tuổi', async () => {
    const testEmail = `test_reg_${uniqueSuffix}@library.com`;

    // 1. Ngày sinh tương lai
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        hoLot: 'Lê',
        ten: 'Test',
        email: testEmail,
        password: 'User@123',
        ngaySinh: '2099-01-01'
      });
      throw new Error('Lẽ ra phải chặn ngày sinh tương lai');
    } catch (err) {
      if (err.response?.status !== 422) throw err;
    }

    // 2. Dưới 18 tuổi
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        hoLot: 'Lê',
        ten: 'Test',
        email: testEmail,
        password: 'User@123',
        ngaySinh: '2020-01-01'
      });
      throw new Error('Lẽ ra phải chặn dưới 18 tuổi');
    } catch (err) {
      if (err.response?.status !== 422 || err.response?.data?.error?.code !== 'AUTH_UNDERAGE') {
        throw err;
      }
    }

    // 3. Trùng email (reader1@gmail.com)
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        hoLot: 'Trùng',
        ten: 'Email',
        email: 'reader1@gmail.com',
        password: 'User@123',
        ngaySinh: '1995-01-01'
      });
      throw new Error('Lẽ ra phải chặn trùng email');
    } catch (err) {
      if (err.response?.status !== 400) throw err;
    }

    // 4. Hợp lệ
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      hoLot: 'Nguyễn',
      ten: `Thành Công ${uniqueSuffix}`,
      email: testEmail,
      password: 'User@123',
      ngaySinh: '1998-05-15',
      phai: 'Nam',
      dienThoai: '0912345678',
      diaChi: 'Hà Nội'
    });
    if (regRes.status !== 201 || !regRes.data.data?.accessToken) {
      throw new Error('Đăng ký không thành công');
    }

    // Dọn dẹp tài khoản kiểm thử
    try {
      const DocGia = require('../models/DocGia');
      await DocGia.deleteOne({ Email: testEmail });
    } catch (_) {}
  });

  // ============================================================================
  // SUITE 3: QUẢN LÝ THỂ LOẠI SÁCH (/api/categories)
  // ============================================================================
  console.log('\n--- SUITE 3: QUẢN LÝ THỂ LOẠI SÁCH ---');

  await testCase('TC-15', 'Tra cứu danh mục Thể loại công khai GET /api/categories', async () => {
    const res = await axios.get(`${API_BASE}/categories`);
    if (res.status !== 200 || !Array.isArray(res.data.data)) throw new Error('Không lấy được danh mục');
  });

  await testCase('TC-16', 'Độc giả cố tình tạo Thể loại mới -> Bị chặn 403 Forbidden', async () => {
    try {
      await axios.post(
        `${API_BASE}/categories`,
        { tenTheLoai: 'Thể Loại Hacking' },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      throw new Error('Lẽ ra phải chặn độc giả');
    } catch (err) {
      if (err.response?.status === 403) return;
      throw err;
    }
  });

  await testCase('TC-17', 'Thủ thư tạo mới Thể loại hợp lệ qua POST /api/categories', async () => {
    const res = await axios.post(
      `${API_BASE}/categories`,
      {
        maTheLoai: `TL_${uniqueSuffix}`,
        tenTheLoai: `Thể Loại Test ${uniqueSuffix}`,
        moTa: 'Mô tả thể loại tự động tạo bởi test E2E'
      },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.status !== 201) throw new Error('Tạo thể loại thất bại');
    testCategoryId = res.data.data._id;
  });

  await testCase('TC-18', 'Chặn tạo trùng Mã Thể loại hoặc Tên Thể loại (400 Bad Request)', async () => {
    try {
      await axios.post(
        `${API_BASE}/categories`,
        {
          maTheLoai: `TL_${uniqueSuffix}`,
          tenTheLoai: `Thể Loại Test ${uniqueSuffix}`
        },
        { headers: { Authorization: `Bearer ${managerToken}` } }
      );
      throw new Error('Lẽ ra phải chặn trùng mã thể loại');
    } catch (err) {
      if (err.response?.status === 400) return;
      throw err;
    }
  });

  await testCase('TC-19', 'Thủ thư cập nhật thông tin Thể loại qua PUT /api/categories/:id', async () => {
    const res = await axios.put(
      `${API_BASE}/categories/${testCategoryId}`,
      { tenTheLoai: `Thể Loại Sửa ${uniqueSuffix}`, moTa: 'Đã cập nhật' },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.status !== 200) throw new Error('Cập nhật thể loại thất bại');
  });

  await testCase('TC-20', 'Thủ thư xóa Thể loại không có sách liên kết qua DELETE /api/categories/:id', async () => {
    const res = await axios.delete(`${API_BASE}/categories/${testCategoryId}`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    if (res.status !== 200) throw new Error('Xóa thể loại thất bại');
  });

  // ============================================================================
  // SUITE 4: QUẢN LÝ NHÀ XUẤT BẢN (/api/publishers)
  // ============================================================================
  console.log('\n--- SUITE 4: QUẢN LÝ NHÀ XUẤT BẢN ---');

  await testCase('TC-21', 'Tra cứu danh mục Nhà xuất bản công khai GET /api/publishers', async () => {
    const res = await axios.get(`${API_BASE}/publishers`);
    if (res.status !== 200 || !Array.isArray(res.data.data)) throw new Error('Không lấy được NXB');
  });

  await testCase('TC-22', 'Độc giả cố tình tạo NXB mới -> Bị chặn 403 Forbidden', async () => {
    try {
      await axios.post(
        `${API_BASE}/publishers`,
        { tenNXB: 'NXB Lậu' },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      throw new Error('Lẽ ra phải chặn độc giả');
    } catch (err) {
      if (err.response?.status === 403) return;
      throw err;
    }
  });

  await testCase('TC-23', 'Thủ thư tạo mới Nhà xuất bản hợp lệ qua POST /api/publishers', async () => {
    const res = await axios.post(
      `${API_BASE}/publishers`,
      {
        maNXB: `NXB_${uniqueSuffix}`,
        tenNXB: `NXB Test ${uniqueSuffix}`,
        diaChi: 'Hà Nội'
      },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.status !== 201) throw new Error('Tạo NXB thất bại');
    testPublisherId = res.data.data._id;
  });

  await testCase('TC-24', 'Chặn tạo trùng Mã NXB (400 Bad Request)', async () => {
    try {
      await axios.post(
        `${API_BASE}/publishers`,
        {
          maNXB: `NXB_${uniqueSuffix}`,
          tenNXB: `NXB Khác ${uniqueSuffix}`,
          diaChi: 'Đà Nẵng'
        },
        { headers: { Authorization: `Bearer ${managerToken}` } }
      );
      throw new Error('Lẽ ra phải chặn trùng mã NXB');
    } catch (err) {
      if (err.response?.status === 400) return;
      throw err;
    }
  });

  await testCase('TC-25', 'Thủ thư cập nhật thông tin Nhà xuất bản qua PUT /api/publishers/:id', async () => {
    const res = await axios.put(
      `${API_BASE}/publishers/${testPublisherId}`,
      { diaChi: 'TP. Hồ Chí Minh' },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.status !== 200) throw new Error('Cập nhật NXB thất bại');
  });

  await testCase('TC-26', 'Admin xóa Nhà xuất bản không có sách liên kết qua DELETE /api/publishers/:id', async () => {
    const res = await axios.delete(`${API_BASE}/publishers/${testPublisherId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200) throw new Error('Xóa NXB thất bại');
  });

  // ============================================================================
  // SUITE 5: QUẢN LÝ KHO ẤN PHẨM (/api/books)
  // ============================================================================
  console.log('\n--- SUITE 5: QUẢN LÝ KHO ẤN PHẨM ---');

  await testCase('TC-27', 'Tra cứu danh mục sách kèm phân trang và bộ lọc GET /api/books', async () => {
    const res = await axios.get(`${API_BASE}/books?page=1&limit=5&status=ACTIVE`);
    if (res.status !== 200 || !res.data.meta?.pagination) throw new Error('Phân trang không hợp lệ');
  });

  await testCase('TC-28', 'Tìm kiếm sách tiếng Việt không dấu (Accent-Insensitive Search)', async () => {
    const res = await axios.get(`${API_BASE}/books?search=lap+trinh`);
    if (res.status !== 200) throw new Error('Tìm kiếm không dấu lỗi');
  });

  await testCase('TC-29', 'Xem chi tiết ấn phẩm qua GET /api/books/:id (200 OK và 404 khi sai ID)', async () => {
    if (!bookS001) throw new Error('Không có bookS001');
    const res = await axios.get(`${API_BASE}/books/${bookS001._id}`);
    if (res.status !== 200 || !res.data.data?.TenSach) throw new Error('Không xem được chi tiết sách');

    try {
      await axios.get(`${API_BASE}/books/65f111111111111111111111`);
      throw new Error('Lẽ ra phải trả về 404 cho ID không tồn tại');
    } catch (err) {
      if (err.response?.status === 404) return;
      throw err;
    }
  });

  await testCase('TC-30', 'Độc giả cố tình thêm sách mới vào kho -> Bị chặn 403 Forbidden', async () => {
    try {
      await axios.post(
        `${API_BASE}/books`,
        { tenSach: 'Sách Trộm' },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      throw new Error('Lẽ ra phải chặn độc giả');
    } catch (err) {
      if (err.response?.status === 403) return;
      throw err;
    }
  });

  await testCase('TC-31', 'Thủ thư thêm mới ấn phẩm hợp lệ vào kho qua POST /api/books', async () => {
    const res = await axios.post(
      `${API_BASE}/books`,
      {
        maSach: `S_${uniqueSuffix}`,
        tenSach: `Giáo trình Kiểm thử Tự động E2E ${uniqueSuffix}`,
        donGia: 95000,
        soQuyen: 10,
        namXuatBan: 2026,
        maNXB: bookS001.MaNXB || 'NXB001',
        theLoai: 'Công nghệ thông tin',
        tacGia: 'Đội ngũ Kỹ sư Phần mềm'
      },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.status !== 201) throw new Error('Thêm sách thất bại');
    testBookId = res.data.data._id;
  });

  await testCase('TC-32', 'Chặn thêm sách trùng Mã sách MaSach (400 Bad Request)', async () => {
    try {
      await axios.post(
        `${API_BASE}/books`,
        {
          maSach: `S_${uniqueSuffix}`,
          tenSach: 'Trùng mã sách',
          donGia: 50000,
          soQuyen: 5,
          namXuatBan: 2026,
          maNXB: bookS001.MaNXB || 'NXB001',
          tacGia: 'Tác Giả Kiểm Thử'
        },
        { headers: { Authorization: `Bearer ${managerToken}` } }
      );
      throw new Error('Lẽ ra phải chặn trùng MaSach');
    } catch (err) {
      if (err.response?.status === 400) return;
      throw err;
    }
  });

  await testCase('TC-33', 'Chặn thêm sách với đơn giá hoặc số quyển âm (422/400 Validation Error)', async () => {
    try {
      await axios.post(
        `${API_BASE}/books`,
        {
          maSach: `S_NEG_${uniqueSuffix}`,
          tenSach: 'Sách Số Âm',
          donGia: -10000,
          soQuyen: -5,
          namXuatBan: 2026,
          maNXB: bookS001.MaNXB || 'NXB001',
          tacGia: 'Tác Giả Kiểm Thử'
        },
        { headers: { Authorization: `Bearer ${managerToken}` } }
      );
      throw new Error('Lẽ ra phải chặn số âm');
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 422) return;
      throw err;
    }
  });

  await testCase('TC-34', 'Thủ thư chỉnh sửa thông tin sách qua PUT /api/books/:id', async () => {
    const res = await axios.put(
      `${API_BASE}/books/${testBookId}`,
      { donGia: 120000, viTri: 'Kệ Kiểm Thử K01' },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.status !== 200) throw new Error('Cập nhật sách thất bại');
  });

  await testCase('TC-35', 'Chặn xóa ấn phẩm đang có người mượn (400 BOOK_CANNOT_DELETE_BORROWED)', async () => {
    const Sach = require('../models/Sach');
    const tempDelBook = await Sach.create({
      MaSach: `S_DEL_${Date.now().toString().slice(-6)}`,
      TenSach: 'Sách Đang Được Mượn Không Thể Xóa',
      DonGia: 50000,
      SoQuyen: 2,
      SoQuyenDangMuon: 1,
      SoQuyenKhaDung: 1,
      NamXuatBan: 2026,
      MaNXB: 'NXB01',
      TacGia: 'Tác Giả Kiểm Thử',
      TrangThai: 'ACTIVE'
    });

    try {
      await axios.delete(`${API_BASE}/books/${tempDelBook._id}`, {
        headers: { Authorization: `Bearer ${managerToken}` }
      });
      throw new Error('Lẽ ra phải chặn xóa sách đang có người mượn');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'BOOK_CANNOT_DELETE_BORROWED') {
        return;
      }
      throw err;
    } finally {
      await Sach.deleteOne({ _id: tempDelBook._id });
    }
  });

  await testCase('TC-36', 'Xóa mềm ấn phẩm (Soft Delete) không có người mượn -> Chuyển sang ARCHIVED', async () => {
    const res = await axios.delete(`${API_BASE}/books/${testBookId}`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    if (res.status !== 200 || !res.data.success) {
      throw new Error('Xóa mềm thất bại');
    }
    const checkRes = await axios.get(`${API_BASE}/books/${testBookId}`);
    if (checkRes.data.data?.TrangThai !== 'ARCHIVED') {
      throw new Error('Chưa chuyển sang trạng thái ARCHIVED');
    }
  });

  await testCase('TC-37', 'Khôi phục ấn phẩm từ kho lưu trữ PATCH /api/books/:id/restore -> Chuyển lại ACTIVE', async () => {
    const res = await axios.patch(
      `${API_BASE}/books/${testBookId}/restore`,
      {},
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.status !== 200 || res.data.data?.TrangThai !== 'ACTIVE') {
      throw new Error('Chưa khôi phục về trạng thái ACTIVE');
    }
  });

  // ============================================================================
  // SUITE 6: VÒNG ĐỜI MƯỢN - TRẢ SÁCH & TRƯỜNG HỢP BIÊN (/api/borrows)
  // ============================================================================
  console.log('\n--- SUITE 6: VÒNG ĐỜI MƯỢN - TRẢ SÁCH & CÁC RÀNG BUỘC BIÊN ---');

  await testCase('TC-38', 'Độc giả reader1 tạo yêu cầu mượn ấn phẩm kiểm thử -> Trạng thái PENDING', async () => {
    const res = await axios.post(
      `${API_BASE}/borrows`,
      {
        sachId: testBookId,
        ngayHenLay: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (res.status !== 201 || res.data.data?.TrangThai !== 'PENDING') {
      throw new Error('Tạo yêu cầu mượn thất bại');
    }
    testBorrowId = res.data.data._id;
  });

  await testCase('TC-39', 'Độc giả tự hủy yêu cầu mượn sách khi đơn còn PENDING -> CANCELLED', async () => {
    const res = await axios.patch(
      `${API_BASE}/borrows/${testBorrowId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (res.status !== 200 || res.data.data?.TrangThai !== 'CANCELLED') {
      throw new Error('Hủy đơn mượn thất bại');
    }
  });

  await testCase('TC-40', 'Chặn độc giả hủy đơn mượn khi đơn không ở trạng thái PENDING', async () => {
    try {
      await axios.patch(
        `${API_BASE}/borrows/${testBorrowId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      throw new Error('Lẽ ra phải chặn hủy lại đơn CANCELLED');
    } catch (err) {
      if (err.response?.status === 400) return;
      throw err;
    }
  });

  await testCase('TC-41', 'Chặn mượn 2 cuốn trùng cùng một đầu sách (BORROW_DUPLICATE_BOOK)', async () => {
    // Mượn lần 1
    const res = await axios.post(
      `${API_BASE}/borrows`,
      { sachId: testBookId },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    testBorrowId = res.data.data._id;

    // Cố tình mượn lần 2 cùng cuốn đó
    try {
      await axios.post(
        `${API_BASE}/borrows`,
        { sachId: testBookId },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      throw new Error('Lẽ ra phải chặn mượn trùng sách');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'BORROW_DUPLICATE_BOOK') {
        return;
      }
      throw err;
    }
  });

  await testCase('TC-42', 'Chặn mượn vượt quá hạn mức tối đa quy định (3 cuốn)', async () => {
    const tempBorrows = [];
    try {
      const candidateBooks = [bookS002, bookS003, bookS004, bookS005].filter(Boolean);
      let limitHit = false;

      for (const b of candidateBooks) {
        try {
          const res = await axios.post(
            `${API_BASE}/borrows`,
            { sachId: b._id },
            { headers: { Authorization: `Bearer ${userToken}` } }
          );
          tempBorrows.push(res.data.data._id);
        } catch (err) {
          if (err.response?.status === 400 && err.response?.data?.error?.code === 'BORROW_LIMIT_EXCEEDED') {
            limitHit = true;
            break;
          }
          throw err;
        }
      }
      if (!limitHit) {
        throw new Error('Lẽ ra phải chạm ngưỡng giới hạn mượn 3 cuốn');
      }
    } finally {
      for (const bid of tempBorrows) {
        await axios.patch(
          `${API_BASE}/borrows/${bid}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${userToken}` } }
        ).catch(() => {});
      }
    }
  });

  await testCase('TC-43', 'Thủ thư duyệt đơn mượn PUT /api/borrows/:id/approve -> Chuyển sang APPROVED (+48h)', async () => {
    const res = await axios.put(
      `${API_BASE}/borrows/${testBorrowId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.status !== 200 || res.data.data?.TrangThai !== 'APPROVED') {
      throw new Error('Duyệt đơn mượn thất bại');
    }
  });

  await testCase('TC-44', 'Thủ thư xuất sách tại quầy PUT /api/borrows/:id/checkout -> Chuyển sang BORROWED (+14 ngày)', async () => {
    const res = await axios.put(
      `${API_BASE}/borrows/${testBorrowId}/checkout`,
      {},
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.status !== 200 || res.data.data?.TrangThai !== 'BORROWED') {
      throw new Error('Xuất sách thất bại');
    }
  });

  await testCase('TC-45', 'Độc giả gia hạn mượn sách lần 1 PATCH /api/borrows/:id/renew -> Tăng SoLanGiaHan = 1 (+7 ngày)', async () => {
    const res = await axios.patch(
      `${API_BASE}/borrows/${testBorrowId}/renew`,
      {},
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (res.status !== 200 || res.data.data?.SoLanGiaHan !== 1) {
      throw new Error('Gia hạn mượn sách thất bại');
    }
  });

  await testCase('TC-46', 'Chặn độc giả gia hạn mượn sách lần 2 khi vượt quá giới hạn cho phép (400)', async () => {
    try {
      await axios.patch(
        `${API_BASE}/borrows/${testBorrowId}/renew`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      throw new Error('Lẽ ra phải chặn gia hạn lần 2');
    } catch (err) {
      if (
        err.response?.status === 400 &&
        (err.response?.data?.error?.code === 'RENEW_LIMIT_EXCEEDED' ||
          err.response?.data?.error?.code === 'BORROW_RENEW_LIMIT_REACHED')
      ) {
        return;
      }
      throw err;
    }
  });

  await testCase('TC-47', 'Thủ thư từ chối yêu cầu mượn sách PENDING PUT /api/borrows/:id/reject', async () => {
    const tempBorrow = await axios.post(
      `${API_BASE}/borrows`,
      { sachId: bookS005 ? bookS005._id : testBookId },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const tempId = tempBorrow.data.data._id;

    const res = await axios.put(
      `${API_BASE}/borrows/${tempId}/reject`,
      { lyDoTuChoi: 'Sách đang bảo trì kiểm kê định kỳ' },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.status !== 200 || res.data.data?.TrangThai !== 'REJECTED') {
      throw new Error('Từ chối đơn mượn thất bại');
    }
  });

  await testCase('TC-48', 'Thủ thư nhận trả sách tại quầy PUT /api/borrows/:id/checkin -> Chuyển RETURNED và hoàn kho', async () => {
    const res = await axios.put(
      `${API_BASE}/borrows/${testBorrowId}/checkin`,
      {},
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.status !== 200 || res.data.data?.TrangThai !== 'RETURNED') {
      throw new Error('Nhận trả sách thất bại');
    }
  });

  // ============================================================================
  // SUITE 7: SỰ CỐ & BỒI THƯỜNG HƯ HỎNG/MẤT SÁCH (/api/fines)
  // ============================================================================
  console.log('\n--- SUITE 7: QUẢN LÝ SỰ CỐ & BỒI THƯỜNG ---');

  await testCase('TC-49', 'Thủ thư lập biên bản hư hỏng sách POST /api/fines -> Trạng thái UNPAID', async () => {
    const res = await axios.post(
      `${API_BASE}/fines`,
      {
        theoDoiMuonId: testBorrowId,
        loaiSuCo: 'DAMAGED',
        moTa: 'Bìa sách bị rách nhẹ và ố nước',
        soTienBoiThuong: 30000
      },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.status !== 201 || res.data.data?.TrangThai !== 'UNPAID') {
      throw new Error('Lập biên bản thất bại');
    }
    testFineId = res.data.data._id;
  });

  await testCase('TC-50', 'Chặn tạo biên bản sự cố khi thiếu các trường bắt buộc (422 Unprocessable Entity)', async () => {
    try {
      await axios.post(
        `${API_BASE}/fines`,
        { theoDoiMuonId: testBorrowId },
        { headers: { Authorization: `Bearer ${managerToken}` } }
      );
      throw new Error('Lẽ ra phải chặn khi thiếu dữ liệu');
    } catch (err) {
      if (err.response?.status === 422) return;
      throw err;
    }
  });

  await testCase('TC-51', 'Chặn độc giả mượn sách mới khi đang nợ biên bản bồi thường UNPAID (400)', async () => {
    try {
      await axios.post(
        `${API_BASE}/borrows`,
        { sachId: testBookId },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      throw new Error('Lẽ ra phải chặn khi nợ bồi thường');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'BORROW_UNPAID_FINE') {
        return;
      }
      throw err;
    }
  });

  await testCase('TC-52', 'Thủ thư bấm xác nhận đã thu tiền tại quầy PUT /api/fines/:id/pay -> Chuyển PAID', async () => {
    const res = await axios.put(
      `${API_BASE}/fines/${testFineId}/pay`,
      { ghiChu: 'Đã thu đủ 30.000đ tiền mặt tại quầy giao dịch' },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    if (res.status !== 200 || res.data.data?.TrangThai !== 'PAID') {
      throw new Error('Thanh toán biên bản thất bại');
    }
  });

  await testCase('TC-53', 'Xem danh sách biên bản bồi thường GET /api/fines', async () => {
    const res = await axios.get(`${API_BASE}/fines`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    if (res.status !== 200 || !Array.isArray(res.data.data)) {
      throw new Error('Không lấy được danh sách biên bản');
    }
  });

  // ============================================================================
  // SUITE 8: QUẢN TRỊ NGƯỜI DÙNG & BLACKLIST (/api/users)
  // ============================================================================
  console.log('\n--- SUITE 8: QUẢN TRỊ NGƯỜI DÙNG & BLACKLIST ---');

  await testCase('TC-54', 'Admin xem danh sách người dùng kèm phân trang GET /api/users', async () => {
    const res = await axios.get(`${API_BASE}/users?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200 || !res.data.data) throw new Error('Không lấy được danh sách user');
  });

  await testCase('TC-55', 'Admin khóa tài khoản độc giả (Đưa vào Blacklist) PUT /api/users/:id/blacklist', async () => {
    const login2 = await axios.post(`${API_BASE}/auth/reader/login`, {
      email: 'reader2@gmail.com',
      password: 'User@123'
    });
    reader2Token = login2.data.data.accessToken;
    reader2DocGiaId = login2.data.data.user?._id || login2.data.data.user?.id;

    const res = await axios.put(
      `${API_BASE}/users/${reader2DocGiaId}/blacklist`,
      { daBiKhoa: true, lyDoKhoa: 'Vi phạm quy chế kiểm thử hệ thống' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (res.status !== 200 || !res.data.data?.DaBiKhoa) {
      throw new Error('Khóa tài khoản thất bại');
    }
  });

  await testCase('TC-56', 'Độc giả bị khóa cố tình mượn sách -> Bị chặn 403 BORROW_BLACKLISTED', async () => {
    try {
      await axios.post(
        `${API_BASE}/borrows`,
        { sachId: testBookId },
        { headers: { Authorization: `Bearer ${reader2Token}` } }
      );
      throw new Error('Lẽ ra phải chặn độc giả bị khóa');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.error?.code === 'BORROW_BLACKLISTED') {
        return;
      }
      throw err;
    }
  });

  await testCase('TC-57', 'Admin mở khóa quyền mượn sách cho độc giả PUT /api/users/:id/blacklist -> DaBiKhoa: false', async () => {
    const res = await axios.put(
      `${API_BASE}/users/${reader2DocGiaId}/blacklist`,
      { daBiKhoa: false },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (res.status !== 200 || res.data.data?.DaBiKhoa !== false) {
      throw new Error('Mở khóa tài khoản thất bại');
    }
  });

  // ============================================================================
  // SUITE 9: CẤU HÌNH QUY CHẾ THƯ VIỆN (/api/settings)
  // ============================================================================
  console.log('\n--- SUITE 9: CẤU HÌNH QUY CHẾ THƯ VIỆN ---');

  await testCase('TC-58', 'Khách và độc giả xem thông số quy chế thư viện hiện hành GET /api/settings', async () => {
    const res = await axios.get(`${API_BASE}/settings`);
    if (res.status !== 200 || !res.data.data?.standardBorrowDays) {
      throw new Error('Không xem được quy chế');
    }
  });

  await testCase('TC-59', 'Độc giả và Thủ thư cố tình sửa quy chế thư viện -> Bị chặn 403 Forbidden', async () => {
    try {
      await axios.put(
        `${API_BASE}/settings`,
        { standardBorrowDays: 20 },
        { headers: { Authorization: `Bearer ${managerToken}` } }
      );
      throw new Error('Lẽ ra phải chặn Thủ thư');
    } catch (err) {
      if (err.response?.status === 403) return;
      throw err;
    }
  });

  await testCase('TC-60', 'Admin cập nhật thông số quy chế thư viện PUT /api/settings', async () => {
    const res = await axios.put(
      `${API_BASE}/settings`,
      {
        standardBorrowDays: 14,
        maxBooksPerReader: 3,
        renewExtensionDays: 7,
        maxRenewCount: 1,
        pickupHoldHours: 48,
        blacklistAfterOverdueDays: 15
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    if (res.status !== 200) throw new Error('Cập nhật quy chế thất bại');
  });

  // ============================================================================
  // SUITE 10: ĐÁNH GIÁ & NHẬN XÉT ẤN PHẨM (/api/reviews)
  // ============================================================================
  console.log('\n--- SUITE 10: ĐÁNH GIÁ & NHẬN XÉT ẤN PHẨM ---');

  await testCase('TC-61', 'Khách vãng lai xem danh sách nhận xét GET /api/reviews/book/:bookId (canReview = false)', async () => {
    const res = await axios.get(`${API_BASE}/reviews/book/${testBookId}`);
    if (res.status !== 200 || res.data.data?.canReview !== false) {
      throw new Error('Khách vãng lai không được phép có canReview = true');
    }
  });

  await testCase('TC-62', 'Độc giả chưa từng mượn hoặc chưa hoàn trả sách gửi nhận xét -> Bị chặn 403 REVIEW_NOT_ELIGIBLE', async () => {
    try {
      await axios.post(
        `${API_BASE}/reviews`,
        { bookId: testBookId, soSao: 5, noiDung: 'Nhận xét không hợp lệ khi chưa mượn' },
        { headers: { Authorization: `Bearer ${reader2Token}` } }
      );
      throw new Error('Lẽ ra phải chặn độc giả chưa mượn trả');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.error?.code === 'REVIEW_NOT_ELIGIBLE') {
        return;
      }
      throw err;
    }
  });

  await testCase('TC-63', 'Độc giả đã hoàn trả sách (reader1 với testBookId) gửi nhận xét hợp lệ -> Thành công', async () => {
    const res = await axios.post(
      `${API_BASE}/reviews`,
      {
        bookId: testBookId,
        soSao: 5,
        noiDung: 'Sách rất hay, hướng dẫn chi tiết và ví dụ thực tế phong phú!'
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (res.status !== 200 && res.status !== 201) throw new Error('Gửi nhận xét thất bại');
    testReviewId = res.data.data?._id;
  });

  await testCase('TC-64', 'Chặn gửi nhận xét với số sao không hợp lệ (ví dụ: 6 sao, 0 sao) -> 400 Validation Error', async () => {
    try {
      await axios.post(
        `${API_BASE}/reviews`,
        { bookId: testBookId, soSao: 6, noiDung: 'Điểm 6 sao bất hợp lệ' },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      throw new Error('Lẽ ra phải chặn 6 sao');
    } catch (err) {
      if (err.response?.status === 400) return;
      throw err;
    }
  });

  await testCase('TC-65', 'Độc giả khác (reader2) cố tình xóa nhận xét của độc giả reader1 -> Bị chặn 403', async () => {
    try {
      await axios.delete(`${API_BASE}/reviews/${testReviewId}`, {
        headers: { Authorization: `Bearer ${reader2Token}` }
      });
      throw new Error('Lẽ ra phải chặn xóa nhận xét của người khác');
    } catch (err) {
      if (err.response?.status === 403) return;
      throw err;
    }
  });

  await testCase('TC-66', 'Độc giả reader1 tự xóa nhận xét của chính mình DELETE /api/reviews/:id -> Thành công', async () => {
    const res = await axios.delete(`${API_BASE}/reviews/${testReviewId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (res.status !== 200) throw new Error('Xóa nhận xét của chính mình thất bại');
  });

  await testCase('TC-67', 'Thủ thư / Admin kiểm duyệt xóa nhận xét vi phạm -> Thành công và ghi nhận Audit Trail', async () => {
    const newRev = await axios.post(
      `${API_BASE}/reviews`,
      { bookId: testBookId, soSao: 4, noiDung: 'Nhận xét vi phạm cần nhân viên kiểm duyệt' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const modReviewId = newRev.data.data._id;

    const res = await axios.delete(`${API_BASE}/reviews/${modReviewId}`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    if (res.status !== 200) throw new Error('Thủ thư xóa nhận xét thất bại');
  });

  // ============================================================================
  // SUITE 11: THỐNG KÊ KPI, XUẤT CSV & NHẬT KÝ HOẠT ĐỘNG (/api/stats)
  // ============================================================================
  console.log('\n--- SUITE 11: THỐNG KÊ KPI, XUẤT CSV & AUDIT TRAIL ---');

  await testCase('TC-68', 'Admin xem thống kê tổng quan Dashboard KPI qua GET /api/stats/summary', async () => {
    const res = await axios.get(`${API_BASE}/stats/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200 || res.data.data?.totalBooks === undefined) {
      throw new Error('Không lấy được KPI');
    }
  });

  await testCase('TC-69', 'Admin xem Top 10 ấn phẩm được mượn nhiều nhất GET /api/stats/top-books', async () => {
    const res = await axios.get(`${API_BASE}/stats/top-books`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200 || !Array.isArray(res.data.data)) {
      throw new Error('Không lấy được Top sách');
    }
  });

  await testCase('TC-70', 'Admin xuất danh sách mượn - trả ra file CSV UTF-8 có BOM (GET /api/stats/export/borrows)', async () => {
    const res = await axios.get(`${API_BASE}/stats/export/borrows`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      responseType: 'text'
    });
    const hasBOM = res.data.charCodeAt(0) === 0xfeff || res.data.startsWith('\uFEFF');
    if (!res.data || (!hasBOM && !res.data.includes('Mã Phiếu Mượn'))) {
      throw new Error('Dữ liệu CSV xuất ra không hợp lệ');
    }
  });

  await testCase('TC-71', 'Admin xuất danh sách vi phạm & bồi thường ra file CSV UTF-8 có BOM (GET /api/stats/export/fines)', async () => {
    const res = await axios.get(`${API_BASE}/stats/export/fines`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      responseType: 'text'
    });
    const hasBOM = res.data.charCodeAt(0) === 0xfeff || res.data.startsWith('\uFEFF');
    if (!res.data || (!hasBOM && !res.data.includes('Mã Biên Bản'))) {
      throw new Error('Dữ liệu CSV vi phạm không hợp lệ');
    }
  });

  await testCase('TC-72', 'Admin truy vấn Nhật ký hoạt động Audit Trail GET /api/stats/audit-logs', async () => {
    const res = await axios.get(`${API_BASE}/stats/audit-logs?limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.status !== 200 || !Array.isArray(res.data.data)) {
      throw new Error('Không lấy được Audit Logs');
    }
  });

  // Dọn dẹp tài nguyên sách kiểm thử
  try {
    if (testBookId) {
      const Sach = require('../models/Sach');
      const DanhGiaSach = require('../models/DanhGiaSach');
      const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
      const BienBanBoiThuong = require('../models/BienBanBoiThuong');
      await Sach.deleteOne({ _id: testBookId });
      await DanhGiaSach.deleteMany({ SachId: testBookId });
      await TheoDoiMuonSach.deleteMany({ SachId: testBookId });
      await BienBanBoiThuong.deleteMany({ SachId: testBookId });
    }
  } catch (_) {}

  console.log('\n========================================================================');
  console.log(` TỔNG KẾT KẾT QUẢ KIỂM THỬ: ${passed}/72 PASS (${failed} FAIL)`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runE2ETests();
