import Amenity from '../models/Amenity.js';

function toAmenitySlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Lấy danh sách tiện ích (có icon + tên) để render thành danh sách Checkbox trên Frontend
 * Hỗ trợ lọc theo ?target=RENTAL_ROOM | ACCOMMODATION | HOTEL_ROOM
 */
export async function getAmenities(req, res) {
  try {
    const filter = { isActive: true };
    if (req.query.target) {
      filter.applicableTo = req.query.target;
    }

    const amenities = await Amenity.find(filter).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, total: amenities.length, data: amenities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Admin thêm tiện ích mới vào danh mục dùng chung
 */
export async function createAmenity(req, res) {
  try {
    const { name, icon, group, applicableTo, sortOrder } = req.body;
    const amenity = await Amenity.create({
      name,
      slug: toAmenitySlug(name),
      icon: icon || 'check-circle',
      group: group || 'BASIC',
      applicableTo: applicableTo?.length ? applicableTo : ['RENTAL_ROOM', 'ACCOMMODATION', 'HOTEL_ROOM'],
      sortOrder: sortOrder || 0,
    });
    res.status(201).json({ success: true, data: amenity });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Admin cập nhật icon, tên hoặc trạng thái tiện ích
 */
export async function updateAmenity(req, res) {
  try {
    const payload = { ...req.body };
    if (payload.name) {
      payload.slug = toAmenitySlug(payload.name);
    }
    const updated = await Amenity.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tiện ích.' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}