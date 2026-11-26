import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'YourSuperSecretJwtKey2024';

/**
 * Middleware xác thực JWT bắt buộc
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để tiếp tục.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  }
}

// Bí danh chuẩn để dùng import { authenticate } ở các route/controller
export const authenticate = authenticateToken;

/**
 * Middleware xác thực JWT tùy chọn (dùng cho khách đặt phòng nhanh không bắt buộc đăng nhập)
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (_) {
      req.user = null;
    }
  }
  next();
}

/**
 * Middleware phân quyền theo vai trò RBAC ('GUEST' | 'HOST' | 'ADMIN')
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này.',
      });
    }
    next();
  };
}

// Bí danh tiện dụng nếu route import { authorize }
export const authorize = authorizeRoles;