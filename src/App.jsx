import { BrowserRouter, Route, Routes } from "react-router-dom";
import WalletScreen from "./Pages/WalletScreen/WalletScreen";
import Login from "./Pages/Login/Login";
import SignUp from "./Pages/SignUp/SignUp";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import HomeScreen from "./Pages/Home/HomeScreen";
import ViewTicket from "./Pages/ViewTicket/ViewTicket";
import MyTickets from "./Pages/MyTickets/MyTickets";




function App() {
  return (
    <>
      <BrowserRouter>

        <Routes>
          <Route path="/" element={<MyTickets />} />
          <Route path="/viewticket/:id" element={<ViewTicket />} />
          <Route path="/purchaseticket/:id" element={<ViewTicket />} />
        </Routes>





      </BrowserRouter>
    </>
  );
}

export default App;
