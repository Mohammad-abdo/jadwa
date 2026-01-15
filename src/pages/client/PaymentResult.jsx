import React, { useEffect, useState } from 'react'
import { Result, Button, Spin, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { bookingsAPI } from '../../services/api'
import dayjs from 'dayjs'

const PaymentResult = () => {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing') // processing, success, error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const processPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const paymentStatus = urlParams.get('status')
      const paymentId = urlParams.get('id')
      const messageMsg = urlParams.get('message')

      if (paymentStatus === 'paid' && paymentId) {
        try {
          // Check for draft booking
          const draft = localStorage.getItem('draftBooking')
          if (draft) {
             const parsedDraft = JSON.parse(draft)
             const { values, consultant, service } = parsedDraft

             // Robust Date Reconstruction using Dayjs (FIX VERSION 2)
             console.log('PaymentResult: Parsing Draft Date/Time:', values.date, values.time)
             
             // dayjs(values.date) parses the ISO string safely
             const dateObj = dayjs(values.date)
             const timeObj = dayjs(values.time)

             if (!dateObj.isValid() || !timeObj.isValid()) {
                 console.error('Invalid Date Objects:', dateObj, timeObj)
                 throw new Error("Invalid date or time format in draft")
             }

             // Merge time into date
             const scheduledAt = dateObj
                .hour(timeObj.hour())
                .minute(timeObj.minute())
                .second(0)
                .millisecond(0)

             // selectedTimeSlot string HH:mm
             const selectedTimeSlot = timeObj.format('HH:mm')

             const bookingData = {
                consultantId: consultant.id, // UUID (String)
                serviceId: service?.id || null, // UUID (String)
                bookingType: values.consultationType?.toUpperCase() || 'CONSULTATION',
                scheduledAt: scheduledAt.toISOString(),
                selectedTimeSlot: selectedTimeSlot,
                duration: parseInt(consultant.duration || 60),
                price: parseFloat(consultant.pricePerSession || 0),
                clientNotes: values.details || '',
                paymentStatus: 'PAID',
                paymentMethod: values.paymentMethod,
                transactionId: paymentId,
                paymentDetails: JSON.stringify({ id: paymentId, status: 'paid', source: { type: 'creditcard', ...values.paymentMethod } }) 
             }

             console.log('Submitting Booking Payload:', bookingData)

             await bookingsAPI.createBooking(bookingData)
             
             // Clear draft
             localStorage.removeItem('draftBooking')
             setStatus('success')
             
             // Auto Redirect after 3 seconds
             setTimeout(() => {
                navigate('/client/bookings')
             }, 3500)
             
          } else {
             // No draft found? Maybe webhook already handled it or session lost.
             console.warn('No draft booking found in localStorage')
             // If payment is successful but no draft, we shouldn't show error, but maybe "Manual Check Needed"
             // But actually, if we can't create booking, it IS an error for the user flow.
             setStatus('success') 
             // We show success because the MONEY was taken. But we warn.
             message.warning(language === 'ar' ? 'تم الدفع بنجاح ولكن فقدنا تفاصيل الحجز. سيتم التواصل معك.' : 'Payment successful but booking details lost. Support will contact you.')
              setTimeout(() => {
                navigate('/client/bookings')
             }, 4500)
          }

        } catch (err) {
          console.error('Error completing booking:', err)
          setStatus('error')
          // Show the specific error from backend if available
          const specificError = err.response?.data?.error || err.message || 'Unknown Error'
          setErrorMsg(language === 'ar' ? `فشل إنشاء الحجز: ${specificError}` : `Failed to create booking: ${specificError}`)
        }
      } else if (paymentStatus === 'failed') {
        setStatus('error')
        setErrorMsg(messageMsg || (language === 'ar' ? 'فشلت عملية الدفع' : 'Payment failed'))
      } else {
        // Unknown or missing params
        setStatus('error')
        setErrorMsg('Invalid payment response')
      }
    }

    processPayment()
  }, [navigate, language])

  if (status === 'processing') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spin size="large" />
        <p className="mt-4 text-lg text-gray-600 font-medium animate-pulse">
          {language === 'ar' ? 'جاري التحقق من الدفع وإتمام الحجز...' : 'Verifying payment and confirming booking...'}
        </p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center pt-8">
        <Result
          status="success"
          title={language === 'ar' ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
          subTitle={language === 'ar' ? 'تم تأكيد حجزك. سيتم نقلك إلى قائمة حجوزاتك...' : 'Your booking has been confirmed. Redirecting you to your bookings...'}
          extra={[
            <Button type="primary" key="console" onClick={() => navigate('/client/bookings')}>
              {language === 'ar' ? 'الذهاب للحجوزات الآن' : 'Go to Bookings Now'}
            </Button>,
          ]}
        />
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center pt-8">
      <Result
        status="error"
        title={language === 'ar' ? 'فشلت عملية الدفع' : 'Payment Failed'}
        subTitle={errorMsg}
        extra={[
          <Button type="primary" key="console" onClick={() => navigate('/client/bookings')}>
             {language === 'ar' ? 'محاولة مرة أخرى' : 'Try Again'}
          </Button>,
        ]}
      />
    </div>
  )
}

export default PaymentResult
