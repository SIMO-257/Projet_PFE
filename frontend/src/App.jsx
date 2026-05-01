import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import WalletScreen from "./Pages/WalletScreen/WalletScreen";
import Login from "./Pages/Login/Login";
import SignUp from "./Pages/SignUp/SignUp";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword/ResetPassword";
import HomeScreen from "./Pages/Home/HomeScreen";
import ViewTicket from "./Pages/ViewTicket/ViewTicket";
import ProfileScreen from "./Pages/ProfileScreen/ProfileScreen";
import EditProfileScreen from "./Pages/EditProfile/EditProfile";
import SettingsScreen from "./Pages/Settings/SettingsScreen";
import HelpSupportScreen from "./Pages/HelpSupport/HelpSupportScreen";
import SecurityScreen from "./Pages/SecurityScreen/SecurityScreen";
import MyTickets from "./Pages/MyTickets/MyTickets";
import Paiment from "./Pages/Paiment/Paiment";
import ConfirmationPaiment from "./Pages/ConfirmationPaiment/ConfirmationPaiment";
import PaimentHistory from "./Pages/PaimentHistory/PaimentHistory";
import OfflineMode from "./Pages/OfflineMode/OfflineMode";
import Notifications from "./Pages/Notifications/Notifications";
import ChangeCardScreen from "./Pages/ChangeCardScreen/ChangeCardScreen";
import ValidationScreen from "./Pages/ValidationScreen/ValidationScreen";
import RechargePaymentScreen from "./Pages/RechargePaymentScreen/RechargePaymentScreen";

import TicketSelection from "./Pages/TicketSelection/TicketSelection";

import { clearAuthData, fetchClientHome, getAuthToken } from "./services/clientService";

function RootRedirect() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setTarget("/login");
      return;
    }

    fetchClientHome()
      .then(() => setTarget("/home"))
      .catch(() => {
        clearAuthData();
        setTarget("/login");
      });
  }, []);

  if (!target) return null;

  return <Navigate to={target} replace />;
}


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/home" element={<HomeScreen />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot_password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/edit-profile" element={<EditProfileScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/help-support" element={<HelpSupportScreen />} />
          <Route path="/change-card" element={<ChangeCardScreen />} />
          <Route path="/security" element={<SecurityScreen />} />

          <Route path="/wallet" element={<WalletScreen />} />
          <Route path="/recharge/payment" element={<RechargePaymentScreen />} />
          <Route path="/viewticket/:id" element={<ViewTicket />} />
          <Route path="/ticket-selection" element={<TicketSelection />} />
          
          <Route path="/mytickets" element={<MyTickets />} />
          <Route path="/validation" element={<ValidationScreen />} />
          <Route path="/payment" element={<Paiment />} />
          <Route path="/payment-confirmation" element={<ConfirmationPaiment />} />
          <Route path="/payment-history" element={<PaimentHistory />} />
          <Route path="/offline" element={<OfflineMode />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
