import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Layout Components
import Header from "../../Components/Layout/Header";
import ProgressDots from "../../Components/UI/ProgressDots";

// UI Components
import ValidationCard from "../../Components/Cards/ValidationCard";
import AmountDisplay from "../../Components/Cards/AmountDisplay";
import CheckoutForm from "./CheckoutForm";
import InputField from "../../Components/Inputs/InputField";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const RechargePaymentScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Amount Selection, 2: Card Details
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const goBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate(-1);
    }
  };

  const closeModal = () => {
    navigate("/wallet");
  };

  const handleProceedToPayment = () => {
    // Robust parsing: handle both dot and comma
    const cleanAmount = amount.toString().replace(',', '.');
    const val = parseFloat(cleanAmount);
    
    if (isNaN(val) || val < 5 || val > 500) {
      setError("Le montant doit être compris entre 5 DH et 500 DH.");
      return;
    }
    
    // Set formatted amount back to state
    setAmount(val.toFixed(2));
    setError("");
    setStep(2);
  };

  const onSuccess = () => {
    navigate("/wallet", { state: { successMessage: "Rechargement réussi !" } });
  };

  // Helper to handle input change matching InputField's expectation
  const onAmountChange = (e) => {
    setAmount(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <ValidationCard className="shadow-2xl">
          {/* Header */}
          <Header
            title={step === 1 ? "Rechargement" : "Paiement sécurisé"}
            onBack={goBack}
            showBackButton={true}
            onClose={closeModal}
            showCloseButton={false}
            className="px-6 pt-6 pb-4"
          />

          {/* Progress Dots */}
          <div className="px-6">
            <ProgressDots totalSteps={2} currentStep={step} />
          </div>

          {/* Main Content */}
          <div className="max-h-[calc(100vh-150px)] overflow-y-auto custom-scrollbar px-6 pb-8">
            {step === 1 ? (
              <div className="space-y-8 mt-4">
                <div className="space-y-2">
                  <h3 className="text-white text-lg font-bold">Combien souhaitez-vous recharger ?</h3>
                  <p className="text-white/40 text-xs">Le solde sera disponible immédiatement après validation.</p>
                </div>

                <AmountDisplay
                  label="Montant à ajouter"
                  amount={amount ? `${parseFloat(amount || 0).toFixed(2)} DH` : "0,00 DH"}
                  icon="wallet"
                  className="shadow-xl transform hover:scale-[1.01] transition-transform"
                />

                <div className="space-y-4">
                  <InputField
                    type="number"
                    id="recharge-amount"
                    label="Entrez le montant (DH)"
                    placeholder="Ex: 50"
                    var={amount}
                    setVar={onAmountChange}
                    error={!!error}
                    errorMessage={error}
                  />
                  <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl">
                    <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p className="text-yellow-500/80 text-[10px] leading-tight">
                      Limite de rechargement : Min 5 DH - Max 500 DH par transaction.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest px-1">Montants rapides</p>
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
                          ? 'border-yellow-500 bg-yellow-500/20 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/10'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  className="w-full py-4 mt-4 rounded-2xl bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-bold shadow-2xl hover:from-yellow-500 hover:to-yellow-400 transform active:scale-[0.98] transition-all"
                >
                  Continuer vers le paiement
                </button>
              </div>
            ) : (
              stripePromise ? (
                <Elements stripe={stripePromise}>
                  <div className="mt-4">
                    <CheckoutForm 
                      amount={amount} 
                      onSuccess={onSuccess} 
                      onBack={() => setStep(1)} 
                    />
                  </div>
                </Elements>
              ) : (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  Clé Stripe manquante. Ajoutez `VITE_STRIPE_PUBLISHABLE_KEY` dans votre fichier d'environnement frontend.
                </div>
              )
            )}
          </div>
        </ValidationCard>
      </div>
    </div>
  );
};

export default RechargePaymentScreen;
