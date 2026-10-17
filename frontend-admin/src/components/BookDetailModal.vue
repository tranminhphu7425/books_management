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
                  :src="getImageUrl(book.HinhAnh, defaultCover)"
                  :alt="book.TenSach"
                  class="img-fluid rounded shadow-sm book-cover-img"
                  @error="$event.target.src = defaultCover"
                />
              </div>

              <!-- Thẻ trạng thái lưu hành -->
              <div class="mb-3">
                <span
                  class="badge px-3 py-2 rounded-pill fs-6"
                  :class="book.TrangThai === 'ARCHIVED' ? 'bg-secondary' : 'bg-success'"
                >
                  <i :class="book.TrangThai === 'ARCHIVED' ? 'bi bi-archive-fill me-1' : 'bi bi-check-circle-fill me-1'"></i>
                  {{ book.TrangThai === 'ARCHIVED' ? 'Kho Lưu Trữ (Đã ẩn)' : 'Đang Lưu Hành' }}
                </span>
              </div>

              <!-- Bảng tóm tắt số lượng -->
              <div class="card bg-light border-0 p-2 text-start small">
                <div class="d-flex justify-content-between py-1 border-bottom">
                  <span class="text-muted">Tổng nhập kho:</span>
                  <strong>{{ book.SoQuyen || 0 }} bản</strong>
                </div>
                <div class="d-flex justify-content-between py-1 border-bottom text-success">
                  <span>Khả dụng trên kệ:</span>
                  <strong>{{ book.SoQuyenKhaDung ?? (book.SoQuyen - (book.SoQuyenDangMuon || 0)) }} bản</strong>
                </div>
                <div class="d-flex justify-content-between py-1 border-bottom text-warning-emphasis">
                  <span>Đang cho mượn:</span>
                  <strong>{{ book.SoQuyenDangMuon || 0 }} bản</strong>
                </div>
                <div class="d-flex justify-content-between py-1 text-danger" v-if="book.SoQuyenHuHong > 0">
                  <span>Hư hỏng / Mất:</span>
                  <strong>{{ book.SoQuyenHuHong }} bản</strong>
                </div>
              </div>
            </div>

            <!-- Cột phải: Thông tin thư mục chi tiết -->
            <div class="col-md-8">
              <h4 class="font-serif fw-bold text-dark mb-2">{{ book.TenSach }}</h4>
              <div class="d-flex flex-wrap gap-2 mb-3">
                <span class="badge bg-light text-dark border font-monospace">Mã: {{ book.MaSach }}</span>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle" v-if="book.TheLoai">
                  <i class="bi bi-tag-fill me-1"></i>{{ book.TheLoai }}
                </span>
                <span class="badge bg-light text-muted border" v-if="book.ISBN">
                  ISBN: {{ book.ISBN }}
                </span>
              </div>

              <div class="table-responsive">
                <table class="table table-sm table-borderless small mb-3">
                  <tbody>
                    <tr>
                      <td class="text-muted" style="width: 140px;">Tác giả / Dịch giả:</td>
                      <td class="fw-semibold text-dark">{{ book.TacGia || book.NguonGoc || 'Chưa rõ' }}</td>
                    </tr>
                    <tr>
                      <td class="text-muted">Nhà xuất bản:</td>
                      <td class="fw-semibold text-dark">
                        {{ book.TenNXB || book.NhaXuatBan || (book.MaNXB?.TenNXB || book.MaNXB) || 'Chưa cập nhật' }}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-muted">Năm xuất bản:</td>
                      <td class="text-dark">{{ book.NamXuatBan || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td class="text-muted">Đơn giá niêm yết:</td>
                      <td class="fw-bold text-danger">{{ formatCurrency(book.DonGia) }}</td>
                    </tr>
                    <tr>
                      <td class="text-muted">Vị trí lưu kho:</td>
                      <td>
                        <span class="badge bg-light text-dark border">
                          <i class="bi bi-geo-alt-fill text-danger me-1"></i>{{ book.ViTri || 'Kệ chung' }}
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
                <div class="p-3 bg-light rounded text-secondary small lh-base" style="max-height: 160px; overflow-y: auto;">
                  {{ book.MoTa || 'Chưa có thông tin mô tả chi tiết cho ấn phẩm này.' }}
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
import { ref, computed, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';
import { getImageUrl } from '../utils/imageHelper';

const router = useRouter();
const route = useRoute();
const modalRef = ref(null);
const book = ref(null);
const isLoading = ref(false);
const defaultCover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';

const isBooksManagePage = computed(() => {
  return route.name === 'BooksManage' || route.path === '/books';
});

const formatCurrency = (val) => {
  if (!val) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const goToBookManageAndEdit = () => {
  if (!book.value) return;
  const targetId = book.value._id || book.value.MaSach;
  const targetCode = book.value.MaSach || '';
  const targetStatus = book.value.TrangThai || 'ACTIVE';

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

  if (typeof bookDataOrId === 'string') {
    isLoading.value = true;
    book.value = null;
    try {
      const res = await api.get(`/books/${bookDataOrId}`);
      book.value = res.data.data;
    } catch (err) {
      console.error('Lỗi khi tải chi tiết sách:', err);
    } finally {
      isLoading.value = false;
    }
  } else if (bookDataOrId._id && (!bookDataOrId.TenNXB && !bookDataOrId.MoTa)) {
    // If partial object, use what we have and fetch full detail in background
    book.value = bookDataOrId;
    try {
      const res = await api.get(`/books/${bookDataOrId._id}`);
      if (res.data.data) book.value = res.data.data;
    } catch (err) {
      // Keep existing data
    }
  } else {
    book.value = bookDataOrId;
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
