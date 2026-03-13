import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Layout Components
import Header from "../../Components/Layout/Header";

// UI Components
import ProgressDots from "../../Components/UI/ProgressDots";

// Cards Components
import AmountDisplay from "../../Components/Cards/AmountDisplay";
import PaymentOptionCard from "../../Components/Cards/PaymentOptionCard";
import SavedCardItem from "../../Components/Cards/SavedCardItem";
import ActionButtonCard from "../../Components/Cards/ActionButtonCard";
import PaymentSummary from "../../Components/Cards/PaymentSummary";
import ValidationCard from "../../Components/Cards/ValidationCard";

// Inputs Components
import CheckboxInput from "../../Components/Inputs/CheckboxInput";

import styles from "../../Styles/RechargePaymentScreen.module.css";

const RechargePaymentScreen = () => {
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [selectedCard, setSelectedCard] = useState("visa-4532");
  const [savePayment, setSavePayment] = useState(false);
  const [amount] = useState("50,00 DH");

  const goBack = () => {
    navigate(-1);
  };

  const closeModal = () => {
    navigate("/home");
  };

  const handleConfirmPayment = () => {
    console.log("Confirming payment...");
    navigate("/recharge/confirm");
  };

  const addNewCard = () => {
    console.log("Adding new card...");
  };

  // Sample saved cards
  const savedCards = [
    {
      id: "visa-4532",
      type: "Visa",
      number: "**** 4532",
      status: "Par défaut",
      isDefault: true,
      expired: false,
    },
    {
      id: "mastercard-8801",
      type: "Mastercard",
      number: "**** 8801",
      expiry: "05/26",
      isDefault: false,
      expired: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a0b0f] to-[#1a0507] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Payment Modal Card */}
        <ValidationCard className="shadow-2xl">
          {/* Header */}
          <Header
            title="Mode de paiement"
            onBack={goBack}
            showBackButton={true}
            onClose={closeModal}
            showCloseButton={true}
            className="px-6 pt-6 pb-4"
          />

          {/* Progress Dots */}
          <ProgressDots totalSteps={3} currentStep={1} />

          {/* Main Content - Scrollable */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar px-6 pb-6">
            {/* Amount Display */}
            <AmountDisplay
              label="Montant sélectionné"
              amount={amount}
              icon="wallet"
              gradientFrom="#5C2A36"
              gradientTo="#3D1A24"
              className="mb-6"
            />

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="text-white text-sm mb-4">
                Choisissez votre mode de paiement
              </h3>

              {/* Card Payment Option */}
              <PaymentOptionCard
                title="Carte bancaire"
                isSelected={selectedPaymentMethod === "card"}
                onClick={() => setSelectedPaymentMethod("card")}
                icon={
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                  </svg>
                }
                className="mb-3"
              >
                {selectedPaymentMethod === "card" && (
                  <div className="space-y-3 pl-8">
                    {/* Saved Cards */}
                    {savedCards.map((card) => (
                      <SavedCardItem
                        key={card.id}
                        type={card.type}
                        number={card.number}
                        status={card.status}
                        expiry={card.expiry}
                        isSelected={selectedCard === card.id}
                        onClick={() => setSelectedCard(card.id)}
                        isDefault={card.isDefault}
                      />
                    ))}

                    {/* Add New Card Button */}
                    <ActionButtonCard
                      variant="default"
                      icon={
                        <svg
                          className="w-5 h-5 text-yellow-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      }
                      label="Ajouter une nouvelle carte"
                      onClick={addNewCard}
                      className="w-full rounded-xl p-3 border-2 border-dashed border-yellow-500/30 hover:border-yellow-500/50"
                      showArrow={false}
                    />

                    {/* Secure Payment Info */}
                    <div className="flex items-center space-x-2 pt-2">
                      <svg
                        className="w-4 h-4 text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-white/50 text-xs">
                        Paiement sécurisé par Stripe
                      </span>
                    </div>
                  </div>
                )}
              </PaymentOptionCard>

              {/* PayPal Option */}
              <PaymentOptionCard
                variant="paypal"
                title="Paiement express"
                subtitle="Carte **** 8801"
                description="Paiement en un tap sécurisé"
                isSelected={selectedPaymentMethod === "paypal"}
                onClick={() => setSelectedPaymentMethod("paypal")}
                showExpressBadge={true}
                icon={
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                  </svg>
                }
                className="mb-3"
              >
                {selectedPaymentMethod === "paypal" && (
                  <div className="pl-8 mt-2">
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-3 h-3 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-white/50 text-xs">
                        Authentification avec Face ID biométrique
                      </span>
                    </div>
                  </div>
                )}
              </PaymentOptionCard>

              {/* Email Option */}
              <PaymentOptionCard
                variant="email"
                title="user@example.com"
                subtitle="Recevez un lien PayPal pour finaliser"
                isSelected={selectedPaymentMethod === "email"}
                onClick={() => setSelectedPaymentMethod("email")}
                rightIcon={
                  <svg
                    className="w-4 h-4 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                }
              />
            </div>

            {/* Save Payment Checkbox */}
            <div className="mb-6">
              <CheckboxInput
                label={
                  <>
                    <div className="flex items-center space-x-2 mb-1">
                      <svg
                        className="w-4 h-4 text-red-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-white text-sm">Paiement sécurisé</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white/40 text-xs">
                      <span>SSL Crypté</span>
                      <span>•</span>
                      <span>PCI-DSS Compliant</span>
                    </div>
                  </>
                }
                id="save-payment"
                setCheck={() => setSavePayment(!savePayment)}
                check={savePayment}
              />
            </div>

            {/* Payment Summary */}
            <PaymentSummary
              card="Visa****6342"
              date="05/10/2026"
              totalAmount={amount}
              className="mb-6"
            />

            {/* Terms */}
            <div className="flex items-start space-x-2 mb-6">
              <svg
                className="w-4 h-4 text-yellow-500 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-white/50 text-xs leading-relaxed">
                J'accepte les{" "}
                <button className="text-yellow-500 underline">
                  conditions générales
                </button>
                {" "}de vente
              </p>
            </div>

            {/* Confirm Button */}
            <ActionButtonCard
              variant="validation"
              icon={
                <svg
                  className="w-5 h-5 text-white/50"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              label={`Confirmer le paiement • ${amount}`}
              onClick={handleConfirmPayment}
              showArrow={false}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#3a4f5a] to-[#2a3f4a] hover:from-[#4a5f6a] hover:to-[#3a4f5a] border border-white/10"
            />
          </div>
        </ValidationCard>
      </div>
    </div>
  );
};

export default RechargePaymentScreen;