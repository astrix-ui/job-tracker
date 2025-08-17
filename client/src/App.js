import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CompanyProvider } from './context/CompanyContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import ExploreUsers from './pages/ExploreUsers';
import ConnectionsProgress from './pages/ConnectionsProgress';
import UserProfile from './pages/UserProfile';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
 return (
 <ThemeProvider>
 <ToastProvider>
 <AuthProvider>
 <CompanyProvider>
 <Router>
 <div className="min-h-screen bg-background transition-colors duration-200">
 <Navbar />
 <main className="container mx-auto px-4 py-8">
 <Routes>
 <Route path="/login" element={<Login />} />
 <Route path="/register" element={<Register />} />
 <Route
 path="/dashboard"
 element={
 <ProtectedRoute>
 <Dashboard />
 </ProtectedRoute>
 }
 />
 <Route
 path="/calendar"
 element={
 <ProtectedRoute>
 <Calendar />
 </ProtectedRoute>
 }
 />
 <Route
 path="/profile"
 element={
 <ProtectedRoute>
 <Profile />
 </ProtectedRoute>
 }
 />
 <Route
 path="/explore"
 element={
 <ProtectedRoute>
 <ExploreUsers />
 </ProtectedRoute>
 }
 />
 <Route
 path="/connections"
 element={
 <ProtectedRoute>
 <ConnectionsProgress />
 </ProtectedRoute>
 }
 />
 <Route
 path="/user/:userId"
 element={
 <ProtectedRoute>
 <UserProfile />
 </ProtectedRoute>
 }
 />
 <Route
   path="/notifications"
   element={
     <ProtectedRoute>
       <Notifications />
     </ProtectedRoute>
   }
 />
 <Route path="/about" element={<About />} />
 <Route path="/" element={<Navigate to="/dashboard" replace />} />
 </Routes>
 </main>
 </div>
 </Router>
 </CompanyProvider>
 </AuthProvider>
 </ToastProvider>
 </ThemeProvider>
 );
}

export default App;
