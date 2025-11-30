import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import arEG from 'antd/locale/ar_EG'
import enUS from 'antd/locale/en_US'
import App from './App.jsx'
import './index.css'
import './styles/modals.css'

// Suppress common React deprecation warnings
const originalError = console.error
const originalWarn = console.warn
console.error = (...args) => {
  const errorMessage = args[0]?.toString() || ''
  // Filter out findDOMNode deprecation warnings
  if (errorMessage.includes('findDOMNode is deprecated')) {
    return // Suppress this specific warning
  }
  originalError.apply(console, args)
}
console.warn = (...args) => {
  const warnMessage = args[0]?.toString() || ''
  // Filter out common deprecation warnings
  if (warnMessage.includes('findDOMNode is deprecated')) {
    return // Suppress this specific warning
  }
  originalWarn.apply(console, args)
}

// Set RTL direction for Arabic
document.documentElement.setAttribute('dir', 'rtl')
document.documentElement.setAttribute('lang', 'ar')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider locale={arEG} direction="rtl">
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)

