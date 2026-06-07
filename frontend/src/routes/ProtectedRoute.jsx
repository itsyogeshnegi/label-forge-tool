import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent dark:border-slate-100"></div>
          <p className="mt-2 text-xs font-mono tracking-wider text-slate-500">AUTHENTICATING...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page and save the current location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
