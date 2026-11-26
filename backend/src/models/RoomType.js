const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // VD: "Studio Ban Công"
  slug: { type: String, unique: true, lowercase: true },
  city: { type: String, required: true }, // VD: "Huế", "Hà Nội", "TP. Hồ Chí Minh"
  description: { type: String },
  baseArea: { type: Number }, // Diện tích chuẩn (m2)
  maxGuests: { type: Number, default: 2 },
  defaultAmenities: [{ type: String }], // Tiện nghi chung: ["Điều hòa", "Wifi", "Bếp từ"]
  images: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('RoomType', roomTypeSchema);