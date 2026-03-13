import React from 'react';

const FilterTabs = ({ 
    tabs = ['Tous', 'Reçus', 'Dépenses'],
    activeTab = 'Tous',
    onTabChange
}) => {
    return (
        <div className="flex space-x-3">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeTab === tab
                            ? 'bg-gradient-to-r from-[#D9B991] to-[#C9A961] text-[#400106]'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

export default FilterTabs;