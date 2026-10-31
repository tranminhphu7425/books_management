import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
    fullName: (state) => {
      if (!state.user) return '';
      // Ưu tiên `hoTen` (field backend trả về), fallback về ghép HoLot + Ten
      return state.user.hoTen || `${state.user.HoLot || ''} ${state.user.Ten || ''}`.trim() || state.user.email || state.user.Email;
    },
    userRole: (state) => state.user?.role || state.user?.Role || 'USER'
  },

  actions: {
    setAuthData(user, accessToken, refreshToken) {
      this.user = user;
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    },

    async login(credentials) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/reader/login', credentials);
        const { user, accessToken, refreshToken } = response.data.data;
        this.setAuthData(user, accessToken, refreshToken);
        return { success: true, message: response.data.message };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async register(formData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/register', formData);
        const { user, accessToken, refreshToken } = response.data.data;
        this.setAuthData(user, accessToken, refreshToken);
        return { success: true, message: response.data.message };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Đăng ký tài khoản không thành công.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async googleLogin(credential) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/google', {
          credential,
          idToken: credential
        });
        const { user, accessToken, refreshToken } = response.data.data;
        this.setAuthData(user, accessToken, refreshToken);
        return { success: true, message: response.data.message || 'Đăng nhập Google thành công!' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Đăng ký / Đăng nhập qua Google không thành công.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCurrentUser() {
      if (!this.accessToken) return;
      try {
        const response = await api.get('/auth/me');
        this.user = response.data.data.user || response.data.data;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (err) {
        console.error('Không thể cập nhật hồ sơ người dùng:', err);
      }
    },

    async updateProfile(profileData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put('/auth/profile', profileData);
        this.user = response.data.data;
        localStorage.setItem('user', JSON.stringify(this.user));
        return { success: true, message: response.data.message || 'Cập nhật thông tin thành công!' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể cập nhật thông tin cá nhân.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async uploadAvatar(file) {
      this.isLoading = true;
      this.error = null;
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await api.post('/upload/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const url = response.data.data.url;
        if (this.user) {
          this.user.HinhAnh = url;
          localStorage.setItem('user', JSON.stringify(this.user));
        }
        return { success: true, url, message: response.data.message || 'Tải lên ảnh đại diện thành công!' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || err.response?.data?.message || 'Không thể tải lên ảnh đại diện.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async changePassword(passwordData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put('/auth/change-password', passwordData);
        return { success: true, message: response.data.message || 'Đổi mật khẩu thành công!' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      try {
        if (this.refreshToken) {
          await api.post('/auth/logout', { refreshToken: this.refreshToken });
        }
      } catch (err) {
        console.warn('Lỗi khi đăng xuất trên server:', err.message);
      } finally {
        this.user = null;
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  }
});
