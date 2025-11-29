import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Tabs, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  message, 
  Divider, 
  Alert, 
  Upload, 
  Radio,
  Row,
  Col,
  Space,
  Badge,
  Tooltip,
  Typography
} from 'antd'
import { 
  SaveOutlined, 
  ReloadOutlined, 
  UploadOutlined, 
  SettingOutlined,
  DollarOutlined,
  ApiOutlined,
  BgColorsOutlined,
  BellOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  FontSizeOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  LockOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'
import { settingsAPI } from '../../services/api'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const AdminSettings = () => {
  const { t, language } = useLanguage()
  const { theme, toggleTheme, settings, updateSettings } = useTheme()
  const [generalForm] = Form.useForm()
  const [paymentForm] = Form.useForm()
  const [integrationForm] = Form.useForm()
  const [appearanceForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    appearanceForm.setFieldsValue({
      dashboardName: settings.dashboardName,
      dashboardNameAr: settings.dashboardNameAr,
      primaryFont: settings.primaryFont,
      arabicFont: settings.arabicFont,
      animationsEnabled: settings.animationsEnabled,
      animationSpeed: settings.animationSpeed,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
    })
  }, [settings, appearanceForm])

  useEffect(() => {
    fetchGeneralSettings()
  }, [])

  const fetchGeneralSettings = async () => {
    try {
      const response = await settingsAPI.getGeneralSettings()
      if (response.settings) {
        generalForm.setFieldsValue({
          platformName: response.settings.platformName || 'Jadwa Consulting',
          email: response.settings.platformEmail || 'info@jadwa.com',
          phone: response.settings.platformPhone || '+966 12 345 6789',
          address: response.settings.platformAddress || '',
          enableNotifications: response.settings.enableNotifications !== false,
          enableEmailNotifications: response.settings.enableEmailNotifications !== false,
        })
      }
    } catch (err) {
      console.error('Error fetching general settings:', err)
    }
  }

  const handleGeneralSubmit = async (values) => {
    try {
      setLoading(true)
      await settingsAPI.updateGeneralSettings({
        platformName: values.platformName,
        platformEmail: values.email,
        platformPhone: values.phone,
        platformAddress: values.address,
        enableNotifications: values.enableNotifications,
        enableEmailNotifications: values.enableEmailNotifications,
      })
      message.success(language === 'ar' ? 'تم حفظ الإعدادات العامة بنجاح' : 'General settings saved successfully')
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentSettings()
  }, [])

  const fetchPaymentSettings = async () => {
    try {
      const response = await settingsAPI.getPaymentSettings()
      if (response.settings) {
        paymentForm.setFieldsValue({
          gateway: response.settings.paymentGateway || 'tap',
          apiKey: response.settings.paymentApiKey || '',
          secretKey: response.settings.paymentSecretKey || '',
          commissionRate: response.settings.commissionRate || 15,
          enableAutoPayout: response.settings.enableAutoPayout || false,
        })
      }
    } catch (err) {
      console.error('Error fetching payment settings:', err)
    }
  }

  const handlePaymentSubmit = async (values) => {
    try {
      setLoading(true)
      await settingsAPI.updatePaymentSettings({
        paymentGateway: values.gateway,
        paymentApiKey: values.apiKey,
        paymentSecretKey: values.secretKey,
        commissionRate: values.commissionRate,
        enableAutoPayout: values.enableAutoPayout,
      })
      message.success(language === 'ar' ? 'تم حفظ إعدادات الدفع بنجاح' : 'Payment settings saved successfully')
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIntegrationSettings()
  }, [])

  const fetchIntegrationSettings = async () => {
    try {
      const response = await settingsAPI.getIntegrationSettings()
      if (response.settings) {
        integrationForm.setFieldsValue({
          videoService: response.settings.videoService || 'zoom',
          videoApiKey: response.settings.videoApiKey || '',
          emailService: response.settings.emailService || 'smtp',
          smtpHost: response.settings.smtpHost || '',
          smtpPort: response.settings.smtpPort || '',
          smtpUser: response.settings.smtpUser || '',
          smtpPassword: response.settings.smtpPassword || '',
        })
      }
    } catch (err) {
      console.error('Error fetching integration settings:', err)
    }
  }

  const handleIntegrationSubmit = async (values) => {
    try {
      setLoading(true)
      await settingsAPI.updateIntegrationSettings({
        videoService: values.videoService,
        videoApiKey: values.videoApiKey,
        emailService: values.emailService,
        smtpHost: values.smtpHost,
        smtpPort: values.smtpPort,
        smtpUser: values.smtpUser,
        smtpPassword: values.smtpPassword,
      })
      message.success(language === 'ar' ? 'تم حفظ إعدادات التكامل بنجاح' : 'Integration settings saved successfully')
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings'))
    } finally {
      setLoading(false)
    }
  }

  const handleAppearanceSubmit = async (values) => {
    try {
      setLoading(true)
      updateSettings({
        dashboardName: values.dashboardName,
        dashboardNameAr: values.dashboardNameAr,
        primaryFont: values.primaryFont,
        arabicFont: values.arabicFont,
        animationsEnabled: values.animationsEnabled,
        animationSpeed: values.animationSpeed,
        primaryColor: values.primaryColor,
        secondaryColor: values.secondaryColor,
      })
      await new Promise(resolve => setTimeout(resolve, 500))
      message.success(language === 'ar' ? 'تم حفظ إعدادات المظهر بنجاح' : 'Appearance settings saved successfully')
    } catch (err) {
      message.error(language === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      updateSettings({ logo: e.target.result })
      message.success(language === 'ar' ? 'تم رفع الشعار بنجاح' : 'Logo uploaded successfully')
    }
    reader.readAsDataURL(file)
    return false
  }

  const tabItems = [
    {
      key: 'general',
      label: (
        <Space>
          <SettingOutlined />
          <span>{language === 'ar' ? 'عام' : 'General'}</span>
        </Space>
      ),
      children: (
        <div className="space-y-6">
          <Card 
            className="border-0 shadow-sm"
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <GlobalOutlined className="text-white text-lg" />
                </div>
                <div>
                  <Title level={5} className="mb-0">{language === 'ar' ? 'معلومات المنصة' : 'Platform Information'}</Title>
                  <Text type="secondary" className="text-xs">{language === 'ar' ? 'المعلومات الأساسية للمنصة' : 'Basic platform information'}</Text>
                </div>
              </div>
            }
          >
            <Form 
              form={generalForm} 
              layout="vertical"
              onFinish={handleGeneralSubmit}
            >
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="platformName" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'اسم المنصة' : 'Platform Name'}
                      </span>
                    }
                    rules={[{ required: true, message: language === 'ar' ? 'يرجى إدخال اسم المنصة' : 'Please enter platform name' }]}
                  >
                    <Input 
                      size="large"
                      placeholder={language === 'ar' ? 'اسم المنصة' : 'Platform Name'}
                      prefix={<GlobalOutlined className="text-gray-400" />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="email" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      </span>
                    }
                    rules={[
                      { required: true, message: language === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter email' },
                      { type: 'email', message: language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email' }
                    ]}
                  >
                    <Input 
                      size="large"
                      type="email" 
                      placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      prefix={<MailOutlined className="text-gray-400" />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="phone" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                      </span>
                    }
                    rules={[{ required: true, message: language === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter phone number' }]}
                  >
                    <Input 
                      size="large"
                      placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                      prefix={<PhoneOutlined className="text-gray-400" />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="address" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'العنوان' : 'Address'}
                      </span>
                    }
                  >
                    <TextArea 
                      rows={3} 
                      placeholder={language === 'ar' ? 'العنوان' : 'Address'}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card 
            className="border-0 shadow-sm"
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <BellOutlined className="text-white text-lg" />
                </div>
                <div>
                  <Title level={5} className="mb-0">{language === 'ar' ? 'الإشعارات' : 'Notifications'}</Title>
                  <Text type="secondary" className="text-xs">{language === 'ar' ? 'إعدادات الإشعارات' : 'Notification settings'}</Text>
                </div>
              </div>
            }
          >
            <Form form={generalForm} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <BellOutlined className="text-lg text-gray-600" />
                      <div>
                        <Text strong>{language === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'}</Text>
                        <br />
                        <Text type="secondary" className="text-xs">
                          {language === 'ar' ? 'تفعيل الإشعارات العامة' : 'Enable general notifications'}
                        </Text>
                      </div>
                    </div>
                    <Form.Item name="enableNotifications" valuePropName="checked" className="mb-0">
                      <Switch />
                    </Form.Item>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <MailOutlined className="text-lg text-gray-600" />
                      <div>
                        <Text strong>{language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</Text>
                        <br />
                        <Text type="secondary" className="text-xs">
                          {language === 'ar' ? 'تفعيل إشعارات البريد الإلكتروني' : 'Enable email notifications'}
                        </Text>
                      </div>
                    </div>
                    <Form.Item name="enableEmailNotifications" valuePropName="checked" className="mb-0">
                      <Switch />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              size="large"
              onClick={() => generalForm.resetFields()}
            >
              {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={loading}
              onClick={() => generalForm.submit()}
              className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
            >
              {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: 'payment',
      label: (
        <Space>
          <DollarOutlined />
          <span>{language === 'ar' ? 'المدفوعات' : 'Payments'}</span>
        </Space>
      ),
      children: (
        <div className="space-y-6">
          <Alert
            message={language === 'ar' ? 'إعدادات الدفع' : 'Payment Settings'}
            description={language === 'ar' ? 'قم بتكوين إعدادات بوابة الدفع الخاصة بك. تأكد من الحفاظ على أمان مفاتيح API.' : 'Configure your payment gateway settings. Make sure to keep API keys secure.'}
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            className="mb-6"
          />

          <Card 
            className="border-0 shadow-sm"
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <DollarOutlined className="text-white text-lg" />
                </div>
                <div>
                  <Title level={5} className="mb-0">{language === 'ar' ? 'بوابة الدفع' : 'Payment Gateway'}</Title>
                  <Text type="secondary" className="text-xs">{language === 'ar' ? 'إعدادات بوابة الدفع' : 'Payment gateway configuration'}</Text>
                </div>
              </div>
            }
          >
            <Form 
              form={paymentForm} 
              layout="vertical"
              onFinish={handlePaymentSubmit}
            >
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="gateway" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'بوابة الدفع' : 'Payment Gateway'}
                      </span>
                    }
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      <Select.Option value="tap">Tap Payments</Select.Option>
                      <Select.Option value="moyasar">Moyasar</Select.Option>
                      <Select.Option value="stc">STC Pay</Select.Option>
                      <Select.Option value="paypal">PayPal</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="commissionRate" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'نسبة العمولة (%)' : 'Commission Rate (%)'}
                      </span>
                    }
                    rules={[{ required: true, type: 'number', min: 0, max: 100 }]}
                  >
                    <Input 
                      type="number" 
                      min={0} 
                      max={100} 
                      placeholder="15"
                      size="large"
                      suffix="%"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item 
                    name="apiKey" 
                    label={
                      <span className="font-semibold flex items-center gap-2">
                        <LockOutlined />
                        {language === 'ar' ? 'مفتاح API' : 'API Key'}
                      </span>
                    }
                    rules={[{ required: true }]}
                  >
                    <Input.Password 
                      size="large"
                      placeholder={language === 'ar' ? 'أدخل مفتاح API' : 'Enter API Key'}
                      iconRender={(visible) => (visible ? <EyeOutlined /> : <LockOutlined />)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item 
                    name="secretKey" 
                    label={
                      <span className="font-semibold flex items-center gap-2">
                        <LockOutlined />
                        {language === 'ar' ? 'المفتاح السري' : 'Secret Key'}
                      </span>
                    }
                    rules={[{ required: true }]}
                  >
                    <Input.Password 
                      size="large"
                      placeholder={language === 'ar' ? 'أدخل المفتاح السري' : 'Enter Secret Key'}
                      iconRender={(visible) => (visible ? <EyeOutlined /> : <LockOutlined />)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <CheckCircleOutlined className="text-lg text-gray-600" />
                      <div>
                        <Text strong>{language === 'ar' ? 'الدفع التلقائي للمستشارين' : 'Auto Payout for Consultants'}</Text>
                        <br />
                        <Text type="secondary" className="text-xs">
                          {language === 'ar' ? 'تفعيل الدفع التلقائي للمستشارين' : 'Enable automatic payout for consultants'}
                        </Text>
                      </div>
                    </div>
                    <Form.Item name="enableAutoPayout" valuePropName="checked" className="mb-0">
                      <Switch />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              size="large"
              onClick={() => paymentForm.resetFields()}
            >
              {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={loading}
              onClick={() => paymentForm.submit()}
              className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
            >
              {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: 'integrations',
      label: (
        <Space>
          <ApiOutlined />
          <span>{language === 'ar' ? 'التكاملات' : 'Integrations'}</span>
        </Space>
      ),
      children: (
        <div className="space-y-6">
          <Alert
            message={language === 'ar' ? 'التكاملات الخارجية' : 'External Integrations'}
            description={language === 'ar' ? 'قم بتكوين التكاملات مع الخدمات الخارجية مثل خدمات الفيديو والبريد الإلكتروني.' : 'Configure integrations with external services such as video services and email.'}
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            className="mb-6"
          />

          <Card 
            className="border-0 shadow-sm"
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <PlayCircleOutlined className="text-white text-lg" />
                </div>
                <div>
                  <Title level={5} className="mb-0">{language === 'ar' ? 'خدمة الفيديو' : 'Video Service'}</Title>
                  <Text type="secondary" className="text-xs">{language === 'ar' ? 'إعدادات خدمة الفيديو' : 'Video service configuration'}</Text>
                </div>
              </div>
            }
          >
            <Form 
              form={integrationForm} 
              layout="vertical"
              onFinish={handleIntegrationSubmit}
            >
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="videoService" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'خدمة الفيديو' : 'Video Service'}
                      </span>
                    }
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      <Select.Option value="zoom">Zoom</Select.Option>
                      <Select.Option value="twilio">Twilio</Select.Option>
                      <Select.Option value="jitsi">Jitsi Meet</Select.Option>
                      <Select.Option value="google-meet">Google Meet</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="videoApiKey" 
                    label={
                      <span className="font-semibold flex items-center gap-2">
                        <ApiOutlined />
                        {language === 'ar' ? 'مفتاح API للفيديو' : 'Video API Key'}
                      </span>
                    }
                  >
                    <Input.Password 
                      size="large"
                      placeholder={language === 'ar' ? 'أدخل مفتاح API' : 'Enter API Key'}
                      iconRender={(visible) => (visible ? <EyeOutlined /> : <LockOutlined />)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card 
            className="border-0 shadow-sm"
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <MailOutlined className="text-white text-lg" />
                </div>
                <div>
                  <Title level={5} className="mb-0">{language === 'ar' ? 'خدمة البريد الإلكتروني' : 'Email Service'}</Title>
                  <Text type="secondary" className="text-xs">{language === 'ar' ? 'إعدادات خدمة البريد الإلكتروني' : 'Email service configuration'}</Text>
                </div>
              </div>
            }
          >
            <Form form={integrationForm} layout="vertical">
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="emailService" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'خدمة البريد الإلكتروني' : 'Email Service'}
                      </span>
                    }
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      <Select.Option value="smtp">SMTP</Select.Option>
                      <Select.Option value="sendgrid">SendGrid</Select.Option>
                      <Select.Option value="mailgun">Mailgun</Select.Option>
                      <Select.Option value="ses">AWS SES</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="smtpHost" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'خادم SMTP' : 'SMTP Host'}
                      </span>
                    }
                  >
                    <Input 
                      size="large"
                      placeholder="smtp.example.com"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="smtpPort" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'منفذ SMTP' : 'SMTP Port'}
                      </span>
                    }
                  >
                    <Input 
                      type="number" 
                      size="large"
                      placeholder="587"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="smtpUser" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                      </span>
                    }
                  >
                    <Input 
                      size="large"
                      placeholder={language === 'ar' ? 'اسم المستخدم' : 'Username'}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item 
                    name="smtpPassword" 
                    label={
                      <span className="font-semibold flex items-center gap-2">
                        <LockOutlined />
                        {language === 'ar' ? 'كلمة المرور' : 'Password'}
                      </span>
                    }
                  >
                    <Input.Password 
                      size="large"
                      placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'}
                      iconRender={(visible) => (visible ? <EyeOutlined /> : <LockOutlined />)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              size="large"
              onClick={() => integrationForm.resetFields()}
            >
              {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={loading}
              onClick={() => integrationForm.submit()}
              className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
            >
              {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: 'appearance',
      label: (
        <Space>
          <BgColorsOutlined />
          <span>{language === 'ar' ? 'المظهر' : 'Appearance'}</span>
        </Space>
      ),
      children: (
        <div className="space-y-6">
          <Card 
            className="border-0 shadow-sm"
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <PictureOutlined className="text-white text-lg" />
                </div>
                <div>
                  <Title level={5} className="mb-0">{language === 'ar' ? 'الشعار والاسم' : 'Logo & Name'}</Title>
                  <Text type="secondary" className="text-xs">{language === 'ar' ? 'تخصيص شعار واسم لوحة التحكم' : 'Customize dashboard logo and name'}</Text>
                </div>
              </div>
            }
          >
            <Form form={appearanceForm} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="logo" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'شعار لوحة التحكم' : 'Dashboard Logo'}
                      </span>
                    }
                  >
                    <Upload
                      beforeUpload={handleLogoUpload}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button 
                        icon={<UploadOutlined />}
                        size="large"
                        block
                      >
                        {language === 'ar' ? 'رفع شعار' : 'Upload Logo'}
                      </Button>
                    </Upload>
                    {settings.logo && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <img src={settings.logo} alt="Logo" className="h-20 object-contain mx-auto" />
                      </div>
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="dashboardName" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'اسم لوحة التحكم (إنجليزي)' : 'Dashboard Name (English)'}
                      </span>
                    }
                    rules={[{ required: true }]}
                  >
                    <Input 
                      size="large"
                      placeholder="Jadwa"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="dashboardNameAr" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'اسم لوحة التحكم (عربي)' : 'Dashboard Name (Arabic)'}
                      </span>
                    }
                    rules={[{ required: true }]}
                  >
                    <Input 
                      size="large"
                      placeholder="جدوى"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card 
            className="border-0 shadow-sm"
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                  <FontSizeOutlined className="text-white text-lg" />
                </div>
                <div>
                  <Title level={5} className="mb-0">{language === 'ar' ? 'الخطوط' : 'Fonts'}</Title>
                  <Text type="secondary" className="text-xs">{language === 'ar' ? 'تخصيص الخطوط' : 'Customize fonts'}</Text>
                </div>
              </div>
            }
          >
            <Form form={appearanceForm} layout="vertical">
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="primaryFont" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'الخط الأساسي (إنجليزي)' : 'Primary Font (English)'}
                      </span>
                    }
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      <Select.Option value="Inter">Inter</Select.Option>
                      <Select.Option value="Roboto">Roboto</Select.Option>
                      <Select.Option value="Open Sans">Open Sans</Select.Option>
                      <Select.Option value="Poppins">Poppins</Select.Option>
                      <Select.Option value="Montserrat">Montserrat</Select.Option>
                      <Select.Option value="Lato">Lato</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="arabicFont" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'الخط العربي' : 'Arabic Font'}
                      </span>
                    }
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      <Select.Option value="Cairo">Cairo</Select.Option>
                      <Select.Option value="Tajawal">Tajawal</Select.Option>
                      <Select.Option value="Almarai">Almarai</Select.Option>
                      <Select.Option value="Changa">Changa</Select.Option>
                      <Select.Option value="IBM Plex Sans Arabic">IBM Plex Sans Arabic</Select.Option>
                      <Select.Option value="Noto Sans Arabic">Noto Sans Arabic</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card 
            className="border-0 shadow-sm"
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                  <BgColorsOutlined className="text-white text-lg" />
                </div>
                <div>
                  <Title level={5} className="mb-0">{language === 'ar' ? 'الألوان' : 'Colors'}</Title>
                  <Text type="secondary" className="text-xs">{language === 'ar' ? 'تخصيص ألوان المنصة' : 'Customize platform colors'}</Text>
                </div>
              </div>
            }
          >
            <Form form={appearanceForm} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="primaryColor" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'اللون الأساسي' : 'Primary Color'}
                      </span>
                    }
                    rules={[{ required: true }]}
                  >
                    <div className="flex items-center gap-3">
                      <Input 
                        type="color" 
                        value={settings.primaryColor}
                        onChange={(e) => {
                          appearanceForm.setFieldValue('primaryColor', e.target.value)
                          updateSettings({ primaryColor: e.target.value })
                        }}
                        className="w-16 h-12 rounded-lg cursor-pointer"
                        style={{ border: 'none' }}
                      />
                      <Input 
                        size="large"
                        value={settings.primaryColor}
                        onChange={(e) => {
                          appearanceForm.setFieldValue('primaryColor', e.target.value)
                          updateSettings({ primaryColor: e.target.value })
                        }}
                        placeholder="#7a8c66"
                      />
                    </div>
                    <div 
                      className="mt-2 h-8 rounded-lg"
                      style={{ backgroundColor: settings.primaryColor }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="secondaryColor" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'اللون الثانوي' : 'Secondary Color'}
                      </span>
                    }
                    rules={[{ required: true }]}
                  >
                    <div className="flex items-center gap-3">
                      <Input 
                        type="color" 
                        value={settings.secondaryColor}
                        onChange={(e) => {
                          appearanceForm.setFieldValue('secondaryColor', e.target.value)
                          updateSettings({ secondaryColor: e.target.value })
                        }}
                        className="w-16 h-12 rounded-lg cursor-pointer"
                        style={{ border: 'none' }}
                      />
                      <Input 
                        size="large"
                        value={settings.secondaryColor}
                        onChange={(e) => {
                          appearanceForm.setFieldValue('secondaryColor', e.target.value)
                          updateSettings({ secondaryColor: e.target.value })
                        }}
                        placeholder="#14b8a6"
                      />
                    </div>
                    <div 
                      className="mt-2 h-8 rounded-lg"
                      style={{ backgroundColor: settings.secondaryColor }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card 
            className="border-0 shadow-sm"
            title={
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <PlayCircleOutlined className="text-white text-lg" />
                </div>
                <div>
                  <Title level={5} className="mb-0">{language === 'ar' ? 'الرسوم المتحركة' : 'Animations'}</Title>
                  <Text type="secondary" className="text-xs">{language === 'ar' ? 'إعدادات الرسوم المتحركة' : 'Animation settings'}</Text>
                </div>
              </div>
            }
          >
            <Form form={appearanceForm} layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <PlayCircleOutlined className="text-lg text-gray-600" />
                      <div>
                        <Text strong>{language === 'ar' ? 'تفعيل الرسوم المتحركة' : 'Enable Animations'}</Text>
                        <br />
                        <Text type="secondary" className="text-xs">
                          {language === 'ar' ? 'تفعيل أو تعطيل الرسوم المتحركة' : 'Enable or disable animations'}
                        </Text>
                      </div>
                    </div>
                    <Form.Item name="animationsEnabled" valuePropName="checked" className="mb-0">
                      <Switch />
                    </Form.Item>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="animationSpeed" 
                    label={
                      <span className="font-semibold">
                        {language === 'ar' ? 'سرعة الرسوم المتحركة' : 'Animation Speed'}
                      </span>
                    }
                  >
                    <Radio.Group size="large">
                      <Radio.Button value="slow">{language === 'ar' ? 'بطيء' : 'Slow'}</Radio.Button>
                      <Radio.Button value="normal">{language === 'ar' ? 'عادي' : 'Normal'}</Radio.Button>
                      <Radio.Button value="fast">{language === 'ar' ? 'سريع' : 'Fast'}</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Alert
            message={language === 'ar' ? 'الوضع الفاتح فقط' : 'Light Mode Only'}
            description={language === 'ar' ? 'المنصة تعمل في الوضع الفاتح فقط لضمان تجربة مستخدم أفضل' : 'Platform operates in light mode only for better user experience'}
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            className="mb-4"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              size="large"
              onClick={() => {
                appearanceForm.setFieldsValue({
                  dashboardName: settings.dashboardName,
                  dashboardNameAr: settings.dashboardNameAr,
                  primaryFont: settings.primaryFont,
                  arabicFont: settings.arabicFont,
                  animationsEnabled: settings.animationsEnabled,
                  animationSpeed: settings.animationSpeed,
                  primaryColor: settings.primaryColor,
                  secondaryColor: settings.secondaryColor,
                })
              }}
            >
              {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={loading}
              onClick={() => appearanceForm.submit()}
              className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
            >
              {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
            </Button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Title level={2} className="mb-2 text-gray-900">
                {language === 'ar' ? 'الإعدادات' : 'Settings'}
              </Title>
              <Text className="text-gray-600 text-base">
                {language === 'ar' ? 'إدارة إعدادات المنصة والتكاملات والمظهر' : 'Manage platform settings, integrations, and appearance'}
              </Text>
            </div>
            <Badge count={4} showZero={false}>
              <Button 
                icon={<SettingOutlined />}
                size="large"
                className="bg-white border-gray-300"
              >
                {language === 'ar' ? 'الإعدادات السريعة' : 'Quick Settings'}
              </Button>
            </Badge>
          </div>
        </div>
        
        {/* Main Settings Card */}
        <Card 
          className="shadow-xl rounded-2xl border-0 overflow-hidden"
          styles={{ body: { padding: 0 } }}
        >
          <Tabs 
            items={tabItems}
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            type="line"
            className="settings-tabs px-6 pt-4"
            tabBarStyle={{
              marginBottom: 0,
              borderBottom: '1px solid #f0f0f0',
            }}
          />
        </Card>
      </div>
    </div>
  )
}

export default AdminSettings
