import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import FeaturesPage from './pages/public/FeaturesPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import NotFoundPage from './pages/public/NotFoundPage';
import VerificationPortal from './pages/public/VerificationPortal';
import ScannerPage from './pages/public/ScannerPage';

// Guards
import ProtectedRoute from './components/routing/ProtectedRoute';
import RoleGuard from './components/routing/RoleGuard';

// Manufacturer Dashboard Pages
import ManufacturerDashboardLayout from './layouts/ManufacturerDashboardLayout';
import DashboardHome from './pages/manufacturer/DashboardHome';
import ProductsPage from './pages/manufacturer/ProductsPage';
import ProductRegistrationPage from './pages/manufacturer/ProductRegistrationPage';
import ProductDetailsPage from './pages/manufacturer/ProductDetailsPage';
import GenerateQRPage from './pages/manufacturer/GenerateQRPage';
import AnalyticsPage from './pages/manufacturer/AnalyticsPage';
import ReportsPage from './pages/manufacturer/ReportsPage';
import NotificationsPage from './pages/manufacturer/NotificationsPage';
import ProfilePage from './pages/manufacturer/ProfilePage';
import SettingsPage from './pages/manufacturer/SettingsPage';
import HelpPage from './pages/manufacturer/HelpPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import SystemReportsPage from './pages/admin/SystemReportsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify/:productId?" element={<VerificationPortal />} />
          <Route path="/scan" element={<ScannerPage />} />
          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<RoleGuard roles={['admin']} />}>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="reports" element={<SystemReportsPage />} />
          </Route>
        </Route>

        {/* Protected Manufacturer Routes */}
        <Route element={<RoleGuard roles={['manufacturer']} />}>
          <Route path="/manufacturer" element={<ManufacturerDashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductRegistrationPage />} />
            <Route path="products/:id" element={<ProductDetailsPage />} />
            <Route path="generate-qr" element={<GenerateQRPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
