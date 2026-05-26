import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const SavedCardItem = ({ 
    type,
    number = '**** 0000',
    status,
    expiry,
    isSelected = false,
    onClick,
    isDefault = false
}) => {
    return (
        <div 
            onClick={onClick}
            className={`rounded-xl p-3 cursor-pointer transition-all ${
                isSelected 
                    ? 'bg-white/10 border border-yellow-500/30' 
                    : 'bg-white/5 border border-white/5 hover:bg-white/8'
            }`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">{type || t('card_visa_default')} {number}</span>
                {isDefault && status && (
                    <span className="text-green-400 text-xs bg-green-500/20 px-2 py-0.5 rounded">
                        {status}
                    </span>
                )}
            </div>
            {expiry && (
                <p className="text-white/50 text-xs">{t('expires_on')} {expiry}</p>
            )}
        </div>
    );
};

export default SavedCardItem;