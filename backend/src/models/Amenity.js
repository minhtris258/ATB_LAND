import mongoose from 'mongoose';

/**
 * Schema Danh mục Tiện ích & Dịch vụ dùng chung (amenities)
 * Dùng chung cho Cơ sở lưu trú (Accommodation), Hạng phòng (Room), Phòng cụ thể và Phòng trọ (RentalRoom)
 */
const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên tiện ích'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon: {
      type: String,
      required: [true, 'Vui lòng nhập tên hoặc mã icon'],
      trim: true,
      default: 'check-circle',
    },
    group: {
      type: String,
      enum: ['BASIC', 'FURNITURE', 'RESORT_SERVICE', 'SECURITY', 'ADDON_PACKAGE'],
      default: 'BASIC',
    },
    applicableTo: [
      {
        type: String,
        enum: ['RENTAL_ROOM', 'ACCOMMODATION', 'HOTEL_ROOM', 'ROOM_UNIT', 'RATE_PACKAGE'],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

amenitySchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.model('Amenity', amenitySchema);