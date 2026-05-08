import React from 'react';

const NotificationItem = ({ item, onRead, onDelete }) => {
    const { id, type, title, body, time_ago, is_read, severity } = item;
    const isDanger = severity === 'danger';

    const getIcon = () => {
        if (isDanger) {
            return (
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            );
        }
        switch (type) {
            case 'validation':
                return (
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'payment':
                return (
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                );
            case 'security':
                return (
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-11V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                );
            case 'promo':
                return (
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                    </div>
                );
            case 'system':
                return (
                    <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const getTypeTag = () => {
        const colors = {
            validation: 'bg-green-500/10 text-green-400 border-green-500/20',
            payment: isDanger ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            security: 'bg-red-500/10 text-red-400 border-red-500/20',
            promo: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            system: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        };
        const labels = {
            validation: 'Validation',
            payment: 'Paiement',
            security: 'Sécurité',
            promo: 'Promo',
            system: 'Système',
        };
        return (
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colors[type] || colors.system}`}>
                {labels[type] || type}
            </span>
        );
    };

    return (
        <div 
            onClick={() => !is_read && onRead(id)}
            className={`relative group bg-[#1a1a1a]/50 rounded-2xl p-4 border transition-all duration-300 cursor-pointer ${
                is_read 
                    ? 'border-white/5 opacity-70' 
                    : isDanger 
                        ? 'border-red-500/30 bg-red-500/5' 
                        : 'border-yellow-500/20 bg-yellow-500/5'
            }`}
        >
            {!is_read && (
                <div className={`absolute top-4 right-4 w-2 h-2 rounded-full shadow-lg ${
                    isDanger ? 'bg-red-500 shadow-red-500/50' : 'bg-yellow-500 shadow-yellow-500/50'
                }`} />
            )}

            <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                    {getIcon()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-semibold truncate ${
                            is_read 
                                ? 'text-white/70' 
                                : isDanger ? 'text-red-400' : 'text-white'
                        }`}>
                            {title}
                        </h4>
                        <span className="text-[10px] text-white/30 whitespace-nowrap ml-2">
                            {time_ago}
                        </span>
                    </div>
                    
                    <p className={`text-xs mb-3 line-clamp-2 ${is_read ? 'text-white/40' : 'text-white/60'}`}>
                        {body}
                    </p>

                    <div className="flex items-center justify-between">
                        {getTypeTag()}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(id);
                            }}
                            className="p-1 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {!is_read && (
                <div className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl ${
                    isDanger ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
            )}
        </div>
    );
};

export default NotificationItem;
