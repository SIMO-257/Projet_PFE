// components/TicketInfo.jsx
import React from 'react';

const TicketInfo = ({ ticket }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-gray-500 text-sm">Type</p>
          <p className="font-medium text-gray-800">{ticket.type}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Date expiration</p>
          <p className="font-medium text-gray-800">{ticket.expiration}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-gray-500 text-sm">Total à payer</p>
          <p className="text-2xl font-bold text-blue-600">{ticket.total}</p>
        </div>
      </div>
    </div>
  );
};

export default TicketInfo;