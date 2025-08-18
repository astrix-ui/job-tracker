import React, { useState, useEffect, useRef } from 'react';
import { useCompany } from '../context/CompanyContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { APPLICATION_STATUSES, POSITION_TYPES } from '../utils/constants';

const CompanyForm = ({ company, onClose }) => {
  const { createCompany, updateCompany } = useCompany();
  const { showSuccess, showError } = useToast();
  const companyNameRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    status: 'Applied',
    customStatus: '',
    nextActionDate: '',
    nextActionTime: '',
    location: '',
    interviewRounds: 0,
    positionType: 'Full-time',
    positionTitle: '',
    notes: '',
    salaryExpectation: '',
    internshipStipend: '',
    applicationPlatform: ''
  });

  useEffect(() => {
    if (company) {
      const nextActionDateTime = company.nextActionDate ? new Date(company.nextActionDate) : null;
      setFormData({
        companyName: company.companyName || '',
        status: company.status || 'Applied',
        customStatus: (company.status && !APPLICATION_STATUSES.includes(company.status)) ? company.status : '',
        nextActionDate: nextActionDateTime ? 
          nextActionDateTime.toISOString().split('T')[0] : '',
        nextActionTime: nextActionDateTime ? 
          nextActionDateTime.toTimeString().slice(0, 5) : '',
        location: company.location || '',
        interviewRounds: company.interviewRounds || 0,
        positionType: company.positionType || 'Full-time',
        positionTitle: company.positionTitle || '',
        notes: company.notes || '',
        salaryExpectation: company.salaryExpectation || '',
        applicationPlatform: company.applicationPlatform || company.contactPerson || ''
      });
    }
    // Auto-focus company name field
    setTimeout(() => {
      if (companyNameRef.current) {
        companyNameRef.current.focus();
      }
    }, 100);
  }, [company]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        status: formData.status === 'Other' ? formData.customStatus : formData.status,
        nextActionDate: formData.nextActionDate && formData.nextActionTime ? 
          new Date(`${formData.nextActionDate}T${formData.nextActionTime}`).toISOString() :
          formData.nextActionDate ? 
          new Date(`${formData.nextActionDate}T09:00`).toISOString() : null,
        salaryExpectation: formData.salaryExpectation ? Number(formData.salaryExpectation) : null
      };

      // Remove customStatus from submit data
      delete submitData.customStatus;
      delete submitData.nextActionTime;

      let result;
      if (company) {
        result = await updateCompany(company._id, submitData);
      } else {
        result = await createCompany(submitData);
      }

      if (result.success) {
        showSuccess(company ? 'Application updated successfully!' : 'Application added successfully!');
        onClose();
      } else {
        setError(result.error);
        showError(result.error || 'Failed to save application');
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorMessage message={error} onClose={() => setError('')} />

      {/* Essential Fields Only - Minimal Design */}
      <div className="space-y-4">
        {/* Company Name */}
        <div>
          <input
            ref={companyNameRef}
            type="text"
            id="companyName"
            name="companyName"
            required
            value={formData.companyName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all"
            placeholder="Company Name *"
          />
        </div>

        {/* Position & Location Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            id="positionTitle"
            name="positionTitle"
            value={formData.positionTitle}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all"
            placeholder="Position Title"
          />
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all"
            placeholder="Location"
          />
        </div>

        {/* Status & Type Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all"
            >
              {APPLICATION_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {formData.status === 'Other' && (
              <input
                type="text"
                id="customStatus"
                name="customStatus"
                value={formData.customStatus}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all mt-2"
                placeholder="Enter custom status"
                required={formData.status === 'Other'}
              />
            )}
          </div>
          <select
            id="positionType"
            name="positionType"
            value={formData.positionType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all"
          >
            {POSITION_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Next Action Date & Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="date"
            id="nextActionDate"
            name="nextActionDate"
            value={formData.nextActionDate}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all"
          />
          <input
            type="time"
            id="nextActionTime"
            name="nextActionTime"
            value={formData.nextActionTime}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all"
            disabled={!formData.nextActionDate}
          />
        </div>

        {/* Optional Fields - Collapsible */}
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors py-2 select-none">
            <span className="group-open:hidden">+ More details</span>
            <span className="hidden group-open:inline">- Less details</span>
          </summary>
          <div className="space-y-4 mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                id="interviewRounds"
                name="interviewRounds"
                min="0"
                value={formData.interviewRounds}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all"
                placeholder="Interview Rounds"
              />
              <input
                type="number"
                id="salaryExpectation"
                name="salaryExpectation"
                min="0"
                value={formData.salaryExpectation}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all"
                placeholder="Salary Expectation (₹)"
              />
            </div>
            <input
              type="text"
              id="applicationPlatform"
              name="applicationPlatform"
              value={formData.applicationPlatform}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all"
              placeholder="Application Platform (e.g., LinkedIn, Indeed)"
            />
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all resize-none"
              placeholder="Additional notes..."
            />
          </div>
        </details>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-medium text-muted-foreground bg-background border border-border rounded-xl hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 text-sm font-medium bg-foreground text-background rounded-xl hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading && <LoadingSpinner size="small" />}
          {company ? 'Update' : 'Add Application'}
        </button>
      </div>
    </form>
  );
};

export default CompanyForm;