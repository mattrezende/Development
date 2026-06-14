
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ScrollToTop from './components/ScrollToTop.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { useTheme } from './hooks/useTheme.js';

// Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import PromotionsPage from './pages/PromotionsPage.jsx';
import MyPurchasesPage from './pages/MyPurchasesPage.jsx';
import TrackOrderPage from './pages/TrackOrderPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ProductManagementPage from './pages/admin/ProductManagementPage.jsx';
import CategoryManagementPage from './pages/admin/CategoryManagementPage.jsx';
import SubcategoryManagementPage from './pages/admin/SubcategoryManagementPage.jsx';
import UserManagementPage from './pages/admin/UserManagementPage.jsx';
import BranchManagementPage from './pages/admin/BranchManagementPage.jsx';
import ShippingZoneManagementPage from './pages/admin/ShippingZoneManagementPage.jsx';
import DeliveryTypeManagementPage from './pages/admin/DeliveryTypeManagementPage.jsx';
import PaymentMethodManagementPage from './pages/admin/PaymentMethodManagementPage.jsx';
import ThemeSettingsPage from './pages/admin/ThemeSettingsPage.jsx';

function AppContent() {
  // Initialize theme on mount
  useTheme();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/promocoes" element={<PromotionsPage />} />
          
          {/* Cart Page is public but handles its own auth state internally to show custom UI */}
          <Route path="/cart" element={<CartPage />} />

          {/* Protected Client Routes */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/minhas-compras" element={
            <ProtectedRoute>
              <MyPurchasesPage />
            </ProtectedRoute>
          } />
          <Route path="/track-order/:orderId" element={
            <ProtectedRoute>
              <TrackOrderPage />
            </ProtectedRoute>
          } />
          <Route path="/acompanhar-compra" element={
            <ProtectedRoute>
              <MyPurchasesPage />
            </ProtectedRoute>
          } />

          {/* Protected Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/produtos" element={
            <ProtectedRoute requireAdmin={true}>
              <ProductManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/categorias" element={
            <ProtectedRoute requireAdmin={true}>
              <CategoryManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/subcategories" element={
            <ProtectedRoute requireAdmin={true}>
              <SubcategoryManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/usuarios" element={
            <ProtectedRoute requireAdmin={true}>
              <UserManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/branches" element={
            <ProtectedRoute requireAdmin={true}>
              <BranchManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/shipping-zones" element={
            <ProtectedRoute requireAdmin={true}>
              <ShippingZoneManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/delivery-types" element={
            <ProtectedRoute requireAdmin={true}>
              <DeliveryTypeManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/payment-methods" element={
            <ProtectedRoute requireAdmin={true}>
              <PaymentMethodManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/theme-settings" element={
            <ProtectedRoute requireAdmin={true}>
              <ThemeSettingsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
          <Toaster />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
