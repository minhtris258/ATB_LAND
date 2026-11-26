const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Lỗi HTTP ${res.status}`);
  }
  return data;
}

export const adminApi = {
  // Khách sạn & Resort (Accommodation)
  getAccommodations: (params = '') => request(`/accommodations${params}`),
  createAccommodation: (body) =>
    request('/accommodations', { method: 'POST', body: JSON.stringify(body) }),
  updateAccommodationStatus: (id, status) =>
    request(`/accommodations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Hạng phòng (Room) -> Phòng vật lý (roomUnits) -> Gói giá (ratePackages)
  getRoomTypes: (accId) => request(`/accommodations/${accId}/room-types`),
  createRoomType: (accId, body) =>
    request(`/accommodations/${accId}/room-types`, { method: 'POST', body: JSON.stringify(body) }),
  addRoomUnit: (roomTypeId, body) =>
    request(`/room-types/${roomTypeId}/units`, { method: 'POST', body: JSON.stringify(body) }),
  addRatePackage: (roomTypeId, unitId, body) =>
    request(`/room-types/${roomTypeId}/units/${unitId}/packages`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Phòng trọ & Căn hộ (RentalRoom)
  getRentalRooms: (params = '') => request(`/rental-rooms${params}`),
  createRentalRoom: (body) =>
    request('/rental-rooms', { method: 'POST', body: JSON.stringify(body) }),
  updateRentalRoom: (id, body) =>
    request(`/rental-rooms/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Tiện ích dùng chung (Amenity)
  getAmenities: (params = '') => request(`/amenities${params}`),
  createAmenity: (body) => request('/amenities', { method: 'POST', body: JSON.stringify(body) }),
  updateAmenity: (id, body) =>
    request(`/amenities/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Đặt phòng & Lịch xem phòng (Booking)
  getBookings: (params = '') => request(`/bookings${params}`),

  // Đánh giá & Phản hồi (Rating)
  getRatings: (params = '') => request(`/ratings${params}`),
  replyRating: (id, content) =>
    request(`/ratings/${id}/reply`, { method: 'POST', body: JSON.stringify({ content }) }),
  deleteOrHideRating: (id) => request(`/ratings/${id}`, { method: 'DELETE' }),
};