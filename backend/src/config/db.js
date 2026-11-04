const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/books_management', {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000
    });

    logger.info(`Kết nối MongoDB thành công: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error('Lỗi kết nối MongoDB: %s', err.stack || err.message);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mất kết nối tới MongoDB! Đang thử kết nối lại...');
    });

    return conn;
  } catch (error) {
    logger.error('Kết nối MongoDB thất bại: %s', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };
