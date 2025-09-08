import React, { useState, useEffect } from 'react';

const CustomTimePicker = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('PM');

  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':');
      const hourNum = parseInt(hour);
      
      if (hourNum === 0) {
        setSelectedHour('12');
        setSelectedPeriod('AM');
      } else if (hourNum < 12) {
        setSelectedHour(hourNum.toString());
        setSelectedPeriod('AM');
      } else if (hourNum === 12) {
        setSelectedHour('12');
        setSelectedPeriod('PM');
      } else {
        setSelectedHour((hourNum - 12).toString());
        setSelectedPeriod('PM');
      }
      
      setSelectedMinute(minute);
    }
  }, [value]);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const periods = ['AM', 'PM'];

  const formatDisplayTime = () => {
    if (!value) return 'Select time';
    const [hour, minute] = value.split(':');
    const hourNum = parseInt(hour);
    
    if (hourNum === 0) {
      return `12:${minute} AM`;
    } else if (hourNum < 12) {
      return `${hourNum}:${minute} AM`;
    } else if (hourNum === 12) {
      return `12:${minute} PM`;
    } else {
      return `${hourNum - 12}:${minute} PM`;
    }
  };

  const handleTimeChange = (hour, minute, period) => {
    let hour24 = parseInt(hour);
    
    if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    } else if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    }
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute}`;
    onChange(timeString);
    setIsOpen(false);
  };

  const popularTimes = [
    { label: '9:00 AM', hour: '9', minute: '00', period: 'AM' },
    { label: '12:00 PM', hour: '12', minute: '00', period: 'PM' },
    { label: '2:00 PM', hour: '2', minute: '00', period: 'PM' },
    { label: '4:00 PM', hour: '4', minute: '00', period: 'PM' }
  ];

  if (disabled) {
    return (
      <div className="relative">
        <div className="w-full px-4 py-3 border border-border rounded-xl bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50">
          <div className="flex items-center justify-center">
            <span className="text-sm">Select date first</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Time Picker Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:border-foreground/40 shadow-sm hover:shadow-md text-left flex items-center justify-between"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {formatDisplayTime()}
        </span>
        <svg 
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Time Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-[9999] bg-background border border-border rounded-xl shadow-xl p-4 w-80 max-w-[calc(100vw-2rem)] animate-in slide-in-from-top-2 duration-200">
          {/* Popular Times */}
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Popular Times</p>
            <div className="grid grid-cols-2 gap-2">
              {popularTimes.map(({ label, hour, minute, period }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleTimeChange(hour, minute, period)}
                  className="px-3 py-2 text-sm font-medium rounded-lg bg-background text-muted-foreground border border-border/50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all duration-200"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selectors */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Custom Time</p>
            
            <div className="flex gap-2">
              {/* Hour Selector */}
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Hour</label>
                <select
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                >
                  {hours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Minute Selector */}
              <div className="flex-1">
                <label className="block text-xs text-muted-foreground mb-1">Minute</label>
                <select
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                >
                  {minutes.filter((_, i) => i % 5 === 0).map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Period Selector */}
              <div className="w-20">
                <label className="block text-xs text-muted-foreground mb-1">Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                >
                  {periods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => handleTimeChange(selectedHour, selectedMinute, selectedPeriod)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Set Time
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close time picker when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CustomTimePicker;