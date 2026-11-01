import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, total, updateItem, removeItem, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to proceed');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  if (cartCount === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some products to your cart and come back here to checkout.</p>
        <Link to="/products"
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-md shadow-primary-200">
          <FiShoppingBag size={18} />
          Continue Shopping
        </Link>
      </div>
    );
  }

  const shipping = total >= 499 ? 0 : 49;
  const grandTotal = total + shipping;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart <span className="text-gray-400 font-normal text-lg">({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
              {/* Image */}
              <Link to={`/product/${item.slug}`} className="flex-shrink-0">
                <img
                  src={item.image_url || 'https://via.placeholder.com/100x100?text=No+Image'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl border border-gray-100"
                  onError={e => { e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'; }}
                />
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.slug}`}
                  className="text-sm font-semibold text-gray-800 hover:text-primary-600 line-clamp-2 leading-snug">
                  {item.name}
                </Link>
                {item.category_name && (
                  <p className="text-xs text-gray-400 mt-0.5">{item.category_name}</p>
                )}

                <div className="flex items-center justify-between mt-3">
                  {/* Qty control */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => {
                        if (item.quantity <= 1) removeItem(item.id);
                        else updateItem(item.id, item.quantity - 1);
                      }}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                      <FiMinus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                      <FiPlus size={14} />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{(Number(item.price) * item.quantity).toFixed(2)}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-400">₹{Number(item.price).toFixed(2)} each</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.id)}
                className="self-start text-gray-300 hover:text-red-400 transition-colors p-1">
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}

          {/* Continue shopping */}
          <Link to="/products"
            className="inline-flex items-center gap-2 text-sm text-primary-600 font-medium hover:underline mt-2">
            ← Continue Shopping
          </Link>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-4">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartCount} items)</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                  Add ₹{(499 - total).toFixed(2)} more for free delivery
                </p>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-5 bg-primary-500 hover:bg-primary-600 text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-md shadow-primary-200">
              Proceed to Checkout
              <FiArrowRight size={16} />
            </button>

            {/* Payment note */}
            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs text-amber-700 text-center">
                💳 We accept payment via Bank QR Code & Bank Transfer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
