import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: true, unique: true },
    bookingType: {
      type: String,
      enum: ['VIEWING', 'STAY'],
      required: true,
    },
    // Hình thức đặt lưu trú: Đặt theo giờ (HOURLY) | Đặt qua đêm (OVERNIGHT) | Đặt theo ngày (DAILY)
    stayBookingMode: {
      type: String,
      enum: ['HOURLY', 'OVERNIGHT', 'DAILY', null],
      default: null,
    },

    rentalRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'RentalRoom', default: null },
    accommodationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Accommodation', default: null },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    roomUnitId: { type: mongoose.Schema.Types.ObjectId, default: null },
    ratePackageId: { type: mongoose.Schema.Types.ObjectId, default: null },

    selectedSelection: {
      roomNumber: { type: String, default: '' },
      packageCode: { type: String, default: '' },
      packageName: { type: String, default: '' },
      bookingMode: { type: String, enum: ['HOURLY', 'OVERNIGHT', 'DAILY'], default: 'OVERNIGHT' },
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

    // 1. Lịch xem phòng trọ (VIEWING)
    viewingSchedule: {
      appointmentTime: { type: Date, default: null },
      timeSlot: { type: String, default: '' },
      note: { type: String, default: '' },
    },

    // 2. Trường Đặt phòng theo giờ (HOURLY)
    hourlyBooking: {
      bookingDate: { type: Date, default: null },     // Ngày sử dụng
      checkInTime: { type: String, default: '' },     // VD: "14:00"
      checkOutTime: { type: String, default: '' },    // VD: "17:00"
      durationHours: { type: Number, default: 2, min: 1 },
      roomQuantity: { type: Number, default: 1, min: 1 },
      adults: { type: Number, default: 2 },
      children: { type: Number, default: 0 },
      estimatedTotal: { type: Number, default: 0 },
    },

    // 3. Trường Đặt phòng qua đêm & theo ngày (OVERNIGHT | DAILY)
    overnightOrDailyBooking: {
      stayMode: { type: String, enum: ['OVERNIGHT', 'DAILY'], default: 'OVERNIGHT' },
      checkInDate: { type: Date, default: null },
      checkOutDate: { type: Date, default: null },
      totalUnits: { type: Number, default: 1, min: 1 }, // Số đêm (OVERNIGHT) hoặc số ngày (DAILY)
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