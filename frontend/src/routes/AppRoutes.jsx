import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedAdminRoute from '../components/auth/ProtectedAdminRoute';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import AccommodationsPage from '../pages/admin/AccommodationsPage';
import RentalRoomsPage from '../pages/admin/RentalRoomsPage';
import AmenitiesPage from '../pages/admin/AmenitiesPage';
import BookingsPage from '../pages/admin/BookingsPage';
import RatingsPage from '../pages/admin/RatingsPage';

// import ui
import Home from '../pages/Home';
import RoomsPage from '../pages/RoomsPage';
import GuesthousesPage from '../pages/GuesthousesPage';


export default function AppRoutes() {
  return (
    <Routes>
      {/* Trang chủ khi truy cập "/" lần đầu */}
      <Route path="/" element={<Home />} />
      <Route path="/nha-nghi" element={<GuesthousesPage />} />
      <Route path="/phong-tro" element={<RoomsPage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="accommodations" element={<AccommodationsPage />} />
          <Route path="rental-rooms" element={<RentalRoomsPage />} />
          <Route path="amenities" element={<AmenitiesPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="ratings" element={<RatingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<div className="p-8 text-center">404 - Không tìm thấy trang</div>} />
    </Routes>
  );
}