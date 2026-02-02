import { BrowserRouter, Route, Routes } from "react-router-dom";
import WalletScreen from "./Pages/WalletScreen/WalletScreen";
import Login from "./Pages/Login/Login";
import SignUp from "./Pages/SignUp/SignUp";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import HomeScreen from "./Pages/Home/HomeScreen";
import ViewTicket from "./Pages/ViewTicket/ViewTicket";
// import TicketSelection from "./Pages/TicketSelection/TicketSelection";
import MyTickets from "./Pages/MyTickets/MyTickets";
import Paiment from "./Pages/Paiment/Paiment";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Paiment />} />
          <Route path="/viewticket/:id" element={<ViewTicket />} />
          {/* <Route path="/ticketselection/:id/:cardid?" element={<TicketSelection />}>
            <Route path="paiment" element={<Paiment />} />
          </Route> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
