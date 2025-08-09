import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import './index.css'
import { validateEnvironment, env, firebaseEnv } from '@utils/env'

import App from './App.tsx'

// Validate environment variables on startup
validateEnvironment()

// Seed Firebase data in development
if (env.isDevelopment && firebaseEnv.USE_FIREBASE) {
  void import('@utils/seedData').then(({ seedFirebaseData }) => {
    void seedFirebaseData().catch(console.error)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
