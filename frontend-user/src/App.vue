<template>
  <div class="app-container d-flex flex-column min-vh-100">
    <Navbar />
    <main class="flex-grow-1 min-vh-100">
      <router-view />
    </main>
    <Footer />
    <ToastContainer />
    <ConfirmModal />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import ToastContainer from './components/ToastContainer.vue';
import ConfirmModal from './components/ConfirmModal.vue';
import { useAuthStore } from './stores/authStore';
import { useSettingsStore } from './stores/settingsStore';

const authStore = useAuthStore();
const settingsStore = useSettingsStore();

let syncInterval = null;

onMounted(() => {
  settingsStore.fetchSettings();
  if (authStore.isAuthenticated) {
    authStore.fetchCurrentUser();
  }

  // Polling định kỳ mỗi 15 giây để kiểm tra trạng thái tài khoản (ví dụ bị Blacklist khi đang trực tuyến)
  syncInterval = setInterval(() => {
    if (authStore.isAuthenticated) {
      authStore.fetchCurrentUser();
    }
  }, 15000);
});

onUnmounted(() => {
  if (syncInterval) clearInterval(syncInterval);
});
</script>

<style>
.app-container {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
}
</style>

