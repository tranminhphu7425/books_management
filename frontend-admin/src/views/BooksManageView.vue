<template>
  <div class="books-manage-view">
    <!-- Header chức năng -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h3 class="font-serif fw-bold text-dark mb-1">Quản Lý Kho Ấn Phẩm</h3>
       
      </div>

      <button class="btn btn-primary btn-sm px-3 shadow-sm d-flex align-items-center gap-2" @click="openCreateModal">
        <i class="bi bi-plus-circle-fill"></i>
        <span>Bổ Sung Ấn Phẩm Mới</span>
      </button>
    </div>

    <!-- Thanh bộ lọc & Tìm kiếm -->
    <div class="card border-0 shadow-sm p-3 mb-4 bg-white">
      <div class="row g-2 align-items-center">
        <div class="col-lg-3 col-md-6">
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

        <div class="col-lg-3 col-md-6">
          <select class="form-select" v-model="selectedGenre" @change="handleSearch">
            <option value="">Tất cả thể loại</option>
            <option v-for="g in bookStore.genres" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>

        <div class="col-lg-2 col-md-6">
          <select class="form-select" v-model="selectedStatus" @change="handleSearch">
            <option value="ACTIVE">Đang lưu hành</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
            <option value="ALL">Tất cả trạng thái</option>
          </select>
        </div>

        <div class="col-lg-3 col-md-6">
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0 text-muted" title="Sắp xếp danh sách">
              <i class="bi bi-arrow-down-up"></i>
            </span>
            <select class="form-select border-start-0" v-model="selectedSort" @change="handleSortChange">
              <option value="MaSach_asc">Mã sách: Tăng dần</option>
              <option value="MaSach_desc">Mã sách: Giảm dần</option>
              <option value="TenSach_asc">Nhan đề sách: A - Z</option>
              <option value="TenSach_desc">Nhan đề sách: Z - A</option>
              <option value="createdAt_desc">Mới nhập kho nhất</option>
              <option value="createdAt_asc">Nhập kho cũ nhất</option>
              <option value="DonGia_asc">Đơn giá: Thấp - Cao</option>
              <option value="DonGia_desc">Đơn giá: Cao - Thấp</option>
              <option value="SoQuyen_desc">Tổng số lượng: Nhiều nhất</option>
              <option value="SoQuyenKhaDung_desc">Khả dụng trên kệ: Nhiều nhất</option>
            </select>
          </div>
        </div>

        <div class="col-lg-1 col-md-12 d-flex justify-content-between justify-content-lg-end gap-2">
          <button class="btn btn-outline-secondary btn-sm flex-fill" @click="resetFilters" title="Đặt lại bộ lọc về mặc định">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Bảng Danh mục Sách -->
    <div class="card border-0 shadow-sm bg-white overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 small">
          <thead class="table-light">
            <tr>
              <th class="text-center" style="width: 50px;">STT</th>
              <th class="role-clickable text-nowrap" @click="toggleSort('TenSach')" title="Nhấn để sắp xếp theo Nhan đề ấn phẩm">
                Ấn phẩm & Bìa
                <i
                  class="bi ms-1"
                  :class="bookStore.filters.sort === 'TenSach' ? (bookStore.filters.order === 'asc' ? 'bi-sort-alpha-down text-primary' : 'bi-sort-alpha-up text-primary') : 'bi-arrow-down-up text-muted opacity-50'"
                ></i>
              </th>
              <th class="role-clickable text-nowrap" @click="toggleSort('MaSach')" title="Nhấn để sắp xếp theo Mã sách">
                Mã sách
                <i
                  class="bi ms-1"
                  :class="bookStore.filters.sort === 'MaSach' ? (bookStore.filters.order === 'asc' ? 'bi-sort-numeric-down text-primary' : 'bi-sort-numeric-up text-primary') : 'bi-arrow-down-up text-muted opacity-50'"
                ></i>
              </th>
              <th class="text-nowrap">Thể loại & Tác giả</th>
              <th class="text-nowrap">Vị trí kệ</th>
              <th class="text-center role-clickable text-nowrap" @click="toggleSort('SoQuyen')" title="Nhấn để sắp xếp theo Tổng số lượng">
                Tổng số
                <i
                  class="bi ms-1"
                  :class="bookStore.filters.sort === 'SoQuyen' ? (bookStore.filters.order === 'asc' ? 'bi-sort-up text-primary' : 'bi-sort-down text-primary') : 'bi-arrow-down-up text-muted opacity-50'"
                ></i>
              </th>
              <th class="text-center role-clickable text-nowrap" @click="toggleSort('SoQuyenKhaDung')" title="Nhấn để sắp xếp theo Số lượng trên kệ">
                Trên kệ
                <i
                  class="bi ms-1"
                  :class="bookStore.filters.sort === 'SoQuyenKhaDung' ? (bookStore.filters.order === 'asc' ? 'bi-sort-up text-primary' : 'bi-sort-down text-primary') : 'bi-arrow-down-up text-muted opacity-50'"
                ></i>
              </th>
              <th class="text-center text-nowrap">Đang mượn</th>
              <th class="text-center text-nowrap">Hỏng/Mất</th>
              <th class="role-clickable text-nowrap" @click="toggleSort('DonGia')" title="Nhấn để sắp xếp theo Đơn giá">
                Đơn giá
                <i
                  class="bi ms-1"
                  :class="bookStore.filters.sort === 'DonGia' ? (bookStore.filters.order === 'asc' ? 'bi-sort-numeric-down text-primary' : 'bi-sort-numeric-up text-primary') : 'bi-arrow-down-up text-muted opacity-50'"
                ></i>
              </th>
              <th class="text-center text-nowrap">Trạng thái</th>
              <th class="text-end text-nowrap">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="bookStore.isLoading">
              <td colspan="12" class="text-center py-5">
                <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                Đang tải dữ liệu kho sách...
              </td>
            </tr>

            <tr v-else-if="bookStore.books.length === 0">
              <td colspan="12" class="text-center py-5 text-muted">
                Không tìm thấy ấn phẩm nào phù hợp với điều kiện lọc.
              </td>
            </tr>

            <tr
              v-for="(book, index) in bookStore.books"
              :key="book._id"
              :id="'book-row-' + (book._id || book.maSach || book.MaSach)"
              :class="{ 'table-warning border-warning highlighted-row': [book._id, book.maSach, book.MaSach].includes(highlightedBookId) }"
            >
              <td class="text-center text-muted fw-semibold">
                {{ (bookStore.pagination.page - 1) * bookStore.pagination.limit + index + 1 }}
              </td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <img
                    :src="getImageUrl(book.hinhAnh || book.HinhAnh, defaultCover)"
                    :alt="book.tenSach || book.TenSach"
                    class="rounded shadow-sm flex-shrink-0"
                    style="width: 42px; height: 60px; object-fit: cover;"
                    @error="$event.target.src = defaultCover"
                  />
                  <div>
                    <div
                      class="fw-bold text-dark role-clickable hover-underline"
                      @click="bookDetailModalRef?.open(book)"
                      title="Nhấn để xem chi tiết ấn phẩm"
                    >
                      {{ book.tenSach || book.TenSach }}
                    </div>
                    <div class="text-muted" style="font-size: 0.75rem;">
                      <span>Năm XB: {{ book.namXuatBan || book.NamXuatBan || 'N/A' }}</span>
                      <span v-if="book.tenNXB || book.TenNXB || book.nhaXuatBan || book.NhaXuatBan || book.maNXB || book.MaNXB" class="ms-1">
                        | NXB: {{ book.tenNXB || book.TenNXB || book.nhaXuatBan || book.NhaXuatBan || book.maNXB || book.MaNXB }}
                      </span>
                      <span v-if="book.isbn || book.ISBN" class="badge bg-light text-muted border ms-1" style="font-size: 0.68rem;">
                        ISBN: {{ book.isbn || book.ISBN }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <code class="text-primary fw-bold">{{ book.maSach || book.MaSach }}</code>
              </td>
              <td>
                <div class="fw-medium text-dark">{{ book.tacGia || book.TacGia || book.nguonGoc || book.NguonGoc || 'N/A' }}</div>
                <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle" style="font-size: 0.72rem;">
                  {{ book.theLoai || book.TheLoai }}
                </span>
              </td>
              <td>
                <span class="badge bg-light text-dark border">
                  <i class="bi bi-geo-alt me-1 text-primary"></i>{{ book.viTri || book.ViTri || 'Kệ chung' }}
                </span>
              </td>
              <td class="text-center fw-bold">{{ book.soQuyen ?? book.SoQuyen ?? 0 }}</td>
              <td class="text-center">
                <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                  {{ book.soQuyenKhaDung ?? book.SoQuyenKhaDung ?? ((book.soQuyen ?? book.SoQuyen ?? 0) - (book.soQuyenDangMuon ?? book.SoQuyenDangMuon ?? 0) - (book.soQuyenHuHong ?? book.SoQuyenHuHong ?? 0)) }}
                </span>
              </td>
              <td class="text-center">
                <span class="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">
                  {{ book.soQuyenDangMuon ?? book.SoQuyenDangMuon ?? 0 }}
                </span>
              </td>
              <td class="text-center">
                <span
                  v-if="(book.soQuyenHuHong ?? book.SoQuyenHuHong ?? 0) > 0"
                  class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1"
                  :title="`Có ${book.soQuyenHuHong ?? book.SoQuyenHuHong} cuốn bị hư hỏng hoặc thất lạc`"
                >
                  {{ book.soQuyenHuHong ?? book.SoQuyenHuHong }}
                </span>
                <span v-else class="text-muted small">0</span>
              </td>
              <td class="fw-semibold text-danger">{{ formatCurrency(book.donGia ?? book.DonGia) }}</td>
              <td class="text-center">
                <span
                  class="badge"
                  :class="(book.trangThai || book.TrangThai) === 'ARCHIVED' ? 'bg-secondary' : 'bg-success-subtle text-success border border-success-subtle'"
                >
                  {{ (book.trangThai || book.TrangThai) === 'ARCHIVED' ? 'Đã lưu trữ' : 'Đang lưu hành' }}
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
                  <template v-if="(book.trangThai || book.TrangThai) === 'ARCHIVED'">
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
                      :disabled="(book.soQuyenDangMuon ?? book.SoQuyenDangMuon ?? 0) > 0"
                      :title="(book.soQuyenDangMuon ?? book.SoQuyenDangMuon ?? 0) > 0 ? 'Không thể lưu trữ khi có sách đang được bạn đọc mượn' : 'Chuyển vào kho lưu trữ'"
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
      <div class="p-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
        <span class="small text-muted">
          Hiển thị <strong>{{ startRecord }}</strong> - <strong>{{ endRecord }}</strong>
          trong tổng số <strong>{{ totalBooksCount }}</strong> ấn phẩm
        </span>
        <ul class="pagination pagination-sm mb-0" v-if="bookStore.pagination.totalPages > 1">
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
                    v-model="formData.tenSach"
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
                    v-model="formData.maSach"
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
                    v-model="formData.tacGia"
                    class="form-control"
                    autocomplete="off"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Chủ đề / Thể loại <span class="text-danger">*</span></label>
                  <CategorySelect
                    ref="categorySelectRef"
                    v-model="formData.theLoai"
                    :required="true"
                  />
                </div>

                <div class="col-md-4">
                  <label class="form-label small fw-semibold">Đơn giá niêm yết (VNĐ) <span class="text-danger">*</span></label>
                  <input
                    type="number"
                    name="book_price"
                    v-model="formData.donGia"
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
                    v-model="formData.soQuyen"
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
                    v-model="formData.namXuatBan"
                    class="form-control"
                    :max="new Date().getFullYear()"
                    autocomplete="off"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-semibold d-flex justify-content-between align-items-center mb-2">
                    <span>Nhà xuất bản <span class="text-danger">*</span></span>
                    
                  </label>
                  <PublisherSelect ref="publisherSelectRef" v-model="formData.maNXB" :required="true" />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Mã chuẩn quốc tế (ISBN)</label>
                  <input
                    type="text"
                    name="book_isbn_number"
                    v-model="formData.isbn"
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
                    v-model="formData.viTri"
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
                          :src="getImageUrl(formData.hinhAnh, defaultCover)"
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
                          v-if="formData.hinhAnh"
                          class="btn btn-outline-secondary btn-sm"
                          @click="formData.hinhAnh = ''"
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
                        v-model="formData.hinhAnh"
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
                    v-model="formData.moTa"
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
              <button
                type="submit"
                class="btn btn-primary btn-sm px-4"
                :disabled="bookStore.isLoading || (isEditing && !isBookFormDirty)"
                :title="isEditing && !isBookFormDirty ? 'Vui lòng thay đổi thông tin ấn phẩm trước khi lưu' : ''"
              >
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
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAdminBookStore } from '../stores/adminBookStore';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';
import BookDetailModal from '../components/BookDetailModal.vue';
import PublisherSelect from '../components/PublisherSelect.vue';
import CategorySelect from '../components/CategorySelect.vue';
import { getImageUrl } from '../utils/imageHelper';

const route = useRoute();
const bookStore = useAdminBookStore();
const toast = useToast();
const { confirm } = useConfirm();

const bookDetailModalRef = ref(null);
const publisherSelectRef = ref(null);
const categorySelectRef = ref(null);
const highlightedBookId = ref(null);

const searchKeyword = ref('');
const selectedGenre = ref('');
const selectedStatus = ref('ACTIVE');
const selectedSort = ref('MaSach_asc');
const modalRef = ref(null);
const isEditing = ref(false);
const editingBookId = ref(null);
const initialBookData = ref(null);
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
      formData.hinhAnh = res.data.url;
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
  tenSach: '',
  maSach: '',
  tacGia: '',
  theLoai: 'Công nghệ thông tin',
  donGia: 50000,
  soQuyen: 5,
  namXuatBan: new Date().getFullYear(),
  maNXB: '',
  viTri: '',
  hinhAnh: '',
  moTa: '',
  isbn: ''
});

const isBookFormDirty = computed(() => {
  if (!isEditing.value) return true; // Khi thêm mới thì luôn cho phép Submit nếu hợp lệ
  if (!initialBookData.value) return false;

  const init = initialBookData.value;
  return (
    formData.tenSach.trim() !== (init.tenSach || '').trim() ||
    formData.maSach.trim() !== (init.maSach || '').trim() ||
    formData.tacGia.trim() !== (init.tacGia || '').trim() ||
    formData.theLoai !== (init.theLoai || '') ||
    Number(formData.donGia) !== Number(init.donGia ?? 0) ||
    Number(formData.soQuyen) !== Number(init.soQuyen ?? 0) ||
    Number(formData.namXuatBan) !== Number(init.namXuatBan ?? 0) ||
    formData.maNXB.trim() !== (init.maNXB || '').trim() ||
    formData.viTri.trim() !== (init.viTri || '').trim() ||
    formData.hinhAnh.trim() !== (init.hinhAnh || '').trim() ||
    formData.moTa.trim() !== (init.moTa || '').trim() ||
    formData.isbn.trim() !== (init.isbn || '').trim()
  );
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

const handleSortChange = () => {
  const [field, order] = selectedSort.value.split('_');
  bookStore.filters.sort = field;
  bookStore.filters.order = order;
  bookStore.fetchBooks(1);
};

const toggleSort = (field) => {
  if (bookStore.filters.sort === field) {
    bookStore.filters.order = bookStore.filters.order === 'asc' ? 'desc' : 'asc';
  } else {
    bookStore.filters.sort = field;
    bookStore.filters.order = 'asc';
  }
  selectedSort.value = `${bookStore.filters.sort}_${bookStore.filters.order}`;
  bookStore.fetchBooks(1);
};

const totalBooksCount = computed(() => {
  return bookStore.pagination.totalRecords || bookStore.pagination.total || 0;
});

const startRecord = computed(() => {
  if (totalBooksCount.value === 0) return 0;
  return (bookStore.pagination.page - 1) * bookStore.pagination.limit + 1;
});

const endRecord = computed(() => {
  return Math.min(bookStore.pagination.page * bookStore.pagination.limit, totalBooksCount.value);
});

const resetFilters = () => {
  searchKeyword.value = '';
  selectedGenre.value = '';
  selectedStatus.value = 'ACTIVE';
  selectedSort.value = 'MaSach_asc';
  bookStore.filters.search = '';
  bookStore.filters.theLoai = '';
  bookStore.filters.status = 'ACTIVE';
  bookStore.filters.sort = 'MaSach';
  bookStore.filters.order = 'asc';
  bookStore.fetchBooks(1);
};

const goToPage = (page) => {
  bookStore.fetchBooks(page);
};

const openCreateModal = () => {
  isEditing.value = false;
  editingBookId.value = null;
  initialBookData.value = null;
  formData.tenSach = '';
  formData.maSach = '';
  formData.tacGia = '';
  formData.theLoai = bookStore.genres[0] || 'Công nghệ thông tin';
  formData.donGia = 50000;
  formData.soQuyen = 5;
  formData.namXuatBan = new Date().getFullYear();
  formData.maNXB = '';
  formData.viTri = '';
  formData.hinhAnh = '';
  formData.moTa = '';
  formData.isbn = '';

  const modal = new window.bootstrap.Modal(modalRef.value);
  modal.show();
};

const openEditModal = (book) => {
  isEditing.value = true;
  editingBookId.value = book._id;
  formData.tenSach = book.tenSach || book.TenSach || '';
  formData.maSach = book.maSach || book.MaSach || '';
  formData.tacGia = book.tacGia || book.TacGia || book.nguonGoc || book.NguonGoc || '';
  formData.theLoai = book.theLoai || book.TheLoai || (bookStore.genres[0] || 'Công nghệ thông tin');
  formData.donGia = Number(book.donGia ?? book.DonGia ?? 50000);
  formData.soQuyen = Number(book.soQuyen ?? book.SoQuyen ?? 1);
  formData.namXuatBan = Number(book.namXuatBan || book.NamXuatBan || new Date().getFullYear());
  formData.maNXB = book.maNXB?.maNXB || book.maNXB?.MaNXB || book.MaNXB?.MaNXB || book.maNXB || book.MaNXB || '';
  formData.viTri = book.viTri || book.ViTri || '';
  formData.hinhAnh = book.hinhAnh || book.HinhAnh || '';
  formData.moTa = book.moTa || book.MoTa || '';
  formData.isbn = book.isbn || book.ISBN || '';

  // Lưu bản snapshot dữ liệu ban đầu để kiểm tra thay đổi
  initialBookData.value = {
    tenSach: formData.tenSach,
    maSach: formData.maSach,
    tacGia: formData.tacGia,
    theLoai: formData.theLoai,
    donGia: formData.donGia,
    soQuyen: formData.soQuyen,
    namXuatBan: formData.namXuatBan,
    maNXB: formData.maNXB,
    viTri: formData.viTri,
    hinhAnh: formData.hinhAnh,
    moTa: formData.moTa,
    isbn: formData.isbn
  };

  const modal = new window.bootstrap.Modal(modalRef.value);
  modal.show();
};

const handleSubmitBook = async () => {
  if (!formData.maNXB) {
    toast.warning('Vui lòng chọn hoặc thêm mới Nhà xuất bản.');
    return;
  }

  const payload = {
    tenSach: formData.tenSach,
    TenSach: formData.tenSach,
    maSach: formData.maSach,
    MaSach: formData.maSach,
    tacGia: formData.tacGia,
    TacGia: formData.tacGia,
    theLoai: formData.theLoai,
    TheLoai: formData.theLoai,
    donGia: Number(formData.donGia),
    DonGia: Number(formData.donGia),
    soQuyen: Number(formData.soQuyen),
    SoQuyen: Number(formData.soQuyen),
    namXuatBan: Number(formData.namXuatBan),
    NamXuatBan: Number(formData.namXuatBan),
    maNXB: formData.maNXB,
    MaNXB: formData.maNXB,
    viTri: formData.viTri,
    ViTri: formData.viTri,
    hinhAnh: formData.hinhAnh,
    HinhAnh: formData.hinhAnh,
    moTa: formData.moTa,
    MoTa: formData.moTa,
    isbn: formData.isbn,
    ISBN: formData.isbn
  };

  let res;
  if (isEditing.value) {
    res = await bookStore.updateBook(editingBookId.value, payload);
  } else {
    res = await bookStore.createBook(payload);
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
  const borrowingCount = book.soQuyenDangMuon ?? book.SoQuyenDangMuon ?? 0;
  if (borrowingCount > 0) {
    toast.warning('Không thể lưu trữ do vẫn còn sách đang được bạn đọc mượn.');
    return;
  }

  const bookTitle = book.tenSach || book.TenSach;
  const bookCode = book.maSach || book.MaSach;
  const isConfirmed = await confirm({
    title: 'Lưu trữ ấn phẩm',
    message: `Bạn có chắc chắn muốn chuyển ấn phẩm "${bookTitle}" (${bookCode}) vào kho lưu trữ? Sách sẽ tạm ẩn khỏi danh mục tìm kiếm của bạn đọc.`,
    confirmText: 'Lưu trữ',
    cancelText: 'Giữ lại',
    type: 'danger',
    icon: 'bi-archive-fill'
  });
  if (!isConfirmed) return;

  const res = await bookStore.deleteBook(book._id);
  if (res.success) toast.success(res.message);
  else toast.error(res.error);
};

const handleRestore = async (book) => {
  const bookTitle = book.tenSach || book.TenSach;
  const bookCode = book.maSach || book.MaSach;
  const isConfirmed = await confirm({
    title: 'Khôi phục ấn phẩm',
    message: `Bạn có muốn đưa ấn phẩm "${bookTitle}" (${bookCode}) từ kho lưu trữ trở lại danh mục lưu hành?`,
    confirmText: 'Khôi phục',
    cancelText: 'Bỏ qua',
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
  if (query.search || query.status || query.highlight || query.editId || query.sort || query.order) {
    if (query.search) searchKeyword.value = String(query.search).trim();
    if (query.status) selectedStatus.value = String(query.status);
    if (query.sort) {
      bookStore.filters.sort = String(query.sort);
      bookStore.filters.order = String(query.order || 'asc');
      selectedSort.value = `${bookStore.filters.sort}_${bookStore.filters.order}`;
    }
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
