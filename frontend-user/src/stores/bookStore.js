import { defineStore } from 'pinia';
import api from '../services/api';

export const useBookStore = defineStore('book', {
  state: () => ({
    books: [],
    featuredBooks: [],
    currentBook: null,
    publishers: [],
    categories: [],
    genres: [],
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 1
    },
    filters: {
      search: '',
      theLoai: '',
      maNXB: '',
      availableOnly: false,
      sort: 'createdAt',
      order: 'desc'
    },
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
        console.error('Không thể tải danh sách thể loại:', err);
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
          availableOnly: this.filters.availableOnly ? 'true' : undefined,
          sort: this.filters.sort || undefined,
          order: this.filters.order || undefined
        };

        const response = await api.get('/books', { params });
        this.books = response.data.data;
        if (response.data.meta?.pagination) {
          this.pagination = response.data.meta.pagination;
        }
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không thể tải danh mục sách.';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchFeaturedBooks() {
      try {
        const response = await api.get('/books', { params: { limit: 8, sort: 'createdAt', order: 'desc' } });
        this.featuredBooks = response.data.data;
      } catch (err) {
        console.error('Không thể tải danh sách sách nổi bật:', err);
      }
    },

    async fetchBookById(id) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get(`/books/${id}`);
        this.currentBook = response.data.data;
        return this.currentBook;
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Không tìm thấy ấn phẩm yêu cầu.';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPublishers() {
      try {
        const response = await api.get('/publishers');
        this.publishers = response.data.data;
      } catch (err) {
        console.error('Không thể tải danh sách nhà xuất bản:', err);
      }
    },

    setFilter(key, value) {
      this.filters[key] = value;
      this.fetchBooks(1);
    },

    resetFilters() {
      this.filters = {
        search: '',
        theLoai: '',
        maNXB: '',
        availableOnly: false,
        sort: 'createdAt',
        order: 'desc'
      };
      this.fetchBooks(1);
    }
  }
});
