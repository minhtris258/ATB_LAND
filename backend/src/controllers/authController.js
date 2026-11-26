import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../middlewares/Auth.js';

/**
 * Đăng ký tài khoản mới (GUEST hoặc HOST)
 */
export async function register(req, res) {
  try {
    const { fullName, email, phone, password, role } = req.body;
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email đã được sử dụng.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const safeRole = role === 'HOST' ? 'HOST' : 'GUEST';

    const user = await User.create({
      fullName,
      email,
      phone,
      passwordHash,
      role: safeRole,
    });

    const token = jwt.sign({ userId: user._id, role: user.role, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Đăng nhập hệ thống
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        hostProfile: user.hostProfile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Lưu / Bỏ lưu chỗ ở yêu thích của người dùng
 */
export async function toggleSavedListing(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    const targetId = req.params.accommodationId;
    const exists = user.savedListings.some((id) => id.toString() === targetId);

    if (exists) {
      user.savedListings = user.savedListings.filter((id) => id.toString() !== targetId);
    } else {
      user.savedListings.push(targetId);
    }
    await user.save();

    res.json({ success: true, saved: !exists, savedListings: user.savedListings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}