import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeApplications: 0,
    offersReceived: 0
  });
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showConfirmToast, setShowConfirmToast] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    fetchUserStats();
    
    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(fetchUserStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await authAPI.getUserStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;

    try {
      setDeleting(true);
      await authAPI.deleteAccount();
      showSuccess('Account deleted successfully');
      logout();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to delete account');
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
      setDeleteConfirmation('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-full mb-6">
            <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium text-foreground">Personal Profile</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            My <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Profile</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Manage your account, track your progress, and customize your job search experience.
          </p>
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
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {user?.username}
              </h2>
              <p className="text-lg text-muted-foreground mb-3">
                {user?.email}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 px-3 py-1.5 bg-muted/30 rounded-full w-fit">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-muted-foreground">
                  Member since {formatDate(user?.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-900/20 dark:to-blue-800/10 rounded-2xl p-6 border border-blue-200/30 dark:border-blue-800/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalApplications}
                </div>
                <div className="text-sm font-medium text-blue-600/70 dark:text-blue-400/70">
                  Total Applications
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-900/20 dark:to-green-800/10 rounded-2xl p-6 border border-green-200/30 dark:border-green-800/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.activeApplications}
                </div>
                <div className="text-sm font-medium text-green-600/70 dark:text-green-400/70">
                  Active Applications
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-900/20 dark:to-purple-800/10 rounded-2xl p-6 border border-purple-200/30 dark:border-purple-800/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.offersReceived}
                </div>
                <div className="text-sm font-medium text-purple-600/70 dark:text-purple-400/70">
                  Offers Received
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Account Settings */}
          <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
              <div className="w-2 h-2 bg-foreground rounded-full mr-3"></div>
              Account Settings
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-muted/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">Username</h4>
                    <p className="text-sm text-muted-foreground">{user?.username}</p>
                  </div>
                  <button 
                    onClick={() => alert('Edit functionality coming soon!')}
                    className="px-4 py-2 text-sm font-medium text-foreground bg-muted/40 hover:bg-muted/60 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
              <div className="p-4 bg-muted/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">Email</h4>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <button 
                    onClick={() => alert('Edit functionality coming soon!')}
                    className="px-4 py-2 text-sm font-medium text-foreground bg-muted/40 hover:bg-muted/60 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center">
              <div className="w-2 h-2 bg-foreground rounded-full mr-3"></div>
              Quick Actions
            </h3>
            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Refresh Data</h4>
                    <p className="text-sm text-muted-foreground">Update your statistics</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-background/60 backdrop-blur-xl border border-red-200/50 dark:border-red-800/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-6 flex items-center">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Danger Zone
          </h3>
          <div className="bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-red-600 dark:text-red-400 mb-1">
                  Delete Account
                </h4>
                <p className="text-sm text-red-600/70 dark:text-red-400/70">
                  Permanently delete your account and all data
                </p>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Account"
        size="medium"
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Are you absolutely sure?
            </h3>
            <p className="text-muted-foreground">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Type <span className="font-bold">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              placeholder="Type DELETE here"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmation('');
              }}
              className="px-4 py-2 text-foreground bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE' || deleting}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {deleting && <LoadingSpinner size="small" />}
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast for confirmations */}
      <Toast
        isOpen={showConfirmToast}
        onClose={() => setShowConfirmToast(false)}
        onConfirm={confirmAction}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="Delete Account"
        isProcessing={deleting}
      />
    </div>
  );
};

export default Profile;