import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { connectionAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import CompanyForm from '../components/CompanyForm';
import { formatDate, formatCurrency, sortCompanies, filterCompanies } from '../utils/helpers';
import { APPLICATION_STATUSES, POSITION_TYPES } from '../utils/constants';

// Component to display individual connection with their next event
const ConnectionWidget = ({ connection, username, userInitial, userId, navigate }) => {
  const [nextEvent, setNextEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnectionNextEvent = async () => {
      try {
        if (connection.user?._id) {
          const progressResponse = await connectionAPI.getConnectionProgress(connection.user._id);
          const companies = progressResponse.data.companies || [];
          
          // Find the next upcoming event for this connection
          const upcomingEvents = companies
            .filter(company => company.nextActionDate && new Date(company.nextActionDate) > new Date())
            .sort((a, b) => new Date(a.nextActionDate) - new Date(b.nextActionDate));
          
          setNextEvent(upcomingEvents.length > 0 ? upcomingEvents[0].companyName : null);
        }
      } catch (error) {
        console.error('Error fetching connection next event:', error);
        setNextEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchConnectionNextEvent();
  }, [connection.user?._id]);

  return (
    <button
      onClick={() => userId && navigate(`/user/${userId}`)}
      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-foreground/10 transition-colors text-left cursor-pointer"
    >
      <div className="w-10 h-10 bg-foreground/10 rounded-full flex items-center justify-center">
        <span className="text-sm font-medium text-foreground">
          {userInitial}
        </span>
      </div>
      <div className="flex-1">
        <div className="font-medium text-foreground">{username}</div>
        <div className="text-sm text-muted-foreground">
          {loading ? (
            'Loading...'
          ) : nextEvent ? (
            `Next: ${nextEvent}`
          ) : (
            'No upcoming events'
          )}
        </div>
      </div>
      <div className="text-muted-foreground">
        →
      </div>
    </button>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { companies, loading, error, deleteCompany, clearError } = useCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    positionType: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [connectionsCount, setConnectionsCount] = useState([]);
  const [popularUsers, setPopularUsers] = useState([]);
  const itemsPerPage = 7;

  // Filter and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    const filtered = filterCompanies(companies, filters);
    return sortCompanies(filtered, sortBy, sortOrder);
  }, [companies, filters, sortBy, sortOrder]);

  // Paginated companies
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedCompanies.slice(startIndex, endIndex);
  }, [filteredAndSortedCompanies, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedCompanies.length / itemsPerPage);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch connections and their status
        const connectionsResponse = await connectionAPI.getMutualConnections();
        const connections = connectionsResponse.data.connections || [];
        setConnectionsCount(connections);

        // Fetch real users from explore API
        try {
          const usersResponse = await connectionAPI.getAllUsers();
          const users = usersResponse.data.users || [];
          
          // Take first 3 users (real users, no ranking)
          const displayUsers = users.slice(0, 3).map(user => ({
            id: user._id,
            username: user.username,
            email: user.email
          }));
          
          setPopularUsers(displayUsers);
        } catch (userError) {
          console.error('Error fetching users:', userError);
          setPopularUsers([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortOrder]);

  // Upcoming events for calendar widget
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return companies
      .filter(company => {
        if (!company.nextActionDate) return false;
        const actionDate = new Date(company.nextActionDate);
        return actionDate >= today && actionDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.nextActionDate) - new Date(b.nextActionDate))
      .slice(0, 3);
  }, [companies]);

  const handleAddCompany = () => {
    setEditingCompany(null);
    setIsModalOpen(true);
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleDeleteCompany = async (id, companyName) => {
    if (window.confirm(`Are you sure you want to delete ${companyName}?`)) {
      await deleteCompany(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = companies.length;
    const applied = companies.filter(c => c.status === 'Applied').length;
    const interviews = companies.filter(c => 
      ['Interview Scheduled', 'Technical Round', 'HR Round', 'Final Round'].includes(c.status)
    ).length;
    const offers = companies.filter(c => c.status === 'Offer Received').length;
    const rejected = companies.filter(c => c.status === 'Rejected').length;

    return { total, applied, interviews, offers, rejected };
  }, [companies]);

  if (loading && companies.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">Dashboard</h1>
              <p className="text-lg text-muted-foreground">
                Track your job search progress
              </p>
            </div>
            <button
              onClick={handleAddCompany}
              className="mt-6 sm:mt-0 px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
            >
              Add Application
            </button>
          </div>

          {/* Error Message */}
          <ErrorMessage message={error} onClose={clearError} />

          {/* Modular Grid Layout */}
          <div className="grid grid-cols-12 gap-4 mb-8">
            {/* Total Applications - Large Card */}
            <div className="col-span-12 md:col-span-4 bg-muted/30 rounded-[20px] p-6 flex flex-col justify-center">
              <div className="text-5xl font-bold text-foreground mb-2">{stats.total}</div>
              <div className="text-lg text-muted-foreground">Total Applications</div>
              <div className="text-sm text-muted-foreground mt-1">Your complete job search journey</div>
            </div>

            {/* Applied & In Progress - Stacked Cards */}
            <div className="col-span-6 md:col-span-2 space-y-4">
              <div className="bg-muted/20 rounded-[16px] p-4 text-center">
                <div className="text-3xl font-bold text-foreground">{stats.applied}</div>
                <div className="text-sm text-muted-foreground">Applied</div>
              </div>
              <div className="bg-muted/20 rounded-[16px] p-4 text-center">
                <div className="text-3xl font-bold text-foreground">{stats.interviews}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
            </div>

            {/* Offers & Rejected - Stacked Cards */}
            <div className="col-span-6 md:col-span-2 space-y-4">
              <div className="bg-muted/20 rounded-[16px] p-4 text-center">
                <div className="text-3xl font-bold text-foreground">{stats.offers}</div>
                <div className="text-sm text-muted-foreground">Offers</div>
              </div>
              <div className="bg-muted/20 rounded-[16px] p-4 text-center">
                <div className="text-3xl font-bold text-foreground">{stats.rejected}</div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
            </div>

            {/* Quick Stats - Wide Card */}
            <div className="col-span-12 md:col-span-4 bg-muted/30 rounded-[20px] p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-foreground">{connectionsCount.length}</div>
                  <div className="text-sm text-muted-foreground">Connections</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{upcomingEvents.length}</div>
                  <div className="text-sm text-muted-foreground">Upcoming Events</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Applications</h2>
            <div className="text-sm text-muted-foreground">
              {filteredAndSortedCompanies.length} of {companies.length} applications
            </div>
          </div>
          
          {/* Modular Filters Grid */}
          <div className="grid grid-cols-12 gap-4 mb-8">
            {/* Search - Large */}
            <div className="col-span-12 md:col-span-6 bg-muted/30 rounded-[20px] p-6">
              <label className="block text-lg font-semibold text-foreground mb-3">
                🔍 Search Applications
              </label>
              <input
                type="text"
                placeholder="Search companies, positions, contacts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all text-lg"
              />
            </div>
            
            {/* Status Filter */}
            <div className="col-span-6 md:col-span-3 bg-muted/20 rounded-[16px] p-4">
              <label className="block text-sm font-medium text-foreground mb-3">
                📊 Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
              >
                <option value="">All Statuses</option>
                {APPLICATION_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            {/* Position Type Filter */}
            <div className="col-span-6 md:col-span-3 bg-muted/20 rounded-[16px] p-4">
              <label className="block text-sm font-medium text-foreground mb-3">
                💼 Type
              </label>
              <select
                value={filters.positionType}
                onChange={(e) => handleFilterChange('positionType', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
              >
                <option value="">All Types</option>
                {POSITION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Applications Grid */}
          {filteredAndSortedCompanies.length === 0 ? (
            <div className="bg-muted/30 rounded-[20px] p-16 text-center">
              <div className="text-6xl mb-4">
                {companies.length === 0 ? '📝' : '🔍'}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {companies.length === 0 ? 'No applications yet' : 'No applications found'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {companies.length === 0 
                  ? 'Start tracking your job applications by adding your first company.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {companies.length === 0 && (
                <button
                  onClick={handleAddCompany}
                  className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
                >
                  Add Your First Application
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Sort Controls */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-sm text-muted-foreground mr-2">Sort by:</span>
                {[
                  { key: 'companyName', label: 'Company' },
                  { key: 'positionTitle', label: 'Position' },
                  { key: 'status', label: 'Status' },
                  { key: 'applicationDate', label: 'Applied' },
                  { key: 'nextActionDate', label: 'Next Action' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      sortBy === key 
                        ? 'bg-foreground text-background' 
                        : 'bg-muted/20 text-foreground hover:bg-muted/40'
                    }`}
                  >
                    {label} {getSortIcon(key)}
                  </button>
                ))}
              </div>

              {/* Modular Applications Grid */}
              <div className="grid grid-cols-12 gap-4 mb-6">
                {paginatedCompanies.map((company, index) => {
                  // Create varied layouts for visual interest
                  const isLarge = index % 5 === 0; // Every 5th item is large
                  const isMedium = index % 3 === 0 && !isLarge; // Every 3rd item (not large) is medium
                  
                  let colSpan = "col-span-12 md:col-span-4"; // Default small
                  if (isLarge) colSpan = "col-span-12 md:col-span-8";
                  else if (isMedium) colSpan = "col-span-12 md:col-span-6";
                  
                  return (
                    <div key={company._id} className={`${colSpan} group`}>
                      <div className="bg-muted/20 rounded-[16px] p-6 h-full hover:bg-muted/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-foreground/10">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-foreground/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-foreground">
                                  {company.companyName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <h3 className="text-lg font-semibold text-foreground truncate">
                                {company.companyName}
                              </h3>
                            </div>
                            
                            {isLarge && (
                              <div className="mb-3">
                                <p className="text-foreground font-medium mb-1">
                                  {company.positionTitle || 'Position not specified'}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                  <span className="px-2 py-1 bg-foreground/5 rounded-full">
                                    {company.positionType}
                                  </span>
                                  {company.salaryExpectation && (
                                    <span className="px-2 py-1 bg-foreground/5 rounded-full">
                                      ₹{company.salaryExpectation.toLocaleString('en-IN')}
                                    </span>
                                  )}
                                  {company.applicationPlatform && (
                                    <span className="px-2 py-1 bg-foreground/5 rounded-full">
                                      {company.applicationPlatform}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {!isLarge && (
                              <p className="text-sm text-foreground mb-2 truncate">
                                {company.positionTitle || 'Position not specified'}
                              </p>
                            )}
                          </div>
                          <StatusBadge status={company.status} className="flex-shrink-0 ml-2" />
                        </div>
                        
                        {/* Timeline */}
                        <div className={`grid ${isLarge ? 'grid-cols-3' : 'grid-cols-2'} gap-3 mb-4 text-sm`}>
                          <div className="bg-background/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">Applied</div>
                            <div className="font-medium text-foreground text-xs">
                              {formatDate(company.applicationDate)}
                            </div>
                          </div>
                          <div className="bg-background/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">Next Action</div>
                            <div className="font-medium text-foreground text-xs">
                              {company.nextActionDate ? formatDate(company.nextActionDate) : 'Not set'}
                            </div>
                          </div>
                          {isLarge && (
                            <div className="bg-background/50 rounded-lg p-3">
                              <div className="text-xs text-muted-foreground mb-1">Rounds</div>
                              <div className="font-medium text-foreground text-xs">
                                {company.interviewRounds || 0} completed
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Notes Preview for Large Cards */}
                        {isLarge && company.notes && (
                          <div className="mb-4">
                            <div className="text-xs text-muted-foreground mb-1">Notes</div>
                            <p className="text-sm text-foreground bg-background/50 rounded-lg p-3 line-clamp-2">
                              {company.notes}
                            </p>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
                          <button
                            onClick={() => handleEditCompany(company)}
                            className="px-3 py-1.5 text-xs text-foreground bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(company._id, company.companyName)}
                            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-muted/20 rounded-[16px] p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedCompanies.length)} of {filteredAndSortedCompanies.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-muted/40 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/60 transition-colors"
                      >
                        ← Previous
                      </button>
                      
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 rounded-lg text-sm transition-colors ${
                                currentPage === page 
                                  ? 'bg-foreground text-background' 
                                  : 'bg-muted/40 hover:bg-muted/60'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-muted/40 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/60 transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </>
        )}
        </div>
      </section>

      {/* Widgets Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">Widgets</h2>
          
          <div className="grid grid-cols-12 gap-4">
            {/* My Connections - Tall Card */}
            <div className="col-span-12 md:col-span-5 bg-muted/20 rounded-[16px] p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">My Connections</h3>
              {Array.isArray(connectionsCount) && connectionsCount.length > 0 ? (
                <div className="space-y-4">
                  {connectionsCount.slice(0, 4).map((connection, index) => {
                    const connectedUser = connection.user;
                    const username = connectedUser?.username || 'Unknown User';
                    const userInitial = username.charAt(0).toUpperCase();
                    const userId = connectedUser?._id;
                    
                    return (
                      <ConnectionWidget 
                        key={connection._id || index}
                        connection={connection}
                        username={username}
                        userInitial={userInitial}
                        userId={userId}
                        navigate={navigate}
                      />
                    );
                  })}
                  {connectionsCount.length > 4 && (
                    <button
                      onClick={() => navigate('/connections')}
                      className="w-full text-sm text-muted-foreground text-center pt-2 border-t border-border hover:text-foreground transition-colors"
                    >
                      +{connectionsCount.length - 4} more connections
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="w-8 h-8 bg-foreground/10 rounded-full"></div>
                  </div>
                  <p className="text-muted-foreground">No connections yet</p>
                  <button
                    onClick={() => navigate('/explore')}
                    className="mt-3 px-4 py-2 text-sm bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors"
                  >
                    Find People
                  </button>
                </div>
              )}
            </div>

            {/* Upcoming Events - Enhanced Card */}
            <div className="col-span-12 md:col-span-4 bg-gradient-to-br from-muted/30 to-muted/20 rounded-[20px] p-6 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-foreground/5 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-foreground/5 rounded-full translate-y-8 -translate-x-8"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-foreground/10 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📅</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Upcoming Events</h3>
                </div>
                
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 3).map((event, index) => {
                      const daysUntil = Math.ceil((new Date(event.nextActionDate) - new Date()) / (1000 * 60 * 60 * 24));
                      const isUrgent = daysUntil <= 2;
                      
                      return (
                        <div key={event._id} className="bg-background/50 rounded-lg p-4 border border-border/50 hover:bg-background/70 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-medium text-foreground text-sm">{event.companyName}</div>
                              <div className="text-xs text-muted-foreground mt-1">{event.status}</div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isUrgent 
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                                : 'bg-foreground/10 text-foreground'
                            }`}>
                              {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>🕒</span>
                            <span>{formatDate(event.nextActionDate)}</span>
                          </div>
                        </div>
                      );
                    })}
                    
                    {upcomingEvents.length > 3 && (
                      <button
                        onClick={() => navigate('/calendar')}
                        className="w-full mt-4 px-4 py-3 text-sm bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
                      >
                        View All Events ({upcomingEvents.length})
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-3">
                      <div className="w-8 h-8 bg-foreground/10 rounded-lg"></div>
                    </div>
                    <p className="text-muted-foreground mb-3">No upcoming events</p>
                    <button
                      onClick={() => navigate('/calendar')}
                      className="px-4 py-2 text-sm bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors"
                    >
                      View Calendar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Discover Users - Compact Card */}
            <div className="col-span-12 md:col-span-3 bg-muted/20 rounded-[16px] p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Discover Users</h3>
              {popularUsers.length > 0 ? (
                <div className="space-y-3">
                  {popularUsers.slice(0, 3).map((user) => (
                    <button
                      key={user.id}
                      onClick={() => navigate(`/user/${user.id}`)}
                      className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-foreground/10 transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-foreground/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-foreground">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm truncate">{user.username}</div>
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => navigate('/explore')}
                    className="w-full mt-3 px-3 py-2 text-xs bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors"
                  >
                    Explore More
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="w-6 h-6 bg-foreground/10 rounded-full"></div>
                  </div>
                  <p className="text-muted-foreground text-sm">No users available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Company Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCompany ? 'Edit Application' : 'Add New Application'}
        size="large"
      >
        <CompanyForm
          company={editingCompany}
          onClose={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;