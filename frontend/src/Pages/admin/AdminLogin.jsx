import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin, clearAdminError } from '../../Redux/Slices/adminSlice';
import { useTranslation } from '../../hooks/useTranslation';

import InputField from '../../Components/Inputs/InputField';
import ConnexionButton from '../../Components/Buttons/ConnexionButton';
import FormOptions from '../../Components/Form/FormOptions';
import AuthLayout from '../../Components/Layout/AuthLayout';
import LoadingOverlay from '../../Components/UI/LoadingOverlay';
import styles from '../../Styles/Auth.module.css';

export default function AdminLogin() {
    const { t } = useTranslation();
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
                setErrors({ form: payload?.message || t('admin_login_error') });
            }
        }
    };

    return (
        <>
            <LoadingOverlay isVisible={loading} message={t('admin_connecting')} />
            <AuthLayout
                subtitle={t('admin_login_subtitle')}
                description={t('admin_login_desc')}
                footerText=""
                footerLinkText={t('admin_back_to_client')}
                footerLinkTo="/login"
                onSubmit={handleLogin}
            >
                <InputField
                    label={t('email')}
                    type="email"
                    placeholder={t('admin_email_placeholder')}
                    id="admin-email"
                    var={form.email}
                    setVar={setField('email')}
                    error={Boolean(errors.email)}
                    errorMessage={errors.email}
                    required
                />

                <InputField
                    label={t('password')}
                    type="password"
                    placeholder="********"
                    id="admin-password"
                    var={form.password}
                    setVar={setField('password')}
                    error={Boolean(errors.password)}
                    errorMessage={errors.password}
                    required
                />

                <FormOptions
                    rightContent={
                        <span className="text-white/40 text-xs select-none">
                            {t('admin_forgot_password_note')}
                        </span>
                    }
                />

                {errors.form && <p className={styles.fieldError}>{errors.form}</p>}
                {adminError && !errors.form && <p className={styles.fieldError}>{adminError.message || t('admin_auth_failed')}</p>}

                <ConnexionButton type="submit" variant="primary" disabled={loading}>
                    {loading ? t('admin_connecting') : t('admin_connect_btn')}
                </ConnexionButton>
            </AuthLayout>
        </>
    );
}
