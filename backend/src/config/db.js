const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/books_management', {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000
    });

    console.log(`✅ Kết nối MongoDB thành công: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ Lỗi kết nối MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mất kết nối tới MongoDB! Đang thử kết nối lại...');
    });

    return conn;
  } catch (error) {
    console.error('❌ Kết nối MongoDB thất bại:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };
