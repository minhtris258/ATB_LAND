import { useNavigate } from 'react-router-dom';
import { Menu, ShieldCheck, LogOut } from 'lucide-react';

export default function Header({ onMobileMenuClick }) {
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  const displayName = user?.fullName || 'AdminATB';
  const initial = displayName.charAt(0).toUpperCase();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      <button
        onClick={onMobileMenuClick}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Mở menu"
      >
        <Menu size={22} />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 sm:inline-flex">
          <ShieldCheck size={14} />
          {user?.role || 'ADMIN'}
        </span>

        <span className="text-sm font-medium text-slate-700">{displayName}</span>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          {initial}
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-red-600"
          title="Đăng xuất"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}