import React from 'react';

const InfoCard = ({ 
    title = "Informations importantes",
    items = [],
    maxHeight = 128,
    className = ""
}) => {
    return (
        <div className={`bg-white/5 rounded-2xl p-5 border border-white/10 ${className}`}>
            <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                </div>
                <div className="flex-1">
                    <h4 className="text-white font-medium text-sm mb-3">{title}</h4>
                    {items.length > 0 && (
                        <ul 
                            className="space-y-2 text-white/60 text-xs custom-scrollbar pr-2"
                            style={{ maxHeight: `${maxHeight}px` }}
                        >
                            {items.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-yellow-500 mr-2 mt-1 flex-shrink-0">•</span>
                                    <span className="flex-1">{item}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InfoCard;