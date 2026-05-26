import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useTranslation } from "../../hooks/useTranslation";
import { createPaymentIntent, cancelPaymentIntent } from "../../services/walletService";

// Layout Components
import Header from "../../Components/Layout/Header";
import ProgressDots from "../../Components/UI/ProgressDots";

// UI Components
import ValidationCard from "../../Components/Cards/ValidationCard";
import AmountDisplay from "../../Components/Cards/AmountDisplay";
import StripeCheckoutForm from "../../Components/Payment/StripeCheckoutForm";
import InputField from "../../Components/Inputs/InputField";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export default function RechargePaymentPage() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Amount Selection, 2: Card Details
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const goBack = () => {
    if (step === 2) {
      handleCancelPayment();
    } else {
      navigate(-1);
    }
  };

  const handleCancelPayment = async () => {
    if (!paymentIntentId) {
      setStep(1);
      setClientSecret("");
      return;
    }

    setIsCancelling(true);
    try {
      await cancelPaymentIntent(paymentIntentId);
    } catch (err) {
      // Silently handle — the intent will expire on Stripe anyway
      console.warn('Failed to cancel PaymentIntent:', err);
    } finally {
      setPaymentIntentId("");
      setClientSecret("");
      setStep(1);
      setIsCancelling(false);
    }
  };

  const closeModal = () => {
    navigate("/wallet");
  };

  const handleProceedToPayment = async () => {
    const cleanAmount = amount.toString().replace(',', '.');
    const val = parseFloat(cleanAmount);
    
    if (isNaN(val) || val < 5 || val > 500) {
      setError(t('amount_error_range'));
      return;
    }
    
    setAmount(val.toFixed(2));
    setError("");
    setIsInitializing(true);

    try {
      // 1. Initialize Payment Intent on backend
      const response = await createPaymentIntent({ 
        amount: val,
        currency: 'MAD'
      });
      const { clientSecret: secret } = response.data.data;
      
      setClientSecret(secret);
      setPaymentIntentId(response.data.data.paymentIntentId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || t('payment_init_error'));
    } finally {
      setIsInitializing(false);
    }
  };

  const onSuccess = (paymentIntentId) => {
    navigate("/wallet", { 
      state: { 
        successMessage: t('payment_success_message'),
        paymentIntentId: paymentIntentId
      } 
    });
  };

  const onAmountChange = (e) => {
    setAmount(e.target.value);
    if (error) setError("");
  };

  const appearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#eab308',
      colorBackground: '#1a1a1a',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, sans-serif',
      spacingUnit: '4px',
      borderRadius: '12px',
    },
  };

  return (
    <div className="app-shell">
      <div className="app-frame">
        <ValidationCard className="app-card shadow-2xl">
          <Header
            title={step === 1 ? t('recharge_title') : t('secure_payment')}
            onBack={goBack}
            showBackButton={true}
            onClose={closeModal}
            showCloseButton={false}
            className="px-6 pt-6 pb-4"
          />

          <div className="px-6">
            <ProgressDots totalSteps={2} currentStep={step} />
          </div>

          <div className="app-content custom-scrollbar px-6 pb-8">
            {step === 1 ? (
              <div className="space-y-8 mt-4">
                <div className="space-y-2">
                  <h3 className="text-white text-lg font-bold">{t('how_much_recharge')}</h3>
                  <p className="text-white/40 text-xs">{t('balance_after_payment')}</p>
                </div>

                <AmountDisplay
                  label={t('amount_to_add')}
                  amount={amount ? `${parseFloat(amount || 0).toFixed(2)} DH` : "0,00 DH"}
                  icon="wallet"
                  className="shadow-xl"
                />

                <div className="space-y-4">
                  <InputField
                    type="number"
                    id="recharge-amount"
                    label={t('enter_amount')}
                    placeholder={t('amount_placeholder')}
                    var={amount}
                    setVar={onAmountChange}
                    error={!!error}
                    errorMessage={error}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest px-1">{t('quick_amounts')}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {["10", "20", "50", "100", "200", "500"].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setAmount(preset);
                          setError("");
                        }}
                        className={`py-3 rounded-xl border transition-all duration-200 font-bold ${
                          amount === preset 
                          ? 'border-yellow-500 bg-yellow-500/20 text-yellow-500' 
                          : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  disabled={isInitializing}
                  className="w-full py-4 mt-4 rounded-2xl bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-bold shadow-2xl hover:from-yellow-500 hover:to-yellow-400 transform active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                >
                  {isInitializing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{t('initializing')}</span>
                    </>
                  ) : (
                    <span>{t('proceed_to_payment')}</span>
                  )}
                </button>
              </div>
            ) : (
              stripePromise && clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance, locale: language }}>
                  <div className="mt-4">
                    <StripeCheckoutForm 
                      amount={amount}
                      clientSecret={clientSecret}
                      onSuccess={onSuccess} 
                      onCancel={handleCancelPayment}
                      isCancelling={isCancelling}
                    />
                  </div>
                </Elements>
              ) : (
                <div className="mt-8 flex flex-col items-center justify-center space-y-4">
                   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                   <p className="text-white/60 text-sm">{t('load_payment')}</p>
                </div>
              )
            )}
          </div>
        </ValidationCard>
      </div>
    </div>
  );
};


