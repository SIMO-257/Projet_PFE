import styles from '../../Styles/TicketSelection.module.css'; // Assuming similar styles
import PaymentMethod from '../../Components/Payment/PaymentMethod';
import PaymentSummary from '../../Components/Payment/PaymentSummary';
import PaymentButton from '../../Components/Buttons/PaymentButton';
import TicketInfo from '../../Components/Payment/TicketInfo';

import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Paiment() {

    // const fetch_paiment = useForm({
    //     id: props.p
    // });

    // useEffect(() => {

    //     fetch_purchase.get('/paiment', {

    //         onSuccess: (page) => {

    //             setPurchase(page.props.paiment);

    //         },
    //     });
    // }, []);
    

    // App.jsx (Main Component)




  const [selectedMethod, setSelectedMethod] = useState('carte_virtuelle');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const paymentMethods = [
    {
      id: 'carte_virtuelle',
      title: 'Carte virtuelle',
      details: [
        { label: 'Sonde d\'approbation', value: '42,50 €' },
        { label: 'Numéro', value: '*** 7905' }
      ],
      note: 'Sens débité immédiatement',
      icon: '💳'
    },
    {
      id: 'carte_bancaire',
      title: 'Carte bancaire',
      details: [
        { label: 'Visa', value: '***** 4532' },
        { label: 'Expire', value: '12/27' }
      ],
      note: 'Paiement évalué par Stripe',
      icon: '💳',
      hasAddButton: true
    },
    {
      id: 'portefeuille',
      title: 'Portefeuille',
      details: [
        { label: 'Solde', value: '42,50 €' },
        { label: 'Disponible', value: 'Solde suffisant' }
      ],
      note: 'Solde suffisant',
      icon: '💰'
    },
    {
      id: 'apple_pay',
      title: 'Apple Pay',
      details: [
        { label: 'Numéro', value: '***** 8901' }
      ],
      note: 'Paiement en un tap sécurisé',
      icon: '🍎'
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
          
          {/* Payment Summary - NEW SECTION */}
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
