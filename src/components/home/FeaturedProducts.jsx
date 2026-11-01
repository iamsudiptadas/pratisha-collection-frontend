import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../product/ProductCard';

export default function FeaturedProducts({ products = [] }) {
  if (products.length === 0) return null;

  return (
    <section className="py-8 bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">⭐ Featured Products</h2>
            <p className="text-sm text-gray-500 mt-1">Handpicked best sellers just for you</p>
          </div>
          <Link to="/products?featured=true"
            className="text-sm text-primary-600 font-semibold hover:underline">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
