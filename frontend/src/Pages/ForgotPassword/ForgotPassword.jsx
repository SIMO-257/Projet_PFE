import { Link, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

import InputField from '../../Components/Inputs/InputField';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';

import Login from '../Login/Login';
import styles from '../../Styles/Auth.module.css';

export default function ForgotPassword() {


    const apiBase = import.meta.env.VITE_API_URL ?? '';
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
            const res = await axios.post(`${apiBase}/api/forgot-password`, { email: form.email }, { withCredentials: false });
            setStatus(res?.data?.message || 'If the account exists, a password has been sent to the email.');
        } catch (err) {
            const responseErrors = err?.response?.data?.errors;
            if (responseErrors) {
                setErrors(responseErrors);
            } else {
                setErrors({ form: 'Failed to send email. Please try again.' });
            }
        } finally {
            setProcessing(false);
        }
    }

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

                </header>
                    <h2 className={styles.authSubtitle}>Mot de passe oublié</h2>
                    <p className={styles.authDescription}>
                        Entrez votre adresse e-mail et nous vous enverrons
                        un lien pour{processing ? 'Envoi...' : 'Réinitialiser'} votre mot de passe                   
                    </p><br />
                <form className={styles.authForm} onSubmit={Send_Password}>

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

                    {errors.form && <p className={styles.fieldError}>{errors.form}</p>}
                    {status && <p className={styles.authDescription}>{status}</p>}

                    <ConnexionButton type="submit" variant="primary" disabled={processing}>
                        {processing ? 'Envoi...' : 'Réinitialiser'}
                    </ConnexionButton>

                </form>
             
                <div className={styles.authFooter}>
                    <p>
                        Vous vous souvenez de votre mot de passe ?{' '}
                        <Link to="/login" className={styles.authLink}>Se connecter</Link>
                    </p>
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
    </>        
    );
 


}
