import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const PurchasedCardItem = ({ card, onSelect, isSubmitting }) => {
  const { t } = useTranslation();
  const isDisabled = isSubmitting;

  return (
    <div className={`rounded-2xl border p-4 ${card.is_default ? 'border-yellow-500/40 bg-yellow-500/10' : 'border-white/10 bg-black/40'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-white font-semibold text-sm">{card.ticket_type?.name || t('ticket_name_default')}</p>
          <p className="text-white/60 text-xs mt-1">Code: {card.uuid?.slice(0, 8)?.toUpperCase()}</p>
          <p className="text-white/50 text-xs mt-1">
            {card.valid_until ? `${t('expires_on')} ${new Date(card.valid_until).toLocaleDateString('fr-FR')}` : t('no_expiration')}
          </p>
        </div>
        {card.is_default ? (
          <span className="text-[10px] uppercase tracking-wide bg-yellow-500 text-[#2a0b0f] px-2 py-1 rounded-full font-bold">{t('card_default_badge')}</span>
        ) : card.status === 'expired' ? (
          <span className="text-[10px] uppercase tracking-wide bg-red-500/20 text-red-300 px-2 py-1 rounded-full font-bold">{t('card_expired_badge')}</span>
        ) : null}
      </div>

      {!card.is_default && (
        <button
          type="button"
          onClick={() => onSelect(card.id)}
          disabled={isDisabled}
          className={`mt-4 w-full rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition ${
            isDisabled
              ? 'bg-white/10 text-white/40 cursor-not-allowed'
              : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
          }`}
        >
          {t('set_as_default')}
        </button>
      )}
    </div>
  );
};

export default PurchasedCardItem;

