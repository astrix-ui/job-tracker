import React, { useState, useEffect, useMemo } from 'react';
import { useCompany } from '../context/CompanyContext';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/helpers';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { companies } = useCompany();

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

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">
          Upcoming Actions
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

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {upcomingActions.length === 0 ? (
          <div className="p-6 text-center">
            <h4 className="text-sm font-medium text-foreground mb-1">
              No upcoming actions
            </h4>
            <p className="text-xs text-muted-foreground">
              You're all caught up for the next 3 days!
            </p>
          </div>
        ) : (
          <div className="p-2">
            {upcomingActions.map((company) => (
              <div
                key={company._id}
                className={`p-3 mb-2 rounded-lg border transition-all hover:shadow-sm ${getUrgencyColor(company.urgency)}`}
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

      {/* Footer */}
      {upcomingActions.length > 0 && (
        <div className="p-3 border-t border-border bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            {upcomingActions.length} action{upcomingActions.length !== 1 ? 's' : ''} in the next 3 days
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;