import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Nếu đã đăng nhập hợp lệ thì chuyển thẳng vào /admin
  const existingToken = localStorage.getItem('token');
  const existingUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  if (existingToken && existingUser && ['ADMIN', 'HOST'].includes(existingUser.role)) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Đăng nhập thất bại.');
      }

      if (!['ADMIN', 'HOST'].includes(data.user?.role)) {
        throw new Error('Tài khoản này không có quyền truy cập trang quản trị.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Không thể kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* Logo & Tiêu đề */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Building2 size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">ATB LAND — Quản Trị Hệ Thống</h1>
          <p className="mt-1 text-sm text-slate-500">Đăng nhập bằng tài khoản Admin hoặc Chủ cơ sở</p>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@atbland.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu</label>
            <div className="relative">
              <Lock
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full py-2.5">
            <LogIn size={18} />
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập quản trị'}
          </Button>
        </form>
      </div>
    </div>
  );
}