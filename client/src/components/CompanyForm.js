import React, { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { APPLICATION_STATUSES, POSITION_TYPES } from '../utils/constants';

const CompanyForm = ({ company, onClose }) => {
 const { createCompany, updateCompany } = useCompany();
 const { showSuccess, showError } = useToast();
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
 <label htmlFor="companyName" className="block text-sm font-medium text-foreground">
 Company Name *
 </label>
 <input
 type="text"
 id="companyName"
 name="companyName"
 required
 value={formData.companyName}
 onChange={handleChange}
 className="mt-1 block w-full px-3 py-2 border border-input rounded-md shadow-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
 placeholder="Enter company name"
 />
 </div>

 {/* Position Title */}
 <div>
 <label htmlFor="positionTitle" className="block text-sm font-medium text-muted-foreground">
 Position Title
 </label>
 <input
 type="text"
 id="positionTitle"
 name="positionTitle"
 value={formData.positionTitle}
 onChange={handleChange}
 className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-card bg-card text-card-foreground focus:outline-none focus:ring-blue-500 focus:border-blue-500"
 placeholder="e.g., Software Engineer"
 />
 </div>

 {/* Position Type */}
 <div>
 <label htmlFor="positionType" className="block text-sm font-medium text-muted-foreground">
 Position Type
 </label>
 <select
 id="positionType"
 name="positionType"
 value={formData.positionType}
 onChange={handleChange}
 className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-card bg-card text-card-foreground focus:outline-none focus:ring-blue-500 focus:border-blue-500"
 >
 {POSITION_TYPES.map(type => (
 <option key={type} value={type}>{type}</option>
 ))}
 </select>
 </div>

 {/* Status */}
 <div>
 <label htmlFor="status" className="block text-sm font-medium text-muted-foreground">
 Application Status
 </label>
 <select
 id="status"
 name="status"
 value={formData.status}
 onChange={handleChange}
 className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-card bg-card text-card-foreground focus:outline-none focus:ring-blue-500 focus:border-blue-500"
 >
 {APPLICATION_STATUSES.map(status => (
 <option key={status} value={status}>{status}</option>
 ))}
 </select>
 </div>

 {/* Interview Rounds */}
 <div>
 <label htmlFor="interviewRounds" className="block text-sm font-medium text-muted-foreground">
 Interview Rounds Completed
 </label>
 <input
 type="number"
 id="interviewRounds"
 name="interviewRounds"
 min="0"
 value={formData.interviewRounds}
 onChange={handleChange}
 className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-card bg-card text-card-foreground focus:outline-none focus:ring-blue-500 focus:border-blue-500"
 />
 </div>

 {/* Next Action Date */}
 <div>
 <label htmlFor="nextActionDate" className="block text-sm font-medium text-muted-foreground">
 Next Action Date
 </label>
 <input
 type="date"
 id="nextActionDate"
 name="nextActionDate"
 value={formData.nextActionDate}
 onChange={handleChange}
 className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-card bg-card text-card-foreground focus:outline-none focus:ring-blue-500 focus:border-blue-500"
 />
 </div>

 {/* Salary Expectation */}
 <div>
 <label htmlFor="salaryExpectation" className="block text-sm font-medium text-muted-foreground">
 Salary Expectation (Rupees)
 </label>
 <input
 type="number"
 id="salaryExpectation"
 name="salaryExpectation"
 min="0"
 value={formData.salaryExpectation}
 onChange={handleChange}
 className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-card bg-card text-card-foreground focus:outline-none focus:ring-blue-500 focus:border-blue-500"
 placeholder="e.g., 75000"
 />
 </div>

 {/* Application Platform */}
 <div>
 <label htmlFor="applicationPlatform" className="block text-sm font-medium text-muted-foreground">
 Application Platform
 </label>
 <input
 type="text"
 id="applicationPlatform"
 name="applicationPlatform"
 value={formData.applicationPlatform}
 onChange={handleChange}
 className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-card bg-card text-card-foreground focus:outline-none focus:ring-blue-500 focus:border-blue-500"
 placeholder="e.g., LinkedIn, Indeed, Company Website"
 />
 </div>

 {/* Notes */}
 <div className="md:col-span-2">
 <label htmlFor="notes" className="block text-sm font-medium text-muted-foreground">
 Notes
 </label>
 <textarea
 id="notes"
 name="notes"
 rows={4}
 value={formData.notes}
 onChange={handleChange}
 className="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm bg-card bg-card text-card-foreground focus:outline-none focus:ring-blue-500 focus:border-blue-500"
 placeholder="Add any additional notes about this application..."
 />
 </div>
 </div>

 {/* Form Actions */}
 <div className="flex justify-end space-x-3 pt-6 border-t border-border text-card-foreground">
 <button
 type="button"
 onClick={onClose}
 className="px-4 py-2 border border-border rounded-md text-muted-foreground bg-background hover:bg-muted transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={loading}
 className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
 >
 {loading && <LoadingSpinner size="small" className="mr-2" />}
 {company ? 'Update Application' : 'Add Application'}
 </button>
 </div>
 </form>
 );
};

export default CompanyForm;
