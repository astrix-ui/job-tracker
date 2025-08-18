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
      
      // Use the actual time if available, otherwise make it all-day
      const eventStart = new Date(startDate);
      const eventEnd = new Date(endDate);
      
      // Check if it's a specific time or all-day event
      const isAllDay = eventStart.getHours() === 0 && eventStart.getMinutes() === 0;
      if (isAllDay) {
        eventEnd.setHours(23, 59, 59, 999); // Make it an all-day event
      }
      
      const status = event.resource?.status || 'Applied';
      const backgroundColor = CALENDAR_EVENT_COLORS[status] || '#3b82f6';
      
      return {
        id: event.id,
        title: event.title || `${event.resource?.companyName || 'Unknown Company'}`,
        start: eventStart,
        end: eventEnd,
        allDay: isAllDay,
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
    const baseColor = event.style?.backgroundColor || 'hsl(var(--foreground))';
    return {
      style: {
        backgroundColor: baseColor,
        borderRadius: '10px',
        opacity: 1,
        color: 'white',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        fontSize: '0.75rem',
        fontWeight: '600',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minHeight: '32px'
      }
    };
  };

  // Custom event component to add status data attribute
  const CustomEvent = ({ event }) => {
    return (
      <div 
        className="rbc-event-custom group" 
        data-status={event.status}
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: event.style?.backgroundColor || 'hsl(var(--foreground))',
          color: 'white',
          borderRadius: '10px',
          fontSize: window.innerWidth < 640 ? '0.625rem' : '0.75rem',
          fontWeight: '600',
          minHeight: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: 'none'
        }}
      >
        <div 
          className="status-indicator"
          style={{
            position: 'absolute',
            left: '6px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '18px',
            borderRadius: '2px',
            backgroundColor: 'rgba(255,255,255,0.9)',
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
            lineHeight: '1.3',
            marginLeft: '12px'
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
          backgroundColor: hasEvent ? `${eventForDate?.style?.backgroundColor}08` : 'transparent',
          border: hasEvent ? `2px solid ${eventForDate?.style?.backgroundColor}20` : 'none',
          borderRadius: hasEvent ? '8px' : '0',
          transition: 'all 0.2s ease'
        }}
      >
        {children}
        {hasEvent && (
          <div
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: eventForDate?.style?.backgroundColor,
              zIndex: 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
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

    const isToday = value.toDateString() === new Date().toDateString();

    return (
      <div 
        className={`rbc-date-cell ${hasEvent ? 'has-event' : ''} ${isToday ? 'is-today' : ''}`}
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          backgroundColor: hasEvent ? `${eventForDate?.style?.backgroundColor}08` : 'transparent',
          border: hasEvent ? `2px solid ${eventForDate?.style?.backgroundColor}25` : 'none',
          borderRadius: hasEvent ? '8px' : '0',
          transition: 'all 0.2s ease'
        }}
      >
        {children}
        {hasEvent && (
          <div
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: eventForDate?.style?.backgroundColor,
              zIndex: 10,
              boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
              border: '2px solid white'
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
            <h3 className="text-sm font-semibold text-foreground mb-4">Status Legend</h3>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4">
              {Object.entries(CALENDAR_EVENT_COLORS).map(([status, color]) => (
                <div key={status} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm border-2 border-white"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-foreground">{status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="p-8">
            <style jsx>{`
              .rbc-calendar {
                font-family: inherit;
                border-radius: 16px;
                overflow: hidden;
                border: 1px solid hsl(var(--border) / 0.3);
                background: hsl(var(--background));
              }
              .rbc-header {
                background: hsl(var(--background) / 0.8);
                border-bottom: 1px solid hsl(var(--border) / 0.3);
                padding: 16px 12px;
                font-weight: 600;
                font-size: 0.875rem;
                color: hsl(var(--foreground));
                text-align: center;
                margin: 0 2px;
                border-radius: 8px 8px 0 0;
              }
              .rbc-header + .rbc-header {
                border-left: 1px solid hsl(var(--border) / 0.2);
              }
              .rbc-month-view, .rbc-time-view {
                border: none;
                background: hsl(var(--background));
                margin: 4px;
                border-radius: 12px;
                overflow: hidden;
              }
              .rbc-month-row {
                border: none;
                margin: 2px 0;
              }
              .rbc-date-cell {
                padding: 12px;
                border-right: 1px solid hsl(var(--border) / 0.15);
                border-bottom: 1px solid hsl(var(--border) / 0.15);
                min-height: 90px;
                transition: all 0.2s ease;
                margin: 1px;
                border-radius: 6px;
                background: hsl(var(--background));
                color: hsl(var(--foreground));
              }
              .rbc-date-cell:hover {
                background: hsl(var(--muted) / 0.4);
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .rbc-date-cell.rbc-off-range {
                background: hsl(var(--muted) / 0.2);
                color: hsl(var(--muted-foreground));
                opacity: 0.6;
              }
              .rbc-date-cell.rbc-today {
                background: hsl(var(--foreground) / 0.05);
                border: 2px solid hsl(var(--foreground) / 0.2);
                border-radius: 8px;
                font-weight: 600;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .rbc-date-cell.rbc-selected {
                background: hsl(var(--foreground) / 0.1);
                border: 2px solid hsl(var(--foreground) / 0.3);
              }
              .rbc-day-bg {
                border-right: 1px solid hsl(var(--border) / 0.15);
                border-bottom: 1px solid hsl(var(--border) / 0.15);
                margin: 1px;
                border-radius: 6px;
                background: hsl(var(--background));
              }
              .rbc-day-bg.rbc-today {
                background: hsl(var(--foreground) / 0.03);
                border: 1px solid hsl(var(--foreground) / 0.1);
              }
              .rbc-day-bg.rbc-off-range-bg {
                background: hsl(var(--muted) / 0.1);
              }
              .rbc-event {
                border: none !important;
                border-radius: 10px !important;
                padding: 6px 10px !important;
                margin: 3px 6px !important;
                font-weight: 600 !important;
                font-size: 0.75rem !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
                transition: all 0.2s ease !important;
                cursor: pointer !important;
              }
              .rbc-event:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
                scale: 1.02 !important;
              }
              .rbc-event-label {
                display: none;
              }
              .rbc-show-more {
                background: hsl(var(--muted) / 0.8);
                color: hsl(var(--foreground));
                border-radius: 8px;
                padding: 4px 8px;
                font-size: 0.75rem;
                font-weight: 600;
                border: 1px solid hsl(var(--border) / 0.3);
                margin: 3px 6px;
                transition: all 0.2s ease;
              }
              .rbc-show-more:hover {
                background: hsl(var(--muted));
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .rbc-toolbar {
                display: none;
              }
              .rbc-time-header {
                border-bottom: 1px solid hsl(var(--border) / 0.3);
                background: hsl(var(--background) / 0.8);
                margin: 0 2px;
                border-radius: 8px 8px 0 0;
                padding: 12px 8px;
                font-weight: 600;
                font-size: 0.875rem;
                color: hsl(var(--foreground));
                text-align: center;
              }
              .rbc-time-header .rbc-header {
                border: none;
                padding: 8px 4px;
                margin: 0 1px;
                border-radius: 6px;
                background: hsl(var(--background));
                font-weight: 600;
                font-size: 0.875rem;
                color: hsl(var(--foreground));
                min-height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .rbc-time-content {
                border-top: none;
                margin: 0 4px;
                border-radius: 0 0 12px 12px;
                overflow: hidden;
              }
              .rbc-time-slot {
                border-top: 1px solid hsl(var(--border) / 0.1);
                color: hsl(var(--foreground));
                min-height: 30px;
                height: auto;
                padding: 4px 8px;
              }
              .rbc-timeslot-group {
                border-bottom: 1px solid hsl(var(--border) / 0.2);
                background: hsl(var(--background));
                min-height: 60px;
                height: auto;
              }
              .rbc-time-gutter {
                background: hsl(var(--background) / 0.8);
                border-right: 1px solid hsl(var(--border) / 0.3);
                color: hsl(var(--muted-foreground));
                font-weight: 500;
                width: 80px;
                min-width: 80px;
              }
              .rbc-time-gutter .rbc-timeslot-group {
                border-bottom: 1px solid hsl(var(--border) / 0.15);
                min-height: 60px;
              }
              .rbc-time-gutter .rbc-time-slot {
                padding: 8px 12px;
                text-align: right;
                font-size: 0.75rem;
                color: hsl(var(--muted-foreground));
              }
              .rbc-day-slot {
                min-height: 700px;
              }
              .rbc-time-column {
                min-width: 150px;
                border-right: 1px solid hsl(var(--border) / 0.2);
                min-height: 700px;
                flex: 1;
              }
              @media (max-width: 640px) {
                .rbc-time-column {
                  min-width: calc(100vw - 80px) !important;
                  flex: 1 !important;
                }
                .rbc-time-view {
                  width: 100% !important;
                }
                .rbc-time-header .rbc-header {
                  flex: 1 !important;
                  min-width: calc(100vw - 80px) !important;
                }
              }
              .rbc-day-slot .rbc-time-slot {
                border-right: 1px solid hsl(var(--border) / 0.1);
              }
              .rbc-current-time-indicator {
                background-color: hsl(var(--foreground));
                height: 3px;
                border-radius: 2px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              }
              .rbc-agenda-view {
                border: 1px solid hsl(var(--border) / 0.3);
                border-radius: 12px;
                margin: 4px;
                overflow: hidden;
                background: hsl(var(--background));
              }
              .rbc-agenda-view table {
                border: none;
              }
              .rbc-agenda-view .rbc-agenda-date-cell,
              .rbc-agenda-view .rbc-agenda-time-cell,
              .rbc-agenda-view .rbc-agenda-event-cell {
                border-bottom: 1px solid hsl(var(--border) / 0.15);
                padding: 16px;
                color: hsl(var(--foreground));
              }
              .rbc-agenda-view .rbc-agenda-date-cell {
                background: hsl(var(--background) / 0.8);
                font-weight: 600;
              }
              .rbc-agenda-view .rbc-agenda-time-cell {
                color: hsl(var(--muted-foreground));
                font-weight: 500;
              }
              /* Date number styling */
              .rbc-date-cell > a,
              .rbc-date-cell > span {
                color: hsl(var(--foreground)) !important;
                font-weight: 600 !important;
                font-size: 0.875rem !important;
              }
              .rbc-date-cell.rbc-off-range > a,
              .rbc-date-cell.rbc-off-range > span {
                color: hsl(var(--muted-foreground)) !important;
                opacity: 0.6 !important;
              }
              .rbc-date-cell.rbc-today > a,
              .rbc-date-cell.rbc-today > span {
                color: hsl(var(--foreground)) !important;
                font-weight: 700 !important;
              }
            `}</style>
            <div style={{ 
              height: view === 'month' ? 'calc(100vh - 500px)' : 'calc(100vh - 350px)',
              minHeight: view === 'month' ? '500px' : '700px',
              maxHeight: view === 'month' ? '800px' : '900px',
              overflow: view !== 'month' ? 'hidden' : 'visible'
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
                min={new Date(2024, 0, 1, 0, 0, 0)}
                max={new Date(2024, 0, 1, 23, 59, 59)}
                scrollToTime={new Date(2024, 0, 1, 8, 0, 0)}
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