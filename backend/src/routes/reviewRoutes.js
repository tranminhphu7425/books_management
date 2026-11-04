const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');
const { optionalAuth } = require('../middlewares/authMiddleware');
const { requireUser } = require('../middlewares/roleMiddleware');

// Lấy danh sách nhận xét của ấn phẩm (Khách vãng lai và độc giả đều xem được)
router.get('/book/:bookId', optionalAuth, reviewController.getReviewsByBook);

// Thêm mới hoặc cập nhật nhận xét (Yêu cầu đăng nhập tài khoản Độc giả đã từng mượn & trả sách)
router.post('/', authMiddleware, requireUser, reviewController.createReview);

// Xóa nhận xét (Độc giả xóa nhận xét của chính mình HOẶC Nhân viên ADMIN, BOOK_MANAGER xóa vi phạm)
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;

