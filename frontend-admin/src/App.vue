<template>
  <!-- Nếu đang ở trang đăng nhập -->
  <div v-if="isLoginPage">
    <router-view />
    <ToastContainer />
    <ConfirmModal />
  </div>

  <!-- Layout tổng thể khi đã vào trang quản trị -->
  <div v-else class="admin-layout">
    <AdminSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />
    <div class="admin-main">
      <AdminHeader @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
      <main class="admin-content">
        <router-view />
      </main>
    </div>
    <!-- Toast Container toàn cục — hiển thị trên mọi trang quản trị -->
    <ToastContainer />
    <!-- Confirm Dialog toàn cục -->
    <ConfirmModal />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';
import ToastContainer from './components/ToastContainer.vue';
import ConfirmModal from './components/ConfirmModal.vue';

const route = useRoute();
const isSidebarOpen = ref(false);

const isLoginPage = computed(() => route.name === 'AdminLogin');
</script>

