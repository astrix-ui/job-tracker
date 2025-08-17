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
const ConnectionWidget = ({ connection, username, userInitial }) => {
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
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">
            {userInitial}
          </span>
        </div>
        <div>
          <div className="font-medium text-foreground text-sm">
            {username}
          </div>
          <div className="text-xs text-muted-foreground">
            {loading ? (
              'Loading...'
            ) : nextEvent ? (
              `Next: ${nextEvent}`
            ) : (
              'No upcoming events'
            )}
          </div>
        </div>
      </div>
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
    </div>
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

          {/* Statistics Cards */}
          <div className="bg-muted/30 rounded-[20px] p-8 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stats.applied}</div>
                <div className="text-sm text-muted-foreground">Applied</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stats.interviews}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stats.offers}</div>
                <div className="text-sm text-muted-foreground">Offers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stats.rejected}</div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">Applications</h2>
          
          {/* Filters */}
          <div className="bg-muted/20 rounded-[16px] p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search companies, positions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
                >
                  <option value="">All Statuses</option>
                  {APPLICATION_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Position Type
                </label>
                <select
                  value={filters.positionType}
                  onChange={(e) => handleFilterChange('positionType', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
                >
                  <option value="">All Types</option>
                  {POSITION_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-card rounded-[16px] overflow-hidden border border-border">
            {filteredAndSortedCompanies.length === 0 ? (
              <div className="text-center py-16">
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
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th 
                        className="px-6 py-4 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('companyName')}
                      >
                        Company {getSortIcon('companyName')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('positionTitle')}
                      >
                        Position {getSortIcon('positionTitle')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        Status {getSortIcon('status')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('applicationDate')}
                      >
                        Applied {getSortIcon('applicationDate')}
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('nextActionDate')}
                      >
                        Next Action {getSortIcon('nextActionDate')}
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card">
                    {paginatedCompanies.map((company) => (
                      <tr key={company._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-5">
                          <div>
                            <div className="font-medium text-foreground">
                              {company.companyName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {company.positionType}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-foreground">
                            {company.positionTitle || 'N/A'}
                          </div>
                          {company.salaryExpectation && (
                            <div className="text-sm text-muted-foreground">
                              ₹{company.salaryExpectation.toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={company.status} />
                        </td>
                        <td className="px-6 py-5 text-foreground">
                          {formatDate(company.applicationDate)}
                        </td>
                        <td className="px-6 py-5 text-foreground">
                          {company.nextActionDate ? formatDate(company.nextActionDate) : 'N/A'}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditCompany(company)}
                              className="px-3 py-1 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCompany(company._id, company.companyName)}
                              className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedCompanies.length)} of {filteredAndSortedCompanies.length} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border border-border rounded-lg text-sm transition-colors ${
                          currentPage === page 
                            ? 'bg-foreground text-background' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

        </div>
      </section>

      {/* Widgets Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">Quick Access</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* My Connections Widget */}
            <div className="bg-muted/20 rounded-[16px] p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">My Connections</h3>
              {Array.isArray(connectionsCount) && connectionsCount.length > 0 ? (
                <div className="space-y-4">
                  {connectionsCount.slice(0, 3).map((connection, index) => {
                    const connectedUser = connection.user;
                    const username = connectedUser?.username || 'Unknown User';
                    const userInitial = username.charAt(0).toUpperCase();
                    
                    return (
                      <div key={connection._id || index} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-foreground/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-foreground">
                            {userInitial}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{username}</div>
                          <div className="text-sm text-muted-foreground">Connected</div>
                        </div>
                      </div>
                    );
                  })}
                  {connectionsCount.length > 3 && (
                    <div className="text-sm text-muted-foreground text-center pt-2">
                      +{connectionsCount.length - 3} more connections
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No connections yet</p>
              )}
            </div>

            {/* Next Events Widget */}
            <div className="bg-muted/20 rounded-[16px] p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Events</h3>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div key={event._id} className="border-l-2 border-foreground pl-4">
                      <div className="font-medium text-foreground">{event.companyName}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(event.nextActionDate)}</div>
                      <div className="text-sm text-foreground/70">{event.status}</div>
                    </div>
                  ))}
                  {upcomingEvents.length > 3 && (
                    <button
                      onClick={() => navigate('/calendar')}
                      className="w-full mt-4 px-4 py-2 text-sm bg-foreground/10 text-foreground rounded-lg hover:bg-foreground/20 transition-colors"
                    >
                      View All Events
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming events</p>
              )}
            </div>

            {/* Popular Users Widget */}
            <div className="bg-muted/20 rounded-[16px] p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Discover Users</h3>
              {popularUsers.length > 0 ? (
                <div className="space-y-4">
                  {popularUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => navigate(`/user/${user.id}`)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-foreground/10 transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-foreground/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-foreground">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{user.username}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No users available</p>
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