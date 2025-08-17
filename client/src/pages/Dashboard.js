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
    <div className="space-y-6 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your job applications and track your progress
          </p>
        </div>
        <button
          onClick={handleAddCompany}
          className="mt-4 sm:mt-0 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Add New Application
        </button>
      </div>

      {/* Error Message */}
      <ErrorMessage message={error} onClose={clearError} />


      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card p-3 sm:p-4 rounded-lg shadow border border-border">
          <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Total Applications</div>
        </div>
        <div className="bg-card p-3 sm:p-4 rounded-lg shadow border border-border">
          <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.applied}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Applied</div>
        </div>
        <div className="bg-card p-3 sm:p-4 rounded-lg shadow border border-border">
          <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.interviews}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">In Progress</div>
        </div>
        <div className="bg-card p-3 sm:p-4 rounded-lg shadow border border-border">
          <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.offers}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Offers</div>
        </div>
        <div className="bg-card p-3 sm:p-4 rounded-lg shadow border border-border">
          <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.rejected}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg shadow border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search companies, positions, contacts..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="">All Statuses</option>
              {APPLICATION_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Position Type
            </label>
            <select
              value={filters.positionType}
              onChange={(e) => handleFilterChange('positionType', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="">All Types</option>
              {POSITION_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-card shadow rounded-lg overflow-hidden border border-border">
        {filteredAndSortedCompanies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-2">
              {companies.length === 0 ? '📝' : '🔍'}
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {companies.length === 0 ? 'No applications yet' : 'No applications found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {companies.length === 0 
                ? 'Start tracking your job applications by adding your first company.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {companies.length === 0 && (
              <button
                onClick={handleAddCompany}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Add Your First Application
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleSort('companyName')}
                    >
                      Company {getSortIcon('companyName')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleSort('positionTitle')}
                    >
                      Position {getSortIcon('positionTitle')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      Status {getSortIcon('status')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleSort('applicationDate')}
                    >
                      Applied {getSortIcon('applicationDate')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleSort('nextActionDate')}
                    >
                      Next Action {getSortIcon('nextActionDate')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {paginatedCompanies.map((company) => (
                    <tr key={company._id} className="hover:bg-muted transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {company.companyName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {company.positionType}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">
                          {company.positionTitle || 'N/A'}
                        </div>
                        {company.salaryExpectation && (
                          <div className="text-sm text-muted-foreground">
                            ₹{company.salaryExpectation.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={company.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {formatDate(company.applicationDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {company.nextActionDate ? formatDate(company.nextActionDate) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditCompany(company)}
                          className="text-muted-foreground hover:text-foreground hover:bg-muted px-2 py-1 rounded transition-all duration-200 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company._id, company.companyName)}
                          className="text-muted-foreground hover:text-foreground hover:bg-muted px-2 py-1 rounded transition-all duration-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedCompanies.length)} of {filteredAndSortedCompanies.length} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 border border-border rounded-md text-sm transition-colors ${
                          currentPage === page 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
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

      {/* Dashboard Widgets - Below Applications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* My Connections Widget */}
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">My Connections</h3>
          {Array.isArray(connectionsCount) && connectionsCount.length > 0 ? (
            <div className="space-y-3">
              {connectionsCount.slice(0, 3).map((connection, index) => {
                // Find if this connection has any upcoming events
                const connectionEvents = companies.filter(company => 
                  company.nextActionDate && 
                  new Date(company.nextActionDate) > new Date()
                );
                const nextEvent = connectionEvents.length > 0 ? connectionEvents[0].companyName : null;
                
                return (
                  <div key={connection._id || index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {(connection.follower?.username || connection.following?.username || connection.username || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">
                          {connection.follower?.username || connection.following?.username || connection.username || 'Unknown User'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {nextEvent ? `Next: ${nextEvent}` : 'No upcoming events'}
                        </div>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                );
              })}
              {connectionsCount.length > 3 && (
                <div className="text-xs text-muted-foreground text-center pt-2">
                  +{connectionsCount.length - 3} more connections
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No connections yet</p>
          )}
        </div>

        {/* Next Events Widget */}
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Next Events</h3>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 3).map((event) => (
                <div key={event._id} className="border-l-2 border-primary pl-3">
                  <div className="font-medium text-foreground text-sm">{event.companyName}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(event.nextActionDate)}</div>
                  <div className="text-xs text-primary">{event.status}</div>
                </div>
              ))}
              {upcomingEvents.length > 3 && (
                <button
                  onClick={() => navigate('/calendar')}
                  className="w-full mt-3 px-3 py-2 text-xs bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
                >
                  Show More ({upcomingEvents.length - 3} more events)
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          )}
        </div>

        {/* Users Widget */}
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Users</h3>
          {popularUsers.length > 0 ? (
            <div className="space-y-3">
              {popularUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">{user.username}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No users available</p>
          )}
        </div>
      </div>

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