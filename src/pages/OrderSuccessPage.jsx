import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiShoppingBag } from 'react-icons/fi';

export default function OrderSuccessPage() {
  const { orderId } = useParams();

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10">
        <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
          <FiCheckCircle className="text-green-500" size={40} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-6">
          Your order has been placed successfully. Please complete the payment to confirm your order.
        </p>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 text-left">
          <p className="text-sm font-semibold text-amber-800 mb-1">⏳ Next Steps:</p>
          <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
            <li>Complete payment via QR Code or Bank Transfer</li>
            <li>Upload your payment screenshot as proof</li>
            <li>Our team will verify within 24 hours</li>
            <li>Order will be confirmed and shipped</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/payment/${orderId}`}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-md shadow-primary-200 flex items-center justify-center gap-2">
            💳 Pay Now
          </Link>
          <Link
            to={`/my-orders/${orderId}`}
            className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
            <FiPackage size={16} /> Track Order
          </Link>
        </div>

        <Link to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mt-6">
          <FiShoppingBag size={14} /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}
