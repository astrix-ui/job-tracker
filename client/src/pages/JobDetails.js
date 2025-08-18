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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center w-10 h-10 bg-background/50 border border-border/30 text-foreground rounded-xl hover:bg-background hover:border-border/50 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{company.companyName}</h1>
              <p className="text-muted-foreground">Job Application Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Position Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Position Title</label>
                      <p className="text-foreground">{company.positionTitle || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Position Type</label>
                      <p className="text-foreground">{company.positionType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                      <p className="text-foreground">{company.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                      <StatusBadge status={company.status} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Application Info</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Applied Date</label>
                      <p className="text-foreground">{formatDateTime(company.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Application Platform</label>
                      <p className="text-foreground">{company.applicationPlatform || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Interview Rounds</label>
                      <p className="text-foreground">{company.interviewRounds || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Timeline</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Next Action Date</label>
                      <p className="text-foreground">
                        {company.nextActionDate ? formatDateTime(company.nextActionDate) : 'Not scheduled'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Last Updated</label>
                      <p className="text-foreground">{formatDateTime(company.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Compensation</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Salary Expectation</label>
                      <p className="text-foreground">
                        {company.salaryExpectation ? `₹${company.salaryExpectation.toLocaleString()}` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>

                {company.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Notes</h3>
                    <div className="bg-muted/30 rounded-xl p-4">
                      <p className="text-foreground whitespace-pre-wrap">{company.notes}</p>
                    </div>
                  </div>
                )}
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
      >
        <CompanyForm company={company} onClose={handleEditClose} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Application"
        size="medium"
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