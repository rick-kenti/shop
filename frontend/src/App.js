import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ClerkDashboard from './pages/clerk/ClerkDashboard';
import RecordEntry from './pages/clerk/RecordEntry';
import ClerkSupplyRequests from './pages/clerk/ClerkSupplyRequests';
import AdminDashboard from './pages/admin/AdminDashboard';
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import ManageUsers from './pages/merchant/ManageUsers';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useSelector((state) => state.auth);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public — landing is the true home */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Clerk */}
        <Route path="/clerk/dashboard" element={<ProtectedRoute allowedRoles={['clerk']}><ClerkDashboard /></ProtectedRoute>} />
        <Route path="/clerk/record-entry" element={<ProtectedRoute allowedRoles={['clerk']}><RecordEntry /></ProtectedRoute>} />
        <Route path="/clerk/my-entries" element={<ProtectedRoute allowedRoles={['clerk']}><ClerkDashboard /></ProtectedRoute>} />
        <Route path="/clerk/supply-requests" element={<ProtectedRoute allowedRoles={['clerk']}><ClerkSupplyRequests /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/supply-requests" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/clerks" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

        {/* Merchant */}
        <Route path="/merchant/dashboard" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantDashboard /></ProtectedRoute>} />
        <Route path="/merchant/stores" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantDashboard /></ProtectedRoute>} />
        <Route path="/merchant/admins" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantDashboard /></ProtectedRoute>} />
        <Route path="/merchant/reports" element={<ProtectedRoute allowedRoles={['merchant']}><MerchantDashboard /></ProtectedRoute>} />
        <Route path="/merchant/users" element={<ProtectedRoute allowedRoles={['merchant']}><ManageUsers /></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;