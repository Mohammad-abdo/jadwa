import React, { useState } from 'react'
import { Layout, Form, Input, Button, Row, Col, Card, message, Alert } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, WhatsAppOutlined, SendOutlined } from '@ant-design/icons'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import ScrollToTop from '../../components/public/ScrollToTop'
import { useLanguage } from '../../contexts/LanguageContext'
import { supportAPI } from '../../services/api'

const { Content } = Layout
const { TextArea } = Input

const ContactPage = () => {
  const { language } = useLanguage()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const onFinish = async (values) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      // Create support ticket via API
      await supportAPI.createTicket({
        subject: `Contact Form: ${values.name}`,
        description: `Name: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone || 'N/A'}\n\nMessage:\n${values.message}`,
        priority: 'MEDIUM',
        category: 'GENERAL_INQUIRY'
      })

      setSuccess(true)
      form.resetFields()
      message.success(language === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!')
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err.message || (language === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send message'))
      message.error(language === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Page Header */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900">
              {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              {language === 'ar'
                ? 'نحن هنا لمساعدتك. تواصل معنا اليوم وسنكون سعداء للرد على استفساراتك'
                : 'We are here to help. Contact us today and we will be happy to answer your inquiries'}
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <Alert
              message={language === 'ar' ? 'تم الإرسال بنجاح!' : 'Message Sent Successfully!'}
              description={language === 'ar' 
                ? 'شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.'
                : 'Thank you for contacting us. We will get back to you as soon as possible.'}
              type="success"
              showIcon
              closable
              onClose={() => setSuccess(false)}
              className="mb-6"
            />
          )}

          {error && (
            <Alert
              message={language === 'ar' ? 'خطأ في الإرسال' : 'Error Sending Message'}
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              className="mb-6"
            />
          )}

          <Row gutter={[32, 32]}>
            {/* Contact Form */}
            <Col xs={24} lg={14}>
              <Card 
                className="shadow-xl border-0 rounded-2xl"
                styles={{ body: { padding: '32px' } }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
                  {language === 'ar' ? 'إرسال رسالة' : 'Send Us a Message'}
                </h2>
                <Form 
                  form={form} 
                  onFinish={onFinish} 
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    name="name"
                    label={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    rules={[
                      { required: true, message: language === 'ar' ? 'الرجاء إدخال الاسم' : 'Please enter your name' }
                    ]}
                  >
                    <Input 
                      placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                      className="rounded-lg"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="email"
                    label={language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    rules={[
                      { required: true, message: language === 'ar' ? 'الرجاء إدخال البريد الإلكتروني' : 'Please enter your email' },
                      { type: 'email', message: language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address' }
                    ]}
                  >
                    <Input 
                      type="email"
                      placeholder={language === 'ar' ? 'example@email.com' : 'example@email.com'}
                      prefix={<MailOutlined className="text-gray-400" />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="phone"
                    label={language === 'ar' ? 'رقم الهاتف (اختياري)' : 'Phone Number (Optional)'}
                  >
                    <Input 
                      placeholder={language === 'ar' ? '+966 5XX XXX XXX' : '+966 5XX XXX XXX'}
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      className="rounded-lg"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="message"
                    label={language === 'ar' ? 'الرسالة' : 'Message'}
                    rules={[
                      { required: true, message: language === 'ar' ? 'الرجاء إدخال الرسالة' : 'Please enter your message' },
                      { min: 10, message: language === 'ar' ? 'الرسالة يجب أن تكون على الأقل 10 أحرف' : 'Message must be at least 10 characters' }
                    ]}
                  >
                    <TextArea 
                      rows={6}
                      placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                      className="rounded-lg"
                      showCount
                      maxLength={1000}
                    />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={loading}
                      icon={<SendOutlined />}
                      className="w-full bg-gradient-to-r from-[#1a4d3a] to-[#2d5f4f] hover:from-[#153d2d] hover:to-[#1a4d3a] border-0 h-12 font-semibold text-base shadow-lg hover:shadow-xl transition-all rounded-lg"
                    >
                      {language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            {/* Contact Information */}
            <Col xs={24} lg={10}>
              <div className="space-y-6">
                <Card 
                  className="shadow-xl border-0 rounded-2xl bg-gradient-to-br from-olive-green-50 to-turquoise-50"
                  styles={{ body: { padding: '32px' } }}
                >
                  <h3 className="text-2xl font-bold mb-6 text-gray-900">
                    {language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-white shadow-md">
                        <PhoneOutlined className="text-2xl text-olive-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">
                          {language === 'ar' ? 'الهاتف' : 'Phone'}
                        </div>
                        <a href="tel:+966123456789" className="text-gray-600 hover:text-olive-green-600 transition-colors">
                          +966 12 345 6789
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-white shadow-md">
                        <MailOutlined className="text-2xl text-olive-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">
                          {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                        </div>
                        <a href="mailto:info@jadwa.com" className="text-gray-600 hover:text-olive-green-600 transition-colors">
                          info@jadwa.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-white shadow-md">
                        <WhatsAppOutlined className="text-2xl text-olive-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">
                          WhatsApp
                        </div>
                        <a 
                          href="https://wa.me/966123456789" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-olive-green-600 transition-colors"
                        >
                          {language === 'ar' ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-white shadow-md">
                        <EnvironmentOutlined className="text-2xl text-olive-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">
                          {language === 'ar' ? 'العنوان' : 'Address'}
                        </div>
                        <div className="text-gray-600">
                          {language === 'ar'
                            ? 'الرياض، المملكة العربية السعودية'
                            : 'Riyadh, Saudi Arabia'}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Map */}
                <Card 
                  className="shadow-xl border-0 rounded-2xl overflow-hidden"
                  styles={{ body: { padding: '0' } }}
                >
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.5!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2s!4v1234567890"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Location Map"
                  />
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </Content>
      <Footer />
      <ScrollToTop />
    </Layout>
  )
}

export default ContactPage


