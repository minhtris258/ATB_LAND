import mongoose from 'mongoose';

/**
 * Schema Cơ sở lưu trú Khách sạn & Resort (accommodations: HOTEL | RESORT)
 * Liên kết 1-N với `rooms` (các hạng phòng), mỗi hạng phòng có nhiều phòng và nhiều gói giá/dịch vụ
 */
const accommodationSchema = new mongoose.Schema(
  {
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: String,
      enum: ['HOTEL', 'RESORT'],
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED'],
      default: 'ACTIVE',
    },
    description: { type: String, default: '' },
    location: {
      city: { type: String, required: true },
      district: { type: String, required: true },
      ward: { type: String, default: '' },
      addressDetail: { type: String, required: true },
      geo: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [107.5905, 16.4637] },
      },
    },
    pricing: {
      minNightlyPrice: { type: Number, required: true, min: 0 }, // Tự động đồng bộ từ gói giá thấp nhất của các phòng
      checkInTime: { type: String, default: '14:00' },
      checkOutTime: { type: String, default: '12:00' },
    },
    specs: {
      starRating: { type: Number, min: 1, max: 5, default: 4 },
      totalRoomsCount: { type: Number, default: 1, min: 1 },
    },
    amenityIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Amenity',
      },
    ],
    media: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
        isCover: { type: Boolean, default: false },
      },
    ],
    reportCount: { type: Number, default: 0 },
    lastConfirmedAt: { type: Date, default: Date.now },
    ratingStats: { averageRating: { type: Number, default: 0 }, totalReviews: { type: Number, default: 0 } },
  },
  
  { timestamps: true }
);

accommodationSchema.index({ 'location.city': 1, category: 1, status: 1, 'pricing.minNightlyPrice': 1 });
accommodationSchema.index({ amenityIds: 1 });
accommodationSchema.index({ 'location.geo': '2dsphere' });

export default mongoose.model('Accommodation', accommodationSchema);