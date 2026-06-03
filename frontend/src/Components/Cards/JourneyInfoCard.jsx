import React from 'react';

const JourneyInfoCard = ({ 
    from = "Al Qods",
    to = "6 Novembre",
    date = "Aujourd'hui à 15:05",
    period = "Samedi 2 → 6 Novembre",
    ticketType = "Ticket Unitaire",
    className = ""
}) => {
    return (
        <div className={`bg-white/5 rounded-2xl p-5 border border-white/10 ${className}`}>
            <div className="space-y-4">
                {/* TRAJET */}
                <div>
                    <p className="text-white/60 text-sm mb-2">TRAJET</p>
                    <div className="flex items-center space-x-3">
                        <div className="relative flex-1">
                            <div className="text-white font-semibold">{from}</div>
                            <div className="h-6 w-px bg-yellow-500 absolute left-1/2 top-6"></div>
                        </div>
                        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                        <div className="flex-1">
                            <div className="text-white font-semibold text-right">{to}</div>
                        </div>
                    </div>
                </div>

                {/* Date and Time */}
                <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-3 text-white/80">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                        </svg>
                        <span>{date}</span>
                    </div>
                </div>

                {/* Period */}
                <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-3 text-white/80">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                        </svg>
                        <span>{period}</span>
                    </div>
                </div>

                {/* Ticket Type */}
                <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z"/>
                            </svg>
                            <span className="text-white/80">Ticket</span>
                        </div>
                        <span className="text-white font-semibold">{ticketType}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JourneyInfoCard;