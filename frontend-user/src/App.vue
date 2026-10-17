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
import { onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import ToastContainer from './components/ToastContainer.vue';
import ConfirmModal from './components/ConfirmModal.vue';
import { useAuthStore } from './stores/authStore';

const authStore = useAuthStore();

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.fetchCurrentUser();
  }
});
</script>

<style>
.app-container {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
}
</style>

