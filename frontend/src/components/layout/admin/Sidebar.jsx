import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  House,
  Sparkles,
  Star,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const MENU_ITEMS = [
  { label: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
  { label: 'Khách sạn & Resort', path: '/admin/accommodations', icon: Building2 },
  { label: 'Phòng trọ & Căn hộ', path: '/admin/rental-rooms', icon: House },
  { label: 'Tiện ích & Dịch vụ', path: '/admin/amenities', icon: Sparkles },
  { label: 'Đặt phòng & Lịch hẹn', path: '/admin/bookings', icon: CalendarCheck },
  { label: 'Đánh giá & Phản hồi', path: '/admin/ratings', icon: Star },
];

export default function Sidebar({
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) {
  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:static lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'lg:w-20' : 'w-64'
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center border-b border-slate-200 px-4',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!isCollapsed && (
            <span className="truncate text-lg font-bold tracking-tight text-blue-600">
              ATB LAND ADMIN
            </span>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:flex"
            title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 p-3">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isCollapsed ? 'justify-center' : 'gap-3',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
              >
                <Icon size={20} className="shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}