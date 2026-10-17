import { defineStore } from 'pinia';
import api from '../services/api';

export const useAdminBookStore = defineStore('adminBook', {
  state: () => ({
    books: [],
    publishers: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1
    },
    filters: {
      search: '',
      theLoai: '',
      maNXB: '',
      status: 'ACTIVE'
    },
    categories: [],
    genres: [],
    isLoading: false,
    error: null
  }),

  actions: {
    async fetchCategories() {
      try {
        const response = await api.get('/categories');
        this.categories = response.data.data;
        this.genres = this.categories.map((c) => c.TenTheLoai);
      } catch (err) {
        console.error('Lỗi khi tải danh mục thể loại:', err);
      }
    },
    async fetchBooks(page = 1) {
      this.isLoading = true;
      this.error = null;
      try {
        const params = {
          page,
          limit: this.pagination.limit,
          search: this.filters.search || undefined,
          theLoai: this.filters.theLoai || undefined,
          maNXB: this.filters.maNXB || undefined,
          status: this.filters.status || undefined
        };

        const response = await api.get('/books', { params });
        this.books = response.data.data;
        if (response.data.meta?.pagination) {
          const p = response.data.meta.pagination;
          this.pagination = {
            ...p,
            total: p.totalRecords ?? p.total ?? 0
          };
        }
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể tải danh mục sách.';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPublishers() {
      try {
        const response = await api.get('/publishers');
        this.publishers = response.data.data;
      } catch (err) {
        console.error('Lỗi khi tải danh sách NXB:', err);
      }
    },
    async createPublisher(publisherData) {
      try {
        const response = await api.post('/publishers', publisherData);
        await this.fetchPublishers();
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Thêm nhà xuất bản mới thành công!'
        };
      } catch (err) {
        const error = err.response?.data?.error?.message || err.response?.data?.message || 'Không thể tạo nhà xuất bản mới.';
        return { success: false, error };
      }
    },
    async deletePublisher(id) {
      try {
        const response = await api.delete(`/publishers/${id}`);
        await this.fetchPublishers();
        return {
          success: true,
          message: response.data.message || 'Đã xóa Nhà xuất bản thành công!'
        };
      } catch (err) {
        const error = err.response?.data?.error?.message || err.response?.data?.message || 'Không thể xóa Nhà xuất bản.';
        return { success: false, error };
      }
    },
    async uploadCover(file) {
      try {
        const formData = new FormData();
        formData.append('cover', file);
        const response = await api.post('/upload/cover', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return { success: true, data: response.data.data, message: response.data.message || 'Tải lên ảnh bìa thành công!' };
      } catch (err) {
        const error = err.response?.data?.error?.message || err.response?.data?.message || 'Không thể tải lên ảnh bìa sách.';
        return { success: false, error };
      }
    },

    async createBook(bookData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.post('/books', bookData);
        await this.fetchBooks(1);
        return { success: true, message: response.data.message || 'Thêm mới ấn phẩm thành công!' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể thêm sách mới.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async updateBook(id, bookData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.put(`/books/${id}`, bookData);
        await this.fetchBooks(this.pagination.page);
        return { success: true, message: response.data.message || 'Cập nhật ấn phẩm thành công!' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể cập nhật thông tin ấn phẩm.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async deleteBook(id) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.delete(`/books/${id}`);
        await this.fetchBooks(this.pagination.page);
        return { success: true, message: response.data.message || 'Đã lưu trữ (Soft Delete) ấn phẩm thành công!' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể xóa ấn phẩm.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    },

    async restoreBook(id) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.patch(`/books/${id}/restore`);
        await this.fetchBooks(this.pagination.page);
        return { success: true, message: response.data.message || 'Khôi phục ấn phẩm thành công!' };
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể khôi phục ấn phẩm.';
        return { success: false, error: this.error };
      } finally {
        this.isLoading = false;
      }
    }
  }
});
