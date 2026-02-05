import Login from "./Pages/Login/Login";
import SignUp from "./Pages/SignUp/SignUp";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import HomeScreen from "./Pages/Home/HomeScreen" ;
import NFCValidationScreen from "./Pages/NFCValidationScreen/NFCValidationScreen";
import QRValidationScreen from "./Pages/QRValidationScreen/QRValidationScreen";
import RechargeConfirmationScreen from "./Pages/RechargeConfirmationScreen/RechargeConfirmationScreen";
import RechargePaymentScreen  from "./Pages/RechargePaymentScreen/RechargePaymentScreen";
import TransactionHistoryScreen  from "./Pages/TransactionHistoryScreen/TransactionHistoryScreen";
import  ValidationResultScreen from "./Pages/ValidationResultScreen/ValidationResultScreen";
import ValidationScreen from "./Pages/ValidationScreen/ValidationScreen";
import WalletScreen from "./Pages/WalletScreen/WalletScreen";


import { BrowserRouter } from "react-router-dom";



function App() {
  return (
    <>
      <BrowserRouter>

        <WalletScreen/>

      </BrowserRouter>
    </>
  );
}

export default App;