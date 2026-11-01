import { defineStore } from 'pinia';
import api from '../services/api';

export const useAdminUserStore = defineStore('adminUser', {
  state: () => ({
    users: [],
    isLoading: false,
    error: null
  }),

  getters: {
    readers: (state) => state.users.filter((u) => u.Role === 'USER' || (!u.MSNV && (u.ChucVu === 'USER' || !u.ChucVu))),
    staffs: (state) => state.users.filter((u) => ['ADMIN', 'BOOK_MANAGER'].includes(u.Role || u.ChucVu) || !!u.MSNV),
    blacklistedUsers: (state) => state.users.filter((u) => u.TrangThai === 'BLACKLISTED' || u.IsBlacklisted || u.DaBiKhoa)
  },

  actions: {
    async fetchUsers(role = '') {
      this.isLoading = true;
      this.error = null;
      try {
        const params = role ? { role } : {};
        const response = await api.get('/users', { params });
        this.users = response.data.data;
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
