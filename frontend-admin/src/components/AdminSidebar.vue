<template>
  <aside class="admin-sidebar" :class="{ show: isOpen }">
    <!-- Brand Logo -->
    <div class="p-3 border-bottom border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
      <router-link to="/" class="text-decoration-none d-flex align-items-center gap-2 text-white">
        <div class="sidebar-logo-icon">
          <i class="bi bi-shield-lock-fill"></i>
        </div>
        <div class="d-flex flex-column">
          <span class="font-serif fw-bold" style="font-size: 1.05rem; letter-spacing: 0.5px;">THƯ VIỆN TRI THỨC</span>
          <span class="text-warning small" style="font-size: 0.72rem; letter-spacing: 0.4px;">HỆ THỐNG QUẢN TRỊ</span>
        </div>
      </router-link>
      <button class="btn btn-sm text-white d-lg-none" @click="$emit('close')">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <!-- Navigation Menu -->
    <div class="flex-grow-1 overflow-y-auto py-2">
      <!-- Mục 1: Tổng quan -->
      <div class="sidebar-category-label">Tổng Quan</div>
      <router-link to="/" class="sidebar-nav-item" active-class="active" exact>
        <i class="bi bi-speedometer2"></i>
        <span>Bảng điều khiển</span>
      </router-link>

      <!-- Mục 2: Tác nghiệp lưu thông sách -->
      <div class="sidebar-category-label mt-2">Nghiệp Vụ Lưu Thông</div>
      <router-link to="/borrows" class="sidebar-nav-item" active-class="active">
        <i class="bi bi-inbox-fill"></i>
        <span>Duyệt & Xuất sách</span>
      </router-link>
      <router-link to="/returns" class="sidebar-nav-item" active-class="active">
        <i class="bi bi-arrow-down-left-square-fill"></i>
        <span>Nhận trả & Sự cố</span>
      </router-link>
      <router-link to="/fines" class="sidebar-nav-item" active-class="active">
        <i class="bi bi-receipt-cutoff"></i>
        <span>Biên bản bồi thường</span>
      </router-link>

      <!-- Mục 3: Quản lý kho sách -->
      <div class="sidebar-category-label mt-2">Kho Ấn Phẩm</div>
      <router-link to="/books" class="sidebar-nav-item" active-class="active">
        <i class="bi bi-journal-bookmark-fill"></i>
        <span>Quản lý kho sách</span>
      </router-link>

        <!-- Mục 4: Quản trị hệ thống (Chỉ ADMIN) -->
      <template v-if="authStore.isAdmin">
        <div class="sidebar-category-label mt-2 text-warning opacity-75">Quản Trị Hệ Thống</div>
        <router-link to="/users" class="sidebar-nav-item" active-class="active">
          <i class="bi bi-people-fill"></i>
          <span>Tài khoản & Nhân sự</span>
        </router-link>
        <router-link
          v-if="ADMIN_FEATURES.ENABLE_SETTINGS_PAGE"
          to="/settings"
          class="sidebar-nav-item"
          active-class="active"
        >
          <i class="bi bi-sliders"></i>
          <span>Cấu hình quy chế</span>
        </router-link>
        <router-link to="/audit-logs" class="sidebar-nav-item" active-class="active">
          <i class="bi bi-shield-check"></i>
          <span>Nhật ký tác nghiệp</span>
        </router-link>
      </template>
    </div>

    <!-- Thông tin người trực ca ở chân sidebar -->
    <div class="p-3 border-top border-secondary border-opacity-25 bg-black bg-opacity-25">
      <div class="d-flex align-items-center gap-2">
        <div class="staff-avatar-circle">
          {{ staffInitial }}
        </div>
        <div class="flex-grow-1 overflow-hidden">
          <div class="small fw-bold text-white text-truncate">{{ authStore.staffName }}</div>
          <div class="small text-warning text-truncate" style="font-size: 0.75rem;">
            {{ authStore.roleTitle }}
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useAdminAuthStore } from '../stores/adminAuthStore';
import { ADMIN_FEATURES } from '../config/features';

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close']);

const authStore = useAdminAuthStore();

const staffInitial = computed(() => {
  const name = authStore.staffName || 'A';
  return name.charAt(0).toUpperCase();
});
</script>

<style scoped>
.sidebar-logo-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #d4a373 0%, #a8794f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.15rem;
}

.staff-avatar-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--admin-gold);
  color: #0d281e;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
}
</style>
