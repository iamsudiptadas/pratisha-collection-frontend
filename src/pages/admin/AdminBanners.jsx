import React, { useEffect, useState, useRef } from 'react';
import { adminGetBanners, adminCreateBanner, adminDeleteBanner } from '../../api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title:'', subtitle:'', cta_text:'', cta_link:'', sort_order:0, is_active:true });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const load = () => {
    setLoading(true);
    adminGetBanners().then(r => setBanners(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a banner image'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      fd.append('image', file);
      await adminCreateBanner(fd);
      toast.success('Banner added!');
      setForm({ title:'', subtitle:'', cta_text:'', cta_link:'', sort_order:0, is_active:true });
      setFile(null); setPreview(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await adminDeleteBanner(id);
      toast.success('Banner deleted');
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-5">
      {/* Upload form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4">Add Banner</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Title</label>
              <input value={form.title} onChange={e => setForm({...form, title:e.target.value})}
                placeholder="Banner headline"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Subtitle</label>
              <input value={form.subtitle} onChange={e => setForm({...form, subtitle:e.target.value})}
                placeholder="Subtext"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">CTA Text</label>
              <input value={form.cta_text} onChange={e => setForm({...form, cta_text:e.target.value})}
                placeholder="e.g. Shop Now"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">CTA Link</label>
              <input value={form.cta_link} onChange={e => setForm({...form, cta_link:e.target.value})}
                placeholder="/products"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order:e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer self-end pb-2.5">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active:e.target.checked})} className="accent-pink-500" />
              Active
            </label>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Banner Image *</label>
            <div onClick={() => fileRef.current.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors
                ${preview ? 'border-primary-300' : 'border-gray-200 hover:border-primary-300'}`}>
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded-lg object-contain" />
              ) : (
                <>
                  <FiUpload className="text-gray-300 mx-auto mb-2" size={28} />
                  <p className="text-sm text-gray-400">Click to upload banner image</p>
                  <p className="text-xs text-gray-300 mt-1">Recommended: 1200×400px, JPG/PNG</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60">
            <FiPlus size={14} /> {saving ? 'Uploading...' : 'Add Banner'}
          </button>
        </form>
      </div>

      {/* Existing banners */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Current Banners</h2>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : banners.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No banners yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {banners.map(b => (
              <div key={b.id} className="flex items-center gap-4 px-5 py-3">
                <img src={b.image_url} alt={b.title} className="w-24 h-14 object-cover rounded-xl border border-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">{b.title || '(No title)'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{b.subtitle || ''}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-400">Order: {b.sort_order}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(b.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors p-1.5 flex-shrink-0">
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
