import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.jsx"
import { AuthProvider } from "./context/AuthContext.jsx"
import { ToastProvider } from "./context/ToastContext.jsx"
import ToastContainer from "./components/ui/ToastContainer.jsx"
import "./styles/neumorphism.css"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
          <ToastContainer />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
)
