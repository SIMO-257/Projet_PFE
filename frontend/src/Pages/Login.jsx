import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';


import InputField from '../Components/Inputs/InputField';
import CheckboxInput from '../Components/Inputs/CheckboxInput';
import ConnexionButton from '../Components/Buttons/ConnexionButton';
import FormOptions from '../Components/Form/FormOptions';
import AuthLayout from '../Components/Layout/AuthLayout';
import LoadingOverlay from '../Components/UI/LoadingOverlay';
import styles from '../Styles/Auth.module.css';

export default function Login() {
    const navigate = useNavigate();
    const { login, isAuthenticated, error: authError, isLoading } = useAuth();
    const { t } = useTranslation();

    const [form, setForm] = useState({
        email: '',
        password: '',
        remember_me: false,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home');
        }
    }, [isAuthenticated, navigate]);

    const setField = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const toggleRemember = () => {
        setForm((prev) => ({ ...prev, remember_me: !prev.remember_me }));
    };

    const Log_in = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            const payload = {
                email: form.email,
                password: form.password,
                remember_me: form.remember_me,
            };
            
            const resultAction = await login(payload);
            if (resultAction.meta?.requestStatus !== 'fulfilled') {
                const response = resultAction.payload;
                
                const responseErrors = response?.errors || response?.data;
                if (responseErrors) {
                    if (responseErrors.email || responseErrors.password) {
                        const generic = t('login_error');
                        setErrors({ email: generic, password: generic });
                    } else {
                        setErrors(responseErrors);
                    }
                } else {
                    const message = resultAction.payload?.message || t('login_error');
                    if (String(message).toLowerCase() !== 'unauthenticated.') {
                        setErrors({ form: message });
                    }
                }
            }
        } catch (err) {
            setErrors({ form: t('unexpected_error') });
        }
    };

    return (
        <>
            <LoadingOverlay isVisible={isLoading} message={t('signing_in')} />
            <AuthLayout
                subtitle={t('welcome_back')}
                description={t('login_description')}
                footerText={t('no_account')}
                footerLinkText={t('create_account')}
                footerLinkTo="/signup"
                onSubmit={Log_in}
            >
                <InputField
                    label={t('email')}
                    type="email"
                    placeholder={t('email_placeholder')}
                    id="login-email"
                    var={form.email}
                    setVar={setField('email')}
                    error={Boolean(errors.email)}
                    errorMessage={errors.email}
                    required
                />

                <InputField
                    label={t('password')}
                    type="password"
                    placeholder={t('password_placeholder')}
                    id="login-password"
                    var={form.password}
                    setVar={setField('password')}
                    error={Boolean(errors.password)}
                    errorMessage={errors.password}
                    required
                />
              
                <FormOptions
                    leftContent={<CheckboxInput label={t('remember_me')} id="remember" setCheck={toggleRemember} check={form.remember_me} />}
                    rightContent={<Link to="/forgot_password" className={styles.forgotPassword} >{t('forgot_password')}</Link>}
                />

                <ConnexionButton type="submit" variant="primary" disabled={isLoading}>
                    {isLoading ? t('signing_in') : t('sign_in_btn')}
                </ConnexionButton>
            </AuthLayout>
        </>
    );
}
