import mongoose from 'mongoose';
import RentalRoom from '../models/RentalRoom.js';

function toSlug(text) {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') +
    '-' +
    Date.now().toString().slice(-5)
  );
}

/**
 * Lấy danh sách Phòng trọ & Căn hộ (populate sẵn icon + tên tiện ích từ bảng amenities)
 */
export async function getRentalRooms(req, res) {
  try {
    const { city, district, category, priceRange, amenityIds, sortBy } = req.query;
    const filter = { status: 'ACTIVE' };

    if (city && city !== 'ALL') filter['location.city'] = city;
    if (district && district !== 'ALL') filter['location.district'] = district;
    if (category && category !== 'ALL') {
      filter.category = String(category).trim().toUpperCase();
    }

    if (priceRange && priceRange !== 'ALL') {
      if (priceRange === 'UNDER_2M') filter['pricing.monthlyRent'] = { $lt: 2000000 };
      if (priceRange === '2M_TO_4M') filter['pricing.monthlyRent'] = { $gte: 2000000, $lte: 4000000 };
      if (priceRange === '4M_TO_6M') filter['pricing.monthlyRent'] = { $gt: 4000000, $lte: 6000000 };
      if (priceRange === 'OVER_6M') filter['pricing.monthlyRent'] = { $gt: 6000000 };
    }

    // Lọc theo danh sách ID tiện ích được tích chọn
    if (amenityIds) {
      const ids = String(amenityIds)
        .split(',')
        .map((id) => id.trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (ids.length > 0) {
        filter.amenityIds = { $all: ids };
      }
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'price-asc') sortOption = { 'pricing.monthlyRent': 1 };
    if (sortBy === 'price-desc') sortOption = { 'pricing.monthlyRent': -1 };
    if (sortBy === 'area-desc') sortOption = { 'specs.area': -1 };

    const rooms = await RentalRoom.find(filter)
      .populate('hostId', 'fullName phone hostProfile')
      .populate('amenityIds', 'name slug icon group')
      .sort(sortOption);

    res.json({ success: true, total: rooms.length, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Chi tiết 1 phòng trọ / căn hộ
 */
export async function getRentalRoomDetail(req, res) {
  try {
    const { idOrSlug } = req.params;
    const query = mongoose.Types.ObjectId.isValid(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };

    const room = await RentalRoom.findOne(query)
      .populate('hostId', 'fullName phone hostProfile')
      .populate('amenityIds', 'name slug icon group');

    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ / căn hộ.' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Host / Admin đăng phòng trọ mới (nhận mảng amenityIds được tích chọn)
 */
export async function createRentalRoom(req, res) {
  try {
    const { title, category, description, location, pricing, specs, amenityIds, media } = req.body;
    const created = await RentalRoom.create({
      hostId: req.user.userId,
      title,
      slug: toSlug(title),
      category: (category || 'STUDIO').toUpperCase(),
      status: req.user.role === 'ADMIN' ? 'ACTIVE' : 'PENDING',
      description,
      location,
      pricing,
      specs,
      amenityIds: amenityIds || [],
      media: media || [],
    });

    const populated = await created.populate('amenityIds', 'name slug icon group');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Host / Admin cập nhật thông tin & tích chọn lại tiện ích phòng trọ
 */
export async function updateRentalRoom(req, res) {
  try {
    const room = await RentalRoom.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ.' });
    }

    if (req.user.role !== 'ADMIN' && room.hostId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa phòng này.' });
    }

    const updated = await RentalRoom.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastConfirmedAt: new Date() },
      { new: true }
    ).populate('amenityIds', 'name slug icon group');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}