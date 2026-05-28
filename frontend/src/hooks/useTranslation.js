import { useSelector } from 'react-redux';
import userTranslations from './userTranslations';
import adminTranslations from './adminTranslations';

// Merge both translation sets (admin takes precedence for overlapping keys)
const allTranslations = {};
for (const lang of Object.keys(userTranslations)) {
    allTranslations[lang] = { ...userTranslations[lang], ...adminTranslations[lang] };
}

export const useTranslation = () => {
    const language = useSelector((state) => state.settings?.language || 'fr');
    
    const t = (key, params = {}) => {
        const lang = allTranslations[language] || allTranslations['fr'];
        const value = lang[key] || allTranslations['fr'][key] || key;
        const str = typeof value === 'string' ? value : key;
        
        // Replace {paramName} with actual values from params object
        return str.replace(/\{(\w+)\}/g, (_, param) =>
            params[param] !== undefined ? params[param] : `{${param}}`
        );
    };

    const formatReference = (reference) => {
        if (!reference) return '';
        
        // 1. Check for Stripe recharge reference
        if (reference === 'Rechargement via Stripe') {
            return t('recharge_stripe');
        }
        
        // 2. Check for ticket purchase reference (e.g. "Achat de 1 billet", "Achat de 5 billets")
        const match = reference.match(/^Achat de (\d+) (billets|billet)$/i);
        if (match) {
            const count = parseInt(match[1], 10);
            const label = count > 1 ? t('ticket_label_plural') : t('ticket_label_singular');
            return t('purchase_tickets_count', { count, ticketLabel: label });
        }
        
        return reference;
    };

    return { t, language, formatReference };
};
