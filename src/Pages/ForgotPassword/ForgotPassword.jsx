// import { useForm } from '@inertiajs/react';
import { Link,Route,Routes } from 'react-router-dom';

import InputField from '../../Components/Inputs/InputField';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';

import Login from '../Login/Login';
import styles from '../../Styles/Auth.module.css';

export default function ForgotPassword() {


    // const { data, setData, post, processing, errors } = useForm({
    // email: '', 
    // });

    const Send_Password = () =>{
        // post('/forgotpassword')
    }

     return (
    <>
            <Routes>
                <Route path='/seconnecter' element={<Login/>}/>
            </Routes>
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
                        un lien pourréinitialiser votre mot de passe                   
                    </p><br />
                <form className={styles.authForm} onSubmit={Send_Password}>

                    <InputField
                        label="Email"
                        type="email"
                        placeholder="votre@email.com"
                        id="login-email"
                        var={/* data.email */''}
                        setVar={/* ()=>setData('email',e.target.value) */''}
                        required
                    />

                

                    <ConnexionButton type="submit" variant="primary">
                        Réinitialiser
                    </ConnexionButton>

                </form>
             
                <div className={styles.authFooter}>
                    <p>
                        Vous vous souvenez de votre mot de passe ?{' '}
                        <Link to="/seconnecter" className={styles.authLink}>Se connecter</Link>
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
