import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
  LinkAuthenticationElement,
  ExpressCheckoutElement,
} from '@stripe/react-stripe-js';

import * as notificationService from '../../services/notificationService';
import { confirmRecharge } from '../../services/walletService';

const StripeCheckoutForm = ({ amount, clientSecret, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const extractPaymentIntentId = (secret) => {
    if (!secret || typeof secret !== 'string') return null;
    const marker = '_secret_';
    const idx = secret.indexOf(marker);
    if (idx === -1) return null;
    return secret.slice(0, idx);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!stripe || !elements) {
      console.error('[Stripe] Stripe.js or Elements not loaded.');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error('[Stripe] Submit error:', submitError);
        setMessage(submitError.message);
        setIsLoading(false);
        return;
      }

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-confirmation`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        console.error('[Stripe] Confirm error:', result.error);
        const errorMsg = result.error.message || 'Une erreur est survenue.';

        notificationService
          .logFailure({
            type: 'payment',
            title: 'Echec de paiement',
            body: `La transaction de ${amount} DH a echoue : ${errorMsg}`,
            meta: { error: errorMsg, amount },
          })
          .catch((logErr) => {
            console.error('Failed to log notification:', logErr);
          });

        if (result.error.type === 'card_error' || result.error.type === 'validation_error') {
          setMessage(errorMsg);
        } else {
          setMessage('Une erreur est survenue lors de la validation du paiement.');
        }
      } else {
        console.log('[Stripe] Payment successful:', result.paymentIntent);

        const paymentIntentId = result.paymentIntent?.id || extractPaymentIntentId(clientSecret);
        if (!paymentIntentId) {
          setMessage('Paiement confirme, mais identifiant de transaction introuvable.');
          setIsLoading(false);
          return;
        }

        try {
          await confirmRecharge({ paymentIntentId });
          onSuccess(paymentIntentId);
        } catch (confirmErr) {
          setMessage(
            confirmErr?.response?.data?.message ||
              "Paiement reussi, mais l'enregistrement du rechargement a echoue."
          );
        }
      }
    } catch (err) {
      console.error('[Stripe] Unexpected error:', err);
      setMessage('Une erreur inatendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const paymentElementOptions = {
    layout: 'tabs',
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-8">
        <h3 className="text-white/40 text-[10px] uppercase font-bold mb-4 tracking-widest">Paiement Rapide</h3>
        <ExpressCheckoutElement onConfirm={handleSubmit} />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-transparent text-white/30 text-xs uppercase font-medium">Ou payer par carte</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-white/40 text-[10px] uppercase font-bold mb-2 block">Contact</label>
        <LinkAuthenticationElement id="link-authentication-element" onChange={(e) => setEmail(e.value.email)} />
      </div>

      <div className="space-y-2">
        <label className="text-white/40 text-[10px] uppercase font-bold mb-2 block">Details de paiement</label>
        <PaymentElement id="payment-element" options={paymentElementOptions} />
      </div>

      <div className="space-y-2">
        <label className="text-white/40 text-[10px] uppercase font-bold mb-2 block">Adresse de facturation</label>
        <AddressElement options={{ mode: 'billing' }} />
      </div>

      {message && (
        <div id="payment-message" className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-pulse">
          {message}
        </div>
      )}

      <div className="flex flex-col space-y-4 pt-4">
        <button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          className={`w-full py-4 rounded-2xl font-bold shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2 ${
            isLoading
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Securisation...</span>
            </div>
          ) : (
            <span>Payer {amount} DH</span>
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full py-2 text-white/40 text-xs font-medium hover:text-white/60 transition-colors"
        >
          Annuler
        </button>
      </div>

      <div className="flex items-center justify-center space-x-4 pt-4 opacity-40">
        <div className="flex items-center text-[10px] text-white">
          <span className="mr-1">Lock</span> SSL
        </div>
        <div className="flex items-center text-[10px] text-white">
          <span className="mr-1">Shield</span> PCI
        </div>
        <div className="flex items-center text-[10px] text-white">
          <span className="mr-1">Card</span> Stripe
        </div>
      </div>
    </form>
  );
};

export default StripeCheckoutForm;
