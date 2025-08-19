import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { connectionAPI, companyAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/helpers';
import { UserPlus, Check, X, Clock, MessageSquare } from 'lucide-react';

const NotificationPanel = ({ isOpen, onClose, isMobile = false }) => {
  const { companies } = useCompany();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [followRequests, setFollowRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [pastActionNotifications, setPastActionNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Calculate upcoming next action dates within 3 days
  const upcomingActions = useMemo(() => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    // Reset time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    threeDaysFromNow.setHours(23, 59, 59, 999);

    return companies
      .filter(company => {
        if (!company.nextActionDate) return false;
        
        const actionDate = new Date(company.nextActionDate);
        actionDate.setHours(0, 0, 0, 0);
        
        return actionDate >= today && actionDate <= threeDaysFromNow;
      })
      .sort((a, b) => new Date(a.nextActionDate) - new Date(b.nextActionDate))
      .map(company => {
        const actionDate = new Date(company.nextActionDate);
        actionDate.setHours(0, 0, 0, 0);
        const diffTime = actionDate - today;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        let urgency = 'low';
        if (diffDays === 0) urgency = 'high';
        else if (diffDays === 1) urgency = 'medium';
        
        return {
          ...company,
          daysUntil: diffDays,
          urgency
        };
      });
  }, [companies]);

  // Fetch follow requests
  const fetchFollowRequests = async () => {
    try {
      setRequestsLoading(true);
      const response = await connectionAPI.getPendingRequests();
      // Filter out requests from deleted users
      const validRequests = (response.data.requests || []).filter(request => 
        request.requester && request.requester._id && request.requester.username
      );
      setFollowRequests(validRequests);
    } catch (error) {
      console.error('Error fetching follow requests:', error);
      setFollowRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Fetch past action notifications
  const fetchPastActionNotifications = async () => {
    try {
      setNotificationsLoading(true);
      console.log('Fetching past action notifications...');
      const response = await companyAPI.getPastActionNotifications();
      console.log('Past action notifications response:', response.data);
      setPastActionNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching past action notifications:', error);
      console.error('Error details:', error.response?.data || error.message);
      setPastActionNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Handle follow request response
  const handleRequestResponse = async (connectionId, action, event) => {
    if (event) {
      event.stopPropagation(); // Prevent any parent click handlers
    }
    
    try {
      await connectionAPI.respondToRequest(connectionId, action);
      showToast(
        action === 'accept' ? 'Connection request accepted!' : 'Connection request rejected',
        'success'
      );
      
      // Remove the request from the list immediately for better UX
      setFollowRequests(prev => prev.filter(req => req._id !== connectionId));
    } catch (error) {
      console.error('Error responding to request:', error);
      showToast('Failed to respond to request', 'error');
      // Refresh the requests list in case of error
      fetchFollowRequests();
    }
  };

  // Handle past action notification response
  const handlePastActionResponse = async (companyId, notificationId, isCompleted, completionResponse = '') => {
    try {
      await companyAPI.respondToPastActionNotification({
        companyId,
        notificationId,
        isCompleted,
        completionResponse
      });
      
      showToast('Response recorded successfully!', 'success');
      
      // Remove the notification from the list
      setPastActionNotifications(prev => 
        prev.filter(notification => notification.notificationId !== notificationId)
      );
    } catch (error) {
      console.error('Error responding to past action notification:', error);
      showToast('Failed to record response', 'error');
    }
  };

  // Fetch requests and notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchFollowRequests();
      fetchPastActionNotifications();
    }
  }, [isOpen]);

  // Handle click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getUrgencyColor = (urgency) => {
    // Monochrome background for all notifications
    return 'text-foreground bg-muted/50 border-border hover:bg-muted/70';
  };

  const getUrgencyText = (daysUntil) => {
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return `In ${daysUntil} days`;
  };

  const getActionTitle = (status) => {
    switch (status) {
      case 'Applied': return 'Follow up';
      case 'Interview Scheduled': return 'Interview';
      case 'Technical Round': return 'Technical Interview';
      case 'HR Round': return 'HR Interview';
      case 'Final Round': return 'Final Interview';
      case 'Offer Received': return 'Respond to Offer';
      default: return 'Next Action';
    }
  };

  if (!isOpen) return null;

  const panelClasses = isMobile 
    ? "w-full h-screen bg-card border border-border rounded-lg shadow-lg overflow-hidden"
    : "absolute top-full right-0 mt-3 w-96 sm:w-[420px] md:w-96 bg-background/95 backdrop-blur-xl border border-border/30 rounded-2xl shadow-2xl z-50 max-h-[500px] overflow-hidden transition-all duration-300";

  return (
    <div 
      ref={panelRef}
      className={panelClasses}
    >
      {/* Header */}
      {!isMobile && (
        <div className="p-5 border-b border-border/20 bg-gradient-to-r from-background/50 to-muted/20 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-foreground/10 to-foreground/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground">Notifications</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-medium bg-foreground/10 text-foreground rounded-full">
                {upcomingActions.length} upcoming
              </span>
              {pastActionNotifications.length > 0 && (
                <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full dark:bg-orange-900/40 dark:text-orange-300">
                  {pastActionNotifications.length} past
                </span>
              )}
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-foreground/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={isMobile ? "flex-1 overflow-y-auto" : "max-h-96 overflow-y-auto custom-scrollbar"}>
        {/* Follow Requests Section */}
        {followRequests.length > 0 && (
          <div className="p-4 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
              <UserPlus className="w-4 h-4 mr-2" />
              Follow Requests ({followRequests.length})
            </h4>
            <div className="space-y-3">
              {followRequests.map((request) => (
                <div
                  key={request._id}
                  className="p-3 bg-muted/50 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (request.requester?._id) {
                          navigate(`/user/${request.requester._id}`);
                          onClose();
                        }
                      }}
                      className="flex items-center space-x-3 flex-1 text-left hover:bg-foreground/5 rounded-lg p-2 -m-2 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {(request.requester?.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {request.requester?.username || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          wants to connect
                        </p>
                      </div>
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => handleRequestResponse(request._id, 'accept', e)}
                        className="p-2 bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                        title="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleRequestResponse(request._id, 'reject', e)}
                        className="p-2 bg-muted/40 text-muted-foreground rounded-lg hover:bg-muted/60 hover:text-foreground hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Action Notifications Section */}
        {pastActionNotifications.length > 0 && (
          <div className="p-4 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Past Actions ({pastActionNotifications.length})
            </h4>
            <div className="space-y-3">
              {pastActionNotifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className="p-3 bg-orange-50 rounded-lg border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <h5 className="text-sm font-medium text-foreground mb-1">
                        {notification.companyName}
                      </h5>
                      {notification.positionTitle && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {notification.positionTitle}
                        </p>
                      )}
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        Action was due: {formatDate(notification.actionDate)}
                      </p>
                    </div>
                    <StatusBadge status={notification.status} className="flex-shrink-0" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-foreground font-medium">
                      Did you complete this action?
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePastActionResponse(
                          notification.companyId, 
                          notification.notificationId, 
                          true, 
                          'Action completed successfully'
                        )}
                        className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60"
                      >
                        <Check className="w-4 h-4 inline mr-1" />
                        Yes, completed
                      </button>
                      <button
                        onClick={() => {
                          const response = prompt('What happened? (optional)');
                          handlePastActionResponse(
                            notification.companyId, 
                            notification.notificationId, 
                            false, 
                            response || 'Action not completed'
                          );
                        }}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
                      >
                        <X className="w-4 h-4 inline mr-1" />
                        No, missed it
                      </button>
                    </div>
                    <button
                      onClick={() => navigate(`/job/${notification.companyId}`)}
                      className="w-full px-3 py-2 bg-muted/50 text-foreground rounded-lg hover:bg-muted/70 transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Actions Section */}
        <div className="p-6">
          <h4 className="text-sm font-semibold text-foreground mb-5 flex items-center">
            <div className="w-2 h-2 bg-foreground rounded-full mr-2"></div>
            Upcoming Actions
          </h4>
          {upcomingActions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-muted/20 to-muted/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-foreground mb-2">All caught up!</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No upcoming actions in the next 3 days.<br />
                <span className="text-xs">You're doing great!</span>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingActions.map((company) => {
                const isUrgent = company.daysUntil <= 1;
                const isToday = company.daysUntil === 0;
                
                return (
                  <div
                    key={company._id}
                    className={`group p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer relative overflow-hidden ${
                      isUrgent 
                        ? 'bg-gradient-to-r from-red-50 to-red-100/50 border-red-200 hover:from-red-100/80 hover:to-red-200/30 dark:from-red-900/20 dark:to-red-800/10 dark:border-red-800/50 dark:hover:from-red-900/25 dark:hover:to-red-800/15' 
                        : 'bg-gradient-to-r from-background to-muted/30 border-border/30 hover:from-muted/30 hover:to-muted/40'
                    }`}
                    onClick={() => navigate(`/job/${company._id}`)}
                  >
                    {/* Subtle background pattern */}
                    <div className="absolute top-0 right-0 w-12 h-12 bg-foreground/3 rounded-full -translate-y-6 translate-x-6 group-hover:scale-105 transition-transform duration-200"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-sm font-bold text-foreground truncate">
                              {company.companyName}
                            </h4>
                            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                            {getActionTitle(company.status)}
                            {company.positionTitle && ` • ${company.positionTitle}`}
                          </p>
                        </div>
                        <div className={`px-3 py-2 rounded-full text-xs font-bold shadow-sm flex-shrink-0 ${
                          isToday 
                            ? 'bg-red-500 text-white shadow-red-200' 
                            : isUrgent 
                              ? 'bg-orange-100 text-orange-700 shadow-orange-200 dark:bg-orange-900/40 dark:text-orange-300'
                              : 'bg-foreground/10 text-foreground shadow-foreground/10'
                        }`}>
                          {getUrgencyText(company.daysUntil)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <StatusBadge status={company.status} size="sm" />
                        <span className="text-xs text-muted-foreground font-medium">
                          {formatDate(company.nextActionDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {(followRequests.length > 0 || upcomingActions.length > 0 || pastActionNotifications.length > 0) && (
        <div className="p-3 border-t border-border bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            {followRequests.length > 0 && `${followRequests.length} follow request${followRequests.length !== 1 ? 's' : ''}`}
            {followRequests.length > 0 && (upcomingActions.length > 0 || pastActionNotifications.length > 0) && ' • '}
            {pastActionNotifications.length > 0 && `${pastActionNotifications.length} past action${pastActionNotifications.length !== 1 ? 's' : ''}`}
            {pastActionNotifications.length > 0 && upcomingActions.length > 0 && ' • '}
            {upcomingActions.length > 0 && `${upcomingActions.length} upcoming action${upcomingActions.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;