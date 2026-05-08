import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import PublicRoute from "./Components/Layout/PublicRoute";
import ProtectedRoute from "./Components/Layout/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

// Lazy pages
const Login = lazy(() => import("./Pages/Login/Login"));
const SignUp = lazy(() => import("./Pages/SignUp/SignUp"));
const ForgotPassword = lazy(() => import("./Pages/ForgotPassword/ForgotPassword"));
const ResetPassword = lazy(() => import("./Pages/ResetPassword/ResetPassword"));

const HomeScreen = lazy(() => import("./Pages/Home/HomeScreen"));
const WalletScreen = lazy(() => import("./Pages/WalletScreen/WalletScreen"));
const ProfileScreen = lazy(() => import("./Pages/ProfileScreen/ProfileScreen"));
const EditProfileScreen = lazy(() => import("./Pages/EditProfile/EditProfile"));
const SettingsScreen = lazy(() => import("./Pages/Settings/SettingsScreen"));
const HelpSupportScreen = lazy(() => import("./Pages/HelpSupport/HelpSupportScreen"));
const SecurityScreen = lazy(() => import("./Pages/SecurityScreen/SecurityScreen"));

const MyTickets = lazy(() => import("./Pages/MyTickets/MyTickets"));
const TicketSelection = lazy(() => import("./Pages/TicketSelection/TicketSelection"));
const ViewTicket = lazy(() => import("./Pages/ViewTicket/ViewTicket"));
const ValidationScreen = lazy(() => import("./Pages/ValidationScreen/ValidationScreen"));

const Paiment = lazy(() => import("./Pages/Paiment/Paiment"));
const RechargePaymentScreen = lazy(() => import("./Pages/RechargePaymentScreen/RechargePaymentScreen"));
const PurchasedCards = lazy(() => import("./Pages/PurchasedCards/PurchasedCards"));
const ConfirmationPaiment = lazy(() => import("./Pages/ConfirmationPaiment/ConfirmationPaiment"));
const PaimentHistory = lazy(() => import("./Pages/PaimentHistory/PaimentHistory"));

const Notifications = lazy(() => import("./Pages/Notifications/Notifications"));
const OfflineMode = lazy(() => import("./Pages/OfflineMode/OfflineMode"));

function RootRedirect() {
  const { isAuthenticated, isAuthChecked, isLoading } = useAuth();

  if (!isAuthChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0507] text-white">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
}

function App() {
  const { refreshProfile, isAuthChecked } = useAuth();
  const language = useSelector((state) => state.settings?.language || 'fr');

  useEffect(() => {
    if (!isAuthChecked) {
      refreshProfile();
    }
  }, [isAuthChecked, refreshProfile]);

  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    document.body.dir = dir;
  }, [language]);

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#1a0507] text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-500"></div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot_password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/wallet" element={<WalletScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/edit-profile" element={<EditProfileScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/help-support" element={<HelpSupportScreen />} />
            <Route path="/security" element={<SecurityScreen />} />

            <Route path="/mytickets" element={<MyTickets />} />
            <Route path="/ticket-selection" element={<TicketSelection />} />
            <Route path="/viewticket/:id" element={<ViewTicket />} />
            <Route path="/validation" element={<ValidationScreen />} />

            <Route path="/payment" element={<Paiment />} />
            <Route path="/recharge-payment" element={<RechargePaymentScreen />} />
            <Route path="/change-card" element={<PurchasedCards />} />
            <Route path="/payment-confirmation" element={<ConfirmationPaiment />} />
            <Route path="/payment-history" element={<PaimentHistory />} />

            <Route path="/notifications" element={<Notifications />} />
            <Route path="/offline" element={<OfflineMode />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
