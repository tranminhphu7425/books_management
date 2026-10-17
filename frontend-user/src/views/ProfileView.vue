<template>
  <div class="profile-view py-4">
    <div class="container">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb small">
          <li class="breadcrumb-item"><router-link to="/">Trang chủ</router-link></li>
          <li class="breadcrumb-item active" aria-current="page">Hồ sơ bạn đọc</li>
        </ol>
      </nav>

      <div class="row g-4">
        <!-- Cột Trái: Thẻ Bạn Đọc Điện Tử & Avatar -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm p-4 bg-white mb-4 text-center">
            <!-- Digital Card Preview -->
            <div class="library-card-badge p-4 rounded-4 text-white mb-4 shadow text-center position-relative overflow-hidden">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="card-label text-uppercase tracking-wide">Thẻ Bạn Đọc Điện Tử</span>
                <i class="bi bi-book-half fs-4 card-icon"></i>
              </div>

              <!-- Avatar Profile Section inside Digital Card -->
              <div class="position-relative d-inline-block mx-auto mb-3">
                <div class="profile-avatar-container shadow">
                  <img
                    :src="displayAvatar"
                    alt="Avatar"
                    class="profile-avatar-img"
                    @error="handleAvatarError"
                  />
                </div>
                <button
                  type="button"
                  class="btn btn-warning btn-sm rounded-circle position-absolute bottom-0 end-0 avatar-upload-btn shadow"
                  @click="triggerAvatarSelect"
                  title="Tải ảnh đại diện từ máy tính"
                  :disabled="isUploadingAvatar"
                >
                  <span v-if="isUploadingAvatar" class="spinner-border spinner-border-sm text-dark" style="width: 14px; height: 14px;"></span>
                  <i v-else class="bi bi-camera-fill text-white"></i>
                </button>
                <input
                  type="file"
                  ref="avatarFileInput"
                  class="d-none"
                  accept="image/jpeg,image/png,image/webp"
                  @change="onAvatarFileSelected"
                />
              </div>

              <h4 class="font-serif fw-bold mb-1 card-name">{{ authStore.fullName }}</h4>
              <div class="font-monospace small card-code mb-3">
                MÃ SỐ: {{ authStore.user?.MaDocGia || 'DG-XXXX' }}
              </div>
              <div class="d-flex justify-content-between align-items-end small card-footer-row pt-2 border-top border-white border-opacity-25">
                <span>Trạng thái: <strong class="text-white">Đang kích hoạt</strong></span>
                <span>Hạn dùng: <strong class="text-white">Vô thời hạn</strong></span>
              </div>
            </div>

            <div class="list-group list-group-flush text-start small">
              <div class="list-group-item d-flex justify-content-between px-0">
                <span class="text-muted">Email:</span>
                <span>{{ authStore.user?.Email }}</span>
              </div>
              <div class="list-group-item d-flex justify-content-between px-0">
                <span class="text-muted">Mã bạn đọc:</span>
                <strong class="font-monospace text-dark">{{ authStore.user?.MaDocGia }}</strong>
              </div>
              <div class="list-group-item d-flex justify-content-between px-0">
                <span class="text-muted">Giới tính:</span>
                <span>{{ authStore.user?.Phai || 'Chưa cập nhật' }}</span>
              </div>
              <div class="list-group-item d-flex justify-content-between px-0">
                <span class="text-muted">Ngày sinh:</span>
                <span>{{ formatDate(authStore.user?.NgaySinh) }}</span>
              </div>
              <div class="list-group-item d-flex justify-content-between px-0">
                <span class="text-muted">Số điện thoại:</span>
                <span>{{ authStore.user?.DienThoai || 'Chưa cập nhật' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Cột Phải: Cập nhật thông tin & Đổi mật khẩu & Bồi thường -->
        <div class="col-lg-8">
          <!-- Card 1: Cập nhật thông tin cá nhân -->
          <div class="card border-0 shadow-sm p-4 bg-white mb-4">
            <h5 class="font-serif fw-bold text-dark mb-3 border-bottom pb-2">
              <i class="bi bi-person-gear text-primary me-2"></i> Cập Nhật Thông Tin Cá Nhân
            </h5>

            <form @submit.prevent="handleUpdateProfile">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Họ và tên lót</label>
                  <input
                    type="text"
                    v-model="profileForm.HoLot"
                    class="form-control"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Tên bạn đọc</label>
                  <input
                    type="text"
                    v-model="profileForm.Ten"
                    class="form-control"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Giới tính</label>
                  <select v-model="profileForm.Phai" class="form-select">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Ngày sinh</label>
                  <input
                    type="date"
                    v-model="profileForm.NgaySinh"
                    class="form-control"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Địa chỉ Email</label>
                  <input
                    type="email"
                    :value="authStore.user?.Email"
                    class="form-control bg-light"
                    disabled
                    readonly
                  />
                  <div class="form-text small">Email là định danh tài khoản, không thể thay đổi.</div>
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Số điện thoại liên hệ</label>
                  <input
                    type="tel"
                    inputmode="numeric"
                    v-model="profileForm.DienThoai"
                    class="form-control"
                    placeholder="Ví dụ: 0912345678"
                    maxlength="11"
                    pattern="[0-9]{10,11}"
                    required
                    @keypress="filterNumeric"
                    @input="profileForm.DienThoai = profileForm.DienThoai.replace(/\D/g, '')"
                  />
                </div>

                <div class="col-12">
                  <label class="form-label small fw-semibold">Địa chỉ nơi cư trú</label>
                  <input
                    type="text"
                    v-model="profileForm.DiaChi"
                    class="form-control"
                    placeholder="Nhập địa chỉ nhận thông báo hoặc giao dịch"
                  />
                </div>

                <div class="col-12 text-end mt-4">
                  <button type="submit" class="btn btn-primary px-4" :disabled="authStore.isLoading">
                    <span v-if="authStore.isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    Lưu thông tin cá nhân
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Card 2: Đổi mật khẩu có nút Toggle mắt -->
          <div class="card border-0 shadow-sm p-4 bg-white mb-4">
            <h5 class="font-serif fw-bold text-dark mb-3 border-bottom pb-2">
              <i class="bi bi-shield-lock text-primary me-2"></i> Thiết Lập Mật Khẩu
            </h5>

            <form @submit.prevent="handleChangePassword">
              <div class="row g-3">
                <!-- Mật khẩu hiện tại -->
                <div class="col-12">
                  <label class="form-label small fw-semibold">Mật khẩu hiện tại</label>
                  <div class="input-group">
                    <input
                      :type="showCurrentPassword ? 'text' : 'password'"
                      v-model="passwordForm.currentPassword"
                      class="form-control"
                      placeholder="Nhập mật khẩu đang sử dụng"
                      required
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showCurrentPassword = !showCurrentPassword"
                      title="Hiện/Ẩn mật khẩu"
                    >
                      <i :class="showCurrentPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                    </button>
                  </div>
                </div>

                <!-- Mật khẩu mới -->
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Mật khẩu mới</label>
                  <div class="input-group">
                    <input
                      :type="showNewPassword ? 'text' : 'password'"
                      v-model="passwordForm.newPassword"
                      class="form-control"
                      placeholder="Tối thiểu 6 ký tự"
                      minlength="6"
                      required
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showNewPassword = !showNewPassword"
                      title="Hiện/Ẩn mật khẩu"
                    >
                      <i :class="showNewPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                    </button>
                  </div>
                </div>

                <!-- Xác nhận mật khẩu mới -->
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Nhập lại mật khẩu mới</label>
                  <div class="input-group">
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      v-model="passwordForm.confirmPassword"
                      class="form-control"
                      placeholder="Xác nhận mật khẩu mới"
                      minlength="6"
                      required
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      title="Hiện/Ẩn mật khẩu"
                    >
                      <i :class="showConfirmPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                    </button>
                  </div>
                </div>

                <div class="col-12 text-end mt-4">
                  <button type="submit" class="btn btn-outline-primary px-4" :disabled="authStore.isLoading">
                    <span v-if="authStore.isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    Cập nhật mật khẩu mới
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Card 3: Biên bản bồi thường và tình trạng nộp phạt -->
          <div
            id="fines-section"
            class="card border-0 shadow-sm p-4 bg-white fines-card-transition"
            :class="{ 'fines-highlight-pulse': isFinesHighlighted }"
          >
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2 flex-wrap gap-2">
              <h5 class="font-serif fw-bold text-dark mb-0">
                <i class="bi bi-receipt text-primary me-2"></i> Lịch Sử Biên Bản Bồi Thường
              </h5>
              <span
                v-if="borrowStore.totalUnpaidFineAmount > 0"
                class="badge bg-danger shadow-sm px-3 py-2 rounded-pill"
              >
                <i class="bi bi-exclamation-triangle-fill me-1"></i>
                Cần nộp: {{ formatCurrency(borrowStore.totalUnpaidFineAmount) }}
              </span>
            </div>

            <div v-if="borrowStore.myFines.length === 0" class="text-center py-4 text-muted small">
              <i class="bi bi-shield-check fs-2 text-success d-block mb-1"></i>
              Tài khoản bạn đọc gương mẫu! Không có biên bản bồi thường nào được ghi nhận.
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover align-middle small mb-0">
                <thead class="table-light text-muted">
                  <tr>
                    <th style="min-width: 100px;">Mã biên bản</th>
                    <th style="min-width: 180px;">Ấn phẩm liên quan</th>
                    <th style="min-width: 180px;">Sự cố & Chi tiết</th>
                    <th style="min-width: 130px;">Số tiền bồi thường</th>
                    <th style="min-width: 110px;">Ngày lập</th>
                    <th style="min-width: 120px;">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="fine in borrowStore.myFines" :key="fine._id">
                    <td>
                      <code class="fw-bold text-dark">{{ fine.MaBienBan }}</code>
                    </td>
                    <td>
                      <div class="fw-semibold text-dark">
                        <router-link
                          v-if="fine.SachId?._id"
                          :to="`/books/${fine.SachId._id}`"
                          class="text-decoration-none text-dark hover-primary"
                        >
                          {{ fine.SachId?.TenSach || fine.MaSach }}
                        </router-link>
                        <span v-else>{{ fine.SachId?.TenSach || fine.MaSach }}</span>
                      </div>
                      <div class="text-muted" style="font-size: 0.78rem;">
                        Mã sách: <code>{{ fine.MaSach }}</code>
                        <span v-if="fine.SachId?.TacGia" class="ms-1">• {{ fine.SachId.TacGia }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex align-items-center gap-1 mb-1">
                        <span
                          class="badge"
                          :class="fine.LoaiSuCo === 'LOST' ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'"
                        >
                          <i :class="fine.LoaiSuCo === 'LOST' ? 'bi bi-x-circle-fill me-1' : 'bi bi-exclamation-circle-fill me-1'"></i>
                          {{ fine.LoaiSuCo === 'LOST' ? 'Làm mất sách' : 'Hư hại / Rách' }}
                        </span>
                      </div>
                      <div class="text-secondary small">
                        {{ fine.MoTa || fine.LyDo || 'Ghi nhận sự cố tại quầy' }}
                      </div>
                    </td>
                    <td>
                      <span class="fw-bold text-danger fs-6">
                        {{ formatCurrency(fine.SoTienBoiThuong !== undefined ? fine.SoTienBoiThuong : (fine.SoTienPhat || 0)) }}
                      </span>
                    </td>
                    <td>
                      <span class="text-muted">{{ formatDate(fine.NgayLap || fine.createdAt) }}</span>
                    </td>
                    <td>
                      <span
                        class="badge"
                        :class="fine.TrangThai === 'PAID' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'"
                      >
                        <i :class="fine.TrangThai === 'PAID' ? 'bi bi-check-circle-fill me-1' : 'bi bi-hourglass-split me-1'"></i>
                        {{ fine.TrangThai === 'PAID' ? 'Đã hoàn tất' : 'Chưa nộp tiền' }}
                      </span>
                      <div v-if="fine.TrangThai === 'PAID' && fine.NgayGiaiQuyet" class="text-muted mt-1" style="font-size: 0.75rem;">
                        Ngày nộp: {{ formatDate(fine.NgayGiaiQuyet) }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="p-3 bg-light rounded-3 mt-3 text-muted small border">
                <div class="d-flex align-items-start gap-2">
                  <i class="bi bi-info-circle-fill text-primary mt-1"></i>
                  <div>
                    <strong>Quy định bồi thường:</strong>
                    Khoản tiền bồi thường cần được nộp trực tiếp bằng tiền mặt hoặc chuyển khoản tại quầy thủ thư. Sau khi thủ thư xác nhận thu tiền, tài khoản bạn đọc sẽ được tự động giải tỏa và tiếp tục mượn sách.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useBorrowStore } from '../stores/borrowStore';
import { useToast } from '../composables/useToast';
import { getDefaultAvatar } from '../utils/avatarHelper';

const route = useRoute();
const authStore = useAuthStore();
const borrowStore = useBorrowStore();
const toast = useToast();

const isFinesHighlighted = ref(false);

const scrollToFines = () => {
  nextTick(() => {
    const el = document.getElementById('fines-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      isFinesHighlighted.value = true;
      setTimeout(() => {
        isFinesHighlighted.value = false;
      }, 3000);
    }
  });
};

const isUploadingAvatar = ref(false);
const avatarFileInput = ref(null);
const avatarFallback = ref(false);

const userInitial = computed(() => {
  const name = authStore.fullName || 'U';
  return name.charAt(0).toUpperCase();
});

const displayAvatar = computed(() => {
  if (avatarFallback.value || !authStore.user?.HinhAnh) {
    return getDefaultAvatar(profileForm.Phai || authStore.user?.Phai);
  }
  return authStore.user.HinhAnh;
});

const handleAvatarError = () => {
  avatarFallback.value = true;
};

const triggerAvatarSelect = () => {
  avatarFileInput.value?.click();
};

const onAvatarFileSelected = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Kiểm tra kích thước tối đa 2MB
  const maxSizeBytes = 2 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    toast.error('Kích thước ảnh đại diện vượt quá dung lượng cho phép (Tối đa 2MB).');
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

  isUploadingAvatar.value = true;
  try {
    const res = await authStore.uploadAvatar(file);
    if (res.success) {
      avatarFallback.value = false;
      toast.success(res.message || 'Cập nhật ảnh đại diện thành công!');
    } else {
      toast.error(res.error || 'Tải lên ảnh đại diện thất bại.');
    }
  } catch (err) {
    toast.error('Lỗi khi tải lên ảnh đại diện.');
  } finally {
    isUploadingAvatar.value = false;
    event.target.value = '';
  }
};

// Password visibility toggles
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const filterNumeric = (event) => {
  if (!/[0-9]/.test(event.key)) {
    event.preventDefault();
  }
};

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const profileForm = reactive({
  HoLot: authStore.user?.HoLot || '',
  Ten: authStore.user?.Ten || '',
  Phai: authStore.user?.Phai || 'Nam',
  NgaySinh: formatDateForInput(authStore.user?.NgaySinh),
  DienThoai: authStore.user?.DienThoai || '',
  DiaChi: authStore.user?.DiaChi || ''
});

const populateProfileForm = () => {
  if (authStore.user) {
    profileForm.HoLot = authStore.user.HoLot || '';
    profileForm.Ten = authStore.user.Ten || '';
    profileForm.Phai = authStore.user.Phai || 'Nam';
    profileForm.NgaySinh = formatDateForInput(authStore.user.NgaySinh);
    profileForm.DienThoai = authStore.user.DienThoai || '';
    profileForm.DiaChi = authStore.user.DiaChi || '';
  }
};

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const formatDate = (dateStr) => {
  if (!dateStr) return 'Chưa cập nhật';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const formatCurrency = (val) => {
  if (!val) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const handleUpdateProfile = async () => {
  const res = await authStore.updateProfile({
    ...profileForm,
    NgaySinh: profileForm.NgaySinh || null
  });
  const msg = res.success ? (res.message || 'Cập nhật thông tin cá nhân thành công!') : (res.error || 'Cập nhật thông tin thất bại.');
  if (res.success) {
    populateProfileForm();
    toast.success(msg);
  } else {
    toast.error(msg);
  }
};

const handleChangePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.warning('Mật khẩu mới và xác nhận mật khẩu không khớp nhau.');
    return;
  }

  const res = await authStore.changePassword({
    currentPassword: passwordForm.currentPassword,
    newPassword: passwordForm.newPassword
  });

  const msg = res.success ? (res.message || 'Cập nhật mật khẩu mới thành công!') : (res.error || 'Đổi mật khẩu thất bại.');

  if (res.success) {
    toast.success(msg);
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  } else {
    toast.error(msg);
  }
};

onMounted(async () => {
  await authStore.fetchCurrentUser();
  populateProfileForm();
  borrowStore.fetchMyFines();
  
  if (route.hash === '#fines-section' || route.query.tab === 'fines') {
    setTimeout(scrollToFines, 350);
  }
});

watch(
  () => [route.hash, route.query.tab],
  ([newHash, newTab]) => {
    if (newHash === '#fines-section' || newTab === 'fines') {
      setTimeout(scrollToFines, 100);
    }
  }
);
</script>

<style scoped>
.fines-card-transition {
  transition: all 0.3s ease-in-out;
  border-radius: var(--radius-md, 12px);
}

.fines-highlight-pulse {
  animation: finePulseHighlight 2.5s cubic-bezier(0.25, 1, 0.5, 1);
  border: 2px solid var(--color-danger, #b91c1c) !important;
}

@keyframes finePulseHighlight {
  0% {
    box-shadow: 0 0 0 0 rgba(185, 28, 28, 0.7);
    background-color: #FEF2F2 !important;
    transform: scale(1.01);
  }
  40% {
    box-shadow: 0 0 0 14px rgba(185, 28, 28, 0);
    background-color: #FFF5F5 !important;
  }
  100% {
    box-shadow: 0 0 0 0 rgba(185, 28, 28, 0);
    background-color: #FFFFFF !important;
    transform: scale(1);
  }
}

.profile-avatar-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #ffffff;
  background: linear-gradient(135deg, #1b5c40 0%, #2d7a57 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar-placeholder {
  color: #ffffff;
  font-weight: 700;
  font-size: 2.5rem;
}

.avatar-upload-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 2px solid #ffffff;
}

.library-card-badge {
  background: linear-gradient(135deg, #0d3b2a 0%, #1b5c40 55%, #2d7a57 100%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.12);
}

/* Text nhãn tiêu đề thẻ */
.card-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 1.2px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

/* Icon book trên thẻ */
.card-icon {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* Tên chủ thẻ */
.card-name {
  font-size: 1.15rem;
  color: #ffffff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.3px;
}

/* Mã số thẻ */
.card-code {
  color: #fbbf24;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  font-weight: 600;
}

/* Hàng footer thẻ */
.card-footer-row {
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.tracking-wide {
  letter-spacing: 1px;
}
</style>
