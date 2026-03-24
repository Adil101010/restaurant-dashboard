import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import OfflineBanner from './components/common/OfflineBanner';
import { CircularProgress, Box } from '@mui/material';


const LoginPage      = lazy(() => import('./pages/LoginPage'));
const SignupPage     = lazy(() => import('./pages/SignupPage'));   
const DashboardPage  = lazy(() => import('./pages/DashboardPage'));
const MenuPage       = lazy(() => import('./pages/MenuPage'));
const OrdersPage     = lazy(() => import('./pages/OrdersPage'));
const ProfilePage    = lazy(() => import('./pages/ProfilePage'));
const SettingsPage   = lazy(() => import('./pages/SettingsPage'));
const PromotionsPage = lazy(() => import('./pages/PromotionsPage'));

const PageLoader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
    <CircularProgress sx={{ color: '#FF6B35' }} />
  </Box>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <OfflineBanner />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '8px', fontFamily: 'Inter, Roboto, sans-serif' },
              success: { iconTheme: { primary: '#FF6B35', secondary: '#fff' } },
            }}
          />
          <Suspense fallback={<PageLoader />}>
            <Routes>

              
              <Route path="/login"  element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />  

              
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/"            element={<DashboardPage />} />
                  <Route path="/menu"        element={<MenuPage />} />
                  <Route path="/orders"      element={<OrdersPage />} />
                  <Route path="/profile"     element={<ProfilePage />} />
                  <Route path="/settings"    element={<SettingsPage />} />
                  <Route path="/promotions"  element={<PromotionsPage />} />
                </Route>
              </Route>

              
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
