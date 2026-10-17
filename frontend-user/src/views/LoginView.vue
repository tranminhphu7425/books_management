<template>
  <div class="auth-view py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-5">
          <div class="card border-0 shadow-lg p-4 p-md-5 auth-card bg-white">
            <!-- Brand Logo & Tiêu đề -->
            <div class="text-center mb-4">
              <div class="auth-brand-icon mx-auto mb-2">
                <i class="bi bi-book-half"></i>
              </div>
              <h3 class="font-serif fw-bold text-dark mb-1">Đăng Nhập Độc Giả</h3>
              <p class="text-muted small">
                Chào mừng bạn đọc quay trở lại với Thư viện Tri thức
              </p>
            </div>

            <!-- Thông báo lỗi nếu có -->
            <div v-if="errorMessage" class="alert alert-danger py-2 small mb-3">
              <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMessage }}
            </div>

            <!-- Form Đăng nhập -->
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="emailOrPhone" class="form-label small fw-semibold">
                  Địa chỉ Email hoặc Số điện thoại
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="bi bi-person text-muted"></i>
                  </span>
                  <input
                    type="text"
                    id="emailOrPhone"
                    v-model="form.emailOrPhone"
                    class="form-control border-start-0 ps-0"
                    placeholder="name@example.com hoặc 0912345678"
                    required
                    autocomplete="username"
                  />
                </div>
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label for="password" class="form-label small fw-semibold mb-0">Mật khẩu</label>
                  <a href="#" class="small text-decoration-none text-muted" @click.prevent="alertContactStaff">
                    Quên mật khẩu?
                  </a>
                </div>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="bi bi-lock text-muted"></i>
                  </span>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    v-model="form.password"
                    class="form-control border-start-0 border-end-0 ps-0"
                    placeholder="Nhập mật khẩu tài khoản"
                    required
                    autocomplete="current-password"
                  />
                  <button
                    class="btn btn-outline-secondary border-start-0"
                    type="button"
                    @click="showPassword = !showPassword"
                    title="Hiện/Ẩn mật khẩu"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                  </button>
                </div>
              </div>

              <div class="mb-4 form-check">
                <input type="checkbox" class="form-check-input" id="rememberMe" v-model="rememberMe" />
                <label class="form-check-label small text-muted" for="rememberMe">
                  Ghi nhớ trạng thái đăng nhập
                </label>
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100 py-2 fw-bold shadow-sm mb-3"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                Đăng Nhập
              </button>
            </form>

            <div class="position-relative text-center my-3">
              <hr class="text-muted" />
              <span class="position-absolute top-50 start-50 translate-middle bg-white px-3 small text-muted">
                hoặc
              </span>
            </div>

            <!-- Google Sign-in Button -->
            <GoogleAuthButton mode="signin" class="mb-4" />

            <!-- Chuyển sang Đăng ký -->
            <div class="text-center small text-muted">
              Bạn chưa có thẻ bạn đọc?
              <router-link to="/register" class="fw-bold text-primary text-decoration-none ms-1">
                Đăng ký mở thẻ ngay
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
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../composables/useToast';
import GoogleAuthButton from '../components/GoogleAuthButton.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const showPassword = ref(false);
const rememberMe = ref(true);
const isLoading = ref(false);
const errorMessage = ref('');

const form = reactive({
  emailOrPhone: '',
  password: ''
});

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  const res = await authStore.login({
    emailOrPhone: form.emailOrPhone.trim(),
    password: form.password
  });

  if (res.success) {
    toast.success(`Đăng nhập thành công! Chào mừng bạn đọc ${authStore.fullName || ''}.`);
    const redirectUrl = route.query.redirect || '/';
    router.push(redirectUrl);
  } else {
    errorMessage.value = res.error;
    toast.error(res.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
  }
  isLoading.value = false;
};

const alertContactStaff = () => {
  toast.info('Để bảo mật thông tin tài khoản, nếu quên mật khẩu vui lòng liên hệ trực tiếp quầy thủ thư hoặc gửi thư về email: thuvientrithuc@edu.vn để được cấp lại.');
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
