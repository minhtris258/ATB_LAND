import { Router } from 'express';
import {
  getRoomTypesByAccommodation,
  createRoomType,
  updateRoomType,
  addRoomUnitToRoomType,
  addRatePackageToUnit,
  deleteRoomType,
} from '../controllers/roomTypeController.js';
import { authenticate, authorize } from '../middlewares/Auth.js';

const router = Router();

// Lấy danh sách hạng phòng (kèm phòng cụ thể & các gói giá/dịch vụ) theo cơ sở lưu trú
router.get('/accommodations/:accommodationId/room-types', getRoomTypesByAccommodation);

// Tạo hạng phòng mới (kèm danh sách phòng `roomUnits` & gói giá `ratePackages`)
router.post(
  '/accommodations/:accommodationId/room-types',
  authenticate,
  authorize('HOST', 'ADMIN'),
  createRoomType
);

// Cập nhật / xóa hạng phòng
router.patch('/room-types/:roomTypeId', authenticate, authorize('HOST', 'ADMIN'), updateRoomType);
router.delete('/room-types/:roomTypeId', authenticate, authorize('HOST', 'ADMIN'), deleteRoomType);

// Thêm 1 phòng cụ thể (VD: P.203) vào hạng phòng
router.post(
  '/room-types/:roomTypeId/units',
  authenticate,
  authorize('HOST', 'ADMIN'),
  addRoomUnitToRoomType
);

// Thêm 1 gói giá & dịch vụ kèm theo mới cho 1 phòng cụ thể trong hạng phòng
router.post(
  '/room-types/:roomTypeId/units/:unitId/packages',
  authenticate,
  authorize('HOST', 'ADMIN'),
  addRatePackageToUnit
);

export default router;