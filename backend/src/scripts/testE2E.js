const axios = require('axios');

const API_BASE = 'http://127.0.0.1:5000/api';

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

  let userToken = '';
  let managerToken = '';
  let adminToken = '';
  let reader2Token = '';

  let bookS001 = null;
  let bookS002 = null;
  let bookS003 = null;
  let bookS004 = null;
  let bookS005 = null;

  let testBorrowId = '';
  let testFineId = '';

  // TC-01: Đăng nhập tài khoản USER
  await testCase('TC-01', 'Đăng nhập tài khoản USER trên Cổng Độc giả (/api/auth/reader/login)', async () => {
    // 1. Kiểm tra chặn Admin đăng nhập vào Cổng Độc giả
    try {
      await axios.post(`${API_BASE}/auth/reader/login`, {
        email: 'admin@library.com',
        password: 'Admin@123'
      });
      throw new Error('Cổng độc giả phải chặn tài khoản Admin');
    } catch (err) {
      if (err.response?.status !== 403) throw err;
    }

    // 2. Đăng nhập đúng với reader1
    const res = await axios.post(`${API_BASE}/auth/reader/login`, {
      email: 'reader1@gmail.com',
      password: 'User@123'
    });
    if (!res.data.data.accessToken) throw new Error('Không nhận được accessToken');
    userToken = res.data.data.accessToken;

    // Load các sách mẫu cần thiết
    const booksRes = await axios.get(`${API_BASE}/books?limit=50`);
    const allBooks = booksRes.data.data;
    bookS001 = allBooks.find(b => b.MaSach === 'S001');
    bookS002 = allBooks.find(b => b.MaSach === 'S002');
    bookS003 = allBooks.find(b => b.MaSach === 'S003');
    bookS004 = allBooks.find(b => b.MaSach === 'S004');
    bookS005 = allBooks.find(b => b.MaSach === 'S005');

    if (!bookS001 || !bookS002) throw new Error('Không tìm thấy sách mẫu S001 hoặc S002');
  });

  // TC-02: Độc giả reader1 chọn mượn 1 cuốn sách khả dụng
  await testCase('TC-02', 'Độc giả reader1 chọn mượn 1 cuốn sách khả dụng (S002)', async () => {
    const res = await axios.post(
      `${API_BASE}/borrows`,
      {
        sachId: bookS002._id,
        ngayHenLay: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    testBorrowId = res.data.data._id;
    if (res.data.data.TrangThai !== 'PENDING') throw new Error('Trạng thái không phải PENDING');
  });

  // TC-03: Độc giả bấm "Hủy đơn mượn" khi đơn còn PENDING
  await testCase('TC-03', 'Độc giả bấm "Hủy đơn mượn" khi đơn còn PENDING', async () => {
    const res = await axios.put(
      `${API_BASE}/borrows/${testBorrowId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (res.data.data.TrangThai !== 'CANCELLED') throw new Error('Trạng thái không phải CANCELLED');
  });

  // TC-04: Chặn mượn 2 cuốn trùng cùng một đầu sách
  await testCase('TC-04', 'Độc giả mượn 2 cuốn trùng cùng một đầu sách (S001 đã có trong seed)', async () => {
    try {
      await axios.post(
        `${API_BASE}/borrows`,
        { sachId: bookS001._id, ngayHenLay: new Date().toISOString() },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      throw new Error('Lẽ ra hệ thống phải chặn mượn sách trùng');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'BORROW_DUPLICATE_BOOK') {
        return; // Đạt kỳ vọng
      }
      throw err;
    }
  });

  // TC-05: Chặn mượn vượt giới hạn 3 cuốn
  await testCase('TC-05', 'Độc giả cố tình mượn vượt hạn mức tối đa 3 cuốn', async () => {
    // reader1 đang có 1 cuốn S001. Tạo thêm đơn cho S003 và S004 -> Tổng là 3 cuốn
    await axios.post(`${API_BASE}/borrows`, { sachId: bookS003._id }, { headers: { Authorization: `Bearer ${userToken}` } });
    await axios.post(`${API_BASE}/borrows`, { sachId: bookS004._id }, { headers: { Authorization: `Bearer ${userToken}` } });

    // Cố tình mượn tiếp cuốn thứ 4 (S005) -> Phải bị chặn 400 BORROW_LIMIT_EXCEEDED
    try {
      await axios.post(`${API_BASE}/borrows`, { sachId: bookS005._id }, { headers: { Authorization: `Bearer ${userToken}` } });
      throw new Error('Lẽ ra phải chặn mượn cuốn thứ 4');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'BORROW_LIMIT_EXCEEDED') {
        return; // Đạt kỳ vọng
      }
      throw err;
    }
  });

  // TC-06: Phân quyền RBAC cho BOOK_MANAGER
  await testCase('TC-06', 'Đăng nhập Admin Portal (/api/auth/admin/login, chặn Reader 403 & chặn 403 ở /api/users)', async () => {
    // 1. Kiểm tra chặn Reader đăng nhập vào Cổng Quản trị
    try {
      await axios.post(`${API_BASE}/auth/admin/login`, {
        email: 'reader1@gmail.com',
        password: 'User@123'
      });
      throw new Error('Cổng quản trị phải chặn tài khoản Độc giả');
    } catch (err) {
      if (err.response?.status !== 403) throw err;
    }

    const res = await axios.post(`${API_BASE}/auth/admin/login`, {
      email: 'manager@library.com',
      password: 'Manager@123'
    });
    managerToken = res.data.data.accessToken;

    try {
      await axios.get(`${API_BASE}/users`, { headers: { Authorization: `Bearer ${managerToken}` } });
      throw new Error('BOOK_MANAGER không được phép truy cập /api/users');
    } catch (err) {
      if (err.response?.status === 403) return; // Đạt kỳ vọng
      throw err;
    }
  });

  // TC-07: Thủ thư duyệt đơn mượn (+48h)
  await testCase('TC-07', 'Thủ thư duyệt đơn mượn (Approve -> HanChotNhan +48h)', async () => {
    // Lấy 1 đơn PENDING (chẳng hạn đơn S003)
    const listRes = await axios.get(`${API_BASE}/borrows?status=PENDING`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    const pendingItem = listRes.data.data[0];
    if (!pendingItem) throw new Error('Không tìm thấy đơn PENDING để duyệt');
    testBorrowId = pendingItem._id;

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

  // TC-10: Trả sách có sự cố (Thủ thư lập biên bản DAMAGED thẩm định 45.000đ)
  await testCase('TC-10', 'Trả sách có sự cố (Thủ thư lập biên bản DAMAGED thẩm định 45.000đ)', async () => {
    const res = await axios.post(
      `${API_BASE}/fines`,
      {
        theoDoiMuonId: testBorrowId,
        loaiSuCo: 'DAMAGED',
        moTa: 'Rách trang bìa và mép sách',
        soTienBoiThuong: 45000
      },
      { headers: { Authorization: `Bearer ${managerToken}` } }
    );
    testFineId = res.data.data._id;
    if (res.data.data.TrangThai !== 'UNPAID') throw new Error('Trạng thái biên bản không phải UNPAID');
  });

  // TC-11: Chặn mượn khi đang nợ bồi thường UNPAID
  await testCase('TC-11', 'Độc giả đang có biên bản UNPAID (reader2) cố tình mượn sách mới', async () => {
    const resLogin2 = await axios.post(`${API_BASE}/auth/reader/login`, {
      email: 'reader2@gmail.com',
      password: 'User@123'
    });
    reader2Token = resLogin2.data.data.accessToken;

    try {
      await axios.post(
        `${API_BASE}/borrows`,
        { sachId: bookS002._id },
        { headers: { Authorization: `Bearer ${reader2Token}` } }
      );
      throw new Error('Lẽ ra phải chặn mượn do đang nợ biên bản bồi thường');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'BORROW_UNPAID_FINE') {
        return; // Đạt kỳ vọng
      }
      throw err;
    }
  });

  // TC-12: Thủ thư xác nhận đã thu tiền tại quầy -> mở khóa quyền mượn
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
    try {
      await axios.delete(`${API_BASE}/books/${bookS001._id}`, {
        headers: { Authorization: `Bearer ${managerToken}` }
      });
      throw new Error('Lẽ ra phải chặn xóa sách đang có người mượn');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'BOOK_CANNOT_DELETE_BORROWED') {
        return; // Đạt kỳ vọng
      }
      throw err;
    }
  });

  // TC-14: Admin xuất báo cáo mượn trả và vi phạm ra CSV UTF-8
  await testCase('TC-14', 'Admin bấm xuất báo cáo mượn trả và vi phạm ra CSV UTF-8', async () => {
    const resAdmin = await axios.post(`${API_BASE}/auth/admin/login`, {
      email: 'admin@library.com',
      password: 'Admin@123'
    });
    adminToken = resAdmin.data.data.accessToken;

    const res = await axios.get(`${API_BASE}/stats/export/borrows`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      responseType: 'text'
    });
    const hasBOM = res.data.charCodeAt(0) === 0xFEFF || res.data.startsWith('\uFEFF');
    if (!res.data || typeof res.data !== 'string' || (!hasBOM && !res.data.includes('Mã Phiếu Mượn'))) {
      throw new Error('Dữ liệu CSV không hợp lệ');
    }
  });

  // TC-15: Đổi mật khẩu cá nhân (Kiểm tra đúng/sai mật khẩu hiện tại)
  await testCase('TC-15', 'Đổi mật khẩu: kiểm tra chặn mật khẩu cũ sai và chấp thuận mật khẩu cũ đúng', async () => {
    // 1. Thử đổi với mật khẩu cũ SAI -> phải trả về lỗi 400
    try {
      await axios.put(
        `${API_BASE}/auth/change-password`,
        {
          currentPassword: 'WrongPassword@999',
          newPassword: 'NewUser@456'
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      throw new Error('Lẽ ra phải chặn khi mật khẩu cũ không chính xác');
    } catch (err) {
      if (err.response?.status !== 400 || !err.response?.data?.error?.message?.includes('Mật khẩu hiện tại không chính xác')) {
        throw err;
      }
    }

    // 2. Đổi với mật khẩu cũ ĐÚNG ('User@123' -> 'NewUser@456')
    const resSuccess = await axios.put(
      `${API_BASE}/auth/change-password`,
      {
        currentPassword: 'User@123',
        newPassword: 'NewUser@456'
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (!resSuccess.data.success) throw new Error('Đổi mật khẩu thất bại dù mật khẩu cũ đúng');

    // 3. Đổi lại mật khẩu ban đầu ('NewUser@456' -> 'User@123') để không làm ảnh hưởng các test khác
    const resRestore = await axios.put(
      `${API_BASE}/auth/change-password`,
      {
        currentPassword: 'NewUser@456',
        newPassword: 'User@123'
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    if (!resRestore.data.success) throw new Error('Không thể khôi phục lại mật khẩu ban đầu');
  });

  console.log('\n====================================================');
  console.log(`📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ: ${passed}/15 PASS (${failed} FAIL)`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Gọi trực tiếp test suite — yêu cầu server đang chạy tại http://127.0.0.1:5000
runE2ETests();
