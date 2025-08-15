import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Profile = () => {
 const { user, logout, updateUser } = useAuth();
 const { showSuccess, showError } = useToast();
 const [isEditing, setIsEditing] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');
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

 return (
 <div className="max-w-2xl mx-auto space-y-6">
 {/* Header */}
 <div>
 <h1 className="text-3xl font-bold text-foreground">Profile</h1>
 <p className="mt-2 text-muted-foreground">
 Manage your account settings and preferences
 </p>
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

 <div className="flex justify-end space-x-3 pt-6 border-t border-border text-card-foreground">
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
 className="px-4 py-2 border border-border rounded-md text-muted-foreground bg-background hover:bg-muted transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={loading}
 className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
 >
 {loading && <LoadingSpinner size="small" className="mr-2" />}
 Save Changes
 </button>
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
 <button
 onClick={handleLogout}
 className="px-4 py-2 bg-destructive text-primary-foreground rounded-md hover:bg-destructive transition-colors"
 >
 Log Out
 </button>
 </div>
 </div>
 )}
 </div>
 </div>

 </div>
 );
};

export default Profile;
