import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { resetPasswordClient } from '../../services/clientService';
import InputField from '../../Components/Inputs/InputField';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';
import styles from '../../Styles/Auth.module.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [form, setForm] = useState({
    email,
    token,
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);

  const setField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const fieldError = (name) => {
    const val = errors?.[name];
    if (Array.isArray(val)) return val[0];
    return val ?? '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setStatus('');

    if (!form.token || !form.email) {
      setErrors({ form: 'Reset link is invalid. Please request a new link.' });
      return;
    }

    try {
      setProcessing(true);
      const res = await resetPasswordClient(form);
      setStatus(res?.data?.message ?? 'Password reset successful.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const responseErrors = err?.response?.data?.errors;
      if (responseErrors) {
        setErrors(responseErrors);
      } else {
        setErrors({ form: 'Failed to reset password. Please try again.' });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <header className={styles.authHeader}>
          <h1 className={styles.authLogo}>CasaWay</h1>
          <hr className={styles.goldenLine} />
        </header>

        <h2 className={styles.authSubtitle}>Reset Password</h2>
        <p className={styles.authDescription}>Choose a new password for your account.</p>

        <form className={styles.authForm} onSubmit={onSubmit}>
          <InputField
            label="Email"
            type="email"
            placeholder="your@email.com"
            id="reset-email"
            var={form.email}
            setVar={setField('email')}
            error={Boolean(fieldError('email'))}
            errorMessage={fieldError('email')}
            required
          />

          <InputField
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            id="reset-password"
            var={form.password}
            setVar={setField('password')}
            error={Boolean(fieldError('password'))}
            errorMessage={fieldError('password')}
            required
          />

          <InputField
            label="Confirm Password"
            type="password"
            placeholder="Repeat your password"
            id="reset-password-confirmation"
            var={form.password_confirmation}
            setVar={setField('password_confirmation')}
            error={Boolean(fieldError('password_confirmation'))}
            errorMessage={fieldError('password_confirmation')}
            required
          />

          {errors.form && <p className={styles.fieldError}>{errors.form}</p>}
          {status && <p className={styles.authDescription}>{status}</p>}

          <ConnexionButton type="submit" variant="primary" disabled={processing}>
            {processing ? 'Resetting...' : 'Reset Password'}
          </ConnexionButton>
        </form>

        <div className={styles.authFooter}>
          <p>
            Back to <Link to="/login" className={styles.authLink}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
