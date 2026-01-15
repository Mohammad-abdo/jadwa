import React, { useState, useEffect } from 'react'
import { Card, Steps, Form, Select, DatePicker, TimePicker, Input, Button, Radio, Row, Col, Avatar, Rate, message, Spin } from 'antd'
import { CalendarOutlined, UserOutlined, CreditCardOutlined } from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { consultantAPI, servicesAPI, bookingsAPI, settingsAPI } from '../../services/api'
import dayjs from 'dayjs'
import MoyasarWrapper from '../../components/payment/MoyasarWrapper'

const { TextArea } = Input

const ClientBookings = () => {
  const { language } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [consultants, setConsultants] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedConsultant, setSelectedConsultant] = useState(null)
  const [selectedService, setSelectedService] = useState(null)

  // Ensure only clients can access this page
  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      message.error(language === 'ar' ? 'غير مصرح لك بالوصول إلى هذه الصفحة' : 'You are not authorized to access this page')
      if (user.role === 'CONSULTANT') {
        navigate('/consultant', { replace: true })
      } else if (['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
  }, [user, navigate, language])

  // Fetch consultants and services from database
  useEffect(() => {
    if (user?.role === 'CLIENT') {
      fetchConsultants()
      fetchServices()
    }
  }, [user])

  // Save state before redirect (MoyasarWrapper might trigger this implicitly if redirecting)
  // We can add an effect or hook into the wrapper, pass a "beforeRedirect" prop?
  // Or just save on step change/form update.
  useEffect(() => {
      if (selectedConsultant && currentStep === 3) {
          const values = form.getFieldsValue()
          localStorage.setItem('draftBooking', JSON.stringify({
              values,
              consultant: selectedConsultant,
              service: selectedService
          }))
      }
  }, [currentStep, selectedConsultant, selectedService, form])

  const fetchConsultants = async () => {
    try {
      setLoading(true)
      const response = await consultantAPI.getConsultants({ isAvailable: true })
      setConsultants(response.consultants || [])
    } catch (err) {
      console.error('Error fetching consultants:', err)
      message.error(language === 'ar' ? 'فشل تحميل المستشارين' : 'Failed to load consultants')
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getServices({ status: 'active' })
      setServices(response.services || [])
    } catch (err) {
      console.error('Error fetching services:', err)
    }
  }

  const consultationTypes = [
    { value: 'economic', label: language === 'ar' ? 'اقتصادي' : 'Economic' },
    { value: 'administrative', label: language === 'ar' ? 'إداري' : 'Administrative' },
    { value: 'financial', label: language === 'ar' ? 'مالي' : 'Financial' },
    { value: 'accounting', label: language === 'ar' ? 'محاسبي' : 'Accounting' },
  ]

  const [paymentMethods, setPaymentMethods] = useState([
    { value: 'bank', label: language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer' }
  ])
  const [activeGateway, setActiveGateway] = useState('moyasar')
  const [paymentMethodState, setPaymentMethodState] = useState(null)

  useEffect(() => {
      fetchPaymentSettings()
  }, [])

  // Sync state with form value when step changes or component mounts
  useEffect(() => {
      const currentMethod = form.getFieldValue('paymentMethod')
      if (currentMethod) {
          setPaymentMethodState(currentMethod)
      }
      
      // Save Draft for Payment Redirects (3DS)
      if (currentStep === 2 || currentStep === 3) { // Step 2 (Date) or 3 (Payment)
          const values = form.getFieldsValue()
          if (selectedConsultant && values.date && values.time) {
              const draft = {
                  values: {
                      ...values,
                      // Ensure date/time are serializable
                      date: values.date, // dayjs object allows toISOString logic later or we keep as is? 
                                         // JSON.stringify wil convert dayjs to ISO string automatically
                      time: values.time
                  },
                  consultant: selectedConsultant,
                  service: selectedService
              }
              localStorage.setItem('draftBooking', JSON.stringify(draft))
              console.log('Draft booking saved for payment redirect')
          }
      }
  }, [currentStep, form, selectedConsultant, selectedService])

  const fetchPaymentSettings = async () => {
      try {
          const response = await settingsAPI.getPaymentSettings()
          if (response.settings) {
              const gateway = response.settings.paymentGateway || 'moyasar' // Default to Moyasar if unset? Or Tap?
              setActiveGateway(gateway)
              
              // Check if keys exist in ENVIRONMENT
              // The user explicitly requested to use keys from frontend .env
              
              let hasKey = false
              
              if (gateway === 'moyasar') {
                  const envKey = import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY
                  // Check if key exists and is non-empty
                  if (envKey && envKey.length > 5) {
                      hasKey = true
                  }
              } else if (gateway === 'tap') {
                  // Placeholder for Tap Env Key
                  // const tapKey = import.meta.env.VITE_TAP_PUBLISHABLE_KEY
                  // if (tapKey) hasKey = true
              }

              const methods = []
              
              // Always allow Bank Transfer
              methods.push({ value: 'bank', label: language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer' })

              if (gateway === 'moyasar') {
                  methods.push(
                    { value: 'card', label: language === 'ar' ? 'بطاقة ائتمانية' : 'Credit Card' },
                    { value: 'mada', label: 'Mada' },
                    { value: 'applepay', label: 'Apple Pay' }
                  )
                  
                  // Debug log
                  console.log('Moyasar Options Added. Key:', import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY ? 'Present' : 'Missing')
              } else if (gateway === 'tap') {
                  methods.push(
                    { value: 'card', label: language === 'ar' ? 'بطاقة ائتمانية ' : 'Credit Card' }
                  )
              }
              
              setPaymentMethods(methods)
          }
      } catch (error) {
          console.error('Failed to fetch payment settings', error)
      }
  }

  const steps = [
    {
      title: language === 'ar' ? 'نوع الاستشارة' : 'Consultation Type',
      icon: <CalendarOutlined />,
    },
    {
      title: language === 'ar' ? 'اختيار المستشار' : 'Select Consultant',
      icon: <UserOutlined />,
    },
    {
      title: language === 'ar' ? 'التاريخ والوقت' : 'Date & Time',
      icon: <CalendarOutlined />,
    },
    {
      title: language === 'ar' ? 'الدفع' : 'Payment',
      icon: <CreditCardOutlined />,
    },
  ]

  const onFinish = async (values) => {
    // If not on last step, just proceed (handled by next button)
    // If on last step and paid (or payment not required/handled), submit
    
    // logic moved to separate handlers for clarity
  }
  
  const handleBookingSubmission = async (paymentData = null) => {
    if (!selectedConsultant) return

    try {
      setSubmitting(true)
      const values = form.getFieldsValue()
      
      // Combine date and time
      const dateTime = dayjs(values.date)
        .hour(dayjs(values.time).hour())
        .minute(dayjs(values.time).minute())
        .second(0)
        .millisecond(0)

      const bookingData = {
        consultantId: selectedConsultant.id,
        serviceId: selectedService?.id || null,
        bookingType: values.consultationType?.toUpperCase() || 'CONSULTATION',
        scheduledAt: dateTime.toISOString(),
        selectedTimeSlot: dayjs(values.time).format('HH:mm'),
        duration: selectedConsultant.duration || 60,
        price: selectedConsultant.pricePerSession || 0,
        clientNotes: values.details || '',
        paymentStatus: paymentData ? 'PAID' : 'PENDING',
        paymentMethod: values.paymentMethod,
        transactionId: paymentData ? paymentData.id : null,
        paymentDetails: paymentData ? JSON.stringify(paymentData) : null
      }

      await bookingsAPI.createBooking(bookingData)
      
      message.success(language === 'ar' ? 'تم إنشاء الحجز بنجاح' : 'Booking created successfully')
      
      // Navigate to bookings list
      navigate('/client/bookings')
    } catch (err) {
      console.error('Error creating booking:', err)
      message.error(err.message || (language === 'ar' ? 'فشل إنشاء الحجز' : 'Failed to create booking'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen pb-8 dashboard-bg">
      {/* Modern Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-br from-olive-green-100/40 to-turquoise-100/40 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-tr from-teal-100/40 to-olive-green-100/40 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Modern Header */}
      <div className="mb-8 relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3">
          {language === 'ar' ? 'حجز استشارة' : 'Book Consultation'}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 font-medium">
          {language === 'ar' ? 'احجز استشارة مع أحد مستشارينا الخبراء' : 'Book a consultation with one of our expert consultants'}
        </p>
      </div>

      <Card className="glass-card shadow-professional-xl rounded-2xl border-0 mb-6 relative z-10">
        <Steps current={currentStep} items={steps} />
      </Card>

      <Card className="glass-card shadow-professional-xl rounded-2xl border-0 relative z-10">
        <Form form={form} layout="vertical">
          {currentStep === 0 && (
            <>
              <Form.Item
                name="serviceId"
                label={language === 'ar' ? 'نوع الخدمة' : 'Service Type'}
                rules={[{ required: true, message: language === 'ar' ? 'يرجى اختيار نوع الخدمة' : 'Please select a service type' }]}
              >
                <Select 
                  size="large" 
                  placeholder={language === 'ar' ? 'اختر نوع الخدمة' : 'Select Service Type'}
                  onChange={(value) => {
                    const service = services.find(s => s.id === value)
                    setSelectedService(service)
                  }}
                >
                  {services.map((service) => (
                    <Select.Option key={service.id} value={service.id}>
                      {language === 'ar' ? service.titleAr || service.title : service.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="consultationType"
                label={language === 'ar' ? 'نوع الاستشارة' : 'Consultation Type'}
                rules={[{ required: true }]}
              >
                <Radio.Group>
                  <Row gutter={[16, 16]}>
                    {consultationTypes.map((type) => (
                      <Col xs={24} sm={12} key={type.value}>
                        <Radio.Button value={type.value} className="w-full text-center h-12">
                          {type.label}
                        </Radio.Button>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group>
              </Form.Item>
            </>
          )}

          {currentStep === 1 && (
            <Form.Item
              name="consultantId"
              label={language === 'ar' ? 'اختر المستشار' : 'Select Consultant'}
              rules={[{ required: true, message: language === 'ar' ? 'يرجى اختيار مستشار' : 'Please select a consultant' }]}
            >
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spin size="large" />
                </div>
              ) : (
                <div className="space-y-4">
                  {consultants.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {language === 'ar' ? 'لا توجد مستشارين متاحين' : 'No available consultants'}
                    </div>
                  ) : (
                    consultants.map((consultant) => {
                      const isSelected = selectedConsultant?.id === consultant.id
                      return (
                        <Card
                          key={consultant.id}
                          className={`glass-card card-hover cursor-pointer ${isSelected ? 'border-olive-green-500 border-2 shadow-professional-lg' : 'hover:border-olive-green-500'}`}
                          onClick={() => {
                            setSelectedConsultant(consultant)
                            form.setFieldsValue({ consultantId: consultant.id })
                          }}
                        >
                          <div className="flex items-center space-x-4 space-x-reverse">
                            <Avatar src={consultant.user?.avatar} size={64} icon={<UserOutlined />} />
                            <div className="flex-1">
                              <h3 className="text-lg font-bold">
                                {consultant.firstName} {consultant.lastName}
                              </h3>
                              <p className="text-gray-600">{consultant.specialization || (language === 'ar' ? 'مستشار' : 'Consultant')}</p>
                              {consultant.rating && (
                                <Rate disabled defaultValue={consultant.rating} className="mb-2" />
                              )}
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-olive-green-600 font-bold">
                                  {consultant.pricePerSession || 0} {language === 'ar' ? 'ريال' : 'SAR'}
                                </span>
                                <span className="text-gray-500">
                                  {consultant.sessionDuration || 60} {language === 'ar' ? 'دقيقة' : 'minutes'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })
                  )}
                </div>
              )}
            </Form.Item>
          )}

          {currentStep === 2 && (
            <>
              <Form.Item
                name="date"
                label={language === 'ar' ? 'التاريخ' : 'Date'}
                rules={[{ required: true }]}
              >
                <DatePicker size="large" className="w-full" disabledDate={(current) => current && current < dayjs().startOf('day')} />
              </Form.Item>
              <Form.Item
                name="time"
                label={language === 'ar' ? 'الوقت' : 'Time'}
                rules={[{ required: true }]}
              >
                <TimePicker size="large" className="w-full" format="HH:mm" />
              </Form.Item>
              <Form.Item
                name="details"
                label={language === 'ar' ? 'تفاصيل إضافية' : 'Additional Details'}
              >
                <TextArea rows={4} placeholder={language === 'ar' ? 'أدخل أي تفاصيل إضافية...' : 'Enter any additional details...'} />
              </Form.Item>
            </>
          )}

          {currentStep === 3 && (
            <>
              <Card className="glass-card shadow-professional-lg rounded-xl border-0 mb-4">
                <h3 className="font-bold mb-4">{language === 'ar' ? 'ملخص الحجز' : 'Booking Summary'}</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'المستشار:' : 'Consultant:'}</span>
                    <span className="font-semibold">
                      {selectedConsultant ? `${selectedConsultant.firstName} ${selectedConsultant.lastName}` : '-'}
                    </span>
                  </div>
                  {selectedService && (
                    <div className="flex justify-between">
                      <span>{language === 'ar' ? 'الخدمة:' : 'Service:'}</span>
                      <span className="font-semibold">
                        {language === 'ar' ? selectedService.titleAr || selectedService.title : selectedService.title}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'التاريخ والوقت:' : 'Date & Time:'}</span>
                    <span className="font-semibold">
                      {form.getFieldValue('date') && form.getFieldValue('time') 
                        ? dayjs(form.getFieldValue('date')).format('YYYY-MM-DD') + ' ' + dayjs(form.getFieldValue('time')).format('HH:mm')
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'المبلغ:' : 'Amount:'}</span>
                    <span className="font-semibold text-olive-green-600">
                      {selectedConsultant?.pricePerSession || 0} {language === 'ar' ? 'ريال' : 'SAR'}
                    </span>
                  </div>
                </div>
              </Card>
              <Form.Item
                name="paymentMethod"
                label={language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                rules={[{ required: true }]}
              >
                <Radio.Group 
                  className="w-full"
                  onChange={(e) => {
                    const val = e.target.value;
                    form.setFieldValue('paymentMethod', val);
                    setPaymentMethodState(val);
                  }}
                >
                  <Row gutter={[16, 16]}>
                    {paymentMethods.map((pm) => {
                      const isSelected = form.getFieldValue('paymentMethod') === pm.value;
                      return (
                        <Col xs={24} sm={12} md={8} key={pm.value}>
                          <div 
                            className={`
                              relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 h-full flex flex-col items-center justify-center
                              ${isSelected 
                                ? 'border-olive-green-600 bg-olive-green-50 shadow-md' 
                                : 'border-gray-200 hover:border-olive-green-300 bg-white'}
                            `}
                            onClick={() => {
                                form.setFieldValue('paymentMethod', pm.value);
                                // Force re-render of this component to update UI
                                setPaymentMethodState(pm.value);
                            }}
                          >
                            <Radio value={pm.value} className="absolute right-4 top-4" checked={isSelected} />
                            <div className="flex flex-col items-center justify-center py-2">
                              <span className={`text-lg font-bold ${isSelected ? 'text-olive-green-700' : 'text-gray-700'}`}>
                                {pm.label}
                              </span>
                            </div>
                          </div>
                        </Col>
                      )
                    })}
                  </Row>
                </Radio.Group>
              </Form.Item>

              {(paymentMethodState === 'card' || paymentMethodState === 'mada' || paymentMethodState === 'applepay') ? (
                 <div className="mt-6 animate-fade-in p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="mb-6 text-center border-b border-gray-100 pb-4">
                        <p className="text-gray-600 mb-1">{language === 'ar' ? 'المبلغ المستحق' : 'Amount Due'}</p>
                        <p className="text-3xl font-bold text-olive-green-600">
                           {selectedConsultant?.pricePerSession || 0} <span className="text-sm font-normal">{language === 'ar' ? 'ريال' : 'SAR'}</span>
                        </p>
                    </div>
                    {/* Render Moyasar Form */}
                    <MoyasarWrapper
                        key={paymentMethodState} 
                        amount={selectedConsultant?.pricePerSession || 0}
                        currency="SAR"
                        description={`Consultation with ${selectedConsultant?.firstName} ${selectedConsultant?.lastName}`}
                        onSuccess={(payment) => handleBookingSubmission(payment)}
                        onFailure={(error) => console.error('Payment failed', error)}
                    />
                 </div>
              ) : (
                <div className="mt-6 flex justify-end">
                     <Button
                         type="primary"
                         onClick={() => handleBookingSubmission()}
                         className="bg-turquoise-500 hover:bg-turquoise-600 border-0 h-14 px-10 text-xl rounded-full shadow-lg hover:shadow-xl transition-all"
                         loading={submitting}
                     >
                         {language === 'ar' ? 'إتمام الحجز' : 'Complete Booking'}
                     </Button>
                </div>
              )}
            </>
          )}

          <div className="flex justify-between mt-6">
            <Button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              {language === 'ar' ? 'السابق' : 'Previous'}
            </Button>
            {currentStep < steps.length - 1 && (
              <Button
                type="primary"
                className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
                onClick={() => {
                   // Manual validation for reliability
                   const values = form.getFieldsValue();
                   let missingFields = [];

                   if (currentStep === 0) {
                       if (!values.serviceId) missingFields.push(language === 'ar' ? 'نوع الخدمة' : 'Service Type');
                       if (!values.consultationType) missingFields.push(language === 'ar' ? 'نوع الاستشارة' : 'Consultation Type');
                   }
                   if (currentStep === 1) {
                       if (!values.consultantId) missingFields.push(language === 'ar' ? 'المستشار' : 'Consultant');
                   }
                   if (currentStep === 2) {
                       if (!values.date) missingFields.push(language === 'ar' ? 'التاريخ' : 'Date');
                       if (!values.time) missingFields.push(language === 'ar' ? 'الوقت' : 'Time');
                   }

                   if (missingFields.length > 0) {
                       message.error(
                           language === 'ar' 
                           ? `يرجى إكمال: ${missingFields.join('، ')}` 
                           : `Please complete: ${missingFields.join(', ')}`
                       );
                   } else {
                       // Proceed
                       setCurrentStep(currentStep + 1);
                   }
                }}
              >
                {language === 'ar' ? 'التالي' : 'Next'}
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default ClientBookings

