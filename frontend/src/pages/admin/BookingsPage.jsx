import { useState } from 'react';
import { Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import { useAsyncData } from '../../hooks/useAsyncData';
import { adminApi } from '../../lib/adminApi';
import { formatDateVN, formatVND } from '../../lib/utils';

export default function BookingsPage() {
  const [phone, setPhone] = useState('');
  const [submittedPhone, setSubmittedPhone] = useState('');

  const { data, loading } = useAsyncData(async () => {
    const q = submittedPhone ? `?phone=${encodeURIComponent(submittedPhone)}` : '';
    const res = await adminApi.getBookings(q);
    return res.data || [];
  }, [submittedPhone]);

  const columns = [
    { header: 'Mã đơn', accessor: 'bookingCode' },
    {
      header: 'Khách hàng',
      render: (row) => `${row.guestInfo?.fullName || ''} (${row.guestInfo?.phone || ''})`,
    },
    {
      header: 'Phòng & Gói đã chọn',
      render: (row) =>
        row.bookingType === 'STAY'
          ? `Phòng ${row.selectedSelection?.roomNumber || '—'} • ${row.selectedSelection?.packageName || '—'}`
          : 'Lịch hẹn xem phòng',
    },
    {
      header: 'Thời gian',
      render: (row) =>
        row.bookingType === 'STAY'
          ? `${formatDateVN(row.staySchedule?.checkInDate)} → ${formatDateVN(row.staySchedule?.checkOutDate)}`
          : formatDateVN(row.viewingSchedule?.appointmentTime),
    },
    {
      header: 'Tổng dự kiến',
      render: (row) =>
        row.bookingType === 'STAY' ? formatVND(row.staySchedule?.estimatedTotal) : 'Miễn phí',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Đặt phòng & Lịch hẹn</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedPhone(phone.trim());
          }}
          className="flex gap-2"
        >
          <input
            placeholder="Tra cứu theo SĐT..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <Button type="submit">
            <Search size={16} /> Tìm
          </Button>
        </form>
      </div>

      {loading ? <div className="p-8 text-center text-slate-400">Đang tải...</div> : <DataTable columns={columns} data={data || []} />}
    </div>
  );
}