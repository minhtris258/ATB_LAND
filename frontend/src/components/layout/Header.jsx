import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoAtbLand from '../../assets/logo-atb-land.jpg';


export default function Header({ onOpenAuthModal, onOpenPostRoomGuide }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenAuth = () => {
    setMobileMenuOpen(false);
    if (typeof onOpenAuthModal === 'function') {
      onOpenAuthModal();
    }
  };

  const handleOpenPostGuide = () => {
    setMobileMenuOpen(false);
    if (typeof onOpenPostRoomGuide === 'function') {
      onOpenPostRoomGuide();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo ATB LAND */}
        <Link to="/" className="flex items-center gap-2.5 group">
            <img
                src={logoAtbLand}
                alt="Logo ATB LAND"
                className="w-30 h-auto object-cover  transition"
            />
        </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link to="/phong-tro" className="hover:text-accent-600 transition py-2 text-base">
                Phòng Trọ
            </Link>
            <Link to="/nha-nghi" className="hover:text-accent-600 transition py-2 text-base">
                Nhà Nghỉ
            </Link>
            <a href="#" className="hover:text-accent-600 transition py-2 text-base">
              Homestay
            </a>
            <a href="#" className="hover:text-accent-600 transition py-2 text-base">
              Thành Phố Du Lịch
            </a>
            <a href="#" className="hover:text-accent-600 transition py-2 text-base">
              Booking Tự Động
            </a>
            <a href="#" className="hover:text-accent-600 transition py-2 text-base">
              Quy chế &amp; Pháp lý
            </a>
          </nav>

          {/* Nút hành động bên phải */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAuth}
              className="px-3.5 py-2 text-sm  bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition"
            >
              Đăng nhập 
            </button>
            /
            <button
              type="button"
              onClick={handleOpenAuth}
              className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-accent-600 rounded-xl hover:bg-slate-100 transition"
            >
                Đăng ký
            </button>
          </div>

          {/* Nút menu Mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2">
          <Link to="/phong-tro" className="hover:text-accent-600 transition py-2 text-base">
                Phòng Trọ
            </Link>
          <a
            href="#toa-nha-noi-bat"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-600"
          >
            Tòa nhà nổi bật
          </a>
          <a
            href="#danh-cho-chu-tro"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-600"
          >
            Dành cho Chủ trọ
          </a>
          <a
            href="#cam-ket-phap-ly"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-600"
          >
            Quy chế &amp; Pháp lý
          </a>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleOpenAuth}
              className="w-full py-2.5 px-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Đăng nhập / Đăng ký
            </button>
            <button
              type="button"
              onClick={handleOpenPostGuide}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-accent-500 hover:bg-accent-600 rounded-xl transition"
            >
              Đăng tin cho thuê
            </button>
          </div>
        </div>
      )}
    </header>
  );
}