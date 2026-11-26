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
      rentalRoomId,
      roomId,
      roomUnitId,
      ratePackageId,
      stayBookingMode, // 'HOURLY' | 'OVERNIGHT' | 'DAILY'
      guestInfo,
      viewingSchedule,
      hourlyBooking,
      overnightOrDailyBooking,
    } = req.body;

    // Nhánh 1: Đặt lịch xem phòng trọ / studio (VIEWING)
    if (rentalRoomId) {
      if (!viewingSchedule?.appointmentTime) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn ngày giờ xem phòng.' });
      }
      const booking = await Booking.create({
        bookingCode: generateBookingCode(),
        bookingType: 'VIEWING',
        rentalRoomId,
        guestId: req.user ? req.user.userId : null,
        guestInfo,
        status: 'CONFIRMED',
        viewingSchedule: {
          appointmentTime: new Date(viewingSchedule.appointmentTime),
          timeSlot: viewingSchedule.timeSlot || '',
          note: viewingSchedule.note || '',
        },
      });
      return res.status(201).json({ success: true, data: booking });
    }

    // Nhánh 2: Đặt lưu trú Hotel / Resort / Homestay (STAY)
    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation || accommodation.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, message: 'Cơ sở lưu trú không tồn tại hoặc tạm ngưng.' });
    }

    if (!roomId || !roomUnitId || !ratePackageId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn hạng phòng, phòng cụ thể và gói giá.',
      });
    }

    const roomTypeDoc = await Room.findOne({ _id: roomId, accommodationId, status: 'ACTIVE' });
    const roomUnit = roomTypeDoc?.roomUnits.id(roomUnitId);
    const ratePackage = roomUnit?.ratePackages.id(ratePackageId);

    if (!roomTypeDoc || !roomUnit || roomUnit.status !== 'AVAILABLE' || !ratePackage || !ratePackage.isActive) {
      return res.status(404).json({ success: false, message: 'Phòng hoặc gói giá không khả dụng.' });
    }

    const mode = (stayBookingMode || ratePackage.bookingMode || 'OVERNIGHT').toUpperCase();
    const bookingData = {
      bookingCode: generateBookingCode(),
      bookingType: 'STAY',
      stayBookingMode: mode,
      accommodationId: accommodation._id,
      roomId: roomTypeDoc._id,
      roomUnitId: roomUnit._id,
      ratePackageId: ratePackage._id,
      selectedSelection: {
        roomNumber: roomUnit.roomNumber,
        packageCode: ratePackage.code || '',
        packageName: ratePackage.name,
        bookingMode: mode,
        unitPrice: ratePackage.price,
        includedServices: ratePackage.includedServices || [],
        cancellationPolicy: ratePackage.cancellationPolicy || '',
      },
      guestId: req.user ? req.user.userId : null,
      guestInfo,
      status: 'CONFIRMED',
    };

    if (mode === 'HOURLY') {
      if (!hourlyBooking?.bookingDate || !hourlyBooking?.checkInTime) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập ngày và giờ nhận phòng theo giờ.' });
      }
      const hours = Math.max(ratePackage.minHours || 1, Number(hourlyBooking.durationHours || 2));
      const qty = Math.max(1, Number(hourlyBooking.roomQuantity || 1));
      const extraHours = Math.max(0, hours - (ratePackage.minHours || 2));
      const unitTotal = ratePackage.price + extraHours * (ratePackage.extraHourPrice || 0);

      bookingData.hourlyBooking = {
        bookingDate: new Date(hourlyBooking.bookingDate),
        checkInTime: hourlyBooking.checkInTime,
        checkOutTime: hourlyBooking.checkOutTime || '',
        durationHours: hours,
        roomQuantity: qty,
        adults: Number(hourlyBooking.adults || 2),
        children: Number(hourlyBooking.children || 0),
        estimatedTotal: unitTotal * qty,
      };
    } else {
      // OVERNIGHT hoặc DAILY
      if (!overnightOrDailyBooking?.checkInDate || !overnightOrDailyBooking?.checkOutDate) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn ngày nhận và trả phòng.' });
      }

      const checkIn = new Date(overnightOrDailyBooking.checkInDate);
      const checkOut = new Date(overnightOrDailyBooking.checkOutDate);
      if (checkOut <= checkIn) {
        return res.status(400).json({ success: false, message: 'Ngày trả phòng phải sau ngày nhận phòng.' });
      }

      const availability = await checkRoomAvailability({
        accommodationId: accommodation._id,
        roomId: roomTypeDoc._id,
        roomUnitId: roomUnit._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
      });

      const qty = Math.max(1, Number(overnightOrDailyBooking.roomQuantity || 1));
      if (!availability.available || availability.remaining < qty) {
        return res.status(409).json({
          success: false,
          message: `Phòng ${roomUnit.roomNumber} đã có lịch đặt trùng trong khoảng ngày này.`,
        });
      }

      const totalUnits = Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
      bookingData.overnightOrDailyBooking = {
        stayMode: mode === 'DAILY' ? 'DAILY' : 'OVERNIGHT',
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalUnits,
        roomQuantity: qty,
        adults: Number(overnightOrDailyBooking.adults || 2),
        children: Number(overnightOrDailyBooking.children || 0),
        estimatedTotal: totalUnits * qty * ratePackage.price,
      };
    }

    const booking = await Booking.create(bookingData);
    res.status(201).json({ success: true, data: booking });
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