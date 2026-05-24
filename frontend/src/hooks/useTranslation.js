import { useSelector } from 'react-redux';
import translations from './translations';

export const useTranslation = () => {
    const language = useSelector((state) => state.settings?.language || 'fr');
    
    const t = (key, params = {}) => {
        const lang = translations[language] || translations['fr'];
        const value = lang[key] || translations['fr'][key] || key;
        const str = typeof value === 'string' ? value : key;
        
        // Replace {paramName} with actual values from params object
        return str.replace(/\{(\w+)\}/g, (_, param) =>
            params[param] !== undefined ? params[param] : `{${param}}`
        );
    };

    return { t, language };
};
