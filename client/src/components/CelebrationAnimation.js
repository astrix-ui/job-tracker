import React, { useState, useEffect } from 'react';

const CelebrationAnimation = ({ isVisible, onComplete, companyName }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
    }
  }, [isVisible]);

  const handleDismiss = () => {
    setShow(false);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`z-[9999] transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: '100vw',
        height: '118vh',
        display: 'flex',
        transform: 'translateX(-50%) translateY(-50%)',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: '0px'
      }}
    >
      {/* Solid dark backdrop */}
      <div 
        className={`absolute inset-0 w-full h-full bg-black/95 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Main celebration content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full">
        {/* Simple icon */}
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border border-white/20 mb-8">
          <svg 
            className="w-10 h-10 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            strokeWidth={3}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Simple text */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 text-white">
          Congratulations!
        </h1>

        {/* Company message */}
        <div className="text-center mb-12">
          <p className="text-lg md:text-xl text-gray-300 mb-4">  
            You received an offer from
          </p>
          <p className="text-xl md:text-3xl lg:text-4xl font-semibold text-emerald-400">
            {companyName || 'the company'}
          </p>
        </div>

        {/* Simple button */}
        <button
          onClick={handleDismiss}
          className="px-10 py-3 bg-white/10 border border-white/25 text-white text-lg rounded-full font-medium hover:bg-white/15 transition-colors duration-200"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default CelebrationAnimation;