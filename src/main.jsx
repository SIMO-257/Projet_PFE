import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

<<<<<<< HEAD
import "./Styles/index.css";
=======
import './Styles/App.css'
import './Styles/index.css'
>>>>>>> origin/main
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
