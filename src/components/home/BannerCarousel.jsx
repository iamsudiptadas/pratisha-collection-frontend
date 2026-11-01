import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Link } from 'react-router-dom';

// Default banners when no banners loaded from DB yet
const DEFAULT_BANNERS = [
  {
    id: 1,
    image_url: null,
    title: 'Back to School — Up to 40% Off',
    subtitle: 'Premium stationery for students & professionals',
    link_url: '/category/school-supplies',
    bg: 'from-primary-600 to-pink-400',
    emoji: '📚',
  },
  {
    id: 2,
    image_url: null,
    title: 'Art Supplies Collection',
    subtitle: 'Professional quality tools for every artist',
    link_url: '/category/art-supplies',
    bg: 'from-purple-600 to-indigo-400',
    emoji: '🎨',
  },
  {
    id: 3,
    image_url: null,
    title: 'Office Stationery Essentials',
    subtitle: 'Stock up your workspace today',
    link_url: '/category/office-stationery',
    bg: 'from-teal-600 to-cyan-400',
    emoji: '💼',
  },
];

export default function BannerCarousel({ banners = [] }) {
  const displayBanners = banners.length > 0 ? banners : DEFAULT_BANNERS;

  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="w-full rounded-none md:rounded-2xl overflow-hidden"
        style={{ '--swiper-theme-color': '#ec4899' }}
      >
        {displayBanners.map((banner) => (
          <SwiperSlide key={banner.id}>
            {banner.image_url ? (
              <Link to={banner.link_url || '/'}>
                <img
                  src={banner.image_url}
                  alt={banner.title || 'Banner'}
                  className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
                />
              </Link>
            ) : (
              // Gradient fallback banner
              <Link to={banner.link_url || '/'}>
                <div className={`bg-gradient-to-r ${banner.bg} w-full h-48 sm:h-64 md:h-80 lg:h-96 flex items-center`}>
                  <div className="max-w-7xl mx-auto px-8 sm:px-16 w-full">
                    <div className="text-6xl sm:text-8xl mb-4">{banner.emoji}</div>
                    <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">{banner.title}</h2>
                    <p className="text-sm sm:text-lg text-white/80 mb-6">{banner.subtitle}</p>
                    <span className="inline-block bg-white text-primary-600 font-semibold px-6 py-2.5 rounded-full text-sm hover:shadow-lg transition-shadow">
                      Shop Now →
                    </span>
                  </div>
                </div>
              </Link>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
