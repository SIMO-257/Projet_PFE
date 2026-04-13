import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { signupClient } from '../../services/clientService';

import InputField from '../../Components/Inputs/InputField';
import CheckboxInput from '../../Components/Inputs/CheckboxInput';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';
import SocialButton from '../../Components/Buttons/SocialButton';
import FormOptions from '../../Components/Form/FormOptions';
import styles from '../../Styles/Auth.module.css';

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

    const setField = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const toggleTerms = () => {
        setForm((prev) => ({ ...prev, accept_terms: !prev.accept_terms }));
    };

    const Sign_up = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!form.accept_terms) {
            setErrors({ accept_terms: 'Vous devez accepter les conditions.' });
            return;
        }

        const nameParts = form.full_name.trim().split(/\s+/);
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
            const res = await signupClient(payload);
            const redirectTo = res?.data?.redirect;
            if (redirectTo) {
                navigate(redirectTo);
            }
        } catch (err) {
            const responseErrors = err?.response?.data?.errors;
            if (responseErrors) {
                setErrors(responseErrors);
            } else {
                setErrors({ form: "Inscription échouée. Réessayez." });
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleGoogleLogin = () => {
        console.log('Google login');
    };

    const handleAppleLogin = () => {
        console.log('Apple login');
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <header className={styles.authHeader}>
                    <h1 className={styles.authLogo}>CasaWay</h1>
                    <hr className={styles.goldenLine}/>
                    <h2 className={styles.authSubtitle}>Créer un Compte</h2>
                    <p className={styles.authDescription}>
Rejoinier l'expérience premium du mobile intelligent
                    </p>
                </header>

                <form className={styles.authForm} onSubmit={Sign_up}>

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
                        error={Boolean(errors.email)}                        
                        errorMessage={errors.email}                        
                        required
                    />

                    <InputField
                        label="Téléphone"
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
                        leftContent={<CheckboxInput  label={<>Jaccept les <a className={styles.authLink} href='#'>Conditions d'utilisation</a> et <a className={styles.authLink} href='#'>Politique de Confidentialité</a></>} id="remember" setCheck={toggleTerms} check={form.accept_terms} />}
                        rightContent=""
                    />

                    {errors.accept_terms && <p className={styles.fieldError}>{errors.accept_terms}</p>}
                    {errors.form && <p className={styles.fieldError}>{errors.form}</p>}

                    <ConnexionButton type="submit" variant="primary" disabled={processing}>
                        {processing ? 'Inscription...' : 'Inscription'}
                    </ConnexionButton>
                </form>

                <div className={styles.divider}>
                    <span>ou</span>
                </div>

                <div className={styles.socialButtons}>
                    <SocialButton
                        provider="google"
                        icon="G"
                        onClick={handleGoogleLogin}
                    >
                        Continuer avec Google
                    </SocialButton>
                    <SocialButton
                        provider="apple"
                        onClick={handleAppleLogin}
                    >
                        Continuer avec Apple
                    </SocialButton>
                </div>

                <div className={styles.authFooter}>
                    <p>
                        Déja un compte?{' '}
                        <Link to="/login" className={styles.authLink}>Se connecter</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
