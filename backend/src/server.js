const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// 1. Tiền kiểm tra biến môi trường bắt buộc (Pre-flight Check)
const requiredEnv = ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'FRONTEND_USER_URL', 'FRONTEND_ADMIN_URL'];
const missingEnv = requiredEnv.filter((k) => !process.env[k]);
if (missingEnv.length > 0) {
  console.error(`❌ [Pre-flight Error] Thiếu các biến môi trường bắt buộc trong .env: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const { connectDB, mongoose } = require('./config/db');
const logger = require('./config/logger');
const { generalLimiter } = require('./middlewares/rateLimiter');
const { errorHandler } = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Kết nối Cơ sở dữ liệu MongoDB
connectDB();

// 2. Bảo vệ Tiêu đề HTTP bằng Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hidePoweredBy: true
  })
);

// 3. Kiểm soát Nguồn gốc Truy cập CORS
const rawAllowedOrigins = [
  process.env.FRONTEND_USER_URL,
  process.env.FRONTEND_ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];
const allowedOrigins = rawAllowedOrigins
  .filter(Boolean)
  .map((url) => url.trim().replace(/\/+$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Cho phép request không có origin (ví dụ curl, mobile app, postman hoặc nội bộ)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.trim().replace(/\/+$/, '');

      // 2. Cho phép nếu nằm trong danh sách whitelist cấu hình
      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      // 3. Tự động cho phép mọi domain Vercel (*.vercel.app) và Render (*.onrender.com)
      if (
        /^https:\/\/[a-zA-Z0-9-_.]+\.vercel\.app$/.test(cleanOrigin) ||
        /^https:\/\/[a-zA-Z0-9-_.]+\.onrender\.com$/.test(cleanOrigin)
      ) {
        return callback(null, true);
      }

      callback(new Error(`Từ chối truy cập bởi chính sách CORS: ${origin}`));
    },
    credentials: true
  })
);

// 4. Rate Limiter chung & Phân tích dữ liệu đầu vào
app.use(generalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Ghi log HTTP bằng Morgan
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 6. Phục vụ tập tin tĩnh cho uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 7. Định tuyến các API
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/publishers', require('./routes/publisherRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/borrows', require('./routes/borrowRoutes'));
app.use('/api/fines', require('./routes/fineRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// 8. Xử lý đường dẫn 404 Not Found theo chuẩn Response Envelope
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: `Đường dẫn ${req.originalUrl} không tồn tại trên máy chủ.`
    },
    timestamp: new Date().toISOString()
  });
});

// 9. Bắt lỗi tập trung toàn cục
app.use(errorHandler);

// Khởi chạy Server Express
const server = app.listen(PORT, () => {
  logger.info(`🚀 Backend API Server đang vận hành tại http://localhost:${PORT}`);
});

// 10. Quy trình Tắt máy An Toàn (Graceful Shutdown)
const gracefulShutdown = (signal) => {
  logger.info(`⚠️ Nhận tín hiệu ${signal}. Bắt đầu quy trình tắt máy an toàn...`);
  server.close(async () => {
    logger.info('🛑 Máy chủ HTTP đã đóng tiếp nhận request mới.');
    try {
      await mongoose.connection.close(false);
      logger.info('🛑 Kết nối MongoDB đã được đóng an toàn.');
      process.exit(0);
    } catch (err) {
      logger.error('❌ Lỗi khi đóng kết nối MongoDB:', err);
      process.exit(1);
    }
  });

  // Buộc tắt sau 10 giây nếu còn request bị nghẽn
  setTimeout(() => {
    logger.error('❌ Hết hạn chờ 10 giây. Buộc dừng tiến trình Node.js!');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGUSR2', () => {
  server.close(() => {
    process.kill(process.pid, 'SIGUSR2');
  });
});
