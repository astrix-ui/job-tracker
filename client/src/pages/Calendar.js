import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { calendarAPI } from '../utils/api';
import { useCompany } from '../context/CompanyContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import CompanyForm from '../components/CompanyForm';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime } from '../utils/helpers';
import { CALENDAR_EVENT_COLORS } from '../utils/constants';
import '../calendar-mobile.css';

const localizer = momentLocalizer(moment);

const Calendar = () => {
 const { getCompanyById, companies } = useCompany();
 const [events, setEvents] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [selectedEvent, setSelectedEvent] = useState(null);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingCompany, setEditingCompany] = useState(null);
 const [view, setView] = useState(() => {
 // Default to day view on very small screens
 return window.innerWidth < 480 ? 'day' : 'month';
 });

 useEffect(() => {
 fetchCalendarEvents();
 }, []);

 // Handle responsive view changes
 useEffect(() => {
 const handleResize = () => {
 const width = window.innerWidth;
 if (width < 480 && view === 'month') {
 setView('day');
 } else if (width >= 768 && view === 'day' && width < 1024) {
 setView('week');
 }
 };

 window.addEventListener('resize', handleResize);
 return () => window.removeEventListener('resize', handleResize);
 }, [view]);

 // Refresh calendar when companies change
 useEffect(() => {
 console.log('Companies changed, refreshing calendar...');
 fetchCalendarEvents();
 }, [companies]);

 // Debug: Log when events change
 useEffect(() => {
 console.log('Events state updated:', events);
 }, [events]);

 const fetchCalendarEvents = async () => {
 try {
 setLoading(true);
 setError('');
 const response = await calendarAPI.getEvents();
 console.log('Calendar events response:', response.data);
 setEvents(response.data.events);
 } catch (error) {
 setError(error.response?.data?.error || 'Failed to fetch calendar events');
 console.error('Fetch calendar events error:', error);
 } finally {
 setLoading(false);
 }
 };

 // Transform events for React Big Calendar
 const calendarEvents = useMemo(() => {
 console.log('Raw events from API:', events);
 
 if (!events || events.length === 0) {
 console.log('No events from server');
 return [];
 }
 
 const transformedEvents = events.map(event => {
 // Handle date parsing more robustly
 const startDate = new Date(event.start);
 const endDate = new Date(event.end);
 
 console.log('Processing event:', {
 title: event.title,
 start: event.start,
 startParsed: startDate,
 end: event.end,
 endParsed: endDate,
 status: event.resource?.status,
 company: event.resource?.companyName
 });
 
 // Ensure valid dates
 if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
 console.error('Invalid date for event:', event);
 return null;
 }
 
 // Create all-day events for next action dates
 const eventStart = new Date(startDate);
 const eventEnd = new Date(startDate);
 eventEnd.setHours(23, 59, 59, 999); // Make it an all-day event
 
 const status = event.resource?.status || 'Applied';
 const backgroundColor = CALENDAR_EVENT_COLORS[status] || '#3b82f6';
 
 return {
 id: event.id,
 title: event.title || `${event.resource?.companyName || 'Unknown Company'}`,
 start: eventStart,
 end: eventEnd,
 allDay: true,
 resource: {
 ...event.resource,
 originalEvent: event
 },
 status: status,
 style: {
 backgroundColor: backgroundColor
 }
 };
 }).filter(Boolean); // Remove null events
 
 console.log('Transformed calendar events:', transformedEvents);
 return transformedEvents;
 }, [events]);

 const handleSelectEvent = (event) => {
 setSelectedEvent(event);
 };

 const handleEditEvent = () => {
 if (selectedEvent) {
 const company = getCompanyById(selectedEvent.resource.companyId);
 setEditingCompany(company);
 setSelectedEvent(null);
 setIsModalOpen(true);
 }
 };

 const handleCloseModal = () => {
 setIsModalOpen(false);
 setEditingCompany(null);
 // Refresh events after editing
 fetchCalendarEvents();
 };

 const eventStyleGetter = (event) => {
 return {
 style: {
 backgroundColor: event.style?.backgroundColor || '#3b82f6',
 borderRadius: '1rem',
 opacity: 0.95,
 color: 'white',
 border: '0px',
 display: 'flex',
 alignItems: 'center',
 padding: '2px 6px',
 fontSize: '0.75rem',
 fontWeight: '500'
 }
 };
 };

 // Custom event component to add status data attribute
 const CustomEvent = ({ event }) => {
 return (
 <div 
 className="rbc-event-custom" 
 data-status={event.status}
 style={{
 position: 'relative',
 height: '100%',
 width: '100%',
 padding: '0.125rem 0.5rem',
 paddingLeft: '0.75rem',
 display: 'flex',
 alignItems: 'center',
 backgroundColor: event.style?.backgroundColor || '#3b82f6',
 color: 'white',
 borderRadius: '0.5rem',
 fontSize: window.innerWidth < 640 ? '0.625rem' : '0.75rem',
 fontWeight: '500',
 minHeight: '1.5rem'
 }}
 >
 <div 
 className="status-dot"
 style={{
 position: 'absolute',
 left: '0.25rem',
 top: '50%',
 transform: 'translateY(-50%)',
 width: window.innerWidth < 640 ? '0.375rem' : '0.5rem',
 height: window.innerWidth < 640 ? '0.375rem' : '0.5rem',
 borderRadius: '50%',
 backgroundColor: 'currentColor',
 opacity: 0.8,
 flexShrink: 0
 }}
 />
 <span 
 className="event-title"
 style={{
 whiteSpace: 'nowrap',
 overflow: 'hidden',
 textOverflow: 'ellipsis',
 flex: 1,
 lineHeight: '1.2'
 }}
 >
 {event.title}
 </span>
 </div>
 );
 };

 // Custom date cell component to highlight dates with events (for week/day views)
 const CustomDateCell = ({ value, children }) => {
 if (!value) {
 return <div>{children}</div>;
 }

 const hasEvent = calendarEvents.some(event => {
 if (!event?.start) return false;
 const eventDate = new Date(event.start);
 return eventDate.toDateString() === value.toDateString();
 });

 const eventForDate = calendarEvents.find(event => {
 if (!event?.start) return false;
 const eventDate = new Date(event.start);
 return eventDate.toDateString() === value.toDateString();
 });

 return (
 <div 
 className="rbc-date-cell"
 style={{
 position: 'relative',
 height: '100%',
 backgroundColor: hasEvent ? `${eventForDate?.style?.backgroundColor}15` : 'transparent',
 border: hasEvent ? `2px solid ${eventForDate?.style?.backgroundColor}40` : 'none',
 borderRadius: hasEvent ? '4px' : '0'
 }}
 >
 {children}
 {hasEvent && (
 <div
 style={{
 position: 'absolute',
 top: '2px',
 right: '2px',
 width: '6px',
 height: '6px',
 borderRadius: '50%',
 backgroundColor: eventForDate?.style?.backgroundColor,
 zIndex: 1
 }}
 />
 )}
 </div>
 );
 };

 // Custom month date cell component to highlight dates with events (for month view)
 const CustomMonthDateCell = ({ value, children, ...props }) => {
 if (!value) {
 return <div className="rbc-date-cell">{children}</div>;
 }

 const hasEvent = calendarEvents.some(event => {
 if (!event?.start) return false;
 const eventDate = new Date(event.start);
 return eventDate.toDateString() === value.toDateString();
 });

 const eventForDate = calendarEvents.find(event => {
 if (!event?.start) return false;
 const eventDate = new Date(event.start);
 return eventDate.toDateString() === value.toDateString();
 });

 return (
 <div 
 className={`rbc-date-cell ${hasEvent ? 'has-event' : ''}`}
 style={{
 position: 'relative',
 height: '100%',
 width: '100%',
 backgroundColor: hasEvent ? `${eventForDate?.style?.backgroundColor}20` : 'transparent',
 border: hasEvent ? `2px solid ${eventForDate?.style?.backgroundColor}60` : 'none',
 borderRadius: hasEvent ? '6px' : '0',
 transition: 'all 0.2s ease'
 }}
 >
 {children}
 {hasEvent && (
 <div
 style={{
 position: 'absolute',
 top: '4px',
 right: '4px',
 width: '8px',
 height: '8px',
 borderRadius: '50%',
 backgroundColor: eventForDate?.style?.backgroundColor,
 zIndex: 10,
 boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
 }}
 title={`${eventForDate?.resource?.companyName} - ${eventForDate?.resource?.actionTitle}`}
 />
 )}
 </div>
 );
 };

 const CustomToolbar = ({ label, onNavigate, onView }) => {
 return (
 <div className="flex flex-col space-y-3 mb-4">
 {/* Mobile-first layout */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
 {/* Navigation Controls */}
 <div className="flex items-center justify-center sm:justify-start space-x-2">
 <button
 onClick={() => onNavigate('PREV')}
 className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
 aria-label="Previous"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
 </svg>
 </button>
 <button
 onClick={() => onNavigate('TODAY')}
 className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
 >
 Today
 </button>
 <button
 onClick={() => onNavigate('NEXT')}
 className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
 aria-label="Next"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </button>
 </div>
 
 {/* Month/Year Label */}
 <h2 className="text-lg sm:text-xl font-semibold text-foreground text-center sm:text-left">
 {label}
 </h2>
 </div>
 
 {/* View Toggle Buttons */}
 <div className="flex justify-center sm:justify-end">
 <div className="inline-flex rounded-lg border border-border bg-muted p-1">
 {['month', 'week', 'day'].map(viewName => (
 <button
 key={viewName}
 onClick={() => {
 setView(viewName);
 onView(viewName);
 }}
 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
 view === viewName
 ? 'bg-background text-foreground shadow-sm'
 : 'text-muted-foreground hover:text-foreground'
 }`}
 >
 {viewName}
 </button>
 ))}
 </div>
 </div>
 </div>
 );
 };

 if (loading) {
 return (
 <div className="flex justify-center items-center min-h-64">
 <LoadingSpinner size="large" />
 </div>
 );
 }

 return (
 <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
 {/* Header */}
 <div className="text-center sm:text-left">
 <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Calendar</h1>
 <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
 View your upcoming interviews and follow-ups
 </p>
 </div>

 {/* Error Message */}
 <ErrorMessage message={error} onClose={() => setError('')} />

 {/* Legend */}
 <div className="bg-card p-3 sm:p-4 rounded-lg shadow border border-border">
 <h3 className="text-sm font-medium text-foreground mb-2 sm:mb-3">Status Legend:</h3>
 <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
 {Object.entries(CALENDAR_EVENT_COLORS).map(([status, color]) => (
 <div key={status} className="flex items-center space-x-2">
 <div 
 className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
 style={{ backgroundColor: color }}
 />
 <span className="text-xs sm:text-sm text-foreground truncate">{status}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Calendar */}
 <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
 <div className="p-2 sm:p-4" style={{ 
 height: view === 'month' ? 'calc(100vh - 400px)' : 'calc(100vh - 350px)',
 minHeight: view === 'month' ? '500px' : '400px',
 maxHeight: view === 'month' ? '700px' : '600px'
 }}>
 <BigCalendar
 localizer={localizer}
 events={calendarEvents}
 startAccessor="start"
 endAccessor="end"
 onSelectEvent={handleSelectEvent}
 eventPropGetter={eventStyleGetter}
 view={view}
 onView={setView}
 components={{
 toolbar: CustomToolbar,
 event: CustomEvent,
 dateCellWrapper: CustomDateCell,
 month: {
 dateCellWrapper: CustomMonthDateCell
 }
 }}
 popup
 popupOffset={30}
 formats={{
 timeGutterFormat: 'HH:mm',
 eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
 localizer.format(start, 'HH:mm', culture) + ' - ' + localizer.format(end, 'HH:mm', culture),
 agendaTimeFormat: 'HH:mm',
 agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
 localizer.format(start, 'HH:mm', culture) + ' - ' + localizer.format(end, 'HH:mm', culture),
 }}
 step={60}
 timeslots={1}
 min={new Date(2024, 0, 1, 8, 0, 0)}
 max={new Date(2024, 0, 1, 20, 0, 0)}
 onNavigate={(date) => {
   console.log('Navigated to:', date);
   console.log('Events for this period:', calendarEvents.filter(event => {
     const eventDate = new Date(event.start);
     const navDate = new Date(date);
     return eventDate.getMonth() === navDate.getMonth() && eventDate.getFullYear() === navDate.getFullYear();
   }));
 }}
 />
 </div>
 </div>

 {/* Event Details Modal */}
 {selectedEvent && (
 <Modal
 isOpen={!!selectedEvent}
 onClose={() => setSelectedEvent(null)}
 title="Event Details"
 size="medium"
 >
 <div className="space-y-4 sm:space-y-6">
 <div>
 <h3 className="text-lg sm:text-xl font-semibold text-foreground">
 {selectedEvent.resource.companyName}
 </h3>
 <p className="text-sm sm:text-base text-muted-foreground mt-1">
 {selectedEvent.resource.positionTitle && (
 <span>{selectedEvent.resource.positionTitle} • </span>
 )}
 {selectedEvent.resource.positionType}
 </p>
 </div>

 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-2">
 Next Action
 </label>
 <p className="text-sm sm:text-base text-foreground font-medium">
 {selectedEvent.resource.actionTitle || 'Next Action'}
 </p>
 </div>
 
 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-2">
 Status
 </label>
 <StatusBadge status={selectedEvent.resource.status} />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-muted-foreground mb-2">
 Next Action Date
 </label>
 <p className="text-sm sm:text-base text-foreground bg-muted px-3 py-2 rounded-md">
 {new Date(selectedEvent.start).toLocaleDateString('en-US', {
 weekday: 'long',
 year: 'numeric',
 month: 'long',
 day: 'numeric'
 })}
 </p>
 </div>
 
 <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-border">
 <button
 onClick={() => setSelectedEvent(null)}
 className="w-full sm:w-auto px-4 py-2 border border-border rounded-md text-muted-foreground bg-background hover:bg-muted transition-colors"
 >
 Close
 </button>
 <button
 onClick={handleEditEvent}
 className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
 >
 Edit Application
 </button>
 </div>
 </div>
 </Modal>
 )}

 {/* Edit Company Modal */}
 <Modal
 isOpen={isModalOpen}
 onClose={handleCloseModal}
 title="Edit Application"
 size="large"
 >
 <CompanyForm
 company={editingCompany}
 onClose={handleCloseModal}
 />
 </Modal>

 {/* Empty State */}
 {events.length === 0 && !loading && (
 <div className="text-center py-12">
 <div className="text-muted-foreground text-6xl mb-4">📅</div>
 <h3 className="text-lg font-medium bg-card text-card-foreground mb-2">
 No upcoming events
 </h3>
 <p className="text-muted-foreground">
 Schedule interviews and follow-ups by setting "Next Action Date" in your applications.
 </p>
 </div>
 )}
 </div>
 );
};

export default Calendar;
