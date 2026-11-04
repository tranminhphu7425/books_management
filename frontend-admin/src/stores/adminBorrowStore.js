import { defineStore } from 'pinia';
import api from '../services/api';

/**
 * Chuẩn hóa đối tượng phiếu theo dõi mượn trả sách sang camelCase chuẩn JavaScript
 */
export const normalizeBorrow = (b) => {
  if (!b) return b;
  const maTheoDoi = b.maTheoDoi || b.MaTheoDoi || '';
  const maDocGia = b.maDocGia || b.MaDocGia || b.docGiaId?.maDocGia || b.docGiaId?.MaDocGia || b.docGia?.maDocGia || b.docGia?.MaDocGia || '';
  const maSach = b.maSach || b.MaSach || b.sachId?.maSach || b.sachId?.MaSach || b.sach?.maSach || b.sach?.MaSach || '';
  const ngayMuon = b.ngayMuon || b.NgayMuon || '';
  const hanTra = b.hanTra || b.HanTra || b.ngayTra || b.NgayTra || '';
  const ngayTra = b.ngayTra || b.NgayTra || hanTra;
  const ngayTraThucTe = b.ngayTraThucTe || b.NgayTraThucTe || '';
  const trangThai = b.trangThai || b.TrangThai || '';
  const tienPhat = Number(b.tienPhat ?? b.TienPhat ?? 0);
  const ngayYeuCau = b.ngayYeuCau || b.NgayYeuCau || b.createdAt || '';
  const ngayHenLay = b.ngayHenLay || b.NgayHenLay || '';
  const hanChotNhan = b.hanChotNhan || b.HanChotNhan || ngayHenLay;
  const lyDoTuChoi = b.lyDoTuChoi || b.LyDoTuChoi || '';
  const ghiChu = b.ghiChu || b.GhiChu || '';

  return {
    ...b,
    _id: b._id || b.id,
    id: b.id || b._id,
    maTheoDoi,
    MaTheoDoi: maTheoDoi,
    maDocGia,
    MaDocGia: maDocGia,
    maSach,
    MaSach: maSach,
    ngayMuon,
    NgayMuon: ngayMuon,
    hanTra,
    HanTra: hanTra,
    ngayTra,
    NgayTra: ngayTra,
    ngayTraThucTe,
    NgayTraThucTe: ngayTraThucTe,
    trangThai,
    TrangThai: trangThai,
    tienPhat,
    TienPhat: tienPhat,
    ngayYeuCau,
    NgayYeuCau: ngayYeuCau,
    ngayHenLay,
    NgayHenLay: ngayHenLay,
    hanChotNhan,
    HanChotNhan: hanChotNhan,
    lyDoTuChoi,
    LyDoTuChoi: lyDoTuChoi,
    ghiChu,
    GhiChu: ghiChu
  };
};

export const useAdminBorrowStore = defineStore('adminBorrow', {
  state: () => ({
    borrows: [],
    isLoading: false,
    error: null
  }),

  getters: {
    pendingBorrows: (state) => state.borrows.filter((b) => (b.trangThai || b.TrangThai) === 'PENDING'),
    approvedBorrows: (state) => state.borrows.filter((b) => (b.trangThai || b.TrangThai) === 'APPROVED'),
    activeBorrows: (state) => state.borrows.filter((b) => (b.trangThai || b.TrangThai) === 'BORROWED'),
    overdueBorrows: (state) => {
      const now = new Date();
      return state.borrows.filter(
        (b) =>
          (b.trangThai || b.TrangThai) === 'BORROWED' &&
          (b.hanTra || b.HanTra || b.ngayTra || b.NgayTra) &&
          new Date(b.hanTra || b.HanTra || b.ngayTra || b.NgayTra) < now
      );
    },
    returnedBorrows: (state) => state.borrows.filter((b) => ['RETURNED', 'CANCELLED'].includes(b.trangThai || b.TrangThai))
  },

  actions: {
    async fetchBorrows(status = '') {
      this.isLoading = true;
      this.error = null;
      try {
        const params = status ? { status } : {};
        const response = await api.get('/borrows', { params });
        const list = Array.isArray(response.data.data) ? response.data.data : [];
        this.borrows = list.map(normalizeBorrow);
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
