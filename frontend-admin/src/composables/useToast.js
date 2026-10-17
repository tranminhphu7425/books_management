import { reactive, readonly } from 'vue';

// Trạng thái toast toàn cục — singleton dùng chung toàn ứng dụng Admin
const state = reactive({
  toasts: []
});

let idCounter = 0;

function addToast(type, message, duration = 4000) {
  const id = ++idCounter;
  state.toasts.push({ id, type, message, duration });
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
}

function removeToast(id) {
  const idx = state.toasts.findIndex((t) => t.id === id);
  if (idx !== -1) state.toasts.splice(idx, 1);
}

export function useToast() {
  return {
    toasts: readonly(state.toasts),
    success(message, duration = 4000) { addToast('success', message, duration); },
    error(message, duration = 6000)   { addToast('error', message, duration); },
    warning(message, duration = 5000) { addToast('warning', message, duration); },
    info(message, duration = 4000)    { addToast('info', message, duration); },
    dismiss(id)                       { removeToast(id); }
  };
}
