import { Link,Route,Routes } from 'react-router-dom';
// import { useForm } from '@inertiajs/react';

import InputField from '../../Components/Inputs/InputField';
import PasswordInput from '../../Components/Inputs/PasswordInput';
import CheckboxInput from '../../Components/Inputs/CheckboxInput';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';
import SocialButton from '../../Components/Buttons/SocialButton';
import FormOptions from '../../Components/Form/FormOptions';
import Login from '../Login/Login';
import styles from '../../Styles/Auth.module.css';

const SignUp = () => {


    const { data, setData, post, processing, errors } = useForm({
        signup_name: '',
        signup_email: '',
        signup_password: '',
        signup_number : '',
        accecpte_cond: false,
    });
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

    const Sign_up = () =>{
        // post('/signup')
    }



    return (
        <>
            <Routes>
                <Route path='/login' element={<Login/>}/>
            </Routes>
        
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
                        var={data.signup_name}
                        setVar={()=>setData('signup_name',e.target.value)}
                        required
                    />

                    <InputField
                        label="Email"
                        type="email"
                        placeholder="votre@email.com"
                        id="signup-email"
                        var={data.signup_email}
                        setVar={()=>setData('signup_email',e.target.value)}                        
                        required
                    />

                    <InputField
                        label="Téléphone"
                        type="number"
                        placeholder="+121 6 12 34 56 78"
                        id="signup-number"
                        var={data.signup_number}
                        setVar={()=>setData('signup_number',e.target.value)}
                        required
                    />

                    <InputField
                        label="Mot de passe"
                        type="password"
                        placeholder="********"
                        id="signup-password"
                        var={data.signup_password}
                        setVar={()=>setData('signup_password',e.target.value)}
                        required
                    />

                    <FormOptions
                        leftContent={<CheckboxInput  label={<>Jaccept les <a className={styles.authLink} href='#'>Conditions d'utilisation</a> et <a className={styles.authLink} href='#'>Politique de Confidentialité</a></>} id="remember" setCheck={()=>setData('accepte_cond',!accecpte_cond)} check={data.accecpte_cond} />}
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
                        <Link to="/login" className={styles.authLink}>Se connecter</Link>
                    </p>
                </div>
            </div>
        </div>
    </>
    );
};

export default SignUp;