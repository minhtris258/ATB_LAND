import Accommodation from '../models/Accommodation.js';
import Room from '../models/Room.js';

/**
 * Đồng bộ lại giá khởi điểm (pricing.basePrice) và tổng quỹ phòng của cơ sở lưu trú
 */
async function syncAccommodationStats(accommodationId) {
  const activeRooms = await Room.find({ accommodationId, status: 'ACTIVE' });
  if (activeRooms.length === 0) return;

  const minPrice = Math.min(...activeRooms.map((r) => r.price));
  const totalRooms = activeRooms.reduce((sum, r) => sum + (r.totalInventory || 1), 0);

  await Accommodation.findByIdAndUpdate(accommodationId, {
    'pricing.basePrice': minPrice,
    'specs.totalInventory': totalRooms,
  });
}

/**
 * Lấy danh sách tất cả hạng phòng của 1 Khách sạn / Resort / Khu trọ
 */
export async function getRoomsByAccommodation(req, res) {
  try {
    const { accommodationId } = req.params;
    const rooms = await Room.find({ accommodationId, status: 'ACTIVE' }).sort({ price: 1 });
    res.json({ success: true, total: rooms.length, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Host / Admin thêm hạng phòng mới cho cơ sở lưu trú
 */
export async function createRoom(req, res) {
  try {
    const { accommodationId } = req.params;
    const accommodation = await Accommodation.findById(accommodationId);

    if (!accommodation) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cơ sở lưu trú.' });
    }

    if (req.user.role !== 'ADMIN' && accommodation.hostId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Bạn không phải chủ sở hữu cơ sở này.' });
    }

    const isMonth = accommodation.category === 'ROOM';
    const room = await Room.create({
      ...req.body,
      accommodationId,
      priceUnit: isMonth ? 'MONTH' : 'NIGHT',
    });

    await syncAccommodationStats(accommodationId);

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Host / Admin cập nhật giá, số lượng phòng trống hoặc trạng thái hạng phòng
 */
export async function updateRoom(req, res) {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hạng phòng.' });
    }

    const accommodation = await Accommodation.findById(room.accommodationId);
    if (req.user.role !== 'ADMIN' && accommodation.hostId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa hạng phòng này.' });
    }

    const updatedRoom = await Room.findByIdAndUpdate(roomId, req.body, { new: true });
    await syncAccommodationStats(room.accommodationId);

    res.json({ success: true, data: updatedRoom });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Host / Admin xóa hạng phòng
 */
export async function deleteRoom(req, res) {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hạng phòng.' });
    }

    const accommodation = await Accommodation.findById(room.accommodationId);
    if (req.user.role !== 'ADMIN' && accommodation.hostId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa hạng phòng này.' });
    }

    const accId = room.accommodationId;
    await Room.findByIdAndDelete(roomId);
    await syncAccommodationStats(accId);

    res.json({ success: true, message: 'Đã xóa hạng phòng thành công.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}