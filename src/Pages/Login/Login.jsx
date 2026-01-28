import React from 'react';
import InputField from '../../Components/Inputs/InputField';
import PasswordInput from '../../Components/Inputs/PasswordInput';
import CheckboxInput from '../../Components/Inputs/CheckboxInput';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';
import SocialButton from '../../Components/Buttons/SocialButton';
import FormOptions from '../../Components/Form/FormOptions';
import styles from './Login.module.css'

const Login = () => {
    const handleLogin = (e) => {
        e.preventDefault();
        console.log('Login submitted');
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
                    <h2 className={styles.authSubtitle}>Bon retour</h2>
                    <p className={styles.authDescription}>
                        Connectez-vous pour accéder à votre expérience préférée.
                    </p>
                </header>

                <form className={styles.authForm} onSubmit={handleLogin}>
                    <InputField
                        label="Email"
                        type="email"
                        placeholder="votre@email.com"
                        id="login-email"
                        required
                    />

                    <PasswordInput
                        label="Mot de passe"
                        placeholder="********"
                        id="login-password"
                        required
                    />

                    <FormOptions
                        leftContent={<CheckboxInput label="Se souvenir" id="remember" />}
                        rightContent={<a href="#" className={styles.forgotPassword}>Mot de passe oublié?</a>}
                    />

                    <ConnexionButton type="submit" variant="primary">
                        Connexion
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
                        <a href="/signup" className={styles.authLink}>Créer un compte</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;