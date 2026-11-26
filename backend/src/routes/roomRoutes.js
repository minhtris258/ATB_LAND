import express from 'express';
import {
  getRoomsByAccommodation,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/Auth.js';

const router = express.Router();

// Lấy danh sách hạng phòng của 1 Khách sạn / Resort / Khu trọ
router.get('/accommodations/:accommodationId/rooms', getRoomsByAccommodation);

// Host / Admin thêm, sửa, xóa hạng phòng
router.post(
  '/accommodations/:accommodationId/rooms',
  authenticateToken,
  authorizeRoles('HOST', 'ADMIN'),
  createRoom
);
router.patch('/rooms/:roomId', authenticateToken, authorizeRoles('HOST', 'ADMIN'), updateRoom);
router.delete('/rooms/:roomId', authenticateToken, authorizeRoles('HOST', 'ADMIN'), deleteRoom);

export default router;