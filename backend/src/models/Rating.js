import mongoose from 'mongoose';

/**
 * Schema Đánh giá & Nhận xét phòng (ratings)
 * Hỗ trợ đánh giá:
 * - Khách sạn / Resort: targetType = 'ACCOMMODATION' (kèm accommodationId, roomId hạng phòng, roomUnitId phòng cụ thể)
 * - Phòng trọ / Căn hộ: targetType = 'RENTAL_ROOM' (kèm rentalRoomId)
 */
const ratingSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['ACCOMMODATION', 'RENTAL_ROOM'],
      required: [true, 'Thiếu loại đối tượng đánh giá'],
    },
    // Liên kết Khách sạn / Resort & Hạng phòng / Phòng cụ thể
    accommodationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Accommodation',
      default: null,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
      index: true,
    },
    roomUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    // Liên kết Phòng trọ / Căn hộ dài hạn
    rentalRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RentalRoom',
      default: null,
      index: true,
    },
    // Liên kết đơn đặt phòng / đặt lịch xem phòng (nếu có -> gắn nhãn "Đã trải nghiệm")
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Thiếu thông tin người đánh giá'],
      index: true,
    },
    // Điểm đánh giá tổng quan (1 - 5 sao)
    overallScore: {
      type: Number,
      required: [true, 'Vui lòng chọn số sao đánh giá'],
      min: [1, 'Số sao tối thiểu là 1'],
      max: [5, 'Số sao tối đa là 5'],
    },
    // Điểm chi tiết theo từng tiêu chí (tùy chọn)
    criteriaScores: {
      cleanliness: { type: Number, min: 1, max: 5, default: null }, // Độ sạch sẽ
      amenities: { type: Number, min: 1, max: 5, default: null },   // Tiện nghi & dịch vụ
      location: { type: Number, min: 1, max: 5, default: null },    // Vị trí
      valueForMoney: { type: Number, min: 1, max: 5, default: null }, // Đáng giá tiền
    },
    title: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },
    comment: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung nhận xét'],
      trim: true,
      maxlength: 2000,
    },
    images: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
      },
    ],
    // Bản chụp thông tin phòng / gói dịch vụ tại thời điểm đánh giá
    staySnapshot: {
      roomName: { type: String, default: '' },
      roomNumber: { type: String, default: '' },
      packageName: { type: String, default: '' },
    },
    isVerifiedStay: {
      type: Boolean,
      default: false,
    },
    // Phản hồi từ Chủ cơ sở lưu trú (HOST)
    hostReply: {
      content: { type: String, trim: true, default: '' },
      repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      repliedAt: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: ['VISIBLE', 'HIDDEN'],
      default: 'VISIBLE',
    },
  },
  { timestamps: true }
);

// Mỗi booking chỉ được đánh giá 1 lần
ratingSchema.index(
  { userId: 1, bookingId: 1 },
  { unique: true, partialFilterExpression: { bookingId: { $type: 'objectId' } } }
);
ratingSchema.index({ accommodationId: 1, status: 1, createdAt: -1 });
ratingSchema.index({ roomId: 1, status: 1, createdAt: -1 });
ratingSchema.index({ rentalRoomId: 1, status: 1, createdAt: -1 });

export default mongoose.model('Rating', ratingSchema);