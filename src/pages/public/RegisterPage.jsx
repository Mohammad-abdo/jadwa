import React, { useState } from 'react'
import { Layout, Card, Form, Input, Button, Select, message, DatePicker, Upload, Checkbox, Steps, Divider, Radio, Row, Col } from 'antd'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  UploadOutlined,
  CalendarOutlined,
  BankOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import dayjs from 'dayjs'

const { Content } = Layout
const { Option } = Select
const { TextArea } = Input
const { Step } = Steps

const RegisterPage = () => {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onFinish = async (values) => {
    setLoading(true)
    try {
      // Prepare registration data based on role
      const registerData = {
        email: values.email,
        password: values.password,
        role: values.role.toUpperCase(),
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
        gender: values.gender,
        country: values.country || 'Saudi Arabia',
        city: values.city,
        address: values.address,
        postalCode: values.postalCode,
        preferredLanguage: values.preferredLanguage || 'ar',
        termsAccepted: values.termsAccepted || false,
      }

      // Add role-specific fields
      if (values.role === 'client') {
        registerData.accountType = values.accountType
        registerData.sector = values.sector
        registerData.companyName = values.companyName
        registerData.preferredServices = values.preferredServices || []
        registerData.registrationPurpose = values.registrationPurpose
        registerData.preferredConsultantId = values.preferredConsultantId
        registerData.preferredPaymentMethod = values.preferredPaymentMethod
        registerData.invoiceAddress = values.invoiceAddress
        registerData.taxNumber = values.taxNumber
        registerData.notificationEmail = values.notificationEmail !== false
        registerData.notificationApp = values.notificationApp !== false
        registerData.notificationWhatsApp = values.notificationWhatsApp || false

        // Company/Entity specific fields
        if (values.accountType === 'COMPANY' || values.accountType === 'GOVERNMENT_ENTITY') {
          registerData.commercialRegister = values.commercialRegister
          registerData.taxNumber = values.taxNumber
          registerData.economicSector = values.economicSector
          registerData.industry = values.industry
          registerData.numberOfEmployees = values.numberOfEmployees
          registerData.companyLogo = values.companyLogo
          registerData.entityDefinition = values.entityDefinition
        }
      } else if (values.role === 'consultant') {
        registerData.academicDegree = values.academicDegree
        registerData.specialization = values.specialization
        registerData.bio = values.bio
        registerData.pricePerSession = values.pricePerSession || 0
        registerData.sessionDuration = values.sessionDuration || 60
        registerData.consultationMode = values.consultationMode || []
        registerData.yearsOfExperience = values.yearsOfExperience || 0
        registerData.previousEmployers = values.previousEmployers
        registerData.areasOfExpertise = values.areasOfExpertise || []
        registerData.implementedProjects = values.implementedProjects || []
        registerData.languages = values.languages || []
        registerData.certifications = values.certifications || []
        registerData.education = values.education || []
        registerData.profilePicture = values.profilePicture
        registerData.bankAccount = values.bankAccount
        registerData.bankName = values.bankName
        registerData.iban = values.iban
        registerData.academicCertificates = values.academicCertificates || []
        registerData.nationalId = values.nationalId
        registerData.consultingLicense = values.consultingLicense
        registerData.cvUrl = values.cvUrl
        registerData.acceptsSessions = values.acceptsSessions !== false
      }

      const result = await register(registerData)

      if (result.success) {
        message.success(language === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully')
        // Navigate based on user role
        const userRole = result.user.role
        if (userRole === 'CLIENT') {
          navigate('/client', { replace: true })
        } else if (userRole === 'CONSULTANT') {
          navigate('/consultant', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      }
    } catch (error) {
      message.error(error.message || (language === 'ar' ? 'فشل إنشاء الحساب' : 'Failed to create account'))
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  const role = Form.useWatch('role', form)
  const accountType = Form.useWatch('accountType', form)

  const steps = [
    {
      title: language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information',
      content: 'basic',
    },
    {
      title: role === 'client' 
        ? (language === 'ar' ? 'معلومات العميل' : 'Client Information')
        : (language === 'ar' ? 'المؤهلات الأكاديمية' : 'Academic Qualifications'),
      content: 'role-specific',
    },
    {
      title: role === 'client'
        ? (language === 'ar' ? 'الخدمات والإعدادات' : 'Services & Settings')
        : (language === 'ar' ? 'الخبرات والخدمات' : 'Experience & Services'),
      content: 'additional',
    },
    {
      title: role === 'client'
        ? (language === 'ar' ? 'المعلومات المالية' : 'Financial Information')
        : (language === 'ar' ? 'المعلومات المالية' : 'Financial Information'),
      content: 'financial',
    },
  ]

  const renderBasicInfo = () => (
    <>
      <Form.Item
        name="role"
        label={language === 'ar' ? 'نوع الحساب' : 'Account Type'}
        rules={[{ required: true }]}
      >
        <Select placeholder={language === 'ar' ? 'اختر نوع الحساب' : 'Select account type'}>
          <Option value="client">{language === 'ar' ? 'عميل' : 'Client'}</Option>
          <Option value="consultant">{language === 'ar' ? 'مستشار' : 'Consultant'}</Option>
        </Select>
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="firstName"
            label={language === 'ar' ? 'الاسم الأول' : 'First Name'}
            rules={[{ required: true, message: language === 'ar' ? 'مطلوب' : 'Required' }]}
          >
            <Input prefix={<UserOutlined />} placeholder={language === 'ar' ? 'الاسم الأول' : 'First Name'} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="lastName"
            label={language === 'ar' ? 'اسم العائلة' : 'Last Name'}
            rules={[{ required: true, message: language === 'ar' ? 'مطلوب' : 'Required' }]}
          >
            <Input prefix={<UserOutlined />} placeholder={language === 'ar' ? 'اسم العائلة' : 'Last Name'} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="email"
        label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
        rules={[
          { required: true, message: language === 'ar' ? 'مطلوب' : 'Required' },
          { type: 'email', message: language === 'ar' ? 'بريد إلكتروني غير صحيح' : 'Invalid email' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'} />
      </Form.Item>

      <Form.Item
        name="phone"
        label={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
        rules={[{ required: true, message: language === 'ar' ? 'مطلوب' : 'Required' }]}
      >
        <Input prefix={<PhoneOutlined />} placeholder="+966 5XX XXX XXX" />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="password"
            label={language === 'ar' ? 'كلمة المرور' : 'Password'}
            rules={[
              { required: true, message: language === 'ar' ? 'مطلوب' : 'Required' },
              { min: 8, message: language === 'ar' ? '8 أحرف على الأقل' : 'At least 8 characters' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="confirmPassword"
            label={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            dependencies={['password']}
            rules={[
              { required: true, message: language === 'ar' ? 'مطلوب' : 'Required' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item name="dateOfBirth" label={language === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}>
            <DatePicker className="w-full" placeholder={language === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item name="gender" label={language === 'ar' ? 'الجنس' : 'Gender'}>
            <Select placeholder={language === 'ar' ? 'اختر الجنس' : 'Select Gender'}>
              <Option value="MALE">{language === 'ar' ? 'ذكر' : 'Male'}</Option>
              <Option value="FEMALE">{language === 'ar' ? 'أنثى' : 'Female'}</Option>
              <Option value="OTHER">{language === 'ar' ? 'أخرى' : 'Other'}</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item name="preferredLanguage" label={language === 'ar' ? 'اللغة المفضلة' : 'Preferred Language'}>
            <Select defaultValue="ar">
              <Option value="ar">{language === 'ar' ? 'العربية' : 'Arabic'}</Option>
              <Option value="en">{language === 'ar' ? 'الإنجليزية' : 'English'}</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="city" label={language === 'ar' ? 'المدينة' : 'City'}>
            <Input prefix={<HomeOutlined />} placeholder={language === 'ar' ? 'المدينة' : 'City'} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="country" label={language === 'ar' ? 'الدولة' : 'Country'}>
            <Select defaultValue="Saudi Arabia">
              <Option value="Saudi Arabia">{language === 'ar' ? 'السعودية' : 'Saudi Arabia'}</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="address" label={language === 'ar' ? 'العنوان' : 'Address'}>
        <TextArea rows={2} placeholder={language === 'ar' ? 'العنوان الكامل' : 'Full Address'} />
      </Form.Item>

      <Form.Item name="postalCode" label={language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}>
        <Input placeholder={language === 'ar' ? 'الرمز البريدي' : 'Postal Code'} />
      </Form.Item>
    </>
  )

  const renderClientSpecific = () => (
    <>
      <Form.Item
        name="accountType"
        label={language === 'ar' ? 'نوع الحساب' : 'Account Type'}
        rules={[{ required: true }]}
      >
        <Radio.Group>
          <Radio value="INDIVIDUAL">{language === 'ar' ? 'فرد' : 'Individual'}</Radio>
          <Radio value="COMPANY">{language === 'ar' ? 'شركة' : 'Company'}</Radio>
          <Radio value="GOVERNMENT_ENTITY">{language === 'ar' ? 'جهة حكومية' : 'Government Entity'}</Radio>
        </Radio.Group>
      </Form.Item>

      {(accountType === 'COMPANY' || accountType === 'GOVERNMENT_ENTITY') && (
        <>
          <Form.Item name="companyName" label={language === 'ar' ? 'اسم المنشأة' : 'Establishment Name'}>
            <Input placeholder={language === 'ar' ? 'الاسم التجاري' : 'Commercial Name'} />
          </Form.Item>
          <Form.Item name="commercialRegister" label={language === 'ar' ? 'رقم السجل التجاري' : 'Commercial Register Number'}>
            <Input placeholder={language === 'ar' ? 'رقم السجل التجاري' : 'Commercial Register Number'} />
          </Form.Item>
          <Form.Item name="taxNumber" label={language === 'ar' ? 'الرقم الضريبي' : 'Tax Number'}>
            <Input placeholder={language === 'ar' ? 'الرقم الضريبي (اختياري)' : 'Tax Number (Optional)'} />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="economicSector" label={language === 'ar' ? 'القطاع الاقتصادي' : 'Economic Sector'}>
                <Select placeholder={language === 'ar' ? 'اختر القطاع' : 'Select Sector'}>
                  <Option value="GOVERNMENT">{language === 'ar' ? 'حكومي' : 'Government'}</Option>
                  <Option value="PRIVATE">{language === 'ar' ? 'خاص' : 'Private'}</Option>
                  <Option value="NON_PROFIT">{language === 'ar' ? 'غير ربحي' : 'Non-profit'}</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="industry" label={language === 'ar' ? 'المجال' : 'Industry'}>
                <Select placeholder={language === 'ar' ? 'اختر المجال' : 'Select Industry'}>
                  <Option value="INDUSTRIAL">{language === 'ar' ? 'صناعي' : 'Industrial'}</Option>
                  <Option value="COMMERCIAL">{language === 'ar' ? 'تجاري' : 'Commercial'}</Option>
                  <Option value="SERVICE">{language === 'ar' ? 'خدمي' : 'Service'}</Option>
                  <Option value="FINANCIAL">{language === 'ar' ? 'مالي' : 'Financial'}</Option>
                  <Option value="CONSULTING">{language === 'ar' ? 'استشاري' : 'Consulting'}</Option>
                  <Option value="EDUCATIONAL">{language === 'ar' ? 'تعليمي' : 'Educational'}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="numberOfEmployees" label={language === 'ar' ? 'عدد الموظفين (تقديري)' : 'Number of Employees (Estimated)'}>
            <Input type="number" min={0} placeholder={language === 'ar' ? 'عدد الموظفين' : 'Number of Employees'} />
          </Form.Item>
        </>
      )}

      <Form.Item name="sector" label={language === 'ar' ? 'القطاع' : 'Sector'}>
        <Input placeholder={language === 'ar' ? 'القطاع' : 'Sector'} />
      </Form.Item>
    </>
  )

  const renderConsultantSpecific = () => (
    <>
      <Form.Item
        name="academicDegree"
        label={language === 'ar' ? 'الدرجة العلمية' : 'Academic Degree'}
        rules={[{ required: true, message: language === 'ar' ? 'مطلوب' : 'Required' }]}
      >
        <Select placeholder={language === 'ar' ? 'اختر الدرجة العلمية' : 'Select Academic Degree'}>
          <Option value="BACHELOR">{language === 'ar' ? 'بكالوريوس' : 'Bachelor'}</Option>
          <Option value="MASTER">{language === 'ar' ? 'ماجستير' : 'Master'}</Option>
          <Option value="PHD">{language === 'ar' ? 'دكتوراه' : 'PhD'}</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="specialization"
        label={language === 'ar' ? 'التخصص العام' : 'General Specialization'}
        rules={[{ required: true, message: language === 'ar' ? 'مطلوب' : 'Required' }]}
      >
        <Select placeholder={language === 'ar' ? 'اختر التخصص' : 'Select Specialization'}>
          <Option value="ECONOMICS">{language === 'ar' ? 'اقتصاد' : 'Economics'}</Option>
          <Option value="MANAGEMENT">{language === 'ar' ? 'إدارة' : 'Management'}</Option>
          <Option value="FINANCE">{language === 'ar' ? 'مالية' : 'Finance'}</Option>
          <Option value="MARKETING">{language === 'ar' ? 'تسويق' : 'Marketing'}</Option>
          <Option value="ACCOUNTING">{language === 'ar' ? 'محاسبة' : 'Accounting'}</Option>
        </Select>
      </Form.Item>

      <Form.Item name="specificSpecialization" label={language === 'ar' ? 'التخصص الدقيق' : 'Specific Specialization'}>
        <Input placeholder={language === 'ar' ? 'مثل: اقتصاد قياسي / تمويل / موارد بشرية' : 'e.g., Econometrics / Finance / HR'} />
      </Form.Item>

      <Form.Item name="bio" label={language === 'ar' ? 'نبذة مختصرة' : 'Brief Biography'}>
        <TextArea rows={4} placeholder={language === 'ar' ? 'اكتب نبذة عنك' : 'Write about yourself'} />
      </Form.Item>

      <Form.Item name="yearsOfExperience" label={language === 'ar' ? 'عدد سنوات الخبرة' : 'Years of Experience'}>
        <Input type="number" min={0} placeholder={language === 'ar' ? 'عدد السنوات' : 'Years'} />
      </Form.Item>

      <Form.Item name="previousEmployers" label={language === 'ar' ? 'الجهات السابقة' : 'Previous Employers'}>
        <TextArea rows={3} placeholder={language === 'ar' ? 'أهم المناصب السابقة' : 'Most important previous positions'} />
      </Form.Item>

      <Form.Item name="areasOfExpertise" label={language === 'ar' ? 'مجالات الخبرة' : 'Areas of Expertise'}>
        <Select mode="tags" placeholder={language === 'ar' ? 'مثل: دراسات جدوى - استشارات مالية' : 'e.g., Feasibility Studies - Financial Consulting'}>
        </Select>
      </Form.Item>

      <Form.Item name="implementedProjects" label={language === 'ar' ? 'المشاريع المنفذة' : 'Implemented Projects'}>
        <TextArea rows={3} placeholder={language === 'ar' ? 'أمثلة مختصرة' : 'Brief examples'} />
      </Form.Item>

      <Form.Item name="languages" label={language === 'ar' ? 'اللغات' : 'Languages'}>
        <Select mode="tags" placeholder={language === 'ar' ? 'اللغات التي تتحدثها' : 'Languages you speak'}>
        </Select>
      </Form.Item>

      <Form.Item name="certifications" label={language === 'ar' ? 'الشهادات المهنية' : 'Professional Certifications'}>
        <Select mode="tags" placeholder={language === 'ar' ? 'مثل: CFA / PMP / CMA' : 'e.g., CFA / PMP / CMA'}>
        </Select>
      </Form.Item>

      <Form.Item name="education" label={language === 'ar' ? 'التعليم' : 'Education'}>
        <TextArea rows={3} placeholder={language === 'ar' ? 'الجامعة المانحة وسنة التخرج' : 'Issuing University and Graduation Year'} />
      </Form.Item>
    </>
  )

  const renderClientAdditional = () => (
    <>
      <Form.Item name="preferredServices" label={language === 'ar' ? 'نوع الخدمة المطلوبة' : 'Type of Required Service'}>
        <Select mode="multiple" placeholder={language === 'ar' ? 'اختر الخدمات' : 'Select Services'}>
          <Option value="ECONOMIC">{language === 'ar' ? 'اقتصادية' : 'Economic'}</Option>
          <Option value="FINANCIAL">{language === 'ar' ? 'مالية' : 'Financial'}</Option>
          <Option value="ADMINISTRATIVE">{language === 'ar' ? 'إدارية' : 'Administrative'}</Option>
          <Option value="FEASIBILITY_STUDY">{language === 'ar' ? 'دراسات جدوى' : 'Feasibility Studies'}</Option>
          <Option value="ANALYSIS">{language === 'ar' ? 'تحليل' : 'Analysis'}</Option>
        </Select>
      </Form.Item>

      <Form.Item name="registrationPurpose" label={language === 'ar' ? 'الهدف من التسجيل' : 'Purpose of Registration'}>
        <TextArea rows={3} placeholder={language === 'ar' ? 'مثل: تأسيس مشروع / استشارة مالية / تحليل سوق' : 'e.g., Project establishment / Financial consultation / Market analysis'} />
      </Form.Item>

      <Divider>{language === 'ar' ? 'الإشعارات' : 'Notifications'}</Divider>

      <Form.Item name="notificationEmail" valuePropName="checked" initialValue={true}>
        <Checkbox>{language === 'ar' ? 'تفعيل إشعارات البريد الإلكتروني' : 'Activate Email Notifications'}</Checkbox>
      </Form.Item>

      <Form.Item name="notificationApp" valuePropName="checked" initialValue={true}>
        <Checkbox>{language === 'ar' ? 'تفعيل إشعارات التطبيق' : 'Activate Application Notifications'}</Checkbox>
      </Form.Item>

      <Form.Item name="notificationWhatsApp" valuePropName="checked">
        <Checkbox>{language === 'ar' ? 'تفعيل إشعارات واتساب / الجوال' : 'Activate WhatsApp / Mobile Notifications'}</Checkbox>
      </Form.Item>

      <Form.Item
        name="termsAccepted"
        valuePropName="checked"
        rules={[{ required: true, message: language === 'ar' ? 'يجب قبول الشروط والأحكام' : 'Must accept terms and conditions' }]}
      >
        <Checkbox>{language === 'ar' ? 'أوافق على الشروط والأحكام' : 'I accept the terms and conditions'}</Checkbox>
      </Form.Item>
    </>
  )

  const renderConsultantAdditional = () => (
    <>
      <Form.Item
        name="pricePerSession"
        label={language === 'ar' ? 'سعر الجلسة (ريال سعودي)' : 'Session Price (SAR)'}
        rules={[{ required: true, message: language === 'ar' ? 'مطلوب' : 'Required' }]}
      >
        <Input type="number" min={0} placeholder="500" />
      </Form.Item>

      <Form.Item
        name="sessionDuration"
        label={language === 'ar' ? 'مدة الجلسة الافتراضية' : 'Default Session Duration'}
      >
        <Select defaultValue={60}>
          <Option value={30}>30 {language === 'ar' ? 'دقيقة' : 'minutes'}</Option>
          <Option value={60}>60 {language === 'ar' ? 'دقيقة' : 'minutes'}</Option>
          <Option value={90}>90 {language === 'ar' ? 'دقيقة' : 'minutes'}</Option>
        </Select>
      </Form.Item>

      <Form.Item name="consultationMode" label={language === 'ar' ? 'نمط الاستشارة' : 'Consultation Mode'}>
        <Select mode="multiple" placeholder={language === 'ar' ? 'اختر أنماط الاستشارة' : 'Select Consultation Modes'}>
          <Option value="VIDEO">{language === 'ar' ? 'مرئية' : 'Video'}</Option>
          <Option value="CHAT">{language === 'ar' ? 'شات' : 'Chat'}</Option>
          <Option value="REPORT">{language === 'ar' ? 'تقارير' : 'Reports'}</Option>
          <Option value="WRITTEN_STUDY">{language === 'ar' ? 'دراسات مكتوبة' : 'Written Studies'}</Option>
        </Select>
      </Form.Item>

      <Form.Item name="acceptsSessions" valuePropName="checked" initialValue={true}>
        <Checkbox>{language === 'ar' ? 'تفعيل استقبال الجلسات' : 'Activate Session Reception'}</Checkbox>
      </Form.Item>
    </>
  )

  const renderFinancial = () => {
    if (role === 'client') {
      return (
        <>
          <Form.Item name="preferredPaymentMethod" label={language === 'ar' ? 'طريقة الدفع المفضلة' : 'Preferred Payment Method'}>
            <Select placeholder={language === 'ar' ? 'اختر طريقة الدفع' : 'Select Payment Method'}>
              <Option value="CREDIT_CARD">{language === 'ar' ? 'بطاقة' : 'Card'}</Option>
              <Option value="MADA">Mada</Option>
              <Option value="APPLE_PAY">Apple Pay</Option>
              <Option value="BANK_TRANSFER">{language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</Option>
            </Select>
          </Form.Item>

          <Form.Item name="taxNumber" label={language === 'ar' ? 'رقم الهوية أو السجل الضريبي' : 'ID Number or Tax Register'}>
            <Input placeholder={language === 'ar' ? 'يظهر في الفاتورة' : 'Appears in Invoice'} />
          </Form.Item>

          <Form.Item name="invoiceAddress" label={language === 'ar' ? 'عنوان الفاتورة' : 'Invoice Address'}>
            <TextArea rows={3} placeholder={language === 'ar' ? 'يظهر في الفواتير الإلكترونية' : 'Appears in Electronic Invoices'} />
          </Form.Item>
        </>
      )
    } else {
      return (
        <>
          <Form.Item name="bankAccount" label={language === 'ar' ? 'رقم الحساب البنكي / الأيبان' : 'Bank Account Number / IBAN'}>
            <Input placeholder={language === 'ar' ? 'للتحويل المستحقات' : 'For transferring dues'} />
          </Form.Item>

          <Form.Item name="bankName" label={language === 'ar' ? 'اسم البنك' : 'Bank Name'}>
            <Select placeholder={language === 'ar' ? 'بنوك المملكة' : 'Banks of the Kingdom'}>
              <Option value="AL_RAJHI">{language === 'ar' ? 'الراجحي' : 'Al Rajhi'}</Option>
              <Option value="AL_AHLI">{language === 'ar' ? 'الأهلي' : 'Al Ahli'}</Option>
              <Option value="RIYAD">{language === 'ar' ? 'الرياض' : 'Riyad'}</Option>
              <Option value="SABB">{language === 'ar' ? 'ساب' : 'SABB'}</Option>
              <Option value="NCB">{language === 'ar' ? 'الوطني' : 'NCB'}</Option>
            </Select>
          </Form.Item>

          <Form.Item name="iban" label={language === 'ar' ? 'الأيبان' : 'IBAN'}>
            <Input placeholder="SA..." />
          </Form.Item>
        </>
      )
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo()
      case 1:
        return role === 'client' ? renderClientSpecific() : renderConsultantSpecific()
      case 2:
        return role === 'client' ? renderClientAdditional() : renderConsultantAdditional()
      case 3:
        return renderFinancial()
      default:
        return null
    }
  }

  const next = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1)
    }).catch(() => {})
  }

  const prev = () => {
    setCurrentStep(currentStep - 1)
  }

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-olive-green-50 to-turquoise-50">
      <Content className="flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-4xl shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-olive-green-600 to-turquoise-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">ج</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Jadwa</h1>
            <p className="text-gray-600">
              {language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
            </p>
          </div>

          <Steps current={currentStep} className="mb-8">
            {steps.map((step, index) => (
              <Step key={index} title={step.title} />
            ))}
          </Steps>

          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            initialValues={{ role: 'client', preferredLanguage: 'ar', country: 'Saudi Arabia', sessionDuration: 60 }}
            size="large"
          >
            {renderStepContent()}

            <div className="flex justify-between mt-6">
              {currentStep > 0 && (
                <Button onClick={prev}>
                  {language === 'ar' ? 'السابق' : 'Previous'}
                </Button>
              )}
              <div className="flex-1" />
              {currentStep < steps.length - 1 ? (
                <Button type="primary" onClick={next} className="bg-olive-green-600 hover:bg-olive-green-700 border-0">
                  {language === 'ar' ? 'التالي' : 'Next'}
                </Button>
              ) : (
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
                  loading={loading}
                  disabled={loading}
                >
                  {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
                </Button>
              )}
            </div>

            <div className="text-center mt-4">
              <span className="text-gray-600">
                {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
              </span>
              <Link to="/login" className="text-olive-green-600 hover:text-olive-green-700 font-semibold">
                {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </Link>
            </div>
          </Form>
        </Card>
      </Content>
    </Layout>
  )
}

export default RegisterPage
