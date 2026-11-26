import Accommodation from '../models/Accommodation.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import { checkRoomAvailability } from '../services/availabilityService.js';

function generateBookingCode() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ATB-${year}-${rand}`;
}

function calculateDurationUnits(billingUnit, checkIn, checkOut, explicitUnits) {
  if (explicitUnits && Number(explicitUnits) > 0) {
    return Number(explicitUnits);
  }
  const diffMs = Math.max(0, checkOut - checkIn);
  if (billingUnit === 'HOUR') {
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
  }
  if (billingUnit === 'MONTH') {
    const days = diffMs / (1000 * 60 * 60 * 24);
    return Math.max(1, Math.ceil(days / 30));
  }
  // Mặc định NIGHT
  return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Kiểm tra quỹ phòng trống theo khoảng ngày (theo từng hạng phòng roomId, phòng roomUnitId hoặc cả cơ sở)
 */
export async function getAvailability(req, res) {
  try {
    const { accommodationId, roomId, roomUnitId, checkInDate, checkOutDate } = req.query;
    if ((!accommodationId && !roomId) || !checkInDate || !checkOutDate) {
      return res
        .status(400)
        .json({ success: false, message: 'Thiếu thông tin cơ sở/hạng phòng hoặc ngày nhận/trả phòng.' });
    }
    const result = await checkRoomAvailability({
      accommodationId,
      roomId,
      roomUnitId,
      checkInDate,
      checkOutDate,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Tạo đơn Đặt lịch xem phòng trọ (VIEWING) hoặc Đặt phòng KS/Resort theo:
 * roomId (hạng phòng) + roomUnitId (phòng cụ thể) + ratePackageId (gói giá & dịch vụ kèm theo)
 */
export async function createBooking(req, res) {
  try {
    const {
      accommodationId,
      roomId,
      roomUnitId,
      ratePackageId,
      guestInfo,
      viewingSchedule,
      staySchedule,
    } = req.body;

    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation || accommodation.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, message: 'Chỗ ở không tồn tại hoặc tạm ngừng nhận khách.' });
    }

    const isViewing = accommodation.category === 'ROOM';
    const bookingData = {
      bookingCode: generateBookingCode(),
      accommodationId: accommodation._id,
      roomId: null,
      roomUnitId: null,
      ratePackageId: null,
      selectedSelection: null,
      guestId: req.user ? req.user.userId : null,
      guestInfo,
      bookingType: isViewing ? 'VIEWING' : 'STAY',
      status: 'CONFIRMED',
    };

    if (isViewing) {
      if (!viewingSchedule || !viewingSchedule.appointmentTime) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn ngày và khung giờ xem phòng.' });
      }
      bookingData.viewingSchedule = {
        appointmentTime: new Date(viewingSchedule.appointmentTime),
        timeSlot: viewingSchedule.timeSlot || '',
        note: viewingSchedule.note || '',
      };
    } else {
      if (!staySchedule || !staySchedule.checkInDate || !staySchedule.checkOutDate) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn ngày Check-in và Check-out.' });
      }
      if (!roomId || !roomUnitId || !ratePackageId) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn đầy đủ hạng phòng (roomId), phòng cụ thể (roomUnitId) và gói giá (ratePackageId).',
        });
      }

      const roomTypeDoc = await Room.findOne({
        _id: roomId,
        accommodationId: accommodation._id,
        status: 'ACTIVE',
      });
      if (!roomTypeDoc) {
        return res.status(404).json({ success: false, message: 'Hạng phòng đã chọn không tồn tại hoặc tạm ngưng.' });
      }

      const roomUnit = roomTypeDoc.roomUnits.id(roomUnitId);
      if (!roomUnit || roomUnit.status !== 'AVAILABLE') {
        return res.status(404).json({
          success: false,
          message: 'Phòng cụ thể đã chọn không tồn tại hoặc hiện không khả dụng.',
        });
      }

      const ratePackage = roomUnit.ratePackages.id(ratePackageId);
      if (!ratePackage || ratePackage.isActive === false) {
        return res.status(404).json({
          success: false,
          message: 'Gói giá và dịch vụ đã chọn không tồn tại hoặc đã ngừng áp dụng.',
        });
      }

      const checkIn = new Date(staySchedule.checkInDate);
      const checkOut = new Date(staySchedule.checkOutDate);
      if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
        return res.status(400).json({ success: false, message: 'Khoảng ngày nhận/trả phòng không hợp lệ.' });
      }

      const availability = await checkRoomAvailability({
        accommodationId: accommodation._id,
        roomId: roomTypeDoc._id,
        roomUnitId: roomUnit._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
      });

      const roomQuantity = Math.max(1, Number(staySchedule.roomQuantity || 1));
      if (!availability.available || availability.remaining < roomQuantity) {
        return res.status(409).json({
          success: false,
          message: `Phòng ${roomUnit.roomNumber} đã có lịch đặt trùng trong khoảng ngày bạn chọn.`,
        });
      }

      const durationUnits = calculateDurationUnits(
        ratePackage.billingUnit,
        checkIn,
        checkOut,
        staySchedule.nights
      );
      const unitPrice = Number(ratePackage.price || 0);
      const estimatedTotal = durationUnits * roomQuantity * unitPrice;

      bookingData.roomId = roomTypeDoc._id;
      bookingData.roomUnitId = roomUnit._id;
      bookingData.ratePackageId = ratePackage._id;
      bookingData.selectedSelection = {
        roomNumber: roomUnit.roomNumber,
        packageCode: ratePackage.code || '',
        packageName: ratePackage.name,
        billingUnit: ratePackage.billingUnit,
        unitPrice,
        includedServices: ratePackage.includedServices || [],
        cancellationPolicy: ratePackage.cancellationPolicy || '',
      };
      bookingData.staySchedule = {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        nights: durationUnits,
        roomQuantity,
        adults: Number(staySchedule.adults || 2),
        children: Number(staySchedule.children || 0),
        estimatedTotal,
      };
    }

    const booking = await Booking.create(bookingData);
    res.status(201).json({
      success: true,
      message: 'Xác nhận đặt phòng thành công.',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Tra cứu lịch đã đặt (populate cơ sở lưu trú + hạng phòng)
 */
export async function getBookings(req, res) {
  try {
    const filter = {};
    if (req.query.phone) {
      filter['guestInfo.phone'] = String(req.query.phone).trim();
    } else if (req.user) {
      filter.guestId = req.user.userId;
    } else {
      return res.json({ success: true, data: [] });
    }

    const bookings = await Booking.find(filter)
      .populate('accommodationId', 'title category location pricing media')
      .populate('roomId', 'name roomCode roomType area bedType')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}