import React from 'react';

const ActionButtonCard = ({ icon, label, onClick, className = "" }) => {
    return (
        <button 
            onClick={onClick}
            className={`bg-[#2a2a2a] rounded-2xl p-4 flex flex-col items-center justify-center space-y-2 hover:bg-[#333333] transition-colors ${className}`}
        >
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                {icon}
            </div>
            <span className="text-white text-xs font-medium">{label}</span>
        </button>
    );
};

export default ActionButtonCard;