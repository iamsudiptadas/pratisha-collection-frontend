import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../api';
import { useCart } from '../context/CartContext';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    getWishlist()
      .then(r => setItems(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setItems(prev => prev.filter(i => i.product_id !== productId));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed to remove'); }
  };

  const handleAddToCart = (item) => {
    addItem(item.product_id, 1);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-4">❤️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Save items you love and come back later.</p>
        <Link to="/products"
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-md shadow-primary-200">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FiHeart className="text-red-400" /> My Wishlist
        <span className="text-gray-400 font-normal text-lg">({items.length})</span>
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
            <Link to={`/product/${item.slug}`} className="block relative">
              <img
                src={item.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}
                alt={item.name}
                className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                onError={e => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
              />
              <button
                onClick={e => { e.preventDefault(); handleRemove(item.product_id); }}
                className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                <FiTrash2 size={14} />
              </button>
            </Link>
            <div className="p-3">
              <Link to={`/product/${item.slug}`}
                className="text-sm font-semibold text-gray-800 hover:text-primary-600 line-clamp-2 leading-snug block mb-1">
                {item.name}
              </Link>
              <p className="font-bold text-gray-900 text-sm mb-2">₹{Number(item.price).toFixed(2)}</p>
              <button
                onClick={() => handleAddToCart(item)}
                disabled={!item.in_stock}
                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors
                  ${item.in_stock ? 'bg-primary-100 text-primary-700 hover:bg-primary-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                <FiShoppingCart size={12} />
                {item.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
