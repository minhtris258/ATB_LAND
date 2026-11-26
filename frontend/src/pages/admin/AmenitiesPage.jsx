import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import { useAsyncData } from '../../hooks/useAsyncData';
import { adminApi } from '../../lib/adminApi';

export default function AmenitiesPage() {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Sparkles');
  const [group, setGroup] = useState('BASIC');

  const { data, loading, reload } = useAsyncData(async () => {
    const res = await adminApi.getAmenities();
    return res.data || [];
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await adminApi.createAmenity({
      name: name.trim(),
      icon,
      group,
      applicableTo: ['RENTAL_ROOM', 'ACCOMMODATION', 'HOTEL_ROOM'],
    });
    setName('');
    reload();
  }

  const columns = [
    { header: 'Tên tiện ích', accessor: 'name' },
    { header: 'Icon', accessor: 'icon' },
    { header: 'Nhóm', accessor: 'group' },
    {
      header: 'Thao tác',
      render: (row) => (
        <Button
          variant="secondary"
          className="px-2.5 py-1 text-xs"
          onClick={async () => {
            await adminApi.updateAmenity(row._id, { isActive: !row.isActive });
            reload();
          }}
        >
          {row.isActive ? 'Tạm tắt' : 'Bật lại'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Quản lý Tiện ích & Dịch vụ</h1>

      <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <input required placeholder="Tên tiện ích (VD: Buffet sáng)" value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input placeholder="Tên icon Lucide" value={icon} onChange={(e) => setIcon(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <select value={group} onChange={(e) => setGroup(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="BASIC">BASIC</option>
          <option value="FURNITURE">FURNITURE</option>
          <option value="RESORT_SERVICE">RESORT_SERVICE</option>
          <option value="SECURITY">SECURITY</option>
          <option value="ADDON_PACKAGE">ADDON_PACKAGE</option>
        </select>
        <Button type="submit">
          <Plus size={16} /> Thêm tiện ích
        </Button>
      </form>

      {loading ? <div className="p-8 text-center text-slate-400">Đang tải...</div> : <DataTable columns={columns} data={data || []} />}
    </div>
  );
}