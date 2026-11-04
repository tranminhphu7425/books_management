import { defineStore } from 'pinia';
import api from '../services/api';

/**
 * Chuẩn hóa đối tượng ấn phẩm sang camelCase chuẩn JavaScript
 */
export const normalizeBook = (b) => {
  if (!b) return b;
  const maSach = b.maSach || b.MaSach || '';
  const tenSach = b.tenSach || b.TenSach || '';
  const tacGia = b.tacGia || b.TacGia || b.nguonGoc || b.NguonGoc || '';
  const theLoai = b.theLoai || b.TheLoai || '';
  const donGia = Number(b.donGia ?? b.DonGia ?? 0);
  const soQuyen = Number(b.soQuyen ?? b.SoQuyen ?? 0);
  const soQuyenDangMuon = Number(b.soQuyenDangMuon ?? b.SoQuyenDangMuon ?? 0);
  const soQuyenHuHong = Number(b.soQuyenHuHong ?? b.SoQuyenHuHong ?? 0);
  const soQuyenKhaDung = Number(
    b.soQuyenKhaDung ?? b.SoQuyenKhaDung ?? Math.max(0, soQuyen - soQuyenDangMuon - soQuyenHuHong)
  );
  const namXuatBan = Number(b.namXuatBan || b.NamXuatBan || new Date().getFullYear());
  const maNXB = b.maNXB || b.MaNXB || (b.nxb?.MaNXB || b.nxb?.maNXB || '');
  const tenNXB = b.tenNXB || b.TenNXB || b.nxb?.TenNXB || b.nxb?.tenNXB || '';
  const viTri = b.viTri || b.ViTri || '';
  const moTa = b.moTa || b.MoTa || '';
  const isbn = b.isbn || b.ISBN || '';
  const hinhAnh = b.hinhAnh || b.HinhAnh || '';
  const trangThai = b.trangThai || b.TrangThai || (b.isDeleted ? 'ARCHIVED' : 'ACTIVE');

  return {
    ...b,
    _id: b._id || b.id,
    id: b.id || b._id,
    maSach,
    MaSach: maSach,
    tenSach,
    TenSach: tenSach,
    tacGia,
    TacGia: tacGia,
    nguonGoc: tacGia,
    NguonGoc: tacGia,
    theLoai,
    TheLoai: theLoai,
    donGia,
    DonGia: donGia,
    soQuyen,
    SoQuyen: soQuyen,
    soQuyenKhaDung,
    SoQuyenKhaDung: soQuyenKhaDung,
    soQuyenDangMuon,
    SoQuyenDangMuon: soQuyenDangMuon,
    soQuyenHuHong,
    SoQuyenHuHong: soQuyenHuHong,
    namXuatBan,
    NamXuatBan: namXuatBan,
    maNXB,
    MaNXB: maNXB,
    tenNXB,
    TenNXB: tenNXB,
    viTri,
    ViTri: viTri,
    moTa,
    MoTa: moTa,
    isbn,
    ISBN: isbn,
    hinhAnh,
    HinhAnh: hinhAnh,
    trangThai,
    TrangThai: trangThai
  };
};

/**
 * Chuẩn hóa đối tượng Nhà xuất bản sang camelCase chuẩn JavaScript
 */
export const normalizePublisher = (p) => {
  if (!p) return p;
  const maNXB = p.maNXB || p.MaNXB || '';
  const tenNXB = p.tenNXB || p.TenNXB || '';
  const diaChi = p.diaChi || p.DiaChi || '';
  const email = p.email || p.Email || '';
  const dienThoai = p.dienThoai || p.DienThoai || '';

  return {
    ...p,
    _id: p._id || p.id,
    id: p.id || p._id,
    maNXB,
    MaNXB: maNXB,
    tenNXB,
    TenNXB: tenNXB,
    diaChi,
    DiaChi: diaChi,
    email,
    Email: email,
    dienThoai,
    DienThoai: dienThoai
  };
};

/**
 * Chuẩn hóa đối tượng Thể loại sang camelCase chuẩn JavaScript
 */
export const normalizeCategory = (c) => {
  if (!c) return c;
  const maTheLoai = c.maTheLoai || c.MaTheLoai || '';
  const tenTheLoai = c.tenTheLoai || c.TenTheLoai || '';
  const moTa = c.moTa || c.MoTa || '';
  const trangThai = c.trangThai || c.TrangThai || 'ACTIVE';

  return {
    ...c,
    _id: c._id || c.id,
    id: c.id || c._id,
    maTheLoai,
    MaTheLoai: maTheLoai,
    tenTheLoai,
    TenTheLoai: tenTheLoai,
    moTa,
    MoTa: moTa,
    trangThai,
    TrangThai: trangThai
  };
};

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
      status: 'ACTIVE',
      sort: 'MaSach',
      order: 'asc'
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
        const list = Array.isArray(response.data.data) ? response.data.data : [];
        this.categories = list.map(normalizeCategory);
        this.genres = this.categories.map((c) => c.tenTheLoai);
      } catch (err) {
        console.error('Lỗi khi tải danh mục thể loại:', err);
      }
    },
    async createCategory(categoryData) {
      try {
        const response = await api.post('/categories', categoryData);
        await this.fetchCategories();
        return {
          success: true,
          data: normalizeCategory(response.data.data),
          message: response.data.message || 'Thêm thể loại mới thành công!'
        };
      } catch (err) {
        const error = err.response?.data?.error?.message || err.response?.data?.message || 'Không thể tạo thể loại mới.';
        return { success: false, error };
      }
    },
    async updateCategory(id, categoryData) {
      try {
        const response = await api.put(`/categories/${id}`, categoryData);
        await this.fetchCategories();
        return {
          success: true,
          data: normalizeCategory(response.data.data),
          message: response.data.message || 'Cập nhật thể loại thành công!'
        };
      } catch (err) {
        const error = err.response?.data?.error?.message || err.response?.data?.message || 'Không thể cập nhật thể loại.';
        return { success: false, error };
      }
    },
    async deleteCategory(id) {
      try {
        const response = await api.delete(`/categories/${id}`);
        await this.fetchCategories();
        return {
          success: true,
          message: response.data.message || 'Đã xóa thể loại thành công!'
        };
      } catch (err) {
        const error = err.response?.data?.error?.message || err.response?.data?.message || 'Không thể xóa thể loại.';
        return { success: false, error };
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
          status: this.filters.status || undefined,
          sort: this.filters.sort || undefined,
          order: this.filters.order || undefined
        };

        const response = await api.get('/books', { params });
        const list = Array.isArray(response.data.data) ? response.data.data : [];
        this.books = list.map(normalizeBook);
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
        const list = Array.isArray(response.data.data) ? response.data.data : [];
        this.publishers = list.map(normalizePublisher);
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
    async updatePublisher(id, publisherData) {
      try {
        const response = await api.put(`/publishers/${id}`, publisherData);
        await this.fetchPublishers();
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Cập nhật nhà xuất bản thành công!'
        };
      } catch (err) {
        const error = err.response?.data?.error?.message || err.response?.data?.message || 'Không thể cập nhật Nhà xuất bản.';
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
