import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectionAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Users, UserPlus, UserCheck, Clock } from 'lucide-react';

const ExploreUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const { showToast } = useToast();

  // Fetch users
  const fetchUsers = async (search = '') => {
    try {
      setSearchLoading(!!search);
      const response = await connectionAPI.getAllUsers(search);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchUsers(searchTerm);
      } else {
        fetchUsers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Send follow request
  const handleFollowRequest = async (userId, event) => {
    event.stopPropagation(); // Prevent navigation when clicking follow button
    
    try {
      setFollowingUsers(prev => new Set(prev).add(userId));
      await connectionAPI.sendFollowRequest(userId);
      showToast('Follow request sent successfully!', 'success');
      
      // Update user status locally
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, connectionStatus: 'pending', isRequester: true }
          : user
      ));
    } catch (error) {
      console.error('Error sending follow request:', error);
      showToast(error.response?.data?.error || 'Failed to send follow request', 'error');
    } finally {
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Handle user card click
  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  // Get button text and style based on connection status
  const getConnectionButton = (user) => {
    const { connectionStatus, isRequester } = user;
    
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
          onClick: (event) => handleFollowRequest(user._id, event)
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Explore Users</h1>
        </div>
        <p className="text-muted-foreground">
          Connect with other job seekers and share your progress
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Users Grid */}
      {users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm ? 'No users found' : 'No users available'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Be the first to invite others to join!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => {
            const buttonConfig = getConnectionButton(user);
            const ButtonIcon = buttonConfig.icon;
            
            return (
              <div
                key={user._id}
                onClick={() => handleUserClick(user._id)}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* User Avatar */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground truncate">
                      {user.username}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Member Since */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={buttonConfig.onClick}
                  disabled={buttonConfig.disabled || followingUsers.has(user._id)}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${buttonConfig.className} ${
                    followingUsers.has(user._id) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {followingUsers.has(user._id) ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <ButtonIcon className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {followingUsers.has(user._id) ? 'Sending...' : buttonConfig.text}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExploreUsers;