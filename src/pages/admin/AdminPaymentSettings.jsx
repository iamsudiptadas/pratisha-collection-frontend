import React, { useEffect, useState, useRef } from 'react';
import { getPaymentSettings, adminUpdatePaymentSettings } from '../../api';
import toast from 'react-hot-toast';
import { FiSave, FiUpload } from 'react-icons/fi';

export default function AdminPaymentSettings() {
  const [settings, setSettings] = useState({
    account_name:'', account_number:'', ifsc_code:'', bank_name:'', branch_name:'', upi_id:''
  });
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef();

  useEffect(() => {
    getPaymentSettings()
      .then(r => {
        const d = r.data;
        setSettings({
          account_name: d.account_name || '',
          account_number: d.account_number || '',
          ifsc_code: d.ifsc_code || '',
          bank_name: d.bank_name || '',
          branch_name: d.branch_name || '',
          upi_id: d.upi_id || '',
        });
        if (d.qr_code_url) setQrPreview(d.qr_code_url);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setQrFile(f);
    setQrPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(settings).forEach(([k,v]) => { if (v) fd.append(k, v); });
      if (qrFile) fd.append('qr_code', qrFile);
      await adminUpdatePaymentSettings(fd);
      toast.success('Payment settings saved!');
      setQrFile(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-1">Payment Settings</h2>
        <p className="text-sm text-gray-500 mb-5">These details are shown to customers during checkout.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Bank details */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Bank Account Details</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { key:'account_name', label:'Account Holder Name', placeholder:'e.g. Pratisha Collection' },
                { key:'account_number', label:'Account Number', placeholder:'Enter account number' },
                { key:'ifsc_code', label:'IFSC Code', placeholder:'e.g. SBIN0001234' },
                { key:'bank_name', label:'Bank Name', placeholder:'e.g. State Bank of India' },
                { key:'branch_name', label:'Branch Name', placeholder:'e.g. Park Street, Kolkata' },
                { key:'upi_id', label:'UPI ID (optional)', placeholder:'e.g. pratisha@sbi' },
              ].map(f => (
                <div key={f.key} className={f.key === 'upi_id' ? 'sm:col-span-2' : ''}>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{f.label}</label>
                  <input value={settings[f.key]} onChange={e => setSettings({...settings, [f.key]:e.target.value})}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
                </div>
              ))}
            </div>
          </div>

          {/* QR code */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Payment QR Code</h3>
            <div className="flex gap-5 items-start">
              {qrPreview && (
                <div className="flex-shrink-0">
                  <img src={qrPreview} alt="QR Code" className="w-36 h-36 object-contain border-2 border-gray-100 rounded-xl p-2" />
                  <p className="text-xs text-gray-400 text-center mt-1">Current QR</p>
                </div>
              )}
              <div className="flex-1">
                <div onClick={() => fileRef.current.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-primary-300 transition-colors">
                  <FiUpload className="text-gray-300 mx-auto mb-2" size={24} />
                  <p className="text-sm text-gray-500 font-medium">
                    {qrPreview ? 'Click to replace QR code' : 'Upload bank QR code'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG or JPG, clear QR code image</p>
                  {qrFile && <p className="text-xs text-primary-600 font-medium mt-1">{qrFile.name}</p>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-semibold mb-1">ℹ️ How it works:</p>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>Customers see your bank details and QR code on the payment page</li>
              <li>They make a transfer and upload a screenshot as proof</li>
              <li>You verify the payment from Admin → Orders → View Order</li>
              <li>Once approved, the order status auto-updates to "Confirmed"</li>
            </ul>
          </div>

          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60 shadow-md shadow-primary-200">
            <FiSave size={16} /> {saving ? 'Saving...' : 'Save Payment Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
