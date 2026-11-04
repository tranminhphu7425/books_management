<template>
  <div class="book-detail-view py-4">
    <div class="container">
      <!-- Breadcrumb & Back button -->
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb small mb-0">
            <li class="breadcrumb-item"><router-link to="/">Trang chủ</router-link></li>
            <li class="breadcrumb-item"><a href="#" class="text-decoration-none" @click.prevent="goBack">Kho sách</a></li>
            <li class="breadcrumb-item active" aria-current="page" v-if="book">
              {{ (book.tenSach || book.TenSach) }}
            </li>
          </ol>
        </nav>
        <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1" @click="goBack">
          <i class="bi bi-arrow-left"></i> Quay lại
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="bookStore.isLoading" class="card border-0 shadow-sm p-5 text-center">
        <div class="spinner-border text-primary mx-auto mb-3" role="status"></div>
        <p class="text-muted">Đang tải thông tin chi tiết ấn phẩm...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="bookStore.error" class="alert alert-danger p-4 text-center">
        <i class="bi bi-exclamation-triangle fs-1 d-block mb-2"></i>
        <h5>Không tìm thấy thông tin ấn phẩm</h5>
        <p class="small">{{ bookStore.error }}</p>
        <router-link to="/books" class="btn btn-outline-primary btn-sm mt-2">
          Quay lại kho sách
        </router-link>
      </div>

      <!-- Main Book Detail -->
      <div v-else-if="book" class="row g-4">
        <!-- Cột Ảnh Bìa -->
        <div class="col-lg-4 col-md-5">
          <div class="card border-0 shadow-sm p-3 sticky-top bg-white" style="top: 85px;">
            <div class="detail-cover-container position-relative overflow-hidden rounded">
              <img
                :src="coverImage"
                :alt="(book.tenSach || book.TenSach)"
                class="img-fluid w-100 h-100 detail-cover-img"
                @error="handleImageError"
              />
              <div class="position-absolute top-0 end-0 m-2">
                <span
                  class="badge shadow-sm fs-6"
                  :class="isAvailable ? 'badge-available' : 'badge-unavailable'"
                >
                  <i :class="isAvailable ? 'bi bi-check-circle-fill me-1' : 'bi bi-dash-circle-fill me-1'"></i>
                  {{ isAvailable ? `Còn ${conLai} cuốn trong kho` : 'Tạm hết sách' }}
                </span>
              </div>
            </div>

            <!-- Nút Đặt Mượn bên dưới ảnh bìa -->
            <div class="mt-3">
              <!-- Trường hợp 1: Người dùng đã thực hiện đăng ký mượn ấn phẩm này -->
              <div v-if="existingBorrow" class="d-flex flex-column gap-2">
                <button
                  class="btn btn-secondary btn-lg w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  disabled
                >
                  <i class="bi bi-bookmark-check-fill fs-5 text-warning"></i>
                  Bạn đã đăng ký mượn sách này rồi
                </button>
                <router-link
                  to="/my-borrows"
                  class="btn btn-outline-primary btn-sm py-2 fw-semibold d-flex align-items-center justify-content-center gap-1 shadow-sm"
                >
                  <i class="bi bi-clock-history"></i>
                  Xem trong danh sách mượn của bạn
                </router-link>
              </div>

              <!-- Trường hợp 2: Còn sách trong kho để đăng ký -->
              <button
                v-else-if="isAvailable"
                class="btn btn-primary btn-lg w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
                @click="openBorrowModal"
              >
                <i class="bi bi-bookmark-plus-fill fs-5"></i>
                Đăng ký mượn sách
              </button>

              <!-- Trường hợp 3: Tạm hết sách trong kho -->
              <button
                v-else
                class="btn btn-secondary btn-lg w-100 py-3 fw-bold"
                disabled
              >
                <i class="bi bi-slash-circle me-1"></i>
                Tất cả ấn phẩm đang được mượn
              </button>
            </div>
          </div>
        </div>

        <!-- Cột Chi tiết Thông tin, Tác quyền & Nhận xét -->
        <div class="col-lg-8 col-md-7">
          <div class="card border-0 shadow-sm p-4 bg-white mb-4">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge bg-secondary" v-if="(book.theLoai || book.TheLoai)">{{ (book.theLoai || book.TheLoai) }}</span>
              <span class="badge bg-light text-dark border" v-if="(book.maSach || book.MaSach)">Mã: {{ (book.maSach || book.MaSach) }}</span>
            </div>

            <h1 class="detail-title font-serif mb-3 text-dark">{{ (book.tenSach || book.TenSach) }}</h1>

            <div class="row g-3 py-3 border-top border-bottom mb-4">
              <div class="col-sm-6">
                <span class="text-muted small d-block">Tác giả / Nguồn gốc</span>
                <strong class="text-dark">{{ (book.tacGia || book.TacGia) || (book.nguonGoc || book.NguonGoc) || 'Nhiều tác giả' }}</strong>
              </div>
              <div class="col-sm-6">
                <span class="text-muted small d-block">Nhà xuất bản</span>
                <strong class="text-dark">{{ publisherName }}</strong>
              </div>
              <div class="col-sm-6">
                <span class="text-muted small d-block">Năm xuất bản</span>
                <strong class="text-dark">{{ (book.namXuatBan || book.NamXuatBan) || 'N/A' }}</strong>
              </div>
              <div class="col-sm-6">
                <span class="text-muted small d-block">Vị trí lưu kho</span>
                <strong class="text-primary">
                  <i class="bi bi-geo-alt-fill me-1"></i> {{ (book.viTri || book.ViTri) || 'Kệ tham khảo chung' }}
                </strong>
              </div>
              <div class="col-sm-6">
                <span class="text-muted small d-block">Trị giá niêm yết ấn phẩm</span>
                <strong class="text-danger fs-5">{{ formatCurrency((book.donGia || book.DonGia)) }}</strong>
              </div>
              <div class="col-sm-6">
                <span class="text-muted small d-block">Hiện trạng kho</span>
                <span>
                  Đang có <strong>{{ conLai }}</strong> / <strong>{{ (book.soQuyen || book.SoQuyen) }}</strong> cuốn sẵn sàng
                </span>
              </div>
            </div>

            <!-- Tóm tắt nội dung -->
            <div class="mb-4">
              <h5 class="font-serif fw-bold text-dark mb-2">
                <i class="bi bi-card-text me-2 text-primary"></i> Tóm tắt nội dung
              </h5>
              <p class="text-secondary lh-lg mb-0" style="white-space: pre-line;">
                {{ (book.moTa || book.MoTa) || 'Ấn phẩm được tuyển chọn và lưu giữ tại Thư viện Kiến thức phục vụ mục đích nghiên cứu học tập, tham khảo chuyên sâu và phát triển kỹ năng cho bạn đọc.' }}
              </p>
            </div>

            <!-- Hướng dẫn và cam kết trách nhiệm mượn -->
            <div class="p-3 bg-light rounded border">
              <h6 class="font-serif fw-bold text-dark mb-2">
                <i class="bi bi-info-circle-fill text-info me-2"></i> Quy định mượn và hoàn trả
              </h6>
              <ul class="small text-muted mb-0 ps-3">
                <li>Thời gian mượn tiêu chuẩn là <strong>{{ settingsStore.borrowDays }} ngày</strong> kể từ khi bạn đọc ký nhận tại quầy.</li>
                <li>Hệ thống hỗ trợ gia hạn thêm <strong>{{ settingsStore.maxRenew }} lần (+{{ settingsStore.renewDays }} ngày)</strong> nếu sách chưa có độc giả khác đặt trước.</li>
                <li>Trường hợp làm mất hoặc hư hại ấn phẩm, bạn đọc có trách nhiệm bồi thường mặc định theo đúng giá trị niêm yết: <strong>{{ formatCurrency((book.donGia || book.DonGia)) }}</strong>.</li>
              </ul>
            </div>
          </div>

          <!-- Phần Nhận xét & Đánh giá từ Bạn đọc -->
          <div class="card border-0 shadow-sm p-4 bg-white">
            <div class="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 flex-wrap gap-2">
              <h4 class="font-serif fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-chat-heart text-primary"></i> Đánh giá và nhận xét
              </h4>
              <div class="d-flex align-items-center gap-2" v-if="totalReviews > 0">
                <div class="text-warning fs-5">
                  <i v-for="n in 5" :key="n" :class="n <= Math.round(averageRating) ? 'bi bi-star-fill' : 'bi bi-star'"></i>
                </div>
                <strong class="fs-5 text-dark">{{ averageRating }}</strong>
                <span class="text-muted small">({{ totalReviews }} nhận xét)</span>
              </div>
            </div>

            <!-- Form gửi nhận xét -->
            <!-- Trường hợp 1: Khách chưa đăng nhập -->
            <div v-if="!authStore.isAuthenticated" class="alert alert-light border d-flex align-items-center gap-3 p-3 mb-4">
              <i class="bi bi-shield-lock text-primary fs-3"></i>
              <div class="small">
                <strong>Bạn muốn chia sẻ cảm nhận về cuốn sách này?</strong>
                <p class="mb-0 text-muted">
                  Vui lòng <router-link :to="`/login?redirect=${route.fullPath}`" class="fw-bold text-primary">đăng nhập</router-link>. Theo quy chế thư viện, chỉ bạn đọc đã từng mượn và hoàn trả ấn phẩm thành công mới có quyền gửi nhận xét.
                </p>
              </div>
            </div>

            <!-- Trường hợp 2: Đã đăng nhập nhưng chưa từng mượn & trả sách này -->
            <div v-else-if="!hasReturned" class="alert alert-light border border-info-subtle d-flex align-items-center gap-3 p-3 mb-4">
              <i class="bi bi-info-circle-fill text-info fs-3"></i>
              <div class="small">
                <strong>Điều kiện để lại nhận xét</strong>
                <p class="mb-0 text-muted">
                  Chỉ những độc giả <strong>đã từng mượn</strong> ấn phẩm này mới có thể gửi nhận xét & đánh giá.
                </p>
              </div>
            </div>

            <!-- Trường hợp 3: Đã mượn & trả sách -> Hiển thị form đánh giá -->
            <div v-else class="card bg-light border-0 p-3 mb-4">
              <div class="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                <div class="d-flex align-items-center gap-2">
                  <img
                    :src="getUserAvatar(authStore.user)"
                    class="rounded-circle border"
                    style="width: 28px; height: 28px; object-fit: cover;"
                    @error="$event.target.src = getDefaultAvatar(authStore.user?.Phai || authStore.user?.phai)"
                  />
                  <h6 class="fw-bold text-dark mb-0">
                    {{ myReview ? 'Cập nhật nhận xét của bạn' : 'Gửi nhận xét của bạn' }}
                  </h6>
                </div>
                <div class="rating-stars d-flex gap-1 align-items-center">
                  <span class="small text-muted me-2">Đánh giá:</span>
                  <i
                    v-for="star in 5"
                    :key="star"
                    class="bi fs-5 cursor-pointer"
                    :class="(hoverRating || reviewForm.soSao) >= star ? 'bi-star-fill text-warning' : 'bi-star text-muted'"
                    @mouseover="hoverRating = star"
                    @mouseleave="hoverRating = 0"
                    @click="setRating(star)"
                    style="cursor: pointer;"
                  ></i>
                  <span class="ms-1 fw-bold text-warning small">{{ hoverRating || reviewForm.soSao }} sao</span>
                </div>
              </div>

              <textarea
                v-model="reviewForm.noiDung"
                class="form-control mb-2"
                rows="3"
                placeholder="Chia sẻ trải nghiệm, cảm nhận và đánh giá chân thực của bạn về ấn phẩm này..."
                maxlength="2000"
              ></textarea>
              <div class="d-flex justify-content-between align-items-center">
                <span class="small text-muted">{{ reviewForm.noiDung.length }}/2000 ký tự</span>
                <button
                  class="btn btn-primary btn-sm px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                  :disabled="isSubmittingReview || !reviewForm.noiDung.trim()"
                  @click="submitReview"
                >
                  <span v-if="isSubmittingReview" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="bi bi-send-fill"></i>
                  <span>{{ myReview ? 'Cập nhật nhận xét' : 'Gửi nhận xét' }}</span>
                </button>
              </div>
            </div>

            <!-- Danh sách nhận xét -->
            <div v-if="isLoadingReviews" class="text-center py-4 text-muted">
              <div class="spinner-border spinner-border-sm text-primary me-2"></div>
              <span>Đang tải nhận xét...</span>
            </div>

            <div v-else-if="reviews.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-chat-square-dots fs-1 d-block mb-2 text-secondary opacity-50"></i>
              <p class="mb-0">Chưa có nhận xét nào cho ấn phẩm này.</p>
              <p class="small text-muted">Hãy là người đầu tiên chia sẻ cảm nhận sau khi mượn và đọc sách!</p>
            </div>

            <div v-else class="reviews-list d-flex flex-column gap-3">
              <div
                v-for="r in reviews"
                :key="r._id"
                class="p-3 rounded border bg-light-subtle position-relative review-item"
              >
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="d-flex align-items-center gap-2">
                    <img
                      :src="getReviewAvatar(r)"
                      class="rounded-circle border"
                      style="width: 38px; height: 38px; object-fit: cover;"
                      @error="$event.target.src = getDefaultAvatar(r.PhaiDocGia)"
                    />
                    <div>
                      <div class="fw-bold text-dark small d-flex align-items-center gap-1">
                        {{ r.HoTenDocGia }}
                        <span v-if="isMyReview(r)" class="badge bg-primary-subtle text-primary border border-primary-subtle ms-1" style="font-size: 0.7rem;">Bạn</span>
                        <span class="badge bg-success-subtle text-success border border-success-subtle ms-1" style="font-size: 0.7rem;">Đã đọc</span>
                      </div>
                      <div class="text-warning small">
                        <i v-for="star in 5" :key="star" :class="star <= r.SoSao ? 'bi bi-star-fill' : 'bi bi-star'"></i>
                        <span class="text-muted ms-2" style="font-size: 0.75rem;">{{ formatDate(r.createdAt) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Nút Xóa nhận xét (chỉ hiển thị nếu là nhận xét của chính độc giả đang đăng nhập) -->
                  <button
                    v-if="isMyReview(r)"
                    class="btn btn-sm btn-outline-danger border-0 d-flex align-items-center gap-1"
                    title="Xóa nhận xét của bạn"
                    @click="handleDeleteReview(r._id)"
                  >
                    <i class="bi bi-trash"></i>
                    <span class="small d-none d-sm-inline">Xóa</span>
                  </button>
                </div>

                <p class="mb-0 text-secondary small lh-base" style="white-space: pre-line;">{{ r.NoiDung }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Borrow Modal Component -->
    <BorrowModal :book="book" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookStore } from '../stores/bookStore';
import { useBorrowStore } from '../stores/borrowStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';
import BorrowModal from '../components/BorrowModal.vue';
import { getImageUrl } from '../utils/imageHelper';
import { getUserAvatar, getDefaultAvatar } from '../utils/avatarHelper';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const bookStore = useBookStore();
const borrowStore = useBorrowStore();
const toast = useToast();
const settingsStore = useSettingsStore();
const authStore = useAuthStore();
const { showConfirm } = useConfirm();

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/books');
  }
};

const defaultCover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
const imageFallback = ref(false);

const book = computed(() => bookStore.currentBook);

// Kiểm tra xem người dùng hiện tại đã đăng ký mượn hoặc đang mượn ấn phẩm này chưa
const existingBorrow = computed(() => {
  if (!authStore.isAuthenticated || !book.value) return null;
  const currentId = String(book.value._id || route.params.id || '');
  const currentMa = String(book.value.maSach || book.value.MaSach || '');

  return borrowStore.myBorrows.find((b) => {
    if (!['PENDING', 'APPROVED', 'BORROWED'].includes(b.TrangThai)) {
      return false;
    }
    const bSachId = b.SachId?._id ? String(b.SachId._id) : String(b.SachId || '');
    const bMaSach = String(b.MaSach || b.SachId?.MaSach || '');

    return (currentId && bSachId === currentId) || (currentMa && bMaSach === currentMa);
  });
});

// Reviews State
const reviews = ref([]);
const averageRating = ref(5.0);
const totalReviews = ref(0);
const canReview = ref(false);
const hasReturned = ref(false);
const myReview = ref(null);
const isLoadingReviews = ref(false);
const isSubmittingReview = ref(false);

const reviewForm = ref({
  soSao: 5,
  noiDung: ''
});
const hoverRating = ref(0);

const setRating = (star) => {
  reviewForm.value.soSao = star;
};

const isMyReview = (r) => {
  if (!authStore.isAuthenticated || !authStore.user) return false;
  const currentUserId = authStore.user._id || authStore.user.id;
  return (
    r.DocGiaId === currentUserId ||
    (myReview.value && myReview.value._id === r._id)
  );
};

const getReviewAvatar = (r) => {
  return getUserAvatar({
    HinhAnh: r.AvatarDocGia || r.HinhAnh,
    avatar: r.AvatarDocGia || r.HinhAnh,
    phai: r.PhaiDocGia || r.Phai
  });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchReviews = async (bookId) => {
  if (!bookId) return;
  isLoadingReviews.value = true;
  try {
    const res = await api.get(`/reviews/book/${bookId}`);
    if (res.data?.success) {
      reviews.value = res.data.data.reviews || [];
      averageRating.value = res.data.data.averageRating || 5.0;
      totalReviews.value = res.data.data.totalReviews || 0;
      canReview.value = res.data.data.canReview || false;
      hasReturned.value = res.data.data.hasReturned || false;
      myReview.value = res.data.data.myReview || null;
      if (myReview.value) {
        reviewForm.value.soSao = myReview.value.SoSao || 5;
        reviewForm.value.noiDung = myReview.value.NoiDung || '';
      }
    }
  } catch (err) {
    console.error('Lỗi khi tải danh sách nhận xét:', err);
  } finally {
    isLoadingReviews.value = false;
  }
};

const submitReview = async () => {
  if (!reviewForm.value.noiDung.trim()) {
    toast.warning('Vui lòng nhập nội dung nhận xét (tối thiểu 2 ký tự).');
    return;
  }
  isSubmittingReview.value = true;
  try {
    const targetBookId = book.value?._id || route.params.id;
    const res = await api.post('/reviews', {
      bookId: targetBookId,
      soSao: reviewForm.value.soSao,
      noiDung: reviewForm.value.noiDung.trim()
    });
    if (res.data?.success) {
      toast.success(res.data.message || 'Gửi nhận xét thành công!');
      await fetchReviews(targetBookId);
    }
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.response?.data?.message || 'Không thể gửi nhận xét.';
    toast.error(msg);
  } finally {
    isSubmittingReview.value = false;
  }
};

const handleDeleteReview = async (reviewId) => {
  const confirmed = await showConfirm({
    title: 'Xóa nhận xét',
    message: 'Bạn có chắc chắn muốn xóa nhận xét của mình cho ấn phẩm này?',
    confirmText: 'Xóa nhận xét',
    cancelText: 'Giữ lại',
    type: 'danger'
  });
  if (!confirmed) return;

  try {
    const res = await api.delete(`/reviews/${reviewId}`);
    if (res.data?.success) {
      toast.success('Đã xóa nhận xét của bạn thành công.');
      reviewForm.value.soSao = 5;
      reviewForm.value.noiDung = '';
      myReview.value = null;
      const targetBookId = book.value?._id || route.params.id;
      await fetchReviews(targetBookId);
    }
  } catch (err) {
    const msg = err.response?.data?.error?.message || 'Không thể xóa nhận xét.';
    toast.error(msg);
  }
};

const publisherName = computed(() => {
  if (!book.value) return 'Chưa cập nhật';
  if (book.value.NhaXuatBanInfo?.TenNXB) return book.value.NhaXuatBanInfo.TenNXB;
  if (book.value.TenNXB) return book.value.TenNXB;
  if (book.value.NhaXuatBan && book.value.NhaXuatBan !== book.value.MaNXB) return book.value.NhaXuatBan;
  if (bookStore.publishers && bookStore.publishers.length > 0) {
    const found = bookStore.publishers.find(
      (p) => p.MaNXB === book.value.MaNXB || p._id === book.value.MaNXB
    );
    if (found) return found.TenNXB;
  }
  return book.value.MaNXB || 'Chưa cập nhật';
});

const coverImage = computed(() => {
  if (imageFallback.value || !book.value?.HinhAnh) return defaultCover;
  return getImageUrl(book.value.HinhAnh, defaultCover);
});

const handleImageError = () => {
  imageFallback.value = true;
};

const conLai = computed(() => {
  if (!book.value) return 0;
  if (book.value.SoQuyenKhaDung !== undefined && book.value.SoQuyenKhaDung !== null) {
    return Math.max(0, Number(book.value.SoQuyenKhaDung));
  }
  if (book.value.SoQuyenConLai !== undefined && book.value.SoQuyenConLai !== null) {
    return Math.max(0, Number(book.value.SoQuyenConLai));
  }
  const total = Number(book.value.SoQuyen) || 0;
  const borrowed = Number(book.value.SoQuyenDangMuon) || 0;
  const damaged = Number(book.value.SoQuyenHuHong) || 0;
  return Math.max(0, total - borrowed - damaged);
});

const isAvailable = computed(() => conLai.value > 0);

const formatCurrency = (val) => {
  if (!val) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const openBorrowModal = () => {
  if (existingBorrow.value) {
    toast.info('Bạn đã đăng ký mượn ấn phẩm này rồi.');
    return;
  }
  if (!isAvailable.value) {
    toast.warning('Ấn phẩm hiện tại đang tạm hết trong kho.');
    return;
  }
  const modalEl = document.getElementById('borrowModal');
  if (modalEl && window.bootstrap) {
    const modal = new window.bootstrap.Modal(modalEl);
    modal.show();
  }
};

watch(
  () => authStore.isAuthenticated,
  (newVal) => {
    if (newVal) {
      borrowStore.fetchMyBorrows();
    }
  }
);

onMounted(async () => {
  const bookId = route.params.id;
  await bookStore.fetchPublishers();
  if (authStore.isAuthenticated) {
    borrowStore.fetchMyBorrows();
  }
  if (bookId) {
    await bookStore.fetchBookById(bookId);
    if (bookStore.error) {
      toast.error(bookStore.error);
    } else {
      await fetchReviews(bookStore.currentBook?._id || bookId);
    }
  }
});
</script>

<style scoped>
.detail-cover-container {
  aspect-ratio: 2 / 3;
  background-color: var(--color-bg);
}

.detail-cover-img {
  object-fit: cover;
}

.detail-title {
  font-size: 1.85rem;
  font-weight: 700;
  line-height: 1.3;
}

.cursor-pointer {
  cursor: pointer;
  transition: transform 0.15s ease-in-out;
}

.cursor-pointer:hover {
  transform: scale(1.2);
}

.review-item {
  transition: all 0.2s ease;
}

.review-item:hover {
  border-color: var(--bs-primary-border-subtle) !important;
}
</style>
