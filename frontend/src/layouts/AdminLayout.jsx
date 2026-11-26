import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/admin/Sidebar';
import Header from '../components/layout/admin/Header';
import { useSidebar } from '../hooks/useSidebar';

export default function AdminLayout() {
  const {
    isMobileOpen,
    toggleMobile,
    closeMobile,
    isCollapsed,
    toggleCollapse,
  } = useSidebar();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMobileMenuClick={toggleMobile} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}