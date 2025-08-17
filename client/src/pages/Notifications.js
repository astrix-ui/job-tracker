import React from 'react';
import NotificationPanel from '../components/NotificationPanel';

const Notifications = () => {
  return (
    <div className="space-y-6 text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <p className="mt-2 text-muted-foreground">
          Stay updated with your job application activities and connection requests
        </p>
      </div>

      {/* Notification Panel */}
      <div className="bg-card rounded-lg shadow border border-border">
        <NotificationPanel 
          isOpen={true} 
          onClose={() => {}} 
          isMobile={true}
        />
      </div>
    </div>
  );
};

export default Notifications;