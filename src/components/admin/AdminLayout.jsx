import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiImage,
  FiCreditCard, FiTag, FiStar, FiLogOut, FiMenu, FiX, FiHome
} from 'react-icons/fi';

const NAV = [
  { label: 'Dashboard',        href: '/admin',                  icon: <FiGrid /> },
  { label: 'Products',         href: '/admin/products',         icon: <FiPackage /> },
  { label: 'Categories',       href: '/admin/categories',       icon: <FiTag /> },
  { label: 'Orders',           href: '/admin/orders',           icon: <FiShoppingBag /> },
  { label: 'Customers',        href: '/admin/customers',        icon: <FiUsers /> },
  { label: 'Banners',          href: '/admin/banners',          icon: <FiImage /> },
  { label: 'Payment Settings', href: '/admin/payment-settings', icon: <FiCreditCard /> },
  { label: 'Reviews',          href: '/admin/reviews',          icon: <FiStar /> },
];

export default function AdminLayout() {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const Sidebar = ({ onClose }) => (
    <aside className="w-64 h-full bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary-400">Pratisha</span>
            <span className="text-xs text-gray-400 block">Admin Panel</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white lg:hidden">
              <FiX size={20} />
            </button>
          )}
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-xs text-gray-400">Logged in as</p>
        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {NAV.map(item => {
          const active = location.pathname === item.href ||
            (item.href !== '/admin' && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors
                ${active
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800">
          <FiHome /> View Store
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 w-full">
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-600 hover:text-gray-900">
            <FiMenu size={22} />
          </button>
          <h2 className="font-semibold text-gray-800">
            {NAV.find(n => n.href === location.pathname || (n.href !== '/admin' && location.pathname.startsWith(n.href)))?.label || 'Dashboard'}
          </h2>
          <div className="ml-auto text-sm text-gray-500">
            Welcome, {user?.name?.split(' ')[0]}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
