import mongoose from 'mongoose';

/**
 * Kết nối tới MongoDB
 */
const connectDB = async (mongoUri) => {
  const uri = mongoUri || process.env.MONGO_URI;

  if (!uri) {
    throw new Error('Thiếu cấu hình biến môi trường MONGO_URI trong file .env');
  }

  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected:', mongoose.connection.name);
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
  });

  await mongoose.connect(uri, {
    dbName: 'atb_land',
    serverSelectionTimeoutMS: 5000,
  });
};

export const connectDatabase = connectDB;
export default connectDB;