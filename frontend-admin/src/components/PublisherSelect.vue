<template>
  <div class="publisher-select-wrapper position-relative" ref="wrapperRef">
    <!-- Nút hiển thị lựa chọn NXB hiện tại -->
    <div
      class="form-select custom-publisher-trigger d-flex align-items-center justify-content-between"
      :class="{ 'is-invalid': invalid, 'is-open': isOpen }"
      tabindex="0"
      @click="toggleDropdown"
      @keydown.down.prevent="openDropdown"
      @keydown.enter.prevent="toggleDropdown"
      @keydown.esc="closeDropdown"
    >
      <div class="selected-publisher-display text-truncate pe-2">
        <span v-if="selectedPublisher" class="fw-semibold text-dark">
          <i class="bi bi-building me-1 text-primary"></i>
          {{ selectedPublisher.TenNXB }}
          <span class="badge bg-light text-secondary border ms-1 font-monospace">{{ selectedPublisher.MaNXB }}</span>
        </span>
        <span v-else class="text-muted">
          <i class="bi bi-search me-1"></i> Chọn hoặc tìm kiếm nhà xuất bản...
        </span>
      </div>

      <div class="d-flex align-items-center gap-1">
        <button
          v-if="modelValue"
          type="button"
          class="btn-clear-selection text-muted"
          @click.stop="clearSelection"
          title="Xóa lựa chọn"
        >
          <i class="bi bi-x-circle-fill"></i>
        </button>
        <i class="bi bi-chevron-down trigger-chevron text-muted" :class="{ 'rotate-180': isOpen }"></i>
      </div>
    </div>

    <!-- Hidden input để giữ giá trị -->
    <input type="hidden" :value="modelValue" />

    <!-- Dropdown Menu Tìm Kiếm & Danh Sách NXB -->
    <div v-if="isOpen" class="publisher-dropdown-menu shadow-lg border rounded-3 bg-white" @click.stop>
      <!-- Header Tìm Kiếm -->
      <div class="p-2 border-bottom bg-light">
        <div class="input-group input-group-sm">
          <span class="input-group-text bg-white border-end-0 text-muted">
            <i class="bi bi-search"></i>
          </span>
          <input
            ref="searchInputRef"
            type="text"
            v-model="searchQuery"
            class="form-control border-start-0 ps-0"
            placeholder="Gõ tên NXB, mã NXB hoặc địa chỉ..."
            @click.stop
            @keydown.esc="closeDropdown"
            @keydown.enter.prevent="openQuickAddWithQuery"
          />
          <button
            v-if="searchQuery"
            class="btn btn-outline-secondary border-start-0 bg-white text-muted"
            type="button"
            @click="searchQuery = ''"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>

      <!-- Khung Form Thêm Nhanh NXB Mới (Inline Quick Add) -->
      <div v-if="showQuickAddForm" class="p-3 bg-light-subtle border-bottom quick-add-section" @click.stop>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="font-serif fw-bold text-dark mb-0 small">
            <i class="bi bi-plus-circle-fill text-primary me-1"></i> Thêm Nhà Xuất Bản Mới
          </h6>
          <button type="button" class="btn-close btn-sm" @click="showQuickAddForm = false" style="font-size: 0.7rem;"></button>
        </div>

        <div class="quick-add-form" @keydown.enter.prevent="handleQuickAddPublisher">
          <div class="mb-2">
            <label class="form-label extra-small fw-semibold mb-1">Tên Nhà Xuất Bản <span class="text-danger">*</span></label>
            <input
              type="text"
              v-model="quickForm.tenNXB"
              class="form-control form-control-sm"
              placeholder="VD: NXB Tri Thức Trẻ"
              required
            />
          </div>

          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label extra-small fw-semibold mb-1">Mã NXB (Tự sinh nếu trống)</label>
              <input
                type="text"
                v-model="quickForm.maNXB"
                class="form-control form-control-sm"
                placeholder="VD: NXB005"
              />
            </div>
            <div class="col-6">
              <label class="form-label extra-small fw-semibold mb-1">Số điện thoại</label>
              <input
                type="tel"
                v-model="quickForm.dienThoai"
                class="form-control form-control-sm"
                placeholder="028.xxxx.xxxx"
              />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label extra-small fw-semibold mb-1">Địa chỉ trụ sở</label>
            <input
              type="text"
              v-model="quickForm.diaChi"
              class="form-control form-control-sm"
              placeholder="VD: Hà Nội hoặc TP. Hồ Chí Minh"
            />
          </div>

          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary btn-sm py-1 px-2 extra-small" @click="showQuickAddForm = false">
              Hủy
            </button>
            <button
              type="button"
              class="btn btn-primary btn-sm py-1 px-3 extra-small"
              :disabled="isSubmittingQuickAdd"
              @click="handleQuickAddPublisher"
            >
              <span v-if="isSubmittingQuickAdd" class="spinner-border spinner-border-sm me-1" style="width: 12px; height: 12px;"></span>
              <i v-else class="bi bi-check2 me-1"></i>
              Lưu & Chọn NXB Này
            </button>
          </div>
        </div>
      </div>

      <!-- Danh Sách NXB Đã Lọc -->
      <div class="publisher-list-container" v-if="!showQuickAddForm">
        <div v-if="filteredPublishers.length === 0" class="p-3 text-center text-muted small">
          <i class="bi bi-building-slash fs-3 text-muted d-block mb-1"></i>
          <div>Không tìm thấy Nhà xuất bản nào khớp với "<strong>{{ searchQuery }}</strong>"</div>
          <button
            type="button"
            class="btn btn-outline-primary btn-sm mt-2 rounded-pill px-3 extra-small"
            @click="openQuickAddWithQuery"
          >
            <i class="bi bi-plus-circle me-1"></i> Tạo NXB "<strong>{{ searchQuery }}</strong>" ngay
          </button>
        </div>

        <ul v-else class="list-unstyled mb-0 py-1">
          <li
            v-for="pub in filteredPublishers"
            :key="pub.MaNXB || pub._id"
            class="publisher-list-item px-3 py-2 d-flex align-items-center justify-content-between"
            :class="{ 'is-selected': modelValue === pub.MaNXB }"
            @click="selectPublisher(pub)"
          >
            <div class="me-2 text-truncate">
              <div class="fw-semibold text-dark item-title text-truncate">
                <i class="bi bi-building me-1 text-primary opacity-75"></i>
                {{ pub.TenNXB }}
              </div>
              <div class="text-muted extra-small text-truncate" v-if="pub.DiaChi">
                <i class="bi bi-geo-alt me-1"></i>{{ pub.DiaChi }}
              </div>
            </div>

            <div class="d-flex align-items-center gap-2 flex-shrink-0">
              <span class="badge bg-light text-secondary border font-monospace">{{ pub.MaNXB }}</span>
              <button
                v-if="isAdmin"
                type="button"
                class="btn btn-outline-danger btn-sm border-0 py-0 px-1 rounded"
                title="Xóa Nhà xuất bản (Dành riêng cho ADMIN)"
                @click.stop="handleDeletePublisher(pub)"
              >
                <i class="bi bi-trash"></i>
              </button>
              <i v-if="modelValue === pub.MaNXB" class="bi bi-check-circle-fill text-primary"></i>
            </div>
          </li>
        </ul>
      </div>

      <!-- Footer Tạo NXB Mới nếu không mở form -->
      <div v-if="!showQuickAddForm" class="p-2 border-top bg-light d-flex justify-content-between align-items-center">
        <span class="text-muted extra-small">Tổng cộng: {{ filteredPublishers.length }} / {{ publishers.length }} NXB</span>
        <button
          type="button"
          class="btn btn-link btn-sm text-decoration-none text-primary fw-bold p-0 extra-small"
          @click="openQuickAddWithQuery"
        >
          <i class="bi bi-plus-circle me-1"></i>Thêm NXB mới
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useAdminBookStore } from '../stores/adminBookStore';
import { useAdminAuthStore } from '../stores/adminAuthStore';
import { useToast } from '../composables/useToast';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  invalid: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const bookStore = useAdminBookStore();
const authStore = useAdminAuthStore();
const toast = useToast();
const isAdmin = computed(() => authStore.isAdmin);

const wrapperRef = ref(null);
const searchInputRef = ref(null);
const isOpen = ref(false);
const searchQuery = ref('');
const showQuickAddForm = ref(false);
const isSubmittingQuickAdd = ref(false);

const quickForm = reactive({
  tenNXB: '',
  maNXB: '',
  diaChi: '',
  dienThoai: ''
});

const publishers = computed(() => bookStore.publishers || []);

const selectedPublisher = computed(() => {
  if (!props.modelValue) return null;
  return publishers.value.find((p) => p.MaNXB === props.modelValue || p._id === props.modelValue) || null;
});

// Hàm loại bỏ dấu tiếng Việt để tìm kiếm không dấu
const removeVietnameseTones = (str) => {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  str = str.replace(/\u02C6|\u0306|\u031B/g, '');
  return str.trim();
};

const filteredPublishers = computed(() => {
  const query = removeVietnameseTones(searchQuery.value);
  if (!query) return publishers.value;

  return publishers.value.filter((pub) => {
    const name = removeVietnameseTones(pub.TenNXB || '');
    const code = removeVietnameseTones(pub.MaNXB || '');
    const address = removeVietnameseTones(pub.DiaChi || '');
    return name.includes(query) || code.includes(query) || address.includes(query);
  });
});

const openDropdown = () => {
  isOpen.value = true;
  showQuickAddForm.value = false;
  nextTick(() => {
    searchInputRef.value?.focus();
  });
};

const closeDropdown = () => {
  isOpen.value = false;
  showQuickAddForm.value = false;
  searchQuery.value = '';
};

const toggleDropdown = () => {
  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
};

const selectPublisher = (pub) => {
  emit('update:modelValue', pub.MaNXB);
  emit('change', pub);
  closeDropdown();
};

const clearSelection = () => {
  emit('update:modelValue', '');
  emit('change', null);
};

const openQuickAddWithQuery = () => {
  quickForm.tenNXB = searchQuery.value.trim();
  quickForm.maNXB = '';
  quickForm.diaChi = '';
  quickForm.dienThoai = '';
  showQuickAddForm.value = true;
};

const handleQuickAddPublisher = async () => {
  if (!quickForm.tenNXB.trim()) {
    toast.warning('Vui lòng nhập tên nhà xuất bản.');
    return;
  }

  isSubmittingQuickAdd.value = true;
  try {
    const res = await bookStore.createPublisher({
      tenNXB: quickForm.tenNXB.trim(),
      maNXB: quickForm.maNXB.trim() || undefined,
      diaChi: quickForm.diaChi.trim() || undefined,
      dienThoai: quickForm.dienThoai.trim() || undefined
    });

    if (res.success && res.data) {
      toast.success(`Đã thêm nhà xuất bản "${res.data.TenNXB}" thành công!`);
      // Tự động chọn NXB vừa tạo
      emit('update:modelValue', res.data.MaNXB);
      emit('change', res.data);
      closeDropdown();
    } else {
      toast.error(res.error || 'Thêm nhà xuất bản mới thất bại.');
    }
  } catch (err) {
    toast.error('Lỗi khi kết nối hệ thống tạo nhà xuất bản.');
  } finally {
    isSubmittingQuickAdd.value = false;
  }
};

// Xử lý xóa Nhà xuất bản (Dành riêng cho ADMIN)
const handleDeletePublisher = async (pub) => {
  if (!confirm(`Bạn có chắc chắn muốn xóa Nhà xuất bản "${pub.TenNXB}" (${pub.MaNXB}) khỏi hệ thống?`)) {
    return;
  }

  const res = await bookStore.deletePublisher(pub._id || pub.MaNXB);
  if (res.success) {
    toast.success(res.message);
    // Nếu NXB bị xóa đang được chọn trong form thì reset
    if (props.modelValue === pub.MaNXB || props.modelValue === pub._id) {
      emit('update:modelValue', '');
      emit('change', null);
    }
  } else {
    toast.error(res.error || 'Không thể xóa Nhà xuất bản.');
  }
};

// Đóng dropdown khi bấm ra ngoài
const handleClickOutside = (event) => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  if (!bookStore.publishers || bookStore.publishers.length === 0) {
    bookStore.fetchPublishers();
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

defineExpose({
  openDropdown,
  closeDropdown,
  openQuickAddWithQuery
});
</script>

<style scoped>
.custom-publisher-trigger {
  min-height: 38px;
  cursor: pointer;
  background-color: #ffffff;
  user-select: none;
  transition: all 0.2s ease;
}

.custom-publisher-trigger:hover {
  border-color: #94a3b8;
}

.custom-publisher-trigger.is-open {
  border-color: var(--admin-primary, #1b4332);
  box-shadow: 0 0 0 0.25rem rgba(27, 67, 50, 0.15);
}

.trigger-chevron {
  transition: transform 0.2s ease;
  font-size: 0.8rem;
}

.trigger-chevron.rotate-180 {
  transform: rotate(180deg);
}

.btn-clear-selection {
  background: none;
  border: none;
  padding: 0 0.25rem;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-clear-selection:hover {
  color: var(--bs-danger, #ef4444) !important;
}

.publisher-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 1060;
  max-height: 340px;
  display: flex;
  flex-direction: column;
  animation: dropdownSlide 0.18s ease-out;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.publisher-list-container {
  overflow-y: auto;
  max-height: 220px;
}

.publisher-list-item {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.publisher-list-item:hover {
  background-color: #f1f5f9;
}

.publisher-list-item.is-selected {
  background-color: #e8f5e9;
}

.extra-small {
  font-size: 0.75rem;
}

.quick-add-section {
  background-color: #f8fafc;
}
</style>
