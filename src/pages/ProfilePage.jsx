import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, getAddresses, addAddress, deleteAddress } from '../api';
import toast from 'react-hot-toast';
import { FiUser, FiMapPin, FiPlus, FiTrash2, FiEdit2, FiSave, FiX } from 'react-icons/fi';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Puducherry','Chandigarh',
];

const EMPTY_ADDR = { full_name:'', phone:'', address_line1:'', address_line2:'', city:'', state:'West Bengal', pincode:'', is_default:false };

export default function ProfilePage() {
  const { user, loginUser } = useAuth();

  const [profile, setProfile] = useState({ name: user?.name || '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [newAddr, setNewAddr] = useState(EMPTY_ADDR);
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    getProfile().then(r => setProfile(r.data)).catch(() => {});
    getAddresses().then(r => setAddresses(r.data)).catch(() => {});
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateProfile({ name: profile.name, phone: profile.phone });
      loginUser(res.data, localStorage.getItem('pc_token'));
      setEditingProfile(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setSavingProfile(false); }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      const res = await addAddress(newAddr);
      setAddresses(prev => [...prev, res.data]);
      setShowAddrForm(false);
      setNewAddr(EMPTY_ADDR);
      toast.success('Address added!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save address');
    } finally { setSavingAddr(false); }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <FiUser className="text-primary-500" /> My Profile
          </h2>
          {!editingProfile && (
            <button onClick={() => setEditingProfile(true)}
              className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:underline">
              <FiEdit2 size={14} /> Edit
            </button>
          )}
        </div>

        {editingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name</label>
              <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
              <input value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="10-digit phone number" maxLength={10} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
              <input value={user?.email || ''} disabled
                className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={savingProfile}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                <FiSave size={14} /> {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setEditingProfile(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <FiX size={14} /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {[
              { label: 'Full Name', value: profile.name || user?.name },
              { label: 'Email', value: user?.email },
              { label: 'Phone', value: profile.phone || '—' },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{row.label}</span>
                <span className="text-sm font-medium text-gray-800">{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Addresses */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <FiMapPin className="text-primary-500" /> Saved Addresses
          </h2>
          <button onClick={() => setShowAddrForm(!showAddrForm)}
            className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:underline">
            <FiPlus size={14} /> Add New
          </button>
        </div>

        {/* Saved list */}
        {addresses.length === 0 && !showAddrForm ? (
          <p className="text-sm text-gray-400 text-center py-4">No saved addresses yet.</p>
        ) : (
          <div className="space-y-3 mb-4">
            {addresses.map(addr => (
              <div key={addr.id} className="flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-gray-800">{addr.full_name} — {addr.phone}</p>
                  <p className="text-gray-600 text-xs mt-0.5">
                    {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}, {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                  {addr.is_default && (
                    <span className="text-xs text-primary-600 font-medium">Default</span>
                  )}
                </div>
                <button onClick={() => handleDeleteAddress(addr.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors p-1 self-start">
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add address form */}
        {showAddrForm && (
          <form onSubmit={handleSaveAddress} className="border-t border-gray-100 pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">New Address</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                <input required value={newAddr.full_name} onChange={e => setNewAddr({...newAddr, full_name:e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Phone *</label>
                <input required value={newAddr.phone} onChange={e => setNewAddr({...newAddr, phone:e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" maxLength={10} />
              </div>
            </div>
            <input required value={newAddr.address_line1} onChange={e => setNewAddr({...newAddr, address_line1:e.target.value})}
              placeholder="Address Line 1 *"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
            <input value={newAddr.address_line2} onChange={e => setNewAddr({...newAddr, address_line2:e.target.value})}
              placeholder="Address Line 2 (optional)"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
            <div className="grid grid-cols-3 gap-3">
              <input required value={newAddr.city} onChange={e => setNewAddr({...newAddr, city:e.target.value})}
                placeholder="City *"
                className="col-span-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
              <select value={newAddr.state} onChange={e => setNewAddr({...newAddr, state:e.target.value})}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 bg-white">
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
              <input required value={newAddr.pincode} onChange={e => setNewAddr({...newAddr, pincode:e.target.value})}
                placeholder="PIN *" maxLength={6}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={newAddr.is_default} onChange={e => setNewAddr({...newAddr, is_default:e.target.checked})} className="accent-pink-500" />
              Set as default
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={savingAddr}
                className="flex-1 bg-primary-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60">
                {savingAddr ? 'Saving...' : 'Save Address'}
              </button>
              <button type="button" onClick={() => { setShowAddrForm(false); setNewAddr(EMPTY_ADDR); }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
