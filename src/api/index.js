import axios from 'axios';
import BASE_URL from './config';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pc_token');
      localStorage.removeItem('pc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────
export const register = (data)  => api.post('/auth/register', data);
export const login    = (data)  => api.post('/auth/login',    data);

// ── Products ─────────────────────────────────────────────────
export const getProducts  = (params) => api.get('/products', { params });
export const getProduct   = (slug)   => api.get(`/products/${slug}`);

// ── Categories ───────────────────────────────────────────────
export const getCategories = () => api.get('/categories');

// ── Cart ─────────────────────────────────────────────────────
export const getCart       = ()           => api.get('/cart');
export const addToCart     = (data)       => api.post('/cart', data);
export const updateCart    = (id, data)   => api.patch(`/cart/${id}`, data);
export const removeFromCart= (id)         => api.delete(`/cart/${id}`);
export const clearCart     = ()           => api.delete('/cart');

// ── Orders ───────────────────────────────────────────────────
export const placeOrder        = (data)       => api.post('/orders', data);
export const getMyOrders       = ()           => api.get('/orders');
export const getOrder          = (id)         => api.get(`/orders/${id}`);
export const uploadPaymentProof= (id, form)   => api.post(`/orders/${id}/payment-screenshot`, form);
export const uploadPaymentScreenshot = uploadPaymentProof;  // alias
export const getOrderDetail = (id) => api.get(`/orders/${id}`);             // alias for getOrder

// ── User ─────────────────────────────────────────────────────
export const getMe          = ()           => api.get('/users/me');
export const getProfile     = getMe;                                               // alias
export const updateProfile  = (data)       => api.patch('/users/me', data);
export const getAddresses   = ()           => api.get('/users/addresses');
export const addAddress     = (data)       => api.post('/users/addresses', data);
export const deleteAddress  = (id)         => api.delete(`/users/addresses/${id}`);
export const getWishlist    = ()           => api.get('/users/wishlist');
export const addToWishlist  = (data)       => api.post('/users/wishlist', data);
export const removeWishlist = (pid)        => api.delete(`/users/wishlist/${pid}`);
export const removeFromWishlist = removeWishlist;                                  // alias

// ── Admin ─────────────────────────────────────────────────────
export const adminDashboard        = ()           => api.get('/admin/dashboard');
export const adminGetProducts      = (params)     => api.get('/admin/products', { params });
export const adminCreateProduct    = (form)       => api.post('/admin/products', form);
export const adminUpdateProduct    = (id, data)   => api.put(`/admin/products/${id}`, data);
export const adminDeleteProduct    = (id)         => api.delete(`/admin/products/${id}`);
export const adminGetOrders        = (params)     => api.get('/admin/orders', { params });
export const adminGetOrder         = (id)         => api.get(`/admin/orders/${id}`);
export const adminUpdateOrderStatus= (id, data)   => api.patch(`/admin/orders/${id}/status`, data);
export const adminVerifyPayment    = (id, data)   => api.patch(`/admin/orders/${id}/verify-payment`, data);
export const adminGetPaymentSettings= ()          => api.get('/admin/payment-settings');
export const adminUpdatePaymentSettings= (form)   => api.put('/admin/payment-settings', form);
export const getPaymentSettings = ()              => api.get('/payment-settings');  // public endpoint
export const adminGetCustomers     = ()           => api.get('/admin/customers');
export const adminGetBanners       = ()           => api.get('/admin/banners');
export const adminAddBanner        = (form)       => api.post('/admin/banners', form);
export const adminCreateBanner     = adminAddBanner;                               // alias
export const adminDeleteBanner     = (id)         => api.delete(`/admin/banners/${id}`);
export const adminGetReviews       = (params)     => api.get('/admin/reviews', { params });
export const adminUpdateReview     = (id, data)   => api.patch(`/admin/reviews/${id}`, data);
export const adminApproveReview    = (id, data)   => api.patch(`/admin/reviews/${id}`, data); // alias
export const adminGetCategories    = ()           => api.get('/admin/categories');
export const adminCreateCategory   = (data)       => api.post('/admin/categories', data);
export const adminUpdateCategory   = (id, data)   => api.put(`/admin/categories/${id}`, data);

export default api;
