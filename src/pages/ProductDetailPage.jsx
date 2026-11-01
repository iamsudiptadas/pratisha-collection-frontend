import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addToWishlist } from '../api';
import toast from 'react-hot-toast';
import {
  FiShoppingCart, FiHeart, FiStar, FiTruck, FiRefreshCw,
  FiShield, FiMinus, FiPlus, FiChevronRight
} from 'react-icons/fi';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    setLoading(true);
    getProduct(slug)
      .then(r => { setProduct(r.data); setSelectedImage(0); })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded w-1/3 mt-4" />
            <div className="h-12 bg-gray-200 rounded mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length > 0
    ? product.images
    : [{ id: 0, image_url: 'https://via.placeholder.com/500x500?text=No+Image', is_primary: true }];

  const inStock = product.stock_quantity > 0;
  const discount = product.mrp && product.price < product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null;

  const avgRating = product.reviews?.length > 0
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  const handleAddToCart = () => {
    addItem(product.id, quantity);
  };

  const handleBuyNow = () => {
    if (!user) { toast.error('Please login to place an order'); navigate('/login'); return; }
    addItem(product.id, quantity);
    navigate('/cart');
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Login to save to wishlist'); return; }
    try {
      await addToWishlist({ product_id: product.id });
      toast.success('Added to wishlist ❤️');
    } catch { toast.error('Already in wishlist'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <FiChevronRight size={14} />
        {product.category_slug && (
          <>
            <Link to={`/category/${product.category_slug}`} className="hover:text-primary-600">{product.category_name}</Link>
            <FiChevronRight size={14} />
          </>
        )}
        <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
        {/* ── Left: Images ── */}
        <div>
          {/* Main image */}
          <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square border border-gray-100 mb-3">
            <img
              src={images[selectedImage]?.image_url}
              alt={product.name}
              className="w-full h-full object-contain p-4"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/500x500?text=No+Image'; }}
            />
            {discount && (
              <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {discount}% OFF
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors
                    ${selectedImage === idx ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Details ── */}
        <div>
          {/* Category & brand */}
          <div className="flex items-center gap-2 mb-2">
            {product.category_name && (
              <Link to={`/category/${product.category_slug}`}
                className="text-xs text-primary-600 font-semibold bg-primary-50 px-2.5 py-1 rounded-full hover:bg-primary-100">
                {product.category_name}
              </Link>
            )}
            {product.brand && (
              <span className="text-xs text-gray-500 font-medium">{product.brand}</span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-snug">{product.name}</h1>

          {/* Rating */}
          {avgRating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded text-sm font-semibold">
                <FiStar size={12} fill="white" /> {avgRating}
              </div>
              <span className="text-sm text-gray-500">({product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-3xl font-bold text-gray-900">₹{Number(product.price).toFixed(2)}</span>
            {product.mrp && product.price < product.mrp && (
              <span className="text-lg text-gray-400 line-through">₹{Number(product.mrp).toFixed(2)}</span>
            )}
            {discount && (
              <span className="text-green-600 font-semibold text-sm">{discount}% off</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-5">Inclusive of all taxes</p>

          {/* Stock status */}
          <div className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full mb-5
            ${inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
            {inStock ? `In Stock (${product.stock_quantity} left)` : 'Out of Stock'}
          </div>

          {/* Quantity selector */}
          {inStock && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                  <FiMinus size={16} />
                </button>
                <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                  <FiPlus size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-colors
                ${inStock ? 'bg-primary-100 text-primary-700 hover:bg-primary-200 border border-primary-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
              <FiShoppingCart size={18} />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-colors
                ${inStock ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
              Buy Now
            </button>
            <button
              onClick={handleWishlist}
              className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors">
              <FiHeart size={20} />
            </button>
          </div>

          {/* Delivery info */}
          <div className="space-y-2.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            {[
              { icon: <FiTruck size={16} />, text: 'Free delivery on orders above ₹499' },
              { icon: <FiRefreshCw size={16} />, text: '7-day easy return & exchange policy' },
              { icon: <FiShield size={16} />, text: '100% genuine products guaranteed' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                <span className="text-primary-500">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>

          {product.sku && (
            <p className="text-xs text-gray-400 mt-3">SKU: {product.sku}</p>
          )}
        </div>
      </div>

      {/* ── Tabs: Description & Reviews ── */}
      <div className="mt-10">
        <div className="border-b border-gray-200 flex gap-0">
          {['description', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-semibold capitalize border-b-2 transition-colors -mb-px
                ${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab === 'reviews' ? `Reviews (${product.reviews?.length || 0})` : 'Description'}
            </button>
          ))}
        </div>

        <div className="pt-6">
          {activeTab === 'description' ? (
            <div className="prose prose-sm max-w-none text-gray-700">
              {product.description
                ? <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
                : <p className="text-gray-400 italic">No description available.</p>}
            </div>
          ) : (
            <div>
              {!product.reviews || product.reviews.length === 0 ? (
                <p className="text-gray-400 italic text-sm">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-4">
                  {product.reviews.map((r, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array(5).fill(0).map((_, si) => (
                            <FiStar key={si} size={14}
                              className={si < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{r.reviewer_name}</span>
                        <span className="text-xs text-gray-400 ml-auto">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                      {r.title && <p className="text-sm font-medium text-gray-800 mb-1">{r.title}</p>}
                      {r.body && <p className="text-sm text-gray-600">{r.body}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
