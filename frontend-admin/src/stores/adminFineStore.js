import { defineStore } from 'pinia';
import api from '../services/api';

/**
 * Chuẩn hóa đối tượng biên bản bồi thường sang camelCase chuẩn JavaScript
 */
export const normalizeFine = (f) => {
  if (!f) return f;
  const maBienBan = f.maBienBan || f.MaBienBan || '';
  const maTheoDoi = f.maTheoDoi || f.MaTheoDoi || f.theoDoiMuonId?.maTheoDoi || f.theoDoiMuonId?.MaTheoDoi || '';
  const maDocGia = f.maDocGia || f.MaDocGia || f.docGiaId?.maDocGia || f.docGiaId?.MaDocGia || '';
  const maSach = f.maSach || f.MaSach || f.sachId?.maSach || f.sachId?.MaSach || '';
  const soTienBoiThuong = Number(
    f.soTienBoiThuong ?? f.SoTienBoiThuong ?? f.soTienPhat ?? f.SoTienPhat ?? 0
  );
  const loaiSuCo = f.loaiSuCo || f.LoaiSuCo || '';
  const lyDo = f.lyDo || f.LyDo || f.moTa || f.MoTa || '';
  const moTa = f.moTa || f.MoTa || lyDo;
  const trangThai = f.trangThai || f.TrangThai || 'UNPAID';
  const ngayTao = f.ngayTao || f.NgayTao || f.ngayLap || f.NgayLap || f.createdAt || '';
  const ngayLap = f.ngayLap || f.NgayLap || ngayTao;
  const ngayNop = f.ngayNop || f.NgayNop || '';

  return {
    ...f,
    _id: f._id || f.id,
    id: f.id || f._id,
    maBienBan,
    MaBienBan: maBienBan,
    maTheoDoi,
    MaTheoDoi: maTheoDoi,
    maDocGia,
    MaDocGia: maDocGia,
    maSach,
    MaSach: maSach,
    soTienBoiThuong,
    SoTienBoiThuong: soTienBoiThuong,
    soTienPhat: soTienBoiThuong,
    SoTienPhat: soTienBoiThuong,
    loaiSuCo,
    LoaiSuCo: loaiSuCo,
    lyDo,
    LyDo: lyDo,
    moTa,
    MoTa: moTa,
    trangThai,
    TrangThai: trangThai,
    ngayTao,
    NgayTao: ngayTao,
    ngayLap,
    NgayLap: ngayLap,
    ngayNop,
    NgayNop: ngayNop
  };
};

export const useAdminFineStore = defineStore('adminFine', {
  state: () => ({
    fines: [],
    isLoading: false,
    error: null
  }),

  getters: {
    unpaidFines: (state) => state.fines.filter((f) => (f.trangThai || f.TrangThai) === 'UNPAID'),
    paidFines: (state) => state.fines.filter((f) => (f.trangThai || f.TrangThai) === 'PAID'),
    totalUnpaidAmount: (state) => {
      return state.fines
        .filter((f) => (f.trangThai || f.TrangThai) === 'UNPAID')
        .reduce((sum, f) => sum + (f.soTienBoiThuong ?? f.SoTienBoiThuong ?? f.soTienPhat ?? f.SoTienPhat ?? 0), 0);
    },
    totalCollectedAmount: (state) => {
      return state.fines
        .filter((f) => (f.trangThai || f.TrangThai) === 'PAID')
        .reduce((sum, f) => sum + (f.soTienBoiThuong ?? f.SoTienBoiThuong ?? f.soTienPhat ?? f.SoTienPhat ?? 0), 0);
    }
  },

  actions: {
    async fetchFines() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await api.get('/fines');
        const list = Array.isArray(response.data.data) ? response.data.data : [];
        this.fines = list.map(normalizeFine);
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
