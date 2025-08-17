import React, { useState, useEffect } from 'react';

const Toast = ({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose, 
  showConfirm = false, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCancelOption = false,
  onCancelRequest
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!showConfirm && !showCancelOption) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, showConfirm, showCancelOption]);

  const getToastStyles = () => {
    const baseStyles = "fixed top-20 right-4 z-50 px-4 py-3 rounded-md shadow-lg transition-all duration-300 transform border";
    
    if (!isVisible) {
      return `${baseStyles} opacity-0 translate-x-full`;
    }

    // Monochrome styling for all toast types
    return `${baseStyles} bg-card text-card-foreground border-border`;
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 mr-2 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 mr-2 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 mr-2 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 mr-2 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      setIsProcessing(true);
      try {
        await onConfirm();
      } finally {
        setIsProcessing(false);
        setIsVisible(false);
        setTimeout(onClose, 300);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleCancelRequest = async () => {
    if (onCancelRequest) {
      setIsProcessing(true);
      try {
        await onCancelRequest();
      } finally {
        setIsProcessing(false);
        setIsVisible(false);
        setTimeout(onClose, 300);
      }
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        {getIcon()}
        <div className="flex-1">
          <span className="text-sm font-medium">{message}</span>
          
          {/* Confirmation buttons */}
          {showConfirm && (
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : confirmText}
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="px-3 py-1 bg-muted text-muted-foreground rounded text-xs hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
            </div>
          )}

          {/* Cancel request option */}
          {showCancelOption && (
            <div className="mt-3">
              <button
                onClick={handleCancelRequest}
                disabled={isProcessing}
                className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-xs hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Cancelling...' : 'Cancel Request'}
              </button>
            </div>
          )}
        </div>
        
        {/* Close button */}
        {!showConfirm && !showCancelOption && (
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="ml-3 text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;