export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount) => {
  if (!amount) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const getStatusColor = (status) => {
  const colors = {
    'Applied': 'blue',
    'Interview Scheduled': 'yellow',
    'Technical Round': 'purple',
    'HR Round': 'indigo',
    'Final Round': 'orange',
    'Offer Received': 'green',
    'Rejected': 'red',
    'Withdrawn': 'gray'
  };
  return colors[status] || 'gray';
};

export const sortCompanies = (companies, sortBy = 'createdAt', order = 'desc') => {
  return [...companies].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'applicationDate' || sortBy === 'nextActionDate' || sortBy === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

export const filterCompanies = (companies, filters) => {
  return companies.filter(company => {
    if (filters.status && company.status !== filters.status) {
      return false;
    }
    if (filters.positionType && company.positionType !== filters.positionType) {
      return false;
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        company.companyName.toLowerCase().includes(searchTerm) ||
        (company.positionTitle && company.positionTitle.toLowerCase().includes(searchTerm)) ||
        (company.contactPerson && company.contactPerson.toLowerCase().includes(searchTerm))
      );
    }
    return true;
  });
};