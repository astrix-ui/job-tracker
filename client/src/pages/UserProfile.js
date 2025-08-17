import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { connectionAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { User, Mail, Calendar, UserPlus, UserCheck, Clock, ArrowLeft } from 'lucide-react';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [isRequester, setIsRequester] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [connections, setConnections] = useState([]);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);

  // Fetch user profile and connection status
  const fetchUserProfile = async () => {
    try {
      // Get all users to find this specific user and their connection status
      const response = await connectionAPI.getAllUsers();
      const foundUser = response.data.users.find(u => u._id === userId);
      
      if (foundUser) {
        setUser(foundUser);
        setConnectionStatus(foundUser.connectionStatus);
        setIsRequester(foundUser.isRequester);
        
        // For viewing other users' profiles, we can't access their private connections
        // So we'll show a realistic but empty state since we can't access private data
        setConnections([]);
      } else {
        showToast('User not found', 'error');
        navigate('/explore');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      showToast('Failed to load user profile', 'error');
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  // Send follow request
  const handleFollowRequest = async () => {
    try {
      setActionLoading(true);
      await connectionAPI.sendFollowRequest(userId);
      showToast('Follow request sent successfully!', 'success');
      
      // Update local state
      setConnectionStatus('pending');
      setIsRequester(true);
    } catch (error) {
      console.error('Error sending follow request:', error);
      showToast(error.response?.data?.error || 'Failed to send follow request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Get button configuration based on connection status
  const getConnectionButton = () => {
    switch (connectionStatus) {
      case 'pending':
        if (isRequester) {
          return {
            text: 'Request Sent',
            icon: Clock,
            disabled: true,
            className: 'bg-yellow-100 text-yellow-800 border-yellow-200 cursor-not-allowed'
          };
        } else {
          return {
            text: 'Pending Response',
            icon: Clock,
            disabled: true,
            className: 'bg-blue-100 text-blue-800 border-blue-200 cursor-not-allowed'
          };
        }
      case 'accepted':
        return {
          text: 'Connected',
          icon: UserCheck,
          disabled: true,
          className: 'bg-green-100 text-green-800 border-green-200 cursor-not-allowed'
        };
      default:
        return {
          text: 'Follow',
          icon: UserPlus,
          disabled: false,
          className: 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary',
          onClick: handleFollowRequest
        };
    }
  };

  const handleConnectionsClick = () => {
    setShowConnectionsModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">User not found</h3>
        <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  const buttonConfig = getConnectionButton();
  const ButtonIcon = buttonConfig.icon;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/explore')}
        className="flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explore Users</span>
      </button>

      {/* Profile Header */}
      <div className="bg-card border border-border rounded-lg p-8 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Avatar */}
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-primary">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {user.username}
            </h1>
            
            <div className="flex items-center justify-center md:justify-start space-x-2 text-muted-foreground mb-4">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-2 text-muted-foreground mb-4">
              <Calendar className="w-4 h-4" />
              <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Connection Count */}
            <button
              onClick={handleConnectionsClick}
              className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors mb-6"
            >
              <span className="text-lg font-semibold">{connections.length}</span>
              <span className="text-sm">
                {connections.length === 1 ? 'Connection' : 'Connections'}
              </span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Connection Button */}
            <button
              onClick={buttonConfig.onClick}
              disabled={buttonConfig.disabled || actionLoading}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg border transition-colors ${buttonConfig.className} ${
                actionLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {actionLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <ButtonIcon className="w-5 h-5" />
              )}
              <span className="font-medium">{buttonConfig.text}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Connection Status</h2>
        
        {connectionStatus === 'none' && (
          <div className="text-center py-8">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Send a follow request to connect with {user.username} and view their job application progress.
            </p>
          </div>
        )}

        {connectionStatus === 'pending' && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {isRequester 
                ? `Your follow request to ${user.username} is pending approval.`
                : `${user.username} has sent you a follow request. Check your notifications to respond.`
              }
            </p>
          </div>
        )}

        {connectionStatus === 'accepted' && (
          <div className="text-center py-8">
            <UserCheck className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              You are connected with {user.username}! You can now view each other's job application progress.
            </p>
            <button
              onClick={() => navigate('/connections')}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              View Progress
            </button>
          </div>
        )}
      </div>

      {/* Connections Modal */}
      <Modal
        isOpen={showConnectionsModal}
        onClose={() => setShowConnectionsModal(false)}
        title={`${user.username}'s Connections`}
        size="medium"
      >
        <div className="space-y-4">
          {connections.length > 0 ? (
            connections.map((connection, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {(() => {
                      const user = connection.follower || connection.following || connection;
                      return (user?.username || 'U').charAt(0).toUpperCase();
                    })()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {(() => {
                      const user = connection.follower || connection.following || connection;
                      return user?.username || 'Unknown User';
                    })()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {(() => {
                      const user = connection.follower || connection.following || connection;
                      return user?.email || 'No email';
                    })()}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Connected
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No connections yet</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;