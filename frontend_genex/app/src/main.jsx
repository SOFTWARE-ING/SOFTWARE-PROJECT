import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './components/Context_api.jsx' // ✅ Import du context

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* ✅ AuthProvider englobe toute l'application */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
