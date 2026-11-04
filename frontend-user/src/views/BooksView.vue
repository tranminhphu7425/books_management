<template>
  <div class="books-view py-4">
    <div class="container">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb small">
          <li class="breadcrumb-item"><router-link to="/">Trang chủ</router-link></li>
          <li class="breadcrumb-item active" aria-current="page">Kho ấn phẩm</li>
        </ol>
      </nav>

      <div class="row g-4">
        <!-- Sidebar Bộ lọc bên trái -->
        <div class="col-lg-3">
          <div class="card border-0 shadow-sm p-3 filter-card sticky-top" style="top: 85px;">
            <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <h5 class="font-serif fs-6 fw-bold mb-0">
                <i class="bi bi-funnel me-1 text-primary"></i> Bộ lọc tìm kiếm
              </h5>
              <button
                type="button"
                class="btn btn-sm text-muted p-0"
                @click="resetAllFilters"
                title="Đặt lại bộ lọc"
              >
                <i class="bi bi-arrow-counterclockwise"></i> Xóa bộ lọc
              </button>
            </div>

            <!-- Lọc Thể Loại -->
            <div class="mb-4">
              <label class="form-label fw-bold small text-uppercase text-muted">Chủ đề và thể loại</label>
              <div class="filter-genre-list">
                <div class="form-check mb-1">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="genreRadio"
                    id="genreAll"
                    value=""
                    v-model="selectedGenre"
                    @change="applyFilter"
                  />
                  <label class="form-check-label small" for="genreAll">Tất cả chủ đề</label>
                </div>
                <div
                  v-for="cat in (bookStore.categories.length ? bookStore.categories : bookStore.genres.map(g => ({ MaTheLoai: g, TenTheLoai: g })))"
                  :key="cat.MaTheLoai || cat._id"
                  class="form-check mb-1"
                >
                  <input
                    class="form-check-input"
                    type="radio"
                    name="genreRadio"
                    :id="`genre-${cat.MaTheLoai}`"
                    :value="cat.TenTheLoai"
                    v-model="selectedGenre"
                    @change="applyFilter"
                  />
                  <label class="form-check-label small" :for="`genre-${cat.MaTheLoai}`">{{ cat.TenTheLoai }}</label>
                </div>
              </div>
            </div>

            <!-- Lọc Nhà Xuất Bản Tự Thiết Kế Kèm Tìm Kiếm Không Dấu -->
            <div class="mb-3 position-relative" ref="publisherDropdownRef">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <label class="form-label fw-bold small text-uppercase text-muted mb-0">Nhà xuất bản</label>
                <button
                  v-if="selectedPublisher"
                  type="button"
                  class="btn btn-link btn-sm text-decoration-none text-muted p-0 extra-small"
                  @click="clearPublisher"
                  title="Xóa lựa chọn NXB"
                >
                  Bỏ chọn
                </button>
              </div>

              <!-- Nút bấm hiển thị Dropdown tùy chỉnh -->
              <div
                class="form-select form-select-sm custom-pub-trigger d-flex align-items-center justify-content-between"
                :class="{ 'is-open': isPublisherOpen, 'border-primary': isPublisherOpen || selectedPublisher }"
                tabindex="0"
                @click="togglePublisherDropdown"
                @keydown.down.prevent="openPublisherDropdown"
                @keydown.enter.prevent="togglePublisherDropdown"
                @keydown.esc="closePublisherDropdown"
              >
                <div class="text-truncate pe-1">
                  <span v-if="selectedPublisherName" class="fw-semibold text-dark">
                    <i class="bi bi-building me-1 text-primary"></i>
                    {{ selectedPublisherName }}
                  </span>
                  <span v-else class="text-muted">
                    <i class="bi bi-funnel me-1"></i> Tất cả nhà xuất bản
                  </span>
                </div>
                <div class="d-flex align-items-center gap-1 flex-shrink-0">
                  <i
                    class="bi bi-chevron-down text-muted trigger-arrow"
                    :class="{ 'rotate-180': isPublisherOpen }"
                  ></i>
                </div>
              </div>

              <!-- Menu Dropdown Tìm Kiếm & Danh Sách NXB -->
              <div
                v-if="isPublisherOpen"
                class="custom-pub-menu shadow-lg border rounded-3 bg-white"
                @click.stop
              >
                <!-- Thanh tìm kiếm nhanh không dấu -->
                <div class="p-2 border-bottom bg-light">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text bg-white border-end-0 text-muted">
                      <i class="bi bi-search"></i>
                    </span>
                    <input
                      ref="publisherSearchInputRef"
                      type="text"
                      v-model="publisherSearchQuery"
                      class="form-control border-start-0 ps-0"
                      placeholder="Tìm theo tên hoặc mã nhà xuất bản..."
                      @click.stop
                      @keydown.esc="closePublisherDropdown"
                    />
                    <button
                      v-if="publisherSearchQuery"
                      class="btn btn-outline-secondary border-start-0 bg-white text-muted"
                      type="button"
                      @click="publisherSearchQuery = ''"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>

                <!-- Danh sách NXB -->
                <div class="custom-pub-list">
                  <!-- Tùy chọn tất cả NXB -->
                  <div
                    class="custom-pub-item px-3 py-2 d-flex align-items-center justify-content-between border-bottom border-light"
                    :class="{ 'is-selected': !selectedPublisher }"
                    @click="selectPublisherOption('')"
                  >
                    <span class="small fw-semibold">
                      <i class="bi bi-collection me-1 text-secondary"></i> Tất cả nhà xuất bản
                    </span>
                    <i v-if="!selectedPublisher" class="bi bi-check-circle-fill text-primary"></i>
                  </div>

                  <!-- Trạng thái không tìm thấy -->
                  <div
                    v-if="filteredPublishers.length === 0"
                    class="p-3 text-center text-muted small"
                  >
                    <i class="bi bi-building-slash fs-4 text-muted d-block mb-1"></i>
                    <div>Không tìm thấy nhà xuất bản phù hợp với "{{ publisherSearchQuery }}"</div>
                  </div>

                  <!-- Danh sách các NXB khớp kết quả -->
                  <div
                    v-for="pub in filteredPublishers"
                    :key="pub.MaNXB || pub._id"
                    class="custom-pub-item px-3 py-2 d-flex align-items-center justify-content-between"
                    :class="{ 'is-selected': selectedPublisher === pub.MaNXB }"
                    @click="selectPublisherOption(pub.MaNXB)"
                  >
                    <div class="me-2 text-truncate">
                      <div class="small fw-semibold text-dark text-truncate">
                        <i class="bi bi-building me-1 text-primary opacity-75"></i>
                        {{ pub.TenNXB }}
                      </div>
                      <div v-if="pub.DiaChi" class="extra-small text-muted text-truncate">
                        <i class="bi bi-geo-alt me-1"></i>{{ pub.DiaChi }}
                      </div>
                    </div>
                    <div class="d-flex align-items-center gap-1 flex-shrink-0">
                      <span class="badge bg-light text-secondary border font-monospace extra-small">
                        {{ pub.MaNXB }}
                      </span>
                      <i v-if="selectedPublisher === pub.MaNXB" class="bi bi-check-circle-fill text-primary ms-1"></i>
                    </div>
                  </div>
                </div>

                <!-- Footer thống kê số lượng NXB -->
                <div class="p-2 border-top bg-light d-flex justify-content-between align-items-center">
                  <span class="extra-small text-muted">
                    {{ filteredPublishers.length }} / {{ bookStore.publishers.length }} nhà xuất bản
                  </span>
                  <button
                    v-if="selectedPublisher"
                    type="button"
                    class="btn btn-link btn-sm text-decoration-none text-danger p-0 extra-small"
                    @click="clearPublisher"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>
            </div>

            <!-- Lọc Sách Còn Sẵn Trên Kệ -->
            <div class="mb-2 pt-2 border-top">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="availableOnlyCheck"
                  v-model="availableOnly"
                  @change="applyFilter"
                />
                <label class="form-check-label small fw-semibold text-success cursor-pointer" for="availableOnlyCheck">
                  <i class="bi bi-check-circle-fill me-1"></i> Chỉ sách còn sẵn trên kệ
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Cột Nội dung hiển thị Sách -->
        <div class="col-lg-9">
          <!-- Thanh điều khiển tìm kiếm & sắp xếp -->
          <div class="card border-0 shadow-sm p-3 mb-4 bg-white">
            <div class="row g-2 align-items-center">
              <div class="col-md-7">
                <div class="input-group">
                  <input
                    type="text"
                    v-model="searchKeyword"
                    class="form-control"
                    placeholder="Tìm theo tên sách, tác giả..."
                    @keyup.enter="handleSearch"
                  />
                  <button class="btn btn-primary" type="button" @click="handleSearch">
                    <i class="bi bi-search me-1"></i> Tìm kiếm
                  </button>
                  <button
                    v-if="searchKeyword"
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="clearSearch"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>

              <div class="col-md-5 d-flex align-items-center justify-content-md-end gap-2 mt-2 mt-md-0">
                <span class="small text-muted text-nowrap">Sắp xếp:</span>
                <select
                  class="form-select form-select-sm w-auto"
                  v-model="selectedSort"
                  @change="handleSortChange"
                >
                  <option value="createdAt_desc">Mới nhập kho</option>
                  <option value="createdAt_asc">Cũ nhất</option>
                  <option value="TenSach_asc">Tên sách (A – Z)</option>
                  <option value="TenSach_desc">Tên sách (Z – A)</option>
                  <option value="DonGia_asc">Giá trị sách (thấp đến cao)</option>
                  <option value="DonGia_desc">Giá trị sách (cao đến thấp)</option>
                  <option value="NamXuatBan_desc">Năm xuất bản (mới nhất)</option>
                </select>
              </div>
            </div>

            <!-- Tổng số kết quả & Badges bộ lọc đang chọn -->
            <div class="mt-2 text-muted small d-flex justify-content-between align-items-center">
              <span>
                Tìm thấy <strong>{{ bookStore.pagination.total }}</strong> ấn phẩm phù hợp
              </span>
            </div>

            <!-- Active filter chips -->
            <div class="mt-2 pt-2 border-top d-flex flex-wrap align-items-center gap-2" v-if="hasActiveFilters">
              <span class="small text-muted">Đang lọc:</span>
              <span v-if="searchKeyword" class="badge bg-light text-dark border d-flex align-items-center gap-1">
                Từ khóa: "{{ searchKeyword }}"
                <i class="bi bi-x cursor-pointer" @click="clearSearch" title="Xóa từ khóa"></i>
              </span>
              <span v-if="selectedGenre" class="badge bg-primary bg-opacity-10 text-primary border border-primary d-flex align-items-center gap-1">
                Thể loại: {{ selectedGenre }}
                <i class="bi bi-x cursor-pointer" @click="clearGenre" title="Bỏ lọc thể loại"></i>
              </span>
              <span v-if="selectedPublisherName" class="badge bg-info bg-opacity-10 text-info-emphasis border border-info d-flex align-items-center gap-1">
                NXB: {{ selectedPublisherName }}
                <i class="bi bi-x cursor-pointer" @click="clearPublisher" title="Bỏ lọc NXB"></i>
              </span>
              <span v-if="availableOnly" class="badge bg-success bg-opacity-10 text-success border border-success d-flex align-items-center gap-1">
                Còn sẵn trên kệ
                <i class="bi bi-x cursor-pointer" @click="clearAvailableOnly" title="Bỏ lọc còn sẵn"></i>
              </span>
              <button class="btn btn-link btn-sm text-danger text-decoration-none p-0 ms-auto small" @click="resetAllFilters">
                <i class="bi bi-arrow-counterclockwise"></i> Xóa tất cả bộ lọc
              </button>
            </div>
          </div>

          <!-- Loading Skeleton -->
          <div v-if="bookStore.isLoading" class="row g-4">
            <div v-for="n in 6" :key="n" class="col-md-4 col-sm-6">
              <div class="card h-100 border-0 shadow-sm p-2">
                <div class="skeleton-box rounded mb-3" style="aspect-ratio: 2/3;"></div>
                <div class="skeleton-box rounded mb-2" style="height: 20px;"></div>
                <div class="skeleton-box rounded" style="height: 36px;"></div>
              </div>
            </div>
          </div>

          <!-- Danh sách sách -->
          <div v-else-if="bookStore.books.length > 0" class="row g-4">
            <div
              v-for="book in bookStore.books"
              :key="book._id"
              class="col-md-4 col-sm-6"
            >
              <BookCard :book="book" />
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="card border-0 shadow-sm p-5 text-center my-4 bg-white">
            <i class="bi bi-search fs-1 text-muted mb-3"></i>
            <h5 class="font-serif">Không tìm thấy ấn phẩm phù hợp</h5>
            <p class="text-muted small mb-3">
              Vui lòng thử lại với từ khóa khác hoặc xóa bớt các bộ lọc thể loại / nhà xuất bản.
            </p>
            <div>
              <button class="btn btn-outline-primary btn-sm" @click="resetAllFilters">
                Đặt lại bộ lọc
              </button>
            </div>
          </div>

          <!-- Phân trang -->
          <nav v-if="bookStore.pagination.totalPages > 1" class="mt-5 d-flex justify-content-center">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: bookStore.pagination.page <= 1 }">
                <button class="page-link" @click="goToPage(bookStore.pagination.page - 1)">
                  <i class="bi bi-chevron-left"></i> Trang trước
                </button>
              </li>

              <li
                v-for="p in bookStore.pagination.totalPages"
                :key="p"
                class="page-item"
                :class="{ active: p === bookStore.pagination.page }"
              >
                <button class="page-link" @click="goToPage(p)">
                  {{ p }}
                </button>
              </li>

              <li class="page-item" :class="{ disabled: bookStore.pagination.page >= bookStore.pagination.totalPages }">
                <button class="page-link" @click="goToPage(bookStore.pagination.page + 1)">
                  Trang sau <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookStore } from '../stores/bookStore';
import { useToast } from '../composables/useToast';
import { removeVietnameseTones } from '../utils/vietnameseUtils';
import BookCard from '../components/BookCard.vue';

const route = useRoute();
const router = useRouter();
const bookStore = useBookStore();
const toast = useToast();

const searchKeyword = ref('');
const selectedGenre = ref('');
const selectedPublisher = ref('');
const availableOnly = ref(false);
const selectedSort = ref('createdAt_desc');

// Quản lý trạng thái Custom Dropdown NXB & Tìm kiếm không dấu
const publisherDropdownRef = ref(null);
const publisherSearchInputRef = ref(null);
const isPublisherOpen = ref(false);
const publisherSearchQuery = ref('');

// Danh sách NXB được lọc theo từ khóa tiếng Việt không dấu
const filteredPublishers = computed(() => {
  const list = bookStore.publishers || [];
  const query = removeVietnameseTones(publisherSearchQuery.value).toLowerCase().trim();
  if (!query) return list;

  return list.filter((pub) => {
    const name = removeVietnameseTones(pub.TenNXB || '').toLowerCase();
    const code = removeVietnameseTones(pub.MaNXB || '').toLowerCase();
    const address = removeVietnameseTones(pub.DiaChi || '').toLowerCase();
    return name.includes(query) || code.includes(query) || address.includes(query);
  });
});

const openPublisherDropdown = () => {
  isPublisherOpen.value = true;
  nextTick(() => {
    publisherSearchInputRef.value?.focus();
  });
};

const closePublisherDropdown = () => {
  isPublisherOpen.value = false;
  publisherSearchQuery.value = '';
};

const togglePublisherDropdown = () => {
  if (isPublisherOpen.value) {
    closePublisherDropdown();
  } else {
    openPublisherDropdown();
  }
};

const selectPublisherOption = (maNXB) => {
  selectedPublisher.value = maNXB || '';
  closePublisherDropdown();
  applyFilter();
};

const handleClickOutsidePublisher = (event) => {
  if (publisherDropdownRef.value && !publisherDropdownRef.value.contains(event.target)) {
    closePublisherDropdown();
  }
};

// Tìm tên NXB tương ứng từ mã NXB
const selectedPublisherName = computed(() => {
  if (!selectedPublisher.value) return '';
  const pub = bookStore.publishers.find(
    (p) => p.MaNXB === selectedPublisher.value || p._id === selectedPublisher.value
  );
  return pub ? pub.TenNXB : selectedPublisher.value;
});

// Kiểm tra xem có bất kỳ bộ lọc nào đang kích hoạt
const hasActiveFilters = computed(() => {
  return (
    Boolean(searchKeyword.value.trim()) ||
    Boolean(selectedGenre.value) ||
    Boolean(selectedPublisher.value) ||
    Boolean(availableOnly.value)
  );
});

// Đồng bộ trạng thái từ URL Query Parameters vào các biến ref của Form và Pinia Store
const syncStateFromQuery = () => {
  const q = route.query;

  // 1. Từ khóa tìm kiếm
  searchKeyword.value = typeof q.search === 'string' ? q.search : '';
  bookStore.filters.search = searchKeyword.value;

  // 2. Thể loại
  selectedGenre.value = typeof q.theLoai === 'string' ? q.theLoai : '';
  bookStore.filters.theLoai = selectedGenre.value;

  // 3. Nhà xuất bản
  selectedPublisher.value = typeof q.maNXB === 'string' ? q.maNXB : '';
  bookStore.filters.maNXB = selectedPublisher.value;

  // 4. Chỉ sách còn sẵn
  availableOnly.value = q.availableOnly === 'true' || q.availableOnly === true;
  bookStore.filters.availableOnly = availableOnly.value;

  // 5. Sắp xếp & Thứ tự
  if (q.sort && q.order) {
    selectedSort.value = `${q.sort}_${q.order}`;
    bookStore.filters.sort = q.sort;
    bookStore.filters.order = q.order;
  } else if (q.sort) {
    selectedSort.value = `${q.sort}_desc`;
    bookStore.filters.sort = q.sort;
    bookStore.filters.order = 'desc';
  } else {
    selectedSort.value = 'createdAt_desc';
    bookStore.filters.sort = 'createdAt';
    bookStore.filters.order = 'desc';
  }

  // 6. Trang hiện tại
  const page = parseInt(q.page, 10) || 1;
  return page;
};

// Cập nhật URL Query Parameters khi người dùng thao tác lọc / tìm kiếm / phân trang
const updateUrlQuery = (newParams = {}) => {
  const currentQuery = { ...route.query };
  const merged = { ...currentQuery, ...newParams };

  const cleanedQuery = {};
  Object.keys(merged).forEach((key) => {
    const val = merged[key];
    if (val !== undefined && val !== '' && val !== null && val !== false) {
      if (key === 'page' && Number(val) === 1) {
        return; // Omit page 1 for clean URLs
      }
      cleanedQuery[key] = String(val);
    }
  });

  router.push({
    path: '/books',
    query: cleanedQuery
  });
};

const handleSearch = () => {
  const kw = searchKeyword.value.trim();
  updateUrlQuery({
    search: kw || undefined,
    page: 1
  });
};

const clearSearch = () => {
  searchKeyword.value = '';
  updateUrlQuery({
    search: undefined,
    page: 1
  });
};

const clearGenre = () => {
  selectedGenre.value = '';
  updateUrlQuery({
    theLoai: undefined,
    page: 1
  });
};

const clearPublisher = () => {
  selectedPublisher.value = '';
  updateUrlQuery({
    maNXB: undefined,
    page: 1
  });
};

const clearAvailableOnly = () => {
  availableOnly.value = false;
  updateUrlQuery({
    availableOnly: undefined,
    page: 1
  });
};

const applyFilter = () => {
  updateUrlQuery({
    theLoai: selectedGenre.value || undefined,
    maNXB: selectedPublisher.value || undefined,
    availableOnly: availableOnly.value ? 'true' : undefined,
    page: 1
  });
};

const handleSortChange = () => {
  const [sortField, sortOrder] = selectedSort.value.split('_');
  updateUrlQuery({
    sort: sortField,
    order: sortOrder,
    page: 1
  });
};

const resetAllFilters = () => {
  searchKeyword.value = '';
  selectedGenre.value = '';
  selectedPublisher.value = '';
  availableOnly.value = false;
  selectedSort.value = 'createdAt_desc';
  bookStore.resetFilters();
  toast.info('Đã đặt lại tất cả bộ lọc tìm kiếm.');
  router.push({ path: '/books', query: {} });
};

const goToPage = (page) => {
  if (page < 1 || page > bookStore.pagination.totalPages) return;
  updateUrlQuery({ page });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Lắng nghe sự thay đổi của route.query (khi người dùng bấm Back / Forward hoặc đổi URL)
watch(
  () => route.query,
  async () => {
    if (route.path !== '/books') return;
    const page = syncStateFromQuery();
    await bookStore.fetchBooks(page);
    if (bookStore.filters.search && bookStore.books.length === 0) {
      toast.info(`Không tìm thấy ấn phẩm nào với từ khóa "${bookStore.filters.search}".`);
    }
  },
  { deep: true }
);

onMounted(async () => {
  document.addEventListener('click', handleClickOutsidePublisher);
  await Promise.all([
    bookStore.fetchCategories(),
    bookStore.fetchPublishers()
  ]);
  const page = syncStateFromQuery();
  await bookStore.fetchBooks(page);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutsidePublisher);
});
</script>

<style scoped>
.filter-card {
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.filter-genre-list {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 5px;
}

.filter-genre-list::-webkit-scrollbar {
  width: 4px;
}

.filter-genre-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

/* Custom Publisher Dropdown Styling */
.custom-pub-trigger {
  min-height: 34px;
  cursor: pointer;
  background-color: #ffffff;
  user-select: none;
  transition: all 0.2s ease;
}

.custom-pub-trigger:hover {
  border-color: #94a3b8;
}

.custom-pub-trigger.is-open {
  border-color: var(--color-primary, #8b4513);
  box-shadow: 0 0 0 0.2rem rgba(139, 69, 19, 0.15);
}

.trigger-arrow {
  transition: transform 0.2s ease;
  font-size: 0.75rem;
}

.trigger-arrow.rotate-180 {
  transform: rotate(180deg);
}

.custom-pub-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 1050;
  max-height: 320px;
  display: flex;
  flex-direction: column;
  animation: pubDropdownSlide 0.18s ease-out;
}

@keyframes pubDropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-pub-list {
  overflow-y: auto;
  max-height: 200px;
}

.custom-pub-list::-webkit-scrollbar {
  width: 4px;
}

.custom-pub-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}

.custom-pub-item {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.custom-pub-item:hover {
  background-color: #f8fafc;
}

.custom-pub-item.is-selected {
  background-color: #f0f7ff;
}

.extra-small {
  font-size: 0.75rem;
}
</style>
