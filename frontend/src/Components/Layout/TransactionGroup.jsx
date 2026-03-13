import React from 'react';
import TransactionItem from '../Cards/TransactionItem';

const TransactionGroup = ({ 
    date = "Date",
    transactions = [],
    variant = 'default'
}) => {
    return (
        <div className="mb-6">
            {/* Date Header */}
            <h4 className="text-white/60 text-xs uppercase tracking-wide mb-3 font-medium">
                {date}
            </h4>

            {/* Transaction List */}
            <div className="space-y-2">
                {transactions.map((transaction) => (
                    <TransactionItem
                        key={transaction.id}
                        type={transaction.type}
                        title={transaction.title}
                        subtitle={transaction.subtitle}
                        time={transaction.time}
                        amount={transaction.amount}
                        isPositive={transaction.isPositive}
                        icon={transaction.type === 'income' ? 'plus' : 'ticket'}
                        showTime={true}
                        variant="detailed"
                    />
                ))}
            </div>
        </div>
    );
};

export default TransactionGroup;