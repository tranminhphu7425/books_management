/**
 * ==========================================================
 * CẤU HÌNH BẬT / TẮT TÍNH NĂNG ADMIN (FEATURE FLAGS)
 * ==========================================================
 * Dễ dàng tùy biến ẩn/hiện các trang hoặc module trong hệ thống
 * chỉ bằng cách thay đổi giá trị boolean (true/false) bên dưới.
 */

export const ADMIN_FEATURES = {
  /**
   * Trang Cấu hình quy chế (/settings)
   * - false: Ẩn hoàn toàn khỏi Sidebar và chặn truy cập Route
   * - true : Hiển thị trên Sidebar và cho phép truy cập
   */
  ENABLE_SETTINGS_PAGE: false,
};
