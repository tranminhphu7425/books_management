/**
 * Tiện ích xử lý và kiểm thực ngày tháng, độ tuổi
 */

/**
 * Helper bóc tách ngày tháng chuẩn (tránh lệch timezone khi parse yyyy-mm-dd)
 * @param {string|Date|number} val Giá trị ngày đầu vào
 * @returns {Date|null} Đối tượng Date ở mức ngày (00:00:00 giờ địa phương) hoặc null nếu không hợp lệ
 */
const parseDateOnly = (val) => {
  if (!val) return null;
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
    const parts = val.substring(0, 10).split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/**
 * Kiểm tra tính hợp lệ của ngày sinh và tuổi (>= 18 tuổi, không ở tương lai)
 * @param {string|Date|number} dateInput Chuỗi ngày hoặc Date nhập vào
 * @param {boolean} isRequired Có bắt buộc nhập hay không (mặc định: true)
 * @returns {{ isValid: boolean, code?: string, message?: string, date?: Date|null }}
 */
const validateBirthDateAndAge = (dateInput, isRequired = true) => {
  if (!dateInput) {
    if (isRequired) {
      return {
        isValid: false,
        code: 'VALIDATION_FAILED',
        message: 'Vui lòng cung cấp ngày tháng năm sinh để xác minh độ tuổi (yêu cầu từ đủ 18 tuổi trở lên).'
      };
    }
    return { isValid: true, date: null };
  }

  const birth = parseDateOnly(dateInput);
  if (!birth) {
    return {
      isValid: false,
      code: 'VALIDATION_FAILED',
      message: 'Định dạng ngày tháng năm sinh không hợp lệ.'
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 1. Ràng buộc: không được là ngày trong tương lai
  if (birth > today) {
    return {
      isValid: false,
      code: 'VALIDATION_FAILED',
      message: 'Ngày sinh không hợp lệ. Ngày sinh không được là ngày trong tương lai.'
    };
  }

  // 2. Ràng buộc: kiểm tra người dùng đã đủ 18 tuổi hay chưa
  const eighteenthBirthday = new Date(birth.getFullYear() + 18, birth.getMonth(), birth.getDate());
  if (eighteenthBirthday > today) {
    return {
      isValid: false,
      code: 'AUTH_UNDERAGE',
      message: 'Người dùng chưa đủ 18 tuổi. Chỉ người từ đủ 18 tuổi trở lên mới được phép đăng ký tài khoản.'
    };
  }

  return { isValid: true, date: birth };
};

module.exports = {
  parseDateOnly,
  validateBirthDateAndAge
};

