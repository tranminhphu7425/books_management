import { reactive, readonly } from 'vue';

const state = reactive({
  isOpen: false,
  title: 'Xác nhận hành động',
  message: 'Bạn có chắc chắn muốn thực hiện hành động này không?',
  confirmText: 'Xác nhận',
  cancelText: 'Hủy bỏ',
  type: 'primary', // 'primary' | 'danger' | 'warning' | 'success'
  icon: 'bi-question-circle',
  resolve: null
});

export function useConfirm() {
  /**
   * Hiển thị hộp thoại xác nhận tuỳ biến (Promise-based Confirm Dialog cho Admin)
   * @param {Object} options
   * @param {string} [options.title] - Tiêu đề hộp thoại
   * @param {string} [options.message] - Nội dung thông báo
   * @param {string} [options.confirmText] - Nhãn nút xác nhận
   * @param {string} [options.cancelText] - Nhãn nút hủy
   * @param {'primary'|'danger'|'warning'|'success'} [options.type='primary'] - Phong cách màu sắc
   * @param {string} [options.icon] - Icon Bootstrap hiển thị
   * @returns {Promise<boolean>} Trả về true nếu người dùng nhấn xác nhận, false nếu hủy
   */
  const showConfirm = (options = {}) => {
    return new Promise((resolve) => {
      state.title = options.title || 'Xác nhận hành động';
      state.message = options.message || 'Bạn có chắc chắn muốn thực hiện thao tác này?';
      state.confirmText = options.confirmText || 'Xác nhận';
      state.cancelText = options.cancelText || 'Hủy bỏ';
      state.type = options.type || 'primary';
      state.icon =
        options.icon ||
        (options.type === 'danger'
          ? 'bi-exclamation-triangle-fill'
          : options.type === 'warning'
          ? 'bi-exclamation-circle-fill'
          : options.type === 'success'
          ? 'bi-check2-circle'
          : 'bi-question-circle-fill');
      state.isOpen = true;
      state.resolve = resolve;
    });
  };

  const handleConfirm = () => {
    state.isOpen = false;
    if (state.resolve) {
      state.resolve(true);
      state.resolve = null;
    }
  };

  const handleCancel = () => {
    state.isOpen = false;
    if (state.resolve) {
      state.resolve(false);
      state.resolve = null;
    }
  };

  return {
    state: readonly(state),
    confirm: showConfirm,
    handleConfirm,
    handleCancel
  };
}
