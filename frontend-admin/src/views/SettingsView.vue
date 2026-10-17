<template>
  <div class="settings-view">
    <!-- Header -->
    <div class="mb-4">
      <h3 class="font-serif fw-bold text-dark mb-1">Cấu Hình Quy Chế Lưu Thông Thư Viện</h3>
      <p class="text-muted small mb-0">
        Điều chỉnh các tham số nghiệp vụ toàn hệ thống (Áp dụng cho mọi độc giả đăng ký mượn sách).
      </p>
    </div>

    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm p-4 bg-white">
          <form @submit.prevent="saveSettings">
            <h5 class="font-serif fw-bold text-dark mb-3 border-bottom pb-2">
              <i class="bi bi-sliders text-primary me-2"></i> Tham Số Quy Định Mượn Trả
            </h5>

            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label small fw-semibold">
                  Số lượng sách mượn tối đa / bạn đọc <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input type="number" v-model="settings.maxBooksPerReader" class="form-control" min="1" max="10" required />
                  <span class="input-group-text bg-light text-muted small">cuốn</span>
                </div>
                <div class="form-text small">Quy chuẩn mặc định của thư viện là 03 cuốn.</div>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-semibold">
                  Thời hạn mượn đọc tiêu chuẩn <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input type="number" v-model="settings.standardBorrowDays" class="form-control" min="1" max="60" required />
                  <span class="input-group-text bg-light text-muted small">ngày</span>
                </div>
                <div class="form-text small">Thời gian tính từ thời điểm thủ thư xuất sách.</div>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-semibold">
                  Thời gian giữ sách tại quầy sau khi duyệt <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input type="number" v-model="settings.pickupHoldHours" class="form-control" min="12" max="120" required />
                  <span class="input-group-text bg-light text-muted small">giờ</span>
                </div>
                <div class="form-text small">Sau thời gian này nếu bạn đọc không nhận, đơn sẽ tự hủy.</div>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-semibold">
                  Thời gian gia hạn thêm mỗi lần <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input type="number" v-model="settings.renewExtensionDays" class="form-control" min="1" max="14" required />
                  <span class="input-group-text bg-light text-muted small">ngày</span>
                </div>
                <div class="form-text small">Mỗi phiếu mượn chỉ được gia hạn tối đa 01 lần.</div>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-semibold">
                  Số ngày quá hạn tự động đưa vào Blacklist <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input type="number" v-model="settings.blacklistAfterOverdueDays" class="form-control" min="1" max="30" required />
                  <span class="input-group-text bg-light text-muted small">ngày</span>
                </div>
                <div class="form-text small">Khóa quyền mượn sách nếu trễ hạn trả quá số ngày này.</div>
              </div>

              <div class="col-12 mt-4 text-end">
                <button type="submit" class="btn btn-primary px-4" :disabled="isLoading">
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  Lưu Thay Đổi Quy Chế
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card border-0 shadow-sm p-4 bg-white h-100">
          <h6 class="font-serif fw-bold text-dark mb-3">
            <i class="bi bi-info-circle-fill text-info me-2"></i> Hướng Dẫn Vận Hành
          </h6>
          <p class="small text-muted mb-3">
            Các tham số trên sẽ tác động trực tiếp đến thuật toán kiểm thực (validation middleware) tại Backend:
          </p>
          <ul class="small text-muted ps-3 mb-0">
            <li class="mb-2">Kiểm tra giới hạn số lượng ấn phẩm khi độc giả đăng ký mượn mới.</li>
            <li class="mb-2">Tính toán tự động ngày hẹn trả `due_date` khi thủ thư bấm nút <em>"Xuất sách cho bạn đọc"</em>.</li>
            <li class="mb-2">Tự động kích hoạt cơ chế đếm ngược 48h hủy đơn nếu độc giả không đến lấy.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useToast } from '../composables/useToast';

const toast = useToast();
const isLoading = ref(false);

const settings = reactive({
  maxBooksPerReader: 3,
  standardBorrowDays: 14,
  pickupHoldHours: 48,
  renewExtensionDays: 7,
  blacklistAfterOverdueDays: 15
});

const loadSettings = () => {
  const saved = localStorage.getItem('librarySettings');
  if (saved) {
    Object.assign(settings, JSON.parse(saved));
  }
};

const saveSettings = () => {
  isLoading.value = true;
  setTimeout(() => {
    localStorage.setItem('librarySettings', JSON.stringify(settings));
    isLoading.value = false;
    toast.success('Đã lưu và áp dụng thành công các quy chế lưu thông mới của thư viện!');
  }, 400);
};

onMounted(() => {
  loadSettings();
});
</script>
