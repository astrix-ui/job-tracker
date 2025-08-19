import React from 'react';
import { STATUS_COLORS } from '../utils/constants';

const StatusBadge = ({ status, className = '' }) => {
 // Map different status variations to the correct constants
 const normalizeStatus = (status) => {
   if (!status) return 'Applied';
   
   const statusMap = {
     'Offered': 'Offer Received',
     'Offer Received': 'Offer Received',
     'Rejected': 'Rejected',
     'Applied': 'Applied',
     'Interview Scheduled': 'Interview Scheduled',
     'Technical Round': 'Technical Round',
     'HR Round': 'HR Round',
     'Final Round': 'Final Round',
     'Withdrawn': 'Withdrawn',
     'Other': 'Other'
   };
   
   // Return the mapped status if it exists, otherwise return the original status (for custom statuses)
   return statusMap[status] || status;
 };

 const normalizedStatus = normalizeStatus(status);
 // Use 'Other' styling for custom statuses that don't have predefined colors
 const colorClass = STATUS_COLORS[normalizedStatus] || STATUS_COLORS['Other'];

 return (
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
 {normalizedStatus}
 </span>
 );
};

export default StatusBadge;
