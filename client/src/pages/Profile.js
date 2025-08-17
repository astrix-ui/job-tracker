import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { connectionAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';

const Profile = () => {
  const { user, logout, updateUser, deleteAccount, isAuthenticated } = useAuth();
  const { showSuccess, showError, showConfirmToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [connections, setConnections] = useState([]);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      setError('Current password is required to change password');
      setLoading(false);
      return;
    }

    try {
      // Prepare update data
      const updatedUserData = {
        username: formData.username,
        email: formData.email
      };

      // Add password fields if user is changing password
      if (formData.newPassword) {
        updatedUserData.currentPassword = formData.currentPassword;
        updatedUserData.newPassword = formData.newPassword;
      }

      // Call the API to update the user profile
      const result = await updateUser(updatedUserData);
      
      if (result.success) {
        showSuccess('Profile updated successfully!');
        setIsEditing(false);
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(result.error);
        showError(result.error);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await logout();
        showSuccess('Logged out successfully!');
      } catch (error) {
        showError('Failed to log out');
      }
    }
  };

  const handleDeleteAccount = () => {
    showConfirmToast(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.',
      async () => {
        try {
          const result = await deleteAccount();
          if (result.success) {
            showSuccess('Account deleted successfully');
            // Redirect to login page after successful deletion
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          } else {
            showError(result.error || 'Failed to delete account');
          }
        } catch (error) {
          console.error('Delete account error:', error);
          showError('Failed to delete account');
        }
      },
      () => {
        // Cancel action - do nothing
      },
      {
        confirmText: 'Delete Account',
        cancelText: 'Cancel'
      }
    );
  };

  // Fetch connections
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await connectionAPI.getMutualConnections();
        setConnections(response.data.connections || []);
      } catch (error) {
        console.error('Error fetching connections:', error);
        setConnections([]);
      }
    };

    if (isAuthenticated) {
      fetchConnections();
    }
  }, [isAuthenticated]);

  const handleConnectionsClick = () => {
    setShowConnectionsModal(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* User Details Section */}
      <div className="bg-card shadow rounded-lg border border-border mb-6">
        <div className="px-6 py-8">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">{user?.username}</h2>
              <p className="text-muted-foreground mb-4">{user?.email}</p>
              
              {/* Connection Count */}
              <button
                onClick={handleConnectionsClick}
                className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
              >
                <span className="text-lg font-semibold">{connections.length}</span>
                <span className="text-sm">
                  {connections.length === 1 ? 'Connection' : 'Connections'}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-card shadow rounded-lg border border-border">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-card-foreground">
              Account Information
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-4">
          <ErrorMessage message={error} onClose={() => setError('')} />
          
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-green-700 ">{success}</p>
              </div>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-foreground">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-card bg-card text-card-foreground focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-border text-card-foreground pt-6">
                <h3 className="text-lg font-medium bg-card text-card-foreground mb-4">
                  Change Password
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-muted-foreground">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-card bg-card text-card-foreground focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-muted-foreground">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-card bg-card text-card-foreground focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted-foreground">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-card bg-card text-card-foreground focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t border-border text-card-foreground">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="w-full sm:w-auto px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors order-2 sm:order-1"
                >
                  Delete Account
                </button>
                <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        username: user?.username || '',
                        email: user?.email || '',
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setError('');
                      setSuccess('');
                    }}
                    className="w-full sm:w-auto px-4 py-2 border border-border rounded-md text-muted-foreground bg-background hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {loading && <LoadingSpinner size="small" className="mr-2" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">
                    Username
                  </label>
                  <p className="mt-1 bg-card text-card-foreground ">{user?.username}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <p className="mt-1 bg-card text-card-foreground ">{user?.email}</p>
                </div>
              </div>

              <div className="border-t border-border text-card-foreground pt-6">
                <h3 className="text-lg font-medium bg-card text-card-foreground mb-4">
                  Account Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connections Modal */}
      <Modal
        isOpen={showConnectionsModal}
        onClose={() => setShowConnectionsModal(false)}
        title="My Connections"
        size="medium"
      >
        <div className="space-y-4">
          {connections.length > 0 ? (
            connections.map((connection, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {(connection.user?.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {connection.user?.username || 'Unknown User'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {connection.user?.email || 'No email'}
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
              <p className="text-sm text-muted-foreground mt-2">
                Start connecting with other users to build your network
              </p>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default Profile;