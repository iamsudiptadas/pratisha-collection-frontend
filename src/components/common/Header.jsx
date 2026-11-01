import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiHeart, FiMenu, FiX, FiLogOut, FiPackage } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const { user, logoutUser, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top bar */}
      <div className="bg-primary-600 text-white text-xs text-center py-1.5 px-4">
        🎉 Free delivery on orders above ₹499 | Pratisha Collection — Your Stationery Store
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 md:gap-6">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold text-primary-600 tracking-tight">Pratisha</span>
            <span className="text-xs text-gray-500 font-medium tracking-widest uppercase">Collection</span>
          </div>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center bg-gray-100 rounded-full overflow-hidden border border-gray-200 focus-within:border-primary-400 transition-colors">
          <input
            type="text"
            placeholder="Search stationery, pens, notebooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none text-gray-700 placeholder-gray-400"
          />
          <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 transition-colors">
            <FiSearch size={18} />
          </button>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
          {/* Wishlist */}
          {user && (
            <Link to="/wishlist" className="hidden md:flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors p-2">
              <FiHeart size={20} />
              <span className="text-sm hidden lg:inline">Wishlist</span>
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className="relative flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors p-2">
            <FiShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
            <span className="text-sm hidden lg:inline">Cart</span>
          </Link>

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 transition-colors p-2 rounded-lg"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">{user.name?.[0]?.toUpperCase()}</span>
                </div>
                <span className="text-sm hidden lg:inline font-medium">{user.name?.split(' ')[0]}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50">
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <Link to="/my-orders" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <FiPackage size={15} /> My Orders
                  </Link>
                  <Link to="/wishlist" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <FiHeart size={15} /> Wishlist
                  </Link>
                  <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <FiUser size={15} /> Profile
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                    <FiLogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login"
              className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
              <FiUser size={16} />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600 hover:text-primary-600 p-2"
          >
            {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Category nav bar */}
      <nav className="hidden md:block border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-0 overflow-x-auto">
            {[
              { label: 'All Products', href: '/products' },
              { label: 'Pens & Pencils', href: '/category/pens-pencils' },
              { label: 'Notebooks', href: '/category/notebooks-diaries' },
              { label: 'Art Supplies', href: '/category/art-supplies' },
              { label: 'Geometry Sets', href: '/category/geometry-sets' },
              { label: 'Office', href: '/category/office-stationery' },
              { label: 'School', href: '/category/school-supplies' },
              { label: 'Gift & Craft', href: '/category/gift-craft' },
            ].map((item) => (
              <li key={item.href}>
                <Link to={item.href}
                  className="block px-4 py-2.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-white font-medium whitespace-nowrap transition-colors border-b-2 border-transparent hover:border-primary-500">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {[
              { label: '🏠 Home', href: '/' },
              { label: '📦 All Products', href: '/products' },
              { label: '🖊️ Pens & Pencils', href: '/category/pens-pencils' },
              { label: '📓 Notebooks', href: '/category/notebooks-diaries' },
              { label: '🎨 Art Supplies', href: '/category/art-supplies' },
              { label: '📐 Geometry Sets', href: '/category/geometry-sets' },
            ].map((item) => (
              <Link key={item.href} to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg">
                {item.label}
              </Link>
            ))}
            {user && (
              <>
                <hr className="my-2" />
                <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">📋 My Orders</Link>
                <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">❤️ Wishlist</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </header>
  );
}
