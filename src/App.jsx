import Login from "./Pages/Login/Login";
import SignUp from "./Pages/SignUp/SignUp";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import HomeScreen from "./Pages/Home/HomeScreen";
import ValidationScreen from "./Pages/ValidationScreen/ValidationScreen";
import QRValidationScreen from "./Pages/QRValidationScreen/QRValidationScreen";
import NFCValidationScreen from "./Pages/NFCValidationScreen/NFCValidationScreen";
import ValidationResultScreen from "./Pages/ValidationResultScreen/ValidationResultScreen";

import { BrowserRouter } from "react-router-dom";


function App() {
  return (
    <>
      <BrowserRouter>

        <HomeScreen/>

      </BrowserRouter>
    </>
  );
}

export default App;