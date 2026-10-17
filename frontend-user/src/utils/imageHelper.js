/**
 * Chuyển đổi đường dẫn ảnh tương đối (ví dụ: /uploads/covers/xxx.jpg)
 * thành đường dẫn tuyệt đối dựa trên backend API URL
 * @param {string} path - Đường dẫn ảnh
 * @param {string} fallback - Ảnh dự phòng mặc định
 * @returns {string} URL ảnh đầy đủ
 */
export function getImageUrl(path, fallback = '') {
  if (!path) return fallback;
  const trimmed = String(path).trim();
  if (!trimmed) return fallback;

  // Nếu là URL bên ngoài (Unsplash, Cloudinary, http/https, data URL) thì giữ nguyên
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Nếu là đường dẫn tương đối từ backend server (/uploads/...)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  return `${baseUrl}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}
