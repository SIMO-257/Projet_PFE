import Login from "./Pages/Login/Login";

import SignUp from "./Pages/SignUp/SignUp";

import WalletApp from "./Pages/Home/Home";
import ValidationScreen from "./Pages/validation/ValidatinScreen";
import { BrowserRouter } from "react-router-dom";


function App() {
  return (
    <>
      <BrowserRouter>
        <Login />

      </BrowserRouter>
    </>
  );
}

export default App;