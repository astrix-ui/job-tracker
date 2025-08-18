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
        borderRadius: '0.75rem',
        opacity: 0.95,
        color: 'white',
        border: '0px',
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        fontSize: '0.75rem',
        fontWeight: '500',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
          padding: '0.25rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: event.style?.backgroundColor || '#3b82f6',
          color: 'white',
          borderRadius: '0.75rem',
          fontSize: window.innerWidth < 640 ? '0.625rem' : '0.75rem',
          fontWeight: '500',
          minHeight: '1.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
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
          backgroundColor: hasEvent ? `${eventForDate?.style?.backgroundColor}10` : 'transparent',
          border: hasEvent ? `1px solid ${eventForDate?.style?.backgroundColor}30` : 'none',
          borderRadius: hasEvent ? '6px' : '0'
        }}
      >
        {children}
        {hasEvent && (
          <div
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
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
          backgroundColor: hasEvent ? `${eventForDate?.style?.backgroundColor}15` : 'transparent',
          border: hasEvent ? `1px solid ${eventForDate?.style?.backgroundColor}40` : 'none',
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
      <div className="flex flex-col space-y-4 mb-6">
        {/* Mobile-first layout */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Navigation Controls */}
          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <button
              onClick={() => onNavigate('PREV')}
              className="flex items-center justify-center w-10 h-10 bg-background/50 border border-border/30 text-foreground rounded-xl hover:bg-background hover:border-border/50 transition-all duration-200"
              aria-label="Previous"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => onNavigate('TODAY')}
              className="px-4 py-2 bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-all duration-200 font-medium text-sm"
            >
              Today
            </button>
            <button
              onClick={() => onNavigate('NEXT')}
              className="flex items-center justify-center w-10 h-10 bg-background/50 border border-border/30 text-foreground rounded-xl hover:bg-background hover:border-border/50 transition-all duration-200"
              aria-label="Next"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Month/Year Label */}
          <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center sm:text-left">
            {label}
          </h2>
        </div>
        
        {/* View Toggle Buttons */}
        <div className="flex justify-center sm:justify-end">
          <div className="inline-flex rounded-xl border border-border/30 bg-background/50 p-1">
            {['month', 'week', 'day'].map(viewName => (
              <button
                key={viewName}
                onClick={() => {
                  setView(viewName);
                  onView(viewName);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  view === viewName
                    ? 'bg-foreground text-background shadow-sm'
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-muted-foreground">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Calendar
          </h1>
          <p className="text-muted-foreground">
            Track your interviews and follow-ups
          </p>
        </div>

        {/* Error Message */}
        <ErrorMessage message={error} onClose={() => setError('')} />

        {/* Main Calendar Card */}
        <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          {/* Legend */}
          <div className="p-6 border-b border-border/30">
            <h3 className="text-sm font-semibold text-foreground mb-3">Status Legend</h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(CALENDAR_EVENT_COLORS).map(([status, color]) => (
                <div key={status} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-foreground">{status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="p-6">
            <div style={{ 
              height: view === 'month' ? 'calc(100vh - 500px)' : 'calc(100vh - 450px)',
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
        </div>

        {/* Empty State */}
        {events.length === 0 && !loading && (
          <div className="text-center py-12 mt-8">
            <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm p-8">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No upcoming events
              </h3>
              <p className="text-muted-foreground">
                Schedule interviews and follow-ups by setting "Next Action Date" in your applications.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title="Event Details"
          size="medium"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {selectedEvent.resource.companyName}
              </h3>
              <p className="text-muted-foreground mt-1">
                {selectedEvent.resource.positionTitle && (
                  <span>{selectedEvent.resource.positionTitle} • </span>
                )}
                {selectedEvent.resource.positionType}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Next Action
              </label>
              <p className="text-foreground">
                {selectedEvent.resource.actionTitle || 'Next Action'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Status
              </label>
              <StatusBadge status={selectedEvent.resource.status} />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Next Action Date
              </label>
              <p className="text-foreground bg-muted/50 px-3 py-2 rounded-xl">
                {new Date(selectedEvent.start).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-border/30">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full sm:w-auto px-4 py-2 border border-border/30 rounded-xl text-muted-foreground bg-background/50 hover:bg-background hover:border-border/50 transition-all duration-200"
              >
                Close
              </button>
              <button
                onClick={handleEditEvent}
                className="w-full sm:w-auto px-4 py-2 bg-foreground text-background rounded-xl hover:bg-foreground/90 transition-all duration-200"
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
    </div>
  );
};

export default Calendar;