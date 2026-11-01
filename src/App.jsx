import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import Layout from './components/common/Layout';
import AdminLayout from './components/admin/AdminLayout';

// Pages — Public
import HomePage           from './pages/HomePage';
import ProductListPage    from './pages/ProductListPage';
import ProductDetailPage  from './pages/ProductDetailPage';
import CartPage           from './pages/CartPage';
import CheckoutPage       from './pages/CheckoutPage';
import PaymentPage        from './pages/PaymentPage';
import OrderSuccessPage   from './pages/OrderSuccessPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';

// Pages — User Account
import MyOrdersPage       from './pages/MyOrdersPage';
import OrderDetailPage    from './pages/OrderDetailPage';
import WishlistPage       from './pages/WishlistPage';
import ProfilePage        from './pages/ProfilePage';

// Pages — Admin
import AdminDashboard     from './pages/admin/AdminDashboard';
import AdminProducts      from './pages/admin/AdminProducts';
import AdminOrders        from './pages/admin/AdminOrders';
import AdminOrderDetail   from './pages/admin/AdminOrderDetail';
import AdminCategories    from './pages/admin/AdminCategories';
import AdminBanners       from './pages/admin/AdminBanners';
import AdminCustomers     from './pages/admin/AdminCustomers';
import AdminPaymentSettings from './pages/admin/AdminPaymentSettings';
import AdminReviews       from './pages/admin/AdminReviews';

// Protected route wrappers
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
          <Routes>

            {/* ── Public / Customer Routes ── */}
            <Route element={<Layout />}>
              <Route path="/"                  element={<HomePage />} />
              <Route path="/products"          element={<ProductListPage />} />
              <Route path="/category/:slug"    element={<ProductListPage />} />
              <Route path="/product/:slug"     element={<ProductDetailPage />} />
              <Route path="/cart"              element={<CartPage />} />
              <Route path="/login"             element={<LoginPage />} />
              <Route path="/register"          element={<RegisterPage />} />

              {/* Auth-protected */}
              <Route path="/checkout"          element={<RequireAuth><CheckoutPage /></RequireAuth>} />
              <Route path="/payment/:orderId"  element={<RequireAuth><PaymentPage /></RequireAuth>} />
              <Route path="/order-success/:orderId" element={<RequireAuth><OrderSuccessPage /></RequireAuth>} />
              <Route path="/my-orders"         element={<RequireAuth><MyOrdersPage /></RequireAuth>} />
              <Route path="/my-orders/:id"     element={<RequireAuth><OrderDetailPage /></RequireAuth>} />
              <Route path="/wishlist"          element={<RequireAuth><WishlistPage /></RequireAuth>} />
              <Route path="/profile"           element={<RequireAuth><ProfilePage /></RequireAuth>} />
            </Route>

            {/* ── Admin Routes ── */}
            <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
              <Route index                  element={<AdminDashboard />} />
              <Route path="products"        element={<AdminProducts />} />
              <Route path="orders"          element={<AdminOrders />} />
              <Route path="orders/:id"      element={<AdminOrderDetail />} />
              <Route path="categories"      element={<AdminCategories />} />
              <Route path="banners"         element={<AdminBanners />} />
              <Route path="customers"       element={<AdminCustomers />} />
              <Route path="payment-settings" element={<AdminPaymentSettings />} />
              <Route path="reviews"         element={<AdminReviews />} />
            </Route>

          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
