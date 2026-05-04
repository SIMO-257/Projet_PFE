import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';


import InputField from '../../Components/Inputs/InputField';
import CheckboxInput from '../../Components/Inputs/CheckboxInput';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';
import FormOptions from '../../Components/Form/FormOptions';
import AuthLayout from '../../Components/Layout/AuthLayout';
import styles from '../../Styles/Auth.module.css';

export default function Login() {
    const navigate = useNavigate();
    const { login, isAuthenticated, error: authError, isLoading } = useAuth();

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
                const responseErrors = resultAction.payload?.errors || resultAction.payload?.data;
                if (responseErrors) {
                    if (responseErrors.email || responseErrors.password) {
                        const generic = 'Password or Email are not valid';
                        setErrors({ email: generic, password: generic });
                    } else {
                        setErrors(responseErrors);
                    }
                } else {
                    setErrors({ form: resultAction.payload?.message || 'Password or Email are not valid' });
                }
            }
        } catch (err) {
            setErrors({ form: 'An unexpected error occurred' });
        }
    };

    return (
        <AuthLayout
            subtitle="Bon retour"
            description="Connectez-vous pour accéder à votre expérience préférée."
            footerText="Pas encore membre?"
            footerLinkText="Créer un compte"
            footerLinkTo="/signup"
            onSubmit={Log_in}
        >
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
            {authError && !errors.form && <p className={styles.fieldError}>{authError.message || 'Authentication failed'}</p>}

            <ConnexionButton type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'Connexion...' : 'Connexion'}
            </ConnexionButton>
        </AuthLayout>

    );
}
