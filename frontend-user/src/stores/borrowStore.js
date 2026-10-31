import { defineStore } from 'pinia';
import api from '../services/api';

export const useBorrowStore = defineStore('borrow', {
  state: () => ({
    myBorrows: [],
    myFines: [],
    isLoading: false,
    error: null
  }),

  getters: {
    activeBorrows: (state) => state.myBorrows.filter((b) => b.TrangThai === 'BORROWED'),
    pendingBorrows: (state) => state.myBorrows.filter((b) => ['PENDING', 'APPROVED'].includes(b.TrangThai)),
    historyBorrows: (state) => state.myBorrows.filter((b) => ['RETURNED', 'CANCELLED', 'OVERDUE', 'EXPIRED', 'REJECTED'].includes(b.TrangThai)),
    activeBorrowCount: (state) => state.myBorrows.filter((b) => b.TrangThai === 'BORROWED').length,
    pendingBorrowCount: (state) => state.myBorrows.filter((b) => ['PENDING', 'APPROVED'].includes(b.TrangThai)).length,
    unpaidFines: (state) => state.myFines.filter((f) => f.TrangThai === 'UNPAID'),
    totalUnpaidFineAmount: (state) => {
      return state.myFines
        .filter((f) => f.TrangThai === 'UNPAID')
        .reduce((sum, f) => sum + (f.SoTienBoiThuong || f.SoTienPhat || 0), 0);
    }
  },

  actions: {
    async fetchMyBorrows(status = null) {
      this.isLoading = true;
      this.error = null;
      try {
        const params = status ? { status } : {};
        const response = await api.get('/borrows/my-borrows', { params });
        this.myBorrows = response.data.data || [];
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể tải danh sách phiếu mượn.';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchMyFines() {
      try {
        const response = await api.get('/fines/my-fines');
        this.myFines = response.data.data || [];
      } catch (err) {
        console.error('Không thể tải danh sách biên bản bồi thường:', err);
      }
    },

    async requestBorrow(sachId, ngayHenLay) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post('/borrows', { sachId, ngayHenLay });
        await this.fetchMyBorrows();
        return { success: true, message: response.data.message };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Yêu cầu mượn sách không thành công.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async cancelBorrow(borrowId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/borrows/${borrowId}/cancel`);
        await this.fetchMyBorrows();
        return { success: true, message: response.data.message };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể hủy yêu cầu mượn.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async renewBorrow(borrowId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/borrows/${borrowId}/renew`);
        await this.fetchMyBorrows();
        return { success: true, message: response.data.message };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể gia hạn thời gian mượn.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    }
  }
});
