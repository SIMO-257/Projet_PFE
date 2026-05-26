import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const FilterTabs = ({ 
    tabs,
    activeTab,
    onTabChange
}) => {
    const { t } = useTranslation();
    const resolvedTabs = tabs || [t('filter_all_default'), t('filter_received'), t('filter_expenses')];
    const resolvedActiveTab = activeTab || t('filter_all_default');
    return (
        <div className="flex space-x-3">
            {resolvedTabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        resolvedActiveTab === tab
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