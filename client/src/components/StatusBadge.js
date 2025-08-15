import React from 'react';
import { STATUS_COLORS } from '../utils/constants';

const StatusBadge = ({ status, className = '' }) => {
 const colorClass = STATUS_COLORS[status] || STATUS_COLORS['Applied'];

 return (
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
 {status}
 </span>
 );
};

export default StatusBadge;
