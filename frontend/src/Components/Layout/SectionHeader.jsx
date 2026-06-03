import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const SectionHeader = ({ 
    title = "Section Title", 
    buttonText: btnProp,
    onButtonClick 
}) => {
    const { t } = useTranslation();
    const buttonText = btnProp || t('section_action_default');
    return (
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-base font-light">{title}</h3>
            {buttonText && onButtonClick && (
                <button 
                    onClick={onButtonClick}
                    className="text-yellow-500 text-sm hover:text-yellow-400 transition-colors"
                >
                    {buttonText}
                </button>
            )}
        </div>
    );
};

export default SectionHeader;