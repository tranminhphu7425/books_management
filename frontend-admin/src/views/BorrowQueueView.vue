<template>
  <div class="borrow-queue-view">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h3 class="font-serif fw-bold text-dark mb-1">Duyệt Yêu Cầu & Xuất Sách Cho Bạn Đọc</h3>
        <p class="text-muted small mb-0">
          Tiếp nhận đơn mượn trực tuyến, chuẩn bị sách giữ trong 48h và quét mã xuất kho khi độc giả đến nhận.
        </p>
      </div>

      <button class="btn btn-outline-primary btn-sm px-3" @click="refreshData">
        <i class="bi bi-arrow-clockwise me-1"></i> Làm mới danh sách
      </button>
    </div>

    <!-- Navigation Tabs -->
    <ul class="nav nav-pills custom-admin-pills mb-4 gap-2">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: currentTab === 'PENDING' }"
          @click="currentTab = 'PENDING'"
        >
          <i class="bi bi-hourglass-split me-1"></i> Yêu Cầu Chờ Duyệt
          <span class="badge rounded-pill ms-1" :class="currentTab === 'PENDING' ? 'bg-white text-warning' : 'bg-warning text-dark'">
            {{ borrowStore.pendingBorrows.length }}
          </span>
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: currentTab === 'APPROVED' }"
          @click="currentTab = 'APPROVED'"
        >
          <i class="bi bi-box-seam me-1"></i> Đã Duyệt - Chờ Xuất Sách (48h)
          <span class="badge rounded-pill ms-1" :class="currentTab === 'APPROVED' ? 'bg-white text-primary' : 'bg-primary text-white'">
            {{ borrowStore.approvedBorrows.length }}
          </span>
        </button>
      </li>
    </ul>

    <!-- Loading State -->
    <div v-if="borrowStore.isLoading" class="card border-0 shadow-sm p-5 text-center bg-white">
      <div class="spinner-border spinner-border-sm text-primary mx-auto mb-2"></div>
      <div class="text-muted small">Đang đồng bộ hàng đợi mượn sách...</div>
    </div>

    <!-- Content Tab 1: PENDING -->
    <div v-else-if="currentTab === 'PENDING'">
      <div v-if="borrowStore.pendingBorrows.length === 0" class="card border-0 shadow-sm p-5 text-center bg-white">
        <i class="bi bi-inbox fs-1 text-muted mb-2"></i>
        <h6 class="font-serif">Hiện không có yêu cầu mượn nào đang chờ duyệt</h6>
        <p class="text-muted small mb-0">Khi bạn đọc đặt mượn trực tuyến, danh sách sẽ tức thời hiển thị tại đây.</p>
      </div>

      <div v-else class="card border-0 shadow-sm bg-white overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 small">
            <thead class="table-light">
              <tr>
                <th>Mã đơn</th>
                <th>Ấn phẩm đăng ký</th>
                <th>Độc giả mượn</th>
                <th>Ngày yêu cầu</th>
                <th>Hẹn nhận</th>
                <th class="text-end">Hành động của thủ thư</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in borrowStore.pendingBorrows" :key="item._id">
                <td><code>{{ item._id.slice(-6).toUpperCase() }}</code></td>
                <td>
                  <div
                    class="fw-bold text-primary role-clickable hover-underline"
                    @click="bookDetailModalRef?.open(item.SachId || item.MaSach)"
                    title="Nhấn để xem thông tin chi tiết ấn phẩm"
                  >
                    <i class="bi bi-book me-1"></i>{{ item.SachId?.TenSach || item.MaSach }}
                  </div>
                  <div class="text-muted" style="font-size: 0.75rem;">Mã: <code>{{ item.MaSach }}</code> | Kệ: {{ item.SachId?.ViTri || 'Chung' }}</div>
                </td>
                <td>
                  <div
                    class="fw-semibold text-dark role-clickable hover-underline"
                    @click="userDetailModalRef?.open(item.DocGiaId || item.MaDocGia)"
                    title="Nhấn để xem hồ sơ chi tiết bạn đọc"
                  >
                    <i class="bi bi-person-fill text-muted me-1"></i>{{ item.DocGiaId?.HoLot }} {{ item.DocGiaId?.Ten }}
                  </div>
                  <div class="text-muted" style="font-size: 0.75rem;">{{ item.DocGiaId?.Email }} | SĐT: {{ item.DocGiaId?.DienThoai }}</div>
                </td>
                <td>{{ formatDate(item.NgayYeuCau || item.createdAt) }}</td>
                <td>
                  <span class="badge bg-light text-dark border">
                    {{ formatDate(item.NgayHenLay) }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-success" @click="handleApprove(item)" title="Chấp thuận & giữ sách 48h">
                      <i class="bi bi-check-lg me-1"></i> Duyệt đơn
                    </button>
                    <button class="btn btn-outline-danger" @click="openRejectModal(item)" title="Từ chối đơn">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Content Tab 2: APPROVED (Chờ xuất sách) -->
    <div v-else-if="currentTab === 'APPROVED'">
      <div v-if="borrowStore.approvedBorrows.length === 0" class="card border-0 shadow-sm p-5 text-center bg-white">
        <i class="bi bi-check2-circle fs-1 text-muted mb-2"></i>
        <h6 class="font-serif">Không có đơn mượn nào đang chờ xuất sách</h6>
        <p class="text-muted small mb-0">Các đơn mượn sau khi được thủ thư duyệt sẽ nằm tại đây chờ bạn đọc đến nhận tại quầy.</p>
      </div>

      <div v-else class="card border-0 shadow-sm bg-white overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 small">
            <thead class="table-light">
              <tr>
                <th>Mã đơn</th>
                <th>Ấn phẩm cần xuất</th>
                <th>Bạn đọc nhận sách</th>
                <th>Thời hạn giữ sách (48h)</th>
                <th class="text-end">Thao tác quầy</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in borrowStore.approvedBorrows" :key="item._id">
                <td><code>{{ item._id.slice(-6).toUpperCase() }}</code></td>
                <td>
                  <div
                    class="fw-bold text-primary role-clickable hover-underline"
                    @click="bookDetailModalRef?.open(item.SachId || item.MaSach)"
                    title="Nhấn để xem thông tin chi tiết ấn phẩm"
                  >
                    <i class="bi bi-book me-1"></i>{{ item.SachId?.TenSach || item.MaSach }}
                  </div>
                  <div class="text-muted" style="font-size: 0.75rem;">Mã: <code>{{ item.MaSach }}</code> | Kệ: {{ item.SachId?.ViTri || 'Chung' }}</div>
                </td>
                <td>
                  <div
                    class="fw-semibold text-dark role-clickable hover-underline"
                    @click="userDetailModalRef?.open(item.DocGiaId || item.MaDocGia)"
                    title="Nhấn để xem hồ sơ chi tiết bạn đọc"
                  >
                    <i class="bi bi-person-fill text-muted me-1"></i>{{ item.DocGiaId?.HoLot }} {{ item.DocGiaId?.Ten }}
                  </div>
                  <div class="text-muted" style="font-size: 0.75rem;">Mã ĐG: <code>{{ item.MaDocGia }}</code> | SĐT: {{ item.DocGiaId?.DienThoai }}</div>
                </td>
                <td>
                  <span class="badge bg-warning-subtle text-warning border border-warning-subtle">
                    <i class="bi bi-clock-history me-1"></i> Hết hạn giữ: {{ formatDate(item.HanChotNhan || item.NgayHenLay) }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-primary btn-sm px-3" @click="handleCheckout(item)">
                    <i class="bi bi-box-arrow-up-right me-1"></i> Xuất Sách Cho Bạn Đọc
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Từ chối yêu cầu mượn -->
    <div class="modal fade" id="rejectModal" tabindex="-1" aria-hidden="true" ref="rejectModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title font-serif fs-6">Từ Chối Yêu Cầu Mượn Sách</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4">
            <p class="small text-muted mb-3">
              Vui lòng nhập lý do từ chối để hệ thống gửi thông báo rõ ràng đến bạn đọc:
            </p>
            <div class="mb-3">
              <label class="form-label small fw-semibold">Lý do từ chối <span class="text-danger">*</span></label>
              <textarea v-model="rejectReason" class="form-control" rows="3" placeholder="Ví dụ: Sách đang được đưa đi phục chế, hoặc bản in bị hư hỏng đột xuất..."></textarea>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-danger btn-sm px-3" @click="submitReject">
              Xác Nhận Từ Chối
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals Chi Tiết Ấn Phẩm & Chi Tiết Bạn Đọc -->
    <BookDetailModal ref="bookDetailModalRef" />
    <UserDetailModal ref="userDetailModalRef" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAdminBorrowStore } from '../stores/adminBorrowStore';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';
import BookDetailModal from '../components/BookDetailModal.vue';
import UserDetailModal from '../components/UserDetailModal.vue';

const borrowStore = useAdminBorrowStore();
const toast = useToast();
const { confirm } = useConfirm();
const currentTab = ref('PENDING');

const rejectModalRef = ref(null);
const bookDetailModalRef = ref(null);
const userDetailModalRef = ref(null);
const selectedBorrow = ref(null);
const rejectReason = ref('');

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const refreshData = () => {
  borrowStore.fetchBorrows();
};

const handleApprove = async (item) => {
  const isConfirmed = await confirm({
    title: 'Duyệt yêu cầu mượn sách',
    message: `Xác nhận phê duyệt yêu cầu mượn cuốn "${item.SachId?.TenSach || item.MaSach}" và giữ sách tại quầy trong 48 giờ?`,
    confirmText: 'Duyệt yêu cầu',
    cancelText: 'Hủy bỏ',
    type: 'primary',
    icon: 'bi-check2-circle'
  });
  if (!isConfirmed) return;

  const res = await borrowStore.approveBorrow(item._id);
  if (res.success) toast.success(res.message);
  else toast.error(res.error);
};

const handleCheckout = async (item) => {
  const isConfirmed = await confirm({
    title: 'Xuất sách cho bạn đọc',
    message: `Xác nhận độc giả đã có mặt tại quầy và hoàn tất thủ tục xuất cuốn sách "${item.SachId?.TenSach || item.MaSach}" mang về? Thời hạn mượn là 14 ngày.`,
    confirmText: 'Xác nhận xuất sách',
    cancelText: 'Hủy bỏ',
    type: 'success',
    icon: 'bi-box-arrow-up-right'
  });
  if (!isConfirmed) return;

  const res = await borrowStore.checkoutBorrow(item._id);
  if (res.success) toast.success(res.message);
  else toast.error(res.error);
};

const openRejectModal = (item) => {
  selectedBorrow.value = item;
  rejectReason.value = '';
  const modal = new window.bootstrap.Modal(rejectModalRef.value);
  modal.show();
};

const submitReject = async () => {
  if (!rejectReason.value.trim()) {
    toast.warning('Vui lòng nhập lý do từ chối yêu cầu.');
    return;
  }
  const res = await borrowStore.rejectBorrow(selectedBorrow.value._id, rejectReason.value.trim());
  const modal = window.bootstrap.Modal.getInstance(rejectModalRef.value);
  if (modal) modal.hide();
  if (res.success) toast.success(res.message);
  else toast.error(res.error);
};

onMounted(() => {
  borrowStore.fetchBorrows();
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
