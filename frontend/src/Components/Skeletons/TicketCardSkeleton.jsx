import React from 'react';

const TicketCardSkeleton = () => {
    return (
        <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-4 p-5 flex flex-col min-h-[140px]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center space-x-3">
                    <div className="w-6 h-4 bg-white/20 rounded animate-pulse" />
                    <div>
                        <div className="h-5 w-40 bg-white/20 rounded mb-2 animate-pulse" />
                        <div className="h-3 w-48 bg-white/10 rounded animate-pulse" />
                    </div>
                </div>
                <div className="w-16 h-6 rounded-full bg-white/20 animate-pulse" />
            </div>

            <div className="flex justify-between items-end mt-auto relative z-10">
                <div>
                   <div className="h-3 w-10 bg-white/10 rounded mb-1 animate-pulse" />
                   <div className="h-6 w-24 bg-white/20 rounded animate-pulse" />
                </div>
                <div className="text-right">
                   <div className="h-3 w-20 bg-white/10 rounded mb-1 animate-pulse" />
                   <div className="h-4 w-28 bg-white/20 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export default TicketCardSkeleton;
