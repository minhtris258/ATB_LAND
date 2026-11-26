import mongoose from 'mongoose';

/**
 * Schema Gói giá & Dịch vụ kèm theo của từng phòng cụ thể
 * Cho phép 1 phòng có nhiều lựa chọn giá (theo đêm / tháng / giờ) và bộ dịch vụ đi kèm khác nhau
 */
const ratePackageSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true, uppercase: true, default: '' }, // VD: "RO", "BB", "SPA_PKG", "MONTHLY"
    name: { type: String, required: [true, 'Vui lòng nhập tên gói giá'], trim: true }, // VD: "Gói Tiêu Chuẩn", "Gói Kèm Ăn Sáng & Đưa Đón"
    billingUnit: {
      type: String,
      enum: ['NIGHT', 'MONTH', 'HOUR'],
      default: 'NIGHT',
    },
    price: {
      type: Number,
      required: [true, 'Vui lòng nhập mức giá của gói'],
      min: [0, 'Giá gói không được nhỏ hơn 0'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Giá gốc không được nhỏ hơn 0'],
      default: null,
    },
    // Dịch vụ / tiện ích đi kèm riêng cho gói giá này
    includedServices: [{ type: String, trim: true }], // VD: ["Buffet sáng", "Dọn phòng hằng ngày", "Giặt ủi 2 bộ/ngày"]
    includedAmenityIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Amenity',
      },
    ],
    // Phụ phí phát sinh nếu có
    extraCharges: [
      {
        name: { type: String, trim: true, required: true }, // VD: "Điện", "Nước", "Người thêm"
        price: { type: Number, required: true, min: 0 },
        unit: { type: String, trim: true, default: '' }, // VD: "kWh", "m3", "người/đêm"
      },
    ],
    cancellationPolicy: {
      type: String,
      trim: true,
      default: 'Miễn phí hủy trước 24 giờ',
    },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

/**
 * Schema Phòng vật lý thuộc 1 Hạng phòng
 * Mỗi phòng cụ thể (VD: P.201, P.202) có đặc điểm riêng và danh sách `ratePackages` riêng
 */
const roomUnitSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: [true, 'Vui lòng nhập số/mã phòng'], trim: true }, // VD: "201", "202"
    floor: { type: Number, default: 1 },
    area: { type: Number, min: 8, default: null }, // Ghi đè diện tích nếu phòng này rộng/nhỏ hơn chuẩn hạng phòng
    viewType: { type: String, trim: true, default: '' }, // Ghi đè hướng nhìn nếu khác chuẩn hạng phòng
    extraFeatures: [{ type: String, trim: true }], // VD: ["Ban công riêng", "Góc 2 mặt thoáng"]
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'INACTIVE'],
      default: 'AVAILABLE',
    },
    // Mỗi phòng có thể có nhiều mức giá & gói dịch vụ kèm theo khác nhau
    ratePackages: {
      type: [ratePackageSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'Mỗi phòng cần có ít nhất 1 gói giá',
      },
    },
    notes: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

/**
 * Schema Hạng phòng (rooms) thuộc Cơ sở lưu trú (Accommodation)
 * 1 hạng phòng chứa danh sách nhiều phòng (`roomUnits`), mỗi phòng có nhiều gói giá (`ratePackages`)
 */
const roomSchema = new mongoose.Schema(
  {
    accommodationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Accommodation',
      required: [true, 'Thiếu liên kết cơ sở lưu trú (accommodationId)'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên hạng phòng'],
      trim: true,
    },
    roomCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    roomType: {
      type: String,
      enum: ['STANDARD', 'SUPERIOR', 'DELUXE', 'EXECUTIVE', 'SUITE', 'VILLA', 'BUNGALOW'],
      default: 'STANDARD',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    area: {
      type: Number,
      required: [true, 'Vui lòng nhập diện tích chuẩn của hạng phòng (m²)'],
      min: [8, 'Diện tích tối thiểu 8m²'],
    },
    maxAdults: {
      type: Number,
      default: 2,
      min: 1,
    },
    maxChildren: {
      type: Number,
      default: 1,
      min: 0,
    },
    bedType: {
      type: String,
      trim: true,
      default: '1 Giường đôi King',
    },
    viewType: {
      type: String,
      trim: true,
      default: 'Hướng thành phố',
    },
    // Danh sách các phòng cụ thể thuộc hạng phòng này
    roomUnits: {
      type: [roomUnitSchema],
      default: [],
    },
    // Tiện ích mặc định của hạng phòng từ bảng `amenities`
    amenityIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Amenity',
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: '' },
        isCover: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'MAINTENANCE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    ratingStats: { averageRating: { type: Number, default: 0 }, totalReviews: { type: Number, default: 0 } },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

roomSchema.virtual('maxGuests').get(function () {
  return (this.maxAdults || 2) + (this.maxChildren || 0);
});

// Tổng số phòng thuộc hạng phòng này
roomSchema.virtual('totalUnits').get(function () {
  return Array.isArray(this.roomUnits) ? this.roomUnits.length : 0;
});

// Số phòng đang mở/sẵn sàng phục vụ
roomSchema.virtual('availableUnitsCount').get(function () {
  if (!Array.isArray(this.roomUnits)) return 0;
  return this.roomUnits.filter((u) => u.status === 'AVAILABLE').length;
});

// Giá thấp nhất trong tất cả các gói giá của mọi phòng thuộc hạng phòng này
roomSchema.virtual('startingPrice').get(function () {
  if (!Array.isArray(this.roomUnits) || this.roomUnits.length === 0) return null;
  let min = Infinity;
  for (const unit of this.roomUnits) {
    if (unit.status === 'INACTIVE' || unit.status === 'MAINTENANCE') continue;
    for (const pkg of unit.ratePackages || []) {
      if (pkg.isActive !== false && typeof pkg.price === 'number' && pkg.price < min) {
        min = pkg.price;
      }
    }
  }
  return min === Infinity ? null : min;
});

roomSchema.index({ accommodationId: 1, status: 1 });
roomSchema.index({ 'roomUnits.roomNumber': 1 });
roomSchema.index({ 'roomUnits.ratePackages.price': 1 });
roomSchema.index({ amenityIds: 1 });

export default mongoose.model('Room', roomSchema);