import { Link, Route, Routes } from 'react-router-dom';
import InputField from '../../Components/Inputs/InputField';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';
import Login from '../Login/Login';
import styles from '../../Styles/Auth.module.css';

export default function ForgotPassword() {

    const Send_Password = (e) => {
        e.preventDefault();
        // logic for sending password reset link
    }

    return (
        <>
            <Routes>
                <Route path='/seconnecter' element={<Login />} />
            </Routes>
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <header className={styles.authHeader}>
                        <h1 className={styles.authLogo}>CasaWay</h1>
                        <hr className={styles.goldenLine} />
                    </header>

                    <div className="mb-8">
                        <h2 className={styles.authSubtitle}>Mot de passe oublié</h2>
                        <p className={styles.authDescription}>
                            Entrez votre adresse e-mail et nous vous enverrons
                            un lien pour réinitialiser votre mot de passe.
                        </p>
                    </div>

                    <form className={styles.authForm} onSubmit={Send_Password}>
                        <InputField
                            label="Email"
                            type="email"
                            placeholder="votre@email.com"
                            id="login-email"
                            var={''}
                            setVar={() => {}}
                            required
                        />

                        <ConnexionButton type="submit" variant="primary">
                            Réinitialiser
                        </ConnexionButton>
                    </form>

                    <div className={styles.authFooter}>
                        <p>
                            Vous vous souvenez de votre mot de passe ?{' '}
                            <Link to="/login" className={styles.authLink}>Se connecter</Link>
                        </p>
                    </div>

                    <div className="mt-10 pt-6 border-t border-white/10">
                        <h3 className={`${styles.authSubtitle} !text-lg !mb-2 text-center`}>Besoin d'aide ?</h3>
                        <p className={`${styles.authDescription} text-center mb-4`}>
                            Notre équipe support est disponible 24h/7j pour vous assister.
                        </p>
                        <div className="flex justify-center space-x-6">
                            <a href="#" className={styles.forgotPassword}>
                                <strong>Appel</strong>
                            </a>
                            <a href="#" className={styles.forgotPassword}>
                                <strong>Chat</strong>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
