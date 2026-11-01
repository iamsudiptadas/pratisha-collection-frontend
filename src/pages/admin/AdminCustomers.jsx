import React, { useEffect, useState } from 'react';
import { adminGetCustomers } from '../../api';
import { FiSearch, FiUser } from 'react-icons/fi';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminGetCustomers()
      .then(r => setCustomers(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search customers by name or email..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500 bg-white"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">
            Customers <span className="text-gray-400 font-normal">({filtered.length})</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Orders</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_,i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No customers found</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">
                        {c.name?.charAt(0).toUpperCase() || <FiUser size={12} />}
                      </div>
                      <span className="font-medium text-gray-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{c.email}</td>
                  <td className="px-5 py-3 text-gray-600">{c.phone || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-gray-900">{c.order_count || 0}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(c.created_at).toLocaleDateString('en-IN')}
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
