import React, { useState } from 'react';

const FAQItem = ({ 
  id,
  question,
  answer,
  isExpanded = false,
  onToggle,
  helpfulFeedback = {},
  onFeedback,
  className = ""
}) => {
  const [userFeedback, setUserFeedback] = useState(helpfulFeedback[id]);

  const handleFeedback = (isHelpful) => {
    setUserFeedback(isHelpful);
    if (onFeedback) onFeedback(id, isHelpful);
  };

  return (
    <div className={`bg-black/30 rounded-2xl border border-white/10 overflow-hidden ${className}`}>
      <button
        onClick={() => onToggle(id)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-all"
      >
        <span className="text-white text-sm font-medium text-left flex-1 pr-2">{question}</span>
        <svg 
          className={`w-5 h-5 text-white/60 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-l-4 border-yellow-500">
          <p className="text-white/70 text-sm mb-3">{answer}</p>
          <div className="flex items-center space-x-2">
            <span className="text-white/50 text-xs">Cela a-t-il été utile ?</span>
            <button
              onClick={() => handleFeedback(true)}
              className={`p-1 rounded ${userFeedback === true ? 'bg-green-500/20' : 'hover:bg-white/10'}`}
            >
              <svg className={`w-4 h-4 ${userFeedback === true ? 'text-green-400' : 'text-white/60'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
              </svg>
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className={`p-1 rounded ${userFeedback === false ? 'bg-red-500/20' : 'hover:bg-white/10'}`}
            >
              <svg className={`w-4 h-4 ${userFeedback === false ? 'text-red-400' : 'text-white/60'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQItem;