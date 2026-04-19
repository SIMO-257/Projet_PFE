import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { loginClient, setAuthToken } from '../../services/clientService';

import InputField from '../../Components/Inputs/InputField';
import CheckboxInput from '../../Components/Inputs/CheckboxInput';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';
import SocialButton from '../../Components/Buttons/SocialButton';
import FormOptions from '../../Components/Form/FormOptions';
import styles from '../../Styles/Auth.module.css'

export default function Login() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: '',
        password: '',
        remember_me: false,
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const setField = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const toggleRemember = () => {
        setForm((prev) => ({ ...prev, remember_me: !prev.remember_me }));
    };

    const Log_in = async (e) => {
        e.preventDefault();
        setErrors({});

        const payload = {
            email: form.email,
            password: form.password,
            remember_me: form.remember_me,
        };

        try {
            setProcessing(true);
            const res = await loginClient(payload);
            const token = res?.data?.token;
            const clientUuid = res?.data?.client_uuid;
            if (token) {
                setAuthToken(token, form.remember_me);
            }
            if (clientUuid) {
                sessionStorage.setItem('client_uuid', clientUuid);
            }
            navigate('/home');
        } catch (err) {
            const responseErrors = err?.response?.data?.errors;
            if (responseErrors) {
                if (responseErrors.email || responseErrors.password) {
                    const generic = 'Password or Email are not valid';
                    setErrors({ email: generic, password: generic });
                } else {
                    setErrors(responseErrors);
                }
            } else {
                setErrors({ form: 'Password or Email are not valid' });
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
    <><div className={styles.authContainer}>
            <div className={styles.authCard}>
                <header className={styles.authHeader}>
                    <h1 className={styles.authLogo}>CasaWay</h1>
                    <hr className={styles.goldenLine}/>
                    <h2 className={styles.authSubtitle}>Bon retour</h2>
                    <p className={styles.authDescription}>
                        Connectez-vous pour accéder à votre expérience préférée.
                    </p>
                </header>

                <form className={styles.authForm} onSubmit={Log_in}>
                    <InputField
                        label="Email"
                        type="email"
                        placeholder="votre@email.com"
                        id="login-email"
                        var={form.email}
                        setVar={setField('email')}
                        error={Boolean(errors.email)}
                        errorMessage={errors.email}
                        required
                    />

                    <InputField
                        label="Mot de passe"
                        type="password"
                        placeholder="********"
                        id="login-password"
                        var={form.password}
                        setVar={setField('password')}
                        error={Boolean(errors.password)}
                        errorMessage={errors.password}
                        required
                    />
                  
                    <FormOptions
                        leftContent={<CheckboxInput label="Se souvenir" id="remember" setCheck={toggleRemember} check={form.remember_me} />}
                        rightContent={<Link to="/forgot_password" className={styles.forgotPassword} >Mot de passe oublié?</Link>}
                    />

                    {errors.form && <p className={styles.fieldError}>{errors.form}</p>}

                    <ConnexionButton type="submit" variant="primary" disabled={processing}>
                        {processing ? 'Connexion...' : 'Connexion'}
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
                        Pas encore membre?{' '}
                        <Link to="/signup" className={styles.authLink}>Créer un compte</Link>
                    </p>
                </div>
            </div>
        </div>
    </>        
    );
}
