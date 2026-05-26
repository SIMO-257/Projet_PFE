import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import PublicRoute from "./Components/Layout/PublicRoute";
import ProtectedRoute from "./Components/Layout/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import { markAuthCheckedUnauthenticated } from "./Redux/Slices/AuthSlice";
import { shouldRestoreAuthSession } from "./services/clientService";

import GlobalPageLoader from "./Components/UI/GlobalPageLoader";
import LoadingOverlay from "./Components/UI/LoadingOverlay";
import { setRouteLoading } from "./Redux/Slices/uiSlice";
import RechargePaymentPage from "./Pages/payment/RechargePaymentPage";

// Lazy pages - Auth
const LoginPage = lazy(() => import("./Pages/auth/LoginPage"));
const SignUpPage = lazy(() => import("./Pages/auth/SignUpPage"));
const VerifyEmailPage = lazy(() => import("./Pages/auth/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("./Pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./Pages/auth/ResetPasswordPage"));

// Lazy pages - Home
const HomePage = lazy(() => import("./Pages/home/HomePage"));

// Lazy pages - Profile
const ProfilePage = lazy(() => import("./Pages/profile/ProfilePage"));
const EditProfilePage = lazy(() => import("./Pages/profile/EditProfilePage"));
const SettingsPage = lazy(() => import("./Pages/profile/SettingsPage"));
const HelpSupportPage = lazy(() => import("./Pages/profile/HelpSupportPage"));
const SecurityPage = lazy(() => import("./Pages/profile/SecurityPage"));

// Lazy pages - Tickets
const MyTicketsPage = lazy(() => import("./Pages/tickets/MyTicketsPage"));
const TicketsHistoryPage = lazy(() => import("./Pages/tickets/TicketsHistoryPage"));
const TicketSelectionPage = lazy(() => import("./Pages/tickets/TicketSelectionPage"));
const TicketDetailPage = lazy(() => import("./Pages/tickets/TicketDetailPage"));

// Lazy pages - Validation
const ValidationPage = lazy(() => import("./Pages/validation/ValidationPage"));
const ValidationSuccessPage = lazy(() => import("./Pages/validation/ValidationSuccessPage"));
const ValidatorPage = lazy(() => import("./Pages/validation/ValidatorPage"));

// Lazy pages - Payment
const PaymentPage = lazy(() => import("./Pages/payment/PaymentPage"));
const ChangeDefaultCardPage = lazy(() => import("./Pages/payment/ChangeDefaultCardPage"));
const PaymentConfirmationPage = lazy(() => import("./Pages/payment/PaymentConfirmationPage"));
const PaymentHistoryPage = lazy(() => import("./Pages/payment/PaymentHistoryPage"));
const WalletPage = lazy(() => import("./Pages/payment/WalletPage"));

// Lazy pages - Notifications & Info
const NotificationsPage = lazy(() => import("./Pages/notifications/NotificationsPage"));
const TermsPage = lazy(() => import("./Pages/info/TermsPage"));

// Admin Pages
const AdminLogin = lazy(() => import("./Pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./Pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./Pages/admin/AdminUsers"));
const AdminTickets = lazy(() => import("./Pages/admin/AdminTickets"));
const AdminTransactions = lazy(() => import("./Pages/admin/AdminTransactions"));
const AdminNotifications = lazy(() => import("./Pages/admin/AdminNotifications"));
const AdminProfile = lazy(() => import("./Pages/admin/AdminProfile"));

// Admin Components
import AdminGuard from './Components/guards/AdminGuard';
import AdminLayout from './Components/admin/AdminLayout';

function RootRedirect() {
  const { isAuthenticated, isAuthChecked, isLoading } = useAuth();

  // Wait until we have a definitive answer from the backend
  if (!isAuthChecked || isLoading) {
    return <GlobalPageLoader />;
  }

  // If we checked and user is NOT authenticated, they MUST see login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, go to home
  return <Navigate to="/home" replace />;
}

import { useLocation } from "react-router-dom";

function RouteWatcher() {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setRouteLoading(true));
    const timer = setTimeout(() => {
      dispatch(setRouteLoading(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [location.pathname, dispatch]);

  return null;
}

function App() {
  const dispatch = useDispatch();
  const { refreshProfile, isAuthChecked } = useAuth();
  const theme = useSelector((state) => state.settings.theme);
  const language = useSelector((state) => state.settings.language);
  const { isGlobalLoading, isRouteLoading } = useSelector((state) => state.ui || { isGlobalLoading: false, isRouteLoading: false });

  useEffect(() => {
    if (isAuthChecked) {
      return;
    }

    // Check if current path is an admin path
    const isAdminPath = window.location.pathname.startsWith('/admin');

    if (shouldRestoreAuthSession() && !isAdminPath) {
      refreshProfile();
    } else {
      dispatch(markAuthCheckedUnauthenticated());
    }
  }, [dispatch, isAuthChecked, refreshProfile]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Set document direction based on language (RTL for Arabic, LTR for others)
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <BrowserRouter>
      <RouteWatcher />
      <LoadingOverlay isVisible={isGlobalLoading || isRouteLoading} message={isGlobalLoading ? "Sécurisation de la transaction..." : "Chargement..."} />
      <Suspense fallback={<GlobalPageLoader />}>
        <Routes>

          {/* Default route */}
          <Route path="/" element={<RootRedirect />} />

          {/* PUBLIC ROUTES */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* SHARED ROUTES (Both Public & Protected) */}
          <Route path="/terms" element={<TermsPage />} />

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help-support" element={<HelpSupportPage />} />
            <Route path="/security" element={<SecurityPage />} />

            <Route path="/my-tickets" element={<MyTicketsPage />} />
            <Route path="/tickets-history" element={<TicketsHistoryPage />} />
            <Route path="/ticket-selection" element={<TicketSelectionPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/validation" element={<ValidationPage />} />
            <Route path="/validation-success" element={<ValidationSuccessPage />} />
            <Route path="/validator" element={<ValidatorPage />} />

            <Route path="/recharge-payment" element={<RechargePaymentPage />} />
            <Route path="/change-default-card" element={<ChangeDefaultCardPage />} />
            <Route path="/payment-confirmation" element={<PaymentConfirmationPage />} />
            <Route path="/payment-history" element={<PaymentHistoryPage />} />

            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin" element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="profil" element={<AdminProfile />} />
            </Route>
          </Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
