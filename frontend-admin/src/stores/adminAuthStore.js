import { defineStore } from 'pinia';
import api from '../services/api';

/**
 * Chuẩn hóa đối tượng thông tin người dùng quản trị / nhân viên sang camelCase chuẩn JavaScript
 * Đồng thời duy trì các thuộc tính PascalCase để đảm bảo backward compatibility tuyệt đối.
 */
export const normalizeAdminUser = (user) => {
  if (!user) return null;
  const role = user.role || user.Role || user.chucVu || user.ChucVu || '';
  const msnv = user.msnv || user.MSNV || user.maDocGia || user.MaDocGia || '';
  const email = user.email || user.Email || '';
  const hoLot = user.hoLot || user.HoLot || '';
  const ten = user.ten || user.Ten || '';
  const hoTenNV =
    user.hoTenNV ||
    user.HoTenNV ||
    user.hoTen ||
    user.HoTen ||
    `${hoLot} ${ten}`.trim() ||
    email;
  const diaChi = user.diaChi || user.DiaChi || '';
  const soDienThoai =
    user.soDienThoai ||
    user.SoDienThoai ||
    user.dienThoai ||
    user.DienThoai ||
    '';
  const avatar = user.avatar || user.hinhAnh || user.HinhAnh || '';

  return {
    ...user,
    _id: user._id || user.id,
    id: user.id || user._id,
    role,
    Role: role,
    msnv,
    MSNV: msnv,
    email,
    Email: email,
    hoTenNV,
    HoTenNV: hoTenNV,
    diaChi,
    DiaChi: diaChi,
    soDienThoai,
    SoDienThoai: soDienThoai,
    avatar,
    hinhAnh: avatar,
    HinhAnh: avatar
  };
};

export const useAdminAuthStore = defineStore('adminAuth', {
  state: () => ({
    adminUser: normalizeAdminUser(JSON.parse(localStorage.getItem('adminUser') || 'null')),
    adminAccessToken: localStorage.getItem('adminAccessToken') || null,
    adminRefreshToken: localStorage.getItem('adminRefreshToken') || null,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.adminAccessToken && !!state.adminUser,
    role: (state) => state.adminUser?.role || state.adminUser?.Role || '',
    isAdmin: (state) => (state.adminUser?.role || state.adminUser?.Role) === 'ADMIN',
    isBookManager: (state) => (state.adminUser?.role || state.adminUser?.Role) === 'BOOK_MANAGER',
    isStaff: (state) => ['ADMIN', 'BOOK_MANAGER'].includes(state.adminUser?.role || state.adminUser?.Role),
    staffName: (state) => {
      if (!state.adminUser) return '';
      return (
        state.adminUser.hoTenNV ||
        state.adminUser.HoTenNV ||
        `${state.adminUser.hoLot || state.adminUser.HoLot || ''} ${state.adminUser.ten || state.adminUser.Ten || ''}`.trim() ||
        state.adminUser.email ||
        state.adminUser.Email ||
        ''
      );
    },
    roleTitle: (state) => {
      const r = state.adminUser?.role || state.adminUser?.Role;
      if (r === 'ADMIN') return 'Quản trị viên Hệ thống';
      if (r === 'BOOK_MANAGER') return 'Thủ thư / Quản lý sách';
      return 'Nhân viên Thư viện';
    }
  },

  actions: {
    setAuth(user, accessToken, refreshToken) {
      const normalizedUser = normalizeAdminUser(user);
      this.adminUser = normalizedUser;
      this.adminAccessToken = accessToken;
      this.adminRefreshToken = refreshToken;

      localStorage.setItem('adminUser', JSON.stringify(normalizedUser));
      localStorage.setItem('adminAccessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('adminRefreshToken', refreshToken);
      }
    },

    async login(credentials) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/admin/login', credentials);
        const { user, accessToken, refreshToken } = response.data.data;

        // Chuẩn hóa role — backend trả về cả `role` lẫn `Role`
        const userRole = user.role || user.Role || '';

        // Kiểm tra phân quyền: Tuyệt đối không cho phép độc giả thông thường (USER) đăng nhập Admin Portal
        if (userRole === 'USER' || userRole === '') {
          throw new Error('Tài khoản này không có quyền truy cập cổng quản trị.');
        }

        const normalizedUser = normalizeAdminUser(user);
        this.setAuth(normalizedUser, accessToken, refreshToken);
        return { success: true };
      } catch (err) {
        this.error = err.response?.data?.error?.message || err.message || 'Không thể đăng nhập lúc này. Vui lòng thử lại sau.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      try {
        if (this.adminRefreshToken) {
          await api.post('/auth/logout', { refreshToken: this.adminRefreshToken });
        }
      } catch (err) {
        console.warn('Lỗi khi đăng xuất trên server:', err.message);
      } finally {
        this.adminUser = null;
        this.adminAccessToken = null;
        this.adminRefreshToken = null;
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
      }
    }
  }
});
