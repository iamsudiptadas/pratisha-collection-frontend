import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderDetail } from '../api';
import { FiPackage, FiMapPin, FiCreditCard, FiChevronLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  awaiting_payment:             { label: 'Awaiting Payment',      color: 'bg-yellow-100 text-yellow-700' },
  payment_pending_verification: { label: 'Payment Under Verification', color: 'bg-blue-100 text-blue-700' },
  confirmed:                    { label: 'Confirmed',             color: 'bg-green-100 text-green-700' },
  processing:                   { label: 'Processing',            color: 'bg-indigo-100 text-indigo-700' },
  shipped:                      { label: 'Shipped',               color: 'bg-purple-100 text-purple-700' },
  delivered:                    { label: 'Delivered',             color: 'bg-teal-100 text-teal-700' },
  cancelled:                    { label: 'Cancelled',             color: 'bg-red-100 text-red-600' },
  returned:                     { label: 'Returned',              color: 'bg-gray-100 text-gray-600' },
};

const TIMELINE = [
  { key: 'awaiting_payment', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderDetail(id)
      .then(r => setOrder(r.data))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Order not found</p>
      <Link to="/my-orders" className="text-primary-600 mt-2 inline-block">← Back to orders</Link>
    </div>
  );

  const s = STATUS_STYLES[order.order_status] || { label: order.order_status, color: 'bg-gray-100 text-gray-600' };
  const cancelled = order.order_status === 'cancelled' || order.order_status === 'returned';

  const currentStep = TIMELINE.findIndex(t => t.key === order.order_status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/my-orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <FiChevronLeft size={16} /> My Orders
      </Link>

      {/* Order header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-bold text-gray-900 text-lg">{order.order_number}</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${s.color}`}>{s.label}</span>
            {order.order_status === 'awaiting_payment' && (
              <Link to={`/payment/${order.id}`}
                className="text-xs bg-primary-500 text-white px-3 py-1.5 rounded-full font-semibold hover:bg-primary-600 transition-colors">
                💳 Pay Now
              </Link>
            )}
          </div>
        </div>

        {/* Progress timeline */}
        {!cancelled && (
          <div className="mt-5 overflow-x-auto">
            <div className="flex items-center min-w-max gap-0">
              {TIMELINE.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                        ${done ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {done && i < currentStep ? '✓' : i + 1}
                      </div>
                      <p className={`text-xs mt-1.5 font-medium whitespace-nowrap ${active ? 'text-primary-600' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? 'bg-primary-500' : 'bg-gray-100'}`} style={{width:'40px'}} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiPackage className="text-primary-500" /> Order Items
        </h2>
        <div className="space-y-4">
          {order.items?.map(item => (
            <div key={item.id} className="flex gap-3">
              <img
                src={item.image_url || 'https://via.placeholder.com/64x64?text=No+Image'}
                alt={item.product_name}
                className="w-14 h-14 object-cover rounded-xl border border-gray-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm line-clamp-2">{item.product_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} × ₹{Number(item.unit_price).toFixed(2)}</p>
              </div>
              <p className="font-bold text-gray-900 text-sm flex-shrink-0">
                ₹{Number(item.subtotal).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Price summary */}
        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{(Number(order.total_amount) - Number(order.shipping_cost || 0)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery</span>
            <span className={Number(order.shipping_cost) === 0 ? 'text-green-600' : ''}>
              {Number(order.shipping_cost) === 0 ? 'FREE' : `₹${Number(order.shipping_cost).toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
            <span>Total</span>
            <span>₹{Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Delivery address */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <FiMapPin className="text-primary-500" /> Delivery Address
        </h2>
        <p className="text-sm text-gray-700 font-semibold">{order.shipping_name} — {order.shipping_phone}</p>
        <p className="text-sm text-gray-600 mt-1">
          {order.shipping_address_line1}
          {order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : ''},<br />
          {order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}
        </p>
      </div>

      {/* Payment info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <FiCreditCard className="text-primary-500" /> Payment
        </h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Payment Method</span>
          <span className="font-medium text-gray-800">Bank Transfer / QR Code</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">Payment Status</span>
          <span className={`font-semibold px-2.5 py-1 rounded-full text-xs ${
            order.payment_status === 'verified' ? 'bg-green-100 text-green-700' :
            order.payment_status === 'screenshot_uploaded' ? 'bg-blue-100 text-blue-700' :
            order.payment_status === 'failed' ? 'bg-red-100 text-red-600' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {order.payment_status === 'verified' ? '✓ Verified' :
             order.payment_status === 'screenshot_uploaded' ? 'Under Review' :
             order.payment_status === 'failed' ? 'Rejected' : 'Pending'}
          </span>
        </div>

        {order.tracking_number && (
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Tracking Number</span>
            <span className="font-semibold text-gray-800">{order.tracking_number}</span>
          </div>
        )}

        {order.notes && (
          <div className="mt-3 text-sm">
            <p className="text-gray-500">Order Notes: <span className="text-gray-700">{order.notes}</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
