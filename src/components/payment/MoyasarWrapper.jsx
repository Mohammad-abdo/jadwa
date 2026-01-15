import React, { useEffect, useState } from 'react'
import { Spin, message } from 'antd'
import { useLanguage } from '../../contexts/LanguageContext'

const MoyasarWrapper = ({ amount, currency = 'SAR', description, onSuccess, onFailure }) => {
  const { language } = useLanguage()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadMoyasar = () => {
        // Check if script is already loaded
        const existingScript = document.querySelector('script[src*="moyasar.js"]')
        
        if (window.Moyasar) {
            setLoading(false)
            if (active) initMoyasar()
            return
        }

        if (existingScript) {
            // Script exists but maybe not loaded yet?
            existingScript.addEventListener('load', () => {
                setLoading(false)
                if (active) initMoyasar()
            })
            return
        }

        // Load Moyasar CSS
        if (!document.querySelector('link[href*="moyasar.css"]')) {
            const link = document.createElement('link')
            link.href = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css'
            link.rel = 'stylesheet'
            document.head.appendChild(link)
        }

        // Load Moyasar JS
        const script = document.createElement('script')
        script.src = 'https://polyfill.io/v3/polyfill.min.js?features=fetch'
        document.head.appendChild(script)

        const moyasarScript = document.createElement('script')
        moyasarScript.src = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js'
        moyasarScript.async = true
        moyasarScript.addEventListener('load', () => {
            if (active) {
                setLoading(false)
                initMoyasar()
            }
        })
        moyasarScript.addEventListener('error', (e) => {
            console.error('Error loading Moyasar script:', e)
            if (active) {
                setLoading(false)
                message.error('Failed to load payment gateway')
            }
        })
        document.body.appendChild(moyasarScript)
    }

    loadMoyasar()

    return () => {
      active = false
      // Don't remove scripts to avoid breaking re-mounts
    }
  }, [])

  const initMoyasar = () => {
    if (window.Moyasar) {
      try {
          window.Moyasar.init({
            element: '.mysr-form',
            amount: Math.round(amount * 100), // Amount in halalas
            currency: currency,
            description: description,
            publishable_api_key: import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY,
            callback_url: `${window.location.origin}/client/payment-result`,
            methods: ['creditcard', 'stcpay', 'applepay'],
            country: 'SA',
            apple_pay: {
              label: 'Jadwa Platform',
              validate_merchant_url: 'https://api.moyasar.com/v1/apple-pay/initiate',
              country: 'SA',
            },
            on_completed: function (payment) {
              if (payment.status === 'paid') {
                onSuccess(payment)
              } else {
                onFailure(payment)
                message.error(language === 'ar' ? 'فشلت عملية الدفع' : 'Payment failed')
              }
            },
            on_failure: function (error) {
               // Ignore user cancellation errors or trivial UI errors
               console.error('Moyasar failure:', error)
               // Only show message if it's a real error
            }
          })
      } catch (err) {
          console.error('Moyasar init error:', err)
      }
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      {loading && (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      )}
      <div className="mysr-form"></div>
    </div>
  )
}

export default MoyasarWrapper
