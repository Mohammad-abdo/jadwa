import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin } from 'antd';
import { getCookie } from '../utils/cookies';

const ProtectedRoute = ({ children, requiredRole = null, adminOnly = false }) => {
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    // If AuthContext is not available, return loading state
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }
  
  const { isAuthenticated, loading, user, checkAuth } = authContext;
  const location = useLocation();

  // Check auth on mount and when location changes
  useEffect(() => {
    const token = getCookie("accessToken");
    if (token && !isAuthenticated && !loading) {
      checkAuth();
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Check token in cookies as fallback
  const hasToken = getCookie("accessToken");
  if (!isAuthenticated && !hasToken) {
    // Only redirect if there's no token at all
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we have a token but not authenticated yet, wait a bit
  if (hasToken && !isAuthenticated && !loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Check if admin-only route
  if (adminOnly) {
    const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'ANALYST', 'SUPPORT', 'FINANCE'];
    if (!adminRoles.includes(user?.role)) {
      // Redirect non-admin users to their appropriate dashboard
      if (user?.role === 'CLIENT') {
        return <Navigate to="/client" replace />;
      } else if (user?.role === 'CONSULTANT') {
        return <Navigate to="/consultant" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  // Check role if required
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === 'CLIENT') {
      return <Navigate to="/client" replace />;
    } else if (user?.role === 'CONSULTANT') {
      return <Navigate to="/consultant" replace />;
    } else if (['ADMIN', 'SUPER_ADMIN', 'ANALYST', 'SUPPORT', 'FINANCE'].includes(user?.role)) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

