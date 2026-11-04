<template>
  <div class="modal fade" id="bookDetailModal" tabindex="-1" aria-hidden="true" ref="modalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <!-- Header -->
        <div class="modal-header bg-primary text-white py-3">
          <h5 class="modal-title font-serif fs-5 d-flex align-items-center">
            <i class="bi bi-book-half me-2"></i> Chi Tiết Ấn Phẩm Thư Viện
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Body -->
        <div class="modal-body p-4" v-if="book">
          <div class="row g-4">
            <!-- Cột trái: Ảnh bìa và trạng thái kho -->
            <div class="col-md-4 text-center">
              <div class="book-cover-wrapper rounded-3 shadow-sm border p-2 bg-light mb-3">
                <img
                  :src="getImageUrl(book.hinhAnh || book.HinhAnh, defaultCover)"
                  :alt="book.tenSach || book.TenSach"
                  class="img-fluid rounded shadow-sm book-cover-img"
                  @error="$event.target.src = defaultCover"
                />
              </div>

              <!-- Thẻ trạng thái lưu hành -->
              <div class="mb-3">
                <span
                  class="badge px-3 py-2 rounded-pill fs-6"
                  :class="(book.trangThai || book.TrangThai) === 'ARCHIVED' ? 'bg-secondary' : 'bg-success'"
                >
                  <i :class="(book.trangThai || book.TrangThai) === 'ARCHIVED' ? 'bi bi-archive-fill me-1' : 'bi bi-check-circle-fill me-1'"></i>
                  {{ (book.trangThai || book.TrangThai) === 'ARCHIVED' ? 'Kho Lưu Trữ (Đã ẩn)' : 'Đang Lưu Hành' }}
                </span>
              </div>

              <!-- Bảng tóm tắt số lượng -->
              <div class="card bg-light border-0 p-2 text-start small">
                <div class="d-flex justify-content-between py-1 border-bottom">
                  <span class="text-muted">Tổng nhập kho:</span>
                  <strong>{{ book.soQuyen ?? book.SoQuyen ?? 0 }} bản</strong>
                </div>
                <div class="d-flex justify-content-between py-1 border-bottom text-success">
                  <span>Khả dụng trên kệ:</span>
                  <strong>{{ book.soQuyenKhaDung ?? book.SoQuyenKhaDung ?? ((book.soQuyen ?? book.SoQuyen ?? 0) - (book.soQuyenDangMuon ?? book.SoQuyenDangMuon ?? 0)) }} bản</strong>
                </div>
                <div class="d-flex justify-content-between py-1 border-bottom text-warning-emphasis">
                  <span>Đang cho mượn:</span>
                  <strong>{{ book.soQuyenDangMuon ?? book.SoQuyenDangMuon ?? 0 }} bản</strong>
                </div>
                <div class="d-flex justify-content-between py-1 text-danger" v-if="(book.soQuyenHuHong ?? book.SoQuyenHuHong ?? 0) > 0">
                  <span>Hư hỏng / Mất:</span>
                  <strong>{{ book.soQuyenHuHong ?? book.SoQuyenHuHong }} bản</strong>
                </div>
              </div>
            </div>

            <!-- Cột phải: Thông tin thư mục chi tiết -->
            <div class="col-md-8">
              <h4 class="font-serif fw-bold text-dark mb-2">{{ book.tenSach || book.TenSach }}</h4>
              <div class="d-flex flex-wrap gap-2 mb-3">
                <span class="badge bg-light text-dark border font-monospace">Mã: {{ book.maSach || book.MaSach }}</span>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle" v-if="book.theLoai || book.TheLoai">
                  <i class="bi bi-tag-fill me-1"></i>{{ book.theLoai || book.TheLoai }}
                </span>
                <span class="badge bg-light text-muted border" v-if="book.isbn || book.ISBN">
                  ISBN: {{ book.isbn || book.ISBN }}
                </span>
              </div>

              <div class="table-responsive">
                <table class="table table-sm table-borderless small mb-3">
                  <tbody>
                    <tr>
                      <td class="text-muted" style="width: 140px;">Tác giả / Dịch giả:</td>
                      <td class="fw-semibold text-dark">{{ book.tacGia || book.TacGia || book.nguonGoc || book.NguonGoc || 'Chưa rõ' }}</td>
                    </tr>
                    <tr>
                      <td class="text-muted">Nhà xuất bản:</td>
                      <td class="fw-semibold text-dark">
                        {{ book.tenNXB || book.TenNXB || book.nhaXuatBan || book.NhaXuatBan || (book.maNXB?.tenNXB || book.maNXB?.TenNXB || book.maNXB || book.MaNXB) || 'Chưa cập nhật' }}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-muted">Năm xuất bản:</td>
                      <td class="text-dark">{{ book.namXuatBan || book.NamXuatBan || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td class="text-muted">Đơn giá niêm yết:</td>
                      <td class="fw-bold text-danger">{{ formatCurrency(book.donGia ?? book.DonGia) }}</td>
                    </tr>
                    <tr>
                      <td class="text-muted">Vị trí lưu kho:</td>
                      <td>
                        <span class="badge bg-light text-dark border">
                          <i class="bi bi-geo-alt-fill text-danger me-1"></i>{{ book.viTri || book.ViTri || 'Kệ chung' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Tóm tắt nội dung -->
              <div class="border-top pt-3">
                <h6 class="font-serif fw-bold text-dark small mb-2">
                  <i class="bi bi-card-text text-primary me-1"></i> Tóm tắt giới thiệu ấn phẩm:
                </h6>
                <div class="p-3 bg-light rounded text-secondary small lh-base" style="max-height: 140px; overflow-y: auto;">
                  {{ book.moTa || book.MoTa || 'Chưa có thông tin mô tả chi tiết cho ấn phẩm này.' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Phần Nhận xét & Đánh giá từ Bạn đọc (Quản trị viên / Thủ thư kiểm duyệt) -->
          <div class="border-top pt-4 mt-4">
            <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
              <h6 class="font-serif fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-chat-quote-fill text-primary"></i>
                <span>Nhận Xét & Đánh Giá Của Bạn Đọc</span>
                <span class="badge bg-secondary-subtle text-secondary border ms-1" v-if="reviews.length > 0">
                  {{ reviews.length }} nhận xét
                </span>
              </h6>
              <div class="d-flex align-items-center gap-2 small" v-if="reviews.length > 0">
                <div class="text-warning">
                  <i v-for="n in 5" :key="n" :class="n <= Math.round(averageRating) ? 'bi bi-star-fill' : 'bi bi-star'"></i>
                </div>
                <strong class="text-dark">{{ averageRating }}/5.0</strong>
              </div>
            </div>

            <!-- Loading nhận xét -->
            <div v-if="isLoadingReviews" class="text-center py-3 text-muted small">
              <span class="spinner-border spinner-border-sm text-primary me-2"></span>
              Đang tải danh sách nhận xét...
            </div>

            <!-- Không có nhận xét -->
            <div v-else-if="reviews.length === 0" class="alert alert-light border text-center py-3 mb-0 small text-muted">
              <i class="bi bi-chat-left-dots me-1"></i> Chưa có nhận xét nào từ bạn đọc cho ấn phẩm này.
            </div>

            <!-- Danh sách nhận xét -->
            <div v-else class="reviews-admin-list d-flex flex-column gap-2" style="max-height: 280px; overflow-y: auto;">
              <div
                v-for="rev in reviews"
                :key="rev._id"
                class="p-3 rounded border bg-light-subtle d-flex flex-column gap-1"
              >
                <div class="d-flex justify-content-between align-items-start gap-2">
                  <div class="d-flex align-items-center gap-2">
                    <img
                      :src="getReviewAvatar(rev)"
                      class="rounded-circle border"
                      style="width: 32px; height: 32px; object-fit: cover;"
                      @error="$event.target.src = getDefaultAvatar(rev.PhaiDocGia)"
                    />
                    <div>
                      <div class="fw-semibold text-dark small d-flex align-items-center gap-1">
                        {{ rev.HoTenDocGia }}
                        <span class="badge bg-light text-muted border font-monospace" style="font-size: 0.7rem;">
                          {{ rev.MaDocGia }}
                        </span>
                      </div>
                      <div class="text-warning small" style="font-size: 0.75rem;">
                        <i v-for="star in 5" :key="star" :class="star <= rev.SoSao ? 'bi bi-star-fill' : 'bi bi-star'"></i>
                        <span class="text-muted ms-2">{{ formatDate(rev.createdAt) }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Nút Xóa nhận xét (Staff) -->
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger py-1 px-2 d-flex align-items-center gap-1 small"
                    title="Xóa nhận xét không chính xác hoặc vi phạm"
                    @click="handleDeleteReview(rev._id)"
                  >
                    <i class="bi bi-trash"></i>
                    <span>Xóa vi phạm</span>
                  </button>
                </div>

                <div class="text-secondary small mt-1 ps-1" style="white-space: pre-line;">
                  {{ rev.NoiDung }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading spinner -->
        <div class="modal-body p-5 text-center" v-else-if="isLoading">
          <div class="spinner-border text-primary mb-2"></div>
          <div class="text-muted small">Đang tải dữ liệu ấn phẩm...</div>
        </div>

        <!-- Footer -->
        <div class="modal-footer bg-light py-2 d-flex justify-content-between">
          <button
            v-if="book && !isBooksManagePage"
            type="button"
            class="btn btn-primary btn-sm px-3 shadow-sm d-flex align-items-center gap-2"
            @click="goToBookManageAndEdit"
          >
            <i class="bi bi-pencil-square"></i>
            <span>Quản Lý & Chỉnh Sửa Ấn Phẩm Này</span>
          </button>
          <div v-else></div>

          <button type="button" class="btn btn-secondary btn-sm px-4" data-bs-dismiss="modal">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';
import { getImageUrl } from '../utils/imageHelper';
import { getUserAvatar, getDefaultAvatar } from '../utils/avatarHelper';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { showConfirm } = useConfirm();

const modalRef = ref(null);
const book = ref(null);
const isLoading = ref(false);
const defaultCover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';

// Reviews state
const reviews = ref([]);
const averageRating = ref(5.0);
const isLoadingReviews = ref(false);

const isBooksManagePage = computed(() => {
  return route.name === 'BooksManage' || route.path === '/books';
});

const getReviewAvatar = (rev) => {
  return getUserAvatar({
    HinhAnh: rev.AvatarDocGia || rev.HinhAnh,
    avatar: rev.AvatarDocGia || rev.HinhAnh,
    phai: rev.PhaiDocGia || rev.Phai
  });
};

const formatCurrency = (val) => {
  if (!val) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
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
    }
  } catch (err) {
    console.error('Lỗi khi tải nhận xét cho quản trị:', err);
  } finally {
    isLoadingReviews.value = false;
  }
};

const handleDeleteReview = async (reviewId) => {
  const confirmed = await showConfirm({
    title: 'Xóa nhận xét',
    message: 'Bạn có chắc chắn muốn xóa nhận xét này? Thao tác này sẽ gỡ bỏ nhận xét vĩnh viễn và lưu lại trong nhật ký hoạt động hệ thống.',
    confirmText: 'Xóa nhận xét',
    cancelText: 'Giữ lại',
    type: 'danger'
  });
  if (!confirmed) return;

  try {
    const res = await api.delete(`/reviews/${reviewId}`);
    if (res.data?.success) {
      toast.success(res.data.message || 'Đã xóa nhận xét vi phạm thành công.');
      const currentBookId = book.value?._id || book.value?.maSach || book.value?.MaSach;
      await fetchReviews(currentBookId);
    }
  } catch (err) {
    const msg = err.response?.data?.error?.message || 'Không thể xóa nhận xét.';
    toast.error(msg);
  }
};

const goToBookManageAndEdit = () => {
  if (!book.value) return;
  const targetId = book.value._id || book.value.maSach || book.value.MaSach;
  const targetCode = book.value.maSach || book.value.MaSach || '';
  const targetStatus = book.value.trangThai || book.value.TrangThai || 'ACTIVE';

  const modal = window.bootstrap.Modal.getInstance(modalRef.value);
  if (modal) modal.hide();

  // Navigate to /books with query params
  router.push({
    path: '/books',
    query: {
      search: targetCode,
      status: targetStatus,
      highlight: targetId,
      autoEdit: 'true'
    }
  });
};

const open = async (bookDataOrId) => {
  if (!bookDataOrId) return;

  const modal = new window.bootstrap.Modal(modalRef.value);
  modal.show();

  reviews.value = [];
  averageRating.value = 5.0;
  let targetId = null;

  if (typeof bookDataOrId === 'string') {
    isLoading.value = true;
    book.value = null;
    targetId = bookDataOrId;
    try {
      const res = await api.get(`/books/${bookDataOrId}`);
      book.value = res.data.data;
      targetId = book.value?._id || bookDataOrId;
    } catch (err) {
      console.error('Lỗi khi tải chi tiết sách:', err);
    } finally {
      isLoading.value = false;
    }
  } else if (bookDataOrId._id && (!bookDataOrId.TenNXB && !bookDataOrId.MoTa)) {
    // If partial object, use what we have and fetch full detail in background
    book.value = bookDataOrId;
    targetId = bookDataOrId._id;
    try {
      const res = await api.get(`/books/${bookDataOrId._id}`);
      if (res.data.data) {
        book.value = res.data.data;
        targetId = book.value._id;
      }
    } catch (err) {
      // Keep existing data
    }
  } else {
    book.value = bookDataOrId;
    targetId = bookDataOrId._id || bookDataOrId.maSach || bookDataOrId.MaSach;
  }

  if (targetId) {
    await fetchReviews(targetId);
  }
};

defineExpose({ open });
</script>

<style scoped>
.book-cover-img {
  max-height: 220px;
  width: 100%;
  object-fit: cover;
}
</style>
