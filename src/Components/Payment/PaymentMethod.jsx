// components/PaymentMethod.jsx
import React from 'react';

const PaymentMethod = ({ method, isSelected, onSelect }) => {
  return (
    <div 
      className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center">
            <span className="mr-2 text-xl">{method.icon}</span>
            <h4 className="font-medium text-gray-800">{method.title}</h4>
          </div>
          
          <div className="mt-3 space-y-1">
            {method.details.map((detail, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600 text-sm">{detail.label}</span>
                <span className={`font-medium ${detail.label === 'Solde' ? 'text-green-600' : 'text-gray-800'}`}>
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 mt-3">{method.note}</p>
        </div>
        
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
          isSelected ? 'border-blue-500' : 'border-gray-300'
        }`}>
          {isSelected && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
        </div>
      </div>
      
      {method.hasAddButton && (
        <button className="mt-4 text-blue-600 text-sm font-medium flex items-center">
          <span className="mr-1">+</span> Ajouter une nouvelle carte
        </button>
      )}
    </div>
  );
};

export default PaymentMethod;