import { useSelector } from 'react-redux';
import translations from './translations';

export const useTranslation = () => {
    const language = useSelector((state) => state.settings?.language || 'fr');
    
    const t = (key) => {
        const lang = translations[language] || translations['fr'];
        const value = lang[key] || translations['fr'][key] || key;
        return typeof value === 'string' ? value : key;
    };

    return { t, language };
};
