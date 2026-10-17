<template>
  <div class="returns-view">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h3 class="font-serif fw-bold text-dark mb-1">Nhận Trả Sách & Xử Lý Sự Cố</h3>
        <p class="text-muted small mb-0">
          Tiếp nhận hoàn trả ấn phẩm từ bạn đọc, đối soát tình trạng sách nguyên vẹn hoặc lập biên bản sự cố đền bù.
        </p>
      </div>

      <div class="d-flex gap-2">
        <input type="text" v-model="searchKeyword" class="form-control form-control-sm"
          placeholder="Tìm theo tên bạn đọc, mã sách, tên sách..." style="width: 280px;" />
        <button class="btn btn-outline-primary btn-sm" @click="refreshData">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="borrowStore.isLoading" class="card border-0 shadow-sm p-5 text-center bg-white">
      <div class="spinner-border spinner-border-sm text-primary mx-auto mb-2"></div>
      <div class="text-muted small">Đang tải danh sách ấn phẩm đang lưu hành...</div>
    </div>

    <!-- Bảng Sách Đang Mượn Chờ Trả -->
    <div v-else class="card border-0 shadow-sm bg-white overflow-hidden">
      <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
        <span class="small fw-bold text-dark">
          <i class="bi bi-journal-check text-primary me-2"></i> Danh Sách Sách Đang Lưu Hành Ngoài Thư Viện ({{
            filteredBorrows.length }})
        </span>
        <span class="badge bg-white text-dark border">Thời hạn mượn: 14 ngày</span>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 small">
          <thead class="table-light">
            <tr>
              <th>Mã đơn</th>
              <th>Ấn phẩm</th>
              <th>Bạn đọc đang mượn</th>
              <th>Ngày xuất mượn</th>
              <th>Hạn trả sách</th>
              <th>Tình trạng</th>
              <th class="text-end">Xử lý hoàn trả</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredBorrows.length === 0">
              <td colspan="7" class="text-center py-5 text-muted">
                Hiện không có ấn phẩm nào đang được mượn hoặc không tìm thấy kết quả phù hợp.
              </td>
            </tr>

            <tr v-for="item in filteredBorrows" :key="item._id">
              <td><code>{{ item._id.slice(-6).toUpperCase() }}</code></td>
              <td>
                <div
                  class="fw-bold text-dark role-clickable hover-underline"
                  @click="bookDetailModalRef?.open(item.SachId || item.MaSach)"
                  title="Nhấn để xem chi tiết ấn phẩm"
                >
                  {{ item.SachId?.TenSach || item.MaSach }}
                </div>
                <div class="text-muted" style="font-size: 0.75rem;">
                  Mã:
                  <code
                    class="role-clickable text-primary"
                    @click="bookDetailModalRef?.open(item.SachId || item.MaSach)"
                  >{{ item.MaSach }}</code>
                  | Trị giá: {{ formatCurrency(item.SachId?.DonGia) }}
                </div>
              </td>
              <td>
                <div
                  class="fw-semibold text-dark role-clickable hover-underline"
                  @click="userDetailModalRef?.open(item.DocGiaId || item.MaDocGia)"
                  title="Nhấn để xem hồ sơ bạn đọc"
                >
                  {{ item.DocGiaId?.HoLot }} {{ item.DocGiaId?.Ten }}
                </div>
                <div class="text-muted" style="font-size: 0.75rem;">
                  Mã ĐG:
                  <code
                    class="role-clickable text-primary"
                    @click="userDetailModalRef?.open(item.DocGiaId || item.MaDocGia)"
                  >{{ item.MaDocGia }}</code>
                  | SĐT: {{ item.DocGiaId?.DienThoai || 'N/A' }}
                </div>
              </td>
              <td>{{ formatDate(item.NgayMuon) }}</td>
              <td>
                <strong :class="isOverdue(item.HanTra || item.NgayTra) ? 'text-danger fw-bold' : 'text-primary'">
                  {{ formatDate(item.HanTra || item.NgayTra) }}
                </strong>
              </td>
              <td>
                <span class="badge" :class="isOverdue(item.HanTra || item.NgayTra) ? 'badge-status-overdue' : 'badge-status-borrowed'">
                  <i
                    :class="isOverdue(item.HanTra || item.NgayTra) ? 'bi bi-exclamation-triangle-fill me-1' : 'bi bi-check-circle-fill me-1'"></i>
                  {{ isOverdue(item.HanTra || item.NgayTra) ? 'Quá hạn' : 'Đang mượn' }}
                </span>
              </td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-success" @click="handleNormalCheckin(item)"
                    title="Sách nguyên vẹn, nhận trả lại kệ">
                    <i class="bi bi-check2-circle me-1"></i> Nhận trả bình thường
                  </button>
                  <button class="btn btn-outline-danger" @click="openIncidentModal(item)"
                    title="Sách bị rách, hỏng hoặc làm mất">
                    <i class="bi bi-exclamation-octagon me-1"></i> Báo sự cố
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Chi Tiết Ấn Phẩm -->
    <BookDetailModal ref="bookDetailModalRef" />

    <!-- Modal Chi Tiết Độc Giả -->
    <UserDetailModal ref="userDetailModalRef" />

    <!-- Modal Lập Biên Bản Sự Cố Hư Hại / Mất Sách -->
    <div class="modal fade" id="incidentModal" tabindex="-1" aria-hidden="true" ref="incidentModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title font-serif fs-6">
              <i class="bi bi-shield-exclamation me-2"></i> Lập Biên Bản Sự Cố Ấn Phẩm
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>

          <form @submit.prevent="submitIncident">
            <div class="modal-body p-4" v-if="selectedItem">
              <div class="p-3 bg-light rounded small mb-3 border">
                <div class="fw-bold text-dark">{{ selectedItem.SachId?.TenSach || selectedItem.MaSach }}</div>
                <div class="text-muted">Bạn đọc: <strong>{{ selectedItem.DocGiaId?.HoLot }} {{
                  selectedItem.DocGiaId?.Ten }}</strong> (Mã: {{ selectedItem.MaDocGia }})</div>
                <div class="text-danger fw-bold mt-1">Đơn giá niêm yết: {{ formatCurrency(selectedItem.SachId?.DonGia)
                  }}</div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Loại sự cố phát sinh <span
                    class="text-danger">*</span></label>
                <select v-model="incidentForm.loaiSuCo" class="form-select" required>
                  <option value="DAMAGED">Hư hỏng / Rách trang / Ẩm ướt / Vẽ bậy</option>
                  <option value="LOST">Làm mất sách / Thất lạc ấn phẩm</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Mô tả tình trạng hư hại chi tiết <span
                    class="text-danger">*</span></label>
                <textarea v-model="incidentForm.moTa" rows="3" class="form-control"
                  placeholder="Mô tả cụ thể số trang bị rách, mức độ hư hại hoặc hoàn cảnh làm mất..."
                  required></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold">Số tiền bồi thường thẩm định (VNĐ) <span
                    class="text-danger">*</span></label>
                <input type="number" v-model="incidentForm.soTienBoiThuong" class="form-control fw-bold text-danger"
                  min="0" step="1000" required />
                <div class="form-text small">
                  Thủ thư có quyền điều chỉnh số tiền bồi thường dựa theo mức độ thiệt hại thực tế của ấn phẩm.
                </div>
              </div>
            </div>

            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Đóng</button>
              <button type="submit" class="btn btn-danger btn-sm px-4">
                Xác Nhận Lập Biên Bản
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAdminBorrowStore } from '../stores/adminBorrowStore';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';
import { matchVietnamese } from '../utils/vietnameseUtils';
import BookDetailModal from '../components/BookDetailModal.vue';
import UserDetailModal from '../components/UserDetailModal.vue';

const borrowStore = useAdminBorrowStore();
const toast = useToast();
const { confirm } = useConfirm();
const searchKeyword = ref('');

const incidentModalRef = ref(null);
const bookDetailModalRef = ref(null);
const userDetailModalRef = ref(null);
const selectedItem = ref(null);

const incidentForm = reactive({
  loaiSuCo: 'DAMAGED',
  moTa: '',
  soTienBoiThuong: 0
});

const filteredBorrows = computed(() => {
  const list = borrowStore.activeBorrows;
  if (!searchKeyword.value.trim()) return list;
  const kw = searchKeyword.value.trim();
  return list.filter((b) => {
    const bookTitle = b.SachId?.TenSach || '';
    const readerName = `${b.DocGiaId?.HoLot || ''} ${b.DocGiaId?.Ten || ''}`.trim();
    const readerEmail = b.DocGiaId?.Email || '';
    const maSach = b.MaSach || '';
    const maDocGia = b.MaDocGia || b.DocGiaId?.MaDocGia || '';
    return (
      matchVietnamese(bookTitle, kw) ||
      matchVietnamese(readerName, kw) ||
      matchVietnamese(readerEmail, kw) ||
      matchVietnamese(maSach, kw) ||
      matchVietnamese(maDocGia, kw)
    );
  });
});

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const formatCurrency = (val) => {
  if (!val) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const isOverdue = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

const refreshData = () => {
  borrowStore.fetchBorrows();
};

const handleNormalCheckin = async (item) => {
  const isConfirmed = await confirm({
    title: 'Nhận trả ấn phẩm nguyên vẹn',
    message: `Xác nhận nhận lại cuốn sách "${item.SachId?.TenSach || item.MaSach}" nguyên vẹn từ bạn đọc và hoàn trả lại kệ kho khả dụng?`,
    confirmText: 'Xác nhận nhận trả',
    cancelText: 'Hủy bỏ',
    type: 'success',
    icon: 'bi-check2-circle'
  });
  if (!isConfirmed) return;

  const res = await borrowStore.checkinBorrow(item._id);
  if (res.success) toast.success(res.message);
  else toast.error(res.error);
};

const openIncidentModal = (item) => {
  selectedItem.value = item;
  incidentForm.loaiSuCo = 'DAMAGED';
  incidentForm.moTa = '';
  // Số tiền bồi thường mặc định chính xác là giá niêm yết của ấn phẩm
  const bookPrice = typeof item.SachId?.DonGia === 'number' ? item.SachId.DonGia : (Number(item.SachId?.DonGia) || 0);
  incidentForm.soTienBoiThuong = bookPrice;

  const modal = new window.bootstrap.Modal(incidentModalRef.value);
  modal.show();
};

const submitIncident = async () => {
  if (!selectedItem.value) return;
  const payload = {
    theoDoiMuonId: selectedItem.value._id,
    loaiSuCo: incidentForm.loaiSuCo,
    moTa: incidentForm.moTa,
    soTienBoiThuong: Number(incidentForm.soTienBoiThuong)
  };

  const res = await borrowStore.reportDamageOrLost(payload);
  if (res.success) {
    const modal = window.bootstrap.Modal.getInstance(incidentModalRef.value);
    if (modal) modal.hide();
    toast.success(res.message);
  } else {
    toast.error(res.error);
  }
};

onMounted(() => {
  borrowStore.fetchBorrows();
});
</script>

<style scoped>
.role-clickable {
  cursor: pointer;
  transition: color 0.15s ease;
}
.hover-underline:hover {
  text-decoration: underline !important;
}
</style>
