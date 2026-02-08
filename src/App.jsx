import { BrowserRouter } from "react-router-dom";

import HomeScreen from "./Pages/Home/HomeScreen";
import Login from "./Pages/Login/Login";
import SignUp from "./Pages/SignUp/SignUp";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";

import ValidationScreen from "./Pages/ValidationScreen/ValidationScreen";
import QRValidationScreen from "./Pages/QRValidationScreen/QRValidationScreen";
import NFCValidationScreen from "./Pages/NFCValidationScreen/NFCValidationScreen";
import ValidationResultScreen from "./Pages/ValidationResultScreen/ValidationResultScreen";

import RechargePaymentScreen from "./Pages/RechargePaymentScreen/RechargePaymentScreen";
import RechargeConfirmationScreen from "./Pages/RechargeConfirmationScreen/RechargeConfirmationScreen";
import TransactionHistoryScreen from "./Pages/TransactionHistoryScreen/TransactionHistoryScreen";
import WalletScreen from "./Pages/WalletScreen/WalletScreen";
import SettingsScreen from "./Pages/SettingsScreen/SettingsScreen";

function App() {
  return (
    <BrowserRouter>
      <SettingsScreen/>
    </BrowserRouter>
  );
}

export default App;
