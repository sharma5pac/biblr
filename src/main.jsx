import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './pwa'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'

import { ErrorBoundary } from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
