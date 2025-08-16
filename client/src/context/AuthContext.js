import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
 const context = useContext(AuthContext);
 if (!context) {
 throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
};

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 checkAuthStatus();
 }, []);

 const checkAuthStatus = async () => {
 try {
 // Skip auth check if on login or register pages to avoid unnecessary API calls
 const currentPath = window.location.pathname;
 if (currentPath === '/login' || currentPath === '/register') {
 setUser(null);
 setLoading(false);
 return;
 }
 
 const response = await authAPI.getCurrentUser();
 setUser(response.data.user);
 } catch (error) {
 setUser(null);
 } finally {
 setLoading(false);
 }
 };

 const login = async (credentials) => {
 try {
 const response = await authAPI.login(credentials);
 setUser(response.data.user);
 return { success: true };
 } catch (error) {
 return { 
 success: false, 
 error: error.response?.data?.error || 'Login failed' 
 };
 }
 };

 const register = async (userData) => {
 try {
 const response = await authAPI.register(userData);
 setUser(response.data.user);
 return { success: true };
 } catch (error) {
 return { 
 success: false, 
 error: error.response?.data?.error || 'Registration failed' 
 };
 }
 };

 const logout = async () => {
 try {
 await authAPI.logout();
 setUser(null);
 } catch (error) {
 console.error('Logout error:', error);
 setUser(null);
 }
 };

 const updateUser = async (userData) => {
 try {
 const response = await authAPI.updateProfile(userData);
 setUser(response.data.user);
 return { success: true };
 } catch (error) {
 return { 
 success: false, 
 error: error.response?.data?.error || 'Update failed' 
 };
 }
 };

 const deleteAccount = async () => {
   try {
     await authAPI.deleteAccount();
     setUser(null);
     return { success: true };
   } catch (error) {
     return { 
       success: false, 
       error: error.response?.data?.error || 'Delete account failed' 
     };
   }
 };

 const value = {
 user,
 loading,
 login,
 register,
 logout,
 updateUser,
 deleteAccount,
 isAuthenticated: !!user
 };

 return (
 <AuthContext.Provider value={value}>
 {children}
 </AuthContext.Provider>
 );
};
