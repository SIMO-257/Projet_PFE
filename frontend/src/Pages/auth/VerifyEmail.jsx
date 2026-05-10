import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { resendVerificationEmail, verifyEmailCode } from '../../services/clientService';
import styles from '../../Styles/Auth.module.css';

const STATUS_CONFIG = {
  success: {
    title:   'Email vérifié !',
    message: 'Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter.',
    type:    'success',
    showLogin: true,
    showResend: false,
    showCodeInput: false,
  },
  expired: {
    title:   'Code expiré',
    message: 'Votre code de vérification a expiré (60 minutes). Demandez un nouveau code ci-dessous.',
    type:    'warning',
    showLogin: false,
    showResend: true,
    showCodeInput: true,
  },
  invalid: {
    title:   'Code invalide',
    message: 'Ce code de vérification est invalide.',
    type:    'danger',
    showLogin: false,
    showResend: true,
    showCodeInput: true,
  },
  already_verified: {
    title:   'Déjà vérifié',
    message: 'Votre email est déjà vérifié. Connectez-vous directement.',
    type:    'info',
    showLogin: true,
    showResend: false,
    showCodeInput: false,
  },
  pending: {
    title:   'Vérifiez votre email',
    message: 'Un code de vérification a été envoyé. Saisissez-le ci-dessous pour activer votre compte.',
    type:    'info',
    showLogin: false,
    showResend: true,
    showCodeInput: true,
  },
};

export default function VerifyEmail() {
  const [searchParams, setSearchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const [email, setEmail]           = useState(searchParams.get('email') || '');
  const [code, setCode]             = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const status = searchParams.get('status') || 'pending';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) { setError('L\'email est requis.'); return; }
    if (code.length !== 6) { setError('Le code doit contenir 6 chiffres.'); return; }

    setLoading(true);
    setError('');
    try {
      await verifyEmailCode(email, code);
      setSearchParams({ status: 'success' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) { setError('Entrez votre adresse email.'); return; }
    setResendLoading(true);
    setResendMessage('');
    setError('');
    try {
      await resendVerificationEmail(email);
      setResendMessage('Nouveau code envoyé. Vérifiez votre boîte mail.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Une erreur est survenue. Réessayez.');
    } finally {
      setResendLoading(false);
    }
  };

  const getIconColor = (type) => {
    switch(type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-amber-500';
      case 'danger':  return 'text-red-500';
      case 'info':    return 'text-blue-500';
      default:        return 'text-gray-500';
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={`${getIconColor(config.type)} text-4xl mb-4 text-center`}>
            {config.type === 'success'  && '✓'}
            {config.type === 'warning'  && '⚠'}
            {config.type === 'danger'   && '✕'}
            {config.type === 'info'     && 'ℹ'}
          </div>

          <h1 className={styles.authSubtitle}>{config.title}</h1>
          <p className={styles.authDescription}>{config.message}</p>
        </div>

        {config.showCodeInput && (
          <form onSubmit={handleVerify} className={styles.formGroup}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              className={styles.formInput}
              disabled={status === 'pending' && searchParams.get('email')}
            />
            <div className="mt-4">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Code à 6 chiffres"
                className={`${styles.formInput} text-center tracking-widest text-xl font-bold`}
                maxLength={6}
              />
            </div>
            
            {error && <p className={styles.fieldError}>{error}</p>}
            
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className={`${styles.authButton} ${styles.authButtonPrimary} mt-4`}
            >
              {loading ? 'Vérification...' : 'Vérifier mon compte'}
            </button>
          </form>
        )}

        {config.showResend && (
          <div className="mt-6 text-center">
            {resendMessage && <p className="text-green-600 text-xs mb-2">{resendMessage}</p>}
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-blue-600 text-sm hover:underline disabled:text-gray-400"
            >
              {resendLoading ? 'Envoi...' : 'Je n\'ai pas reçu de code ? Renvoyer'}
            </button>
          </div>
        )}

        {config.showLogin && (
          <button
            onClick={() => navigate('/login')}
            className={`${styles.authButton} ${styles.authButtonPrimary}`}
          >
            Se connecter
          </button>
        )}
        
        <div className={styles.authFooter}>
          <button onClick={() => navigate('/login')} className={styles.authLink}>
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}
