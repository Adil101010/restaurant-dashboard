import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';

// Placeholder pages — baad mein replace honge
const DashboardPage = () => <div style={{ padding: 20 }}>📊 Dashboard — Coming Day 4</div>;
const MenuPage = () => <div style={{ padding: 20 }}>🍽️ Menu — Coming Day 6</div>;
const OrdersPage = () => <div style={{ padding: 20 }}>📦 Orders — Coming Day 8</div>;
const ProfilePage = () => <div style={{ padding: 20 }}>🏪 Profile — Coming Day 12</div>;
const SettingsPage = () => <div style={{ padding: 20 }}>⚙️ Settings — Coming Day 14</div>;

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
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
