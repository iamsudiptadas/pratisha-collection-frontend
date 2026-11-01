import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminGetOrder, adminUpdateOrderStatus, adminVerifyPayment } from '../../api';
import toast from 'react-hot-toast';
import { FiChevronLeft, FiPackage, FiMapPin, FiCreditCard, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const ORDER_STATUSES = ['awaiting_payment','payment_pending_verification','confirmed','processing','shipped','delivered','cancelled','returned'];
const STATUS_COLORS = {
  awaiting_payment:'bg-yellow-100 text-yellow-700', payment_pending_verification:'bg-blue-100 text-blue-700',
  confirmed:'bg-green-100 text-green-700', processing:'bg-indigo-100 text-indigo-700',
  shipped:'bg-purple-100 text-purple-700', delivered:'bg-teal-100 text-teal-700',
  cancelled:'bg-red-100 text-red-600', returned:'bg-gray-100 text-gray-600',
};
const LABELS = {
  awaiting_payment:'Awaiting Payment', payment_pending_verification:'Pending Verification',
  confirmed:'Confirmed', processing:'Processing', shipped:'Shipped',
  delivered:'Delivered', cancelled:'Cancelled', returned:'Returned',
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNum, setTrackingNum] = useState('');

  const load = () => {
    setLoading(true);
    adminGetOrder(id)
      .then(r => { setOrder(r.data); setNewStatus(r.data.order_status); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleStatusUpdate = async () => {
    if (newStatus === order.order_status && !trackingNum) return;
    setUpdating(true);
    try {
      await adminUpdateOrderStatus(id, { order_status: newStatus, tracking_number: trackingNum || undefined });
      toast.success('Order status updated!');
      load();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(false); }
  };

  const handleVerifyPayment = async (action) => {
    setUpdating(true);
    try {
      await adminVerifyPayment(id, { action });
      toast.success(action === 'approve' ? 'Payment verified!' : 'Payment rejected');
      load();
    } catch { toast.error('Verification failed'); }
    finally { setUpdating(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return <p className="text-center text-gray-400 py-10">Order not found</p>;

  const s = STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-600';

  return (
    <div className="space-y-5 max-w-4xl">
      <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <FiChevronLeft size={16} /> Back to Orders
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap gap-4 items-start justify-between">
        <div>
          <h1 className="font-bold text-gray-900 text-lg">{order.order_number}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date(order.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit'})}
          </p>
          <p className="text-sm text-gray-700 mt-1">Customer: <span className="font-semibold">{order.customer_name}</span> ({order.customer_email})</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${s}`}>{LABELS[order.order_status] || order.order_status}</span>
      </div>

      {/* Payment verification — only if screenshot uploaded */}
      {order.payment_status === 'screenshot_uploaded' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h2 className="font-bold text-amber-800 mb-3">⚠️ Payment Verification Required</h2>
          <div className="flex gap-4 items-start">
            {order.payment_screenshot_url && (
              <a href={order.payment_screenshot_url} target="_blank" rel="noreferrer"
                className="flex-shrink-0">
                <img src={order.payment_screenshot_url} alt="Payment proof"
                  className="w-32 h-32 object-cover rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-colors cursor-pointer" />
              </a>
            )}
            <div className="flex-1">
              <p className="text-sm text-amber-700 mb-4">Customer has uploaded payment proof. Review and verify.</p>
              <div className="flex gap-3">
                <button onClick={() => handleVerifyPayment('approve')} disabled={updating}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                  <FiCheckCircle size={16} /> Approve Payment
                </button>
                <button onClick={() => handleVerifyPayment('reject')} disabled={updating}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                  <FiXCircle size={16} /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {/* Order items */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiPackage className="text-primary-500" /> Order Items
          </h2>
          <div className="space-y-4">
            {order.items?.map(item => (
              <div key={item.id} className="flex gap-3">
                <img src={item.image_url || 'https://via.placeholder.com/48x48'}
                  alt={item.product_name} className="w-12 h-12 object-cover rounded-xl border border-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm line-clamp-2">{item.product_name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{Number(item.unit_price).toFixed(2)}</p>
                </div>
                <p className="font-bold text-gray-900 text-sm flex-shrink-0">₹{Number(item.subtotal).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{(Number(order.total_amount)-Number(order.shipping_cost||0)).toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{Number(order.shipping_cost)===0?'FREE':`₹${Number(order.shipping_cost).toFixed(2)}`}</span></div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2"><span>Total</span><span>₹{Number(order.total_amount).toFixed(2)}</span></div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Address */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
              <FiMapPin className="text-primary-500" size={14} /> Delivery Address
            </h2>
            <p className="text-sm font-semibold text-gray-800">{order.shipping_name}</p>
            <p className="text-sm text-gray-600">{order.shipping_phone}</p>
            <p className="text-sm text-gray-600 mt-1">
              {order.shipping_address_line1}{order.shipping_address_line2?`, ${order.shipping_address_line2}`:''},{' '}
              {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}
            </p>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
              <FiCreditCard className="text-primary-500" size={14} /> Payment
            </h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Status</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  order.payment_status==='verified'?'bg-green-100 text-green-700':
                  order.payment_status==='screenshot_uploaded'?'bg-blue-100 text-blue-700':
                  order.payment_status==='failed'?'bg-red-100 text-red-600':'bg-yellow-100 text-yellow-700'}`}>
                  {order.payment_status?.replace('_',' ')}
                </span>
              </div>
              {order.tracking_number && (
                <div className="flex justify-between"><span className="text-gray-500">Tracking</span><span className="font-medium text-gray-800">{order.tracking_number}</span></div>
              )}
            </div>
          </div>

          {/* Update status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-900 mb-3 text-sm">Update Status</h2>
            <div className="space-y-3">
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 bg-white">
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{LABELS[s]}</option>)}
              </select>
              <input value={trackingNum} onChange={e => setTrackingNum(e.target.value)}
                placeholder="Tracking number (optional)"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
              <button onClick={handleStatusUpdate} disabled={updating}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                {updating ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
