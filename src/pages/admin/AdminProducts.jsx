import React, { useEffect, useState, useRef } from 'react';
import { adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminGetCategories } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiSearch } from 'react-icons/fi';

const EMPTY_FORM = {
  name:'', slug:'', description:'', price:'', mrp:'', sku:'',
  stock_quantity:'', category_id:'', brand:'', is_featured:false, is_active:true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const fileRef = useRef();

  const load = () => {
    setLoading(true);
    adminGetProducts({ search, page, limit: 20 })
      .then(r => { setProducts(r.data.products || r.data); setTotal(r.data.total || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search]);
  useEffect(() => {
    adminGetCategories().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  const handleEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name, slug: p.slug, description: p.description || '', price: p.price,
      mrp: p.mrp || '', sku: p.sku || '', stock_quantity: p.stock_quantity,
      category_id: p.category_id || '', brand: p.brand || '',
      is_featured: p.is_featured, is_active: p.is_active,
    });
    setImages([]);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      images.forEach(f => fd.append('images', f));
      if (editId) {
        await adminUpdateProduct(editId, fd);
        toast.success('Product updated!');
      } else {
        await adminCreateProduct(fd);
        toast.success('Product created!');
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditId(null);
      setImages([]);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    try {
      await adminDeleteProduct(id);
      toast.success('Product deactivated');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const handleImgChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500"
          />
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); setImages([]); }}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors">
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700"><FiX size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Product Name *</label>
                  <input required value={form.name}
                    onChange={e => setForm({...form, name:e.target.value, slug: editId ? form.slug : autoSlug(e.target.value)})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Slug *</label>
                  <input required value={form.slug} onChange={e => setForm({...form, slug:e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
                  <select value={form.category_id} onChange={e => setForm({...form, category_id:e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 bg-white">
                    <option value="">— Select Category —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Price (₹) *</label>
                  <input required type="number" min="0" step="0.01" value={form.price}
                    onChange={e => setForm({...form, price:e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">MRP (₹)</label>
                  <input type="number" min="0" step="0.01" value={form.mrp}
                    onChange={e => setForm({...form, mrp:e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Stock Qty *</label>
                  <input required type="number" min="0" value={form.stock_quantity}
                    onChange={e => setForm({...form, stock_quantity:e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">SKU</label>
                  <input value={form.sku} onChange={e => setForm({...form, sku:e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Brand</label>
                  <input value={form.brand} onChange={e => setForm({...form, brand:e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})} rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 resize-none" />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured:e.target.checked})} className="accent-pink-500" />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active:e.target.checked})} className="accent-pink-500" />
                    Active
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Product Images (max 5)</label>
                  <div onClick={() => fileRef.current.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-primary-300 transition-colors">
                    <FiUpload className="text-gray-300 mx-auto mb-1" size={24} />
                    <p className="text-sm text-gray-400">Click to upload images</p>
                    {images.length > 0 && (
                      <p className="text-xs text-primary-600 font-medium mt-1">{images.length} file(s) selected</p>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImgChange} />
                  {!editId && <p className="text-xs text-gray-400 mt-1">First image will be the primary image</p>}
                  {editId && <p className="text-xs text-gray-400 mt-1">New images will be added to existing ones</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-primary-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60">
                  {saving ? 'Saving...' : (editId ? 'Update Product' : 'Create Product')}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Product</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Price</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Stock</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_,i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td></tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No products found</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.primary_image || 'https://via.placeholder.com/40x40?text=No'}
                        alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category_name || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-900">₹{Number(p.price).toFixed(2)}</p>
                    {p.mrp && <p className="text-xs text-gray-400 line-through">₹{Number(p.mrp).toFixed(2)}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                      ${p.stock_quantity > 10 ? 'bg-green-100 text-green-700' :
                        p.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      {p.is_active ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>
                      )}
                      {p.is_featured && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">★ Featured</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleEdit(p)} className="text-gray-400 hover:text-primary-500 p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
