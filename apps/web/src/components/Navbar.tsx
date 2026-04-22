import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentSearch = searchParams.get('search') || '';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartItemsCount = useCartStore((state) => state.totalItems());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-md shadow-sm py-2' 
        : 'bg-white py-4'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between gap-8 h-12">
          
          {/* Logo Estilizado */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-1 group">
            <span className="text-2xl font-black text-black tracking-tighter transition-colors group-hover:text-[#001D3D]">
              NEGOCIAR<span className="text-blue-600">.</span>
            </span>
            <div className="hidden lg:block h-4 w-[1px] bg-gray-200 mx-2"></div>
            <span className="hidden lg:inline text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
              Corrientes
            </span>
          </Link>

          {/* Search Bar - Desktop (Más ancha y minimalista) */}
          <div className="hidden md:block flex-1 max-w-xl">
            <div className="relative group">
              <SearchBar onSearch={handleSearch} initialValue={currentSearch} />
              {/* Línea decorativa inferior al hacer focus */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-blue-600 transition-all duration-300 group-focus-within:w-full"></div>
            </div>
          </div>

          {/* Right section - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to={isAuthenticated && user?.role === 'seller' ? '/seller/dashboard' : '/seller'} 
              className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider transition-colors"
            >
              Vender
            </Link>

            {/* Cart Icon con Acento Verde */}
            <Link to="/cart" className="relative group p-2">
              <svg className="w-6 h-6 text-gray-800 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute top-1 right-1 w-4 h-4 bg-green-500 text-[#001D3D] text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                {cartItemsCount}
              </span>
            </Link>

            {/* Login Button (Estilo Pill) */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{user.name}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 bg-[#001D3D] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-blue-900 transition-all shadow-lg hover:shadow-blue-900/20 active:scale-95"
              >
                Ingresar
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-black"
          >
            <div className="w-6 flex flex-col items-end gap-1.5">
              <span className={`h-0.5 bg-black transition-all ${isMenuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`}></span>
              <span className={`h-0.5 bg-black transition-all ${isMenuOpen ? 'opacity-0' : 'w-4'}`}></span>
              <span className={`h-0.5 bg-black transition-all ${isMenuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu (Overlay Moderno) */}
        <div 
          className={`md:hidden absolute left-0 w-full bg-white border-t border-gray-100 transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'top-full opacity-100 shadow-xl py-6' : 'top-[120%] opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex flex-col px-6 gap-6">
            <div className="pb-2">
              <SearchBar onSearch={handleSearch} initialValue={currentSearch} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/catalog" className="p-4 bg-gray-50 rounded-2xl text-center font-bold text-sm text-gray-800">Catálogo</Link>
              <Link to={isAuthenticated && user?.role === 'seller' ? '/seller/dashboard' : '/seller'} className="p-4 bg-gray-50 rounded-2xl text-center font-bold text-sm text-gray-800">Vender</Link>
            </div>
            {isAuthenticated && user ? (
              <div className="grid gap-3">
                <p className="text-sm text-gray-700 font-semibold text-center">{user.name}</p>
                <button
                  onClick={logout}
                  className="w-full py-4 border border-gray-300 text-gray-700 rounded-2xl font-bold text-center"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="w-full py-4 bg-[#001D3D] text-white rounded-2xl font-bold text-center shadow-lg"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
