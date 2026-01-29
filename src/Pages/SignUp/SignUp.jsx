import React from 'react';
import InputField from '../../Components/Inputs/InputField';
import PasswordInput from '../../Components/Inputs/PasswordInput';
import CheckboxInput from '../../Components/Inputs/CheckboxInput';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';
import SocialButton from '../../Components/Buttons/SocialButton';
import FormOptions from '../../Components/Form/FormOptions';
import styles from './SignUp.module.css';

const SignUp = () => {
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
                    <h2 className={styles.authSubtitle}>Créer un Compte</h2>
                    <p className={styles.authDescription}>
Rejoinier l'expérience premium du mobile intelligent
                    </p>
                </header>

                <form className={styles.authForm} onSubmit={handleLogin}>

                     <InputField
                        label="Nom Complet"
                        type="text"
                        placeholder="Entrez votre nom complet"
                        id="signup-name"
                        required
                    />

                    <InputField
                        label="Email"
                        type="email"
                        placeholder="votre@email.com"
                        id="signup-email"
                        required
                    />

                    <InputField
                        label="Téléphone"
                        type="number"
                        placeholder="+121 6 12 34 56 78"
                        id="signup-number"
                        required
                    />

                    <PasswordInput
                        label="Mot de passe"
                        placeholder="********"
                        id="signup-password"
                        required
                    />

                    <FormOptions
                        leftContent={<CheckboxInput label={<>Jaccept les <a className={styles.authLink} href='#'>Conditions d'utilisation</a> et <a className={styles.authLink} href='#'>Politique de Confidentialité</a></>} id="remember" />}
                        rightContent=""
                    />

                    <ConnexionButton type="submit" variant="primary">
                        Inscription
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
                        <a href="/signup" className={styles.authLink}>Se connecter</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;