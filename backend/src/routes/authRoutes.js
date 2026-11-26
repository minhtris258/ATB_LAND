import express from 'express';
import { register, login, toggleSavedListing } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/Auth.js';

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/users/saved/:accommodationId', authenticateToken, toggleSavedListing);

export default router;