import React from 'react';

const BalanceCardSkeleton = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl w-full h-[180px] bg-white/5 border border-white/10 p-6 flex flex-col justify-between">
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent animate-pulse" />
      
      <div>
        <div className="h-3 w-24 bg-white/20 rounded mb-2 animate-pulse" />
        <div className="h-8 w-40 bg-white/20 rounded animate-pulse" />
      </div>

      <div className="flex justify-between items-end relative z-10">
        <div>
          <div className="h-3 w-32 bg-white/20 rounded mb-1 animate-pulse" />
          <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="h-10 w-12 bg-white/20 rounded-lg animate-pulse" />
      </div>
    </div>
  );
};

export default BalanceCardSkeleton;
