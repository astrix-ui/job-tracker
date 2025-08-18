import React, { useState, useMemo, useEffect } from 'react';
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
  const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);

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

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close users dropdown if clicking outside
      if (isUsersDropdownOpen && !event.target.closest('.users-dropdown')) {
        setIsUsersDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUsersDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMenuOpen(false);
    setIsNotificationOpen(false);
    setIsUsersDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', requireAuth: true },
    { path: '/calendar', label: 'Calendar', requireAuth: true },
    { path: '/about', label: 'About', requireAuth: false },
  ];

  const usersDropdownLinks = [
    { path: '/explore', label: 'Explore Users', requireAuth: true },
    { path: '/connections', label: 'Connections', requireAuth: true },
  ];

  const mobileNavLinks = [
    { path: '/dashboard', label: 'Dashboard', requireAuth: true },
    { path: '/calendar', label: 'Calendar', requireAuth: true },
    { path: '/explore', label: 'Explore Users', requireAuth: true },
    { path: '/connections', label: 'Connections', requireAuth: true },
    { path: '/about', label: 'About', requireAuth: false },
    { path: '/notifications', label: 'Notifications', requireAuth: true },
    { path: '/profile', label: 'Profile', requireAuth: true },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-foreground to-foreground/80 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <span className="text-background font-bold text-sm">JT</span>
            </div>
            <span className="text-lg font-semibold text-foreground hidden sm:block">Job Tracker</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map(link => (
              (!link.requireAuth || isAuthenticated) && (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-foreground text-background shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}

            {/* Users Dropdown */}
            {isAuthenticated && (
              <div className="relative users-dropdown">
                <button
                  onClick={() => setIsUsersDropdownOpen(!isUsersDropdownOpen)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                    (isActive('/explore') || isActive('/connections'))
                      ? 'bg-foreground text-background shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <span>Users</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isUsersDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {isUsersDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-background border border-border/50 rounded-xl shadow-lg z-50 py-2">
                    {usersDropdownLinks.map(link => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsUsersDropdownOpen(false)}
                        className={`block px-4 py-3 text-sm font-medium transition-all duration-200 ${
                          isActive(link.path)
                            ? 'bg-foreground text-background mx-2 rounded-lg'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 mx-2 rounded-lg'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative ml-4">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 relative group"
                  aria-label="Notifications"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium animate-pulse">
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
              className="p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 group ml-2"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Profile Button */}
            {isAuthenticated && (
              <Link
                to="/profile"
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ml-2 ${
                  isActive('/profile')
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 border border-blue-200 dark:border-blue-800'
                }`}
              >
                Profile
              </Link>
            )}

            {/* Auth Buttons */}
            {!isAuthenticated && (
              <div className="flex items-center space-x-3 ml-6">
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition-all duration-200 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-foreground text-background rounded-xl hover:bg-foreground/90 hover:scale-105 transition-all duration-200 text-sm font-medium shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 group"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Slide-in Drawer */}
            <div className={`fixed top-0 right-0 h-full w-80 max-w-sm bg-background border-l border-border/30 shadow-2xl transform transition-all duration-300 ease-out ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-foreground to-foreground/80 rounded-2xl flex items-center justify-center shadow-md">
                    <span className="text-background font-bold text-sm">JT</span>
                  </div>
                  <span className="text-xl font-semibold text-foreground">Job Tracker</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 group"
                >
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex flex-col h-full">
                {/* Navigation Links */}
                <div className="flex-1 py-8">
                  <div className="space-y-3 px-6">
                    {mobileNavLinks.map(link => (
                      (!link.requireAuth || isAuthenticated) && (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center px-5 py-4 rounded-2xl text-base font-medium transition-all duration-200 ${
                            isActive(link.path)
                              ? 'bg-foreground text-background shadow-lg'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          }`}
                        >
                          {link.label}
                          {link.path === '/notifications' && notificationCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                              {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                          )}
                        </Link>
                      )
                    ))}
                  </div>

                  {/* Theme Toggle Section */}
                  <div className="px-6 py-6 border-t border-border/30 mt-6">
                    <div className="flex items-center justify-between px-5 py-4 rounded-2xl hover:bg-muted/60 transition-all duration-200">
                      <span className="text-base font-medium text-foreground">Theme</span>
                      <button
                        onClick={toggleTheme}
                        className="p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200 group"
                      >
                        {isDark ? (
                          <svg className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-200" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-200" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* User Section */}
                <div className="border-t border-border/30 p-6">
                  {isAuthenticated ? (
                    <div className="space-y-5">
                      <div className="px-5 py-4 bg-muted/40 rounded-2xl border border-border/20">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Signed in as</p>
                        <p className="text-base font-semibold text-foreground mt-2">{user?.username}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-5 py-4 bg-red-500 text-white rounded-2xl hover:bg-red-600 hover:scale-[0.98] transition-all duration-200 font-semibold shadow-lg text-base"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full px-5 py-4 text-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-2xl transition-all duration-200 font-medium text-base"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full px-5 py-4 text-center bg-foreground text-background rounded-2xl hover:bg-foreground/90 hover:scale-[0.98] transition-all duration-200 font-semibold shadow-lg text-base"
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