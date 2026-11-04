<template>
  <div class="category-select-wrapper position-relative" ref="wrapperRef">
    <!-- Nút hiển thị lựa chọn Thể loại hiện tại -->
    <div
      class="form-select custom-category-trigger d-flex align-items-center justify-content-between"
      :class="{ 'is-invalid': invalid, 'is-open': isOpen }"
      tabindex="0"
      @click="toggleDropdown"
      @keydown.down.prevent="openDropdown"
      @keydown.enter.prevent="toggleDropdown"
      @keydown.esc="closeDropdown"
    >
      <div class="selected-category-display text-truncate pe-2">
        <span v-if="selectedCategory" class="fw-semibold text-dark">
          <i class="bi bi-tags-fill me-1 text-primary"></i>
          {{ selectedCategory.tenTheLoai }}
          <span class="badge bg-light text-secondary border ms-1 font-monospace">{{ selectedCategory.maTheLoai }}</span>
        </span>
        <span v-else-if="modelValue" class="fw-semibold text-dark">
          <i class="bi bi-tag me-1 text-primary"></i>
          {{ modelValue }}
        </span>
        <span v-else class="text-muted">
          <i class="bi bi-search me-1"></i> Chọn hoặc tìm kiếm thể loại...
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

    <!-- Hidden input để giữ giá trị form validation -->
    <input type="hidden" :value="modelValue" />

    <!-- Dropdown Menu Tìm Kiếm & Danh Sách Thể Loại -->
    <div v-if="isOpen" class="category-dropdown-menu shadow-lg border rounded-3 bg-white" @click.stop>
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
            placeholder="Gõ tên thể loại, mã hoặc mô tả..."
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

      <!-- Khung Form Thêm Nhanh Thể Loại Mới (Inline Quick Add) -->
      <div v-if="showQuickAddForm" class="p-3 bg-light-subtle border-bottom quick-section" @click.stop>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="font-serif fw-bold text-dark mb-0 small">
            <i class="bi bi-plus-circle-fill text-primary me-1"></i> Thêm Thể Loại Mới
          </h6>
          <button type="button" class="btn-close btn-sm" @click="showQuickAddForm = false" style="font-size: 0.7rem;"></button>
        </div>

        <div class="quick-add-form" @keydown.enter.prevent="handleQuickAddCategory">
          <div class="mb-2">
            <label class="form-label extra-small fw-semibold mb-1">Tên Thể Loại <span class="text-danger">*</span></label>
            <input
              type="text"
              v-model="quickForm.tenTheLoai"
              class="form-control form-control-sm"
              placeholder="VD: Khoa học viễn tưởng, Kinh tế học..."
              required
            />
          </div>

          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label extra-small fw-semibold mb-1">Mã Thể Loại (Tự sinh nếu trống)</label>
              <input
                type="text"
                v-model="quickForm.maTheLoai"
                class="form-control form-control-sm text-uppercase"
                placeholder="VD: TL05"
              />
            </div>
            <div class="col-6">
              <label class="form-label extra-small fw-semibold mb-1">Mô tả tóm tắt</label>
              <input
                type="text"
                v-model="quickForm.moTa"
                class="form-control form-control-sm"
                placeholder="VD: Sách chuyên ngành..."
              />
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary btn-sm py-1 px-2 extra-small" @click="showQuickAddForm = false">
              Hủy
            </button>
            <button
              type="button"
              class="btn btn-primary btn-sm py-1 px-3 extra-small"
              :disabled="isSubmittingQuickAdd"
              @click="handleQuickAddCategory"
            >
              <span v-if="isSubmittingQuickAdd" class="spinner-border spinner-border-sm me-1" style="width: 12px; height: 12px;"></span>
              <i v-else class="bi bi-check2 me-1"></i>
              Lưu & Chọn Thể Loại Này
            </button>
          </div>
        </div>
      </div>

      <!-- Khung Form Chỉnh Sửa Thể Loại (Inline Edit) -->
      <div v-if="showEditForm" class="p-3 bg-warning-subtle border-bottom quick-section" @click.stop>
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="font-serif fw-bold text-dark mb-0 small">
            <i class="bi bi-pencil-square text-warning-emphasis me-1"></i> Chỉnh Sửa: <span class="font-monospace text-primary">{{ editForm.maTheLoai }}</span>
          </h6>
          <button type="button" class="btn-close btn-sm" @click="showEditForm = false" style="font-size: 0.7rem;"></button>
        </div>

        <div class="quick-edit-form" @keydown.enter.prevent="handleUpdateCategory">
          <div class="mb-2">
            <label class="form-label extra-small fw-semibold mb-1">Tên Thể Loại <span class="text-danger">*</span></label>
            <input
              type="text"
              v-model="editForm.tenTheLoai"
              class="form-control form-control-sm"
              required
            />
          </div>

          <div class="row g-2 mb-2">
            <div class="col-7">
              <label class="form-label extra-small fw-semibold mb-1">Mô tả</label>
              <input
                type="text"
                v-model="editForm.moTa"
                class="form-control form-control-sm"
              />
            </div>
            <div class="col-5">
              <label class="form-label extra-small fw-semibold mb-1">Trạng thái</label>
              <select v-model="editForm.trangThai" class="form-select form-select-sm">
                <option value="ACTIVE">Đang dùng</option>
                <option value="INACTIVE">Tạm khóa</option>
              </select>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary btn-sm py-1 px-2 extra-small" @click="showEditForm = false">
              Hủy
            </button>
            <button
              type="button"
              class="btn btn-warning btn-sm py-1 px-3 extra-small fw-semibold"
              :disabled="isSubmittingEdit"
              @click="handleUpdateCategory"
            >
              <span v-if="isSubmittingEdit" class="spinner-border spinner-border-sm me-1" style="width: 12px; height: 12px;"></span>
              <i v-else class="bi bi-save me-1"></i>
              Lưu Thay Đổi
            </button>
          </div>
        </div>
      </div>

      <!-- Danh Sách Thể Loại Đã Lọc -->
      <div class="category-list-container" v-if="!showQuickAddForm && !showEditForm">
        <div v-if="filteredCategories.length === 0" class="p-3 text-center text-muted small">
          <i class="bi bi-bookmark-x fs-3 text-muted d-block mb-1"></i>
          <div>Không tìm thấy Thể loại nào khớp với "<strong>{{ searchQuery }}</strong>"</div>
          <button
            type="button"
            class="btn btn-outline-primary btn-sm mt-2 rounded-pill px-3 extra-small"
            @click="openQuickAddWithQuery"
          >
            <i class="bi bi-plus-circle me-1"></i> Tạo thể loại "<strong>{{ searchQuery }}</strong>" ngay
          </button>
        </div>

        <ul v-else class="list-unstyled mb-0 py-1">
          <li
            v-for="cat in filteredCategories"
            :key="cat._id || cat.maTheLoai"
            class="category-list-item px-3 py-2 d-flex align-items-center justify-content-between"
            :class="{ 'is-selected': isCategorySelected(cat) }"
            @click="selectCategory(cat)"
          >
            <div class="me-2 text-truncate">
              <div class="fw-semibold text-dark item-title text-truncate">
                <i class="bi bi-tag me-1 text-primary opacity-75"></i>
                {{ cat.tenTheLoai }}
                <span v-if="cat.trangThai === 'INACTIVE'" class="badge bg-secondary extra-small ms-1">Tạm khóa</span>
              </div>
              <div class="text-muted extra-small text-truncate" v-if="cat.moTa">
                <i class="bi bi-info-circle me-1"></i>{{ cat.moTa }}
              </div>
            </div>

            <div class="d-flex align-items-center gap-1 flex-shrink-0">
              <span class="badge bg-light text-secondary border font-monospace">{{ cat.maTheLoai }}</span>
              
              <!-- Nút Chỉnh sửa Thể loại -->
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm border-0 py-0 px-1 rounded btn-action"
                title="Chỉnh sửa thông tin Thể loại"
                @click.stop="openEditCategory(cat)"
              >
                <i class="bi bi-pencil-square text-primary"></i>
              </button>

              <!-- Nút Xóa Thể loại -->
              <button
                type="button"
                class="btn btn-outline-danger btn-sm border-0 py-0 px-1 rounded btn-action"
                title="Xóa Thể loại"
                @click.stop="handleDeleteCategory(cat)"
              >
                <i class="bi bi-trash"></i>
              </button>

              <i v-if="isCategorySelected(cat)" class="bi bi-check-circle-fill text-primary ms-1"></i>
            </div>
          </li>
        </ul>
      </div>

      <!-- Footer Tạo Thể Loại Mới nếu không mở form -->
      <div v-if="!showQuickAddForm && !showEditForm" class="p-2 border-top bg-light d-flex justify-content-between align-items-center">
        <span class="text-muted extra-small">Tổng cộng: {{ filteredCategories.length }} / {{ categories.length }} Thể loại</span>
        <button
          type="button"
          class="btn btn-link btn-sm text-decoration-none text-primary fw-bold p-0 extra-small"
          @click="openQuickAddWithQuery"
        >
          <i class="bi bi-plus-circle me-1"></i>Thêm thể loại mới
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useAdminBookStore } from '../stores/adminBookStore';
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
const toast = useToast();

const wrapperRef = ref(null);
const searchInputRef = ref(null);
const isOpen = ref(false);
const searchQuery = ref('');
const showQuickAddForm = ref(false);
const showEditForm = ref(false);
const isSubmittingQuickAdd = ref(false);
const isSubmittingEdit = ref(false);

const quickForm = reactive({
  tenTheLoai: '',
  maTheLoai: '',
  moTa: ''
});

const editForm = reactive({
  id: '',
  maTheLoai: '',
  tenTheLoai: '',
  moTa: '',
  trangThai: 'ACTIVE'
});

const categories = computed(() => bookStore.categories || []);

const selectedCategory = computed(() => {
  if (!props.modelValue) return null;
  return (
    categories.value.find(
      (c) =>
        c.tenTheLoai === props.modelValue ||
        c.maTheLoai === props.modelValue ||
        c._id === props.modelValue
    ) || null
  );
});

const isCategorySelected = (cat) => {
  if (!props.modelValue) return false;
  return (
    props.modelValue === cat.tenTheLoai ||
    props.modelValue === cat.maTheLoai ||
    props.modelValue === cat._id
  );
};

// Loại bỏ dấu tiếng Việt để tìm kiếm không dấu
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

const filteredCategories = computed(() => {
  const query = removeVietnameseTones(searchQuery.value);
  if (!query) return categories.value;

  return categories.value.filter((cat) => {
    const name = removeVietnameseTones(cat.tenTheLoai || '');
    const code = removeVietnameseTones(cat.maTheLoai || '');
    const desc = removeVietnameseTones(cat.moTa || '');
    return name.includes(query) || code.includes(query) || desc.includes(query);
  });
});

const openDropdown = () => {
  isOpen.value = true;
  showQuickAddForm.value = false;
  showEditForm.value = false;
  nextTick(() => {
    searchInputRef.value?.focus();
  });
};

const closeDropdown = () => {
  isOpen.value = false;
  showQuickAddForm.value = false;
  showEditForm.value = false;
  searchQuery.value = '';
};

const toggleDropdown = () => {
  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
};

const selectCategory = (cat) => {
  const name = cat.tenTheLoai;
  emit('update:modelValue', name);
  emit('change', cat);
  closeDropdown();
};

const clearSelection = () => {
  emit('update:modelValue', '');
  emit('change', null);
};

const openQuickAddWithQuery = () => {
  quickForm.tenTheLoai = searchQuery.value.trim();
  quickForm.maTheLoai = '';
  quickForm.moTa = '';
  showQuickAddForm.value = true;
  showEditForm.value = false;
};

const handleQuickAddCategory = async () => {
  if (!quickForm.tenTheLoai.trim()) {
    toast.warning('Vui lòng nhập tên thể loại ấn phẩm.');
    return;
  }

  isSubmittingQuickAdd.value = true;
  try {
    const res = await bookStore.createCategory({
      tenTheLoai: quickForm.tenTheLoai.trim(),
      maTheLoai: quickForm.maTheLoai.trim() || undefined,
      moTa: quickForm.moTa.trim() || undefined
    });

    if (res.success && res.data) {
      toast.success(`Đã thêm thể loại "${res.data.tenTheLoai}" thành công!`);
      // Tự động chọn thể loại vừa tạo
      emit('update:modelValue', res.data.tenTheLoai);
      emit('change', res.data);
      closeDropdown();
    } else {
      toast.error(res.error || 'Thêm thể loại mới thất bại.');
    }
  } catch (err) {
    toast.error('Lỗi khi kết nối hệ thống tạo thể loại.');
  } finally {
    isSubmittingQuickAdd.value = false;
  }
};

const openEditCategory = (cat) => {
  editForm.id = cat._id;
  editForm.maTheLoai = cat.maTheLoai;
  editForm.tenTheLoai = cat.tenTheLoai;
  editForm.moTa = cat.moTa || '';
  editForm.trangThai = cat.trangThai || 'ACTIVE';
  showEditForm.value = true;
  showQuickAddForm.value = false;
};

const handleUpdateCategory = async () => {
  if (!editForm.tenTheLoai.trim()) {
    toast.warning('Tên thể loại không được để trống.');
    return;
  }

  isSubmittingEdit.value = true;
  try {
    const oldCategory = categories.value.find((c) => c._id === editForm.id);
    const oldName = oldCategory?.tenTheLoai;

    const res = await bookStore.updateCategory(editForm.id, {
      tenTheLoai: editForm.tenTheLoai.trim(),
      moTa: editForm.moTa.trim(),
      trangThai: editForm.trangThai
    });

    if (res.success && res.data) {
      toast.success(`Cập nhật thể loại "${res.data.tenTheLoai}" thành công!`);
      // Nếu thể loại đang được chọn trước đó bị đổi tên, cập nhật modelValue theo tên mới
      if (props.modelValue === oldName) {
        emit('update:modelValue', res.data.tenTheLoai);
        emit('change', res.data);
      }
      showEditForm.value = false;
    } else {
      toast.error(res.error || 'Cập nhật thể loại thất bại.');
    }
  } catch (err) {
    toast.error('Lỗi khi kết nối hệ thống cập nhật thể loại.');
  } finally {
    isSubmittingEdit.value = false;
  }
};

const handleDeleteCategory = async (cat) => {
  const catName = cat.tenTheLoai;
  const catCode = cat.maTheLoai;
  if (!confirm(`Bạn có chắc chắn muốn xóa Thể loại "${catName}" (${catCode}) khỏi hệ thống?`)) {
    return;
  }

  const res = await bookStore.deleteCategory(cat._id);
  if (res.success) {
    toast.success(res.message);
    // Nếu thể loại bị xóa đang được chọn trong form thì reset
    if (props.modelValue === catName || props.modelValue === catCode || props.modelValue === cat._id) {
      emit('update:modelValue', '');
      emit('change', null);
    }
  } else {
    toast.error(res.error || 'Không thể xóa Thể loại.');
  }
};

const handleClickOutside = (event) => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  if (!bookStore.categories || bookStore.categories.length === 0) {
    bookStore.fetchCategories();
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
.custom-category-trigger {
  min-height: 38px;
  cursor: pointer;
  background-color: #ffffff;
  user-select: none;
  transition: all 0.2s ease;
}

.custom-category-trigger:hover {
  border-color: #94a3b8;
}

.custom-category-trigger.is-open {
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

.category-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 1060;
  max-height: 380px;
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

.category-list-container {
  overflow-y: auto;
  max-height: 240px;
}

.category-list-item {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.category-list-item:hover {
  background-color: #f1f5f9;
}

.category-list-item.is-selected {
  background-color: #e8f5e9;
}

.btn-action {
  opacity: 0.7;
  transition: opacity 0.15s ease, transform 0.1s ease;
}

.btn-action:hover {
  opacity: 1;
  transform: scale(1.1);
}

.extra-small {
  font-size: 0.75rem;
}

.quick-section {
  background-color: #f8fafc;
}
</style>

