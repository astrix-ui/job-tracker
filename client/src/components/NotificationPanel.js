import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCompany } from '../context/CompanyContext';
import { connectionAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/helpers';
import { UserPlus, Check, X } from 'lucide-react';

const NotificationPanel = ({ isOpen, onClose, isMobile = false }) => {
  const { companies } = useCompany();
  const { showToast } = useToast();
  const panelRef = useRef(null);
  const [followRequests, setFollowRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

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

  // Fetch requests when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchFollowRequests();
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
    ? "w-full bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-hidden"
    : "absolute top-full right-0 mt-2 w-80 sm:w-96 md:w-80 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden";

  return (
    <div 
      ref={panelRef}
      className={panelClasses}
    >
      {/* Header */}
      {!isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            Notifications
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
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
                    <div className="flex items-center space-x-3">
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
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => handleRequestResponse(request._id, 'accept', e)}
                        className="p-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                        title="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleRequestResponse(request._id, 'reject', e)}
                        className="p-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
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

        {/* Upcoming Actions Section */}
        <div className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Upcoming Actions
          </h4>
          {upcomingActions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                No upcoming actions in the next 3 days
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingActions.map((company) => (
                <div
                  key={company._id}
                  className={`p-3 rounded-lg border transition-all hover:shadow-sm ${getUrgencyColor(company.urgency)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium truncate">
                          {company.companyName}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-accent text-accent-foreground">
                          {getUrgencyText(company.daysUntil)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">
                        {getActionTitle(company.status)}
                        {company.positionTitle && ` • ${company.positionTitle}`}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <StatusBadge status={company.status} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          {formatDate(company.nextActionDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {(followRequests.length > 0 || upcomingActions.length > 0) && (
        <div className="p-3 border-t border-border bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            {followRequests.length > 0 && `${followRequests.length} follow request${followRequests.length !== 1 ? 's' : ''}`}
            {followRequests.length > 0 && upcomingActions.length > 0 && ' • '}
            {upcomingActions.length > 0 && `${upcomingActions.length} upcoming action${upcomingActions.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;