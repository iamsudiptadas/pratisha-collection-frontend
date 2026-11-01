import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}! 👋`);
      navigate(res.data.user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-primary-600">Pratisha</span>
              <span className="text-2xl font-bold text-gray-700"> Collection</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-md shadow-primary-200 disabled:opacity-60 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
