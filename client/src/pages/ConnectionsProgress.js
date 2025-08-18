import React, { useState, useEffect } from 'react';
import { connectionAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Users, TrendingUp, Calendar, User, Building, Briefcase } from 'lucide-react';

const ConnectionsProgress = () => {
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const { showToast } = useToast();

  // Fetch mutual connections
  const fetchConnections = async () => {
    try {
      const response = await connectionAPI.getMutualConnections();
      setConnections(response.data.connections);
    } catch (error) {
      console.error('Error fetching connections:', error);
      showToast('Failed to fetch connections', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch connection's progress
  const fetchConnectionProgress = async (userId) => {
    try {
      setProgressLoading(true);
      const response = await connectionAPI.getConnectionProgress(userId);
      setProgressData(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
      showToast('Failed to fetch connection progress', 'error');
    } finally {
      setProgressLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  // Handle connection selection
  const handleConnectionSelect = (connection) => {
    setSelectedConnection(connection);
    fetchConnectionProgress(connection.user._id);
  };

  // Get status color for progress stats
  const getStatusColor = (status) => {
    const colors = {
      'Applied': 'bg-blue-100 text-blue-800',
      'Interview Scheduled': 'bg-yellow-100 text-yellow-800',
      'Technical Round': 'bg-purple-100 text-purple-800',
      'HR Round': 'bg-indigo-100 text-indigo-800',
      'Final Round': 'bg-orange-100 text-orange-800',
      'Offer Received': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Withdrawn': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Connections Progress</h1>
        </div>
        <p className="text-muted-foreground">
          View job application progress of your connected users
        </p>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No connections yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Connect with other users to view their job application progress
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connections List */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Your Connections ({Math.min(connections.length, 4)})
              </h2>
              <div className="space-y-3">
                {connections.slice(0, 4).map((connection) => (
                  <div
                    key={connection.connectionId}
                    onClick={() => handleConnectionSelect(connection)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      selectedConnection?.connectionId === connection.connectionId
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {connection.user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {connection.user.username}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {connection.user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Connected {formatDate(connection.connectedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {connections.length > 4 && (
                  <div className="text-center pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Showing 4 of {connections.length} connections
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Details */}
          <div className="lg:col-span-2">
            {!selectedConnection ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Select a connection
                </h3>
                <p className="text-muted-foreground">
                  Choose a connection from the list to view their job application progress
                </p>
              </div>
            ) : progressLoading ? (
              <div className="bg-card border border-border rounded-lg p-12 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : progressData ? (
              <div className="space-y-6">
                {/* User Info & Stats */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xl font-semibold text-primary">
                        {progressData.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {progressData.user.username}
                      </h2>
                      <p className="text-muted-foreground">{progressData.user.email}</p>
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Briefcase className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">
                        {progressData.totalApplications}
                      </div>
                      <div className="text-sm text-muted-foreground">Applications</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">
                        {progressData.statusBreakdown['Offer Received'] || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Offers</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">
                        {(progressData.statusBreakdown['Interview Scheduled'] || 0) +
                         (progressData.statusBreakdown['Technical Round'] || 0) +
                         (progressData.statusBreakdown['HR Round'] || 0) +
                         (progressData.statusBreakdown['Final Round'] || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Interviews</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <Building className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">
                        {Object.keys(progressData.statusBreakdown).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Statuses</div>
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Status Breakdown</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(progressData.statusBreakdown).map(([status, count]) => (
                        <span
                          key={status}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}
                        >
                          {status}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Applications List */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Recent Applications ({progressData.companies.length})
                  </h3>
                  
                  {progressData.companies.length === 0 ? (
                    <div className="text-center py-8">
                      <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No applications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {progressData.companies.slice(0, 10).map((company) => (
                        <div
                          key={company._id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-foreground truncate">
                                {company.companyName}
                              </h4>
                              <StatusBadge status={company.status} size="sm" />
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              {company.positionTitle && (
                                <span>{company.positionTitle}</span>
                              )}
                              <span>{company.positionType}</span>
                              <span>Applied: {formatDate(company.applicationDate)}</span>
                            </div>
                            {company.nextActionDate && (
                              <div className="flex items-center space-x-1 mt-1 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>Next: {formatDate(company.nextActionDate)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            {company.salaryExpectation && (
                              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <span>₹{company.salaryExpectation.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                            {company.interviewRounds > 0 && (
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {company.interviewRounds} rounds
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {progressData.companies.length > 10 && (
                        <div className="text-center pt-4">
                          <p className="text-sm text-muted-foreground">
                            Showing 10 of {progressData.companies.length} applications
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionsProgress;