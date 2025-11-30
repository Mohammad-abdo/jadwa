import React, { useState, useEffect } from 'react'
import { Card, Steps, Form, Select, DatePicker, TimePicker, Input, Button, Radio, Row, Col, Avatar, Rate, message, Spin } from 'antd'
import { CalendarOutlined, UserOutlined, CreditCardOutlined } from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { consultantAPI, servicesAPI, bookingsAPI } from '../../services/api'
import dayjs from 'dayjs'

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

  const paymentMethods = [
    { value: 'card', label: language === 'ar' ? 'بطاقة ائتمانية' : 'Credit Card' },
    { value: 'mada', label: 'Mada' },
    { value: 'applepay', label: 'Apple Pay' },
    { value: 'bank', label: language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer' },
  ]

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
    if (!selectedConsultant) {
      message.error(language === 'ar' ? 'يرجى اختيار مستشار' : 'Please select a consultant')
      setCurrentStep(1)
      return
    }

    try {
      setSubmitting(true)
      
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
      }

      const response = await bookingsAPI.createBooking(bookingData)
      
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
        <Form form={form} onFinish={onFinish} layout="vertical">
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
                <Radio.Group>
                  <Row gutter={[16, 16]}>
                    {paymentMethods.map((method) => (
                      <Col xs={24} sm={12} key={method.value}>
                        <Radio.Button value={method.value} className="w-full text-center h-12">
                          {method.label}
                        </Radio.Button>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group>
              </Form.Item>
            </>
          )}

          <div className="flex justify-between mt-6">
            <Button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              {language === 'ar' ? 'السابق' : 'Previous'}
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button
                type="primary"
                className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
                onClick={() => {
                  // Validate current step before proceeding
                  if (currentStep === 1 && !selectedConsultant) {
                    message.error(language === 'ar' ? 'يرجى اختيار مستشار' : 'Please select a consultant')
                    return
                  }
                  form.validateFields().then(() => {
                    setCurrentStep(currentStep + 1)
                  }).catch(() => {})
                }}
              >
                {language === 'ar' ? 'التالي' : 'Next'}
              </Button>
            ) : (
              <Button
                type="primary"
                htmlType="submit"
                className="bg-turquoise-500 hover:bg-turquoise-600 border-0"
                loading={submitting}
              >
                {language === 'ar' ? 'إتمام الحجز' : 'Complete Booking'}
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default ClientBookings

