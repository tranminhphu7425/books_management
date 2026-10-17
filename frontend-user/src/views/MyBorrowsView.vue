<template>
  <div class="my-borrows-view py-4">
    <div class="container">
      <!-- Tiêu đề trang -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
        <div>
          <h1 class="h3 font-serif fw-bold text-dark mb-1">
            <i class="bi bi-bookshelf text-primary me-2"></i> Tủ Sách Của Tôi
          </h1>
          <p class="text-muted small mb-0">
            Theo dõi chi tiết các ấn phẩm bạn đang mượn, yêu cầu chờ xét duyệt và lịch sử mượn đọc.
          </p>
        </div>
        <router-link to="/books" class="btn btn-outline-primary btn-sm mt-3 mt-md-0 rounded-pill px-3">
          <i class="bi bi-plus-lg me-1"></i> Mượn thêm sách
        </router-link>
      </div>

      <!-- Banner cảnh báo bồi thường chưa nộp (nếu có) -->
      <div v-if="borrowStore.unpaidFines.length > 0" class="alert alert-danger shadow-sm mb-4">
        <div class="d-flex align-items-start gap-3">
          <i class="bi bi-exclamation-octagon-fill fs-3 text-danger"></i>
          <div class="flex-grow-1">
            <h6 class="fw-bold mb-1">Cảnh báo: Có biên bản bồi thường chưa thanh toán</h6>
            <p class="small mb-2">
              Bạn có <strong>{{ borrowStore.unpaidFines.length }}</strong> khoản bồi thường do làm mất hoặc hỏng ấn phẩm với tổng số tiền:
              <strong class="text-danger fs-6">{{ formatCurrency(borrowStore.totalUnpaidFineAmount) }}</strong>.
              Vui lòng đến trực tiếp quầy thủ thư để nộp phạt và tiếp tục sử dụng quyền mượn sách.
            </p>
            <div class="table-responsive bg-white rounded p-2 border">
              <table class="table table-sm table-bordered small mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Mã biên bản</th>
                    <th>Ấn phẩm liên quan</th>
                    <th>Mô tả sự cố</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="fine in borrowStore.unpaidFines" :key="fine._id">
                    <td><code>{{ fine.MaBienBan }}</code></td>
                    <td>
                      <router-link
                        :to="getBookDetailLink(fine)"
                        class="text-decoration-none fw-semibold text-dark hover-primary"
                      >
                        {{ fine.SachId?.TenSach || fine.MaSach }}
                      </router-link>
                    </td>
                    <td>{{ fine.MoTa || fine.LyDo || 'Sách hư hại/mất' }}</td>
                    <td class="text-danger fw-bold">{{ formatCurrency(fine.SoTienBoiThuong || fine.SoTienPhat) }}</td>
                    <td>
                      <span class="badge bg-danger">Chưa nộp</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-pills custom-pills mb-4 gap-2" id="borrowTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'borrowed' }"
            @click="activeTab = 'borrowed'"
            type="button"
          >
            <i class="bi bi-book-half me-1"></i> Đang Mượn
            <span class="badge rounded-pill ms-1" :class="activeTab === 'borrowed' ? 'bg-white text-primary' : 'bg-primary text-white'">
              {{ borrowStore.activeBorrowCount }}
            </span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'pending' }"
            @click="activeTab = 'pending'"
            type="button"
          >
            <i class="bi bi-hourglass-split me-1"></i> Yêu Cầu Chờ Duyệt
            <span class="badge rounded-pill ms-1" :class="activeTab === 'pending' ? 'bg-white text-warning' : 'bg-warning text-dark'">
              {{ borrowStore.pendingBorrowCount }}
            </span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'history' }"
            @click="activeTab = 'history'"
            type="button"
          >
            <i class="bi bi-clock-history me-1"></i> Lịch Sử Hoàn Tất
          </button>
        </li>
      </ul>

      <!-- Loading State -->
      <div v-if="borrowStore.isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted small mt-2">Đang đồng bộ dữ liệu mượn sách...</p>
      </div>

      <!-- Tab Content -->
      <div v-else class="tab-content">
        <!-- 1. TAB ĐANG MƯỢN -->
        <div v-if="activeTab === 'borrowed'">
          <div v-if="borrowStore.activeBorrows.length === 0" class="card border-0 shadow-sm p-5 text-center bg-white">
            <i class="bi bi-journal-check fs-1 text-muted mb-3"></i>
            <h5 class="font-serif">Bạn hiện không có sách nào đang mượn</h5>
            <p class="text-muted small mb-3">
              Mỗi độc giả có thể mượn tối đa 3 cuốn sách cùng lúc với thời hạn 14 ngày.
            </p>
            <div>
              <router-link to="/books" class="btn btn-primary btn-sm px-4">
                Khám phá kho sách ngay
              </router-link>
            </div>
          </div>

          <div v-else class="row g-4">
            <div
              v-for="item in borrowStore.activeBorrows"
              :key="item._id"
              class="col-lg-6"
            >
              <div class="card border-0 shadow-sm h-100 p-3 bg-white borrow-card">
                <div class="d-flex gap-3">
                  <!-- Ảnh sách có Link -->
                  <router-link :to="getBookDetailLink(item)" class="flex-shrink-0" :title="`Xem chi tiết: ${item.SachId?.TenSach || item.MaSach}`">
                    <img
                      :src="item.SachId?.HinhAnh || defaultCover"
                      :alt="item.SachId?.TenSach || item.MaSach"
                      class="rounded shadow-sm book-thumbnail-hover"
                      style="width: 85px; height: 125px; object-fit: cover;"
                      @error="onImageError"
                    />
                  </router-link>

                  <!-- Chi tiết phiếu mượn -->
                  <div class="flex-grow-1 d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                      <h6 class="font-serif fw-bold mb-0">
                        <router-link
                          :to="getBookDetailLink(item)"
                          class="text-decoration-none text-dark hover-primary"
                          :title="`Xem chi tiết: ${item.SachId?.TenSach || item.MaSach}`"
                        >
                          {{ item.SachId?.TenSach || item.MaSach }}
                        </router-link>
                      </h6>
                      <span class="badge bg-success-subtle text-success border border-success-subtle">
                        Đang mượn
                      </span>
                    </div>

                    <div class="small text-muted mb-2">
                      Tác giả: {{ item.SachId?.TacGia || 'Chưa cập nhật' }}
                    </div>

                    <div class="small bg-light p-2 rounded mb-2">
                      <div class="d-flex justify-content-between mb-1">
                        <span>Ngày mượn:</span>
                        <strong class="text-dark">{{ formatDate(item.NgayMuon) }}</strong>
                      </div>
                      <div class="d-flex justify-content-between">
                        <span>Hạn trả sách:</span>
                        <strong :class="isOverdue(item.HanTra || item.NgayTra) ? 'text-danger fw-bold' : 'text-primary'">
                          {{ formatDate(item.HanTra || item.NgayTra) }}
                          <span v-if="isOverdue(item.HanTra || item.NgayTra)" class="badge bg-danger ms-1">Quá hạn</span>
                        </strong>
                      </div>
                    </div>

                    <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                      <div class="small text-muted">
                        Số lần gia hạn: <strong>{{ item.SoLanGiaHan || 0 }} / 1</strong>
                      </div>

                      <div class="d-flex align-items-center gap-2">
                        <router-link
                          :to="getBookDetailLink(item)"
                          class="btn btn-sm btn-outline-secondary"
                          title="Xem chi tiết ấn phẩm"
                        >
                          <i class="bi bi-eye"></i>
                        </router-link>
                        <button
                          class="btn btn-sm btn-outline-success"
                          :disabled="item.SoLanGiaHan >= 1 || isOverdue(item.HanTra || item.NgayTra) || isActionLoading"
                          @click="handleRenew(item._id)"
                          title="Gia hạn thêm 7 ngày kể từ hạn trả hiện tại"
                        >
                          <i class="bi bi-arrow-repeat me-1"></i> Gia hạn (+7 ngày)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. TAB YÊU CẦU CHỜ DUYỆT & CHỜ NHẬN SÁCH -->
        <div v-if="activeTab === 'pending'">
          <div v-if="borrowStore.pendingBorrows.length === 0" class="card border-0 shadow-sm p-5 text-center bg-white">
            <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
            <h5 class="font-serif">Không có yêu cầu mượn nào đang chờ duyệt</h5>
            <p class="text-muted small">
              Khi bạn đăng ký mượn sách trực tuyến, yêu cầu sẽ xuất hiện tại đây trong thời gian thủ thư xét duyệt và chuẩn bị sách.
            </p>
          </div>

          <div v-else class="row g-4">
            <div
              v-for="item in borrowStore.pendingBorrows"
              :key="item._id"
              class="col-lg-6"
            >
              <div
                class="card border-0 shadow-sm h-100 p-3 bg-white border-start border-4"
                :class="item.TrangThai === 'APPROVED' ? 'border-success' : 'border-warning'"
              >
                <div class="d-flex gap-3">
                  <!-- Ảnh bìa sách có Link -->
                  <router-link :to="getBookDetailLink(item)" class="flex-shrink-0" :title="`Xem chi tiết: ${item.SachId?.TenSach || item.MaSach}`">
                    <img
                      :src="item.SachId?.HinhAnh || defaultCover"
                      :alt="item.SachId?.TenSach || item.MaSach"
                      class="rounded shadow-sm book-thumbnail-hover"
                      style="width: 85px; height: 125px; object-fit: cover;"
                      @error="onImageError"
                    />
                  </router-link>

                  <div class="flex-grow-1 d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                      <h6 class="font-serif fw-bold mb-0">
                        <router-link
                          :to="getBookDetailLink(item)"
                          class="text-decoration-none text-dark hover-primary"
                          :title="`Xem chi tiết: ${item.SachId?.TenSach || item.MaSach}`"
                        >
                          {{ item.SachId?.TenSach || item.MaSach }}
                        </router-link>
                      </h6>
                      <span
                        class="badge"
                        :class="item.TrangThai === 'APPROVED' ? 'bg-success text-white' : 'bg-warning text-dark'"
                      >
                        <i :class="item.TrangThai === 'APPROVED' ? 'bi bi-check2-circle me-1' : 'bi bi-clock me-1'"></i>
                        {{ item.TrangThai === 'APPROVED' ? 'Đã duyệt (Chờ lấy)' : 'Chờ duyệt' }}
                      </span>
                    </div>

                    <div class="small text-muted mb-2">
                      Mã sách: <code>{{ item.MaSach }}</code>
                      <span class="mx-1" v-if="item.SachId?.TacGia">•</span>
                      <span v-if="item.SachId?.TacGia">{{ item.SachId.TacGia }}</span>
                    </div>

                    <div class="small bg-light p-2 rounded mb-2">
                      <div class="d-flex justify-content-between mb-1">
                        <span>Ngày gửi yêu cầu:</span>
                        <span class="text-dark">{{ formatDate(item.NgayYeuCau || item.createdAt) }}</span>
                      </div>
                      <div class="d-flex justify-content-between mb-1" v-if="item.NgayHenLay">
                        <span>Ngày hẹn lấy sách:</span>
                        <strong class="text-success">{{ formatDate(item.NgayHenLay) }}</strong>
                      </div>
                      <div class="d-flex justify-content-between text-primary" v-if="item.TrangThai === 'APPROVED' && item.HanChotNhan">
                        <span>Hạn chót nhận (48h):</span>
                        <strong>{{ formatDate(item.HanChotNhan) }}</strong>
                      </div>
                    </div>

                    <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                      <template v-if="item.TrangThai === 'PENDING'">
                        <span class="small text-muted fst-italic">
                          <i class="bi bi-info-circle me-1"></i> Có thể hủy trước khi duyệt
                        </span>
                        <button
                          class="btn btn-sm btn-outline-danger"
                          @click="handleCancel(item._id)"
                          :disabled="isActionLoading"
                        >
                          <i class="bi bi-trash me-1"></i> Hủy yêu cầu
                        </button>
                      </template>
                      <template v-else-if="item.TrangThai === 'APPROVED'">
                        <span class="small text-success fw-semibold">
                          <i class="bi bi-geo-alt-fill me-1"></i> Vui lòng xuất trình mã thẻ tại quầy số 1
                        </span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. TAB LỊCH SỬ HOÀN TẤT & ĐÃ HỦY -->
        <div v-if="activeTab === 'history'">
          <div v-if="borrowStore.historyBorrows.length === 0" class="card border-0 shadow-sm p-5 text-center bg-white">
            <i class="bi bi-archive fs-1 text-muted mb-3"></i>
            <h5 class="font-serif">Chưa có lịch sử mượn trả nào</h5>
            <p class="text-muted small">Các cuốn sách bạn đã hoàn trả hoặc bị hủy sẽ được lưu giữ tại đây để tiện tra cứu lại.</p>
          </div>

          <div v-else class="card border-0 shadow-sm bg-white overflow-hidden">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Ấn phẩm</th>
                    <th>Ngày mượn / yêu cầu</th>
                    <th>Ngày trả / giải quyết</th>
                    <th>Trạng thái</th>
                    <th class="text-end">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in borrowStore.historyBorrows" :key="item._id">
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <router-link :to="getBookDetailLink(item)">
                          <img
                            :src="item.SachId?.HinhAnh || defaultCover"
                            :alt="item.SachId?.TenSach || item.MaSach"
                            class="rounded shadow-sm book-thumbnail-hover"
                            style="width: 40px; height: 55px; object-fit: cover;"
                            @error="onImageError"
                          />
                        </router-link>
                        <div>
                          <div class="fw-bold small">
                            <router-link
                              :to="getBookDetailLink(item)"
                              class="text-decoration-none text-dark hover-primary"
                            >
                              {{ item.SachId?.TenSach || item.MaSach }}
                            </router-link>
                          </div>
                          <div class="text-muted small" style="font-size: 0.75rem;">Mã: {{ item.MaSach }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="small">{{ formatDate(item.NgayMuon || item.NgayYeuCau || item.createdAt) }}</td>
                    <td class="small">{{ formatDate(item.NgayTraThucTe || item.NgayTra || item.updatedAt) }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="{
                          'bg-success': item.TrangThai === 'RETURNED',
                          'bg-secondary': item.TrangThai === 'CANCELLED',
                          'bg-danger': item.TrangThai === 'OVERDUE' || item.TrangThai === 'REJECTED' || item.TrangThai === 'EXPIRED'
                        }"
                      >
                        {{ getStatusLabel(item.TrangThai) }}
                      </span>
                    </td>
                    <td class="text-end">
                      <router-link
                        :to="getBookDetailLink(item)"
                        class="btn btn-outline-primary btn-sm py-0 px-2"
                        title="Xem lại ấn phẩm"
                      >
                        <i class="bi bi-box-arrow-up-right me-1"></i> Xem
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBorrowStore } from '../stores/borrowStore';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';

const borrowStore = useBorrowStore();
const toast = useToast();
const { confirm } = useConfirm();
const activeTab = ref('borrowed');
const isActionLoading = ref(false);
const defaultCover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';

const onImageError = (event) => {
  if (event?.target && event.target.src !== defaultCover) {
    event.target.src = defaultCover;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatCurrency = (val) => {
  if (!val) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const isOverdue = (dueDateStr) => {
  if (!dueDateStr) return false;
  return new Date(dueDateStr) < new Date();
};

const getStatusLabel = (st) => {
  const map = {
    RETURNED: 'Đã hoàn trả',
    CANCELLED: 'Đã hủy',
    OVERDUE: 'Quá hạn',
    BORROWED: 'Đang mượn',
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt (Chờ lấy)',
    REJECTED: 'Từ chối',
    EXPIRED: 'Hết hạn nhận'
  };
  return map[st] || st;
};

const getBookDetailLink = (item) => {
  if (!item) return '/books';
  if (item.SachId?._id) return `/books/${item.SachId._id}`;
  if (typeof item.SachId === 'string' && item.SachId.length === 24) return `/books/${item.SachId}`;
  if (item.MaSach) return `/books/${item.MaSach}`;
  return '/books';
};

const handleRenew = async (id) => {
  const isConfirmed = await confirm({
    title: 'Gia hạn mượn sách',
    message: 'Bạn có chắc chắn muốn gia hạn ấn phẩm này thêm 07 ngày mượn đọc không?',
    confirmText: 'Xác nhận gia hạn',
    type: 'primary',
    icon: 'bi-arrow-repeat'
  });
  if (!isConfirmed) return;

  isActionLoading.value = true;
  const res = await borrowStore.renewBorrow(id);
  if (res.success) toast.success(res.message);
  else toast.error(res.error);
  isActionLoading.value = false;
};

const handleCancel = async (id) => {
  const isConfirmed = await confirm({
    title: 'Hủy yêu cầu mượn sách',
    message: 'Bạn có chắc chắn muốn hủy bỏ yêu cầu mượn cuốn sách này?',
    confirmText: 'Hủy yêu cầu',
    type: 'danger',
    icon: 'bi-trash3-fill'
  });
  if (!isConfirmed) return;

  isActionLoading.value = true;
  const res = await borrowStore.cancelBorrow(id);
  if (res.success) toast.success(res.message);
  else toast.error(res.error);
  isActionLoading.value = false;
};

onMounted(() => {
  borrowStore.fetchMyBorrows();
  borrowStore.fetchMyFines();
});
</script>

<style scoped>
.custom-pills .nav-link {
  color: var(--color-text);
  background-color: #fff;
  border: 1px solid var(--color-border);
  font-weight: 500;
  border-radius: var(--radius-md);
  padding: 0.6rem 1.25rem;
  transition: all var(--transition-fast);
}

.custom-pills .nav-link.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.borrow-card {
  border-radius: var(--radius-md);
  transition: transform var(--transition-normal);
}

.borrow-card:hover {
  transform: translateY(-2px);
}

.hover-primary {
  transition: color var(--transition-fast);
}

.hover-primary:hover {
  color: var(--color-primary) !important;
  text-decoration: underline !important;
}

.book-thumbnail-hover {
  transition: transform var(--transition-fast), opacity var(--transition-fast);
}

.book-thumbnail-hover:hover {
  transform: scale(1.04);
  opacity: 0.9;
}
</style>
