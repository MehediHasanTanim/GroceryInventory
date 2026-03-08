import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './modules/auth/pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './modules/admin/pages/DashboardPage';
import UserManagementPage from './modules/admin/pages/UserManagementPage';
import InventoryPage from './modules/inventory/pages/InventoryPage';
import SupplierPage from './modules/supplier/pages/SupplierPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="sales" element={<div className="glass-card" style={{ padding: '40px' }}>Sales Module - Coming Soon</div>} />
          <Route path="suppliers" element={<SupplierPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
