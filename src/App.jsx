import { BrowserRouter } from "react-router-dom";
import WalletScreen from "./Pages/WalletScreen/WalletScreen";
import Login from "./Pages/Login/Login";
import SignUp from "./Pages/SignUp/SignUp";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import HomeScreen from "./Pages/Home/HomeScreen";
import ValidationScreen from "./Pages/ValidationScreen/ValidationScreen";
import QRValidationScreen from "./Pages/QRValidationScreen/QRValidationScreen";
import NFCValidationScreen from "./Pages/NFCValidationScreen/NFCValidationScreen";
import ValidationResultScreen from "./Pages/ValidationResultScreen/ValidationResultScreen";
import TransactionHistoryScreen from "./Pages/TransactionHistoryScreen/TransactionHistoryScreen";
import RechargePaymentScreen from "./Pages/RechargePaymentScreen/RechargePaymentScreen";
import RechargeConfirmationScreen from './Pages/RechargeConfirmationScreen/RechargeConfirmationScreen' 
function App() {
  return (
    <>
      <BrowserRouter>

        <TransactionHistoryScreen/>

      </BrowserRouter>
    </>
  );
}

export default App;