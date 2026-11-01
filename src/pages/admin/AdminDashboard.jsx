import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminDashboard, adminGetOrders } from '../../api';
import { FiShoppingBag, FiUsers, FiPackage, FiDollarSign, FiClock } from 'react-icons/fi';

const ORDER_STATUSES = {
  awaiting_payment:               { label: 'Awaiting Payment',   color: 'bg-yellow-100 text-yellow-700' },
  payment_pending_verification:   { label: 'Pending Verification', color: 'bg-blue-100 text-blue-700' },
  confirmed:                      { label: 'Confirmed',          color: 'bg-green-100 text-green-700' },
  processing:                     { label: 'Processing',         color: 'bg-indigo-100 text-indigo-700' },
  shipped:                        { label: 'Shipped',            color: 'bg-purple-100 text-purple-700' },
  delivered:                      { label: 'Delivered',          color: 'bg-teal-100 text-teal-700' },
  cancelled:                      { label: 'Cancelled',          color: 'bg-red-100 text-red-600' },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminDashboard(), adminGetOrders({ limit: 5 })])
      .then(([s, o]) => { setStats(s.data); setRecentOrders(o.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Total Orders',     value: stats?.total_orders || 0,       icon: <FiShoppingBag />, color: 'bg-blue-50 text-blue-600',   href: '/admin/orders' },
    { label: 'Revenue (Verified)',value: `₹${(stats?.total_revenue || 0).toLocaleString('en-IN', {minimumFractionDigits:2})}`, icon: <FiDollarSign />, color: 'bg-green-50 text-green-600', href: '/admin/orders' },
    { label: 'Customers',        value: stats?.total_customers || 0,    icon: <FiUsers />,       color: 'bg-purple-50 text-purple-600', href: '/admin/customers' },
    { label: 'Active Products',  value: stats?.active_products || 0,    icon: <FiPackage />,     color: 'bg-orange-50 text-orange-600', href: '/admin/products' },
  ];

  return (
    <div className="space-y-6">
      {/* Pending payment alert */}
      {stats?.pending_payments > 0 && (
        <Link to="/admin/orders?payment_status=screenshot_uploaded"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors">
          <FiClock className="text-amber-500" size={18} />
          <span>⚠️ {stats.pending_payments} order{stats.pending_payments > 1 ? 's' : ''} awaiting payment verification</span>
          <span className="ml-auto underline">Review →</span>
        </Link>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Link key={card.label} to={card.href}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center text-xl mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '+ Add Product', href: '/admin/products', emoji: '📦' },
          { label: 'View Orders',   href: '/admin/orders',   emoji: '📋' },
          { label: 'Add Banner',    href: '/admin/banners',  emoji: '🖼️' },
          { label: 'Payment Setup', href: '/admin/payment-settings', emoji: '💳' },
        ].map(a => (
          <Link key={a.label} to={a.href}
            className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:border-primary-300 hover:shadow-sm transition-all">
            <span className="text-2xl block mb-1">{a.emoji}</span>
            <span className="text-xs font-semibold text-gray-700">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Recent Orders</h3>
          <Link to="/admin/orders" className="text-sm text-primary-600 font-medium hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Order #</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">No orders yet</td></tr>
              ) : recentOrders.map(order => {
                const s = ORDER_STATUSES[order.order_status] || { label: order.order_status, color: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link to={`/admin/orders/${order.id}`} className="font-medium text-primary-600 hover:underline">{order.order_number}</Link>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{order.customer_name}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">₹{Number(order.total_amount).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
