import { reactive, readonly } from 'vue';

// Trạng thái toast toàn cục — singleton dùng chung toàn ứng dụng
const state = reactive({
  toasts: []
});

let idCounter = 0;

/**
 * Thêm một toast mới vào hàng đợi hiển thị
 * @param {'success'|'error'|'warning'|'info'} type - Loại toast
 * @param {string} message - Nội dung thông báo
 * @param {number} duration - Thời gian hiển thị (ms), mặc định 4000
 */
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
    /**
     * Toast thành công — màu xanh lá
     * @param {string} message
     * @param {number} [duration=4000]
     */
    success(message, duration = 4000) {
      addToast('success', message, duration);
    },
    /**
     * Toast lỗi — màu đỏ, hiển thị lâu hơn (6s)
     * @param {string} message
     * @param {number} [duration=6000]
     */
    error(message, duration = 6000) {
      addToast('error', message, duration);
    },
    /**
     * Toast cảnh báo — màu vàng
     * @param {string} message
     * @param {number} [duration=5000]
     */
    warning(message, duration = 5000) {
      addToast('warning', message, duration);
    },
    /**
     * Toast thông tin — màu xanh dương
     * @param {string} message
     * @param {number} [duration=4000]
     */
    info(message, duration = 4000) {
      addToast('info', message, duration);
    },
    /** Đóng toast theo ID */
    dismiss(id) {
      removeToast(id);
    }
  };
}
