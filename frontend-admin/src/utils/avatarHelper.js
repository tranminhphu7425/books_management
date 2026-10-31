import maleAvatar from '../assets/avatar-male.svg';
import femaleAvatar from '../assets/avatar-female.svg';
import neutralAvatar from '../assets/avatar-neutral.svg';
import { getImageUrl } from './imageHelper';

/**
 * Lấy avatar mặc định theo giới tính
 * @param {string} gender - 'Nam', 'Nữ', 'Khác' (hoặc 'male', 'female')
 * @returns {string} URL ảnh đại diện SVG
 */
export function getDefaultAvatar(gender) {
  if (!gender) return neutralAvatar;
  const g = String(gender).trim().toLowerCase();
  if (g === 'nam' || g === 'male') {
    return maleAvatar;
  }
  if (g === 'nữ' || g === 'nu' || g === 'female') {
    return femaleAvatar;
  }
  return neutralAvatar;
}

/**
 * Lấy ảnh avatar người dùng: ưu tiên ảnh tùy chỉnh nếu có, ngược lại trả về avatar mặc định theo giới tính
 * @param {Object} user - Thông tin người dùng
 * @returns {string} URL ảnh avatar
 */
export function getUserAvatar(user) {
  if (user && user.HinhAnh && typeof user.HinhAnh === 'string' && user.HinhAnh.trim() !== '') {
    return getImageUrl(user.HinhAnh);
  }
  return getDefaultAvatar(user?.Phai || user?.GioiTinh || user?.Gender);
}
