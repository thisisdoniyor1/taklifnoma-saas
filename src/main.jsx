import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { InvitationProvider } from './context/InvitationContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <InvitationProvider>
        <App />
      </InvitationProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
