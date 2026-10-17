/**
 * Tiện ích sinh mã định danh tự tăng an toàn tuyệt đối
 * Chống trùng lặp (Duplicate Key) ngay cả khi có bản ghi bị xóa hoặc dữ liệu nhảy cóc
 */
exports.generateNextCode = async (Model, fieldName, prefix, padLength = 3) => {
  const regex = new RegExp(`^${prefix}\\d+$`);
  const items = await Model.find({ [fieldName]: regex }).select(fieldName).lean();

  let maxNum = 0;
  items.forEach((item) => {
    const val = item[fieldName];
    if (val && typeof val === 'string') {
      const match = val.match(new RegExp(`^${prefix}(\\d+)$`));
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
  });

  let nextNum = maxNum + 1;
  let code = `${prefix}${String(nextNum).padStart(padLength, '0')}`;

  while (await Model.exists({ [fieldName]: code })) {
    nextNum++;
    code = `${prefix}${String(nextNum).padStart(padLength, '0')}`;
  }

  return code;
};
