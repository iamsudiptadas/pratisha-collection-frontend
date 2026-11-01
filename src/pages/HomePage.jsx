import React, { useEffect, useState } from 'react';
import { getCategories, getProducts } from '../api';
import BannerCarousel from '../components/home/BannerCarousel';
import CategoryGrid from '../components/home/CategoryGrid';
import FeaturedProducts from '../components/home/FeaturedProducts';
import ProductCard from '../components/product/ProductCard';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, featRes, newRes] = await Promise.all([
          getCategories(),
          getProducts({ featured: 'true', limit: 10 }),
          getProducts({ sort: 'newest', limit: 8 }),
        ]);
        setCategories(catRes.data);
        setFeatured(featRes.data.products);
        setNewArrivals(newRes.data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Banner Carousel */}
      <div className="max-w-7xl mx-auto px-0 md:px-4 pt-0 md:pt-4">
        <BannerCarousel banners={[]} />
      </div>

      {/* Trust badges */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: '🚚', title: 'Free Delivery', sub: 'On orders above ₹499' },
            { icon: '🔒', title: 'Secure Payment', sub: 'UPI & Bank transfer' },
            { icon: '↩️', title: 'Easy Returns', sub: '7-day return policy' },
            { icon: '✅', title: 'Quality Assured', sub: '100% genuine products' },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
              <span className="text-2xl">{b.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{b.title}</p>
                <p className="text-xs text-gray-500">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <CategoryGrid categories={categories} />

      {/* Featured Products */}
      <FeaturedProducts products={featured} />

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">🆕 New Arrivals</h2>
                <p className="text-sm text-gray-500 mt-1">Freshly added to our collection</p>
              </div>
              <Link to="/products?sort=newest" className="text-sm text-primary-600 font-semibold hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Empty state when no products yet */}
      {featured.length === 0 && newArrivals.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Products Coming Soon!</h3>
          <p className="text-gray-500 mb-6">Our store is being stocked. Check back shortly.</p>
        </div>
      )}

      {/* Promo strip */}
      <div className="bg-primary-600 text-white py-10 mt-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-2">Need Bulk Stationery?</h3>
          <p className="text-primary-100 mb-6">Special wholesale pricing available for schools, offices & institutions.</p>
          <a href="mailto:care@pratishacollection.in"
            className="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-full hover:shadow-lg transition-shadow">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
