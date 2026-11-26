import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedAdminRoute() {
  const token = localStorage.getItem('token');
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    user = null;
  }

  if (!token || !user || !['ADMIN', 'HOST'].includes(user.role)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}