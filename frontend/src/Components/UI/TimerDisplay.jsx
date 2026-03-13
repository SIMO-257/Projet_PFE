import React from 'react';

const TimerDisplay = ({ 
    seconds = 30,
    totalSeconds = 30,
    showLabel = true,
    size = "lg",
    className = ""
}) => {
    const formatTime = (secs) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    const getTextSize = () => {
        switch(size) {
            case 'sm': return 'text-lg';
            case 'md': return 'text-2xl';
            case 'lg': return 'text-3xl';
            default: return 'text-3xl';
        }
    };

    const getTextColor = () => {
        if (seconds <= 10) return 'text-red-500';
        if (seconds <= 20) return 'text-yellow-500';
        return 'text-green-500';
    };

    const progressPercentage = (seconds / totalSeconds) * 100;

    return (
        <div className={`text-center ${className}`}>
            {showLabel && (
                <p className="text-white/60 text-sm font-medium mb-1">TEMPS RESTANT</p>
            )}
            <div className={`${getTextSize()} font-bold ${getTextColor()} mb-2`}>
                {formatTime(seconds)}
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
        </div>
    );
};

export default TimerDisplay;