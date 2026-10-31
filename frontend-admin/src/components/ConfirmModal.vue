<template>
  <Transition name="fade">
    <div v-if="state.isOpen" class="admin-confirm-backdrop" @click.self="handleCancel">
      <div class="admin-confirm-card shadow-lg" role="dialog" aria-modal="true">
        <!-- Header Icon & Title -->
        <div class="d-flex align-items-start gap-3 p-4 pb-3">
          <div class="confirm-icon-wrapper flex-shrink-0" :class="`icon-${state.type}`">
            <i class="bi" :class="state.icon"></i>
          </div>
          <div class="flex-grow-1">
            <h5 class="font-serif fw-bold text-dark mb-1 confirm-title">{{ state.title }}</h5>
            <p class="text-muted small mb-0 confirm-message lh-base">{{ state.message }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="p-3 bg-light rounded-bottom d-flex justify-content-end gap-2 border-top">
          <button type="button" class="btn btn-outline-secondary btn-sm px-3" @click="handleCancel">
            {{ state.cancelText }}
          </button>
          <button
            type="button"
            class="btn btn-sm px-4 shadow-sm fw-semibold"
            :class="confirmButtonClass"
            @click="handleConfirm"
          >
            {{ state.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { useConfirm } from '../composables/useConfirm';

const { state, handleConfirm, handleCancel } = useConfirm();

const confirmButtonClass = computed(() => {
  switch (state.type) {
    case 'danger':
      return 'btn-danger';
    case 'warning':
      return 'btn-warning text-dark';
    case 'success':
      return 'btn-success';
    case 'primary':
    default:
      return 'btn-primary';
  }
});
</script>

<style scoped>
.admin-confirm-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.admin-confirm-card {
  width: 100%;
  max-width: 450px;
  background: #ffffff;
  border-radius: var(--radius-lg, 14px);
  overflow: hidden;
  border: 1px solid var(--admin-border, #e2e8f0);
  animation: modalPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.confirm-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
}

.icon-danger {
  background-color: #fee2e2;
  color: var(--admin-danger, #ef4444);
}

.icon-warning {
  background-color: #fef3c7;
  color: var(--admin-warning, #f59e0b);
}

.icon-success {
  background-color: #dcfce7;
  color: var(--admin-success, #10b981);
}

.icon-primary {
  background-color: #e8f5e9;
  color: var(--admin-primary, #1b4332);
}

.confirm-title {
  font-size: 1.05rem;
}

.confirm-message {
  white-space: pre-line;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
