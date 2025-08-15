import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Login = () => {
 const [formData, setFormData] = useState({
 username: '',
 password: ''
 });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const { login, isAuthenticated } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();

 // Redirect if already authenticated
 React.useEffect(() => {
 if (isAuthenticated) {
 const from = location.state?.from?.pathname || '/dashboard';
 navigate(from, { replace: true });
 }
 }, [isAuthenticated, navigate, location.state?.from?.pathname]);

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

 const result = await login(formData);
 
 if (result.success) {
 const from = location.state?.from?.pathname || '/dashboard';
 navigate(from, { replace: true });
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
 Sign in to your account
 </h2>
 <p className="mt-2 text-center text-sm text-muted-foreground">
 Or{' '}
 <Link
 to="/register"
 className="font-medium text-primary hover:text-primary/80"
 >
 create a new account
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
 className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
 placeholder="Enter your username"
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
 className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
 placeholder="Enter your password"
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
 'Sign in'
 )}
 </button>
 </div>
 </div>
 </form>

 <div className="text-center">
 {/* <p className="text-sm text-muted-foreground">
 Demo credentials: username: <code className="bg-muted text-muted-foreground px-1 rounded">demo</code>, 
 password: <code className="bg-muted text-muted-foreground px-1 rounded">password</code>
 </p> */}
 </div>
 </div>
 </div>
 );
};

export default Login;
