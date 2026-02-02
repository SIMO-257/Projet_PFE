// components/PaymentSummary.jsx
import React from 'react';

const PaymentSummary = ({ ticketInfo }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-6">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Résumé de la commande</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Billet unitaire</span>
          <span className="font-medium text-gray-800">8 DH</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Frais de service</span>
          <span className="font-medium text-gray-800">0 DH</span>
        </div>
        
        <div className="border-t border-gray-300 pt-3 mt-2">
          <div className="flex justify-between">
            <span className="text-gray-800 font-semibold">Total</span>
            <span className="text-2xl font-bold text-blue-600">8 DH</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Garantie remboursement:</span> Vous pouvez être remboursé jusqu'à 24h avant le départ.
        </p>
      </div>
    </div>
  );
};

export default PaymentSummary;