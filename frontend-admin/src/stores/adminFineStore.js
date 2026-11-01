import { defineStore } from 'pinia';
import api from '../services/api';

export const useAdminFineStore = defineStore('adminFine', {
  state: () => ({
    fines: [],
    isLoading: false,
    error: null
  }),

  getters: {
    unpaidFines: (state) => state.fines.filter((f) => f.TrangThai === 'UNPAID'),
    paidFines: (state) => state.fines.filter((f) => f.TrangThai === 'PAID'),
    totalUnpaidAmount: (state) => {
      return state.fines
        .filter((f) => f.TrangThai === 'UNPAID')
        .reduce((sum, f) => sum + (f.SoTienBoiThuong || f.SoTienPhat || 0), 0);
    },
    totalCollectedAmount: (state) => {
      return state.fines
        .filter((f) => f.TrangThai === 'PAID')
        .reduce((sum, f) => sum + (f.SoTienBoiThuong || f.SoTienPhat || 0), 0);
    }
  },

  actions: {
    async fetchFines() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get('/fines');
        this.fines = response.data.data;
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể tải danh sách biên bản bồi thường.';
      } finally {
        this.isLoading = false;
      }
    },

    async payFine(id) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/fines/${id}/pay`);
        await this.fetchFines();
        return { success: true, message: response.data.message || 'Xác nhận thu tiền tại quầy thành công! Quyền mượn sách đã được mở lại cho bạn đọc.' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể xác nhận thu tiền.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    }
  }
});
