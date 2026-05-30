import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { resetPasswordUser } from '../../services/userService';
import { useTranslation } from '../../hooks/useTranslation';
import InputField from '../../Components/Inputs/InputField';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';
import AuthLayout from '../../Components/Layout/AuthLayout';
import styles from '../../Styles/Auth.module.css';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
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
  const [passwordStrength, setPasswordStrength] = useState(null);

  const getPasswordStrength = (password) => {
    if (!password) return null;
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const score = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial]
        .filter(Boolean).length;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  };

  const setField = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const fieldError = (name) => {
    const val = errors?.[name];
    if (Array.isArray(val)) return val[0];
    return val ?? '';
  };

  const onResetSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setStatus('');

    if (!form.token || !form.email) {
      setErrors({ form: t('invalid_reset_link') });
      return;
    }

    if (passwordStrength === 'weak' || passwordStrength === null) {
      setErrors(prev => ({ ...prev, password: t('password_weak') }));
      return;
    }

    try {
      setProcessing(true);
      const res = await resetPasswordUser(form);
      setStatus(res?.data?.message ?? t('password_reset_success'));
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const responseErrors = err?.response?.data?.errors;
      if (responseErrors) {
        setErrors(responseErrors);
      } else {
        setErrors({ form: t('failed_reset') });
      }
    } finally {
      setProcessing(false);
    }
  };

  const strengthLabelClass = passwordStrength === 'weak' ? 'text-red-500' : (passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600');

  return (
    <AuthLayout
        subtitle={t('reset_password_title')}
        description={t('reset_password_desc')}
        footerText={t('back_to_login')}
        footerLinkText={t('sign_in_link')}
        footerLinkTo="/login"
        showSocial={false}
        onSubmit={onResetSubmit}
    >
      <InputField
        label={t('email')}
        type="email"
        placeholder={t('email_placeholder')}
        id="reset-email"
        var={form.email}
        setVar={setField('email')}
        error={Boolean(fieldError('email'))}
        errorMessage={fieldError('email')}
        required
        disabled
      />

      <InputField
        label={t('new_password_label')}
        type="password"
        placeholder={t('new_password_placeholder')}
        id="reset-password"
        var={form.password}
        setVar={setField('password')}
        error={Boolean(fieldError('password'))}
        errorMessage={fieldError('password')}
        required
      />

      {/* Strength Indicator */}
      {passwordStrength && (
          <div className="mb-4">
              <div className="flex gap-1 mb-1">
                  <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength ? (passwordStrength === 'weak' ? 'bg-red-500' : (passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500')) : 'bg-gray-200'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength === 'medium' || passwordStrength === 'strong' ? (passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`} />
                  <div className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'}`} />
              </div>
              <p className={`text-[10px] font-medium uppercase tracking-wider ${strengthLabelClass}`}>
                  {t('password_strength')}: {passwordStrength === 'weak' ? t('weak') : (passwordStrength === 'medium' ? t('medium') : t('strong'))}
              </p>
          </div>
      )}

      {/* Password Rules */}
      {form.password && (
          <div className="mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">{t('password_requirements')}</p>
              <ul className="space-y-1">
                  <li className={`flex items-center gap-2 text-[11px] ${form.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-1 h-1 rounded-full ${form.password.length >= 8 ? 'bg-green-600' : 'bg-gray-300'}`} />
                      {t('min_chars')}
                  </li>
                  <li className={`flex items-center gap-2 text-[11px] ${/[A-Z]/.test(form.password) && /[a-z]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(form.password) && /[a-z]/.test(form.password) ? 'bg-green-600' : 'bg-gray-300'}`} />
                      {t('upper_lower_case')}
                  </li>
                  <li className={`flex items-center gap-2 text-[11px] ${/[0-9]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(form.password) ? 'bg-green-600' : 'bg-gray-300'}`} />
                      {t('at_least_one_number')}
                  </li>
                  <li className={`flex items-center gap-2 text-[11px] ${/[^A-Za-z0-9]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(form.password) ? 'bg-green-600' : 'bg-gray-300'}`} />
                      {t('special_char')}
                  </li>
              </ul>
          </div>
      )}

      <InputField
        label={t('confirm_new_password')}
        type="password"
        placeholder={t('confirm_password_placeholder')}
        id="reset-password-confirmation"
        var={form.password_confirmation}
        setVar={setField('password_confirmation')}
        error={Boolean(fieldError('password_confirmation'))}
        errorMessage={fieldError('password_confirmation')}
        required
      />

      {errors.form && <p className={styles.fieldError}>{errors.form}</p>}
      {status && (
        <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 mb-4 flex items-center space-x-3">
          <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <p className="text-green-300 text-sm font-medium">{status}</p>
        </div>
      )}

      <ConnexionButton type="submit" variant="primary" disabled={processing}>
        {processing ? t('resetting') : t('reset_btn')}
      </ConnexionButton>
    </AuthLayout>
  );
}
