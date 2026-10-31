<template>
  <div class="toast-container-global" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast-slide" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item"
        :class="`toast-item--${toast.type}`"
        role="alert"
      >
        <div class="toast-icon">
          <i :class="iconClass(toast.type)"></i>
        </div>
        <div class="toast-body">{{ toast.message }}</div>
        <button
          class="toast-close"
          type="button"
          aria-label="Đóng thông báo"
          @click="dismiss(toast.id)"
        >
          <i class="bi bi-x-lg"></i>
        </button>
        <div
          class="toast-progress"
          :style="{ animationDuration: `${toast.duration}ms` }"
        ></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast';

const { toasts, dismiss } = useToast();

function iconClass(type) {
  const map = {
    success: 'bi bi-check-circle-fill',
    error: 'bi bi-exclamation-octagon-fill',
    warning: 'bi bi-exclamation-triangle-fill',
    info: 'bi bi-info-circle-fill'
  };
  return map[type] || 'bi bi-bell-fill';
}
</script>

<style scoped>
.toast-container-global {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  pointer-events: none;
  max-width: 420px;
  width: calc(100vw - 2.5rem);
}

.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.14), 0 1px 4px rgba(0, 0, 0, 0.08);
  pointer-events: all;
  position: relative;
  overflow: hidden;
  border-left: 4px solid transparent;
}

.toast-item--success { border-left-color: #2e7d32; }
.toast-item--error   { border-left-color: #c62828; }
.toast-item--warning { border-left-color: #ef6c00; }
.toast-item--info    { border-left-color: #1565c0; }

.toast-icon { font-size: 1.15rem; flex-shrink: 0; margin-top: 1px; }
.toast-item--success .toast-icon { color: #2e7d32; }
.toast-item--error   .toast-icon { color: #c62828; }
.toast-item--warning .toast-icon { color: #ef6c00; }
.toast-item--info    .toast-icon { color: #1565c0; }

.toast-body {
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #1a1a2e;
  font-weight: 450;
}

.toast-close {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #9e9e9e;
  font-size: 0.8rem;
  flex-shrink: 0;
  line-height: 1;
  transition: color 0.15s;
}
.toast-close:hover { color: #424242; }

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: currentColor;
  opacity: 0.3;
  animation: toast-shrink linear forwards;
  transform-origin: left;
}
.toast-item--success .toast-progress { color: #2e7d32; }
.toast-item--error   .toast-progress { color: #c62828; }
.toast-item--warning .toast-progress { color: #ef6c00; }
.toast-item--info    .toast-progress { color: #1565c0; }

@keyframes toast-shrink {
  from { width: 100%; }
  to   { width: 0%; }
}

.toast-slide-enter-active { transition: all 0.28s cubic-bezier(0.22, 1, 0.36, 1); }
.toast-slide-leave-active { transition: all 0.22s ease-in; }
.toast-slide-enter-from   { opacity: 0; transform: translateX(100%) scale(0.95); }
.toast-slide-leave-to     { opacity: 0; transform: translateX(40%) scale(0.95); }
</style>
