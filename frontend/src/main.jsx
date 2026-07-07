import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <>
      <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
    />
    <App />
      </>
    </ErrorBoundary>
  </StrictMode>,
)
