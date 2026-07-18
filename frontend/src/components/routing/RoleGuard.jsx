import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../ui/Loader';

const RoleGuard = ({ roles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user?.role)) {
    // If authenticated but wrong role, send them to their respective dash
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'manufacturer') return <Navigate to="/manufacturer" replace />;
    return <Navigate to="/" replace />; // fallback
  }

  return <Outlet />;
};

export default RoleGuard;
