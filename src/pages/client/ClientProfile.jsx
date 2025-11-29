import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Switch, Row, Col, Avatar, Upload, Select, DatePicker, message, Divider, Tag, Statistic } from 'antd'
import { 
  UserOutlined, 
  CameraOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  BankOutlined,
  GlobalOutlined,
  LockOutlined,
  BellOutlined,
  SaveOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/api'
const { authAPI, filesAPI } = apiService
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

const ClientProfile = () => {
  const { t, language } = useLanguage()
  const { theme } = useTheme()
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await authAPI.getProfile()
      console.log('Profile response:', response)
      if (response.user) {
        setProfileData(response.user)
        if (response.user.client) {
          form.setFieldsValue({
            firstName: response.user.client.firstName || '',
            lastName: response.user.client.lastName || '',
            email: response.user.email || '',
            phone: response.user.phone || '',
            city: response.user.client.city || '',
            country: response.user.client.country || 'Saudi Arabia',
            address: response.user.client.address || '',
            postalCode: response.user.client.postalCode || '',
            sector: response.user.client.sector || '',
            companyName: response.user.client.companyName || '',
            companySize: response.user.client.companySize || '',
            jobTitle: response.user.client.jobTitle || '',
            website: response.user.client.website || '',
            linkedin: response.user.client.linkedin || '',
            twitter: response.user.client.twitter || '',
            dateOfBirth: response.user.client.dateOfBirth ? dayjs(response.user.client.dateOfBirth) : null,
            gender: response.user.client.gender || '',
            notificationEmail: response.user.client.notificationEmail !== undefined ? response.user.client.notificationEmail : true,
            notificationApp: response.user.client.notificationApp !== undefined ? response.user.client.notificationApp : true,
            notificationWhatsApp: response.user.client.notificationWhatsApp !== undefined ? response.user.client.notificationWhatsApp : true,
          })
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      message.error(err.message || (language === 'ar' ? 'فشل تحميل الملف الشخصي' : 'Failed to load profile'))
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (file) => {
    // Use filesAPI from import, or fallback to default export
    const uploadAPI = filesAPI || apiService?.filesAPI
    if (!uploadAPI) {
      console.error('filesAPI is not defined', { filesAPI, apiService })
      message.error(language === 'ar' ? 'خطأ في تحميل API' : 'API loading error')
      return false
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('ownerType', 'USER')
    formData.append('ownerId', user?.id || '')
    try {
      setLoading(true)
      const response = await uploadAPI.uploadFile(formData)
      if (response.file?.fileUrl) {
        // Update profile with new avatar URL
        await authAPI.updateProfile({ avatar: response.file.fileUrl })
        message.success(language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Avatar uploaded successfully')
        // Update local state immediately
        setProfileData(prev => ({ ...prev, avatar: response.file.fileUrl }))
        // Refresh profile
        await fetchProfile()
      }
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload avatar'))
    } finally {
      setLoading(false)
    }
    return false
  }

  const onFinish = async (values) => {
    try {
      setLoading(true)
      const updateData = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
      }
      // Update email separately if changed
      if (values.email && values.email !== profileData?.email) {
        await authAPI.updateEmail(values.email)
      }
      await authAPI.updateProfile(updateData)
      message.success(language === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Profile updated successfully')
      setEditMode(false)
      fetchProfile()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حفظ التغييرات' : 'Failed to save changes'))
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (values) => {
    try {
      setLoading(true)
      await authAPI.changePassword(values.currentPassword, values.newPassword)
      message.success(language === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully')
      form.setFieldsValue({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل تغيير كلمة المرور' : 'Failed to change password'))
    } finally {
      setLoading(false)
    }
  }

  const stats = profileData?.client ? {
    totalBookings: 0, // TODO: Get from API
    completedSessions: 0,
    totalSpent: 0,
  } : null

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'bg-gradient-to-r from-olive-green-600 to-turquoise-500 bg-clip-text text-transparent'}`}>
            {language === 'ar' ? 'الملف الشخصي' : 'Profile Settings'}
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {language === 'ar' ? 'إدارة معلوماتك الشخصية وإعدادات الحساب' : 'Manage your personal information and account settings'}
          </p>
        </div>

        <Row gutter={[24, 24]}>
          {/* Profile Card */}
          <Col xs={24} md={8}>
            <Card 
              className={`text-center shadow-professional-lg border-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            >
              <Upload 
                showUploadList={false}
                beforeUpload={handleAvatarUpload}
                accept="image/*"
              >
                <div className="relative inline-block mb-4">
                  <Avatar 
                    size={140} 
                    src={profileData?.avatar || user?.avatar || profileData?.client?.profilePicture} 
                    icon={<UserOutlined />}
                    className="ring-4 ring-olive-green-200"
                  />
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<CameraOutlined />}
                    className="absolute bottom-0 right-0 shadow-lg"
                    size="small"
                    style={{ backgroundColor: '#7a8c66' }}
                  />
                </div>
              </Upload>
              <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {profileData?.client ? `${profileData.client.firstName || ''} ${profileData.client.lastName || ''}`.trim() || user?.email : user?.email}
              </h2>
              <Tag color="blue" className="mb-4">
                {language === 'ar' ? 'عميل' : 'Client'}
              </Tag>
              
              {stats && (
                <div className="mt-6 space-y-4">
                  <Divider className="my-4" />
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title={language === 'ar' ? 'الحجوزات' : 'Bookings'}
                        value={stats.totalBookings}
                        valueStyle={{ fontSize: '18px', color: theme === 'dark' ? '#fff' : '#7a8c66' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title={language === 'ar' ? 'مكتملة' : 'Completed'}
                        value={stats.completedSessions}
                        valueStyle={{ fontSize: '18px', color: theme === 'dark' ? '#fff' : '#14b8a6' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title={language === 'ar' ? 'إجمالي' : 'Total'}
                        value={stats.totalSpent}
                        prefix="SAR"
                        valueStyle={{ fontSize: '18px', color: theme === 'dark' ? '#fff' : '#7a8c66' }}
                      />
                    </Col>
                  </Row>
                </div>
              )}
            </Card>
          </Col>

          {/* Form Section */}
          <Col xs={24} md={16}>
            <Card 
              className={`shadow-professional-lg border-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
                </h3>
                <Button
                  icon={editMode ? <CheckCircleOutlined /> : <EditOutlined />}
                  onClick={() => setEditMode(!editMode)}
                  type={editMode ? 'default' : 'primary'}
                >
                  {editMode ? (language === 'ar' ? 'إلغاء' : 'Cancel') : (language === 'ar' ? 'تعديل' : 'Edit')}
                </Button>
              </div>

              <Form 
                form={form} 
                onFinish={onFinish} 
                layout="vertical"
                disabled={!editMode}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="firstName"
                      label={language === 'ar' ? 'الاسم الأول' : 'First Name'}
                      rules={[{ required: true }]}
                    >
                      <Input size="large" prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="lastName"
                      label={language === 'ar' ? 'اسم العائلة' : 'Last Name'}
                      rules={[{ required: true }]}
                    >
                      <Input size="large" prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      rules={[{ required: true, type: 'email' }]}
                    >
                      <Input size="large" prefix={<MailOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="phone"
                      label={language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                    >
                      <Input size="large" prefix={<PhoneOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name="dateOfBirth"
                      label={language === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}
                    >
                      <DatePicker size="large" className="w-full" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name="gender"
                      label={language === 'ar' ? 'الجنس' : 'Gender'}
                    >
                      <Select size="large">
                        <Option value="MALE">{language === 'ar' ? 'ذكر' : 'Male'}</Option>
                        <Option value="FEMALE">{language === 'ar' ? 'أنثى' : 'Female'}</Option>
                        <Option value="OTHER">{language === 'ar' ? 'أخرى' : 'Other'}</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider>{language === 'ar' ? 'العنوان' : 'Address'}</Divider>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="city"
                      label={language === 'ar' ? 'المدينة' : 'City'}
                    >
                      <Input size="large" prefix={<EnvironmentOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="country"
                      label={language === 'ar' ? 'الدولة' : 'Country'}
                    >
                      <Input size="large" prefix={<GlobalOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="address"
                  label={language === 'ar' ? 'العنوان الكامل' : 'Full Address'}
                >
                  <TextArea rows={3} size="large" />
                </Form.Item>

                <Form.Item
                  name="postalCode"
                  label={language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}
                >
                  <Input size="large" />
                </Form.Item>

                <Divider>{language === 'ar' ? 'معلومات الشركة' : 'Company Information'}</Divider>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="companyName"
                      label={language === 'ar' ? 'اسم الشركة' : 'Company Name'}
                    >
                      <Input size="large" prefix={<BankOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="jobTitle"
                      label={language === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}
                    >
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="sector"
                      label={language === 'ar' ? 'القطاع' : 'Sector'}
                    >
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="companySize"
                      label={language === 'ar' ? 'حجم الشركة' : 'Company Size'}
                    >
                      <Select size="large">
                        <Option value="SMALL">{language === 'ar' ? 'صغيرة' : 'Small'}</Option>
                        <Option value="MEDIUM">{language === 'ar' ? 'متوسطة' : 'Medium'}</Option>
                        <Option value="LARGE">{language === 'ar' ? 'كبيرة' : 'Large'}</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider>{language === 'ar' ? 'روابط التواصل' : 'Social Links'}</Divider>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="website"
                      label={language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
                    >
                      <Input size="large" prefix={<GlobalOutlined />} placeholder="https://" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="linkedin"
                      label="LinkedIn"
                    >
                      <Input size="large" placeholder="linkedin.com/in/..." />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="twitter"
                  label="Twitter"
                >
                  <Input size="large" placeholder="@username" />
                </Form.Item>

                {editMode && (
                  <Form.Item className="mt-6">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      icon={<SaveOutlined />}
                      loading={loading}
                      className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
                      block
                    >
                      {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                    </Button>
                  </Form.Item>
                )}
              </Form>

              {/* Password Section */}
              <Divider>{language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}</Divider>
              <Form onFinish={handlePasswordChange} layout="vertical">
                <Form.Item
                  name="currentPassword"
                  label={language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                  rules={[{ required: true }]}
                >
                  <Input.Password size="large" prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item
                  name="newPassword"
                  label={language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                  rules={[{ required: true, min: 8 }]}
                >
                  <Input.Password size="large" prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  dependencies={['newPassword']}
                  rules={[
                    { required: true },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'))
                      },
                    }),
                  ]}
                >
                  <Input.Password size="large" prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
                    block
                  >
                    {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                  </Button>
                </Form.Item>
              </Form>

              {/* Notifications Section */}
              <Divider>{language === 'ar' ? 'تفضيلات الإشعارات' : 'Notification Preferences'}</Divider>
              <Form form={form} layout="vertical">
                <Form.Item
                  name="notificationEmail"
                  label={language === 'ar' ? 'الإشعارات عبر البريد الإلكتروني' : 'Email Notifications'}
                  valuePropName="checked"
                >
                  <Switch checkedChildren={language === 'ar' ? 'مفعل' : 'On'} unCheckedChildren={language === 'ar' ? 'معطل' : 'Off'} />
                </Form.Item>
                <Form.Item
                  name="notificationApp"
                  label={language === 'ar' ? 'إشعارات التطبيق' : 'App Notifications'}
                  valuePropName="checked"
                >
                  <Switch checkedChildren={language === 'ar' ? 'مفعل' : 'On'} unCheckedChildren={language === 'ar' ? 'معطل' : 'Off'} />
                </Form.Item>
                <Form.Item
                  name="notificationWhatsApp"
                  label={language === 'ar' ? 'إشعارات واتساب' : 'WhatsApp Notifications'}
                  valuePropName="checked"
                >
                  <Switch checkedChildren={language === 'ar' ? 'مفعل' : 'On'} unCheckedChildren={language === 'ar' ? 'معطل' : 'Off'} />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<BellOutlined />}
                    loading={loading}
                    className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
                    block
                  >
                    {language === 'ar' ? 'حفظ تفضيلات الإشعارات' : 'Save Notification Preferences'}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default ClientProfile
