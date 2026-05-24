import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { forgotPasswordClient } from '../services/clientService';
import { useTranslation } from '../hooks/useTranslation';

import InputField from '../Components/Inputs/InputField';
import ConnexionButton from '../Components/Buttons/ConnexionButton';
import AuthLayout from '../Components/Layout/AuthLayout';
import styles from '../Styles/Auth.module.css';

export default function ForgotPassword() {
    const { t } = useTranslation();
    const [form, setForm] = useState({ email: '' });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState('');

    const setField = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const Send_Password = async (e) =>{
        e.preventDefault();
        setErrors({});
        setStatus('');

        try {
            setProcessing(true);
            const res = await forgotPasswordClient({ email: form.email });
            setStatus(res?.data?.message || t('reset_link_sent'));
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
    }

    return (
        <AuthLayout
            subtitle={t('forgot_password_title')}
            description={t('forgot_password_desc')}
            footerText={t('remember_password')}
            footerLinkText={t('sign_in_link')}
            footerLinkTo="/login"
            showSocial={false}
            onSubmit={Send_Password}
        >
            <InputField
                label={t('email')}
                type="email"
                placeholder={t('email_placeholder')}
                id="login-email"
                var={form.email}
                setVar={setField('email')}
                required
            />

            {errors.form && <p className="text-red-500 text-xs mb-4">{errors.form}</p>}
            {status && (
              <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 mb-4 flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <p className="text-green-300 text-sm font-medium">{status}</p>
              </div>
            )}

            <ConnexionButton type="submit" variant="primary" disabled={processing}>
                {processing ? t('sending') : t('send_reset_btn')}
            </ConnexionButton>

            <div className="mt-10 pt-6 border-t border-white/10">
                <h3 className={`${styles.authSubtitle} !text-lg !mb-2 text-center`}>{t('need_help')}</h3>
                <p className={`${styles.authDescription} text-center mb-4`}>
                    {t('support_247')}
                </p>
                <div className="text-yellow-400 flex justify-center space-x-6">
                    <strong>{t('support_phone')}</strong>
                </div>
            </div>
        </AuthLayout>
    );
}
