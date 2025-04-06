import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LazyMotion, domAnimation } from 'framer-motion'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LazyMotion features={domAnimation}>
      <App />
    </LazyMotion>
  </StrictMode>,
)
