import React from 'react';

const TicketInfoCard = ({ 
    ticketType = "Ticket Unitaire",
    price = "8,00 DH",
    validityTime = "18:30",
    currency = "DH",
    className = ""
}) => {
    return (
        <div className={`bg-white/5 rounded-2xl p-5 border border-white/10 ${className}`}>
            <div className="space-y-4">
                {/* Ticket Type & Price */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-white/60 text-sm">Ticket</p>
                        <p className="text-white font-semibold">{ticketType}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/60 text-sm">Prix</p>
                        <p className="text-white font-bold text-lg">{price}</p>
                    </div>
                </div>
                
                {/* Validity */}
                <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                        </svg>
                        <p className="text-white/80 text-sm">
                            Valide jusqu'à <span className="text-yellow-500 font-medium">{validityTime}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketInfoCard;