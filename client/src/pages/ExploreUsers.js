import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectionAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ExploreUsers = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingRequest, setSendingRequest] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await connectionAPI.getAllUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch users');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      setSendingRequest(prev => ({ ...prev, [userId]: true }));
      await connectionAPI.sendFollowRequest({ recipientId: userId });
      showSuccess('Follow request sent successfully!');
      
      // Update user status locally
      setUsers(prev => prev.map(user => 
        user._id === userId 
          ? { ...user, connectionStatus: 'pending', isRequester: true }
          : user
      ));
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to send follow request');
      console.error('Send request error:', error);
    } finally {
      setSendingRequest(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getConnectionButtonText = (user) => {
    if (sendingRequest[user._id]) return 'Sending...';
    
    switch (user.connectionStatus) {
      case 'accepted':
        return 'Connected';
      case 'pending':
        return user.isRequester ? 'Request Sent' : 'Accept Request';
      default:
        return 'Connect';
    }
  };

  const getConnectionButtonStyle = (user) => {
    const baseClasses = "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2";
    
    switch (user.connectionStatus) {
      case 'accepted':
        return `${baseClasses} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 cursor-default`;
      case 'pending':
        return user.isRequester 
          ? `${baseClasses} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 cursor-default`
          : `${baseClasses} bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 shadow-lg`;
      default:
        return `${baseClasses} bg-foreground text-background hover:bg-foreground/90 hover:scale-105 shadow-lg`;
    }
  };

  const isButtonDisabled = (user) => {
    return sendingRequest[user._id] || 
           (user.connectionStatus === 'accepted') || 
           (user.connectionStatus === 'pending' && user.isRequester);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get popular users (first 6 users sorted by connections)
  const popularUsers = [...users]
    .sort((a, b) => (b.connectionsCount || 0) - (a.connectionsCount || 0))
    .slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-muted-foreground">Discovering amazing people...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-full mb-6">
            <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium text-foreground">Discover Professionals</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Explore <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Talent</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connect with ambitious professionals, share experiences, and grow your network in the job search community.
          </p>
        </div>

        {/* Error Message */}
        <ErrorMessage message={error} onClose={() => setError('')} />

        {/* Popular Users Section */}
        {popularUsers.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Popular Professionals</h2>
                <p className="text-muted-foreground">Most connected members in our community</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {popularUsers.map((user, index) => (
                <div
                  key={user._id}
                  className="group relative bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-foreground/3 to-transparent rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-200"></div>
                  
                  
                  <div className="relative z-10">
                    {/* User Avatar & Info */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-foreground/10 to-foreground/20 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-2xl font-bold text-foreground">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-1">
                          {user.username}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="mb-6"></div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/user/${user._id}`)}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground bg-muted/40 hover:bg-muted/60 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                      <button
                        onClick={() => handleSendRequest(user._id)}
                        disabled={isButtonDisabled(user)}
                        className={getConnectionButtonStyle(user).replace('hover:scale-105', '')}
                      >
                        {sendingRequest[user._id] && <LoadingSpinner size="small" />}
                        {!sendingRequest[user._id] && user.connectionStatus === 'accepted' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {!sendingRequest[user._id] && user.connectionStatus !== 'accepted' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                        {getConnectionButtonText(user)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-bold text-foreground mb-4">Find Specific People</h3>
            <p className="text-muted-foreground mb-6">Search for professionals by name or email address</p>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-border/50 rounded-xl bg-background/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all text-lg"
              />
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-foreground mb-6">
              Search Results {filteredUsers.length > 0 && `(${filteredUsers.length})`}
            </h3>
            
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8">
                  <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">No users found</h4>
                  <p className="text-muted-foreground">Try adjusting your search terms or browse popular professionals above.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-foreground/10 to-foreground/20 rounded-xl flex items-center justify-center">
                        <span className="text-lg font-semibold text-foreground">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-foreground">
                          {user.username}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/user/${user._id}`)}
                          className="px-3 py-1.5 text-sm font-medium text-foreground bg-muted/40 hover:bg-muted/60 rounded-lg transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleSendRequest(user._id)}
                          disabled={isButtonDisabled(user)}
                          className={getConnectionButtonStyle(user)}
                        >
                          {sendingRequest[user._id] && <LoadingSpinner size="small" />}
                          {getConnectionButtonText(user)}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State for No Users */}
        {!searchTerm && users.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-12">
              <div className="w-20 h-20 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">No users available</h3>
              <p className="text-muted-foreground">Check back later for new professionals to connect with.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreUsers;