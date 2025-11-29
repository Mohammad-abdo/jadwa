import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Row, Col, Avatar, Upload, message, Divider, Tag, Spin } from 'antd'
import { 
  UserOutlined, 
  CameraOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  LockOutlined,
  SaveOutlined,
  EditOutlined,
  SafetyOutlined
} from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/api'
const { authAPI, filesAPI } = apiService

const AdminProfile = () => {
  const { language } = useLanguage()
  const { theme } = useTheme()
  const { user, checkAuth } = useAuth()
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [passwordChangeVisible, setPasswordChangeVisible] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await authAPI.getProfile()
      if (response.user) {
        setProfileData(response.user)
        if (response.user.admin) {
          form.setFieldsValue({
            firstName: response.user.admin.firstName || '',
            lastName: response.user.admin.lastName || '',
            email: response.user.email || '',
            phone: response.user.phone || '',
          })
        } else {
          // Fallback if admin relation not loaded
          form.setFieldsValue({
            email: response.user.email || '',
            phone: response.user.phone || '',
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
        await authAPI.updateProfile({ avatar: response.file.fileUrl })
        message.success(language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Avatar uploaded successfully')
        setProfileData(prev => ({ ...prev, avatar: response.file.fileUrl }))
        await fetchProfile()
        await checkAuth() // Refresh auth context
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
      }
      // Update email separately if changed
      if (values.email && values.email !== profileData?.email) {
        await authAPI.updateEmail(values.email)
      }
      await authAPI.updateProfile(updateData)
      message.success(language === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Profile updated successfully')
      setEditMode(false)
      await fetchProfile()
      await checkAuth() // Refresh auth context
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
      passwordForm.resetFields()
      setPasswordChangeVisible(false)
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل تغيير كلمة المرور' : 'Failed to change password'))
    } finally {
      setLoading(false)
    }
  }

  if (loading && !profileData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  const adminRole = profileData?.admin?.adminRole || user?.role
  const roleLabels = {
    SUPER_ADMIN: { ar: 'مدير عام', en: 'Super Admin', color: 'red' },
    ADMIN: { ar: 'مدير', en: 'Admin', color: 'blue' },
    ANALYST: { ar: 'محلل', en: 'Analyst', color: 'purple' },
    SUPPORT: { ar: 'دعم فني', en: 'Support', color: 'orange' },
    FINANCE: { ar: 'مالي', en: 'Finance', color: 'green' },
  }
  const roleLabel = roleLabels[adminRole] || roleLabels.ADMIN

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-olive-green-100 to-turquoise-100 rounded-full blur-3xl opacity-20 -z-10" />
          <h1 className={`text-4xl font-bold mb-2 relative z-10 ${theme === 'dark' ? 'text-white' : 'bg-gradient-to-r from-olive-green-600 to-turquoise-500 bg-clip-text text-transparent'}`}>
            {language === 'ar' ? 'الملف الشخصي' : 'Profile Settings'}
          </h1>
          <p className={`relative z-10 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {language === 'ar' ? 'إدارة معلوماتك الشخصية وإعدادات الحساب' : 'Manage your personal information and account settings'}
          </p>
        </div>

        <Row gutter={[24, 24]}>
          {/* Profile Card */}
          <Col xs={24} md={8}>
            <Card 
              className={`text-center shadow-professional-lg border-0 card-hover ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              style={{ animationDelay: '0.1s' }}
            >
              <Upload 
                showUploadList={false}
                beforeUpload={handleAvatarUpload}
                accept="image/*"
              >
                <div className="relative inline-block mb-4 cursor-pointer group">
                  <Avatar 
                    size={140} 
                    src={profileData?.avatar || user?.avatar} 
                    icon={<UserOutlined />}
                    className="ring-4 ring-olive-green-200 group-hover:ring-olive-green-400 transition-all duration-300"
                  />
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<CameraOutlined />}
                    className="absolute bottom-0 right-0 shadow-lg"
                    size="small"
                    style={{ backgroundColor: '#7a8c66' }}
                    loading={loading}
                  />
                </div>
              </Upload>
              <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {profileData?.admin 
                  ? `${profileData.admin.firstName || ''} ${profileData.admin.lastName || ''}`.trim() 
                  : user?.email || (language === 'ar' ? 'المدير' : 'Admin')}
              </h2>
              <Tag color={roleLabel.color} className="mb-4" icon={<SafetyOutlined />}>
                {language === 'ar' ? roleLabel.ar : roleLabel.en}
              </Tag>
              
              <Divider className="my-4" />
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <MailOutlined className="text-gray-400" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {profileData?.email || user?.email}
                  </span>
                </div>
                {profileData?.phone && (
                  <div className="flex items-center gap-3">
                    <PhoneOutlined className="text-gray-400" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {profileData.phone}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </Col>

          {/* Profile Form */}
          <Col xs={24} md={16}>
            <Card 
              className={`shadow-professional-lg border-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              title={
                <div className="flex items-center justify-between">
                  <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {language === 'ar' ? 'معلومات الحساب' : 'Account Information'}
                  </span>
                  {!editMode && (
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => setEditMode(true)}
                      className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
                    >
                      {language === 'ar' ? 'تعديل' : 'Edit'}
                    </Button>
                  )}
                </div>
              }
              style={{ animationDelay: '0.2s' }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                disabled={!editMode}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="firstName"
                      label={language === 'ar' ? 'الاسم الأول' : 'First Name'}
                      rules={[{ required: true, message: language === 'ar' ? 'يرجى إدخال الاسم الأول' : 'Please enter first name' }]}
                    >
                      <Input 
                        prefix={<UserOutlined />}
                        placeholder={language === 'ar' ? 'الاسم الأول' : 'First Name'}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="lastName"
                      label={language === 'ar' ? 'اسم العائلة' : 'Last Name'}
                      rules={[{ required: true, message: language === 'ar' ? 'يرجى إدخال اسم العائلة' : 'Please enter last name' }]}
                    >
                      <Input 
                        prefix={<UserOutlined />}
                        placeholder={language === 'ar' ? 'اسم العائلة' : 'Last Name'}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      rules={[
                        { required: true, message: language === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter email' },
                        { type: 'email', message: language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email' }
                      ]}
                    >
                      <Input 
                        prefix={<MailOutlined />}
                        placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="phone"
                      label={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    >
                      <Input 
                        prefix={<PhoneOutlined />}
                        placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {editMode && (
                  <div className="flex gap-3 mt-6">
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={loading}
                      className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
                    >
                      {language === 'ar' ? 'حفظ' : 'Save'}
                    </Button>
                    <Button onClick={() => {
                      setEditMode(false)
                      fetchProfile()
                    }}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                )}
              </Form>
            </Card>

            {/* Password Change Card */}
            <Card 
              className={`shadow-professional-lg border-0 mt-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              title={
                <div className="flex items-center gap-2">
                  <LockOutlined className={theme === 'dark' ? 'text-white' : 'text-gray-900'} />
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {language === 'ar' ? 'الأمان' : 'Security'}
                  </span>
                </div>
              }
              style={{ animationDelay: '0.3s' }}
              extra={
                !passwordChangeVisible && (
                  <Button
                    type="text"
                    onClick={() => setPasswordChangeVisible(true)}
                    className="text-olive-green-600 hover:text-olive-green-700"
                  >
                    {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                  </Button>
                )
              }
            >
              {passwordChangeVisible ? (
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handlePasswordChange}
                >
                  <Form.Item
                    name="currentPassword"
                    label={language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                    rules={[{ required: true, message: language === 'ar' ? 'يرجى إدخال كلمة المرور الحالية' : 'Please enter current password' }]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />}
                      placeholder={language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                    />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label={language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                    rules={[
                      { required: true, message: language === 'ar' ? 'يرجى إدخال كلمة المرور الجديدة' : 'Please enter new password' },
                      { min: 8, message: language === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters' }
                    ]}
                  >
                    <Input.Password 
                      prefix={<SafetyOutlined />}
                      placeholder={language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: language === 'ar' ? 'يرجى تأكيد كلمة المرور' : 'Please confirm password' },
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
                    <Input.Password 
                      prefix={<SafetyOutlined />}
                      placeholder={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    />
                  </Form.Item>

                  <div className="flex gap-3 mt-6">
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={loading}
                      className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
                    >
                      {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                    </Button>
                    <Button onClick={() => {
                      setPasswordChangeVisible(false)
                      passwordForm.resetFields()
                    }}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </Form>
              ) : (
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {language === 'ar' 
                      ? 'لحماية حسابك، استخدم كلمة مرور قوية لا تستخدمها في حسابات أخرى.' 
                      : 'To protect your account, use a strong password that you don\'t use elsewhere.'}
                  </p>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default AdminProfile

