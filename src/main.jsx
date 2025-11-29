import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import arEG from 'antd/locale/ar_EG'
import enUS from 'antd/locale/en_US'
import App from './App.jsx'
import './index.css'
import './styles/modals.css'

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

