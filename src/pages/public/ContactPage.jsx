import React from 'react'
import { Layout, Form, Input, Button, Row, Col, Card } from 'antd'
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, WhatsAppOutlined } from '@ant-design/icons'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import { useLanguage } from '../../contexts/LanguageContext'

const { Content } = Layout
const { TextArea } = Input

const ContactPage = () => {
  const { t, language } = useLanguage()
  const [form] = Form.useForm()

  const onFinish = (values) => {
    console.log('Form values:', values)
    // Handle form submission
  }

  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t('contact')}</h1>
            <p className="text-lg text-gray-600">
              {language === 'ar'
                ? 'نحن هنا لمساعدتك. تواصل معنا اليوم'
                : 'We are here to help. Contact us today'}
            </p>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} lg={12}>
              <Card className="card h-full">
                <h2 className="text-2xl font-bold mb-6">
                  {language === 'ar' ? 'إرسال رسالة' : 'Send Message'}
                </h2>
                <Form form={form} onFinish={onFinish} layout="vertical">
                  <Form.Item
                    name="name"
                    label={language === 'ar' ? 'الاسم' : 'Name'}
                    rules={[{ required: true }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    rules={[{ required: true, type: 'email' }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    label={language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                  >
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item
                    name="message"
                    label={language === 'ar' ? 'الرسالة' : 'Message'}
                    rules={[{ required: true }]}
                  >
                    <TextArea rows={6} />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      className="bg-olive-green-600 hover:bg-olive-green-700 border-0 w-full"
                    >
                      {language === 'ar' ? 'إرسال' : 'Send'}
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <div className="space-y-6">
                <Card className="card">
                  <h3 className="text-xl font-bold mb-4">
                    {t('contactInfo')}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <PhoneOutlined className="text-2xl text-turquoise-500" />
                      <div>
                        <div className="font-semibold">
                          {language === 'ar' ? 'الهاتف' : 'Phone'}
                        </div>
                        <div className="text-gray-600">+966 12 345 6789</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <MailOutlined className="text-2xl text-turquoise-500" />
                      <div>
                        <div className="font-semibold">
                          {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                        </div>
                        <div className="text-gray-600">info@jadwa.com</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <WhatsAppOutlined className="text-2xl text-turquoise-500" />
                      <div>
                        <div className="font-semibold">WhatsApp</div>
                        <a href="#" className="text-olive-green-600 hover:underline">
                          {language === 'ar' ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <EnvironmentOutlined className="text-2xl text-turquoise-500 mt-1" />
                      <div>
                        <div className="font-semibold">
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
                <div className="card">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.5!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDQyJzQ5LjAiTiA0NsKwNDAnMzEuMSJF!5e0!3m2!1sen!2s!4v1234567890"
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: '8px' }}
                    allowFullScreen
                    loading="lazy"
                    title="Location Map"
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Content>
      <Footer />
    </Layout>
  )
}

export default ContactPage

