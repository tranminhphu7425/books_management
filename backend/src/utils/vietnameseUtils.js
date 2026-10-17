/**
 * Tiện ích hỗ trợ tìm kiếm tiếng Việt không dấu và có dấu
 */

/**
 * Chuyển chuỗi tiếng Việt có dấu thành không dấu
 * @param {string} str Chuỗi tiếng Việt
 * @returns {string} Chuỗi đã loại bỏ dấu
 */
function removeVietnameseTones(str) {
  if (!str || typeof str !== 'string') return '';
  let result = str;
  result = result.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  result = result.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  result = result.replace(/đ/g, 'd');
  result = result.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  result = result.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  result = result.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  result = result.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  result = result.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  result = result.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  result = result.replace(/Đ/g, 'D');
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return result;
}

const VIETNAMESE_CHAR_MAP = {
  a: '[aàáảãạăằắẳẵặâầấẩẫậ]',
  e: '[eèéẻẽẹêềếểễệ]',
  i: '[iìíỉĩị]',
  o: '[oòóỏõọôồốổỗộơờớởỡợ]',
  u: '[uùúủũụưừứửữự]',
  y: '[yỳýỷỹỵ]',
  d: '[dđ]'
};

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Chuyển đổi từ khóa tìm kiếm (có dấu hoặc không dấu) thành biểu thức chính quy (Regex Pattern)
 * hỗ trợ tìm kiếm linh hoạt không phân biệt hoa thường và không phân biệt dấu tiếng Việt.
 * @param {string} keyword Từ khóa tìm kiếm
 * @returns {string} Chuỗi biểu thức chính quy
 */
function buildVietnameseRegex(keyword) {
  if (!keyword || typeof keyword !== 'string') return '';
  const trimmed = keyword.trim();
  if (!trimmed) return '';

  let pattern = '';
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];

    if (/\s/.test(char)) {
      if (!pattern.endsWith('\\s+')) {
        pattern += '\\s+';
      }
      continue;
    }

    const unaccented = removeVietnameseTones(char).toLowerCase();
    if (VIETNAMESE_CHAR_MAP[unaccented]) {
      pattern += VIETNAMESE_CHAR_MAP[unaccented];
    } else {
      pattern += escapeRegex(char);
    }
  }

  return pattern;
}

module.exports = {
  removeVietnameseTones,
  buildVietnameseRegex
};
