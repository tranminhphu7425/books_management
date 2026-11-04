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
              <h3 class="font-serif fw-bold text-dark mb-1">Đăng ký thẻ bạn đọc</h3>
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
                    v-model="form.hoLot"
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
                    v-model="form.ten"
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
                    v-model="form.email"
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
                    v-model="form.dienThoai"
                    class="form-control"
                    placeholder="0912345678"
                    maxlength="11"
                    pattern="[0-9]{10,11}"
                    required
                    @keypress="filterNumeric"
                    @input="form.dienThoai = form.dienThoai.replace(/\D/g, '')"
                  />
                </div>

                <!-- Ngày sinh & Giới tính -->
                <div class="col-md-6">
                  <label for="regNgaySinh" class="form-label small fw-semibold">
                    Ngày tháng năm sinh <span class="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    id="regNgaySinh"
                    v-model="form.ngaySinh"
                    class="form-control"
                    required
                  />
                  <div class="form-text small text-muted">
                    Yêu cầu từ đủ 18 tuổi trở lên.
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="regPhai" class="form-label small fw-semibold">Giới tính</label>
                  <select id="regPhai" v-model="form.phai" class="form-select">
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
                    v-model="form.diaChi"
                    class="form-control"
                    placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
                  />
                </div>

                <!-- Mật khẩu có mắt toggle -->
                <div class="col-md-6">
                  <label for="regPassword" class="form-label small fw-semibold">Mật khẩu <span class="text-danger">*</span></label>
                  <div class="input-group input-group-unified">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      id="regPassword"
                      v-model="form.password"
                      class="form-control"
                      placeholder="Tối thiểu 6 ký tự"
                      minlength="6"
                      required
                    />
                    <button
                      class="btn btn-toggle-pw"
                      type="button"
                      @click="showPassword = !showPassword"
                      title="Hiện/Ẩn mật khẩu"
                      tabindex="-1"
                    >
                      <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                </div>

                <!-- Xác nhận mật khẩu có mắt toggle -->
                <div class="col-md-6">
                  <label for="regConfirmPassword" class="form-label small fw-semibold">Nhập lại mật khẩu <span class="text-danger">*</span></label>
                  <div class="input-group input-group-unified">
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
                      class="btn btn-toggle-pw"
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      title="Hiện/Ẩn mật khẩu"
                      tabindex="-1"
                    >
                      <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
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
                      Tôi cam kết tuân thủ đầy đủ các nội quy mượn trả ấn phẩm và giữ gìn tài sản chung của Thư viện Kiến thức.
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
                    Đăng ký tài khoản
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
import { ref, reactive, computed } from 'vue';
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

const today = new Date();
const maxDateFor18 = computed(() => {
  const d = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

const formatDisplayDate = (isoStr) => {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-');
  return `${d}/${m}/${y}`;
};

const form = reactive({
  hoLot: '',
  ten: '',
  email: '',
  dienThoai: '',
  ngaySinh: '',
  phai: 'Nam',
  diaChi: '',
  password: '',
  confirmPassword: ''
});

const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    const msg = 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập.';
    errorMessage.value = msg;
    toast.warning(msg);
    return;
  }

  if (!agreeTerms.value) {
    toast.warning('Vui lòng đồng ý với nội quy của thư viện để tiếp tục.');
    return;
  }

  if (!form.ngaySinh) {
    const msg = 'Vui lòng nhập ngày tháng năm sinh để xác minh độ tuổi.';
    errorMessage.value = msg;
    toast.warning(msg);
    return;
  }

  // Kiểm tra ràng buộc: không được là ngày tương lai & phải từ đủ 18 tuổi trở lên
  const [birthYear, birthMonth, birthDay] = form.ngaySinh.split('-').map(Number);
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (birthDate > todayDate) {
    const msg = 'Ngày sinh không hợp lệ. Vui lòng kiểm tra lại ngày sinh.';
    errorMessage.value = msg;
    toast.warning(msg);
    return;
  }

  const eighteenthBirthday = new Date(birthDate.getFullYear() + 18, birthDate.getMonth(), birthDate.getDate());
  if (eighteenthBirthday > todayDate) {
    const msg = 'Bạn đọc phải từ đủ 18 tuổi trở lên để mở thẻ bạn đọc.';
    errorMessage.value = msg;
    toast.warning(msg);
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  const payload = {
    hoLot: form.hoLot.trim(),
    ten: form.ten.trim(),
    email: form.email.trim(),
    dienThoai: form.dienThoai.trim(),
    ngaySinh: form.ngaySinh,
    phai: form.phai,
    diaChi: form.diaChi.trim() || undefined,
    password: form.password
  };

  const res = await authStore.register(payload);

  if (res.success) {
    toast.success('Đăng ký thẻ bạn đọc thành công! Chào mừng bạn đến với Thư viện Kiến thức.');
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
