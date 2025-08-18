import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Register = () => {
 const [formData, setFormData] = useState({
 username: '',
 email: '',
 password: '',
 confirmPassword: ''
 });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const { register, isAuthenticated } = useAuth();
 const navigate = useNavigate();

 // Redirect if already authenticated
 React.useEffect(() => {
 if (isAuthenticated) {
 navigate('/dashboard', { replace: true });
 }
 }, [isAuthenticated, navigate]);

 const handleChange = (e) => {
 setFormData({
 ...formData,
 [e.target.name]: e.target.value
 });
 setError('');
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);
 setError('');

 // Client-side validation
 if (formData.password !== formData.confirmPassword) {
 setError('Passwords do not match');
 setLoading(false);
 return;
 }

 if (formData.password.length < 6) {
 setError('Password must be at least 6 characters long');
 setLoading(false);
 return;
 }

 const { confirmPassword, ...registerData } = formData;
 const result = await register(registerData);
 
 if (result.success) {
 navigate('/dashboard', { replace: true });
 } else {
 setError(result.error);
 }
 
 setLoading(false);
 };

 return (
 <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
 <div className="max-w-md w-full space-y-8">
 <div>
 <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
 <span className="text-primary-foreground font-bold text-xl">JT</span>
 </div>
 <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
 Create your account
 </h2>
 <p className="mt-2 text-center text-sm text-muted-foreground">
 Or{' '}
 <Link
 to="/login"
 className="font-medium text-primary hover:text-primary/80"
 >
 sign in to your existing account
 </Link>
 </p>
 </div>

 <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
 <div className="bg-card border border-input shadow-md rounded-lg p-6">
 <ErrorMessage message={error} onClose={() => setError('')} />
 
 <div className="space-y-4">
 <div>
 <label htmlFor="username" className="block text-sm font-medium text-foreground">
 Username
 </label>
 <input
 id="username"
 name="username"
 type="text"
 required
 value={formData.username}
 onChange={handleChange}
 className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder:text-muted-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
 placeholder="Choose a username"
 />
 </div>

 <div>
 <label htmlFor="email" className="block text-sm font-medium text-foreground">
 Email Address
 </label>
 <input
 id="email"
 name="email"
 type="email"
 required
 value={formData.email}
 onChange={handleChange}
 className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder:text-muted-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
 placeholder="Enter your email"
 />
 </div>

 <div>
 <label htmlFor="password" className="block text-sm font-medium text-foreground">
 Password
 </label>
 <input
 id="password"
 name="password"
 type="password"
 required
 value={formData.password}
 onChange={handleChange}
 className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder:text-muted-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
 placeholder="Create a password (min 6 characters)"
 />
 </div>

 <div>
 <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
 Confirm Password
 </label>
 <input
 id="confirmPassword"
 name="confirmPassword"
 type="password"
 required
 value={formData.confirmPassword}
 onChange={handleChange}
 className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm placeholder:text-muted-foreground bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
 placeholder="Confirm your password"
 />
 </div>
 </div>

 <div className="mt-6">
 <button
 type="submit"
 disabled={loading}
 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? (
 <LoadingSpinner size="small" />
 ) : (
 'Create Account'
 )}
 </button>
 </div>
 </div>
 </form>

 <div className="text-center">
 <p className="text-sm text-muted-foreground">
 {/* Warning: This app uises simplified authentication for learning purposes only */}
 </p>
 </div>
 </div>
 </div>
 );
};

export default Register;
