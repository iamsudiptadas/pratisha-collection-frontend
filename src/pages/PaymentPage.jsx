import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderDetail, getPaymentSettings, uploadPaymentScreenshot } from '../api';
import toast from 'react-hot-toast';
import { FiUpload, FiCheckCircle, FiCopy, FiAlertCircle } from 'react-icons/fi';

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    Promise.all([getOrderDetail(orderId), getPaymentSettings()])
      .then(([o, s]) => { setOrder(o.data); setSettings(s.data); })
      .catch(() => { toast.error('Order not found'); navigate('/my-orders'); })
      .finally(() => setLoading(false));
  }, [orderId, navigate]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('File must be under 5 MB'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) { toast.error('Please select a screenshot first'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('screenshot', file);
      await uploadPaymentScreenshot(orderId, fd);
      setUploaded(true);
      toast.success('Screenshot uploaded! We\'ll verify and confirm your order.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally { setUploading(false); }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <FiAlertCircle size={16} />
          Payment Pending
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Complete Your Payment</h1>
        <p className="text-gray-500 mt-1 text-sm">Order <span className="font-semibold text-gray-700">{order.order_number}</span> — ₹{Number(order.total_amount).toFixed(2)}</p>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {['Pay', 'Upload Proof', 'Order Confirmed'].map((s, i) => (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full
              ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? (uploaded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500') : 'bg-gray-100 text-gray-500'}`}>
              <span>{i + 1}.</span>{s}
            </div>
            {i < 2 && <div className="w-4 h-px bg-gray-200" />}
          </React.Fragment>
        ))}
      </div>

      <div className="space-y-5">
        {/* QR Code section */}
        {settings?.qr_code_url && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4 text-center">Scan & Pay</h2>
            <div className="flex flex-col items-center">
              <img
                src={settings.qr_code_url}
                alt="Payment QR Code"
                className="w-52 h-52 object-contain border-2 border-gray-100 rounded-2xl p-2"
              />
              <p className="text-sm text-gray-500 mt-3 text-center">
                Scan this QR code with any UPI app or banking app to pay
              </p>
              <div className="mt-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-2 text-center">
                <p className="text-xs text-gray-500">Amount to pay</p>
                <p className="text-2xl font-bold text-primary-600">₹{Number(order.total_amount).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bank transfer details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Bank Transfer Details</h2>
          <div className="space-y-3">
            {[
              { label: 'Account Name', value: settings?.account_name || 'Pratisha Collection' },
              { label: 'Account Number', value: settings?.account_number || 'Contact admin' },
              { label: 'IFSC Code', value: settings?.ifsc_code || 'Contact admin' },
              { label: 'Bank', value: settings?.bank_name || 'Contact admin' },
              { label: 'Branch', value: settings?.branch_name || 'Contact admin' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <p className="text-xs text-gray-400">{row.label}</p>
                  <p className="font-semibold text-gray-800 text-sm">{row.value}</p>
                </div>
                <button
                  onClick={() => copy(row.value)}
                  className="text-gray-400 hover:text-primary-500 p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                  <FiCopy size={14} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 bg-gray-50 rounded-xl p-3">
            ⚠️ Please mention your order number <strong>{order.order_number}</strong> in the payment remarks/description.
          </p>
        </div>

        {/* Upload screenshot */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-2">Upload Payment Screenshot</h2>
          <p className="text-sm text-gray-500 mb-4">After payment, upload a screenshot for quick verification.</p>

          {uploaded ? (
            <div className="text-center py-6">
              <FiCheckCircle className="text-green-500 mx-auto mb-2" size={40} />
              <p className="font-semibold text-green-700">Screenshot uploaded successfully!</p>
              <p className="text-sm text-gray-500 mt-1">Our team will verify your payment within 24 hours.</p>
              <Link to={`/my-orders/${orderId}`}
                className="inline-block mt-4 text-primary-600 font-medium text-sm hover:underline">
                Track Order →
              </Link>
            </div>
          ) : (
            <>
              <div
                onClick={() => fileRef.current.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                  ${preview ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'}`}>
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                ) : (
                  <div>
                    <FiUpload className="text-gray-300 mx-auto mb-2" size={32} />
                    <p className="text-sm text-gray-500 font-medium">Click to upload screenshot</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5 MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {file && (
                <p className="text-xs text-gray-500 mt-2 text-center">{file.name}</p>
              )}
              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {uploading ? 'Uploading...' : (
                  <><FiUpload size={16} /> Submit Payment Proof</>
                )}
              </button>
            </>
          )}
        </div>

        {/* Help */}
        <div className="text-center text-sm text-gray-400">
          Need help?{' '}
          <a href="mailto:support@pratishacollection.in" className="text-primary-600 hover:underline">
            Contact us
          </a>
        </div>
      </div>
    </div>
  );
}
