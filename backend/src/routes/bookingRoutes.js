import { Router } from 'express';
import { getAvailability, createBooking, getBookings } from '../controllers/bookingController.js';
import { optionalAuth, authenticate } from '../middlewares/Auth.js';

const router = Router();

router.get('/availability', getAvailability);
router.post('/', optionalAuth, createBooking);
router.get('/', optionalAuth, getBookings);

export default router;