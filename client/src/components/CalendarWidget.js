import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CalendarWidget = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and then set to ready
    const timer = setTimeout(() => {
      setLoading(false);
      fetchCalendarEvents();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Listen for calendar updates (when events are added/updated)
  useEffect(() => {
    const handleCalendarUpdate = () => {
      fetchCalendarEvents();
    };

    // Listen for custom events or storage changes
    window.addEventListener('calendarUpdate', handleCalendarUpdate);
    
    // Refresh every 30 seconds to catch updates
    const interval = setInterval(fetchCalendarEvents, 30000);
    
    return () => {
      window.removeEventListener('calendarUpdate', handleCalendarUpdate);
      clearInterval(interval);
    };
  }, []);

  const fetchCalendarEvents = async () => {
    try {
      // Try to import the API, but don't break if it fails
      const { calendarAPI } = await import('../utils/api');
      const response = await calendarAPI.getEvents();
      // Filter out rejected applications
      const filteredEvents = (response.data.events || []).filter(event => {
        return event.resource?.status !== 'Rejected';
      });
      setEvents(filteredEvents);
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      // Don't break the component if calendar events fail to load
      setEvents([]);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasEvent = (date) => {
    try {
      return events.some(event => {
        if (!event || !event.start) return false;
        const eventDate = new Date(event.start);
        return eventDate.toDateString() === date.toDateString();
      });
    } catch (error) {
      console.error('Error checking events for date:', error);
      return false;
    }
  };

  const getEventsForDate = (date) => {
    try {
      return events.filter(event => {
        if (!event || !event.start) return false;
        const eventDate = new Date(event.start);
        return eventDate.toDateString() === date.toDateString();
      });
    } catch (error) {
      console.error('Error getting events for date:', error);
      return [];
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const hasEventOnDay = hasEvent(date);

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-8 sm:h-10 w-full text-xs sm:text-sm rounded-md sm:rounded-lg transition-all duration-200 relative flex items-center justify-center ${
            isSelected
              ? 'bg-foreground text-background shadow-md'
              : isToday
              ? 'bg-foreground/10 text-foreground font-semibold border-2 border-foreground/20'
              : 'text-foreground hover:bg-muted/50 border border-transparent hover:border-border'
          }`}
        >
          {day}
          {hasEventOnDay && (
            <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-sm"></div>
          )}
        </button>
      );
    }

    return days;
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="w-full">
      {/* Header with dropdowns - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h3 className="text-lg font-semibold text-foreground">Calendar Overview</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center space-x-2">
            {/* Month Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={currentMonth.getMonth()}
                onChange={(e) => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(parseInt(e.target.value));
                  setCurrentMonth(newMonth);
                }}
                className="appearance-none bg-muted/40 border border-border rounded-lg px-3 sm:px-4 py-2 pr-12 sm:pr-16 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 hover:bg-muted/60 transition-all cursor-pointer w-full"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>
                    {window.innerWidth < 640 ? month.slice(0, 3) : month}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 sm:pr-6 pointer-events-none">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Year Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={currentMonth.getFullYear()}
                onChange={(e) => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setFullYear(parseInt(e.target.value));
                  setCurrentMonth(newMonth);
                }}
                className="appearance-none bg-muted/40 border border-border rounded-lg px-3 sm:px-4 py-2 pr-12 sm:pr-16 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 hover:bg-muted/60 transition-all cursor-pointer w-full"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 sm:pr-6 pointer-events-none">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-muted/60 rounded-lg transition-all duration-200 border border-transparent hover:border-border/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-muted/60 rounded-lg transition-all duration-200 border border-transparent hover:border-border/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid - Landscape Layout */}
      <div className="flex-1">
        {/* Day Headers - Responsive */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-3">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
            <div key={day} className="h-8 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-medium text-muted-foreground bg-muted/30 rounded-lg">
              <span className="hidden sm:block">{day}</span>
              <span className="sm:hidden">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][index]}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar Days - Responsive */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Selected Date Display - Responsive */}
      {selectedDate && (
        <div className="mt-3 sm:mt-4 pt-3 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Selected Date</p>
              <p className="text-base sm:text-lg font-medium text-foreground">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="text-center sm:text-right flex-1">
              <p className="text-sm text-muted-foreground mb-2">Event Details</p>
              {(() => {
                const dayEvents = getEventsForDate(selectedDate);
                if (dayEvents.length === 0) {
                  return <p className="text-lg font-medium text-muted-foreground">No events</p>;
                } else if (dayEvents.length === 1) {
                  const event = dayEvents[0];
                  const eventTime = new Date(event.start).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  });
                  const companyName = event.resource?.companyName || 'Unknown Company';
                  return (
                    <div 
                      className="text-center sm:text-right cursor-pointer hover:bg-muted/20 rounded-lg p-2 transition-colors"
                      onClick={() => {
                        const companyId = event.resource?.companyId;
                        if (companyId) {
                          navigate(`/job/${companyId}`);
                        } else {
                          navigate('/calendar');
                        }
                      }}
                    >
                      <p className="text-lg font-medium text-emerald-600 hover:text-emerald-700">{companyName}</p>
                      <p className="text-sm text-muted-foreground">{eventTime}</p>
                    </div>
                  );
                } else if (dayEvents.length === 2) {
                  return (
                    <div className="space-y-2">
                      {dayEvents.map((event, index) => {
                        const eventTime = new Date(event.start).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        });
                        const companyName = event.resource?.companyName || 'Unknown Company';
                        return (
                          <div 
                            key={index} 
                            className="text-center sm:text-right cursor-pointer hover:bg-muted/20 rounded-lg p-2 transition-colors"
                            onClick={() => {
                              const companyId = event.resource?.companyId;
                              if (companyId) {
                                navigate(`/job/${companyId}`);
                              } else {
                                navigate('/calendar');
                              }
                            }}
                          >
                            <p className="text-sm font-medium text-emerald-600 hover:text-emerald-700">{companyName}</p>
                            <p className="text-xs text-muted-foreground">{eventTime}</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                } else {
                  return (
                    <div className="space-y-2">
                      {dayEvents.slice(0, 2).map((event, index) => {
                        const eventTime = new Date(event.start).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        });
                        const companyName = event.resource?.companyName || 'Unknown Company';
                        return (
                          <div 
                            key={index} 
                            className="text-center sm:text-right cursor-pointer hover:bg-muted/20 rounded-lg p-2 transition-colors"
                            onClick={() => {
                              const companyId = event.resource?.companyId;
                              if (companyId) {
                                navigate(`/job/${companyId}`);
                              } else {
                                navigate('/calendar');
                              }
                            }}
                          >
                            <p className="text-sm font-medium text-emerald-600 hover:text-emerald-700">{companyName}</p>
                            <p className="text-xs text-muted-foreground">{eventTime}</p>
                          </div>
                        );
                      })}
                      <div className="flex justify-center sm:justify-end mt-2">
                        <button
                          onClick={() => navigate('/calendar')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/40 hover:bg-muted/60 border border-border rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View {dayEvents.length - 2} more
                        </button>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;