import mongoose from 'mongoose';

/**
 * Schema Đặt lịch xem phòng trọ (VIEWING -> rentalRoomId)
 * & Đặt phòng Khách sạn/Resort theo Hạng phòng + Phòng cụ thể + Gói giá/dịch vụ (STAY)
 */
const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: true, unique: true },
    bookingType: {
      type: String,
      enum: ['VIEWING', 'STAY'],
      required: true,
    },
    // Dành cho đặt lịch xem phòng trọ / căn hộ (rental_rooms)
    rentalRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalRoom', default: null },

    // Dành cho đặt phòng Khách sạn / Resort (accommodations + rooms + roomUnits + ratePackages)
    accommodationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Accommodation', default: null },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null }, // ID hạng phòng
    roomUnitId: { type: mongoose.Schema.Types.ObjectId, default: null }, // ID phòng cụ thể (trong room.roomUnits)
    ratePackageId: { type: mongoose.Schema.Types.ObjectId, default: null }, // ID gói giá đã chọn

    // Lưu bản chụp (snapshot) phòng & gói dịch vụ tại thời điểm đặt để tránh đổi giá về sau
    selectedSelection: {
      roomNumber: { type: String, default: '' },
      packageCode: { type: String, default: '' },
      packageName: { type: String, default: '' },
      billingUnit: { type: String, enum: ['NIGHT', 'MONTH', 'HOUR'], default: 'NIGHT' },
      unitPrice: { type: Number, default: 0 },
      includedServices: [{ type: String }],
      cancellationPolicy: { type: String, default: '' },
    },

    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    guestInfo: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
      default: 'CONFIRMED',
    },
    viewingSchedule: {
      appointmentTime: { type: Date, default: null },
      timeSlot: { type: String, default: '' },
      note: { type: String, default: '' },
    },
    staySchedule: {
      checkInDate: { type: Date, default: null },
      checkOutDate: { type: Date, default: null },
      nights: { type: Number, default: 1 },
      roomQuantity: { type: Number, default: 1, min: 1 },
      adults: { type: Number, default: 2 },
      children: { type: Number, default: 0 },
      estimatedTotal: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ rentalRoomId: 1, status: 1 });
bookingSchema.index({ accommodationId: 1, roomId: 1, roomUnitId: 1, status: 1 });

export default mongoose.model('Booking', bookingSchema);