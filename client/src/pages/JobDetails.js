import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import CompanyForm from '../components/CompanyForm';
import { formatDateTime } from '../utils/helpers';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCompanyById, deleteCompany } = useCompany();
  const { showSuccess, showError } = useToast();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const companyData = await getCompanyById(id);
        if (companyData) {
          setCompany(companyData);
        } else {
          setError('Job application not found');
        }
      } catch (err) {
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCompany();
    }
  }, [id, getCompanyById]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const result = await deleteCompany(id);
      if (result.success) {
        showSuccess('Application deleted successfully');
        navigate('/dashboard');
      } else {
        showError(result.error || 'Failed to delete application');
      }
    } catch (err) {
      showError('Failed to delete application');
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    // Refresh company data after edit
    const fetchCompany = async () => {
      const companyData = await getCompanyById(id);
      if (companyData) {
        setCompany(companyData);
      }
    };
    fetchCompany();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <ErrorMessage message={error || 'Job application not found'} />
          <Link
            to="/dashboard"
            className="mt-4 inline-block px-4 py-2 bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center w-10 h-10 bg-background/50 border border-border/30 text-foreground rounded-xl hover:bg-background hover:border-border/50 transition-all duration-200 mr-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Application Details</h1>
            <p className="text-muted-foreground">View and manage your job application</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8">
            {/* Company Header */}
            <div className="mb-8 pb-6 border-b border-border/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-foreground/10 to-foreground/20 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-foreground">
                        {company.companyName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold text-foreground mb-2">{company.companyName}</h2>
                      <p className="text-lg text-muted-foreground">
                        {company.positionTitle || 'Position not specified'} • {company.positionType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={company.status} />
                    {company.isPrivate && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-lg">
                        <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-xs text-muted-foreground font-medium">Private</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Application Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl p-6 border border-border/30">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <div className="w-2 h-2 bg-foreground rounded-full mr-3"></div>
                    Application Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Position Title</label>
                        <p className="text-foreground font-medium">{company.positionTitle || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Location</label>
                        <p className="text-foreground font-medium">{company.location || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Application Platform</label>
                        <p className="text-foreground font-medium">{company.applicationPlatform || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Applied Date</label>
                        <p className="text-foreground font-medium">{formatDateTime(company.createdAt)}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Interview Rounds</label>
                        <p className="text-foreground font-medium">{company.interviewRounds || 0}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Last Updated</label>
                        <p className="text-foreground font-medium">{formatDateTime(company.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline & Compensation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-6 border border-blue-200/30 dark:border-blue-800/30">
                    <h4 className="text-md font-semibold text-foreground mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Timeline
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Next Action</label>
                        <p className="text-foreground font-medium">
                          {company.nextActionDate ? formatDateTime(company.nextActionDate) : 'Not scheduled'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-900/20 dark:to-green-800/10 rounded-xl p-6 border border-green-200/30 dark:border-green-800/30">
                    <h4 className="text-md font-semibold text-foreground mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Compensation
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Salary Expectation</label>
                        <p className="text-foreground font-medium">
                          {company.salaryExpectation ? `₹${company.salaryExpectation.toLocaleString('en-IN')}` : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Bond Period</label>
                        <p className="text-foreground font-medium">
                          {company.bondYears ? `${company.bondYears} year${company.bondYears !== 1 ? 's' : ''}` : 'No bond'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-6">
                {company.notes && (
                  <div className="bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl p-6 border border-purple-200/30 dark:border-purple-800/30">
                    <h4 className="text-md font-semibold text-foreground mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Notes
                    </h4>
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">{company.notes}</p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-muted/30 to-muted/20 rounded-xl p-6 border border-border/30">
                  <h4 className="text-md font-semibold text-foreground mb-4 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Quick Actions
                  </h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="w-full px-4 py-3 bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Application
                    </button>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="w-full px-4 py-3 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-500/20 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Application
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        title="Edit Application"
        size="large"
        className="job-details-modal"
      >
        <CompanyForm company={company} onClose={handleEditClose} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Application"
        size="medium"
        className="job-details-delete-modal"
      >
        <div className="space-y-4">
          <p className="text-foreground">
            Are you sure you want to delete the application for <strong>{company.companyName}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-border/30 rounded-xl text-muted-foreground bg-background/50 hover:bg-background hover:border-border/50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {deleting && <LoadingSpinner size="small" />}
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobDetails;