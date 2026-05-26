import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { resendVerificationEmail, verifyEmailCode } from '../../services/clientService';
import { useTranslation } from '../../hooks/useTranslation';
import styles from '../../Styles/Auth.module.css';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const [email, setEmail]           = useState(searchParams.get('email') || '');
  const [code, setCode]             = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const STATUS_CONFIG = {
    success: {
      title:   t('email_verified_title'),
      message: t('email_verified_msg'),
      type:    'success',
      showLogin: true,
      showResend: false,
      showCodeInput: false,
    },
    expired: {
      title:   t('code_expired_title'),
      message: t('code_expired_msg'),
      type:    'warning',
      showLogin: false,
      showResend: true,
      showCodeInput: true,
    },
    invalid: {
      title:   t('code_invalid_title'),
      message: t('code_invalid_msg'),
      type:    'danger',
      showLogin: false,
      showResend: true,
      showCodeInput: true,
    },
    already_verified: {
      title:   t('already_verified_title'),
      message: t('already_verified_msg'),
      type:    'info',
      showLogin: true,
      showResend: false,
      showCodeInput: false,
    },
    pending: {
      title:   t('pending_title'),
      message: t('pending_msg'),
      type:    'info',
      showLogin: false,
      showResend: true,
      showCodeInput: true,
    },
  };

  const status = searchParams.get('status') || 'pending';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) { setError(t('email_required_error')); return; }
    if (code.length !== 6) { setError(t('code_6_digits_error')); return; }

    setLoading(true);
    setError('');
    try {
      await verifyEmailCode(email, code);
      setSearchParams({ status: 'success' });
    } catch (err) {
      setError(err?.response?.data?.message || t('invalid_code_expired_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) { setError(t('enter_email_error')); return; }
    setResendLoading(true);
    setResendMessage('');
    setError('');
    try {
      await resendVerificationEmail(email);
      setResendMessage(t('new_code_sent'));
    } catch (err) {
      setError(err?.response?.data?.message || t('error_occurred'));
    } finally {
      setResendLoading(false);
    }
  };

  const getIconColor = (type) => {
    switch(type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-amber-400';
      case 'danger':  return 'text-red-400';
      case 'info':    return 'text-blue-400';
      default:        return 'text-white/60';
    }
  };

  return (
    <div className="app-shell font-sora">
        <div className="app-frame">
            <div className="app-card bg-gradient-to-br from-[#400106] to-[#260101] relative flex flex-col h-[100dvh]">
                
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-[#f5d579]/10 bg-black/20 flex-shrink-0 z-10 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-[#f5d579]">
                            {t('verify_email_title')}
                        </h1>
                        <button 
                            onClick={() => navigate('/login')}
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            <span className="text-4xl font-light leading-none">×</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="app-content p-6 md:p-8 space-y-8 scroll-smooth relative flex-grow flex items-center justify-center">
                    <div className="w-full max-w-md mx-auto space-y-8">
                        
                        <div className="text-center mb-8">
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-black/30 border border-[#f5d579]/20 shadow-[0_0_20px_rgba(245,213,121,0.15)] ${getIconColor(config.type)} text-3xl`}>
                                {config.type === 'success'  && '✓'}
                                {config.type === 'warning'  && '⚠'}
                                {config.type === 'danger'   && '✕'}
                                {config.type === 'info'     && 'ℹ'}
                            </div>
                            <h2 className="text-2xl font-bold text-[#f5d579] mb-3">{config.title}</h2>
                            <p className="text-white/70 text-sm leading-relaxed">{config.message}</p>
                        </div>

                        {config.showCodeInput && (
                            <form onSubmit={handleVerify} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-white/80 text-sm font-medium ml-1">{t('email_label')}</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('email_verify_placeholder')}
                                        className="w-full bg-black/20 border border-[#f5d579]/20 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:border-[#f5d579] focus:ring-1 focus:ring-[#f5d579] transition-all"
                                        disabled={status === 'pending' && searchParams.get('email')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-white/80 text-sm font-medium ml-1">{t('code_6_digits_label')}</label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder={t('code_placeholder')}
                                        className="w-full bg-black/20 border border-[#f5d579]/20 text-white placeholder-white/30 rounded-xl px-4 py-4 text-center tracking-[0.5em] text-2xl font-bold focus:outline-none focus:border-[#f5d579] focus:ring-1 focus:ring-[#f5d579] transition-all"
                                        maxLength={6}
                                    />
                                </div>
                                
                                {error && (
                                    <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-4 shadow-[0_0_15px_rgba(239,68,68,0.15)] text-center">
                                        <p className="text-red-400 text-sm font-medium">{error}</p>
                                    </div>
                                )}
                                
                                <button
                                    type="submit"
                                    disabled={loading || code.length !== 6}
                                    className={`w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all ${loading || code.length !== 6 ? 'bg-[#f5d579]/10 text-[#f5d579]/30 cursor-not-allowed' : 'bg-gradient-to-r from-[#f5d579] to-[#d4af37] text-[#260101] shadow-xl shadow-[#f5d579]/20 hover:scale-[1.02] active:scale-95'}`}
                                >
                                    {loading ? t('verifying') : t('verify_account_btn')}
                                </button>
                            </form>
                        )}

                        {config.showResend && (
                            <div className="mt-8 text-center bg-black/20 p-5 rounded-2xl border border-[#f5d579]/10">
                                {resendMessage && <p className="text-[#f5d579] text-sm mb-3 font-medium">{resendMessage}</p>}
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendLoading}
                                    className="text-white/60 text-sm hover:text-white transition-colors underline disabled:text-white/30 disabled:no-underline"
                                >
                                    {resendLoading ? t('resending') : t('resend_code')}
                                </button>
                            </div>
                        )}

                        {config.showLogin && (
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#f5d579] to-[#d4af37] text-[#260101] shadow-xl shadow-[#f5d579]/20 hover:scale-[1.02] active:scale-95 transition-all mt-6"
                            >
                                {t('login_after_verify')}
                            </button>
                        )}
                        
                        <div className="pt-6 text-center">
                            <button onClick={() => navigate('/login')} className="text-white/50 hover:text-white text-sm transition-colors">
                                {t('back_to_login')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
