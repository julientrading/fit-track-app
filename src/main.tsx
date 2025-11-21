import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

// PROOF NEW CODE IS LOADING
alert('MAIN.TSX LOADED - Version 06:35!')
console.log('========== MAIN.TSX VERSION 06:35 LOADED ==========')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
