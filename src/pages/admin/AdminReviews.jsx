import React, { useEffect, useState } from 'react';
import { adminGetReviews, adminApproveReview } from '../../api';
import toast from 'react-hot-toast';
import { FiStar, FiCheck, FiX } from 'react-icons/fi';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const load = () => {
    setLoading(true);
    adminGetReviews({ status: filter })
      .then(r => setReviews(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleAction = async (id, action) => {
    try {
      await adminApproveReview(id, { action });
      toast.success(action === 'approve' ? 'Review approved!' : 'Review rejected');
      load();
    } catch { toast.error('Action failed'); }
  };

  const Stars = ({ rating }) => (
    <div className="flex gap-0.5">
      {Array(5).fill(0).map((_,i) => (
        <FiStar key={i} size={12}
          className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['pending','approved','rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors
              ${filter === f ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          Array(3).fill(0).map((_,i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <p className="text-4xl mb-2">⭐</p>
            <p className="text-gray-500">No {filter} reviews</p>
          </div>
        ) : reviews.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Stars rating={r.rating} />
                  <span className="text-xs text-gray-400">by {r.reviewer_name}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                </div>
                {r.title && <p className="font-semibold text-gray-800 text-sm mb-1">{r.title}</p>}
                {r.body && <p className="text-sm text-gray-600">{r.body}</p>}
                <p className="text-xs text-primary-600 mt-2">Product: {r.product_name}</p>
              </div>

              {filter === 'pending' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleAction(r.id, 'approve')}
                    className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-green-600 transition-colors">
                    <FiCheck size={12} /> Approve
                  </button>
                  <button onClick={() => handleAction(r.id, 'reject')}
                    className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-red-600 transition-colors">
                    <FiX size={12} /> Reject
                  </button>
                </div>
              )}

              {filter !== 'pending' && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0
                  ${filter === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {filter}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
