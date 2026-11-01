import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { getProducts, getCategories } from '../api';
import ProductCard from '../components/product/ProductCard';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Popularity' },
];

export default function ProductListPage() {
  const { slug } = useParams();           // /category/:slug
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Read current filters from URL
  const currentCategory = slug || searchParams.get('category') || '';
  const currentSearch   = searchParams.get('search') || '';
  const currentFeatured = searchParams.get('featured') || '';
  const currentSort     = searchParams.get('sort') || 'newest';
  const currentPage     = parseInt(searchParams.get('page') || '1');

  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 20,
        sort: currentSort,
      };
      if (currentCategory) params.category = currentCategory;
      if (currentSearch)   params.search   = currentSearch;
      if (currentFeatured) params.featured  = currentFeatured;

      const res = await getProducts(params);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, currentSearch, currentFeatured, currentSort, currentPage]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data));
  }, []);

  const setSort = (sort) => {
    const p = new URLSearchParams(searchParams);
    p.set('sort', sort);
    p.delete('page');
    setSearchParams(p);
  };

  const setPage = (page) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', page);
    setSearchParams(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageTitle = currentSearch
    ? `Search: "${currentSearch}"`
    : currentFeatured ? 'Featured Products'
    : currentCategory
      ? categories.find(c => c.slug === currentCategory)?.name || 'Products'
      : 'All Products';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">{pageTitle}</span>
      </nav>

      <div className="flex gap-6">
        {/* ── Sidebar filters (desktop) ── */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4">Filters</h3>

            {/* Categories */}
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</h4>
              <ul className="space-y-1">
                <li>
                  <Link to="/products"
                    className={`block text-sm px-2 py-1 rounded-lg ${!currentCategory ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    All Categories
                  </Link>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <Link to={`/category/${cat.slug}`}
                      className={`block text-sm px-2 py-1 rounded-lg ${currentCategory === cat.slug ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                      {cat.name}
                      {cat.product_count > 0 && (
                        <span className="ml-1 text-xs text-gray-400">({cat.product_count})</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sort (also available in sidebar on desktop) */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort By</h4>
              <ul className="space-y-1">
                {SORT_OPTIONS.map(opt => (
                  <li key={opt.value}>
                    <button
                      onClick={() => setSort(opt.value)}
                      className={`block w-full text-left text-sm px-2 py-1 rounded-lg ${currentSort === opt.value ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
              {!loading && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {pagination.total || 0} product{pagination.total !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setFiltersOpen(true)}
                className="md:hidden flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-primary-400">
                <FiFilter size={15} /> Filters
              </button>

              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={currentSort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-primary-400 cursor-pointer outline-none focus:border-primary-500">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <FiChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try a different search or category.</p>
              <Link to="/products" className="bg-primary-500 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-primary-600">
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setPage(page)}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-colors
                    ${page === currentPage
                      ? 'bg-primary-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400'}`}>
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setFiltersOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-2xl p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">Filters</h3>
              <button onClick={() => setFiltersOpen(false)}><FiX size={22} /></button>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</h4>
              <ul className="space-y-1">
                <li>
                  <Link to="/products" onClick={() => setFiltersOpen(false)}
                    className={`block text-sm px-3 py-2 rounded-lg ${!currentCategory ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                    All Categories
                  </Link>
                </li>
                {categories.map(cat => (
                  <li key={cat.id}>
                    <Link to={`/category/${cat.slug}`} onClick={() => setFiltersOpen(false)}
                      className={`block text-sm px-3 py-2 rounded-lg ${currentCategory === cat.slug ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sort By</h4>
              <ul className="space-y-1">
                {SORT_OPTIONS.map(opt => (
                  <li key={opt.value}>
                    <button onClick={() => { setSort(opt.value); setFiltersOpen(false); }}
                      className={`block w-full text-left text-sm px-3 py-2 rounded-lg ${currentSort === opt.value ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
