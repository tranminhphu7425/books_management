import { defineStore } from 'pinia';
import api from '../services/api';

export const useAdminBorrowStore = defineStore('adminBorrow', {
  state: () => ({
    borrows: [],
    isLoading: false,
    error: null
  }),

  getters: {
    pendingBorrows: (state) => state.borrows.filter((b) => b.TrangThai === 'PENDING'),
    approvedBorrows: (state) => state.borrows.filter((b) => b.TrangThai === 'APPROVED'),
    activeBorrows: (state) => state.borrows.filter((b) => b.TrangThai === 'BORROWED'),
    overdueBorrows: (state) => {
      const now = new Date();
      return state.borrows.filter(
        (b) => b.TrangThai === 'BORROWED' && (b.HanTra || b.NgayTra) && new Date(b.HanTra || b.NgayTra) < now
      );
    },
    returnedBorrows: (state) => state.borrows.filter((b) => ['RETURNED', 'CANCELLED'].includes(b.TrangThai))
  },

  actions: {
    async fetchBorrows(status = '') {
      this.isLoading = true;
      this.error = null;
      try {
        const params = status ? { status } : {};
        const response = await api.get('/borrows', { params });
        this.borrows = response.data.data;
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể tải danh sách phiếu mượn.';
      } finally {
        this.isLoading = false;
      }
    },

    async approveBorrow(id) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/borrows/${id}/approve`);
        await this.fetchBorrows();
        return { success: true, message: response.data.message || 'Đã duyệt yêu cầu mượn! Giữ sách trong 48h.' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể duyệt đơn mượn.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async rejectBorrow(id, lyDo) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/borrows/${id}/reject`, { lyDo });
        await this.fetchBorrows();
        return { success: true, message: response.data.message || 'Đã từ chối đơn mượn.' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể từ chối đơn mượn.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async checkoutBorrow(id) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/borrows/${id}/checkout`);
        await this.fetchBorrows();
        return { success: true, message: response.data.message || 'Đã xuất sách cho bạn đọc mang về! Hạn trả 14 ngày.' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể xuất sách.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async checkinBorrow(id) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/borrows/${id}/checkin`);
        await this.fetchBorrows();
        return { success: true, message: response.data.message || 'Nhận trả sách thành công! Sách đã sẵn sàng trên kệ.' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể nhận trả sách.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async reportDamageOrLost(payload) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post('/fines', payload);
        await this.fetchBorrows();
        return { success: true, message: response.data.message || 'Đã lập biên bản sự cố và cập nhật kho sách thành công!' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể lập biên bản sự cố.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    }
  }
});
