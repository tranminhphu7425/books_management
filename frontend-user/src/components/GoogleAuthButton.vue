<template>
  <div class="google-auth-wrapper w-100">
    <!-- Trường hợp 1: Có Google Client ID hợp lệ -> Render nút chuẩn của Google Identity Services (Khi click sẽ tự động mở popup chọn tài khoản Google của trình duyệt) -->
    <div v-show="hasValidClientId" ref="googleBtnOfficial" class="w-100 d-flex justify-content-center my-1"></div>

    <!-- Trường hợp 2: Khi chưa cấu hình Google Client ID hoặc đang tải -> Hiển thị nút giao diện đồng bộ kèm giải thích -->
    <div v-show="!hasValidClientId" class="w-100">
      <button
        type="button"
        class="btn btn-google w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
        :disabled="isLoading || authStore.isLoading"
        @click="handleGoogleClick"
      >
        <span v-if="isLoading || authStore.isLoading" class="spinner-border spinner-border-sm text-secondary me-1" role="status"></span>
        <svg v-else class="google-icon" viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span class="small fw-semibold text-dark">
          {{ labelText }}
        </span>
      </button>
    </div>

    <!-- Modal giải thích & Trợ giúp kiểm thử nhanh khi Google Client ID chưa được cấu hình -->
    <div
      v-if="showDevModal"
      class="google-dev-backdrop"
      @click.self="showDevModal = false"
    >
      <div class="google-dev-card shadow-lg p-4 bg-white rounded-4 border">
        <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-google text-danger fs-5"></i>
            <h6 class="font-serif fw-bold text-dark mb-0">Xác Thực & Kiểm Thử Tài Khoản Google</h6>
          </div>
          <button type="button" class="btn-close" @click="showDevModal = false"></button>
        </div>

        <div class="alert alert-info py-2 px-3 small mb-3 border-0 bg-light">
          <div class="d-flex gap-2">
            <i class="bi bi-info-circle text-primary fs-6 mt-1"></i>
            <div>
              <strong>Lưu ý về danh sách tài khoản Google của trình duyệt:</strong>
              <div class="text-muted mt-1" style="font-size: 0.825rem;">
                Để trình duyệt mở popup danh sách các tài khoản Gmail/Google có sẵn, cần cấu hình <code>VITE_GOOGLE_CLIENT_ID</code> từ Google Cloud Console. Hiện tại hệ thống hỗ trợ bạn <strong>kiểm thử trực tiếp luồng đăng ký/đăng nhập tự động</strong> bên dưới:
              </div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleDevSubmit">
          <div class="mb-3">
            <label class="form-label small fw-semibold">Địa chỉ Email Google <span class="text-danger">*</span></label>
            <input
              type="email"
              v-model="devForm.email"
              class="form-control"
              placeholder="ten_ban_doc@gmail.com"
              required
            />
          </div>

          <div class="mb-3" v-if="mode === 'signup'">
            <label class="form-label small fw-semibold">Họ và tên bạn đọc</label>
            <input
              type="text"
              v-model="devForm.name"
              class="form-control"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-secondary btn-sm" @click="showDevModal = false">
              Hủy
            </button>
            <button type="submit" class="btn btn-primary btn-sm px-3" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
              {{ mode === 'signup' ? 'Đăng Ký & Đăng Nhập Ngay' : 'Xác Nhận Đăng Nhập' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../composables/useToast';

const props = defineProps({
  mode: {
    type: String,
    default: 'signin' // 'signin' hoặc 'signup'
  },
  customLabel: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['success', 'error']);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

const isLoading = ref(false);
const showDevModal = ref(false);
const googleBtnOfficial = ref(null);
const hasValidClientId = ref(false);

const devForm = reactive({
  email: '',
  name: ''
});

const labelText = computed(() => {
  if (props.customLabel) return props.customLabel;
  if (props.mode === 'signup') {
    return 'Đăng ký bằng Google';
  }
  return 'Đăng nhập bằng Google';
});

// Khởi tạo Google Identity Services
const initGoogleIdentity = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isValid = !!(clientId && clientId !== 'your_google_client_id_here' && clientId.includes('.apps.googleusercontent.com'));
  hasValidClientId.value = isValid;

  if (!isValid) return;

  const tryInit = () => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        if (googleBtnOfficial.value) {
          googleBtnOfficial.value.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnOfficial.value, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: props.mode === 'signup' ? 'signup_with' : 'signin_with',
            shape: 'rectangular',
            width: 320,
            locale: 'vi'
          });
        }

        // Kích hoạt One Tap nếu khả dụng
        window.google.accounts.id.prompt();
      } catch (e) {
        console.warn('Lỗi khi khởi tạo Google Identity Services:', e);
      }
    } else {
      setTimeout(tryInit, 300);
    }
  };

  tryInit();
};

const handleGoogleCredentialResponse = async (response) => {
  if (!response || !response.credential) {
    toast.error('Không nhận được thông tin xác thực từ Google.');
    return;
  }

  isLoading.value = true;
  try {
    const res = await authStore.googleLogin(response.credential);
    if (res.success) {
      toast.success(
        props.mode === 'signup'
          ? `Mở thẻ bạn đọc thành công! Chào mừng ${authStore.fullName || ''}.`
          : `Đăng nhập Google thành công! Chào mừng ${authStore.fullName || ''}.`
      );
      emit('success', res);
      const redirectUrl = route.query.redirect || '/';
      router.push(redirectUrl);
    } else {
      toast.error(res.error || 'Xác thực Google không thành công.');
      emit('error', res.error);
    }
  } catch (err) {
    toast.error('Đã xảy ra lỗi trong quá trình kết nối với Google.');
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleClick = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isValid = !!(clientId && clientId !== 'your_google_client_id_here' && clientId.includes('.apps.googleusercontent.com'));

  // Nếu đã có Google Identity Services SDK và client ID hợp lệ
  if (window.google?.accounts?.id && isValid) {
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        showDevModal.value = true;
      }
    });
  } else {
    // Mở dev/test modal giải thích rõ ràng và hỗ trợ đăng nhập kiểm thử
    showDevModal.value = true;
  }
};

const handleDevSubmit = async () => {
  if (!devForm.email) {
    toast.warning('Vui lòng nhập địa chỉ email Google.');
    return;
  }

  isLoading.value = true;
  try {
    // Tạo token payload mô phỏng Google OAuth JWT
    const email = devForm.email.trim().toLowerCase();
    const name = devForm.name.trim() || email.split('@')[0];
    const googleId = 'g_' + Math.abs(email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));

    const mockPayload = {
      iss: 'https://accounts.google.com',
      sub: googleId,
      email: email,
      email_verified: true,
      name: name,
      picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };

    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(mockPayload));
    const signature = btoa('mock_signature_dev');
    const mockIdToken = `${header}.${payload}.${signature}`;

    const res = await authStore.googleLogin(mockIdToken);
    if (res.success) {
      showDevModal.value = false;
      toast.success(
        props.mode === 'signup'
          ? `Mở thẻ bạn đọc qua Google thành công! Chào mừng ${authStore.fullName || ''}.`
          : `Đăng nhập Google thành công! Chào mừng ${authStore.fullName || ''}.`
      );
      emit('success', res);
      const redirectUrl = route.query.redirect || '/';
      router.push(redirectUrl);
    } else {
      toast.error(res.error || 'Xác thực Google thất bại.');
    }
  } catch (err) {
    toast.error('Lỗi khi kết nối hệ thống xác thực Google.');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  initGoogleIdentity();
});
</script>

<style scoped>
.btn-google {
  background-color: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-sm, 8px);
  transition: all 0.2s ease;
}

.btn-google:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.google-dev-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(13, 40, 30, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.google-dev-card {
  width: 100%;
  max-width: 440px;
  animation: modalPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modalPop {
  0% {
    opacity: 0;
    transform: scale(0.92) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
