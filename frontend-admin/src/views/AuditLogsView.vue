<template>
  <div class="audit-logs-view">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h3 class="font-serif fw-bold text-dark mb-1">Nhật Ký Kiểm Toán Tác Nghiệp (Audit Trail)</h3>
        <p class="text-muted small mb-0">
          Ghi nhận toàn bộ thao tác quan trọng của nhân viên và quản trị viên phục vụ công tác đối soát và an toàn thông tin.
        </p>
      </div>

      <button class="btn btn-outline-primary btn-sm" @click="statsStore.fetchAuditLogs">
        <i class="bi bi-arrow-clockwise me-1"></i> Làm mới nhật ký
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="statsStore.isLoading" class="card border-0 shadow-sm p-5 text-center bg-white">
      <div class="spinner-border spinner-border-sm text-primary mx-auto mb-2"></div>
      <div class="text-muted small">Đang tải dữ liệu nhật ký kiểm toán...</div>
    </div>

    <!-- Bảng Nhật Ký -->
    <div v-else class="card border-0 shadow-sm bg-white overflow-hidden">
      <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
        <span class="small fw-bold text-dark">
          <i class="bi bi-shield-lock-fill text-primary me-2"></i> Lịch Sử Thao Tác Hệ Thống ({{ statsStore.auditLogs.length }} bản ghi)
        </span>
        <span class="badge bg-secondary">Chuẩn an toàn bảo mật</span>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 small">
          <thead class="table-light">
            <tr>
              <th>Thời gian</th>
              <th>Người thực hiện</th>
              <th>Hành động</th>
              <th>Tài nguyên</th>
              <th>Địa chỉ IP</th>
              <th>Chi tiết thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="statsStore.auditLogs.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                Chưa có nhật ký hoạt động nào được ghi nhận.
              </td>
            </tr>

            <tr v-for="log in statsStore.auditLogs" :key="log._id">
              <td class="text-nowrap">{{ formatDateTime(log.ThoiGian || log.createdAt || log.timestamp) }}</td>
              <td>
                <div class="fw-semibold text-dark">
                  {{ log.NguoiThucHien?.HoTen || log.UserName || log.UserEmail || 'Hệ thống' }}
                  <span v-if="log.NguoiThucHien?.MSNV" class="text-muted fw-normal" style="font-size: 0.75rem;">({{ log.NguoiThucHien.MSNV }})</span>
                </div>
                <span class="badge bg-light text-dark border" style="font-size: 0.72rem;">{{ log.NguoiThucHien?.ChucVu || log.UserRole || 'STAFF' }}</span>
              </td>
              <td>
                <span class="badge" :class="getActionBadgeClass(log.HanhDong || log.Action)">
                  {{ formatAction(log.HanhDong || log.Action) }}
                </span>
              </td>
              <td><code>{{ log.DoiTuongTacDong?.Collection || log.Resource || log.Target || 'Chung' }}</code></td>
              <td class="font-monospace text-muted">{{ log.NguoiThucHien?.DiaChiIP || log.IpAddress || '127.0.0.1' }}</td>
              <td>
                <div class="text-secondary" style="max-width: 320px; word-break: break-word;">
                  {{ log.ChiTiet || log.Details || log.Description || 'Hoàn tất tác vụ thành công.' }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAdminStatsStore } from '../stores/adminStatsStore';

const statsStore = useAdminStatsStore();

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatAction = (action) => {
  const map = {
    LOGIN: 'Đăng nhập',
    LOGOUT: 'Đăng xuất',
    CREATE_BOOK: 'Thêm sách',
    UPDATE_BOOK: 'Sửa sách',
    DELETE_BOOK: 'Xóa sách',
    APPROVE_BORROW: 'Duyệt mượn',
    CHECKOUT_BORROW: 'Xuất sách',
    REJECT_BORROW: 'Từ chối mượn',
    CHECKOUT: 'Xuất sách',
    CHECKIN: 'Nhận trả sách',
    RETURN_BOOK: 'Nhận trả sách',
    REPORT_DAMAGE: 'Báo sự cố',
    RESOLVE_FINE: 'Xử lý phạt',
    CREATE_FINE: 'Lập biên bản',
    PAY_FINE: 'Thu tiền phạt',
    CREATE_STAFF: 'Tạo nhân viên',
    UPDATE_ROLE: 'Đổi quyền',
    TOGGLE_BLACKLIST: 'Cập nhật Blacklist',
    BLACKLIST_USER: 'Khóa Blacklist',
    UNBLACKLIST_USER: 'Mở Blacklist'
  };
  return map[action] || action;
};

const getActionBadgeClass = (action) => {
  if (['DELETE_BOOK', 'REJECT_BORROW', 'TOGGLE_BLACKLIST', 'BLACKLIST_USER'].includes(action)) return 'bg-danger';
  if (['APPROVE_BORROW', 'CHECKOUT', 'CHECKOUT_BORROW', 'CHECKIN', 'RETURN_BOOK', 'PAY_FINE', 'UNBLACKLIST_USER', 'RESOLVE_FINE'].includes(action)) return 'bg-success';
  if (['CREATE_BOOK', 'UPDATE_BOOK', 'CREATE_STAFF', 'UPDATE_ROLE'].includes(action)) return 'bg-primary';
  if (['REPORT_DAMAGE', 'CREATE_FINE'].includes(action)) return 'bg-warning text-dark';
  return 'bg-secondary';
};

onMounted(() => {
  statsStore.fetchAuditLogs();
});
</script>
