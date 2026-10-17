import { defineStore } from 'pinia';
import api from '../services/api';

export const useAdminStatsStore = defineStore('adminStats', {
  state: () => ({
    summary: {
      totalBooks: 0,
      activeReaders: 0,
      currentlyBorrowed: 0,
      overdueBooks: 0,
      genreStats: [],
      borrowTrend: []
    },
    topBooks: [],
    auditLogs: [],
    isLoading: false,
    error: null
  }),

  actions: {
    async fetchSummary() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get('/stats/summary');
        this.summary = response.data.data;
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể tải số liệu thống kê tổng quan.';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchTopBooks() {
      try {
        const response = await api.get('/stats/top-books');
        this.topBooks = response.data.data;
      } catch (err) {
        console.error('Không thể tải Top sách mượn nhiều nhất:', err);
      }
    },

    async fetchAuditLogs(params = {}) {
      this.isLoading = true;
      try {
        const response = await api.get('/stats/audit-logs', { params });
        this.auditLogs = response.data.data;
      } catch (err) {
        console.error('Không thể tải nhật ký kiểm toán tác nghiệp:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async exportBorrowsCSV() {
      try {
        const response = await api.get('/stats/export/borrows', { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `BaoCao_MuonTra_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return { success: true };
      } catch (err) {
        console.error('Lỗi xuất báo cáo mượn trả:', err);
        return { success: false, error: 'Không thể xuất file báo cáo mượn trả.' };
      }
    },

    async exportFinesCSV() {
      try {
        const response = await api.get('/stats/export/fines', { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `BaoCao_BoiThuong_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return { success: true };
      } catch (err) {
        console.error('Lỗi xuất báo cáo bồi thường:', err);
        return { success: false, error: 'Không thể xuất file báo cáo bồi thường.' };
      }
    }
  }
});
