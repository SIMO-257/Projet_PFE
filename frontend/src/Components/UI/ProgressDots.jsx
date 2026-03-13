import React from 'react';

const ProgressDots = ({ 
    totalSteps = 3,
    currentStep = 1,
    activeColor = '#D4AF37',
    inactiveColor = 'rgba(255, 255, 255, 0.3)',
    className = ""
}) => {
    return (
        <div className={`flex items-center justify-center space-x-2 pb-4 ${className}`}>
            {Array.from({ length: totalSteps }).map((_, index) => (
                <div 
                    key={index}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                        backgroundColor: index < currentStep ? activeColor : inactiveColor,
                        transform: index < currentStep ? 'scale(1.2)' : 'scale(1)'
                    }}
                />
            ))}
        </div>
    );
};

export default ProgressDots;