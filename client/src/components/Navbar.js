import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCompany } from '../context/CompanyContext';
import NotificationPanel from './NotificationPanel';

const Navbar = () => {
 const { user, logout, isAuthenticated } = useAuth();
 const { isDark, toggleTheme } = useTheme();
 const { companies } = useCompany();
 const location = useLocation();
 const navigate = useNavigate();
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 const [isNotificationOpen, setIsNotificationOpen] = useState(false);

 // Calculate notification count for upcoming actions within 3 days
 const notificationCount = useMemo(() => {
 if (!isAuthenticated || !companies) return 0;
 
 const today = new Date();
 const threeDaysFromNow = new Date();
 threeDaysFromNow.setDate(today.getDate() + 3);
 
 today.setHours(0, 0, 0, 0);
 threeDaysFromNow.setHours(23, 59, 59, 999);

 return companies.filter(company => {
 if (!company.nextActionDate) return false;
 
 const actionDate = new Date(company.nextActionDate);
 actionDate.setHours(0, 0, 0, 0);
 
 return actionDate >= today && actionDate <= threeDaysFromNow;
 }).length;
 }, [companies, isAuthenticated]);

 const handleLogout = async () => {
 await logout();
 navigate('/login');
 setIsMenuOpen(false);
 setIsNotificationOpen(false);
 };

 const isActive = (path) => location.pathname === path;

 const navLinks = [
 { path: '/dashboard', label: 'Dashboard', requireAuth: true },
 { path: '/calendar', label: 'Calendar', requireAuth: true },
 { path: '/profile', label: 'Profile', requireAuth: true },
 { path: '/about', label: 'About', requireAuth: false },
 ];

 return (
 <nav className="bg-card shadow-lg border-b border-border sticky top-0 z-50">
 <div className="container mx-auto px-4">
 <div className="flex justify-between items-center h-16">
 {/* Logo */}
 <Link 
 to="/" 
 className="flex items-center space-x-2 text-xl font-bold text-foreground"
 >
 <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
 <span className="text-accent-foreground font-bold">JT</span>
 </div>
 <span>Job Tracker</span>
 </Link>

 {/* Desktop Navigation */}
 <div className="hidden md:flex items-center space-x-6">
 {navLinks.map(link => (
 (!link.requireAuth || isAuthenticated) && (
 <Link
 key={link.path}
 to={link.path}
 className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
 isActive(link.path)
 ? 'bg-accent text-accent-foreground'
 : 'text-muted-foreground hover:text-foreground hover:bg-muted'
 }`}
 >
 {link.label}
 </Link>
 )
 ))}

 {/* Notifications */}
 {isAuthenticated && (
 <div className="relative">
 <button
 onClick={() => setIsNotificationOpen(!isNotificationOpen)}
 className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
 aria-label="Notifications"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" />
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
 </svg>
 {notificationCount > 0 && (
 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
 {notificationCount > 9 ? '9+' : notificationCount}
 </span>
 )}
 </button>
 <NotificationPanel 
 isOpen={isNotificationOpen} 
 onClose={() => setIsNotificationOpen(false)} 
 />
 </div>
 )}

 {/* Theme Toggle */}
 <button
 onClick={toggleTheme}
 className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
 aria-label="Toggle theme"
 >
 {isDark ? (
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
 </svg>
 ) : (
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
 <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
 </svg>
 )}
 </button>

 {/* Auth Buttons */}
 {isAuthenticated ? (
 <div className="flex items-center space-x-4">
 <span className="text-sm text-muted-foreground">
 Welcome, {user?.username}
 </span>
 <button
 onClick={handleLogout}
 className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
 >
 Logout
 </button>
 </div>
 ) : (
 <div className="flex items-center space-x-2">
 <Link
 to="/login"
 className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
 >
 Login
 </Link>
 <Link
 to="/register"
 className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
 >
 Register
 </Link>
 </div>
 )}
 </div>

 {/* Mobile menu button */}
 <div className="md:hidden">
 <button
 onClick={() => setIsMenuOpen(!isMenuOpen)}
 className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
 >
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 {isMenuOpen ? (
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 ) : (
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
 )}
 </svg>
 </button>
 </div>
 </div>

 {/* Mobile Navigation Overlay */}
 {isMenuOpen && (
 <div className="fixed inset-0 z-50 md:hidden">
 {/* Backdrop */}
 <div 
 className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
 onClick={() => setIsMenuOpen(false)}
 />
 
 {/* Slide-in Drawer */}
 <div className={`fixed top-0 right-0 h-full w-80 max-w-sm bg-card shadow-xl transform transition-transform duration-300 ease-in-out ${
 isMenuOpen ? 'translate-x-0' : 'translate-x-full'
 }`}>
 {/* Drawer Header */}
 <div className="flex items-center justify-between p-4 border-b border-border">
 <div className="flex items-center space-x-2">
 <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
 <span className="text-accent-foreground font-bold">JT</span>
 </div>
 <span className="text-lg font-bold text-foreground">Job Tracker</span>
 </div>
 <button
 onClick={() => setIsMenuOpen(false)}
 className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
 >
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 {/* Drawer Content */}
 <div className="flex flex-col h-full">
 {/* Navigation Links */}
 <div className="flex-1 py-4">
 <div className="space-y-1 px-4">
 {navLinks.map(link => (
 (!link.requireAuth || isAuthenticated) && (
 <Link
 key={link.path}
 to={link.path}
 onClick={() => setIsMenuOpen(false)}
 className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
 isActive(link.path)
 ? 'bg-accent text-accent-foreground'
 : 'text-muted-foreground hover:text-foreground hover:bg-muted'
 }`}
 >
 {link.label}
 </Link>
 )
 ))}
 </div>

 {/* Notifications Section */}
 {isAuthenticated && (
 <div className="px-4 py-4 border-t border-border mt-4">
 <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-muted transition-colors">
 <span className="text-sm font-medium text-foreground">Notifications</span>
 <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
 {notificationCount > 9 ? '9+' : notificationCount}
 </span>
 </div>
 <div className="mt-2 text-xs text-muted-foreground px-4">
 {notificationCount > 0 
   ? `${notificationCount} upcoming action${notificationCount !== 1 ? 's' : ''} in the next 3 days`
   : 'No upcoming actions in the next 3 days'
 }
 </div>
 </div>
 )}

 {/* Theme Toggle Section */}
 <div className="px-4 py-4 border-t border-border mt-4">
 <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-muted transition-colors">
 <span className="text-sm font-medium text-foreground">Theme</span>
 <button
 onClick={toggleTheme}
 className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
 >
 {isDark ? (
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
 </svg>
 ) : (
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
 <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
 </svg>
 )}
 </button>
 </div>
 </div>
 </div>

 {/* User Section */}
 <div className="border-t border-border p-4">
 {isAuthenticated ? (
 <div className="space-y-3">
 <div className="px-4 py-2">
 <p className="text-sm text-muted-foreground">Signed in as</p>
 <p className="text-sm font-medium text-foreground">{user?.username}</p>
 </div>
 <button
 onClick={handleLogout}
 className="w-full px-4 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium"
 >
 Sign Out
 </button>
 </div>
 ) : (
 <div className="space-y-2">
 <Link
 to="/login"
 onClick={() => setIsMenuOpen(false)}
 className="block w-full px-4 py-3 text-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors font-medium"
 >
 Sign In
 </Link>
 <Link
 to="/register"
 onClick={() => setIsMenuOpen(false)}
 className="block w-full px-4 py-3 text-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
 >
 Sign Up
 </Link>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </nav>
 );
};

export default Navbar;
