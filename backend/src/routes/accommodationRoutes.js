import { Router } from 'express';
import {
  getAccommodations,
  getAccommodationDetail,
  createAccommodation,
  reportAccommodation,
  updateAccommodationStatus,
} from '../controllers/accommodationController.js';
import { authenticate, authorize } from '../middlewares/Auth.js';

const router = Router();

// Public
router.get('/accommodations', getAccommodations);
router.get('/accommodations/:idOrSlug', getAccommodationDetail);
router.post('/accommodations/:id/report', reportAccommodation);

// Host / Admin
router.post('/accommodations', authenticate, authorize('HOST', 'ADMIN'), createAccommodation);
router.patch('/accommodations/:id/status', authenticate, authorize('ADMIN'), updateAccommodationStatus);

export default router;