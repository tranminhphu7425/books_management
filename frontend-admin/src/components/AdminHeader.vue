<template>
  <header class="admin-header">
    <div class="d-flex align-items-center gap-3">
      <button class="btn btn-sm btn-outline-secondary d-lg-none" @click="$emit('toggle-sidebar')">
        <i class="bi bi-list fs-5"></i>
      </button>

      <!-- Ngày giờ & Trạng thái ca trực -->
      <div class="d-none d-md-flex align-items-center gap-2 text-muted small">
        <i class="bi bi-clock-history text-primary"></i>
        <span>{{ currentTimeString }}</span>
        <span class="mx-1">•</span>
        <span class="badge bg-success-subtle text-success border border-success-subtle">
          <i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i> Ca trực đang mở
        </span>
      </div>
    </div>

    <!-- Right Controls -->
    <div class="d-flex align-items-center gap-3">
      <!-- Role Badge -->
      <span
        class="badge px-3 py-2 rounded-pill font-monospace"
        :class="authStore.isAdmin ? 'bg-danger text-white' : 'bg-primary text-white'"
      >
        <i :class="authStore.isAdmin ? 'bi bi-shield-fill-check me-1' : 'bi bi-book-half me-1'"></i>
        {{ authStore.roleTitle }}
      </span>

      <!-- User Dropdown & Logout -->
      <div class="dropdown">
        <button
          class="btn btn-sm btn-light border d-flex align-items-center gap-2 dropdown-toggle"
          type="button"
          id="headerUserDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i class="bi bi-person-circle fs-5 text-primary"></i>
          <span class="fw-semibold text-dark">{{ authStore.staffName }}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0" aria-labelledby="headerUserDropdown">
          <li class="px-3 py-2 border-bottom">
            <div class="fw-bold small text-dark">{{ authStore.staffName }}</div>
            <div class="small text-muted">{{ authStore.adminUser?.Email }}</div>
            <div class="small text-muted" v-if="authStore.adminUser?.MSNV">
              MSNV: <code>{{ authStore.adminUser.MSNV }}</code>
            </div>
          </li>
          <li>
            <button class="dropdown-item py-2 text-danger small" @click="handleLogout">
              <i class="bi bi-box-arrow-right me-2"></i> Kết thúc ca & Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminAuthStore } from '../stores/adminAuthStore';
import { useConfirm } from '../composables/useConfirm';

defineEmits(['toggle-sidebar']);

const router = useRouter();
const authStore = useAdminAuthStore();
const { confirm } = useConfirm();

const currentTimeString = ref('');
let timer = null;

const updateClock = () => {
  const now = new Date();
  currentTimeString.value = now.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const handleLogout = async () => {
  const isConfirmed = await confirm({
    title: 'Đăng xuất hệ thống',
    message: 'Bạn có chắc chắn muốn kết thúc phiên làm việc và đăng xuất khỏi Cổng Quản Trị & Thủ Thư?',
    confirmText: 'Đăng xuất',
    cancelText: 'Hủy bỏ',
    type: 'danger',
    icon: 'bi-box-arrow-right'
  });
  if (!isConfirmed) return;

  await authStore.logout();
  router.push('/login');
};

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
