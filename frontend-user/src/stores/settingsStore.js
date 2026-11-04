import { defineStore } from 'pinia';
import api from '../services/api';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {
      maxBooksPerReader: 3,
      standardBorrowDays: 14,
      pickupHoldHours: 48,
      renewExtensionDays: 7,
      maxRenewCount: 1,
      blacklistAfterOverdueDays: 15
    },
    isLoading: false,
    isLoaded: false,
    error: null
  }),

  getters: {
    maxBooks: (state) => state.settings.maxBooksPerReader || 3,
    borrowDays: (state) => state.settings.standardBorrowDays || 14,
    holdHours: (state) => state.settings.pickupHoldHours || 48,
    renewDays: (state) => state.settings.renewExtensionDays || 7,
    maxRenew: (state) => state.settings.maxRenewCount ?? 1,
    blacklistDays: (state) => state.settings.blacklistAfterOverdueDays || 15
  },

  actions: {
    async fetchSettings() {
      this.isLoading = true;
      try {
        const response = await api.get('/settings');
        if (response.data?.data) {
          Object.assign(this.settings, response.data.data);
          this.isLoaded = true;
        }
      } catch (err) {
        console.warn('Không thể tải cấu hình quy chế từ máy chủ, áp dụng quy chuẩn mặc định:', err.message);
      } finally {
        this.isLoading = false;
      }
    }
  }
});

