import express from 'express';
import {
  getRentalRooms,
  getRentalRoomDetail,
  createRentalRoom,
  updateRentalRoom,
} from '../controllers/rentalRoomController.js';
import { authenticateToken, authorizeRoles } from '../middlewares/Auth.js';

const router = express.Router();

router.get('/rental-rooms', getRentalRooms);
router.get('/rental-rooms/:idOrSlug', getRentalRoomDetail);
router.post('/rental-rooms', authenticateToken, authorizeRoles('HOST', 'ADMIN'), createRentalRoom);
router.patch('/rental-rooms/:id', authenticateToken, authorizeRoles('HOST', 'ADMIN'), updateRentalRoom);

export default router;  