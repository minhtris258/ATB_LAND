import mongoose from 'mongoose';

/**
 * Schema Phòng trọ & Căn hộ dịch vụ (rental_rooms - Thuê dài hạn theo tháng)
 * Tách riêng khỏi Khách sạn & Resort để tối ưu chỉ số điện/nước, trạng thái thuê và đặt lịch xem phòng
 */
const rentalRoomSchema = new mongoose.Schema(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề phòng trọ / căn hộ'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    roomType: {
      type: String,
      enum: ['BOARDING_ROOM', 'STUDIO', 'MINI_APARTMENT', 'WHOLE_HOUSE'],
      default: 'STUDIO',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'OCCUPIED', 'INACTIVE'],
      default: 'ACTIVE',
    },
    description: {
      type: String,
      default: '',
    },
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
      monthlyRent: { type: Number, required: true, min: 0 },
      electricityPrice: { type: Number, default: 3500, min: 0 },
      waterPrice: { type: Number, default: 25000, min: 0 },
      waterUnit: { type: String, enum: ['M3', 'PERSON', 'ROOM'], default: 'M3' },
      serviceFee: { type: Number, default: 0, min: 0 },
      depositMonths: { type: Number, default: 1, min: 0 },
    },
    specs: {
      area: { type: Number, required: true, min: 8 },
      floor: { type: Number, default: 1 },
      maxOccupants: { type: Number, default: 2, min: 1 },
      availableRooms: { type: Number, default: 1, min: 0 },
      isCurfewFree: { type: Boolean, default: true },
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

rentalRoomSchema.index({ 'location.city': 1, 'location.district': 1, status: 1, 'pricing.monthlyRent': 1 });
rentalRoomSchema.index({ amenityIds: 1 });
rentalRoomSchema.index({ 'location.geo': '2dsphere' });

export default mongoose.model('RentalRoom', rentalRoomSchema);