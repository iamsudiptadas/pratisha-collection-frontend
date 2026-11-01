import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api';
import { FiPackage, FiChevronRight } from 'react-icons/fi';

const STATUS_STYLES = {
  awaiting_payment:             { label: 'Awaiting Payment',      color: 'bg-yellow-100 text-yellow-700' },
  payment_pending_verification: { label: 'Payment Verification',  color: 'bg-blue-100 text-blue-700' },
  confirmed:                    { label: 'Confirmed',             color: 'bg-green-100 text-green-700' },
  processing:                   { label: 'Processing',            color: 'bg-indigo-100 text-indigo-700' },
  shipped:                      { label: 'Shipped',               color: 'bg-purple-100 text-purple-700' },
  delivered:                    { label: 'Delivered',             color: 'bg-teal-100 text-teal-700' },
  cancelled:                    { label: 'Cancelled',             color: 'bg-red-100 text-red-600' },
  returned:                     { label: 'Returned',              color: 'bg-gray-100 text-gray-600' },
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-4">📦</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
        <Link to="/products"
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-md shadow-primary-200">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map(order => {
          const s = STATUS_STYLES[order.order_status] || { label: order.order_status, color: 'bg-gray-100 text-gray-600' };
          return (
            <Link key={order.id} to={`/my-orders/${order.id}`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-100 transition-all p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-800 text-sm">{order.order_number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>
                  <FiChevronRight size={16} className="text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FiPackage size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="font-bold text-gray-900">₹{Number(order.total_amount).toFixed(2)}</p>
              </div>

              {order.order_status === 'awaiting_payment' && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <span className="text-xs text-amber-600 font-medium">
                    💳 Complete payment to confirm order →
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
