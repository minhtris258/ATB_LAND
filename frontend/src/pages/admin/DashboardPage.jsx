import { Building2, House, Sparkles, Star, CalendarCheck } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { adminApi } from '../../lib/adminApi';

export default function DashboardPage() {
  const { data, loading, error } = useAsyncData(async () => {
    const [acc, rental, amenities, bookings, ratings] = await Promise.all([
      adminApi.getAccommodations(),
      adminApi.getRentalRooms(),
      adminApi.getAmenities(),
      adminApi.getBookings(),
      adminApi.getRatings(),
    ]);
    return {
      accommodationsCount: acc.total ?? acc.data?.length ?? 0,
      rentalRoomsCount: rental.total ?? rental.data?.length ?? 0,
      amenitiesCount: amenities.total ?? amenities.data?.length ?? 0,
      bookingsCount: bookings.data?.length ?? 0,
      avgRating: ratings.summary?.averageRating ?? 0,
      totalReviews: ratings.summary?.totalReviews ?? 0,
    };
  }, []);

  if (error) {
    return <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống ATB LAND</h1>
        <p className="text-sm text-slate-500">Theo dõi nhanh cơ sở lưu trú, phòng cho thuê, đặt lịch và đánh giá</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Khách sạn & Resort"
          value={loading ? '...' : data?.accommodationsCount}
          subtitle="Cơ sở đang hiển thị"
          icon={<Building2 size={20} />}
        />
        <StatCard
          title="Phòng trọ & Căn hộ"
          value={loading ? '...' : data?.rentalRoomsCount}
          subtitle="Tin cho thuê dài hạn"
          icon={<House size={20} />}
        />
        <StatCard
          title="Đơn đặt & Lịch xem"
          value={loading ? '...' : data?.bookingsCount}
          subtitle="STAY & VIEWING"
          icon={<CalendarCheck size={20} />}
        />
        <StatCard
          title="Điểm đánh giá TB"
          value={loading ? '...' : `${data?.avgRating} ★`}
          subtitle={`${data?.totalReviews ?? 0} lượt đánh giá • ${data?.amenitiesCount ?? 0} tiện ích`}
          icon={<Star size={20} />}
        />
      </div>
    </div>
  );
}