import { Link,Route,Routes } from 'react-router-dom';
// import { useForm } from '@inertiajs/react';

import InputField from '../../Components/Inputs/InputField';
import CheckboxInput from '../../Components/Inputs/CheckboxInput';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';
import SocialButton from '../../Components/Buttons/SocialButton';
import FormOptions from '../../Components/Form/FormOptions';
import ForgotPassword from '../ForgotPassword/ForgotPassword';
import SignUp from '../SignUp/SignUp';
import styles from '../../Styles/Auth.module.css'

const Login = () => {


    // const { data, setData, post, processing, errors } = useForm({
    //     login_email: '',
    //     login_password: '',
    //     remember_me: false,
    // });
 

    const Log_in = () =>{
        // post('/login')
    }

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
    <>
            <Routes>
                <Route path='/forgot_password' element={<ForgotPassword/>}/>
                <Route path='/create_acount' element={<SignUp/>}/>
            </Routes>
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

                <form className={styles.authForm} onSubmit={Log_in}>
                    <InputField
                        label="Email"
                        type="email"
                        placeholder="votre@email.com"
                        id="login-email"
                        var={data.login_email}
                        setVar={()=>setData('login_email',e.target.value)}
                        required
                    />

                    <InputField
                        label="Mot de passe"
                        type="password"
                        placeholder="********"
                        id="login-password"
                        var={data.login_password}
                        setVar={()=>setData('login_password',e.target.value)}
                        required
                    />
                  
                    <FormOptions
                        leftContent={<CheckboxInput label="Se souvenir" id="remember" setCheck={()=>setData('remember_me',!remember_me)} check={data.remember_me} />}
                        rightContent={<Link to="/forgot_password" className={styles.forgotPassword} >Mot de passe oublié?</Link>}
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
                        <Link to="/create_acount" className={styles.authLink}>Créer un compte</Link>
                    </p>
                </div>
            </div>
        </div>
    </>        
    );
};

export default Login;