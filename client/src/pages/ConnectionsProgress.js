import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectionAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';

const ConnectionsProgress = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await connectionAPI.getMutualConnections();
      
      // Fetch progress for each connection
      const connectionsWithProgress = await Promise.all(
        response.data.connections.map(async (connection) => {
          try {
            const progressResponse = await connectionAPI.getConnectionProgress(connection.user._id);
            return {
              userId: connection.user._id,
              username: connection.user.username,
              email: connection.user.email,
              companies: progressResponse.data.companies || []
            };
          } catch (error) {
            console.error(`Failed to fetch progress for user ${connection.user._id}:`, error);
            return {
              userId: connection.user._id,
              username: connection.user.username,
              email: connection.user.email,
              companies: []
            };
          }
        })
      );
      
      setConnections(connectionsWithProgress);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch connection progress');
      console.error('Fetch connections error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-muted-foreground">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-full mb-6">
            <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium text-foreground">Network Insights</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Connection <span className="text-foreground">Progress</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stay updated with your network's job search journey and celebrate their achievements together.
          </p>
        </div>

        {/* Error Message */}
        <ErrorMessage message={error} onClose={() => setError('')} />

        {/* Connections Grid */}
        {connections.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">No connections yet</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Connect with other professionals to see their job search progress and support each other.
              </p>
              <button
                onClick={() => navigate('/explore')}
                className="px-6 py-3 bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-all duration-200 font-semibold flex items-center gap-2 mx-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explore Users
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-stretch max-w-7xl mx-auto">
            {connections.map((connection) => {
              const stats = getProgressStats(connection.companies);
              const recentActivity = getRecentActivity(connection.companies);
              
              return (
                <div
                  key={connection.userId}
                  className="group bg-card backdrop-blur-xl border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden relative w-full min-w-0"
                  onClick={() => navigate(`/user/${connection.userId}`)}
                >
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-foreground/3 to-transparent rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-200"></div>
                  
                  <div className="relative z-10">
                    {/* User Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-foreground/10 to-foreground/20 rounded-2xl flex items-center justify-center shadow-sm">
                          <span className="text-xl font-bold text-foreground">
                            {connection.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-1">
                          {connection.username}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {stats.total} applications
                        </p>
                      </div>
                    </div>

                    {/* Progress Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-muted/20 rounded-xl border border-border">
                        <div className="text-lg font-bold text-foreground">{stats.active}</div>
                        <div className="text-xs text-muted-foreground font-medium">Active</div>
                      </div>
                      <div className="text-center p-4 bg-muted/20 rounded-xl border border-border">
                        <div className="text-lg font-bold text-foreground">{stats.offered}</div>
                        <div className="text-xs text-muted-foreground font-medium">Offers</div>
                      </div>
                      <div className="text-center p-4 bg-muted/20 rounded-xl border border-border">
                        <div className="text-lg font-bold text-foreground">{stats.rejected}</div>
                        <div className="text-xs text-muted-foreground font-medium">Rejected</div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    {recentActivity.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                          <div className="w-2 h-2 bg-foreground rounded-full mr-2"></div>
                          Recent Activity
                        </h4>
                        <div className="space-y-2">
                          {recentActivity.map((company, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {company.companyName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {company.positionTitle || 'Position not specified'}
                                </p>
                              </div>
                              <div className="ml-3 flex-shrink-0">
                                <StatusBadge status={company.status} size="small" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button className="w-full px-4 py-3 text-sm font-semibold text-foreground bg-muted/30 hover:bg-muted/50 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionsProgress;