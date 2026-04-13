import { Link } from 'react-router-dom';
import { useState } from 'react';
import { forgotPasswordClient } from '../../services/clientService';

import InputField from '../../Components/Inputs/InputField';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';
<<<<<<< HEAD
import styles from '../../Styles/Auth.module.css';

export default function ForgotPassword() {
    const apiBase = import.meta.env.VITE_API_URL ?? '';
=======

import styles from '../../Styles/Auth.module.css';

export default function ForgotPassword() {

>>>>>>> e8d880d9d20a6edd5c690a616ba45c0c8739c87c
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
<<<<<<< HEAD
            const res = await axios.post(`${apiBase}/api/forgot-password`, { email: form.email }, { withCredentials: false });
            setStatus(res?.data?.message || 'Si le compte existe, un lien de réinitialisation a été envoyé.');
=======
            const res = await forgotPasswordClient({ email: form.email });
            setStatus(res?.data?.message || 'If the account exists, a password has been sent to the email.');
>>>>>>> e8d880d9d20a6edd5c690a616ba45c0c8739c87c
        } catch (err) {
            const responseErrors = err?.response?.data?.errors;
            if (responseErrors) {
                setErrors(responseErrors);
            } else {
                setErrors({ form: 'Échec de l\'envoi. Veuillez réessayer.' });
            }
        } finally {
            setProcessing(false);
        }
    }

<<<<<<< HEAD
    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <header className={styles.authHeader}>
                    <h1 className={styles.authLogo}>CasaWay</h1>
                    <hr className={styles.goldenLine} />
=======
     return (
    <>

            <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <header className={styles.authHeader}>
                    <h1 className={styles.authLogo}>CasaWay</h1>
                    <hr className={styles.goldenLine}/>
                </header>
                <div className={styles.authCard}>
                <header className={styles.authHeader}>

>>>>>>> e8d880d9d20a6edd5c690a616ba45c0c8739c87c
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
                        var={form.email}
                        setVar={setField('email')}
                        required
                    />

                    {errors.form && <p className="text-red-500 text-xs mb-4">{errors.form}</p>}
                    {status && <p className="text-green-500 text-xs mb-4">{status}</p>}

                    <ConnexionButton type="submit" variant="primary" disabled={processing}>
                        {processing ? 'Envoi...' : 'Réinitialiser'}
                    </ConnexionButton>
                </form>

                <div className={styles.authFooter}>
                    <p>
                        Vous vous souvenez de votre mot de passe ?{' '}
                        <Link to="/login" className={styles.authLink}>Se connecter</Link>
                    </p>
<<<<<<< HEAD
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100">
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
=======
>>>>>>> e8d880d9d20a6edd5c690a616ba45c0c8739c87c
                </div>
                </div>
                <br />
                <div className={styles.authCard}>
                <h6 className={styles.authSubtitle}>Besoin d'aide ?</h6>
                    <p className={styles.authDescription}>
                      Notre équipe support est disponible 24h/7j pour vous assister                 
                    </p>
                <div className={styles.authFooter}>
                        <a href="#" className={styles.forgotPassword}>
                            <b>Appel</b>
                        </a>
                        <a href="#" className={styles.forgotPassword}>
                            <b>Chat</b>
                        </a>
                </div>
                </div>


                

              
            </div>
        </div>
<<<<<<< HEAD
=======
    </>        
>>>>>>> e8d880d9d20a6edd5c690a616ba45c0c8739c87c
    );
 


}
