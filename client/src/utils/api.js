import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
 baseURL: process.env.REACT_APP_API_URL,
 withCredentials: true, // Important for session cookies
 headers: {
 'Content-Type': 'application/json',
 },
});

// Auth API endpoints
export const authAPI = {
 register: (userData) => api.post('/auth/register', userData),
 login: (credentials) => api.post('/auth/login', credentials),
 logout: () => api.post('/auth/logout'),
 getCurrentUser: () => api.get('/auth/user'),
 updateProfile: (profileData) => api.put('/auth/profile', profileData),
 deleteAccount: () => api.delete('/auth/account'),
};

// Company API endpoints
export const companyAPI = {
 getAllCompanies: () => api.get('/companies'),
 getCompanyById: (id) => api.get(`/companies/${id}`),
 createCompany: (companyData) => api.post('/companies', companyData),
 updateCompany: (id, companyData) => api.put(`/companies/${id}`, companyData),
 deleteCompany: (id) => api.delete(`/companies/${id}`),
};

// Calendar API endpoints
export const calendarAPI = {
 getEvents: () => api.get('/calendar/events'),
};

// Connection API endpoints
export const connectionAPI = {
 getAllUsers: (search) => api.get(`/connections/users${search ? `?search=${search}` : ''}`),
 sendFollowRequest: (recipientId) => api.post('/connections/follow', { recipientId }),
 getPendingRequests: () => api.get('/connections/requests'),
 respondToRequest: (connectionId, action) => api.post('/connections/respond', { connectionId, action }),
 getMutualConnections: (queryParams = '') => api.get(`/connections${queryParams}`),
 getConnectionProgress: (userId) => api.get(`/connections/progress/${userId}`),
};

// Response interceptor for error handling
api.interceptors.response.use(
 (response) => response,
 (error) => {
 if (error.response?.status === 401) {
 // Handle unauthorized access - only redirect if not already on login/register pages
 const currentPath = window.location.pathname;
 if (currentPath !== '/login' && currentPath !== '/register') {
 window.location.href = '/login';
 }
 }
 return Promise.reject(error);
 }
);

export default api;
