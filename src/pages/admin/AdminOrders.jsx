import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminGetOrders } from '../../api';

const ORDER_STATUSES = {
  awaiting_payment:             'Awaiting Payment',
  payment_pending_verification: 'Pending Verification',
  confirmed:                    'Confirmed',
  processing:                   'Processing',
  shipped:                      'Shipped',
  delivered:                    'Delivered',
  cancelled:                    'Cancelled',
  returned:                     'Returned',
};

const STATUS_COLORS = {
  awaiting_payment:             'bg-yellow-100 text-yellow-700',
  payment_pending_verification: 'bg-blue-100 text-blue-700',
  confirmed:                    'bg-green-100 text-green-700',
  processing:                   'bg-indigo-100 text-indigo-700',
  shipped:                      'bg-purple-100 text-purple-700',
  delivered:                    'bg-teal-100 text-teal-700',
  cancelled:                    'bg-red-100 text-red-600',
  returned:                     'bg-gray-100 text-gray-600',
};

const PAY_COLORS = {
  pending:              'bg-yellow-100 text-yellow-700',
  screenshot_uploaded:  'bg-blue-100 text-blue-700',
  verified:             'bg-green-100 text-green-700',
  failed:               'bg-red-100 text-red-600',
};

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const page = Number(searchParams.get('page') || 1);
  const status = searchParams.get('status') || '';
  const payStatus = searchParams.get('payment_status') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    setLoading(true);
    adminGetOrders({ page, limit: 20, status: status || undefined, payment_status: payStatus || undefined, search: search || undefined })
      .then(r => {
        setOrders(Array.isArray(r.data) ? r.data : (r.data.orders || []));
        setTotal(r.data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page, status, payStatus, search]);

  const setFilter = (key, val) => {
    const params = Object.fromEntries(searchParams);
    if (val) params[key] = val; else delete params[key];
    params.page = '1';
    setSearchParams(params);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={e => setFilter('search', e.target.value)}
          placeholder="Search order # or customer..."
          className="flex-1 min-w-48 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500"
        />
        <select value={status} onChange={e => setFilter('status', e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 bg-white">
          <option value="">All Statuses</option>
          {Object.entries(ORDER_STATUSES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={payStatus} onChange={e => setFilter('payment_status', e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 bg-white">
          <option value="">All Payment</option>
          <option value="pending">Pending</option>
          <option value="screenshot_uploaded">Screenshot Uploaded</option>
          <option value="verified">Verified</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">
            Orders {total > 0 && <span className="text-gray-400 font-normal">({total})</span>}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Order #</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Payment</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_,i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No orders found</td></tr>
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-primary-600">{order.order_number}</td>
                  <td className="px-5 py-3 text-gray-700">{order.customer_name}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">₹{Number(order.total_amount).toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-600'}`}>
                      {ORDER_STATUSES[order.order_status] || order.order_status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PAY_COLORS[order.payment_status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.payment_status === 'screenshot_uploaded' ? '📷 Review' :
                       order.payment_status === 'verified' ? '✓ Verified' :
                       order.payment_status === 'failed' ? '✗ Failed' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3">
                    <Link to={`/admin/orders/${order.id}`}
                      className="text-xs text-primary-600 font-medium hover:underline">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
