import React from 'react';
import { Link } from 'react-router-dom';

const CATEGORY_ICONS = {
  'pens-pencils':      { emoji: '🖊️', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  'notebooks-diaries': { emoji: '📓', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
  'art-supplies':      { emoji: '🎨', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  'geometry-sets':     { emoji: '📐', color: 'bg-green-50 text-green-600 border-green-100' },
  'office-stationery': { emoji: '💼', color: 'bg-gray-50 text-gray-600 border-gray-200' },
  'school-supplies':   { emoji: '🎒', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  'gift-craft':        { emoji: '🎁', color: 'bg-pink-50 text-pink-600 border-pink-100' },
};

export default function CategoryGrid({ categories = [] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {categories.map((cat) => {
            const style = CATEGORY_ICONS[cat.slug] || { emoji: '📦', color: 'bg-gray-50 text-gray-600 border-gray-200' };
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border ${style.color} hover:shadow-md transition-all hover:-translate-y-0.5`}
              >
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-10 h-10 object-cover rounded-full" />
                ) : (
                  <span className="text-3xl">{style.emoji}</span>
                )}
                <span className="text-xs font-semibold text-center leading-tight">{cat.name}</span>
                {cat.product_count > 0 && (
                  <span className="text-[10px] opacity-60">{cat.product_count} items</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
