import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { signupUser } from '../../services/userService';
import { useTranslation } from '../../hooks/useTranslation';

import InputField from '../../Components/Inputs/InputField';
import CheckboxInput from '../../Components/Inputs/CheckboxInput';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';
import FormOptions from '../../Components/Form/FormOptions';
import AuthLayout from '../../Components/Layout/AuthLayout';
import LoadingOverlay from '../../Components/UI/LoadingOverlay';
import styles from '../../Styles/Auth.module.css';

const DISPOSABLE_DOMAINS = [
    'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
    'fakeinbox.com', 'sharklasers.com', 'yopmail.com', 'maildrop.cc',
    'dispostable.com', 'trashmail.com', 'spamgourmet.com', 'spamgourmet.org',
    'spam4.me', 'getairmail.com', 'mailnull.com', 'spamcorpse.com',
    'mail-temporaire.fr', '10minutemail.com', 'tempinbox.com',
];

export default function SignUpPage() {

    const navigate = useNavigate();
    const { t, language } = useTranslation();

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        accept_terms: false,
    });

    const [errors, setErrors] = useState({});
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

        if (field === 'email' && errors.email) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.email;
                return newErrors;
            });
        }
    };

    const handleEmailBlur = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email) return;

        if (!emailRegex.test(form.email)) {
            setErrors(prev => ({ ...prev, email: t('email_invalid') }));
            return;
        }

        const domain = form.email.split('@')[1]?.toLowerCase();
        if (DISPOSABLE_DOMAINS.includes(domain)) {
            setErrors(prev => ({ ...prev, email: t('email_temporary_not_allowed') }));
            return;
        }
    };

    const toggleTerms = () => {
        setForm((prev) => ({ ...prev, accept_terms: !prev.accept_terms }));
    };

    const [pendingVerificationModal, setPendingVerificationModal] = useState({ show: false, email: '' });

    const Sign_up = async (e) => {
        e.preventDefault();
        
        // Final frontend check
        if (errors.email) return;
        if (passwordStrength === 'weak' || passwordStrength === null) {
            setErrors(prev => ({ ...prev, password: t('password_weak') }));
            return;
        }

        setErrors({});

        if (!form.accept_terms) {
            setErrors({ accept_terms: t('must_accept_terms') });
            return;
        }

        const payload = {
            email: form.email,
            phone: form.phone ? form.phone.replace(/\D/g, '') : null,
            password: form.password,
            password_confirmation: form.password_confirmation,
            full_name: form.full_name,
        };

        try {
            setProcessing(true);
            await signupUser(payload);
            navigate('/verify-email?status=pending&email=' + encodeURIComponent(form.email));
        } catch (err) {
            const responseErrors = err?.response?.data?.errors;
            
            // Check for pending registration conflict specifically
            const emailErrors = responseErrors?.email;
            if (Array.isArray(emailErrors) && emailErrors[0] === 'pending_verification') {
                setPendingVerificationModal({ show: true, email: form.email });
                return;
            }
            
            if (responseErrors) {
                const nextErrors = { ...responseErrors };
                const passwordErrors = Array.isArray(nextErrors.password) ? nextErrors.password : [];
                const confirmationMsg = passwordErrors.find((msg) =>
                    String(msg).toLowerCase().includes('confirmation')
                );

                if (confirmationMsg) {
                    nextErrors.password = passwordErrors.filter(
                        (msg) => String(msg).toLowerCase().includes('confirmation') === false
                    );
                    nextErrors.password_confirmation = [
                        ...(Array.isArray(nextErrors.password_confirmation) ? nextErrors.password_confirmation : []),
                        confirmationMsg,
                    ];
                }

                setErrors(nextErrors);
            } else {
                setErrors({ form: t('signup_failed') });
            }
        } finally {
            setProcessing(false);
        }
    };

    const closePendingModal = () => {
        setPendingVerificationModal({ show: false, email: '' });
    };

    const goToVerifyEmail = () => {
        const email = pendingVerificationModal.email;
        closePendingModal();
        navigate('/verify-email?status=pending&email=' + encodeURIComponent(email));
    };

    const strengthLabelClass = passwordStrength === 'weak' ? 'text-red-500' : (passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600');

    return (
        <>
            <LoadingOverlay isVisible={processing} message={t('signing_up')} />
            <AuthLayout
                subtitle={t('signup_title')}
                description={t('signup_description')}
                footerText={t('already_account')}
                footerLinkText={t('sign_in_link')}
                footerLinkTo="/login"
                onSubmit={Sign_up}
            >
                 <InputField
                    label={t('full_name')}
                    type="text"
                    placeholder={t('full_name_placeholder')}
                    id="signup-name"
                    var={form.full_name}
                    setVar={setField('full_name')}
                    error={Boolean(errors.full_name)}
                    errorMessage={errors.full_name}
                    required
                />

                <InputField
                    label={t('email')}
                    type="email"
                    placeholder={t('email_placeholder')}
                    id="signup-email"
                    var={form.email}
                    setVar={setField('email')}
                    onBlur={handleEmailBlur}
                    error={Boolean(errors.email)}
                    errorMessage={errors.email}
                    required
                />

                <InputField
                    label={t('phone_number')}
                    type="tel"
                    placeholder={t('phone_placeholder')}
                    id="signup-number"
                    var={form.phone}
                    setVar={setField('phone')}
                    error={Boolean(errors.phone)}
                    errorMessage={errors.phone}
                    required
                />

                <InputField
                    label={t('password')}
                    type="password"
                    placeholder={t('password_placeholder')}
                    id="signup-password"
                    var={form.password}
                    setVar={setField('password')}
                    error={Boolean(errors.password)}
                    errorMessage={errors.password}
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
                    label={t('confirm_password')}
                    type="password"
                    placeholder={t('confirm_password_placeholder')}
                    id="signup-password-confirmation"
                    var={form.password_confirmation}
                    setVar={setField('password_confirmation')}
                    error={Boolean(errors.password_confirmation)}
                    errorMessage={errors.password_confirmation}
                    required
                />

                <FormOptions
                    leftContent={<CheckboxInput label={<>{t('accept_terms')} <Link className={styles.authLink} to='/terms'>{t('terms_conditions')}</Link> {t('and')} <Link className={styles.authLink} to='/terms'>{t('privacy_policy')}</Link></>} id="remember" setCheck={toggleTerms} check={form.accept_terms} />}
                    rightContent=""
                />

                {errors.accept_terms && <p className={styles.fieldError}>{errors.accept_terms}</p>}
                {errors.form && <p className={styles.fieldError}>{errors.form}</p>}

                <ConnexionButton type="submit" variant="primary" disabled={processing || !form.accept_terms}>
                    {processing ? t('signing_up') : t('sign_up_btn')}
                </ConnexionButton>
            </AuthLayout>

            {/* Pending Verification Modal */}
            {pendingVerificationModal.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={closePendingModal}>
                    <div className="bg-gradient-to-br from-[#400106] to-[#260101] border border-[#f5d579]/30 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative animate-countUp" onClick={(e) => e.stopPropagation()}>
                        {/* Icon */}
                        <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                            </svg>
                        </div>

                        <h2 className="text-[#f5d579] font-bold text-xl mb-3">
                            {language === 'ar' ? 'البريد الإلكتروني قيد التحقق' : language === 'en' ? 'Email Pending Verification' : 'Email en cours de vérification'}
                        </h2>

                        <p className="text-white/70 text-sm leading-relaxed mb-6">
                            {t('pending_verification_msg') || "The email is getting verified. Wait 5 min if it is your email."}
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={goToVerifyEmail}
                                className="w-full py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-[#f5d579] to-[#d4af37] text-[#260101] shadow-lg shadow-[#f5d579]/10 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                            >
                                {t('go_to_verification') || 'Aller à la vérification'}
                            </button>
                            <button
                                onClick={closePendingModal}
                                className="w-full py-3 px-6 rounded-xl font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm"
                            >
                                {t('cancel') || 'Fermer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
