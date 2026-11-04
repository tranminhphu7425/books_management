<template>
  <div class="card book-card h-100 border-0 shadow-sm">
    <!-- Khung bìa sách tỷ lệ 2:3 -->
    <div class="book-cover-container position-relative overflow-hidden">
      <img
        :src="coverImage"
        :alt="(book.tenSach || book.TenSach)"
        class="card-img-top book-cover-img"
        @error="handleImageError"
        loading="lazy"
      />

      <!-- Badge tình trạng sẵn sàng -->
      <div class="position-absolute top-0 end-0 m-2">
        <span
          class="badge shadow-sm"
          :class="isAvailable ? 'badge-available' : 'badge-unavailable'"
        >
          <i :class="isAvailable ? 'bi bi-check-circle-fill me-1' : 'bi bi-dash-circle-fill me-1'"></i>
          {{ isAvailable ? `Còn ${conLai} cuốn` : 'Tạm hết' }}
        </span>
      </div>

      <!-- Badge thể loại -->
      <div class="position-absolute bottom-0 start-0 m-2" v-if="(book.theLoai || book.TheLoai)">
        <span class="badge bg-dark bg-opacity-75 text-white fw-normal">
          {{ (book.theLoai || book.TheLoai) }}
        </span>
      </div>
    </div>

    <!-- Thông tin sách -->
    <div class="card-body d-flex flex-column p-3">
      <div class="book-meta text-muted small mb-1">
        <i class="bi bi-person me-1"></i>
        <span>{{ (book.tacGia || book.TacGia) || (book.nguonGoc || book.NguonGoc) || 'Nhiều tác giả' }}</span>
        <span class="mx-1">•</span>
        <span>{{ (book.namXuatBan || book.NamXuatBan) || 'N/A' }}</span>
      </div>

      <h6 class="book-title mb-2" :title="(book.tenSach || book.TenSach)">
        <router-link :to="`/books/${book._id}`" class="text-decoration-none text-dark">
          {{ (book.tenSach || book.TenSach) }}
        </router-link>
      </h6>

      <div class="mt-auto pt-2 d-flex align-items-center justify-content-between border-top">
        <div class="book-price small">
          <span class="text-muted d-block" style="font-size: 0.75rem;">Trị giá ấn phẩm</span>
          <strong class="text-dark">{{ formatCurrency((book.donGia || book.DonGia)) }}</strong>
        </div>

        <router-link
          :to="`/books/${book._id}`"
          class="btn btn-sm btn-outline-primary px-3 rounded-pill"
        >
          Xem chi tiết
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getImageUrl } from '../utils/imageHelper';

const props = defineProps({
  book: {
    type: Object,
    required: true
  }
});

const defaultCover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
const imageFallback = ref(false);

const coverImage = computed(() => {
  if (imageFallback.value) return defaultCover;
  return getImageUrl((props.book?.hinhAnh || props.book?.HinhAnh), defaultCover);
});

const conLai = computed(() => {
  if (!props.book) return 0;
  if ((props.book?.soQuyenKhaDung || props.book?.SoQuyenKhaDung) !== undefined && (props.book?.soQuyenKhaDung || props.book?.SoQuyenKhaDung) !== null) {
    return Math.max(0, Number((props.book?.soQuyenKhaDung || props.book?.SoQuyenKhaDung)));
  }
  if ((props.book?.soQuyenConLai || props.book?.SoQuyenConLai) !== undefined && (props.book?.soQuyenConLai || props.book?.SoQuyenConLai) !== null) {
    return Math.max(0, Number((props.book?.soQuyenConLai || props.book?.SoQuyenConLai)));
  }
  const total = Number(props.book?.soQuyen || props.book?.SoQuyen) || 0;
  const borrowed = Number((props.book?.soQuyenDangMuon || props.book?.SoQuyenDangMuon)) || 0;
  const damaged = Number((props.book?.soQuyenHuHong || props.book?.SoQuyenHuHong)) || 0;
  return Math.max(0, total - borrowed - damaged);
});

const isAvailable = computed(() => conLai.value > 0);

const handleImageError = () => {
  imageFallback.value = true;
};

const formatCurrency = (val) => {
  if (!val) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};
</script>

<style scoped>
.book-card {
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md) !important;
}

.book-cover-container {
  aspect-ratio: 2 / 3;
  background-color: var(--color-bg);
}

.book-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.book-card:hover .book-cover-img {
  transform: scale(1.03);
}

.book-title {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 0.98rem;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.7em;
}

.book-title a:hover {
  color: var(--color-primary) !important;
}

.badge-available {
  background-color: #15803D !important;
  color: #FFFFFF !important;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.badge-unavailable {
  background-color: #DC2626 !important;
  color: #FFFFFF !important;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.35);
}
</style>
