import mongoose from 'mongoose';
import Rating from '../models/Rating.js';
import Accommodation from '../models/Accommodation.js';
import Room from '../models/Room.js';
import RentalRoom from '../models/RentalRoom.js';
import Booking from '../models/Booking.js';

/**
 * Tự động tính lại điểm trung bình & tổng lượt đánh giá cho Accommodation / Room / RentalRoom
 */
async function recalculateRatingStats({ accommodationId, roomId, rentalRoomId }) {
  if (accommodationId) {
    const [stats] = await Rating.aggregate([
      {
        $match: {
          accommodationId: new mongoose.Types.ObjectId(accommodationId),
          status: 'VISIBLE',
        },
      },
      {
        $group: {
          _id: '$accommodationId',
          avgScore: { $avg: '$overallScore' },
          total: { $sum: 1 },
        },
      },
    ]);

    await Accommodation.findByIdAndUpdate(accommodationId, {
      'ratingStats.averageRating': stats ? Number(stats.avgScore.toFixed(1)) : 0,
      'ratingStats.totalReviews': stats ? stats.total : 0,
    });
  }

  if (roomId) {
    const [stats] = await Rating.aggregate([
      {
        $match: {
          roomId: new mongoose.Types.ObjectId(roomId),
          status: 'VISIBLE',
        },
      },
      {
        $group: {
          _id: '$roomId',
          avgScore: { $avg: '$overallScore' },
          total: { $sum: 1 },
        },
      },
    ]);

    await Room.findByIdAndUpdate(roomId, {
      'ratingStats.averageRating': stats ? Number(stats.avgScore.toFixed(1)) : 0,
      'ratingStats.totalReviews': stats ? stats.total : 0,
    });
  }

  if (rentalRoomId) {
    const [stats] = await Rating.aggregate([
      {
        $match: {
          rentalRoomId: new mongoose.Types.ObjectId(rentalRoomId),
          status: 'VISIBLE',
        },
      },
      {
        $group: {
          _id: '$rentalRoomId',
          avgScore: { $avg: '$overallScore' },
          total: { $sum: 1 },
        },
      },
    ]);

    await RentalRoom.findByIdAndUpdate(rentalRoomId, {
      'ratingStats.averageRating': stats ? Number(stats.avgScore.toFixed(1)) : 0,
      'ratingStats.totalReviews': stats ? stats.total : 0,
    });
  }
}

/**
 * Gửi đánh giá mới (khách đã đăng nhập)
 */
export async function createRating(req, res) {
  try {
    const {
      targetType,
      accommodationId,
      roomId,
      roomUnitId,
      rentalRoomId,
      bookingId,
      overallScore,
      criteriaScores,
      title,
      comment,
      images,
    } = req.body;

    const userId = req.user.userId;

    if (!['ACCOMMODATION', 'RENTAL_ROOM'].includes(targetType)) {
      return res.status(400).json({ success: false, message: 'Loại đối tượng đánh giá không hợp lệ.' });
    }

    let staySnapshot = { roomName: '', roomNumber: '', packageName: '' };
    let isVerifiedStay = false;

    // Nếu người dùng truyền bookingId, kiểm tra quyền sở hữu booking và tự động lấy snapshot phòng/gói
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt phòng tương ứng.' });
      }
      if (booking.guestId && booking.guestId.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Bạn không thể đánh giá đơn đặt phòng của người khác.' });
      }
      if (booking.status === 'CANCELLED') {
        return res.status(400).json({ success: false, message: 'Không thể đánh giá đơn đặt phòng đã hủy.' });
      }

      isVerifiedStay = true;
      if (booking.selectedSelection) {
        staySnapshot.roomNumber = booking.selectedSelection.roomNumber || '';
        staySnapshot.packageName = booking.selectedSelection.packageName || '';
      }
    }

    if (targetType === 'ACCOMMODATION') {
      if (!accommodationId) {
        return res.status(400).json({ success: false, message: 'Thiếu accommodationId.' });
      }
      const acc = await Accommodation.findById(accommodationId);
      if (!acc) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy cơ sở lưu trú.' });
      }

      if (roomId) {
        const roomDoc = await Room.findOne({ _id: roomId, accommodationId });
        if (!roomDoc) {
          return res.status(404).json({ success: false, message: 'Hạng phòng không thuộc cơ sở lưu trú này.' });
        }
        staySnapshot.roomName = roomDoc.name;

        if (roomUnitId && !staySnapshot.roomNumber) {
          const unit = roomDoc.roomUnits.id(roomUnitId);
          if (unit) staySnapshot.roomNumber = unit.roomNumber;
        }
      }
    } else {
      if (!rentalRoomId) {
        return res.status(400).json({ success: false, message: 'Thiếu rentalRoomId.' });
      }
      const rental = await RentalRoom.findById(rentalRoomId);
      if (!rental) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy phòng trọ / căn hộ.' });
      }
      staySnapshot.roomName = rental.title;
    }

    const rating = await Rating.create({
      targetType,
      accommodationId: targetType === 'ACCOMMODATION' ? accommodationId : null,
      roomId: targetType === 'ACCOMMODATION' ? roomId || null : null,
      roomUnitId: targetType === 'ACCOMMODATION' ? roomUnitId || null : null,
      rentalRoomId: targetType === 'RENTAL_ROOM' ? rentalRoomId : null,
      bookingId: bookingId || null,
      userId,
      overallScore,
      criteriaScores: criteriaScores || {},
      title: title || '',
      comment,
      images: images || [],
      staySnapshot,
      isVerifiedStay,
    });

    await recalculateRatingStats({
      accommodationId: rating.accommodationId,
      roomId: rating.roomId,
      rentalRoomId: rating.rentalRoomId,
    });

    const populated = await Rating.findById(rating._id).populate('userId', 'fullName');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Bạn đã đánh giá lượt đặt phòng này rồi.' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Lấy danh sách đánh giá + thống kê phân bổ sao (1-5 sao)
 * Query: ?accommodationId=... | ?roomId=... | ?rentalRoomId=... | ?score=5 | ?page=1&limit=10
 */
export async function getRatings(req, res) {
  try {
    const { accommodationId, roomId, rentalRoomId, score, page = 1, limit = 10 } = req.query;
    const filter = { status: 'VISIBLE' };

    if (accommodationId && mongoose.Types.ObjectId.isValid(accommodationId)) {
      filter.accommodationId = new mongoose.Types.ObjectId(accommodationId);
    }
    if (roomId && mongoose.Types.ObjectId.isValid(roomId)) {
      filter.roomId = new mongoose.Types.ObjectId(roomId);
    }
    if (rentalRoomId && mongoose.Types.ObjectId.isValid(rentalRoomId)) {
      filter.rentalRoomId = new mongoose.Types.ObjectId(rentalRoomId);
    }

    const baseMatch = { ...filter };
    if (score) {
      filter.overallScore = Number(score);
    }

    const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));

    const [reviews, total, breakdown] = await Promise.all([
      Rating.find(filter)
        .populate('userId', 'fullName')
        .populate('roomId', 'name roomType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Rating.countDocuments(filter),
      Rating.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: '$overallScore',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumStars = 0;
    let totalAll = 0;
    for (const b of breakdown) {
      starCounts[b._id] = b.count;
      sumStars += b._id * b.count;
      totalAll += b.count;
    }

    res.json({
      success: true,
      summary: {
        averageRating: totalAll > 0 ? Number((sumStars / totalAll).toFixed(1)) : 0,
        totalReviews: totalAll,
        starCounts,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Chủ cơ sở lưu trú (HOST) hoặc ADMIN phản hồi đánh giá
 */
export async function replyToRating(req, res) {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung phản hồi.' });
    }

    const rating = await Rating.findById(req.params.id);
    if (!rating) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
    }

    // Kiểm tra quyền chủ sở hữu nếu là HOST
    if (req.user.role !== 'ADMIN') {
      if (rating.targetType === 'ACCOMMODATION') {
        const acc = await Accommodation.findById(rating.accommodationId);
        if (!acc || acc.hostId.toString() !== req.user.userId) {
          return res.status(403).json({ success: false, message: 'Bạn không có quyền phản hồi đánh giá này.' });
        }
      } else {
        const rental = await RentalRoom.findById(rating.rentalRoomId);
        if (!rental || rental.hostId.toString() !== req.user.userId) {
          return res.status(403).json({ success: false, message: 'Bạn không có quyền phản hồi đánh giá này.' });
        }
      }
    }

    rating.hostReply = {
      content: content.trim(),
      repliedBy: req.user.userId,
      repliedAt: new Date(),
    };
    await rating.save();

    res.json({ success: true, data: rating });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * Người viết đánh giá tự sửa hoặc ADMIN ẩn đánh giá
 */
export async function deleteOrHideRating(req, res) {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
    }

    const isOwner = rating.userId.toString() === req.user.userId;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa/ẩn đánh giá này.' });
    }

    const meta = {
      accommodationId: rating.accommodationId,
      roomId: rating.roomId,
      rentalRoomId: rating.rentalRoomId,
    };

    if (isAdmin && !isOwner) {
      rating.status = 'HIDDEN';
      await rating.save();
    } else {
      await Rating.findByIdAndDelete(req.params.id);
    }

    await recalculateRatingStats(meta);
    res.json({ success: true, message: 'Đã cập nhật trạng thái đánh giá.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}