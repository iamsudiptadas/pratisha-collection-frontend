import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiInstagram, FiFacebook } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-white">Pratisha</span>
              <span className="text-primary-400 font-semibold ml-1">Collection</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Your one-stop shop for quality stationery items. From pens to art supplies — we have everything you need.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <FiInstagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <FiFacebook size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['Pens & Pencils', '/category/pens-pencils'],
                ['Notebooks & Diaries', '/category/notebooks-diaries'],
                ['Art Supplies', '/category/art-supplies'],
                ['Geometry Sets', '/category/geometry-sets'],
                ['Office Stationery', '/category/office-stationery'],
                ['Gift & Craft', '/category/gift-craft'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['My Orders', '/my-orders'],
                ['Track Order', '/my-orders'],
                ['Return & Exchange', '/my-orders'],
                ['Wishlist', '/wishlist'],
                ['My Profile', '/profile'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <FiMapPin size={15} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span>Kolkata, West Bengal, India</span>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone size={15} className="text-primary-400 flex-shrink-0" />
                <a href="tel:+919000000000" className="hover:text-primary-400 transition-colors">+91 90000 00000</a>
              </li>
              <li className="flex items-center gap-2">
                <FiMail size={15} className="text-primary-400 flex-shrink-0" />
                <a href="mailto:care@pratishacollection.in" className="hover:text-primary-400 transition-colors">care@pratishacollection.in</a>
              </li>
            </ul>

            {/* Payment info */}
            <div className="mt-5 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400 font-medium mb-1">💳 Payment Methods</p>
              <p className="text-xs text-gray-500">UPI / QR Code · Bank Transfer</p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Pratisha Collection. All rights reserved.</span>
          <span>Designed & Developed by <span className="text-primary-400">Bengal Partners</span></span>
        </div>
      </div>
    </footer>
  );
}
