import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Pages/Login/Login";
import SignUp from "./Pages/SignUp/SignUp";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";

import HomeScreen from "./Pages/Home/HomeScreen";
import MyTickets from "./Pages/MyTickets/MyTickets";
// import WalletScreen from "./Pages/WalletScreen/WalletScreen";
 import ViewTicket from "./Pages/ViewTicket/ViewTicket";
// import TicketSelection from "./Pages/TicketSelection/TicketSelection";

// import Paiment from "./Pages/Paiment/Paiment";
// import ConfirmationPaiment from "./Pages/ConfirmationPaiment/ConfirmationPaiment";
// import PaimentHistory from "./Pages/PaimentHistory/PaimentHistory";
// import OfflineMode from "./Pages/OfflineMode/OfflineMode";
// import Notifications from "./Pages/Notifications/Notifications";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SignUp/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/forgot_password/*" element={<ForgotPassword/>} />
          <Route path="/home" element={<HomeScreen/>} />
          <Route path="/viewticket/:id" element={<ViewTicket/>} />
          {/* <Route path="/ticketselection/:id/:cardid?" element={<TicketSelection />}>
            <Route path="paiment" element={<Paiment />} />
          </Route> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
