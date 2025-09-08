import React, { useState, useEffect, useRef } from 'react';
import { useCompany } from '../context/CompanyContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import CustomCalendar from './CustomCalendar';
import CustomTimePicker from './CustomTimePicker';
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
    nextActionTime: '12:00', // Default to 12:00 PM
    location: '',
    interviewRounds: '',
    positionType: 'Full-time',
    positionTitle: '',
    notes: '',
    salaryExpectation: '',
    internshipStipend: '',
    applicationPlatform: '',
    bondYears: '',
    isPrivate: false
  });

  useEffect(() => {
    if (company) {
      const nextActionDateTime = company.nextActionDate ? new Date(company.nextActionDate) : null;
      setFormData({
        companyName: company.companyName || '',
        status: (company.status && APPLICATION_STATUSES.includes(company.status)) ? company.status : 'Other',
        customStatus: (company.status && !APPLICATION_STATUSES.includes(company.status)) ? company.status : '',
        nextActionDate: nextActionDateTime ? 
          nextActionDateTime.toISOString().split('T')[0] : '',
        nextActionTime: nextActionDateTime ? 
          nextActionDateTime.toTimeString().slice(0, 5) : '',
        location: company.location || '',
        interviewRounds: company.interviewRounds || '',
        positionType: company.positionType || 'Full-time',
        positionTitle: company.positionTitle || '',
        notes: company.notes || '',
        salaryExpectation: company.salaryExpectation || '',
        applicationPlatform: company.applicationPlatform || company.contactPerson || '',
        bondYears: company.bondYears || '',
        isPrivate: company.isPrivate || false
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
    const { name, value, type, checked } = e.target;
    
    // Set default time to 12:00 PM when date is selected and no time is set
    if (name === 'nextActionDate' && value && !formData.nextActionTime) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        nextActionTime: '12:00' // Default to 12:00 PM
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : Number(value)) : value
      }));
    }
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
        salaryExpectation: formData.salaryExpectation ? Number(formData.salaryExpectation) : null,
        bondYears: formData.bondYears ? Number(formData.bondYears) : null
      };

      // Remove fields that shouldn't be sent to server
      delete submitData.customStatus;
      delete submitData.nextActionTime;

      // Validate custom status
      if (formData.status === 'Other' && !formData.customStatus.trim()) {
        setError('Please enter a custom status');
        setLoading(false);
        return;
      }

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

        {/* Enhanced Status & Type Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Application Status
            </label>
            <div className="relative group">
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-10 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-foreground/40 appearance-none cursor-pointer shadow-sm group-hover:shadow-md"
              >
                {APPLICATION_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-muted-foreground transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {formData.status === 'Other' && (
              <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
                <input
                  type="text"
                  id="customStatus"
                  name="customStatus"
                  value={formData.customStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-foreground/40 shadow-sm"
                  placeholder="Enter custom status"
                  required={formData.status === 'Other'}
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Position Type
            </label>
            <div className="relative group">
              <select
                id="positionType"
                name="positionType"
                value={formData.positionType}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-10 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-foreground/40 appearance-none cursor-pointer shadow-sm group-hover:shadow-md"
              >
                {POSITION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-muted-foreground transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Next Action Date & Time Row */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Next Action Date & Time
          </label>
          
          {/* Quick Date Selection Buttons */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick Date Selection</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Today', days: 0 },
                { label: 'Tomorrow', days: 1 },
                { label: 'Next Week', days: 7 },
                { label: 'In 2 Weeks', days: 14 }
              ].map(({ label, days }) => {
                const targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + days);
                const isSelected = formData.nextActionDate === targetDate.toISOString().split('T')[0];
                
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      const dateString = targetDate.toISOString().split('T')[0];
                      setFormData(prev => ({
                        ...prev,
                        nextActionDate: dateString,
                        nextActionTime: prev.nextActionTime || '12:00'
                      }));
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 border ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                        : 'bg-background text-muted-foreground border-border/50 hover:bg-muted/50 hover:text-foreground hover:border-border hover:shadow-sm'
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-xs opacity-70">
                      {targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Enhanced Date Picker with Custom Calendar */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Date
              </label>
              <CustomCalendar
                value={formData.nextActionDate}
                onChange={(dateString) => {
                  setFormData(prev => ({
                    ...prev,
                    nextActionDate: dateString,
                    nextActionTime: prev.nextActionTime || '12:00'
                  }));
                }}
                minDate={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            {/* Enhanced Time Picker with Custom Component */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Time
              </label>
              <CustomTimePicker
                value={formData.nextActionTime}
                onChange={(timeString) => {
                  setFormData(prev => ({
                    ...prev,
                    nextActionTime: timeString
                  }));
                }}
                disabled={!formData.nextActionDate}
              />
            </div>
          </div>
          
          
          {formData.nextActionDate && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              This will appear on your calendar for tracking follow-ups
            </p>
          )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                id="bondYears"
                name="bondYears"
                min="0"
                step="0.5"
                value={formData.bondYears}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all"
                placeholder="Bond Years (if any)"
              />
              <input
                type="text"
                id="applicationPlatform"
                name="applicationPlatform"
                value={formData.applicationPlatform}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all"
                placeholder="Application Platform (e.g., LinkedIn, Indeed)"
              />
            </div>
            <div className="space-y-2">
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => {
                  handleChange(e);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-transparent transition-all resize-none min-h-[80px] max-h-[200px]"
                placeholder="Additional notes... (up to 1000 words)"
                maxLength={7000}
                style={{ height: 'auto', minHeight: '80px' }}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Additional notes and details about the application</span>
                <span className={`${formData.notes.length > 6500 ? 'text-orange-500' : ''} ${formData.notes.length >= 7000 ? 'text-red-500' : ''}`}>
                  {formData.notes.length}/7000 characters
                </span>
              </div>
            </div>
          </div>
        </details>

        {/* Privacy Toggle */}
        <div className="pt-4 border-t border-border/30">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full transition-all duration-200 flex items-center ${
                formData.isPrivate 
                  ? 'bg-foreground shadow-inner' 
                  : 'bg-muted border border-border group-hover:bg-muted/80'
              }`}>
                <div className={`w-4 h-4 bg-background rounded-full shadow-sm transition-all duration-200 transform ${
                  formData.isPrivate ? 'translate-x-6' : 'translate-x-1'
                }`}></div>
              </div>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-foreground">
                Private Application
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.isPrivate 
                  ? 'This application is private and won\'t be visible to your connections'
                  : 'This application will be visible to users who follow you'
                }
              </p>
            </div>
            <div className="flex-shrink-0">
              <svg className={`w-5 h-5 transition-colors duration-200 ${
                formData.isPrivate ? 'text-foreground' : 'text-muted-foreground'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </label>
        </div>
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