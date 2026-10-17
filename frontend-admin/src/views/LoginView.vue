<template>
  <div class="admin-login-view min-vh-100 d-flex align-items-center justify-content-center p-3">
    <div class="card border-0 shadow-lg p-4 p-md-5 login-card bg-white" style="max-width: 440px; width: 100%;">
      <!-- Header & Logo -->
      <div class="text-center mb-4">
        <div class="login-brand-icon mx-auto mb-3 shadow-sm">
          <i class="bi bi-shield-lock-fill"></i>
        </div>
        <h4 class="font-serif fw-bold text-dark mb-1">Cổng Quản Trị & Thủ Thư</h4>
        <p class="text-muted small">
          Hệ thống nghiệp vụ lưu thông Thư viện Tri thức
        </p>
      </div>

      <!-- Alert thông báo lỗi -->
      <div v-if="errorMessage" class="alert alert-danger py-2 small mb-3">
        <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMessage }}
      </div>

      <!-- Form đăng nhập -->
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="emailOrPhone" class="form-label small fw-semibold">
            Tài khoản Email / Số điện thoại nhân viên
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-person text-muted"></i>
            </span>
            <input
              type="text"
              id="emailOrPhone"
              v-model="form.emailOrPhone"
              class="form-control border-start-0"
              placeholder="nhanvien@library.local hoặc 0987654321"
              required
              autocomplete="username"
            />
          </div>
        </div>

        <div class="mb-4">
          <label for="password" class="form-label small fw-semibold">
            Mật khẩu quản trị
          </label>
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-lock text-muted"></i>
            </span>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="form.password"
              class="form-control border-start-0 border-end-0"
              placeholder="Nhập mật khẩu"
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

        <button
          type="submit"
          class="btn btn-primary w-100 py-2 fw-bold shadow-sm"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          Đăng Nhập
        </button>
      </form>

      <div class="text-center mt-4 pt-3 border-top small text-muted">
        <i class="bi bi-shield-check text-success me-1"></i>
        Bảo mật xác thực đa tầng theo tiêu chuẩn thư viện số
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminAuthStore } from '../stores/adminAuthStore';

const route = useRoute();
const router = useRouter();
const authStore = useAdminAuthStore();

const showPassword = ref(false);
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
    const redirectUrl = route.query.redirect || '/';
    router.push(redirectUrl);
  } else {
    errorMessage.value = res.error;
  }
  isLoading.value = false;
};
</script>

<style scoped>
.admin-login-view {
  background: linear-gradient(135deg, #0d281e 0%, #1b4332 60%, #133a2b 100%);
}

.login-card {
  border-radius: var(--radius-lg);
}

.login-brand-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #d4a373 0%, #a8794f 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}
</style>
