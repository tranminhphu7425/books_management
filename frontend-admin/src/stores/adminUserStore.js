import { defineStore } from 'pinia';
import api from '../services/api';

/**
 * Chuẩn hóa đối tượng người dùng / độc giả / nhân viên sang camelCase chuẩn JavaScript
 * Giữ nguyên các alias PascalCase để bảo toàn khả năng tương thích.
 */
export const normalizeUser = (u) => {
  if (!u) return u;
  const role = u.role || u.Role || u.chucVu || u.ChucVu || 'USER';
  const msnv = u.msnv || u.MSNV || '';
  const maDocGia = u.maDocGia || u.MaDocGia || '';
  const hoLot = u.hoLot || u.HoLot || '';
  const ten = u.ten || u.Ten || '';
  const hoTen = u.hoTen || u.HoTen || u.hoTenNV || u.HoTenNV || `${hoLot} ${ten}`.trim();
  const hoTenNV = u.hoTenNV || u.HoTenNV || hoTen;
  const email = u.email || u.Email || '';
  const soDienThoai = u.soDienThoai || u.SoDienThoai || u.dienThoai || u.DienThoai || '';
  const diaChi = u.diaChi || u.DiaChi || '';
  const phai = u.phai || u.Phai || u.gioiTinh || u.GioiTinh || '';
  const ngaySinh = u.ngaySinh || u.NgaySinh || '';
  const isBlacklisted = !!(
    (u.trangThai || u.TrangThai) === 'BLACKLISTED' ||
    u.isBlacklisted ||
    u.IsBlacklisted ||
    u.daBiKhoa ||
    u.DaBiKhoa
  );
  const trangThai = isBlacklisted ? 'BLACKLISTED' : (u.trangThai || u.TrangThai || 'ACTIVE');
  const lyDoKhoa = u.lyDoKhoa || u.LyDoKhoa || '';
  const ngayKhoa = u.ngayKhoa || u.NgayKhoa || '';
  const avatar = u.avatar || u.hinhAnh || u.HinhAnh || '';

  return {
    ...u,
    _id: u._id || u.id,
    id: u.id || u._id,
    role,
    Role: role,
    msnv,
    MSNV: msnv,
    maDocGia,
    MaDocGia: maDocGia,
    hoLot,
    HoLot: hoLot,
    ten,
    Ten: ten,
    hoTen,
    HoTen: hoTen,
    hoTenNV,
    HoTenNV: hoTenNV,
    email,
    Email: email,
    soDienThoai,
    SoDienThoai: soDienThoai,
    dienThoai: soDienThoai,
    DienThoai: soDienThoai,
    diaChi,
    DiaChi: diaChi,
    phai,
    Phai: phai,
    ngaySinh,
    NgaySinh: ngaySinh,
    trangThai,
    TrangThai: trangThai,
    isBlacklisted,
    IsBlacklisted: isBlacklisted,
    daBiKhoa: isBlacklisted,
    DaBiKhoa: isBlacklisted,
    lyDoKhoa,
    LyDoKhoa: lyDoKhoa,
    ngayKhoa,
    NgayKhoa: ngayKhoa,
    avatar,
    hinhAnh: avatar,
    HinhAnh: avatar
  };
};

export const useAdminUserStore = defineStore('adminUser', {
  state: () => ({
    users: [],
    isLoading: false,
    error: null
  }),

  getters: {
    readers: (state) =>
      state.users.filter(
        (u) =>
          (u.role || u.Role) === 'USER' ||
          (!(u.msnv || u.MSNV) && ['USER', ''].includes(u.role || u.Role || u.chucVu || u.ChucVu || ''))
      ),
    staffs: (state) =>
      state.users.filter(
        (u) =>
          ['ADMIN', 'BOOK_MANAGER'].includes(u.role || u.Role || u.chucVu || u.ChucVu) ||
          !!(u.msnv || u.MSNV)
      ),
    blacklistedUsers: (state) =>
      state.users.filter(
        (u) =>
          (u.trangThai || u.TrangThai) === 'BLACKLISTED' ||
          u.isBlacklisted ||
          u.IsBlacklisted ||
          u.daBiKhoa ||
          u.DaBiKhoa
      )
  },

  actions: {
    async fetchUsers(role = '') {
      this.isLoading = true;
      this.error = null;
      try {
        const params = role ? { role } : {};
        const response = await api.get('/users', { params });
        const list = Array.isArray(response.data.data) ? response.data.data : [];
        this.users = list.map(normalizeUser);
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể tải danh sách tài khoản.';
      } finally {
        this.isLoading = false;
      }
    },

    async createStaff(staffData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post('/users', staffData);
        await this.fetchUsers();
        return { success: true, message: response.data.message || 'Thêm mới nhân viên thành công!' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể thêm mới nhân viên.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async updateStaff(id, staffData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/users/${id}`, staffData);
        await this.fetchUsers();
        return { success: true, message: response.data.message || 'Cập nhật thông tin nhân viên thành công!' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể cập nhật thông tin nhân viên.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async updateRole(id, newRole) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/users/${id}/role`, { role: newRole });
        await this.fetchUsers();
        return { success: true, message: response.data.message || 'Cập nhật phân quyền người dùng thành công!' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể cập nhật quyền người dùng.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async toggleBlacklist(id, { isBlacklisted, reason }) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/users/${id}/blacklist`, { isBlacklisted, reason });
        await this.fetchUsers();
        return { success: true, message: response.data.message || 'Đã cập nhật trạng thái vi phạm (Blacklist) thành công!' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể cập nhật danh sách vi phạm.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    }
  }
});
