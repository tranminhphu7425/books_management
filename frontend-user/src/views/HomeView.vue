<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section text-white py-5 position-relative">
      <div class="container py-lg-4">
        <div class="row align-items-center">
          <div class="col-lg-7 text-center text-lg-start mb-4 mb-lg-0">
            <span class="badge bg-warning text-white px-3 py-2 rounded-pill fw-bold mb-3">
              <i class="bi bi-stars me-1"></i> Khơi Nguồn Tri Thức - Nâng Tầm Tương Lai
            </span>
            <h1 class="hero-title mb-3">
              Hệ Thống Tra Cứu & Đặt Mượn Ấn Phẩm Trực Tuyến
            </h1>
            <p class="hero-lead text-white mb-4 pe-lg-5" style="opacity: 0.9;">
              Khám phá hàng ngàn đầu sách phong phú từ công nghệ, khoa học đến văn học nghệ thuật. Đặt trước dễ dàng, nhận sách nhanh chóng tại thư viện.
            </p>

            <!-- Search Bar trong Hero -->
            <form class="hero-search-box shadow-lg p-2 rounded-pill bg-white d-flex align-items-center mb-4" @submit.prevent="handleSearch">
              <i class="bi bi-search text-muted ms-3 fs-5"></i>
              <input
                type="text"
                v-model="heroKeyword"
                class="form-control border-0 shadow-none ps-2"
                placeholder="Nhập tên sách, tác giả hoặc chủ đề cần tìm..."
              />
              <button class="btn btn-search-hero rounded-pill flex-shrink-0 px-4 py-2 fw-semibold" type="submit">
                Tìm kiếm
              </button>
            </form>

            <div class="d-flex flex-wrap gap-2 justify-content-center justify-content-lg-start align-items-center">
              <span class="small text-white-75 fw-medium">Gợi ý tìm kiếm:</span>
              <button
                v-for="kw in hotKeywords"
                :key="kw"
                type="button"
                class="btn btn-sm btn-tag-suggestion rounded-pill py-1 px-3 small"
                @click="searchByTag(kw)"
              >
                {{ kw }}
              </button>
            </div>
          </div>

          <div class="col-lg-5 d-none d-lg-block text-center">
            <img
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80"
              alt="Thư viện Tri thức"
              class="img-fluid rounded-4 shadow-lg hero-banner-img"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Thống kê nhanh -->
    <section class="py-4 bg-white border-bottom shadow-sm">
      <div class="container">
        <div class="row g-4 text-center">
          <div class="col-md-3 col-6 border-end-md">
            <div class="fs-2 fw-bold text-primary font-serif">10,000+</div>
            <div class="text-muted small">Đầu sách đa dạng chuyên ngành</div>
          </div>
          <div class="col-md-3 col-6 border-end-md">
            <div class="fs-2 fw-bold text-success font-serif">100%</div>
            <div class="text-muted small">Tra cứu mục lục trực tuyến</div>
          </div>
          <div class="col-md-3 col-6 border-end-md">
            <div class="fs-2 fw-bold text-accent font-serif">14 Ngày</div>
            <div class="text-muted small">Thời hạn mượn đọc tiêu chuẩn</div>
          </div>
          <div class="col-md-3 col-6">
            <div class="fs-2 fw-bold text-warning font-serif">24/7</div>
            <div class="text-muted small">Hỗ trợ đặt mượn mọi lúc mọi nơi</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Ấn phẩm mới cập nhật -->
    <section class="py-5">
      <div class="container">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
          <div>
            <span class="text-primary fw-bold text-uppercase small tracking-wide">Mới bổ sung vào kho</span>
            <h2 class="section-heading mb-0 font-serif">Ấn Phẩm Nổi Bật</h2>
          </div>
          <router-link to="/books" class="btn btn-outline-primary mt-3 mt-md-0 rounded-pill px-4">
            Xem toàn bộ kho sách <i class="bi bi-arrow-right ms-1"></i>
          </router-link>
        </div>

        <!-- Skeleton Loading -->
        <div v-if="bookStore.isLoading" class="row g-4">
          <div v-for="n in 8" :key="n" class="col-xl-3 col-lg-4 col-sm-6">
            <div class="card h-100 border-0 shadow-sm p-2">
              <div class="skeleton-box rounded mb-3" style="aspect-ratio: 2/3;"></div>
              <div class="skeleton-box rounded mb-2" style="height: 20px; width: 60%;"></div>
              <div class="skeleton-box rounded" style="height: 36px;"></div>
            </div>
          </div>
        </div>

        <!-- Grid Sách -->
        <div v-else-if="bookStore.featuredBooks.length > 0" class="row g-4">
          <div
            v-for="book in bookStore.featuredBooks"
            :key="book._id"
            class="col-xl-3 col-lg-4 col-sm-6"
          >
            <BookCard :book="book" />
          </div>
        </div>

        <!-- Không có sách -->
        <div v-else class="text-center py-5 bg-white rounded shadow-sm">
          <i class="bi bi-journal-x fs-1 text-muted"></i>
          <p class="text-muted mt-2">Hiện tại danh mục sách đang được cập nhật.</p>
        </div>
      </div>
    </section>

    <!-- Quy trình mượn sách 4 bước -->
    <section class="py-5 bg-light border-top border-bottom">
      <div class="container">
        <div class="text-center mb-5">
          <span class="text-primary fw-bold text-uppercase small">Quy trình đơn giản</span>
          <h2 class="font-serif">Các Bước Mượn Sách Tại Thư Viện</h2>
          <p class="text-muted">Chỉ với 4 thao tác nhanh chóng để tiếp cận cuốn sách yêu thích</p>
        </div>

        <div class="row g-4">
          <div class="col-md-3">
            <div class="card h-100 border-0 p-4 text-center shadow-sm step-card">
              <div class="step-number mb-3">1</div>
              <h5 class="fw-bold font-serif mb-2">Tìm & Chọn Sách</h5>
              <p class="small text-muted mb-0">
                Tra cứu sách theo tên, tác giả hoặc chủ đề trên hệ thống mục lục trực tuyến.
              </p>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100 border-0 p-4 text-center shadow-sm step-card">
              <div class="step-number mb-3">2</div>
              <h5 class="fw-bold font-serif mb-2">Đăng Ký Đặt Mượn</h5>
              <p class="small text-muted mb-0">
                Gửi yêu cầu mượn kèm ngày hẹn đến nhận sách. Thủ thư sẽ giữ sách trong 48h.
              </p>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100 border-0 p-4 text-center shadow-sm step-card">
              <div class="step-number mb-3">3</div>
              <h5 class="fw-bold font-serif mb-2">Nhận Sách Tại Quầy</h5>
              <p class="small text-muted mb-0">
                Xuất trình thẻ bạn đọc tại quầy giao dịch thư viện để nhận ấn phẩm mang về.
              </p>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card h-100 border-0 p-4 text-center shadow-sm step-card">
              <div class="step-number mb-3">4</div>
              <h5 class="fw-bold font-serif mb-2">Đọc & Trả Sách Đúng Hạn</h5>
              <p class="small text-muted mb-0">
                Thời gian đọc 14 ngày. Có thể tự thực hiện gia hạn thêm 01 lần (07 ngày) trên website.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBookStore } from '../stores/bookStore';
import { useToast } from '../composables/useToast';
import BookCard from '../components/BookCard.vue';

const router = useRouter();
const bookStore = useBookStore();
const toast = useToast();

const heroKeyword = ref('');
const hotKeywords = ['Lập trình', 'Trí tuệ nhân tạo', 'Kinh tế học', 'Văn học cổ điển', 'Tâm lý học'];

const handleSearch = () => {
  if (!heroKeyword.value.trim()) {
    toast.warning('Vui lòng nhập từ khóa để tìm kiếm ấn phẩm.');
    return;
  }
  router.push({
    path: '/books',
    query: { search: heroKeyword.value.trim() }
  });
};

const searchByTag = (tag) => {
  router.push({
    path: '/books',
    query: { search: tag }
  });
};

onMounted(() => {
  bookStore.fetchFeaturedBooks();
});
</script>

<style scoped>
.hero-section {
  background: #0d281e !important;
  background: linear-gradient(135deg, #0d281e 0%, #1b4332 60%, #2d5a44 100%) !important;
  border-bottom: 2px solid rgba(212, 163, 115, 0.25);
}

.hero-title {
  font-family: var(--font-serif);
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.25;
  color: #ffffff !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}

.btn-search-hero {
  background: linear-gradient(135deg, #d4a373 0%, #b88656 100%);
  color: #ffffff;
  border: none;
  transition: all var(--transition-fast);
}

.btn-search-hero:hover {
  background: linear-gradient(135deg, #dfaf7f 0%, #c49262 100%);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(184, 134, 86, 0.45);
}

.btn-tag-suggestion {
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff !important;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-tag-suggestion:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.7);
  color: #ffffff !important;
  transform: translateY(-1px);
}

@media (min-width: 992px) {
  .hero-title {
    font-size: 3rem;
  }
}

.hero-lead {
  font-size: 1.1rem;
  line-height: 1.6;
}

.hero-banner-img {
  max-height: 380px;
  width: 100%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.2);
}

.step-card {
  border-radius: var(--radius-lg);
  transition: transform var(--transition-normal);
}

.step-card:hover {
  transform: translateY(-5px);
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-accent);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  font-family: var(--font-serif);
}

.tracking-wide {
  letter-spacing: 1px;
}
</style>
