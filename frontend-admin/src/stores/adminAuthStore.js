import { defineStore } from 'pinia';
import api from '../services/api';

export const useAdminAuthStore = defineStore('adminAuth', {
  state: () => ({
    adminUser: JSON.parse(localStorage.getItem('adminUser') || 'null'),
    adminAccessToken: localStorage.getItem('adminAccessToken') || null,
    adminRefreshToken: localStorage.getItem('adminRefreshToken') || null,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.adminAccessToken && !!state.adminUser,
    role: (state) => state.adminUser?.Role || '',
    isAdmin: (state) => state.adminUser?.Role === 'ADMIN',
    isBookManager: (state) => state.adminUser?.Role === 'BOOK_MANAGER',
    isStaff: (state) => ['ADMIN', 'BOOK_MANAGER'].includes(state.adminUser?.Role),
    staffName: (state) => {
      if (!state.adminUser) return '';
      return state.adminUser.HoTenNV || `${state.adminUser.HoLot || ''} ${state.adminUser.Ten || ''}`.trim() || state.adminUser.Email;
    },
    roleTitle: (state) => {
      if (state.adminUser?.Role === 'ADMIN') return 'Quản trị viên Hệ thống';
      if (state.adminUser?.Role === 'BOOK_MANAGER') return 'Thủ thư / Quản lý sách';
      return 'Nhân viên Thư viện';
    }
  },

  actions: {
    setAuth(user, accessToken, refreshToken) {
      this.adminUser = user;
      this.adminAccessToken = accessToken;
      this.adminRefreshToken = refreshToken;

      localStorage.setItem('adminUser', JSON.stringify(user));
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
        const userRole = user.Role || user.role || '';

        // Kiểm tra phân quyền: Tuyệt đối không cho phép độc giả thông thường (USER) đăng nhập Admin Portal
        if (userRole === 'USER' || userRole === '') {
          throw new Error('Tài khoản độc giả không có thẩm quyền truy cập Cổng Quản Trị & Thủ Thư.');
        }

        // Chuẩn hóa user object để đảm bảo luôn có trường `Role` (PascalCase)
        const normalizedUser = { ...user, Role: userRole };
        this.setAuth(normalizedUser, accessToken, refreshToken);
        return { success: true };
      } catch (err) {
        this.error = err.response?.data?.error?.message || err.message || 'Đăng nhập cổng quản trị thất bại.';
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
