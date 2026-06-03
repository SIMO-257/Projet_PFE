import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { getAdminTransactions, exportTransactionsCSV } from '../../services/adminService';

const AdminTransactions = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getAdminTransactions({ search, type, page });
      setTransactions(response.data.data.data);
      setPagination(response.data.data);
    } catch (err) {
      console.error('Error loading transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, type, page]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('admin_transaction_management')}</h2>
          <p className="text-white/50">{t('admin_transaction_subtitle')}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={async () => { try { await exportTransactionsCSV({ type }); } catch (e) { console.error('Export failed', e); } }}
            className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-yellow-500/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#1a0507] text-white">{t('all_types')}</option>
              <option value="recharge" className="bg-[#1a0507] text-white">{t('recharge_type')}</option>
              <option value="purchase" className="bg-[#1a0507] text-white">{t('type_purchase')}</option>
              <option value="validation" className="bg-[#1a0507] text-white">{t('type_validation_admin')}</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/40">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <input
            type="text"
            placeholder={t('search_email')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white w-64 focus:outline-none focus:border-yellow-500/50"
          />
        </div>
      </div>

      <div className="bg-[#1a0507]/80 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-white/60 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">{t('table_id_ref')}</th>
              <th className="px-6 py-4 font-medium">{t('table_client')}</th>
              <th className="px-6 py-4 font-medium">{t('table_type')}</th>
              <th className="px-6 py-4 font-medium">{t('table_amount')}</th>
              <th className="px-6 py-4 font-medium">{t('table_status')}</th>
              <th className="px-6 py-4 font-medium">{t('table_date')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-white/40">{t('loading_transactions')}</td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-white/40">{t('no_transaction_admin')}</td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-xs text-white/70 font-mono truncate max-w-[120px]" title={tx.uuid}>
                      {tx.uuid.split('-')[0]}...
                    </div>
                    <div className="text-[10px] text-white/30 truncate max-w-[120px]">{tx.reference || t('ref_no_ref')}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{tx.client?.email || t('not_applicable')}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      tx.type === 'recharge' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold ${
                    tx.type === 'recharge' 
                      ? 'text-green-400' 
                      : tx.type === 'purchase' 
                        ? 'text-red-400' 
                        : 'text-white'
                  }`}>
                    {tx.type === 'recharge' ? '+' : '-'}{tx.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      tx.status === 'completed' 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-white/5 text-white/40 border border-white/10'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/50">
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination && pagination.last_page > 1 && (
          <div className="p-4 bg-white/5 border-t border-white/5 flex justify-center space-x-2">
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                  page === p
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;
