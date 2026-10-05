import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // 1. Try environment URI if provided (e.g. Atlas or custom local)
  if (uri) {
    try {
      const maskedUri = uri.replace(/\/\/(.*?):(.*?)@/, '//$1:******@');
      console.log(`🔌 Đang kết nối tới MongoDB: ${maskedUri}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ Kết nối MongoDB thành công: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`⚠️ Không thể kết nối tới MONGODB_URI cấu hình: ${err.message}`);
    }
  }

  // 2. Try default local MongoDB daemon (mongodb://127.0.0.1:27017/clothing_store)
  try {
    const defaultLocalUri = 'mongodb://127.0.0.1:27017/clothing_store';
    console.log(`🔍 Thử kết nối MongoDB Local mặc định: ${defaultLocalUri}`);
    const conn = await mongoose.connect(defaultLocalUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ Kết nối MongoDB Local thành công: ${conn.connection.host}`);
    return;
  } catch (err) {
    console.warn(`⚠️ Local MongoDB daemon chưa được bật: ${err.message}`);
  }

  // 3. Fallback to Embedded MongoMemoryServer so the app runs 100% out of the box!
  try {
    console.log(`🚀 Đang khởi động MongoDB Memory Engine nội bộ (tự động 100% không cần cài đặt thêm)...`);
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`✅ Kết nối MongoDB Engine thành công tại: ${memoryUri}`);
    console.log(`💡 Lưu ý: Bạn có thể đổi MONGODB_URI trong file .env để lưu dữ liệu lâu dài vào MongoDB Atlas hoặc Compass!`);
  } catch (err) {
    console.error(`❌ Lỗi khởi tạo MongoDB: ${err.message}`);
    process.exit(1);
  }
};
