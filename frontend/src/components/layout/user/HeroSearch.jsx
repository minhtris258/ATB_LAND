import SearchFilterForm from '../../ui/SearchFilterForm';

const AMENITIES = ['Điều hòa', 'Wifi', 'Bể bơi', 'Bãi đỗ xe', 'Ban công', 'Ăn sáng'];


export default function HeroSearch({
  totalListings = 0,
  category,
  onCategoryChange,
  city,
  onCityChange,
  district,
  onDistrictChange,
  availableDistricts = [],
  priceRange,
  onPriceRangeChange,
  selectedAmenities = [],
  onToggleAmenity,
  onResetFilters,
  onSearchSubmit,
}) {
  const categoryTabs = [
    { key: 'ALL', label: `Tất cả (${totalListings})` },
    { key: 'ROOM', label: 'Phòng trọ & Căn hộ' },
    { key: 'HOTEL', label: 'Khách sạn' },
    { key: 'RESORT', label: 'Resort' },
  ];

  return (
    <section
      id="trang-chu"
      className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-accent-600 pt-10 pb-16 sm:pt-14 sm:pb-20 overflow-hidden"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold tracking-wide mb-4 border border-white/20 text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Không thu cọc trực tuyến • Xác thực chính chủ 100%
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            ĐẶT PHÒNG TIỆN LỢI, MINH BẠCH CÙNG ATB LAND
          </h1>
          <p className="mt-3.5 text-base sm:text-lg text-teal-100 max-w-2xl mx-auto">
            Khám phá không gian lưu trú tại mọi địa điểm. Ảnh thực tế, đặt lịch hẹn - xem phòng - giữ phòng không cần đặt cọc trước.
          </p>
        </div>

        <div className="bg-white text-slate-800 rounded-3xl shadow-2xl p-4 sm:p-6 border border-slate-100">
          {/* Tab phân loại chỗ ở */}
          <div
            className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-slate-100"
            role="tablist"
          >
            {categoryTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onCategoryChange(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  category === tab.key
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-accent-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

            {/* form tìm kiếm */}
            <SearchFilterForm
                city={city}
                onCityChange={onCityChange}
                district={district}
                onDistrictChange={onDistrictChange}
                availableDistricts={availableDistricts}
                priceRange={priceRange}
                onPriceRangeChange={onPriceRangeChange}
                selectedAmenities={selectedAmenities}
                onToggleAmenity={onToggleAmenity}
                onResetFilters={onResetFilters}
                onSearchSubmit={onSearchSubmit}
            />
        </div>
      </div>
    </section>
  );
}