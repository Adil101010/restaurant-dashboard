import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage.tsx';


// Placeholder pages — baad mein replace honge
const DashboardPage = () => (
  <div style={{ padding: 20 }}>
    <h2>📊 Dashboard</h2>
    <p>Analytics coming on Day 4!</p>
  </div>
);
const MenuPage = () => (
  <div style={{ padding: 20 }}>
    <h2>🍽️ Menu Management</h2>
    <p>Coming on Day 6!</p>
  </div>
);
const OrdersPage = () => (
  <div style={{ padding: 20 }}>
    <h2>📦 Orders</h2>
    <p>Coming on Day 8!</p>
  </div>
);
const ProfilePage = () => (
  <div style={{ padding: 20 }}>
    <h2>🏪 Restaurant Profile</h2>
    <p>Coming on Day 12!</p>
  </div>
);
const SettingsPage = () => (
  <div style={{ padding: 20 }}>
    <h2>⚙️ Settings</h2>
    <p>Coming on Day 14!</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '8px',
              fontFamily: 'Inter, Roboto, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#FF6B35',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes — Layout ke andar */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
