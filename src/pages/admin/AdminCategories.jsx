import React, { useEffect, useState } from 'react';
import { adminGetCategories, adminCreateCategory, adminUpdateCategory } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiX, FiSave } from 'react-icons/fi';

const EMPTY = { name:'', slug:'', description:'', is_active:true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminGetCategories().then(r => setCategories(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await adminUpdateCategory(editId, form);
        toast.success('Category updated!');
      } else {
        await adminCreateCategory(form);
        toast.success('Category created!');
      }
      setShowForm(false);
      setForm(EMPTY);
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setSaving(false); }
  };

  const handleEdit = (cat) => {
    setEditId(cat.id);
    setForm({ name:cat.name, slug:cat.slug, description:cat.description||'', is_active:cat.is_active });
    setShowForm(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-gray-800">Categories</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); }}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors">
          <FiPlus size={16} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-primary-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">{editId ? 'Edit Category' : 'New Category'}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700"><FiX size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Name *</label>
                <input required value={form.name}
                  onChange={e => setForm({...form, name:e.target.value, slug: editId ? form.slug : autoSlug(e.target.value)})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Slug *</label>
                <input required value={form.slug} onChange={e => setForm({...form, slug:e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                <input value={form.description} onChange={e => setForm({...form, description:e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active:e.target.checked})} className="accent-pink-500" />
                Active
              </label>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60">
                <FiSave size={14} /> {saving ? 'Saving...' : (editId ? 'Update' : 'Create')}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Slug</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Products</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array(4).fill(0).map((_,i) => (
                <tr key={i}><td colSpan={5} className="px-5 py-4">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                </td></tr>
              ))
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No categories yet</td></tr>
            ) : categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{cat.name}</td>
                <td className="px-5 py-3 text-gray-500 text-xs font-mono">{cat.slug}</td>
                <td className="px-5 py-3 text-gray-600">{cat.product_count || 0}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => handleEdit(cat)} className="text-gray-400 hover:text-primary-500 p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                    <FiEdit2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
