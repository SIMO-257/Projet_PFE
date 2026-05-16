import React from 'react';

const TicketHistorySkeleton = () => {
    return (
        <div className="bg-[#1a1a1a]/50 rounded-2xl p-4 border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
            <div className="flex items-center space-x-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white/10 flex-shrink-0 animate-pulse" />
                <div className="flex-1">
                    <div className="h-4 w-3/4 bg-white/20 rounded mb-2 animate-pulse" />
                    <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="h-5 w-16 bg-white/20 rounded mb-2 animate-pulse" />
                    <div className="h-3 w-12 bg-white/10 rounded animate-pulse ml-auto" />
                </div>
            </div>
        </div>
    );
};

export default TicketHistorySkeleton;
