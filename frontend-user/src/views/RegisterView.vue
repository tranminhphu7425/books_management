<template>
  <div class="auth-view py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-9 col-lg-7">
          <div class="card border-0 shadow-lg p-4 p-md-5 auth-card bg-white">
            <!-- Brand Logo & Tiêu đề -->
            <div class="text-center mb-4">
              <div class="auth-brand-icon mx-auto mb-2">
                <i class="bi bi-person-vcard"></i>
              </div>
              <h3 class="font-serif fw-bold text-dark mb-1">Mở Thẻ Bạn Đọc Mới</h3>
              <p class="text-muted small">
                Đăng ký tài khoản để khai thác nguồn tài liệu phong phú và mượn sách trực tuyến
              </p>
            </div>

            <!-- Thông báo lỗi nếu có -->
            <div v-if="errorMessage" class="alert alert-danger py-2 small mb-3">
              <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMessage }}
            </div>

            <!-- Form Đăng ký -->
            <form @submit.prevent="handleRegister">
              <div class="row g-3">
                <!-- Họ lót & Tên -->
                <div class="col-md-7">
                  <label for="regHoLot" class="form-label small fw-semibold">Họ và tên lót <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    id="regHoLot"
                    v-model="form.HoLot"
                    class="form-control"
                    placeholder="Ví dụ: Nguyễn Văn"
                    required
                  />
                </div>
                <div class="col-md-5">
                  <label for="regTen" class="form-label small fw-semibold">Tên <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    id="regTen"
                    v-model="form.Ten"
                    class="form-control"
                    placeholder="Ví dụ: An"
                    required
                  />
                </div>

                <!-- Email & Số điện thoại -->
                <div class="col-md-7">
                  <label for="regEmail" class="form-label small fw-semibold">Địa chỉ Email <span class="text-danger">*</span></label>
                  <input
                    type="email"
                    id="regEmail"
                    v-model="form.Email"
                    class="form-control"
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div class="col-md-5">
                  <label for="regDienThoai" class="form-label small fw-semibold">Số điện thoại <span class="text-danger">*</span></label>
                  <input
                    type="tel"
                    inputmode="numeric"
                    id="regDienThoai"
                    v-model="form.DienThoai"
                    class="form-control"
                    placeholder="0912345678"
                    maxlength="11"
                    pattern="[0-9]{10,11}"
                    required
                    @keypress="filterNumeric"
                    @input="form.DienThoai = form.DienThoai.replace(/\D/g, '')"
                  />
                </div>

                <!-- Ngày sinh & Giới tính -->
                <div class="col-md-6">
                  <label for="regNgaySinh" class="form-label small fw-semibold">Ngày tháng năm sinh</label>
                  <input
                    type="date"
                    id="regNgaySinh"
                    v-model="form.NgaySinh"
                    class="form-control"
                  />
                </div>
                <div class="col-md-6">
                  <label for="regPhai" class="form-label small fw-semibold">Giới tính</label>
                  <select id="regPhai" v-model="form.Phai" class="form-select">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <!-- Địa chỉ -->
                <div class="col-12">
                  <label for="regDiaChi" class="form-label small fw-semibold">Địa chỉ liên hệ</label>
                  <input
                    type="text"
                    id="regDiaChi"
                    v-model="form.DiaChi"
                    class="form-control"
                    placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
                  />
                </div>

                <!-- Mật khẩu có mắt toggle -->
                <div class="col-md-6">
                  <label for="regPassword" class="form-label small fw-semibold">Mật khẩu khởi tạo <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      id="regPassword"
                      v-model="form.Password"
                      class="form-control"
                      placeholder="Tối thiểu 6 ký tự"
                      minlength="6"
                      required
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showPassword = !showPassword"
                      title="Hiện/Ẩn mật khẩu"
                    >
                      <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                    </button>
                  </div>
                </div>

                <!-- Xác nhận mật khẩu có mắt toggle -->
                <div class="col-md-6">
                  <label for="regConfirmPassword" class="form-label small fw-semibold">Nhập lại mật khẩu <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      id="regConfirmPassword"
                      v-model="form.confirmPassword"
                      class="form-control"
                      placeholder="Xác nhận lại mật khẩu"
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

                <!-- Đồng ý điều khoản -->
                <div class="col-12">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="agreeTerms"
                      v-model="agreeTerms"
                      required
                    />
                    <label class="form-check-label small text-muted" for="agreeTerms">
                      Tôi cam kết tuân thủ đầy đủ các nội quy mượn trả ấn phẩm và giữ gìn tài sản chung của Thư viện Tri thức.
                    </label>
                  </div>
                </div>

                <!-- Nút Submit -->
                <div class="col-12 mt-4">
                  <button
                    type="submit"
                    class="btn btn-primary w-100 py-2 fw-bold shadow-sm"
                    :disabled="isLoading || !agreeTerms"
                  >
                    <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Hoàn Tất Mở Thẻ Bạn Đọc
                  </button>
                </div>
              </div>
            </form>

            <div class="position-relative text-center my-3">
              <hr class="text-muted" />
              <span class="position-absolute top-50 start-50 translate-middle bg-white px-3 small text-muted">
                hoặc
              </span>
            </div>

            <!-- Google Sign-up Button -->
            <GoogleAuthButton mode="signup" class="mb-3" />

            <!-- Chuyển sang Đăng nhập -->
            <div class="text-center small text-muted mt-3">
              Bạn đã có tài khoản thẻ trước đây?
              <router-link to="/login" class="fw-bold text-primary text-decoration-none ms-1">
                Đăng nhập tại đây
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../composables/useToast';
import GoogleAuthButton from '../components/GoogleAuthButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreeTerms = ref(true);
const isLoading = ref(false);
const errorMessage = ref('');

const filterNumeric = (event) => {
  if (!/[0-9]/.test(event.key)) {
    event.preventDefault();
  }
};

const form = reactive({
  HoLot: '',
  Ten: '',
  Email: '',
  DienThoai: '',
  NgaySinh: '',
  Phai: 'Nam',
  DiaChi: '',
  Password: '',
  confirmPassword: ''
});

const handleRegister = async () => {
  if (form.Password !== form.confirmPassword) {
    const msg = 'Mật khẩu và xác nhận mật khẩu không trùng khớp nhau.';
    errorMessage.value = msg;
    toast.warning(msg);
    return;
  }

  if (!agreeTerms.value) {
    toast.warning('Vui lòng đồng ý với các cam kết và nội quy của thư viện.');
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  const payload = {
    HoLot: form.HoLot.trim(),
    Ten: form.Ten.trim(),
    Email: form.Email.trim(),
    DienThoai: form.DienThoai.trim(),
    NgaySinh: form.NgaySinh || undefined,
    Phai: form.Phai,
    DiaChi: form.DiaChi.trim() || undefined,
    Password: form.Password
  };

  const res = await authStore.register(payload);

  if (res.success) {
    toast.success('Đăng ký thẻ bạn đọc thành công! Chào mừng bạn đến với Thư viện Tri thức.');
    router.push('/');
  } else {
    errorMessage.value = res.error;
    toast.error(res.error || 'Đăng ký tài khoản không thành công.');
  }
  isLoading.value = false;
};
</script>

<style scoped>
.auth-view {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
}

.auth-card {
  border-radius: var(--radius-lg);
}

.auth-brand-icon {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  background-color: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
}
</style>
