import Login from "./Pages/Login/Login";
import SignUp from "./Pages/SignUp/SignUp";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
// import WalletApp from "./Pages/Home/Home";
import ValidationScreen from "./Pages/ValidationScreen/ValidatinScreen";
import QRValidationModal from "./Pages/QRValidationModule/QRValidationModal";
import NFCValidationModal from "./Pages/ValidationNFC/ValidationNFC";
import ValidationResultModal from "./Pages/ValidationResultModal/ValidationResultModal";
import MyTickets from "./Pages/MyTickets/MyTickets";

import { BrowserRouter } from "react-router-dom";


function App() {
  return (
    <>
      <BrowserRouter>

        <MyTickets/>

      </BrowserRouter>
    </>
  );
}

export default App;