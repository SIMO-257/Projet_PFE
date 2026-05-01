import React, { useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { initRecharge, confirmRecharge } from '../../services/clientService';
import ActionButtonCard from '../../Components/Cards/ActionButtonCard';
import CheckboxInput from "../../Components/Inputs/CheckboxInput";

const CheckoutForm = ({ amount, onSuccess, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [savePayment, setSavePayment] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { data } = await initRecharge({ amount: parseFloat(amount) });
      const { clientSecret, paymentIntentId } = data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          await confirmRecharge({ paymentIntentId });
          onSuccess();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors du paiement.');
      setProcessing(false);
    }
  };

  const elementOptions = {
    style: {
      base: {
        color: '#ffffff',
        fontFamily: '"Inter", sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        '::placeholder': { color: '#64748b' },
      },
      invalid: { color: '#ef4444', iconColor: '#ef4444' },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transaction Summary */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/60">Service</span>
          <span className="text-white font-medium">Rechargement Portefeuille</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/60">Montant HT</span>
          <span className="text-white">{(parseFloat(amount) / 1.2).toFixed(2)} DH</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/60">TVA (20%)</span>
          <span className="text-white">{(parseFloat(amount) - (parseFloat(amount) / 1.2)).toFixed(2)} DH</span>
        </div>
        <div className="pt-2 border-t border-white/5 flex justify-between items-center">
          <span className="text-white font-bold">Total à payer</span>
          <span className="text-yellow-500 font-bold text-lg">{amount} DH</span>
        </div>
      </div>

      {/* Card Details Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-white text-xs font-bold uppercase tracking-wider">Informations de paiement</h3>
          <div className="flex space-x-1">
             <div className="h-4 w-6 bg-white/10 rounded flex items-center justify-center text-[8px] text-white/50">VISA</div>
             <div className="h-4 w-6 bg-white/10 rounded flex items-center justify-center text-[8px] text-white/50">MC</div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <label className="text-white/40 text-[10px] uppercase font-bold mb-2 block">Numéro de carte</label>
            <CardNumberElement options={elementOptions} />
          </div>
          <div className="grid grid-cols-2">
            <div className="p-4 border-r border-white/10">
              <label className="text-white/40 text-[10px] uppercase font-bold mb-2 block">Date d'expiration</label>
              <CardExpiryElement options={elementOptions} />
            </div>
            <div className="p-4">
              <label className="text-white/40 text-[10px] uppercase font-bold mb-2 block">CVC / CVV</label>
              <CardCvcElement options={elementOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Security Flags */}
      <div className="flex items-center justify-between bg-green-500/5 border border-green-500/20 rounded-xl p-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <div>
            <p className="text-white text-[11px] font-bold">Paiement 100% Sécurisé</p>
            <p className="text-white/40 text-[9px]">Cryptage SSL 256 bits par Stripe</p>
          </div>
        </div>
        <div className="text-[10px] text-green-500 font-bold border border-green-500/30 px-2 py-1 rounded">
          PCI COMPLIANT
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-xs bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-pulse">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3 pt-2">
        <button
          onClick={handleSubmit}
          disabled={!stripe || processing}
          className={`w-full py-4 rounded-2xl font-bold shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2 ${
            processing 
            ? 'bg-white/20 text-white/50 cursor-not-allowed' 
            : 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {processing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Traitement...</span>
            </>
          ) : (
            <span>Confirmer et Payer {amount} DH</span>
          )}
        </button>
        
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="w-full py-3 rounded-xl text-white/40 text-xs font-medium hover:text-white/60 transition-colors"
        >
          Annuler et modifier le montant
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
