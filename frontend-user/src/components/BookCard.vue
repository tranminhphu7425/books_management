<template>
  <div class="card book-card h-100 border-0 shadow-sm">
    <!-- Khung bìa sách tỷ lệ 2:3 -->
    <div class="book-cover-container position-relative overflow-hidden">
      <img
        :src="coverImage"
        :alt="book.TenSach"
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
      <div class="position-absolute bottom-0 start-0 m-2" v-if="book.TheLoai">
        <span class="badge bg-dark bg-opacity-75 text-white fw-normal">
          {{ book.TheLoai }}
        </span>
      </div>
    </div>

    <!-- Thông tin sách -->
    <div class="card-body d-flex flex-column p-3">
      <div class="book-meta text-muted small mb-1">
        <i class="bi bi-person me-1"></i>
        <span>{{ book.TacGia || book.NguonGoc || 'Nhiều tác giả' }}</span>
        <span class="mx-1">•</span>
        <span>{{ book.NamXuatBan || 'N/A' }}</span>
      </div>

      <h6 class="book-title mb-2" :title="book.TenSach">
        <router-link :to="`/books/${book._id}`" class="text-decoration-none text-dark">
          {{ book.TenSach }}
        </router-link>
      </h6>

      <div class="mt-auto pt-2 d-flex align-items-center justify-content-between border-top">
        <div class="book-price small">
          <span class="text-muted d-block" style="font-size: 0.75rem;">Trị giá ấn phẩm</span>
          <strong class="text-dark">{{ formatCurrency(book.DonGia) }}</strong>
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
  return props.book.HinhAnh || defaultCover;
});

const conLai = computed(() => {
  if (!props.book) return 0;
  if (props.book.SoQuyenKhaDung !== undefined && props.book.SoQuyenKhaDung !== null) {
    return Math.max(0, Number(props.book.SoQuyenKhaDung));
  }
  if (props.book.SoQuyenConLai !== undefined && props.book.SoQuyenConLai !== null) {
    return Math.max(0, Number(props.book.SoQuyenConLai));
  }
  const total = Number(props.book.SoQuyen) || 0;
  const borrowed = Number(props.book.SoQuyenDangMuon) || 0;
  const damaged = Number(props.book.SoQuyenHuHong) || 0;
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
</style>
