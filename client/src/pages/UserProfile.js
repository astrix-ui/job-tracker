import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { connectionAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch user profile and progress
      const [profileResponse, progressResponse] = await Promise.all([
        connectionAPI.getUserProfile(userId),
        connectionAPI.getConnectionProgress(userId)
      ]);
      
      setUser(profileResponse.data.user);
      setCompanies(progressResponse.data.companies || []);
      setConnectionStatus(profileResponse.data.connectionStatus || 'none');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch user profile');
      console.error('Fetch user profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      setSendingRequest(true);
      await connectionAPI.sendFollowRequest({ recipientId: userId });
      showSuccess('Follow request sent successfully!');
      setConnectionStatus('pending');
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to send follow request');
    } finally {
      setSendingRequest(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressStats = (companies) => {
    const total = companies.length;
    const active = companies.filter(c => !['Rejected', 'Offered'].includes(c.status)).length;
    const offered = companies.filter(c => c.status === 'Offered').length;
    const rejected = companies.filter(c => c.status === 'Rejected').length;
    
    return { total, active, offered, rejected };
  };

  const getRecentActivity = (companies) => {
    return companies
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 3);
  };

  const getConnectionButtonText = () => {
    if (sendingRequest) return 'Sending...';
    
    switch (connectionStatus) {
      case 'accepted':
        return 'Connected';
      case 'pending':
        return 'Request Sent';
      default:
        return 'Connect';
    }
  };

  const getConnectionButtonStyle = () => {
    const baseClasses = "px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2";
    
    switch (connectionStatus) {
      case 'accepted':
        return `${baseClasses} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 cursor-default`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 cursor-default`;
      default:
        return `${baseClasses} bg-foreground text-background hover:bg-foreground/90`;
    }
  };

  const isButtonDisabled = () => {
    return sendingRequest || connectionStatus === 'accepted' || connectionStatus === 'pending';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">User not found</h2>
          <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/explore')}
            className="px-6 py-3 bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-colors"
          >
            Explore Users
          </button>
        </div>
      </div>
    );
  }

  const stats = getProgressStats(companies);
  const recentActivity = getRecentActivity(companies);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted/50 rounded-xl transition-colors mr-4"
          >
            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
            <p className="text-muted-foreground">View professional progress and connect</p>
          </div>
        </div>

        {/* Error Message */}
        <ErrorMessage message={error} onClose={() => setError('')} />

        {/* Profile Header Card */}
        <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 mb-8 overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-foreground/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-foreground/10 to-foreground/20 rounded-3xl flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-foreground">
                  {user.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background"></div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {user.username}
              </h2>
              <p className="text-lg text-muted-foreground mb-3">
                {user.email}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 px-3 py-1.5 bg-muted/30 rounded-full w-fit">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-muted-foreground">
                  Member since {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={handleSendRequest}
                disabled={isButtonDisabled()}
                className={getConnectionButtonStyle()}
              >
                {sendingRequest && <LoadingSpinner size="small" />}
                {!sendingRequest && connectionStatus === 'accepted' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {!sendingRequest && connectionStatus !== 'accepted' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
                {getConnectionButtonText()}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-800/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.active}
                </div>
                <div className="text-sm font-medium text-blue-600/70 dark:text-blue-400/70">
                  Active Applications
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-900/20 dark:to-green-800/10 rounded-2xl p-6 border border-green-200/30 dark:border-green-800/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.offered}
                </div>
                <div className="text-sm font-medium text-green-600/70 dark:text-green-400/70">
                  Offers Received
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50/50 to-red-100/30 dark:from-red-900/20 dark:to-red-800/10 rounded-2xl p-6 border border-red-200/30 dark:border-red-800/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.rejected}
                </div>
                <div className="text-sm font-medium text-red-600/70 dark:text-red-400/70">
                  Rejected
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
              <div className="w-2 h-2 bg-foreground rounded-full mr-3"></div>
              Recent Activity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentActivity.map((company, index) => (
                <div key={index} className="p-4 bg-muted/20 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">
                        {company.companyName}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {company.positionTitle || 'Position not specified'}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <StatusBadge status={company.status} size="small" />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(company.updatedAt || company.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {companies.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">No applications yet</h3>
              <p className="text-muted-foreground">
                This user hasn't shared any job applications yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;