<template>
  <div
    class="modal fade"
    id="borrowModal"
    tabindex="-1"
    aria-labelledby="borrowModalLabel"
    aria-hidden="true"
    ref="modalRef"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title font-serif fs-5 text-white" id="borrowModalLabel">
            <i class="bi bi-bookmark-plus me-2"></i> Xác nhận Đăng ký Mượn Sách
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            data-bs-dismiss="modal"
            aria-label="Đóng"
          ></button>
        </div>

        <div class="modal-body p-4" v-if="book">
          <!-- Thông tin tóm tắt sách -->
          <div class="d-flex gap-3 mb-4 p-3 bg-light rounded">
            <img
              :src="modalCoverImage"
              :alt="(book.tenSach || book.TenSach)"
              class="rounded shadow-sm"
              style="width: 70px; height: 105px; object-fit: cover;"
              @error="handleImageError"
            />
            <div class="flex-grow-1">
              <h6 class="fw-bold font-serif mb-1">{{ (book.tenSach || book.TenSach) }}</h6>
              <div class="small text-muted mb-1">
                Tác giả: <strong>{{ (book.tacGia || book.TacGia) || (book.nguonGoc || book.NguonGoc) || 'Nhiều tác giả' }}</strong>
              </div>
              <div class="small text-muted mb-1">
                Mã ấn phẩm: <code>{{ (book.maSach || book.MaSach) }}</code>
              </div>
              <div class="small text-muted" v-if="(book.viTri || book.ViTri)">
                Vị trí kệ: <span class="badge bg-secondary">{{ (book.viTri || book.ViTri) }}</span>
              </div>
            </div>
          </div>

          <!-- Cảnh báo nếu chưa đăng nhập -->
          <div v-if="!authStore.isAuthenticated" class="alert alert-warning mb-0">
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-person-exclamation fs-4"></i>
              <strong>Yêu cầu đăng nhập tài khoản bạn đọc</strong>
            </div>
            <p class="small mb-3">
              Bạn cần có thẻ bạn đọc hợp lệ và đăng nhập vào hệ thống để có thể thực hiện đặt mượn sách trực tuyến.
            </p>
            <button
              type="button"
              class="btn btn-primary btn-sm w-100 fw-semibold shadow-sm"
              @click="goToLogin"
            >
              <i class="bi bi-box-arrow-in-right me-1"></i> Đăng nhập ngay
            </button>
          </div>

          <!-- Form đăng ký nếu đã đăng nhập -->
          <form v-else @submit.prevent="submitBorrowRequest">
            <!-- Ràng buộc số lượng sách -->
            <div
              v-if="(borrowStore.activeBorrowCount + borrowStore.pendingBorrowCount) >= settingsStore.maxBooks"
              class="alert alert-danger py-2 small mb-3"
            >
              <i class="bi bi-x-circle-fill me-1"></i>
              Bạn đã có <strong>{{ borrowStore.activeBorrowCount + borrowStore.pendingBorrowCount }} / {{ settingsStore.maxBooks }} cuốn</strong> đang mượn hoặc chờ nhận (Giới hạn tối đa: {{ settingsStore.maxBooks }} cuốn). Vui lòng hoàn tất đơn hiện tại trước khi mượn thêm.
            </div>

            <!-- Cảnh báo tiền bồi thường chưa nộp -->
            <div
              v-else-if="borrowStore.totalUnpaidFineAmount > 0"
              class="alert alert-danger py-2 small mb-3"
            >
              <i class="bi bi-cash-coin me-1"></i>
              Tài khoản đang có khoản bồi thường chưa thanh toán. Vui lòng nộp phạt trực tiếp tại quầy thư viện.
            </div>

            <!-- Cảnh báo nếu đã đăng ký mượn cuốn sách này rồi -->
            <div
              v-else-if="isAlreadyBorrowed"
              class="alert alert-warning py-3 small mb-0"
            >
              <div class="d-flex align-items-center gap-2 mb-1">
                <i class="bi bi-bookmark-check-fill fs-5 text-warning"></i>
                <strong class="fs-6">Bạn đã đăng ký mượn sách này rồi</strong>
              </div>
              <p class="mb-2">Bạn đang có yêu cầu chờ nhận hoặc đang mượn ấn phẩm này. Mỗi bạn đọc chỉ được mượn 1 cuốn cho cùng một đầu sách.</p>
              <router-link to="/my-borrows" class="btn btn-warning btn-sm fw-bold text-dark" data-bs-dismiss="modal">
                <i class="bi bi-arrow-right-circle me-1"></i> Xem danh sách mượn của bạn
              </router-link>
            </div>

            <template v-else>
              <!-- Chọn ngày hẹn đến nhận sách -->
              <div class="mb-3">
                <label for="pickupDate" class="form-label fw-semibold small">
                  Ngày hẹn đến thư viện nhận sách <span class="text-danger">*</span>
                </label>
                <input
                  type="date"
                  id="pickupDate"
                  v-model="ngayHenLay"
                  class="form-control"
                  :min="minDate"
                  :max="maxDate"
                  required
                />
                <div class="form-text small">
                  Bạn có thể chọn ngày nhận sách từ hôm nay đến tối đa 3 ngày tiếp theo.
                </div>
              </div>

              <!-- Lưu ý quy định mượn -->
              <div class="p-3 bg-light rounded small text-muted mb-3 border">
                <div class="fw-bold text-dark mb-1">
                  <i class="bi bi-clock-history text-primary me-1"></i> Quy định lưu ý:
                </div>
                <ul class="mb-0 ps-3">
                  <li>Thời hạn mượn sách tiêu chuẩn: <strong>{{ settingsStore.borrowDays }} ngày</strong> kể từ khi thủ thư quét xuất kho.</li>
                  <li>Nếu sau ngày hẹn lấy sách <strong>{{ settingsStore.holdHours }} giờ</strong> bạn đọc không tới nhận, yêu cầu sẽ tự động hủy.</li>
                </ul>
              </div>

              <!-- Thông báo lỗi khi submit -->
              <div v-if="errorMessage" class="alert alert-danger py-2 small mb-3">
                {{ errorMessage }}
              </div>

              <!-- Thông báo thành công -->
              <div v-if="successMessage" class="alert alert-success py-2 small mb-3">
                <i class="bi bi-check-circle-fill me-1"></i> {{ successMessage }}
              </div>

              <!-- Nút hành động -->
              <div class="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  data-bs-dismiss="modal"
                  :disabled="isLoading"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  class="btn btn-primary px-4"
                  :disabled="isLoading || !isEligibleToBorrow"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Gửi yêu cầu mượn
                </button>
              </div>
            </template>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useBorrowStore } from '../stores/borrowStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useToast } from '../composables/useToast';
import { getImageUrl } from '../utils/imageHelper';

const props = defineProps({
  book: {
    type: Object,
    default: null
  }
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const borrowStore = useBorrowStore();
const settingsStore = useSettingsStore();
const toast = useToast();

const modalRef = ref(null);

const goToLogin = () => {
  // 1. Đóng Modal qua Bootstrap instance
  const modalElement = modalRef.value;
  if (modalElement && window.bootstrap) {
    const bsModal = window.bootstrap.Modal.getInstance(modalElement);
    if (bsModal) {
      bsModal.hide();
    }
  }

  // 2. Dọn dẹp backdrop đề phòng chuyển trang mà backdrop còn dính
  setTimeout(() => {
    document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');

    // 3. Chuyển hướng kèm redirect về đúng trang sách hiện tại
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    });
  }, 150);
};
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const defaultCover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
const imageFallback = ref(false);

const modalCoverImage = computed(() => {
  if (imageFallback.value || !(props.book?.hinhAnh || props.book?.HinhAnh)) return defaultCover;
  return getImageUrl((props.book.hinhAnh || props.book.HinhAnh), defaultCover);
});

const handleImageError = () => {
  imageFallback.value = true;
};

// Tính toán min date (hôm nay) và max date (sau 3 ngày) theo định dạng YYYY-MM-DD
const today = new Date();
const minDate = today.toISOString().split('T')[0];

const next3Days = new Date();
next3Days.setDate(today.getDate() + 3);
const maxDate = next3Days.toISOString().split('T')[0];

const ngayHenLay = ref(minDate);

const isAlreadyBorrowed = computed(() => {
  if (!authStore.isAuthenticated || !props.book) return false;
  const currentId = String(props.book._id || props.book.id || "");
  const currentMa = String(props.book.maSach || props.book.MaSach || "");
  return borrowStore.myBorrows.some((b) => {
    if (!["PENDING", "APPROVED", "BORROWED"].includes(b.TrangThai)) return false;
    const bSachId = b.SachId?._id ? String(b.SachId._id) : String(b.SachId || "");
    const bMaSach = String(b.MaSach || b.SachId?.MaSach || "");
    return (currentId && bSachId === currentId) || (currentMa && bMaSach === currentMa);
  });
});

const isEligibleToBorrow = computed(() => {
  if (!authStore.isAuthenticated) return false;
  if (isAlreadyBorrowed.value) return false;
  if ((borrowStore.activeBorrowCount + borrowStore.pendingBorrowCount) >= settingsStore.maxBooks) return false;
  if (borrowStore.totalUnpaidFineAmount > 0) return false;
  return true;
});

const submitBorrowRequest = async () => {
  if (!props.book) return;
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  const res = await borrowStore.requestBorrow(props.book._id, ngayHenLay.value);

  if (res.success) {
    const okMsg = res.message || 'Gửi yêu cầu mượn ấn phẩm thành công!';
    successMessage.value = okMsg;
    toast.success(okMsg);
    setTimeout(() => {
      // Đóng modal qua Bootstrap
      const modalElement = modalRef.value;
      if (modalElement && window.bootstrap) {
        const bsModal = window.bootstrap.Modal.getInstance(modalElement);
        if (bsModal) bsModal.hide();
      }
      router.push('/my-borrows');
    }, 1200);
  } else {
    errorMessage.value = res.error;
    toast.error(res.error || 'Yêu cầu mượn sách không thành công.');
  }
  isLoading.value = false;
};
</script>
