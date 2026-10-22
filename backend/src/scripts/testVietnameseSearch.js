const { buildVietnameseRegex, removeVietnameseTones } = require('../utils/vietnameseUtils');

console.log('=== TEST VIETNAMESE SEARCH UTILITIES ===');

const testCases = [
  { keyword: 'Kien', target: 'Kiến thức lập trình', expected: true },
  { keyword: 'kien', target: 'Phạm Trung Kiên', expected: true },
  { keyword: 'Kiến', target: 'Kien thuc lap trinh', expected: true },
  { keyword: 'lap trinh', target: 'Giáo trình Lập Trình Web', expected: true },
  { keyword: 'dac nhan tam', target: 'Đắc Nhân Tâm', expected: true },
  { keyword: 'toan', target: 'Toán học cao cấp', expected: true },
  { keyword: 'C++', target: 'Lập trình C++', expected: true },
  { keyword: 'Tap 1', target: 'Harry Potter (Tập 1)', expected: true },
  { keyword: 'nguyen van a', target: 'Nguyễn Văn A', expected: true },
  { keyword: 'khong khop', target: 'Đắc Nhân Tâm', expected: false }
];

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const pattern = buildVietnameseRegex(tc.keyword);
  const regex = new RegExp(pattern, 'i');
  const result = regex.test(tc.target);
  if (result === tc.expected) {
    console.log(`[PASS] Keyword: "${tc.keyword}" against Target: "${tc.target}" -> Regex: /${pattern}/i`);
    passed++;
  } else {
    console.error(`[FAIL] Keyword: "${tc.keyword}" against Target: "${tc.target}" -> Expected: ${tc.expected}, Got: ${result}`);
    failed++;
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed successfully!');
}
