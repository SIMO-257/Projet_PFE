import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin, clearAdminError } from '../../Redux/Slices/adminSlice';

import InputField from '../../Components/Inputs/InputField';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';
import AuthLayout from '../../Components/Layout/AuthLayout';
import styles from '../../Styles/Auth.module.css';

export default function AdminLogin() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, error: adminError, loading } = useSelector((state) => state.admin);

    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin/dashboard');
        }
        return () => {
            dispatch(clearAdminError());
        };
    }, [isAuthenticated, navigate, dispatch]);

    const setField = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrors({});

        const resultAction = await dispatch(loginAdmin(form));
        if (loginAdmin.rejected.match(resultAction)) {
            const payload = resultAction.payload;
            if (payload?.errors) {
                setErrors(payload.errors);
            } else {
                setErrors({ form: payload?.message || 'Identifiants incorrects.' });
            }
        }
    };

    return (
        <AuthLayout
            subtitle="Administration CasaWay"
            description="Espace réservé aux administrateurs."
            onSubmit={handleLogin}
        >
            <InputField
                label="Email"
                type="email"
                placeholder="admin@casaway.ma"
                id="admin-email"
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
                id="admin-password"
                var={form.password}
                setVar={setField('password')}
                error={Boolean(errors.password)}
                errorMessage={errors.password}
                required
            />

            {errors.form && <p className={styles.fieldError}>{errors.form}</p>}
            {adminError && !errors.form && <p className={styles.fieldError}>{adminError.message || 'Authentication failed'}</p>}

            <ConnexionButton type="submit" variant="primary" disabled={loading}>
                {loading ? 'Connexion...' : 'Connexion'}
            </ConnexionButton>
        </AuthLayout>
    );
}
