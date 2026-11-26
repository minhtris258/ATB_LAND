import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import { useAsyncData } from '../../hooks/useAsyncData';
import { adminApi } from '../../lib/adminApi';
import { formatVND } from '../../lib/utils';

export default function RentalRoomsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    roomType: 'STUDIO',
    city: 'Huế',
    district: '',
    addressDetail: '',
    monthlyRent: 3000000,
    area: 25,
    availableRooms: 1,
  });

  const { data, loading, reload } = useAsyncData(async () => {
    const res = await adminApi.getRentalRooms();
    return res.data || [];
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    await adminApi.createRentalRoom({
      title: form.title,
      roomType: form.roomType,
      location: { city: form.city, district: form.district, addressDetail: form.addressDetail },
      pricing: { monthlyRent: Number(form.monthlyRent) },
      specs: { area: Number(form.area), availableRooms: Number(form.availableRooms) },
    });
    setShowForm(false);
    reload();
  }

  const columns = [
    {
      header: 'Phòng trọ / Căn hộ',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.title}</div>
          <div className="text-xs text-slate-500">{row.roomType}</div>
        </div>
      ),
    },
    { header: 'Khu vực', render: (row) => `${row.location?.district}, ${row.location?.city}` },
    { header: 'Giá thuê', render: (row) => `${formatVND(row.pricing?.monthlyRent)}/tháng` },
    { header: 'Trống', render: (row) => `${row.specs?.availableRooms ?? 0} phòng` },
    {
      header: 'Thao tác',
      render: (row) => (
        <Button
          variant="secondary"
          className="px-2.5 py-1 text-xs"
          onClick={async () => {
            await adminApi.updateRentalRoom(row._id, {
              status: row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
            });
            reload();
          }}
        >
          {row.status === 'ACTIVE' ? 'Ẩn tin' : 'Kích hoạt'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Phòng trọ & Căn hộ</h1>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} /> Đăng phòng trọ
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-3">
          <input required placeholder="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input required placeholder="Quận/Huyện" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input required placeholder="Địa chỉ" value={form.addressDetail} onChange={(e) => setForm({ ...form, addressDetail: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input type="number" required placeholder="Giá/tháng" value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <input type="number" required placeholder="Diện tích (m²)" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <Button type="submit">Lưu phòng trọ</Button>
        </form>
      )}

      {loading ? <div className="p-8 text-center text-slate-400">Đang tải...</div> : <DataTable columns={columns} data={data || []} />}
    </div>
  );
}