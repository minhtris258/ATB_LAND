import express from 'express';
import { getAmenities, createAmenity, updateAmenity } from '../controllers/amenityController.js';

import { authenticateToken, authorizeRoles } from '../middlewares/Auth.js';

const router = express.Router();

router.get('/amenities', getAmenities);
router.post('/amenities', authenticateToken, authorizeRoles('ADMIN'), createAmenity);
router.patch('/amenities/:id', authenticateToken, authorizeRoles('ADMIN'), updateAmenity);

export default router;