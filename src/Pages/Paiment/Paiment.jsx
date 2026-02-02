import React from 'react';
import { useState } from 'react';
import PaymentMethod from '../../Components/Payment/PaymentMethod';
import TicketInfo from '../../Components/Payment/TicketInfo';
import PaymentButton from '../../Components/Buttons/PaymentButton';
import PaymentSummary from '../../Components/Payment/PaymentSummary';
import styles from '../../Styles/Paiment.module.css';

export default function Paiment() {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const paymentMethods = [
    {
      id: 'card',
      title: 'Carte virtuelle',
      icon: '💳',
      details: [
        { label: 'Sonde d\'approbation', value: '42,50 €' },
        { label: 'Numéro', value: '*** 7905' }
      ],
      note: 'Sens débité immédiatement'
    },
    {
      id: 'bank',
      title: 'Carte bancaire',
      icon: '💳',
      details: [
        { label: 'Visa', value: '***** 4532' },
        { label: 'Expire', value: '12/27' }
      ],
      note: 'Paiement évalué par Stripe'
    },
    {
      id: 'portfolio',
      title: 'Portefeuille',
      icon: '💰',
      details: [
        { label: 'Solde', value: '42,50 €' },
        { label: 'Disponible', value: 'Solde suffisant' }
      ],
      note: 'Solde suffisant'
    },
    {
      id: 'apple',
      title: 'Apple Pay',
      icon: '🍎',
      details: [
        { label: 'Numéro', value: '***** 8901' }
      ],
      note: 'Paiement en un tap sécurisé'
    }
  ];

  const ticketInfo = {
    type: 'Single',
    expiration: '17/12/2026 au 09:00',
    total: '8 DH'
  };

  const handlePayment = () => {
    if (!acceptTerms) {
      alert('Veuillez accepter les conditions générales de vente');
      return;
    }
    alert(`Paiement de ${ticketInfo.total} confirmé avec ${selectedMethod}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Paiement</h1>
        
        {/* Ticket Unit Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Billet Unitaire</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">1x Billet + 1 trajet</p>
            </div>
            <div className="text-2xl font-bold text-blue-600">8 DH</div>
          </div>
          <div className="border-t border-gray-200 my-4"></div>
          
          {/* Payment Methods */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Choisissez votre mode de paiement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <PaymentMethod
                  key={method.id}
                  method={method}
                  isSelected={selectedMethod === method.id}
                  onSelect={() => setSelectedMethod(method.id)}
                />
              ))}
            </div>
          </div>
          
          {/* Payment Summary */}
          <PaymentSummary ticketInfo={ticketInfo} />
          
          {/* Ticket Details */}
          <TicketInfo ticket={ticketInfo} />
          
          {/* Terms and Conditions */}
          <div className="mt-6">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 mr-3 h-5 w-5 text-blue-600 rounded"
              />
              <label htmlFor="terms" className="text-gray-700">
                J'accepte les conditions générales de vente et la politique de remboursement
              </label>
            </div>
          </div>
          
          {/* Payment Button */}
          <PaymentButton 
            amount={ticketInfo.total}
            onConfirm={handlePayment}
            disabled={!acceptTerms}
          />
          
          {/* Security Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="mr-2">🔒</span>
                <span>Sécurité</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🛡️</span>
                <span>Protection</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🔐</span>
                <span>SQL</span>
              </div>
            </div>
            <div className="flex items-center justify-end mt-4 space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">OK</span>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">X</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}