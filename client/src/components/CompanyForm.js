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
 nextActionDate: '',
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
 setFormData({
 companyName: company.companyName || '',
 status: company.status || 'Applied',
 nextActionDate: company.nextActionDate ? 
 new Date(company.nextActionDate).toISOString().split('T')[0] : '',
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
 nextActionDate: formData.nextActionDate || null,
 salaryExpectation: formData.salaryExpectation ? Number(formData.salaryExpectation) : null
 };

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
 <form onSubmit={handleSubmit} className="space-y-6">
 <ErrorMessage message={error} onClose={() => setError('')} />

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Company Name */}
 <div className="md:col-span-2">
 <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-2">
 Company Name *
 </label>
 <input
 ref={companyNameRef}
 type="text"
 id="companyName"
 name="companyName"
 required
 value={formData.companyName}
 onChange={handleChange}
 className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
 placeholder="Enter company name"
 />
 </div>

 {/* Position Title */}
 <div>
 <label htmlFor="positionTitle" className="block text-sm font-medium text-foreground mb-2">
 Position Title
 </label>
 <input
 type="text"
 id="positionTitle"
 name="positionTitle"
 value={formData.positionTitle}
 onChange={handleChange}
 className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
 placeholder="e.g., Software Engineer"
 />
 </div>

 {/* Position Type */}
 <div>
 <label htmlFor="positionType" className="block text-sm font-medium text-foreground mb-2">
 Position Type
 </label>
 <select
 id="positionType"
 name="positionType"
 value={formData.positionType}
 onChange={handleChange}
 className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
 >
 {POSITION_TYPES.map(type => (
 <option key={type} value={type}>{type}</option>
 ))}
 </select>
 </div>

 {/* Status */}
 <div>
 <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
 Application Status
 </label>
 <select
 id="status"
 name="status"
 value={formData.status}
 onChange={handleChange}
 className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
 >
 {APPLICATION_STATUSES.map(status => (
 <option key={status} value={status}>{status}</option>
 ))}
 </select>
 </div>

 {/* Next Action Date */}
 <div>
 <label htmlFor="nextActionDate" className="block text-sm font-medium text-foreground mb-2">
 Next Action Date
 </label>
 <input
 type="date"
 id="nextActionDate"
 name="nextActionDate"
 value={formData.nextActionDate}
 onChange={handleChange}
 className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
 />
 </div>

 {/* Interview Rounds */}
 <div>
 <label htmlFor="interviewRounds" className="block text-sm font-medium text-foreground mb-2">
 Interview Rounds Completed
 </label>
 <input
 type="number"
 id="interviewRounds"
 name="interviewRounds"
 min="0"
 value={formData.interviewRounds}
 onChange={handleChange}
 className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
 />
 </div>

 {/* Salary Expectation */}
 <div>
 <label htmlFor="salaryExpectation" className="block text-sm font-medium text-foreground mb-2">
 Salary Expectation (₹)
 </label>
 <input
 type="number"
 id="salaryExpectation"
 name="salaryExpectation"
 min="0"
 value={formData.salaryExpectation}
 onChange={handleChange}
 className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
 placeholder="e.g., 75000"
 />
 </div>

 {/* Application Platform */}
 <div>
 <label htmlFor="applicationPlatform" className="block text-sm font-medium text-foreground mb-2">
 Application Platform
 </label>
 <input
 type="text"
 id="applicationPlatform"
 name="applicationPlatform"
 value={formData.applicationPlatform}
 onChange={handleChange}
 className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
 placeholder="e.g., LinkedIn, Indeed"
 />
 </div>

 {/* Notes */}
 <div className="md:col-span-2">
 <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
 Notes
 </label>
 <textarea
 id="notes"
 name="notes"
 rows={4}
 value={formData.notes}
 onChange={handleChange}
 className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
 placeholder="Add any additional notes about this application..."
 />
 </div>
 </div>

 {/* Form Actions */}
 <div className="flex justify-end gap-3 pt-6 border-t border-border">
 <button
 type="button"
 onClick={onClose}
 className="px-4 py-2 border border-border rounded-lg text-muted-foreground bg-background hover:bg-muted transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={loading}
 className="px-6 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
 >
 {loading && <LoadingSpinner size="small" className="mr-2" />}
 {company ? 'Update Application' : 'Add Application'}
 </button>
 </div>
 </form>
 );
};

export default CompanyForm;
