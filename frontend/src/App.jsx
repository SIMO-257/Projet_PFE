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
import RechargePayment from "./Pages/RechargePayment";

// Lazy pages

const Login = lazy(() => import("./Pages/Login"));
const SignUp = lazy(() => import("./Pages/SignUp"));
const VerifyEmail = lazy(() => import("./Pages/auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("./Pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./Pages/ResetPassword"));

const Home = lazy(() => import("./Pages/Home"));
const Wallet = lazy(() => import("./Pages/Wallet"));
const Profile = lazy(() => import("./Pages/Profile"));
const EditProfileScreen = lazy(() => import("./Pages/EditProfile"));
const Settings = lazy(() => import("./Pages/Settings"));
const HelpSupport = lazy(() => import("./Pages/HelpSupport"));
const Security = lazy(() => import("./Pages/Security"));

const MyTickets = lazy(() => import("./Pages/MyTickets"));
const AllTickets = lazy(() => import("./Pages/AllTickets"));
const TicketSelection = lazy(() => import("./Pages/TicketSelection"));
const ViewTicket = lazy(() => import("./Pages/ViewTicket"));
const Validation = lazy(() => import("./Pages/Validation"));
const ValidationSuccess = lazy(() => import("./Pages/ValidationSuccess"));
const ValidatorScreen = lazy(() => import("./Pages/Validator"));


const Paiment = lazy(() => import("./Pages/Paiment"));
const PurchasedCards = lazy(() => import("./Pages/PurchasedCards"));
const ConfirmationPaiment = lazy(() => import("./Pages/ConfirmationPaiment"));
const PaimentHistory = lazy(() => import("./Pages/PaimentHistory"));

const Notifications = lazy(() => import("./Pages/Notifications"));
const TermsAndConditions = lazy(() => import("./Pages/TermsAndConditions"));


// Admin Pages
const AdminLogin = lazy(() => import("./Pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./Pages/admin/AdminDashboard"));
const AdminClients = lazy(() => import("./Pages/admin/AdminClients"));
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
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot_password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* SHARED ROUTES (Both Public & Protected) */}
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfileScreen />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help-support" element={<HelpSupport />} />
            <Route path="/security" element={<Security />} />

            <Route path="/mytickets" element={<MyTickets />} />
            <Route path="/all-tickets" element={<AllTickets />} />
            <Route path="/ticket-selection" element={<TicketSelection />} />
            <Route path="/viewticket/:id" element={<ViewTicket />} />
            <Route path="/validation" element={<Validation />} />
            <Route path="/validation-success" element={<ValidationSuccess />} />
            <Route path="/validator" element={<ValidatorScreen />} />

            <Route path="/recharge-payment" element={<RechargePayment />} />
            <Route path="/change-card" element={<PurchasedCards />} />
            <Route path="/payment-confirmation" element={<ConfirmationPaiment />} />
            <Route path="/payment-history" element={<PaimentHistory />} />

            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin" element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="clients" element={<AdminClients />} />
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
