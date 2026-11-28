import { useMemo } from 'react';

export const DISTRICTS_BY_CITY = {
  'Hà Nội': ['Cầu Giấy', 'Đống Đa', 'Tây Hồ', 'Hoàn Kiếm', 'Ba Đình'],
  'TP. Hồ Chí Minh': ['Bình Thạnh', 'Quận 1', 'TP. Thủ Đức', 'Quận 7', 'Phú Nhuận'],
  'Huế': ['Thuận Hóa', 'Phú Xuân', 'Vỹ Dạ', 'Lăng Cô', 'Thuận An', 'Khe Tre'],
};

export const DEFAULT_AMENITIES = [
  'Điều hòa',
  'Wifi',
  'Bể bơi',
  'Bãi đỗ xe',
  'Ban công',
  'Ăn sáng',
];

export default function SearchFilterForm({
  city = 'ALL',
  onCityChange,
  district = 'ALL',
  onDistrictChange,
  availableDistricts,
  priceRange = 'ALL',
  onPriceRangeChange,
  selectedAmenities = [],
  onToggleAmenity,
  amenitiesList = DEFAULT_AMENITIES,
  onResetFilters,
  onSearchSubmit,
  submitLabel = 'Tìm chỗ ở phù hợp',
  showAmenities = true,
}) {
  // Nếu trang gọi không truyền availableDistricts, tự suy ra theo city
  const districts = useMemo(() => {
    if (Array.isArray(availableDistricts)) return availableDistricts;
    if (city === 'ALL') return Object.values(DISTRICTS_BY_CITY).flat();
    return DISTRICTS_BY_CITY[city] || [];
  }, [availableDistricts, city]);

  const handleCitySelect = (e) => {
    const nextCity = e.target.value;
    if (typeof onCityChange === 'function') {
      // Hỗ trợ cả kiểu truyền hàm nhận event hoặc nhận string
      onCityChange.length > 0 ? onCityChange(e) : onCityChange(nextCity);
    }
    if (typeof onDistrictChange === 'function') {
      onDistrictChange('ALL');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSearchSubmit === 'function') {
      onSearchSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label
            htmlFor="filter-city"
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Thành phố
          </label>
          <select
            id="filter-city"
            value={city}
            onChange={handleCitySelect}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-accent-600 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition"
          >
            <option value="ALL">Tất cả thành phố</option>
            {Object.keys(DISTRICTS_BY_CITY).map((cityName) => (
              <option key={cityName} value={cityName}>
                {cityName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-district"
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Quận / Khu vực
          </label>
          <select
            id="filter-district"
            value={district}
            onChange={(e) => onDistrictChange?.(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-accent-600 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition"
          >
            <option value="ALL">Tất cả Quận / Khu vực</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-price"
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Khoảng giá
          </label>
          <select
            id="filter-price"
            value={priceRange}
            onChange={(e) => onPriceRangeChange?.(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-accent-600 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition"
          >
            <option value="ALL">Mọi mức giá</option>
            <option value="UNDER_2M">Dưới 2 triệu</option>
            <option value="2M_TO_4M">2 - 4 triệu</option>
            <option value="4M_TO_6M">4 - 6 triệu</option>
            <option value="OVER_6M">Trên 6 triệu</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.5 5.5a7.5 7.5 0 0011.15 11.15z"
              />
            </svg>
            {submitLabel}
          </button>
        </div>
      </div>

      {/* Bộ lọc tiện ích */}
      {showAmenities && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              Tiện ích:
            </span>
            {amenitiesList.map((am) => {
              const active = selectedAmenities.includes(am);
              return (
                <button
                  key={am}
                  type="button"
                  onClick={() => onToggleAmenity?.(am)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    active
                      ? 'bg-accent-600 text-white border-accent-600'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-500'
                  }`}
                >
                  {am}
                </button>
              );
            })}
          </div>

          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-accent-600 underline self-start md:self-auto"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      )}
    </form>
  );
}