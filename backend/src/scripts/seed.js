const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const DocGia = require('../models/DocGia');
const NhanVien = require('../models/NhanVien');
const NhaXuatBan = require('../models/NhaXuatBan');
const TheLoai = require('../models/TheLoai');
const Sach = require('../models/Sach');
const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
const BienBanBoiThuong = require('../models/BienBanBoiThuong');
const CauHinhHeThong = require('../models/CauHinhHeThong');
const NhatKyHoatDong = require('../models/NhatKyHoatDong');

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/books_management';
    await mongoose.connect(mongoUri);
    console.log('✅ Đã kết nối MongoDB để nạp dữ liệu mẫu...');

    // 1. Xóa sạch dữ liệu cũ
    await Promise.all([
      DocGia.deleteMany({}),
      NhanVien.deleteMany({}),
      NhaXuatBan.deleteMany({}),
      TheLoai.deleteMany({}),
      Sach.deleteMany({}),
      TheoDoiMuonSach.deleteMany({}),
      BienBanBoiThuong.deleteMany({}),
      CauHinhHeThong.deleteMany({}),
      NhatKyHoatDong.deleteMany({})
    ]);
    console.log('🧹 Đã dọn dẹp sạch toàn bộ dữ liệu cũ.');

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
    console.log('⚙️ Đã khởi tạo Cấu hình hệ thống mặc định.');

    // 3. Tạo Danh mục Thể loại mẫu (10 Thể loại chuẩn hóa)
    const categories = [
      { MaTheLoai: 'TL01', TenTheLoai: 'Công nghệ thông tin', MoTa: 'Sách chuyên ngành CNTT, lập trình, phần mềm, trí tuệ nhân tạo', TrangThai: 'ACTIVE' },
      { MaTheLoai: 'TL02', TenTheLoai: 'Khoa học máy tính', MoTa: 'Lý thuyết tính toán, thuật toán, cấu trúc dữ liệu và an toàn thông tin', TrangThai: 'ACTIVE' },
      { MaTheLoai: 'TL03', TenTheLoai: 'Văn học nước ngoài', MoTa: 'Tiểu thuyết kinh điển, tác phẩm văn học nổi tiếng thế giới', TrangThai: 'ACTIVE' },
      { MaTheLoai: 'TL04', TenTheLoai: 'Văn học Việt Nam', MoTa: 'Văn học hiện thực, lãng mạn, thơ ca và tác phẩm dân gian Việt Nam', TrangThai: 'ACTIVE' },
      { MaTheLoai: 'TL05', TenTheLoai: 'Kinh tế & Quản trị', MoTa: 'Tài chính, khởi nghiệp, quản trị kinh doanh và thị trường đầu tư', TrangThai: 'ACTIVE' },
      { MaTheLoai: 'TL06', TenTheLoai: 'Tâm lý & Kỹ năng sống', MoTa: 'Phát triển bản thân, kỹ năng giao tiếp, tâm lý học thực hành', TrangThai: 'ACTIVE' },
      { MaTheLoai: 'TL07', TenTheLoai: 'Khoa học & Đời sống', MoTa: 'Vũ trụ học, sinh học, vật lý phổ thông và đời sống thường ngày', TrangThai: 'ACTIVE' },
      { MaTheLoai: 'TL08', TenTheLoai: 'Lịch sử & Triết học', MoTa: 'Lịch sử văn minh nhân loại, lịch sử dân tộc và các trường phái triết học', TrangThai: 'ACTIVE' },
      { MaTheLoai: 'TL09', TenTheLoai: 'Ngoại ngữ & Từ điển', MoTa: 'Giáo trình tiếng Anh, tiếng Nhật, tiếng Trung và từ điển chuyên ngành', TrangThai: 'ACTIVE' },
      { MaTheLoai: 'TL10', TenTheLoai: 'Thiếu nhi & Giáo dục', MoTa: 'Truyện tranh giáo dục, sách phát triển trí tuệ cho lứa tuổi thiếu niên', TrangThai: 'ACTIVE' }
    ];
    await TheLoai.insertMany(categories);
    console.log('📚 Đã tạo 10 Danh mục Thể loại chuẩn hóa.');

    // 4. Tạo Nhà xuất bản mẫu (11 NXB)
    const publishers = [
      { MaNXB: 'NXB01', TenNXB: 'NXB Thông Tin & Truyền Thông', DiaChi: '115 Trần Duy Hưng, Cầu Giấy, Hà Nội', DienThoai: '02435567890', Email: 'nxb.tttt@mic.gov.vn' },
      { MaNXB: 'NXB02', TenNXB: 'NXB Khoa Học Kỹ Thuật', DiaChi: '70 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', DienThoai: '02438234567', Email: 'nxb.khkt@gov.vn' },
      { MaNXB: 'NXB03', TenNXB: 'NXB Trẻ', DiaChi: '161B Lý Chính Thắng, P. Võ Thị Sáu, Q.3, TP.HCM', DienThoai: '02839316289', Email: 'hopthu@nxbtre.com.vn' },
      { MaNXB: 'NXB04', TenNXB: 'NXB Kim Đồng', DiaChi: '55 Quang Trung, Hai Bà Trưng, Hà Nội', DienThoai: '02439434730', Email: 'cskh@nxbkimdong.com.vn' },
      { MaNXB: 'NXB05', TenNXB: 'NXB Hội Nhà Văn', DiaChi: '65 Nguyễn Du, Hai Bà Trưng, Hà Nội', DienThoai: '02438222135', Email: 'nxbhoinhavan@gmail.com' },
      { MaNXB: 'NXB06', TenNXB: 'NXB Tổng Hợp TP.HCM', DiaChi: '62 Nguyễn Thị Minh Khai, Q.1, TP.HCM', DienThoai: '02838225340', Email: 'nxb@nxbhcm.com.vn' },
      { MaNXB: 'NXB07', TenNXB: 'NXB Thế Giới', DiaChi: '46 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', DienThoai: '02438253841', Email: 'thegioi@hn.vnn.vn' },
      { MaNXB: 'NXB08', TenNXB: 'NXB Tri Thức', DiaChi: '53 Nguyễn Du, Hai Bà Trưng, Hà Nội', DienThoai: '02439447239', Email: 'contact@nxbtrithuc.com.vn' },
      { MaNXB: 'NXB09', TenNXB: 'NXB Văn Học', DiaChi: '18 Nguyễn Trường Tộ, Ba Đình, Hà Nội', DienThoai: '02438514112', Email: 'nxbvanhoc@vnn.vn' },
      { MaNXB: 'NXB10', TenNXB: 'NXB Đại Học Quốc Gia', DiaChi: '16 Hàng Chuối, Hai Bà Trưng, Hà Nội', DienThoai: '02437547735', Email: 'nxb@vnu.edu.vn' },
      { MaNXB: 'NXB11', TenNXB: 'NXB Hồng Đức', DiaChi: '65 Tràng Thi, Hoàn Kiếm, Hà Nội', DienThoai: '02439260024', Email: 'hongduc@nxb.vn' }
    ];
    await NhaXuatBan.insertMany(publishers);
    console.log('🏢 Đã tạo 11 Nhà xuất bản đối tác.');

    // 5. Tạo Tài khoản Nhân viên (Băm mật khẩu Bcrypt)
    const hashAdminPass = await bcrypt.hash('Admin@123', 10);
    const hashManagerPass = await bcrypt.hash('Manager@123', 10);

    const admin = await NhanVien.create({
      MSNV: 'NV001',
      HoTenNV: 'Quản Trị Viên Hệ Thống',
      Email: 'admin@library.com',
      Password: hashAdminPass,
      ChucVu: 'ADMIN',
      DiaChi: '123 Đường Cầu Giấy, Hà Nội',
      SoDienThoai: '0901234567',
      HinhAnh: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    });

    const manager = await NhanVien.create({
      MSNV: 'NV002',
      HoTenNV: 'Thủ Thư Trưởng',
      Email: 'manager@library.com',
      Password: hashManagerPass,
      ChucVu: 'BOOK_MANAGER',
      DiaChi: '456 Đường Láng, Hà Nội',
      SoDienThoai: '0902345678',
      HinhAnh: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    });
    console.log('👤 Đã tạo tài khoản Quản trị viên (NV001) và Thủ thư trưởng (NV002).');

    // 6. Tạo Tài khoản Độc giả (Băm mật khẩu Bcrypt)
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
      HinhAnh: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
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
      HinhAnh: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      DaBiKhoa: false
    });
    console.log('📖 Đã tạo tài khoản độc giả mẫu DG001 (reader1@gmail.com) và DG002 (reader2@gmail.com).');

    // 7. Tạo 15 Đầu sách phong phú thể loại và hình ảnh bìa
    const sampleBooks = [
      {
        MaSach: 'S001',
        TenSach: 'Lập Trình Web Hiện Đại với Vue 3 & Express',
        DonGia: 185000,
        SoQuyen: 5,
        NamXuatBan: 2024,
        MaNXB: 'NXB01',
        TacGia: 'Evan You & TJ Holowaychuk',
        NguonGoc: 'Evan You & TJ Holowaychuk',
        TheLoai: 'Công nghệ thông tin',
        MaTheLoai: 'TL01',
        ISBN: '978-604-0-10001-1',
        HinhAnh: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
        MoTa: 'Cẩm nang toàn diện về xây dựng Single Page Applications với Vue 3 Composition API, Vite, Pinia và Backend RESTful API Express.js.',
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
        TheLoai: 'Công nghệ thông tin',
        MaTheLoai: 'TL01',
        ISBN: '978-604-0-10002-8',
        HinhAnh: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=400&q=80',
        MoTa: 'Quy tắc và cấu trúc thiết kế phần mềm linh hoạt, dễ bảo trì và độc lập với framework từ chuyên gia Uncle Bob.',
        ViTri: 'Kệ A1-02 (Tầng 2)',
        SoQuyenKhaDung: 4,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S003',
        TenSach: 'Thiết Kế Hệ Thống Thực Chiến (System Design)',
        DonGia: 260000,
        SoQuyen: 3,
        NamXuatBan: 2024,
        MaNXB: 'NXB07',
        TacGia: 'Alex Xu',
        NguonGoc: 'Alex Xu',
        TheLoai: 'Công nghệ thông tin',
        MaTheLoai: 'TL01',
        ISBN: '978-604-0-10003-5',
        HinhAnh: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
        MoTa: 'Hướng dẫn thiết kế các hệ thống phân tán quy mô lớn, chịu tải cao phục vụ hàng triệu người dùng đồng thời.',
        ViTri: 'Kệ A1-03 (Tầng 2)',
        SoQuyenKhaDung: 3,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S004',
        TenSach: 'Khám Phá Trí Tuệ Nhân Tạo & LLM',
        DonGia: 210000,
        SoQuyen: 5,
        NamXuatBan: 2024,
        MaNXB: 'NXB10',
        TacGia: 'Andrew Ng',
        NguonGoc: 'Andrew Ng',
        TheLoai: 'Khoa học máy tính',
        MaTheLoai: 'TL02',
        ISBN: '978-604-0-10004-2',
        HinhAnh: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80',
        MoTa: 'Tìm hiểu nền tảng học máy, mạng nơ-ron sâu và các mô hình ngôn ngữ lớn (LLM) thay đổi thế giới công nghệ.',
        ViTri: 'Kệ A2-01 (Tầng 2)',
        SoQuyenKhaDung: 5,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S005',
        TenSach: 'Nhà Giả Kim',
        DonGia: 89000,
        SoQuyen: 6,
        NamXuatBan: 2023,
        MaNXB: 'NXB05',
        TacGia: 'Paulo Coelho',
        NguonGoc: 'Paulo Coelho',
        TheLoai: 'Văn học nước ngoài',
        MaTheLoai: 'TL03',
        ISBN: '978-604-0-10005-9',
        HinhAnh: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
        MoTa: 'Cuốn tiểu thuyết huyền thoại về hành trình theo đuổi vận mệnh và lắng nghe tiếng nói sâu thẳm từ trái tim.',
        ViTri: 'Kệ B1-01 (Tầng 1)',
        SoQuyenKhaDung: 6,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S006',
        TenSach: 'Rừng Na Uy',
        DonGia: 125000,
        SoQuyen: 4,
        NamXuatBan: 2022,
        MaNXB: 'NXB05',
        TacGia: 'Haruki Murakami',
        NguonGoc: 'Haruki Murakami',
        TheLoai: 'Văn học nước ngoài',
        MaTheLoai: 'TL03',
        ISBN: '978-604-0-10006-6',
        HinhAnh: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
        MoTa: 'Tác phẩm văn học nổi tiếng chạm đến những góc khuất tâm hồn của tuổi trẻ, sự cô đơn và tình yêu bất diệt.',
        ViTri: 'Kệ B1-02 (Tầng 1)',
        SoQuyenKhaDung: 4,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S007',
        TenSach: 'Không Gia Đình',
        DonGia: 110000,
        SoQuyen: 5,
        NamXuatBan: 2021,
        MaNXB: 'NXB04',
        TacGia: 'Hector Malot',
        NguonGoc: 'Hector Malot',
        TheLoai: 'Văn học nước ngoài',
        MaTheLoai: 'TL03',
        ISBN: '978-604-0-10007-3',
        HinhAnh: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
        MoTa: 'Câu chuyện cảm động về lòng kiên trì, tình bạn thủy chung và nghị lực phi thường của cậu bé Rémi mồ côi.',
        ViTri: 'Kệ B2-01 (Tầng 1)',
        SoQuyenKhaDung: 5,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S008',
        TenSach: 'Trăm Năm Cô Đơn',
        DonGia: 145000,
        SoQuyen: 3,
        NamXuatBan: 2022,
        MaNXB: 'NXB09',
        TacGia: 'Gabriel Garcia Marquez',
        NguonGoc: 'Gabriel Garcia Marquez',
        TheLoai: 'Văn học nước ngoài',
        MaTheLoai: 'TL03',
        ISBN: '978-604-0-10008-0',
        HinhAnh: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=400&q=80',
        MoTa: 'Đỉnh cao của chủ nghĩa hiện thực huyền ảo kể về bảy thế hệ dòng họ Buendía tại ngôi làng Macondo.',
        ViTri: 'Kệ B2-02 (Tầng 1)',
        SoQuyenKhaDung: 3,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S009',
        TenSach: 'Đắc Nhân Tâm',
        DonGia: 95000,
        SoQuyen: 7,
        NamXuatBan: 2023,
        MaNXB: 'NXB03',
        TacGia: 'Dale Carnegie',
        NguonGoc: 'Dale Carnegie',
        TheLoai: 'Tâm lý & Kỹ năng sống',
        MaTheLoai: 'TL06',
        ISBN: '978-604-0-10009-7',
        HinhAnh: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80',
        MoTa: 'Nghệ thuật thu phục lòng người, tạo dựng mối quan hệ tốt đẹp và dẫn dắt người khác bằng sự chân thành.',
        ViTri: 'Kệ C1-01 (Tầng 1)',
        SoQuyenKhaDung: 7,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S010',
        TenSach: 'Tâm Lý Học Về Tiền',
        DonGia: 135000,
        SoQuyen: 4,
        NamXuatBan: 2023,
        MaNXB: 'NXB03',
        TacGia: 'Morgan Housel',
        NguonGoc: 'Morgan Housel',
        TheLoai: 'Tâm lý & Kỹ năng sống',
        MaTheLoai: 'TL06',
        ISBN: '978-604-0-10010-3',
        HinhAnh: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
        MoTa: 'Những bài học đắt giá vượt thời gian về sự giàu có, lòng tham và hạnh phúc trong cách con người đưa ra quyết định tài chính.',
        ViTri: 'Kệ C1-02 (Tầng 1)',
        SoQuyenKhaDung: 4,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S011',
        TenSach: 'Tư Duy Nhanh Và Chậm',
        DonGia: 180000,
        SoQuyen: 4,
        NamXuatBan: 2022,
        MaNXB: 'NXB07',
        TacGia: 'Daniel Kahneman',
        NguonGoc: 'Daniel Kahneman',
        TheLoai: 'Tâm lý & Kỹ năng sống',
        MaTheLoai: 'TL06',
        ISBN: '978-604-0-10011-0',
        HinhAnh: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=400&q=80',
        MoTa: 'Khám phá hai hệ thống thúc đẩy cách chúng ta suy nghĩ và đưa ra các phán đoán hành vi hàng ngày.',
        ViTri: 'Kệ C2-01 (Tầng 1)',
        SoQuyenKhaDung: 4,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S012',
        TenSach: 'Khởi Nghiệp Tinh Gọn',
        DonGia: 120000,
        SoQuyen: 3,
        NamXuatBan: 2021,
        MaNXB: 'NXB06',
        TacGia: 'Eric Ries',
        NguonGoc: 'Eric Ries',
        TheLoai: 'Kinh tế & Quản trị',
        MaTheLoai: 'TL05',
        ISBN: '978-604-0-10012-7',
        HinhAnh: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=400&q=80',
        MoTa: 'Phương pháp đổi mới liên tục và thử nghiệm nhanh nhằm tối ưu hóa chi phí và xây dựng doanh nghiệp thành công bền vững.',
        ViTri: 'Kệ C2-02 (Tầng 1)',
        SoQuyenKhaDung: 3,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S013',
        TenSach: 'Lược Sử Loài Người - Sapiens',
        DonGia: 195000,
        SoQuyen: 5,
        NamXuatBan: 2022,
        MaNXB: 'NXB08',
        TacGia: 'Yuval Noah Harari',
        NguonGoc: 'Yuval Noah Harari',
        TheLoai: 'Khoa học & Đời sống',
        MaTheLoai: 'TL07',
        ISBN: '978-604-0-10013-4',
        HinhAnh: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=80',
        MoTa: 'Góc nhìn sâu sắc, toàn cảnh về tiến trình lịch sử sinh học và văn hóa đưa loài người từ sinh vật tầm thường lên đỉnh thống trị trái đất.',
        ViTri: 'Kệ D1-01 (Tầng 2)',
        SoQuyenKhaDung: 5,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S014',
        TenSach: 'Vũ Trụ Trong Vỏ Hạt Dẻ',
        DonGia: 155000,
        SoQuyen: 4,
        NamXuatBan: 2021,
        MaNXB: 'NXB03',
        TacGia: 'Stephen Hawking',
        NguonGoc: 'Stephen Hawking',
        TheLoai: 'Khoa học & Đời sống',
        MaTheLoai: 'TL07',
        ISBN: '978-604-0-10014-1',
        HinhAnh: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
        MoTa: 'Hành trình dẫn dắt độc giả khám phá các bí ẩn của thời gian, không gian đa chiều, lý thuyết dây và cơ học lượng tử.',
        ViTri: 'Kệ D1-02 (Tầng 2)',
        SoQuyenKhaDung: 4,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      },
      {
        MaSach: 'S015',
        TenSach: 'Lịch Sử Văn Minh Phương Tây',
        DonGia: 240000,
        SoQuyen: 3,
        NamXuatBan: 2023,
        MaNXB: 'NXB11',
        TacGia: 'Marvin Perry',
        NguonGoc: 'Marvin Perry',
        TheLoai: 'Lịch sử & Triết học',
        MaTheLoai: 'TL08',
        ISBN: '978-604-0-10015-8',
        HinhAnh: 'https://images.unsplash.com/photo-1447069387593-a5de07644a04?auto=format&fit=crop&w=400&q=80',
        MoTa: 'Khảo cứu công phu về cội nguồn, tư tưởng, nghệ thuật và sự phát triển thăng trầm của nền văn minh phương Tây.',
        ViTri: 'Kệ D2-01 (Tầng 2)',
        SoQuyenKhaDung: 3,
        SoQuyenDangMuon: 0,
        SoQuyenHuHong: 0,
        TrangThai: 'ACTIVE'
      }
    ];

    const insertedBooks = await Sach.insertMany(sampleBooks);
    console.log(`📖 Đã tạo ${insertedBooks.length} cuốn sách mẫu đa dạng thể loại và bìa minh họa.`);

    // 8. Tạo phiếu mượn mẫu đang hoạt động cho reader1 (S001)
    const activeBorrow = await TheoDoiMuonSach.create({
      MaDocGia: 'DG001',
      MaSach: 'S001',
      DocGiaId: reader1._id,
      SachId: insertedBooks[0]._id,
      TrangThai: 'BORROWED',
      NgayYeuCau: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      NgayHenLay: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      NgayMuon: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      HanTra: new Date(Date.now() + 12 * 24 * 3600 * 1000),
      SoLanGiaHan: 0,
      MSNVDuyet: 'NV002',
      NhanVienDuyetId: manager._id,
      GhiChu: 'Độc giả nhận sách trực tiếp tại quầy thư viện'
    });

    // 9. Tạo 1 biên bản bồi thường mẫu UNPAID cho reader2 (để test chặn mượn)
    await BienBanBoiThuong.create({
      MaBienBan: 'BB0001',
      MaTheoDoiMuon: activeBorrow._id.toString(),
      TheoDoiMuonId: activeBorrow._id,
      MaDocGia: 'DG002',
      DocGiaId: reader2._id,
      MaSach: 'S005',
      SachId: insertedBooks[4]._id,
      LoaiSuCo: 'DAMAGED',
      MoTa: 'Rách 12 trang phần giữa sách và ướt bìa sau',
      SoTienBoiThuong: 45000,
      TrangThai: 'UNPAID',
      NgayLap: new Date(),
      GhiChu: 'Biên bản lập tại quầy tiếp nhận'
    });

    // 10. Tạo Nhật ký hoạt động ban đầu (Audit Trail)
    await NhatKyHoatDong.create({
      ThoiGian: new Date(),
      HanhDong: 'SYSTEM_INIT',
      NguoiThucHien: {
        NhanVienId: admin._id,
        MSNV: 'NV001',
        HoTen: 'Quản Trị Viên Hệ Thống',
        ChucVu: 'ADMIN',
        DiaChiIP: '127.0.0.1',
        UserAgent: 'Seed Script'
      },
      DoiTuongTacDong: {
        Collection: 'CauHinhHeThong',
        DocumentId: admin._id,
        MaDinhDanh: 'SYSTEM'
      },
      ChiTiet: 'Khởi tạo dữ liệu mẫu và nạp danh mục thể loại, nhà xuất bản, đầu sách chuẩn hóa toàn hệ thống'
    });

    console.log('🎉 NẠP DỮ LIỆU MẪU BAN ĐẦU THÀNH CÔNG!');
    console.log('================================================================');
    console.log('👉 Tài khoản Admin:       admin@library.com   / Admin@123');
    console.log('👉 Tài khoản Thủ thư:     manager@library.com / Manager@123');
    console.log('👉 Tài khoản Độc giả 1:   reader1@gmail.com   / User@123 (Có 1 sách đang mượn)');
    console.log('👉 Tài khoản Độc giả 2:   reader2@gmail.com   / User@123 (Có biên bản phạt UNPAID)');
    console.log('================================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi nạp dữ liệu mẫu:', error);
    process.exit(1);
  }
}

seed();
