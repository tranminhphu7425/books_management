<template>
  <div class="fines-view">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h3 class="font-serif fw-bold text-dark mb-1">Quản Lý Biên Bản Bồi Thường & Thu Phí</h3>
        <p class="text-muted small mb-0">
          Theo dõi các khoản đền bù sự cố ấn phẩm hư hại/mất mát và xác nhận thu tiền mặt/chuyển khoản tại quầy.
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-danger p-2 small">
          Nợ đền bù: <strong>{{ formatCurrency(fineStore.totalUnpaidAmount) }}</strong>
        </span>
        <button class="btn btn-outline-primary btn-sm" @click="fineStore.fetchFines">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <ul class="nav nav-pills custom-admin-pills mb-4 gap-2">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: currentTab === 'UNPAID' }"
          @click="currentTab = 'UNPAID'"
        >
          <i class="bi bi-exclamation-octagon-fill me-1"></i> Chưa Nộp Tiền ({{ fineStore.unpaidFines.length }})
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: currentTab === 'PAID' }"
          @click="currentTab = 'PAID'"
        >
          <i class="bi bi-check-circle-fill me-1"></i> Đã Thu Tiền Hoàn Tất ({{ fineStore.paidFines.length }})
        </button>
      </li>
    </ul>

    <!-- Loading State -->
    <div v-if="fineStore.isLoading" class="card border-0 shadow-sm p-5 text-center bg-white">
      <div class="spinner-border spinner-border-sm text-primary mx-auto mb-2"></div>
      <div class="text-muted small">Đang tải danh sách biên bản bồi thường...</div>
    </div>

    <!-- Bảng Danh Sách Biên Bản -->
    <div v-else class="card border-0 shadow-sm bg-white overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 small">
          <thead class="table-light">
            <tr>
              <th>Mã biên bản</th>
              <th>Bạn đọc liên quan</th>
              <th>Ấn phẩm sự cố</th>
              <th>Loại vi phạm</th>
              <th>Mô tả chi tiết</th>
              <th>Số tiền bồi thường</th>
              <th>Ngày lập</th>
              <th class="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="displayedFines.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                Không có biên bản bồi thường nào trong danh mục này.
              </td>
            </tr>

            <tr v-for="fine in displayedFines" :key="fine._id">
              <td><code>{{ fine.MaBienBan }}</code></td>
              <td>
                <div
                  class="fw-semibold text-dark role-clickable hover-underline"
                  @click="userDetailModalRef?.open(fine.DocGiaId || fine.MaDocGia)"
                  title="Nhấn để xem hồ sơ độc giả"
                >
                  {{ fine.DocGiaId?.HoLot }} {{ fine.DocGiaId?.Ten }}
                </div>
                <div class="text-muted" style="font-size: 0.75rem;">
                  Mã ĐG:
                  <code
                    class="role-clickable text-primary"
                    @click="userDetailModalRef?.open(fine.DocGiaId || fine.MaDocGia)"
                  >{{ fine.MaDocGia }}</code>
                  | SĐT: {{ fine.DocGiaId?.DienThoai || 'N/A' }}
                </div>
              </td>
              <td>
                <div
                  class="fw-bold text-dark role-clickable hover-underline"
                  @click="bookDetailModalRef?.open(fine.SachId || fine.MaSach)"
                  title="Nhấn để xem chi tiết ấn phẩm"
                >
                  {{ fine.SachId?.TenSach || fine.MaSach }}
                </div>
                <div class="text-muted" style="font-size: 0.75rem;">
                  Mã sách:
                  <code
                    class="role-clickable text-primary"
                    @click="bookDetailModalRef?.open(fine.SachId || fine.MaSach)"
                  >{{ fine.MaSach }}</code>
                </div>
              </td>
              <td>
                <span class="badge" :class="fine.LoaiSuCo === 'LOST' ? 'bg-danger' : 'bg-warning text-dark'">
                  {{ fine.LoaiSuCo === 'LOST' ? 'Làm mất sách' : 'Rách / Hư hỏng' }}
                </span>
              </td>
              <td>
                <span class="text-secondary" style="max-width: 250px; display: inline-block;">
                  {{ fine.MoTa || fine.LyDo }}
                </span>
              </td>
              <td>
                <strong class="text-danger fs-6">{{ formatCurrency(fine.SoTienBoiThuong || fine.SoTienPhat) }}</strong>
              </td>
              <td>{{ formatDate(fine.NgayLap || fine.createdAt) }}</td>
              <td class="text-end">
                <button
                  v-if="fine.TrangThai === 'UNPAID'"
                  class="btn btn-sm btn-success px-3 shadow-sm"
                  @click="handlePayFine(fine)"
                >
                  <i class="bi bi-cash-coin me-1"></i> Xác Nhận Đã Thu Tiền
                </button>
                <span v-else class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                  <i class="bi bi-check2-all me-1"></i> Đã thanh toán
                </span>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAdminFineStore } from '../stores/adminFineStore';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';
import BookDetailModal from '../components/BookDetailModal.vue';
import UserDetailModal from '../components/UserDetailModal.vue';

const fineStore = useAdminFineStore();
const toast = useToast();
const { confirm } = useConfirm();
const currentTab = ref('UNPAID');

const bookDetailModalRef = ref(null);
const userDetailModalRef = ref(null);

const displayedFines = computed(() => {
  return currentTab.value === 'UNPAID' ? fineStore.unpaidFines : fineStore.paidFines;
});

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const formatCurrency = (val) => {
  if (!val) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const handlePayFine = async (fine) => {
  const amountStr = formatCurrency(fine.SoTienBoiThuong || fine.SoTienPhat);
  const readerName = `${fine.DocGiaId?.HoLot || ''} ${fine.DocGiaId?.Ten || ''}`.trim();

  const isConfirmed = await confirm({
    title: 'Xác nhận thu tiền bồi thường',
    message: `Xác nhận độc giả "${readerName}" đã nộp đủ số tiền ${amountStr} tại quầy thư viện? Hệ thống sẽ tự động mở lại quyền mượn sách cho độc giả này.`,
    confirmText: 'Xác nhận đã thu đủ tiền',
    cancelText: 'Hủy bỏ',
    type: 'success',
    icon: 'bi-cash-coin'
  });
  if (!isConfirmed) return;

  const res = await fineStore.payFine(fine._id);
  if (res.success) toast.success(res.message);
  else toast.error(res.error);
};

onMounted(() => {
  fineStore.fetchFines();
});
</script>

<style scoped>
.custom-admin-pills .nav-link {
  color: var(--admin-text-main);
  background-color: var(--admin-surface);
  border: 1px solid var(--admin-border);
  font-weight: 500;
  border-radius: var(--radius-sm);
  padding: 0.55rem 1.15rem;
  transition: all 0.2s ease;
}

.custom-admin-pills .nav-link.active {
  background-color: var(--admin-primary);
  border-color: var(--admin-primary);
  color: #fff;
}

.role-clickable {
  cursor: pointer;
  transition: color 0.15s ease;
}
.hover-underline:hover {
  text-decoration: underline !important;
}
</style>
