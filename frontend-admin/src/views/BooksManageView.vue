<template>
  <div class="books-manage-view">
    <!-- Header chức năng -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h3 class="font-serif fw-bold text-dark mb-1">Quản Lý Kho Ấn Phẩm</h3>
        <p class="text-muted small mb-0">
          Tra cứu, cập nhật thông tin sách, kiểm soát tồn kho khả dụng và số bản đang lưu hành.
        </p>
      </div>

      <button class="btn btn-primary btn-sm px-3 shadow-sm d-flex align-items-center gap-2" @click="openCreateModal">
        <i class="bi bi-plus-circle-fill"></i>
        <span>Bổ Sung Ấn Phẩm Mới</span>
      </button>
    </div>

    <!-- Thanh bộ lọc & Tìm kiếm -->
    <div class="card border-0 shadow-sm p-3 mb-4 bg-white">
      <div class="row g-2 align-items-center">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              v-model="searchKeyword"
              class="form-control border-start-0"
              placeholder="Tìm theo tên sách, tác giả, mã..."
              @keyup.enter="handleSearch"
            />
            <button class="btn btn-primary" type="button" @click="handleSearch">
              Tìm
            </button>
          </div>
        </div>

        <div class="col-md-3">
          <select class="form-select" v-model="selectedGenre" @change="handleSearch">
            <option value="">Tất cả thể loại</option>
            <option v-for="g in bookStore.genres" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>

        <div class="col-md-3">
          <select class="form-select" v-model="selectedStatus" @change="handleSearch">
            <option value="ACTIVE">Đang lưu hành (ACTIVE)</option>
            <option value="ARCHIVED">Kho lưu trữ (ARCHIVED)</option>
            <option value="ALL">Tất cả trạng thái</option>
          </select>
        </div>

        <div class="col-md-2 d-flex justify-content-md-end gap-2">
          <button class="btn btn-outline-secondary btn-sm" @click="resetFilters" title="Đặt lại bộ lọc">
            <i class="bi bi-arrow-counterclockwise me-1"></i> Đặt lại
          </button>
          <span class="badge bg-light text-dark border align-self-center">
            Tổng: <strong>{{ bookStore.pagination.totalRecords || bookStore.pagination.total || 0 }}</strong>
          </span>
        </div>
      </div>
    </div>

    <!-- Bảng Danh mục Sách -->
    <div class="card border-0 shadow-sm bg-white overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 small">
          <thead class="table-light">
            <tr>
              <th>Ấn phẩm & Bìa</th>
              <th>Mã sách</th>
              <th>Thể loại & Tác giả</th>
              <th>Vị trí kệ</th>
              <th class="text-center">Tổng số</th>
              <th class="text-center">Trên kệ</th>
              <th class="text-center">Đang mượn</th>
              <th>Đơn giá</th>
              <th class="text-center">Trạng thái</th>
              <th class="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="bookStore.isLoading">
              <td colspan="10" class="text-center py-5">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                Đang tải dữ liệu kho sách...
              </td>
            </tr>

            <tr v-else-if="bookStore.books.length === 0">
              <td colspan="10" class="text-center py-5 text-muted">
                Không tìm thấy ấn phẩm nào phù hợp với điều kiện lọc.
              </td>
            </tr>

            <tr
              v-for="book in bookStore.books"
              :key="book._id"
              :id="'book-row-' + (book._id || book.MaSach)"
              :class="{ 'table-warning border-warning highlighted-row': highlightedBookId === book._id || highlightedBookId === book.MaSach }"
            >
              <td>
                <div class="d-flex align-items-center gap-2">
                  <img
                    :src="book.HinhAnh || defaultCover"
                    :alt="book.TenSach"
                    class="rounded shadow-sm"
                    style="width: 42px; height: 60px; object-fit: cover;"
                   
                    @error="$event.target.src = defaultCover"
                  />
                  <div>
                    <div
                      class="fw-bold text-dark"
                      
                    >
                      {{ book.TenSach }}
                    </div>
                    <div class="text-muted" style="font-size: 0.75rem;">Năm XB: {{ book.NamXuatBan || 'N/A' }}</div>
                  </div>
                </div>
              </td>
              <td>
                <code
                  class="text-primary"
                  
                >{{ book.MaSach }}</code>
              </td>
              <td>
                <div>{{ book.TacGia || book.NguonGoc || 'N/A' }}</div>
                <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle" style="font-size: 0.72rem;">
                  {{ book.TheLoai }}
                </span>
              </td>
              <td>
                <span class="badge bg-light text-dark border">
                  <i class="bi bi-geo-alt me-1 text-primary"></i>{{ book.ViTri || 'Kệ chung' }}
                </span>
              </td>
              <td class="text-center fw-bold">{{ book.SoQuyen }}</td>
              <td class="text-center">
                <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                  {{ book.SoQuyenKhaDung ?? book.SoQuyenConLai ?? (book.SoQuyen - (book.SoQuyenDangMuon || 0)) }}
                </span>
              </td>
              <td class="text-center">
                <span class="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">
                  {{ book.SoQuyenDangMuon || 0 }}
                </span>
              </td>
              <td class="fw-semibold text-danger">{{ formatCurrency(book.DonGia) }}</td>
              <td class="text-center">
                <span
                  class="badge"
                  :class="book.TrangThai === 'ARCHIVED' ? 'bg-secondary' : 'bg-success-subtle text-success border border-success-subtle'"
                >
                  {{ book.TrangThai === 'ARCHIVED' ? 'Đã lưu trữ' : 'Đang lưu hành' }}
                </span>
              </td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <button
                    class="btn btn-outline-info"
                    @click="bookDetailModalRef?.open(book)"
                    title="Xem chi tiết đầy đủ ấn phẩm"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <template v-if="book.TrangThai === 'ARCHIVED'">
                    <button
                      class="btn btn-success"
                      @click="handleRestore(book)"
                      title="Khôi phục ấn phẩm về kệ kho"
                    >
                      <i class="bi bi-arrow-counterclockwise me-1"></i> Khôi phục
                    </button>
                    <button class="btn btn-outline-primary" @click="openEditModal(book)" title="Chỉnh sửa thông tin">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                  </template>
                  <template v-else>
                    <button class="btn btn-outline-primary" @click="openEditModal(book)" title="Chỉnh sửa thông tin">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger"
                      @click="handleDelete(book)"
                      :disabled="book.SoQuyenDangMuon > 0"
                      :title="book.SoQuyenDangMuon > 0 ? 'Không thể xóa khi có bản sách đang được độc giả mượn' : 'Lưu trữ (Soft delete)'"
                    >
                      <i class="bi bi-archive"></i>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Phân trang -->
      <div class="p-3 border-top d-flex justify-content-between align-items-center" v-if="bookStore.pagination.totalPages > 1">
        <span class="small text-muted">
          Trang <strong>{{ bookStore.pagination.page }}</strong> / {{ bookStore.pagination.totalPages }}
        </span>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: bookStore.pagination.page <= 1 }">
            <button class="page-link" @click="goToPage(bookStore.pagination.page - 1)">Trước</button>
          </li>
          <li
            v-for="p in bookStore.pagination.totalPages"
            :key="p"
            class="page-item"
            :class="{ active: p === bookStore.pagination.page }"
          >
            <button class="page-link" @click="goToPage(p)">{{ p }}</button>
          </li>
          <li class="page-item" :class="{ disabled: bookStore.pagination.page >= bookStore.pagination.totalPages }">
            <button class="page-link" @click="goToPage(bookStore.pagination.page + 1)">Sau</button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Modal Chi Tiết Ấn Phẩm -->
    <BookDetailModal ref="bookDetailModalRef" />

    <!-- Modal Thêm/Sửa Ấn Phẩm -->
    <div class="modal fade" id="bookModal" tabindex="-1" aria-hidden="true" ref="modalRef">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title font-serif fs-5">
              <i :class="isEditing ? 'bi bi-pencil-square me-2' : 'bi bi-plus-circle-fill me-2'"></i>
              {{ isEditing ? 'Chỉnh Sửa Thông Tin Ấn Phẩm' : 'Bổ Sung Ấn Phẩm Vào Kho' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>

          <form @submit.prevent="handleSubmitBook" autocomplete="off" autocorrect="off" autocapitalize="off">
            <div class="modal-body p-4">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label small fw-semibold">Tên tác phẩm / Nhan đề sách <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    name="book_title"
                    v-model="formData.TenSach"
                    class="form-control"
                    autocomplete="off"
                    required
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Mã ấn phẩm (Tự sinh nếu bỏ trống)</label>
                  <input
                    type="text"
                    name="book_code"
                    v-model="formData.MaSach"
                    class="form-control"
                    :disabled="isEditing"
                    placeholder="VD: SACH001"
                    autocomplete="off"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Tác giả / Nguồn gốc <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    name="book_author"
                    v-model="formData.TacGia"
                    class="form-control"
                    autocomplete="off"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Chủ đề / Thể loại <span class="text-danger">*</span></label>
                  <select
                    name="book_genre"
                    v-model="formData.TheLoai"
                    class="form-select"
                    autocomplete="off"
                    required
                  >
                    <option v-for="g in bookStore.genres" :key="g" :value="g">{{ g }}</option>
                    <option v-if="formData.TheLoai && !bookStore.genres.includes(formData.TheLoai)" :value="formData.TheLoai">
                      {{ formData.TheLoai }}
                    </option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Đơn giá niêm yết (VNĐ) <span class="text-danger">*</span></label>
                  <input
                    type="number"
                    name="book_price"
                    v-model="formData.DonGia"
                    class="form-control"
                    min="0"
                    step="1000"
                    autocomplete="off"
                    required
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Số lượng bản sách nhập kho <span class="text-danger">*</span></label>
                  <input
                    type="number"
                    name="book_quantity"
                    v-model="formData.SoQuyen"
                    class="form-control"
                    min="1"
                    autocomplete="off"
                    required
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Năm xuất bản</label>
                  <input
                    type="number"
                    name="book_publish_year"
                    v-model="formData.NamXuatBan"
                    class="form-control"
                    :max="new Date().getFullYear()"
                    autocomplete="off"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-semibold d-flex justify-content-between align-items-center mb-1">
                    <span>Nhà xuất bản <span class="text-danger">*</span></span>
                    <button
                      type="button"
                      class="btn btn-link btn-sm p-0 text-decoration-none text-primary fw-bold"
                      style="font-size: 0.75rem;"
                      @click="publisherSelectRef?.openQuickAddWithQuery()"
                    >
                      <i class="bi bi-plus-circle me-1"></i>Thêm NXB mới
                    </button>
                  </label>
                  <PublisherSelect ref="publisherSelectRef" v-model="formData.MaNXB" :required="true" />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Mã chuẩn quốc tế (ISBN)</label>
                  <input
                    type="text"
                    name="book_isbn_number"
                    v-model="formData.ISBN"
                    class="form-control"
                    placeholder="VD: 978-604-0-12345-6"
                    autocomplete="off"
                  />
                </div>

                <div class="col-12">
                  <label class="form-label small fw-semibold">Vị trí lưu kho (Kệ / Tầng)</label>
                  <input
                    type="text"
                    name="book_shelf_location"
                    v-model="formData.ViTri"
                    class="form-control"
                    placeholder="Ví dụ: Kệ A1 - Tầng 2"
                    autocomplete="off"
                  />
                </div>

                <!-- Tải ảnh bìa sách từ máy tính -->
                <div class="col-12">
                  <label class="form-label small fw-semibold">Ảnh bìa ấn phẩm (Tải lên từ máy tính)</label>
                  <div class="d-flex gap-3 align-items-center">
                    <div class="flex-shrink-0 text-center">
                      <div class="position-relative d-inline-block">
                        <img
                          :src="getImageUrl(formData.HinhAnh, defaultCover)"
                          alt="Preview"
                          class="rounded border shadow-sm"
                          style="width: 70px; height: 98px; object-fit: cover;"
                          @error="$event.target.src = defaultCover"
                        />
                        <button
                          type="button"
                          class="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 shadow"
                          style="width: 26px; height: 26px; padding: 0; display: flex; align-items: center; justify-content: center;"
                          @click="triggerCoverSelect"
                          title="Tải ảnh từ máy tính"
                          :disabled="isUploadingCover"
                        >
                          <span v-if="isUploadingCover" class="spinner-border spinner-border-sm" style="width: 12px; height: 12px;"></span>
                          <i v-else class="bi bi-camera-fill" style="font-size: 0.75rem;"></i>
                        </button>
                      </div>
                    </div>

                    <div class="flex-grow-1">
                      <div class="d-flex gap-2 mb-2">
                        <button
                          type="button"
                          class="btn btn-outline-primary btn-sm px-3"
                          @click="triggerCoverSelect"
                          :disabled="isUploadingCover"
                        >
                          <span v-if="isUploadingCover" class="spinner-border spinner-border-sm me-1"></span>
                          <i v-else class="bi bi-cloud-arrow-up-fill me-1"></i>
                          Chọn ảnh từ máy tính (Tối đa 5MB)
                        </button>
                        <button
                          type="button"
                          v-if="formData.HinhAnh"
                          class="btn btn-outline-secondary btn-sm"
                          @click="formData.HinhAnh = ''"
                          title="Đặt lại ảnh bìa mặc định"
                        >
                          <i class="bi bi-x-circle me-1"></i> Xóa ảnh
                        </button>
                      </div>
                      <input
                        type="file"
                        ref="coverFileInput"
                        class="d-none"
                        accept="image/jpeg,image/png,image/webp"
                        @change="onCoverFileSelected"
                      />
                      <input
                        type="text"
                        name="book_cover_url"
                        v-model="formData.HinhAnh"
                        class="form-control form-control-sm font-monospace text-muted"
                        placeholder="Đường dẫn ảnh lưu trên server Express (/uploads/covers/...)"
                        autocomplete="off"
                      />
                      <div class="form-text small" style="font-size: 0.75rem;">
                        Ảnh tải lên từ máy tính sẽ được lưu trữ trực tiếp trên Server Express (`/uploads/covers`).
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label small fw-semibold">Mô tả tóm tắt nội dung ấn phẩm</label>
                  <textarea
                    name="book_summary"
                    v-model="formData.MoTa"
                    rows="3"
                    class="form-control"
                    placeholder="Tóm tắt giới thiệu nội dung cuốn sách..."
                    autocomplete="off"
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Bỏ qua</button>
              <button type="submit" class="btn btn-primary btn-sm px-4" :disabled="bookStore.isLoading">
                <span v-if="bookStore.isLoading" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEditing ? 'Lưu Thay Đổi' : 'Thêm Sách Vào Kho' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAdminBookStore } from '../stores/adminBookStore';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';
import BookDetailModal from '../components/BookDetailModal.vue';
import PublisherSelect from '../components/PublisherSelect.vue';
import { getImageUrl } from '../utils/imageHelper';

const route = useRoute();
const bookStore = useAdminBookStore();
const toast = useToast();
const { confirm } = useConfirm();

const bookDetailModalRef = ref(null);
const publisherSelectRef = ref(null);
const highlightedBookId = ref(null);

const searchKeyword = ref('');
const selectedGenre = ref('');
const selectedStatus = ref('ACTIVE');
const modalRef = ref(null);
const isEditing = ref(false);
const editingBookId = ref(null);
const isUploadingCover = ref(false);
const coverFileInput = ref(null);
const defaultCover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';

const triggerCoverSelect = () => {
  coverFileInput.value?.click();
};

const onCoverFileSelected = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Kiểm tra kích thước tối đa 5MB
  const maxSizeBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    toast.error('Kích thước ảnh bìa sách vượt quá dung lượng cho phép (Tối đa 5MB).');
    event.target.value = '';
    return;
  }

  // Kiểm tra định dạng
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    toast.error('Định dạng ảnh không hợp lệ. Chỉ chấp nhận .jpg, .jpeg, .png, .webp.');
    event.target.value = '';
    return;
  }

  isUploadingCover.value = true;
  try {
    const res = await bookStore.uploadCover(file);
    if (res.success) {
      formData.HinhAnh = res.data.url;
      toast.success(res.message || 'Tải lên ảnh bìa sách thành công!');
    } else {
      toast.error(res.error || 'Tải lên ảnh bìa thất bại.');
    }
  } catch (err) {
    toast.error('Lỗi khi tải lên tập tin ảnh bìa.');
  } finally {
    isUploadingCover.value = false;
    event.target.value = '';
  }
};

const formData = reactive({
  TenSach: '',
  MaSach: '',
  TacGia: '',
  TheLoai: 'Công nghệ thông tin',
  DonGia: 50000,
  SoQuyen: 5,
  NamXuatBan: new Date().getFullYear(),
  MaNXB: '',
  ViTri: '',
  HinhAnh: '',
  MoTa: '',
  ISBN: ''
});

const formatCurrency = (val) => {
  if (!val) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const handleSearch = () => {
  bookStore.filters.search = searchKeyword.value.trim();
  bookStore.filters.theLoai = selectedGenre.value;
  bookStore.filters.status = selectedStatus.value;
  bookStore.fetchBooks(1);
};

const resetFilters = () => {
  searchKeyword.value = '';
  selectedGenre.value = '';
  selectedStatus.value = 'ACTIVE';
  bookStore.filters.search = '';
  bookStore.filters.theLoai = '';
  bookStore.filters.status = 'ACTIVE';
  bookStore.fetchBooks(1);
};

const goToPage = (page) => {
  bookStore.fetchBooks(page);
};

const openCreateModal = () => {
  isEditing.value = false;
  editingBookId.value = null;
  formData.TenSach = '';
  formData.MaSach = '';
  formData.TacGia = '';
  formData.TheLoai = bookStore.genres[0] || 'Công nghệ thông tin';
  formData.DonGia = 50000;
  formData.SoQuyen = 5;
  formData.NamXuatBan = new Date().getFullYear();
  formData.MaNXB = '';
  formData.ViTri = '';
  formData.HinhAnh = '';
  formData.MoTa = '';
  formData.ISBN = '';

  const modal = new window.bootstrap.Modal(modalRef.value);
  modal.show();
};

const openEditModal = (book) => {
  isEditing.value = true;
  editingBookId.value = book._id;
  formData.TenSach = book.TenSach || '';
  formData.MaSach = book.MaSach || '';
  formData.TacGia = book.TacGia || book.NguonGoc || '';
  formData.TheLoai = book.TheLoai || (bookStore.genres[0] || 'Công nghệ thông tin');
  formData.DonGia = book.DonGia ?? 50000;
  formData.SoQuyen = book.SoQuyen ?? 1;
  formData.NamXuatBan = book.NamXuatBan || new Date().getFullYear();
  formData.MaNXB = book.MaNXB?.MaNXB || book.MaNXB || '';
  formData.ViTri = book.ViTri || '';
  formData.HinhAnh = book.HinhAnh || '';
  formData.MoTa = book.MoTa || '';
  formData.ISBN = book.ISBN || '';

  const modal = new window.bootstrap.Modal(modalRef.value);
  modal.show();
};

const handleSubmitBook = async () => {
  if (!formData.MaNXB) {
    toast.warning('Vui lòng chọn hoặc thêm mới Nhà xuất bản.');
    return;
  }

  let res;
  if (isEditing.value) {
    res = await bookStore.updateBook(editingBookId.value, formData);
  } else {
    res = await bookStore.createBook(formData);
  }

  if (res.success) {
    const modal = window.bootstrap.Modal.getInstance(modalRef.value);
    if (modal) modal.hide();
    toast.success(res.message);
  } else {
    toast.error(res.error);
  }
};

const handleDelete = async (book) => {
  if (book.SoQuyenDangMuon > 0) {
    toast.warning('Cảnh báo an toàn: Sách đang có bản in được độc giả mượn chưa trả. Không thể xóa ấn phẩm này!');
    return;
  }

  const isConfirmed = await confirm({
    title: 'Lưu trữ ấn phẩm (Xóa mềm)',
    message: `Bạn có chắc chắn muốn chuyển ấn phẩm "${book.TenSach}" (${book.MaSach}) vào kho lưu trữ? Ấn phẩm sẽ bị ẩn khỏi danh mục bạn đọc.`,
    confirmText: 'Chuyển vào lưu trữ',
    cancelText: 'Bỏ qua',
    type: 'danger',
    icon: 'bi-archive-fill'
  });
  if (!isConfirmed) return;

  const res = await bookStore.deleteBook(book._id);
  if (res.success) toast.success(res.message);
  else toast.error(res.error);
};

const handleRestore = async (book) => {
  const isConfirmed = await confirm({
    title: 'Khôi phục ấn phẩm',
    message: `Xác nhận khôi phục ấn phẩm "${book.TenSach}" (${book.MaSach}) từ kho lưu trữ về kệ kho lưu hành?`,
    confirmText: 'Khôi phục ấn phẩm',
    cancelText: 'Hủy bỏ',
    type: 'success',
    icon: 'bi-arrow-counterclockwise'
  });
  if (!isConfirmed) return;

  const res = await bookStore.restoreBook(book._id);
  if (res.success) toast.success(res.message);
  else toast.error(res.error);
};

const handleRouteQuery = async () => {
  const query = route.query;
  if (query.search || query.status || query.highlight || query.editId) {
    if (query.search) searchKeyword.value = String(query.search).trim();
    if (query.status) selectedStatus.value = String(query.status);
    bookStore.filters.search = searchKeyword.value;
    bookStore.filters.status = selectedStatus.value;
  }

  await bookStore.fetchBooks();

  const targetHighlight = query.highlight || query.editId || (query.search ? query.search : null);
  if (targetHighlight) {
    highlightedBookId.value = targetHighlight;

    await nextTick();
    const el = document.getElementById('book-row-' + targetHighlight);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Tự động mở modal chỉnh sửa nếu có cờ autoEdit hoặc editId
    if (query.autoEdit === 'true' || query.editId) {
      const targetBook = bookStore.books.find(
        (b) => b._id === targetHighlight || b.MaSach === targetHighlight || b.MaSach === query.search
      );
      if (targetBook) {
        openEditModal(targetBook);
      }
    }

    setTimeout(() => {
      highlightedBookId.value = null;
    }, 4500);
  }
};

watch(
  () => route.query,
  () => {
    handleRouteQuery();
  }
);

onMounted(async () => {
  bookStore.fetchPublishers();
  bookStore.fetchCategories();
  await handleRouteQuery();
});
</script>

<style scoped>
.role-clickable {
  cursor: pointer;
  transition: opacity 0.15s ease, color 0.15s ease;
}
.role-clickable:hover {
  opacity: 0.85;
}
.hover-underline:hover {
  text-decoration: underline !important;
}

@keyframes pulse-row-highlight {
  0% {
    background-color: rgba(255, 193, 7, 0.25);
  }
  50% {
    background-color: rgba(255, 193, 7, 0.65);
  }
  100% {
    background-color: rgba(255, 193, 7, 0.3);
  }
}

.highlighted-row {
  animation: pulse-row-highlight 1.2s ease-in-out infinite alternate;
  box-shadow: 0 0 0 2px var(--admin-primary) !important;
  transition: all 0.3s ease;
}
</style>
