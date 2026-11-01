import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { addToWishlist } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user } = useAuth();

  const discount = product.mrp && product.price < product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null;

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login to save to wishlist'); return; }
    try {
      await addToWishlist({ product_id: product.id });
      toast.success('Added to wishlist ❤️');
    } catch { toast.error('Already in wishlist'); }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product.id, 1);
  };

  const inStock = product.stock_quantity > 0;

  return (
    <Link to={`/product/${product.slug}`} className="product-card group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <img
          src={product.image_url || '/placeholder-product.png'}
          alt={product.name}
          className="product-card-image w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && (
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {discount}% OFF
            </span>
          )}
          {!inStock && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              OUT OF STOCK
            </span>
          )}
          {product.is_featured && (
            <span className="bg-accent-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              ⭐ FEATURED
            </span>
          )}
        </div>
        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <FiHeart size={15} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        {product.category_name && (
          <p className="text-[10px] text-primary-500 font-semibold uppercase tracking-wide mb-0.5">{product.category_name}</p>
        )}
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1 leading-snug">{product.name}</h3>
        {product.brand && (
          <p className="text-xs text-gray-400 mb-1">{product.brand}</p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-base font-bold text-gray-900">₹{Number(product.price).toFixed(2)}</span>
          {product.mrp && product.price < product.mrp && (
            <span className="text-xs text-gray-400 line-through">₹{Number(product.mrp).toFixed(2)}</span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors
            ${inStock
              ? 'bg-primary-500 hover:bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          <FiShoppingCart size={14} />
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </Link>
  );
}
