<template>
  <header class="sticky-top header-wrapper">
    <!-- Banner cảnh báo bồi thường nếu có -->
    <div
      v-if="authStore.isAuthenticated && borrowStore.totalUnpaidFineAmount > 0"
      class="fine-alert-banner py-2 px-3 text-center small fw-semibold d-flex justify-content-center align-items-center gap-2"
    >
      <i class="bi bi-exclamation-octagon-fill text-warning fs-6"></i>
      <span>
        Bạn có khoản bồi thường chưa thanh toán:
        <strong class="text-white text-decoration-underline">{{ formatCurrency(borrowStore.totalUnpaidFineAmount) }}</strong>. Vui lòng thanh toán trực tiếp tại quầy thư viện để tiếp tục mượn sách.
      </span>
      <router-link
        :to="{ path: '/profile', query: { tab: 'fines' }, hash: '#fines-section' }"
        class="btn btn-sm btn-light py-0 px-2 text-danger fw-bold ms-2 rounded-pill shadow-sm"
      >
        Xem chi tiết <i class="bi bi-arrow-right-short"></i>
      </router-link>
    </div>

    <!-- Main Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-custom">
      <div class="container">
        <!-- Brand Logo -->
        <router-link to="/" class="navbar-brand d-flex align-items-center gap-2 me-lg-4">
          <div class="brand-icon d-flex align-items-center justify-content-center shadow-sm">
            <i class="bi bi-book-half"></i>
          </div>
          <div class="d-flex flex-column">
            <span class="brand-title">THƯ VIỆN TRI THỨC</span>
            <span class="brand-subtitle">Cổng Dịch Vụ Độc Giả</span>
          </div>
        </router-link>

        <!-- Mobile Toggle Button -->
        <button
          class="navbar-toggler mobile-toggle-btn border-0 shadow-none text-white px-2 py-1"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Chuyển đổi điều hướng"
        >
          <i class="bi bi-list fs-2 text-white"></i>
        </button>

        <!-- Navbar Links & Actions -->
        <div class="collapse navbar-collapse" id="navbarContent">
          <!-- Quick Search Bar nổi bật -->
          <form class="d-flex mx-lg-auto my-3 my-lg-0 search-form" @submit.prevent="handleQuickSearch">
            <div class="input-group search-input-group shadow-sm">
              <span class="input-group-text bg-white border-end-0 ps-3">
                <i class="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                v-model="searchKeyword"
                class="form-control border-start-0 border-end-0 ps-1"
                placeholder="Tìm tên tác phẩm, tác giả, NXB..."
                aria-label="Tìm kiếm ấn phẩm"
              />
              <button class="btn btn-search-nav px-3" type="submit">
                <i class="bi bi-search me-1 d-none d-sm-inline"></i> Tìm
              </button>
            </div>
          </form>

          <ul class="navbar-nav ms-auto align-items-lg-center gap-1 gap-lg-2">
            <li class="nav-item">
              <router-link to="/" class="nav-link custom-nav-link" active-class="active">
                <i class="bi bi-house-door me-1"></i> Trang chủ
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/books" class="nav-link custom-nav-link" active-class="active">
                <i class="bi bi-journal-bookmark me-1"></i> Kho sách
              </router-link>
            </li>

            <!-- Chưa đăng nhập: Nút Đăng nhập & Mở thẻ bạn đọc nổi bật -->
            <template v-if="!authStore.isAuthenticated">
              <li class="nav-item ms-lg-2">
                <router-link to="/login" class="btn btn-nav-login btn-sm px-3">
                  <i class="bi bi-box-arrow-in-right me-1"></i> Đăng nhập
                </router-link>
              </li>
              <li class="nav-item">
                <router-link to="/register" class="btn btn-nav-register btn-sm px-3 shadow-sm">
                  <i class="bi bi-person-plus-fill me-1"></i> Mở thẻ bạn đọc
                </router-link>
              </li>
            </template>

            <!-- Đã đăng nhập: User Dropdown -->
            <li class="nav-item dropdown ms-lg-2" v-else>
              <a
                class="nav-link dropdown-toggle d-flex align-items-center gap-2 text-white user-dropdown-toggle px-2 py-1 rounded"
                href="#"
                id="userDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div class="user-avatar-circle shadow-sm overflow-hidden">
                  <img
                    :src="displayUserAvatar"
                    alt="Avatar"
                    class="w-100 h-100 object-fit-cover"
                    @error="handleAvatarError"
                  />
                </div>
                <div class="d-none d-lg-block text-start">
                  <div class="small fw-bold text-white lh-1">{{ authStore.fullName }}</div>
                  <div class="user-badge-code" style="font-size: 0.75rem;">
                    {{ authStore.user?.MaDocGia || 'Độc giả' }}
                  </div>
                </div>
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-2" aria-labelledby="userDropdown">
                <li class="px-3 py-2 border-bottom bg-light rounded-top">
                  <div class="fw-bold text-dark">{{ authStore.fullName }}</div>
                  <div class="small text-muted">{{ authStore.user?.Email }}</div>
                  <div class="badge bg-secondary mt-1 font-monospace">{{ authStore.user?.MaDocGia }}</div>
                </li>
                <li>
                  <router-link to="/profile" class="dropdown-item py-2">
                    <i class="bi bi-person-lines-fill me-2 text-primary"></i> Hồ sơ bạn đọc
                  </router-link>
                </li>
                <li>
                  <router-link to="/my-borrows" class="dropdown-item py-2">
                    <i class="bi bi-clock-history me-2 text-success"></i> Tủ sách & Lịch sử mượn
                  </router-link>
                </li>
                <li><hr class="dropdown-divider my-1" /></li>
                <li>
                  <button class="dropdown-item py-2 text-danger" @click="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i> Đăng xuất
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useBorrowStore } from '../stores/borrowStore';
import { useToast } from '../composables/useToast';
import { useConfirm } from '../composables/useConfirm';
import { getDefaultAvatar } from '../utils/avatarHelper';

const router = useRouter();
const authStore = useAuthStore();
const borrowStore = useBorrowStore();
const toast = useToast();
const { confirm } = useConfirm();

const searchKeyword = ref('');
const avatarFallback = ref(false);

const userInitial = computed(() => {
  const name = authStore.user?.Ten || authStore.user?.Email || 'U';
  return name.charAt(0).toUpperCase();
});

const displayUserAvatar = computed(() => {
  if (avatarFallback.value || !authStore.user?.HinhAnh) {
    return getDefaultAvatar(authStore.user?.Phai);
  }
  return authStore.user.HinhAnh;
});

const handleAvatarError = () => {
  avatarFallback.value = true;
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const handleQuickSearch = () => {
  if (!searchKeyword.value.trim()) {
    toast.warning('Vui lòng nhập từ khóa tìm kiếm ấn phẩm.');
    return;
  }
  router.push({
    path: '/books',
    query: { search: searchKeyword.value.trim() }
  });
};

const handleLogout = async () => {
  const isConfirmed = await confirm({
    title: 'Đăng xuất tài khoản',
    message: 'Bạn có chắc chắn muốn đăng xuất khỏi cổng độc giả?',
    confirmText: 'Đăng xuất',
    type: 'danger',
    icon: 'bi-box-arrow-right'
  });
  if (!isConfirmed) return;

  await authStore.logout();
  toast.info('Bạn đã đăng xuất tài khoản thành công.');
  router.push('/login');
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    borrowStore.fetchMyBorrows();
    borrowStore.fetchMyFines();
  }
});
</script>

<style scoped>
.header-wrapper {
  z-index: 1030;
}

/* Banner cảnh báo phạt */
.fine-alert-banner {
  background: linear-gradient(90deg, #991b1b 0%, #b91c1c 100%);
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

/* Navbar chính */
.navbar-custom {
  background: #0d281e !important;
  background: linear-gradient(135deg, #0d281e 0%, #1b4332 60%, #133a2b 100%) !important;
  padding: 0.75rem 0;
  border-bottom: 2px solid rgba(212, 163, 115, 0.4);
  box-shadow: 0 4px 20px rgba(10, 35, 25, 0.35);
}

/* Brand Logo */
.brand-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #d4a373 0%, #a8794f 100%);
  color: #ffffff;
  font-size: 1.4rem;
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 3px 10px rgba(212, 163, 115, 0.35);
  transition: transform var(--transition-fast);
}

.navbar-brand:hover .brand-icon {
  transform: scale(1.05);
}

.brand-title {
  font-family: var(--font-serif);
  font-weight: 700;
  letter-spacing: 0.6px;
  color: #ffffff !important;
  font-size: 1.2rem;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.brand-subtitle {
  font-size: 0.75rem;
  color: #e8d7c3 !important;
  font-weight: 500;
  letter-spacing: 0.4px;
}

/* Mobile Toggler */
.mobile-toggle-btn {
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.mobile-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

/* Search Form */
.search-form {
  width: 100%;
  max-width: 420px;
}

.search-input-group {
  border-radius: 50px;
  overflow: hidden;
  background-color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.search-input-group input {
  font-size: 0.9rem;
}

.search-input-group input:focus {
  box-shadow: none;
}

.btn-search-nav {
  background: linear-gradient(135deg, #d4a373 0%, #b88656 100%);
  color: #ffffff !important;
  border: none;
  font-weight: 600;
  font-size: 0.88rem;
  padding: 0.4rem 1.15rem;
  transition: all var(--transition-fast);
}

.btn-search-nav:hover {
  background: linear-gradient(135deg, #e0b080 0%, #c59363 100%);
  box-shadow: 0 2px 8px rgba(184, 134, 86, 0.4);
}

/* Navigation Links */
.custom-nav-link {
  color: rgba(255, 255, 255, 0.92) !important;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.5rem 0.9rem !important;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.custom-nav-link:hover {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.14);
}

.custom-nav-link.active {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
  font-weight: 600;
}

.active-borrow-badge {
  background-color: #f59e0b;
  color: #1f2937;
  font-weight: 700;
}

/* Auth Buttons */
.btn-nav-login {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #ffffff !important;
  font-weight: 600;
  border-radius: var(--radius-pill);
  padding: 0.42rem 1.1rem;
  transition: all var(--transition-fast);
}

.btn-nav-login:hover {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff !important;
  border-color: rgba(255, 255, 255, 0.6);
}

.btn-nav-register {
  background: linear-gradient(135deg, #d4a373 0%, #b88656 100%);
  border: none;
  color: #ffffff !important;
  font-weight: 700;
  border-radius: var(--radius-pill);
  padding: 0.42rem 1.25rem;
  box-shadow: 0 3px 12px rgba(184, 134, 86, 0.35);
  transition: all var(--transition-fast);
}

.btn-nav-register:hover {
  background: linear-gradient(135deg, #dfaf7f 0%, #c49262 100%);
  box-shadow: 0 4px 16px rgba(184, 134, 86, 0.5);
  transform: translateY(-1px);
}

/* User Avatar & Dropdown */
.user-dropdown-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-avatar-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4a373 0%, #9c6644 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.6);
}

.user-badge-code {
  color: #e8d7c3;
  font-weight: 500;
}
</style>
