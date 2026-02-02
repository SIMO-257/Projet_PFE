// components/PaymentButton.jsx
import React from 'react';

const PaymentButton = ({ amount, onConfirm, disabled }) => {
  return (
    <div className="mt-8">
      <button
        onClick={onConfirm}
        disabled={disabled}
        className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all duration-200 ${
          disabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
        }`}
      >
        Confirmer et payer {amount}
      </button>
    </div>
  );
};

export default PaymentButton;