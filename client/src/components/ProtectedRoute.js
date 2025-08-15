import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
 const { isAuthenticated, loading } = useAuth();
 const location = useLocation();

 if (loading) {
 return (
 <div className="flex justify-center items-center min-h-screen">
 <LoadingSpinner size="large" />
 </div>
 );
 }

 if (!isAuthenticated) {
 // Redirect to login page with return url
 return <Navigate to="/login" state={{ from: location }} replace />;
 }

 return children;
};

export default ProtectedRoute;
