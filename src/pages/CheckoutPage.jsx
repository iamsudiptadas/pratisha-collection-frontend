import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getAddresses, addAddress, placeOrder } from '../api';
import toast from 'react-hot-toast';
import { FiMapPin, FiPlus, FiCheck } from 'react-icons/fi';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Puducherry','Chandigarh',
];

const EMPTY_ADDR = { full_name:'', phone:'', address_line1:'', address_line2:'', city:'', state:'West Bengal', pincode:'', is_default:false };

export default function CheckoutPage() {
  const { items, total, emptyCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [newAddr, setNewAddr] = useState(EMPTY_ADDR);
  const [savingAddr, setSavingAddr] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (items.length === 0) { navigate('/cart'); return; }
    getAddresses()
      .then(r => {
        setAddresses(r.data);
        const def = r.data.find(a => a.is_default) || r.data[0];
        if (def) setSelectedAddr(def.id);
        else setShowNewAddr(true);
      })
      .catch(() => setShowNewAddr(true));
  }, [items.length, navigate]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      const res = await addAddress(newAddr);
      setAddresses(prev => [...prev, res.data]);
      setSelectedAddr(res.data.id);
      setShowNewAddr(false);
      setNewAddr(EMPTY_ADDR);
      toast.success('Address saved!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save address');
    } finally { setSavingAddr(false); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddr) { toast.error('Please select a delivery address'); return; }
    setPlacing(true);
    try {
      const res = await placeOrder({ address_id: selectedAddr, notes });
      emptyCart();
      navigate(`/payment/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  const shipping = total >= 499 ? 0 : 49;
  const grandTotal = total + shipping;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Address */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <FiMapPin className="text-primary-500" /> Delivery Address
              </h2>
              {addresses.length > 0 && (
                <button
                  onClick={() => setShowNewAddr(!showNewAddr)}
                  className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:underline">
                  <FiPlus size={14} /> Add New
                </button>
              )}
            </div>

            {/* Saved addresses */}
            {addresses.length > 0 && !showNewAddr && (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <label key={addr.id}
                    className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors
                      ${selectedAddr === addr.id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddr === addr.id}
                      onChange={() => setSelectedAddr(addr.id)}
                      className="mt-1 accent-pink-500"
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-gray-800">{addr.full_name} — {addr.phone}</p>
                      <p className="text-gray-600 mt-0.5">
                        {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''},{' '}
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                      {addr.is_default && (
                        <span className="text-xs text-primary-600 font-medium">Default</span>
                      )}
                    </div>
                    {selectedAddr === addr.id && (
                      <FiCheck className="ml-auto text-primary-500 flex-shrink-0 mt-1" size={18} />
                    )}
                  </label>
                ))}
              </div>
            )}

            {/* New address form */}
            {(showNewAddr || addresses.length === 0) && (
              <form onSubmit={handleSaveAddress} className="space-y-3 mt-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                    <input required value={newAddr.full_name}
                      onChange={e => setNewAddr({...newAddr, full_name: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      placeholder="Recipient's full name" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Phone *</label>
                    <input required value={newAddr.phone}
                      onChange={e => setNewAddr({...newAddr, phone: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      placeholder="10-digit mobile number" maxLength={10} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Address Line 1 *</label>
                  <input required value={newAddr.address_line1}
                    onChange={e => setNewAddr({...newAddr, address_line1: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="House no., street, area" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Address Line 2</label>
                  <input value={newAddr.address_line2}
                    onChange={e => setNewAddr({...newAddr, address_line2: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    placeholder="Landmark, locality (optional)" />
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">City *</label>
                    <input required value={newAddr.city}
                      onChange={e => setNewAddr({...newAddr, city: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      placeholder="City" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">State *</label>
                    <select required value={newAddr.state}
                      onChange={e => setNewAddr({...newAddr, state: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 bg-white">
                      {STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">PIN Code *</label>
                    <input required value={newAddr.pincode}
                      onChange={e => setNewAddr({...newAddr, pincode: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      placeholder="6-digit PIN" maxLength={6} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={newAddr.is_default}
                    onChange={e => setNewAddr({...newAddr, is_default: e.target.checked})}
                    className="accent-pink-500" />
                  Set as default address
                </label>
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={savingAddr}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                    {savingAddr ? 'Saving...' : 'Save Address'}
                  </button>
                  {addresses.length > 0 && (
                    <button type="button" onClick={() => setShowNewAddr(false)}
                      className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Order notes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">Order Notes (Optional)</h2>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Any special instructions for your order..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-none"
            />
          </div>
        </div>

        {/* Right: Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-4">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>

            {/* Items */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex gap-2 text-sm">
                  <img
                    src={item.image_url || 'https://via.placeholder.com/40x40'}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-xs line-clamp-1">{item.name}</p>
                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-gray-900 text-xs flex-shrink-0">
                    ₹{(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                <span>Total</span><span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing || !selectedAddr}
              className="w-full mt-5 bg-primary-500 hover:bg-primary-600 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-md shadow-primary-200 disabled:opacity-60">
              {placing ? 'Placing Order...' : `Place Order — ₹${grandTotal.toFixed(2)}`}
            </button>

            <p className="text-xs text-center text-gray-400 mt-3">
              Next step: Pay via QR code or bank transfer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
