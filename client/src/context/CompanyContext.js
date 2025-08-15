import React, { createContext, useContext, useState, useEffect } from 'react';
import { companyAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const CompanyContext = createContext();

export const useCompany = () => {
 const context = useContext(CompanyContext);
 if (!context) {
 throw new Error('useCompany must be used within a CompanyProvider');
 }
 return context;
};

export const CompanyProvider = ({ children }) => {
 const [companies, setCompanies] = useState([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const { isAuthenticated } = useAuth();

 useEffect(() => {
 if (isAuthenticated) {
 fetchCompanies();
 } else {
 setCompanies([]);
 }
 }, [isAuthenticated]);

 const fetchCompanies = async () => {
 try {
 setLoading(true);
 setError(null);
 const response = await companyAPI.getAllCompanies();
 setCompanies(response.data.companies);
 } catch (error) {
 setError(error.response?.data?.error || 'Failed to fetch companies');
 console.error('Fetch companies error:', error);
 } finally {
 setLoading(false);
 }
 };

 const createCompany = async (companyData) => {
 try {
 setError(null);
 const response = await companyAPI.createCompany(companyData);
 setCompanies(prev => [response.data.company, ...prev]);
 return { success: true, company: response.data.company };
 } catch (error) {
 const errorMessage = error.response?.data?.error || 'Failed to create company';
 setError(errorMessage);
 return { success: false, error: errorMessage };
 }
 };

 const updateCompany = async (id, companyData) => {
 try {
 setError(null);
 const response = await companyAPI.updateCompany(id, companyData);
 setCompanies(prev => 
 prev.map(company => 
 company._id === id ? response.data.company : company
 )
 );
 return { success: true, company: response.data.company };
 } catch (error) {
 const errorMessage = error.response?.data?.error || 'Failed to update company';
 setError(errorMessage);
 return { success: false, error: errorMessage };
 }
 };

 const deleteCompany = async (id) => {
 try {
 setError(null);
 await companyAPI.deleteCompany(id);
 setCompanies(prev => prev.filter(company => company._id !== id));
 return { success: true };
 } catch (error) {
 const errorMessage = error.response?.data?.error || 'Failed to delete company';
 setError(errorMessage);
 return { success: false, error: errorMessage };
 }
 };

 const getCompanyById = (id) => {
 return companies.find(company => company._id === id);
 };

 const value = {
 companies,
 loading,
 error,
 fetchCompanies,
 createCompany,
 updateCompany,
 deleteCompany,
 getCompanyById,
 clearError: () => setError(null)
 };

 return (
 <CompanyContext.Provider value={value}>
 {children}
 </CompanyContext.Provider>
 );
};
