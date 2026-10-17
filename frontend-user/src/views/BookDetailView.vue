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
              {{ book.TenSach }}
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
                :alt="book.TenSach"
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
              <button
                v-if="isAvailable"
                class="btn btn-primary btn-lg w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
                @click="openBorrowModal"
              >
                <i class="bi bi-bookmark-plus-fill fs-5"></i>
                Đăng Ký Mượn Sách Này
              </button>

              <button
                v-else
                class="btn btn-secondary btn-lg w-100 py-3 fw-bold"
                disabled
              >
                <i class="bi bi-slash-circle me-1"></i>
                Tất cả ấn phẩm đang được mượn
              </button>

              <div class="text-center small text-muted mt-2">
                <i class="bi bi-shield-check text-success me-1"></i> Miễn phí phục vụ cho bạn đọc có thẻ
              </div>
            </div>
          </div>
        </div>

        <!-- Cột Chi tiết Thông tin & Tác quyền -->
        <div class="col-lg-8 col-md-7">
          <div class="card border-0 shadow-sm p-4 bg-white mb-4">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge bg-secondary" v-if="book.TheLoai">{{ book.TheLoai }}</span>
              <span class="badge bg-light text-dark border" v-if="book.MaSach">Mã: {{ book.MaSach }}</span>
            </div>

            <h1 class="detail-title font-serif mb-3 text-dark">{{ book.TenSach }}</h1>

            <div class="row g-3 py-3 border-top border-bottom mb-4">
              <div class="col-sm-6">
                <span class="text-muted small d-block">Tác giả / Nguồn gốc</span>
                <strong class="text-dark">{{ book.TacGia || book.NguonGoc || 'Nhiều tác giả' }}</strong>
              </div>
              <div class="col-sm-6">
                <span class="text-muted small d-block">Nhà xuất bản</span>
                <strong class="text-dark">{{ publisherName }}</strong>
              </div>
              <div class="col-sm-6">
                <span class="text-muted small d-block">Năm xuất bản</span>
                <strong class="text-dark">{{ book.NamXuatBan || 'N/A' }}</strong>
              </div>
              <div class="col-sm-6">
                <span class="text-muted small d-block">Vị trí lưu kho</span>
                <strong class="text-primary">
                  <i class="bi bi-geo-alt-fill me-1"></i> {{ book.ViTri || 'Kệ tham khảo chung' }}
                </strong>
              </div>
              <div class="col-sm-6">
                <span class="text-muted small d-block">Trị giá niêm yết ấn phẩm</span>
                <strong class="text-danger fs-5">{{ formatCurrency(book.DonGia) }}</strong>
              </div>
              <div class="col-sm-6">
                <span class="text-muted small d-block">Hiện trạng kho</span>
                <span>
                  Đang có <strong>{{ conLai }}</strong> / <strong>{{ book.SoQuyen }}</strong> cuốn sẵn sàng
                </span>
              </div>
            </div>

            <!-- Tóm tắt nội dung -->
            <div class="mb-4">
              <h5 class="font-serif fw-bold text-dark mb-2">
                <i class="bi bi-card-text me-2 text-primary"></i> Tóm Tắt Nội Dung
              </h5>
              <p class="text-secondary lh-lg mb-0" style="white-space: pre-line;">
                {{ book.MoTa || 'Ấn phẩm được tuyển chọn và lưu giữ tại Thư viện Tri thức phục vụ mục đích nghiên cứu học tập, tham khảo chuyên sâu và phát triển kỹ năng cho bạn đọc.' }}
              </p>
            </div>

            <!-- Hướng dẫn và cam kết trách nhiệm mượn -->
            <div class="p-3 bg-light rounded border">
              <h6 class="font-serif fw-bold text-dark mb-2">
                <i class="bi bi-info-circle-fill text-info me-2"></i> Lưu Ý Về Mượn & Hoàn Trả
              </h6>
              <ul class="small text-muted mb-0 ps-3">
                <li>Thời gian mượn tiêu chuẩn là <strong>14 ngày</strong> kể từ khi bạn đọc ký nhận tại quầy.</li>
                <li>Hệ thống hỗ trợ gia hạn thêm <strong>01 lần (+07 ngày)</strong> nếu sách chưa có độc giả khác đặt trước.</li>
                <li>Trường hợp làm mất hoặc hư hại ấn phẩm, bạn đọc có trách nhiệm bồi thường theo đúng giá trị niêm yết: <strong>{{ formatCurrency(book.DonGia) }}</strong>.</li>
              </ul>
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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookStore } from '../stores/bookStore';
import { useToast } from '../composables/useToast';
import BorrowModal from '../components/BorrowModal.vue';

const route = useRoute();
const router = useRouter();
const bookStore = useBookStore();
const toast = useToast();

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/books');
  }
};

const defaultCover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
const imageFallback = ref(false);

const book = computed(() => bookStore.currentBook);

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
  return book.value.HinhAnh;
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

onMounted(async () => {
  const bookId = route.params.id;
  await bookStore.fetchPublishers();
  if (bookId) {
    await bookStore.fetchBookById(bookId);
    if (bookStore.error) {
      toast.error(bookStore.error);
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
</style>
