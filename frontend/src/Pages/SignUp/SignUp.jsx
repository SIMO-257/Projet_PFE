import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { signupClient } from '../../services/clientService';

import InputField from '../../Components/Inputs/InputField';
import CheckboxInput from '../../Components/Inputs/CheckboxInput';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';
import FormOptions from '../../Components/Form/FormOptions';
import AuthLayout from '../../Components/Layout/AuthLayout';
import styles from '../../Styles/Auth.module.css';

const DISPOSABLE_DOMAINS = [
    'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
    'fakeinbox.com', 'sharklasers.com', 'yopmail.com', 'maildrop.cc',
    'dispostable.com', 'trashmail.com', 'spamgourmet.com', 'spamgourmet.org',
    'spam4.me', 'getairmail.com', 'mailnull.com', 'spamcorpse.com',
    'mail-temporaire.fr', '10minutemail.com', 'tempinbox.com',
];

export default function SignUp() {

    const navigate = useNavigate();

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
            setErrors(prev => ({ ...prev, email: 'Adresse email invalide.' }));
            return;
        }

        const domain = form.email.split('@')[1]?.toLowerCase();
        if (DISPOSABLE_DOMAINS.includes(domain)) {
            setErrors(prev => ({ ...prev, email: 'Adresse email temporaire non autorisée.' }));
            return;
        }
    };

    const toggleTerms = () => {
        setForm((prev) => ({ ...prev, accept_terms: !prev.accept_terms }));
    };

    const Sign_up = async (e) => {
        e.preventDefault();
        
        // Final frontend check
        if (errors.email) return;
        if (passwordStrength === 'weak' || passwordStrength === null) {
            setErrors(prev => ({ ...prev, password: 'Le mot de passe est trop faible.' }));
            return;
        }

        setErrors({});

        if (!form.accept_terms) {
            setErrors({ accept_terms: 'Vous devez accepter les conditions.' });
            return;
        }

        const fullName = form.full_name || '';
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts.shift() || null;
        const lastName = nameParts.length ? nameParts.join(' ') : null;

        const payload = {
            email: form.email,
            phone: form.phone || null,
            password: form.password,
            password_confirmation: form.password_confirmation,
            full_name: form.full_name,
            first_name: firstName,
            last_name: lastName,
        };

        try {
            setProcessing(true);
            await signupClient(payload);
            navigate('/login');
        } catch (err) {
            const responseErrors = err?.response?.data?.errors;
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
                setErrors({ form: "Inscription echouee. Reessayez." });
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthLayout
            subtitle="Creer un Compte"
            description="Rejoignez l'experience premium du mobile intelligent"
            footerText="Deja un compte?"
            footerLinkText="Se connecter"
            footerLinkTo="/login"
            onSubmit={Sign_up}
        >
             <InputField
                label="Nom Complet"
                type="text"
                placeholder="Entrez votre nom complet"
                id="signup-name"
                var={form.full_name}
                setVar={setField('full_name')}
                error={Boolean(errors.full_name)}
                errorMessage={errors.full_name}
                required
            />

            <InputField
                label="Email"
                type="email"
                placeholder="votre@email.com"
                id="signup-email"
                var={form.email}
                setVar={setField('email')}
                onBlur={handleEmailBlur}
                error={Boolean(errors.email)}
                errorMessage={errors.email}
                required
            />

            <InputField
                label="Telephone"
                type="number"
                placeholder="06 12 34 56 78"
                id="signup-number"
                var={form.phone}
                setVar={setField('phone')}
                error={Boolean(errors.phone)}
                errorMessage={errors.phone}
                required
            />

            <InputField
                label="Mot de passe"
                type="password"
                placeholder="********"
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
                    <p className={`text-[10px] font-medium uppercase tracking-wider ${passwordStrength === 'weak' ? 'text-red-500' : (passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600')}`}>
                        Force: {passwordStrength === 'weak' ? 'Faible' : (passwordStrength === 'medium' ? 'Moyenne' : 'Forte')}
                    </p>
                </div>
            )}

            {/* Password Rules */}
            {form.password && (
                <div className="mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">Exigences:</p>
                    <ul className="space-y-1">
                        <li className={`flex items-center gap-2 text-[11px] ${form.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-1 h-1 rounded-full ${form.password.length >= 8 ? 'bg-green-600' : 'bg-gray-300'}`} />
                            Au moins 8 caractères
                        </li>
                        <li className={`flex items-center gap-2 text-[11px] ${/[A-Z]/.test(form.password) && /[a-z]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(form.password) && /[a-z]/.test(form.password) ? 'bg-green-600' : 'bg-gray-300'}`} />
                            Majuscules & minuscules
                        </li>
                        <li className={`flex items-center gap-2 text-[11px] ${/[0-9]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(form.password) ? 'bg-green-600' : 'bg-gray-300'}`} />
                            Au moins un chiffre
                        </li>
                        <li className={`flex items-center gap-2 text-[11px] ${/[^A-Za-z0-9]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(form.password) ? 'bg-green-600' : 'bg-gray-300'}`} />
                            Un caractère spécial
                        </li>
                    </ul>
                </div>
            )}

            <InputField
                label="Confirmer le mot de passe"
                type="password"
                placeholder="********"
                id="signup-password-confirmation"
                var={form.password_confirmation}
                setVar={setField('password_confirmation')}
                error={Boolean(errors.password_confirmation)}
                errorMessage={errors.password_confirmation}
                required
            />

            <FormOptions
                leftContent={<CheckboxInput label={<>J'accepte les <a className={styles.authLink} href='#'>Conditions d'utilisation</a> et <a className={styles.authLink} href='#'>Politique de Confidentialite</a></>} id="remember" setCheck={toggleTerms} check={form.accept_terms} />}
                rightContent=""
            />

            {errors.accept_terms && <p className={styles.fieldError}>{errors.accept_terms}</p>}
            {errors.form && <p className={styles.fieldError}>{errors.form}</p>}

            <ConnexionButton type="submit" variant="primary" disabled={processing || !form.accept_terms}>
                {processing ? 'Inscription...' : 'Inscription'}
            </ConnexionButton>
        </AuthLayout>
    );
}
