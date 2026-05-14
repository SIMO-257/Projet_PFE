import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useDispatch } from "react-redux";
import PublicRoute from "./Components/Layout/PublicRoute";
import ProtectedRoute from "./Components/Layout/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import { markAuthCheckedUnauthenticated } from "./Redux/Slices/AuthSlice";
import { shouldRestoreAuthSession } from "./services/clientService";

// Lazy pages
const Login = lazy(() => import("./Pages/Login"));
const SignUp = lazy(() => import("./Pages/SignUp"));
const ForgotPassword = lazy(() => import("./Pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./Pages/ResetPassword"));

const HomeScreen = lazy(() => import("./Pages/HomeScreen"));
const WalletScreen = lazy(() => import("./Pages/WalletScreen"));
const ProfileScreen = lazy(() => import("./Pages/ProfileScreen"));
const EditProfileScreen = lazy(() => import("./Pages/EditProfile"));
const SettingsScreen = lazy(() => import("./Pages/SettingsScreen"));
const HelpSupportScreen = lazy(() => import("./Pages/HelpSupportScreen"));
const SecurityScreen = lazy(() => import("./Pages/SecurityScreen"));

const MyTickets = lazy(() => import("./Pages/MyTickets"));
const AllTickets = lazy(() => import("./Pages/AllTickets"));
const TicketSelection = lazy(() => import("./Pages/TicketSelection"));
const ViewTicket = lazy(() => import("./Pages/ViewTicket"));
const ValidationScreen = lazy(() => import("./Pages/ValidationScreen"));
const ValidatorScreen = lazy(() => import("./Pages/Validator"));

const Paiment = lazy(() => import("./Pages/Paiment"));
const RechargePaymentScreen = lazy(() => import("./Pages/RechargePaymentScreen"));
const PurchasedCards = lazy(() => import("./Pages/PurchasedCards"));
const ConfirmationPaiment = lazy(() => import("./Pages/ConfirmationPaiment"));
const PaimentHistory = lazy(() => import("./Pages/PaimentHistory"));

const Notifications = lazy(() => import("./Pages/Notifications"));
const OfflineMode = lazy(() => import("./Pages/OfflineMode"));


function RootRedirect() {
  const { isAuthenticated, isAuthChecked, isLoading } = useAuth();

  // Wait until we have a definitive answer from the backend
  if (!isAuthChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0507] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // If we checked and user is NOT authenticated, they MUST see login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, go to home
  return <Navigate to="/home" replace />;
}

function App() {
  const dispatch = useDispatch();
  const { refreshProfile, isAuthChecked } = useAuth();

  useEffect(() => {
    if (isAuthChecked) {
      return;
    }

    if (shouldRestoreAuthSession()) {
      refreshProfile();
    } else {
      dispatch(markAuthCheckedUnauthenticated());
    }
  }, [dispatch, isAuthChecked, refreshProfile]);

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#1a0507] text-white">
            Loading...
          </div>
        }
      >
        <Routes>

          {/* Default route */}
          <Route path="/" element={<RootRedirect />} />

          {/* PUBLIC ROUTES */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot_password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/wallet" element={<WalletScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/edit-profile" element={<EditProfileScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/help-support" element={<HelpSupportScreen />} />
            <Route path="/security" element={<SecurityScreen />} />

            <Route path="/mytickets" element={<MyTickets />} />
            <Route path="/all-tickets" element={<AllTickets />} />
            <Route path="/ticket-selection" element={<TicketSelection />} />
            <Route path="/viewticket/:id" element={<ViewTicket />} />
            <Route path="/validation" element={<ValidationScreen />} />
            <Route path="/validator" element={<ValidatorScreen />} />

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
