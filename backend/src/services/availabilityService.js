import mongoose from 'mongoose';
import Accommodation from '../models/Accommodation.js';
import Booking from '../models/Booking.js';

/**
 * Kiểm tra quỹ phòng trống theo khoảng ngày (Overbooking Prevention Pipeline)
 */
export async function checkRoomAvailability(accommodationId, checkInDate, checkOutDate) {
  const accommodation = await Accommodation.findById(accommodationId);
  if (!accommodation) {
    throw new Error('Không tìm thấy thông tin chỗ ở.');
  }

  if (accommodation.category === 'ROOM') {
    const isAvailable = accommodation.status === 'ACTIVE';
    return { available: isAvailable, remaining: isAvailable ? 1 : 0 };
  }

  const pipelineResult = await Booking.aggregate([
    {
      $match: {
        accommodationId: new mongoose.Types.ObjectId(accommodationId),
        status: { $in: ['PENDING', 'CONFIRMED'] },
        bookingType: 'STAY',
        'staySchedule.checkInDate': { $lt: new Date(checkOutDate) },
        'staySchedule.checkOutDate': { $gt: new Date(checkInDate) },
      },
    },
    {
      $group: {
        _id: '$accommodationId',
        bookedCount: { $sum: 1 },
      },
    },
  ]);

  const bookedCount = pipelineResult.length > 0 ? pipelineResult[0].bookedCount : 0;
  const remaining = accommodation.specs.totalInventory - bookedCount;

  return {
    available: remaining > 0,
    remaining: Math.max(0, remaining),
    totalInventory: accommodation.specs.totalInventory,
  };
}