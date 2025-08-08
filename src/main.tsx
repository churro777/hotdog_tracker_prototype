import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import './index.css'
import { validateEnvironment } from '@utils/env'

import App from './App.tsx'

// Validate environment variables on startup
validateEnvironment()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
