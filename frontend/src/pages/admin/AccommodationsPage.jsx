import { useState } from 'react';
import { Plus, Layers, DoorOpen, PackagePlus, CheckCircle, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import { useAsyncData } from '../../hooks/useAsyncData';
import { adminApi } from '../../lib/adminApi';
import { formatVND } from '../../lib/utils';

export default function AccommodationsPage() {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showCreateAcc, setShowCreateAcc] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [pkgTarget, setPkgTarget] = useState(null);

  const [accForm, setAccForm] = useState({
    title: '',
    category: 'HOTEL',
    city: 'Huế',
    district: '',
    addressDetail: '',
    starRating: 4,
    amenityIds: [],
  });

  const [rtForm, setRtForm] = useState({
    name: '',
    roomType: 'DELUXE',
    area: 28,
    roomNumber: '101',
    floor: 1,
    packageName: 'Gói Tiêu Chuẩn',
    billingUnit: 'NIGHT',
    price: 550000,
    includedServices: 'Wifi miễn phí, Nước suối',
  });

  const [pkgForm, setPkgForm] = useState({
    name: '',
    billingUnit: 'NIGHT',
    price: 750000,
    includedServices: 'Ăn sáng, Dọn phòng hằng ngày',
  });

  const { data, loading, reload } = useAsyncData(async () => {
    const q = categoryFilter !== 'ALL' ? `?category=${categoryFilter}` : '';
    const [accRes, amRes] = await Promise.all([
      adminApi.getAccommodations(q),
      adminApi.getAmenities(),
    ]);
    return {
      accommodations: accRes.data || [],
      amenities: amRes.data || [],
    };
  }, [categoryFilter]);

  async function refreshRoomTypes(accId) {
    const res = await adminApi.getRoomTypes(accId);
    setRoomTypes(res.data || []);
  }

  async function handleOpenRooms(acc) {
    setSelectedAcc(acc);
    setPkgTarget(null);
    await refreshRoomTypes(acc._id);
  }

  async function handleCreateAcc(e) {
    e.preventDefault();
    await adminApi.createAccommodation({
      title: accForm.title,
      category: accForm.category,
      location: {
        city: accForm.city,
        district: accForm.district,
        addressDetail: accForm.addressDetail,
      },
      specs: { starRating: Number(accForm.starRating) },
      amenityIds: accForm.amenityIds,
    });
    setShowCreateAcc(false);
    setAccForm({
      title: '',
      category: 'HOTEL',
      city: 'Huế',
      district: '',
      addressDetail: '',
      starRating: 4,
      amenityIds: [],
    });
    reload();
  }

  async function handleCreateRoomType(e) {
    e.preventDefault();
    if (!selectedAcc) return;
    await adminApi.createRoomType(selectedAcc._id, {
      name: rtForm.name,
      roomType: rtForm.roomType,
      area: Number(rtForm.area),
      roomUnits: [
        {
          roomNumber: rtForm.roomNumber,
          floor: Number(rtForm.floor),
          ratePackages: [
            {
              name: rtForm.packageName,
              billingUnit: rtForm.billingUnit,
              price: Number(rtForm.price),
              includedServices: rtForm.includedServices
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
              isDefault: true,
            },
          ],
        },
      ],
    });
    await refreshRoomTypes(selectedAcc._id);
    reload();
  }

  async function handleAddUnit(roomTypeId) {
    const roomNumber = window.prompt('Nhập số phòng mới (VD: 202):');
    if (!roomNumber) return;
    const price = Number(window.prompt('Nhập giá gói tiêu chuẩn (VNĐ):', '600000') || 600000);
    await adminApi.addRoomUnit(roomTypeId, {
      roomNumber: roomNumber.trim(),
      floor: 2,
      ratePackages: [
        {
          name: 'Gói Tiêu Chuẩn',
          billingUnit: 'NIGHT',
          price,
          includedServices: ['Wifi miễn phí', 'Nước suối'],
          isDefault: true,
        },
      ],
    });
    await refreshRoomTypes(selectedAcc._id);
    reload();
  }

  async function handleAddPackage(e) {
    e.preventDefault();
    if (!pkgTarget || !selectedAcc) return;
    await adminApi.addRatePackage(pkgTarget.roomTypeId, pkgTarget.unitId, {
      name: pkgForm.name,
      billingUnit: pkgForm.billingUnit,
      price: Number(pkgForm.price),
      includedServices: pkgForm.includedServices
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setPkgTarget(null);
    await refreshRoomTypes(selectedAcc._id);
    reload();
  }

  const columns = [
    {
      header: 'Cơ sở lưu trú',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.title}</div>
          <div className="text-xs text-slate-500">
            Hạng phòng: {(row.availableRoomTypes || []).join(', ') || 'Chưa có'}
          </div>
        </div>
      ),
    },
    {
      header: 'Loại',
      render: (row) => `${row.category} • ${row.specs?.starRating || 4}★`,
    },
    {
      header: 'Khu vực',
      render: (row) => `${row.location?.district}, ${row.location?.city}`,
    },
    {
      header: 'Giá / Quỹ phòng',
      render: (row) => (
        <div>
          <div className="font-semibold text-blue-600">
            {formatVND(row.pricing?.minNightlyPrice)}/đêm
          </div>
          <div className="text-xs text-slate-500">{row.specs?.totalRoomsCount || 0} phòng</div>
        </div>
      ),
    },
    {
      header: 'Trạng thái',
      render: (row) => (
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {row.status}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="px-2.5 py-1.5 text-xs" onClick={() => handleOpenRooms(row)}>
            <Layers size={14} /> Hạng & Gói
          </Button>
          {row.status !== 'ACTIVE' ? (
            <Button
              variant="success"
              className="px-2.5 py-1.5 text-xs"
              onClick={async () => {
                await adminApi.updateAccommodationStatus(row._id, 'ACTIVE');
                reload();
              }}
            >
              <CheckCircle size={14} /> Duyệt
            </Button>
          ) : (
            <Button
              variant="danger"
              className="px-2.5 py-1.5 text-xs"
              onClick={async () => {
                await adminApi.updateAccommodationStatus(row._id, 'INACTIVE');
                reload();
              }}
            >
              <EyeOff size={14} /> Ẩn
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Khách sạn & Resort</h1>
          <p className="text-sm text-slate-500">Hạng phòng → Nhiều phòng cụ thể → Nhiều gói giá & dịch vụ</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="ALL">Tất cả</option>
            <option value="HOTEL">HOTEL</option>
            <option value="RESORT">RESORT</option>
          </select>
          <Button onClick={() => setShowCreateAcc((v) => !v)}>
            <Plus size={16} /> Thêm cơ sở
          </Button>
        </div>
      </div>

      {showCreateAcc && (
        <form
          onSubmit={handleCreateAcc}
          className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-3"
        >
          <input
            required
            placeholder="Tên khách sạn / resort"
            value={accForm.title}
            onChange={(e) => setAccForm({ ...accForm, title: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={accForm.category}
            onChange={(e) => setAccForm({ ...accForm, category: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="HOTEL">HOTEL</option>
            <option value="RESORT">RESORT</option>
          </select>
          <input
            type="number"
            min="1"
            max="5"
            value={accForm.starRating}
            onChange={(e) => setAccForm({ ...accForm, starRating: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Thành phố"
            value={accForm.city}
            onChange={(e) => setAccForm({ ...accForm, city: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Quận / Huyện"
            value={accForm.district}
            onChange={(e) => setAccForm({ ...accForm, district: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Địa chỉ chi tiết"
            value={accForm.addressDetail}
            onChange={(e) => setAccForm({ ...accForm, addressDetail: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2 md:col-span-3">
            {(data?.amenities || []).map((am) => {
              const checked = accForm.amenityIds.includes(am._id);
              return (
                <button
                  type="button"
                  key={am._id}
                  onClick={() =>
                    setAccForm({
                      ...accForm,
                      amenityIds: checked
                        ? accForm.amenityIds.filter((id) => id !== am._id)
                        : [...accForm.amenityIds, am._id],
                    })
                  }
                  className={`rounded-full border px-3 py-1 text-xs ${
                    checked ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {am.name}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 md:col-span-3">
            <Button type="button" variant="secondary" onClick={() => setShowCreateAcc(false)}>
              Hủy
            </Button>
            <Button type="submit">Lưu cơ sở</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400">
          Đang tải...
        </div>
      ) : (
        <DataTable columns={columns} data={data?.accommodations || []} />
      )}

      {selectedAcc && (
        <div className="space-y-4 rounded-xl border border-indigo-200 bg-indigo-50/40 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Hạng phòng & Gói giá: {selectedAcc.title}</h2>
            <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setSelectedAcc(null)}>
              Đóng
            </Button>
          </div>

          <form
            onSubmit={handleCreateRoomType}
            className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4"
          >
            <input
              required
              placeholder="Tên hạng phòng"
              value={rtForm.name}
              onChange={(e) => setRtForm({ ...rtForm, name: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={rtForm.roomType}
              onChange={(e) => setRtForm({ ...rtForm, roomType: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {['STANDARD', 'SUPERIOR', 'DELUXE', 'EXECUTIVE', 'SUITE', 'VILLA', 'BUNGALOW'].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              required
              placeholder="Số phòng (VD: 101)"
              value={rtForm.roomNumber}
              onChange={(e) => setRtForm({ ...rtForm, roomNumber: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              required
              placeholder="Giá gói (VNĐ)"
              value={rtForm.price}
              onChange={(e) => setRtForm({ ...rtForm, price: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Tên gói giá"
              value={rtForm.packageName}
              onChange={(e) => setRtForm({ ...rtForm, packageName: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={rtForm.billingUnit}
              onChange={(e) => setRtForm({ ...rtForm, billingUnit: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="NIGHT">NIGHT</option>
              <option value="MONTH">MONTH</option>
              <option value="HOUR">HOUR</option>
            </select>
            <input
              placeholder="Dịch vụ kèm theo (cách nhau dấu phẩy)"
              value={rtForm.includedServices}
              onChange={(e) => setRtForm({ ...rtForm, includedServices: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <Button type="submit">
              <Plus size={16} /> Thêm hạng phòng
            </Button>
          </form>

          <div className="space-y-3">
            {roomTypes.map((rt) => (
              <div key={rt._id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="font-bold text-slate-900">
                    {rt.name} <span className="text-xs font-normal text-slate-500">({rt.roomType})</span>
                  </div>
                  <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => handleAddUnit(rt._id)}>
                    <DoorOpen size={14} /> Thêm phòng
                  </Button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {(rt.roomUnits || []).map((unit) => (
                    <div key={unit._id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">Phòng {unit.roomNumber}</span>
                        <button
                          type="button"
                          onClick={() => setPkgTarget({ roomTypeId: rt._id, unitId: unit._id })}
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
                        >
                          <PackagePlus size={14} /> Thêm gói
                        </button>
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {(unit.ratePackages || []).map((pkg) => (
                          <div key={pkg._id} className="rounded border border-slate-200 bg-white p-2 text-xs">
                            <div className="flex justify-between font-semibold">
                              <span>{pkg.name}</span>
                              <span className="text-emerald-700">
                                {formatVND(pkg.price)}/{pkg.billingUnit}
                              </span>
                            </div>
                            {pkg.includedServices?.length > 0 && (
                              <div className="mt-0.5 text-slate-500">{pkg.includedServices.join(' • ')}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {pkgTarget && (
            <form onSubmit={handleAddPackage} className="grid grid-cols-1 gap-3 rounded-lg bg-white p-4 md:grid-cols-4">
              <input
                required
                placeholder="Tên gói mới"
                value={pkgForm.name}
                onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                required
                placeholder="Giá gói"
                value={pkgForm.price}
                onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Dịch vụ kèm theo"
                value={pkgForm.includedServices}
                onChange={(e) => setPkgForm({ ...pkgForm, includedServices: e.target.value })}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <Button type="submit" variant="success">
                Lưu gói giá
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}