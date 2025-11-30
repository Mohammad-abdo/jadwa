import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Switch, Row, Col, Avatar, Upload, Select, DatePicker, message, Divider, Tag, Statistic, Rate, Space } from 'antd'
import { 
  UserOutlined, 
  CameraOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  GlobalOutlined,
  LockOutlined,
  BellOutlined,
  SaveOutlined,
  EditOutlined,
  CheckCircleOutlined,
  StarOutlined,
  DollarOutlined,
  TrophyOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleFilled
} from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/api'
const { authAPI, consultantAPI, filesAPI } = apiService
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

const ConsultantProfile = () => {
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
        if (response.user.consultant) {
          const consultant = response.user.consultant
          form.setFieldsValue({
            firstName: consultant.firstName || '',
            lastName: consultant.lastName || '',
            email: response.user.email || '',
            phone: response.user.phone || '',
            academicDegree: consultant.academicDegree || '',
            specialization: consultant.specialization || '',
            bio: consultant.bio || '',
            expertiseFields: consultant.expertiseFields ? (typeof consultant.expertiseFields === 'string' ? consultant.expertiseFields : JSON.parse(consultant.expertiseFields).join(', ')) : '',
            city: consultant.city || '',
            country: consultant.country || 'Saudi Arabia',
            address: consultant.address || '',
            postalCode: consultant.postalCode || '',
            yearsOfExperience: consultant.yearsOfExperience || 0,
            languages: consultant.languages ? (typeof consultant.languages === 'string' ? consultant.languages : JSON.parse(consultant.languages).join(', ')) : '',
            certifications: consultant.certifications ? (typeof consultant.certifications === 'string' ? consultant.certifications : JSON.parse(consultant.certifications).join(', ')) : '',
            education: consultant.education ? (typeof consultant.education === 'string' ? consultant.education : JSON.parse(consultant.education).join(', ')) : '',
            website: consultant.website || '',
            linkedin: consultant.linkedin || '',
            twitter: consultant.twitter || '',
            pricePerSession: consultant.pricePerSession || 0,
            dateOfBirth: consultant.dateOfBirth ? dayjs(consultant.dateOfBirth) : null,
            gender: consultant.gender || '',
            isAvailable: consultant.isAvailable !== undefined ? consultant.isAvailable : true,
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
        message.success(language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Profile picture uploaded successfully')
        // Update local state immediately
        setProfileData(prev => ({ ...prev, avatar: response.file.fileUrl }))
        // Refresh profile
        await fetchProfile()
      }
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload profile picture'))
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
        expertiseFields: values.expertiseFields ? JSON.stringify(values.expertiseFields.split(',').map(f => f.trim())) : '[]',
        languages: values.languages ? JSON.stringify(values.languages.split(',').map(l => l.trim())) : '[]',
        certifications: values.certifications ? JSON.stringify(values.certifications.split(',').map(c => c.trim())) : '[]',
        education: values.education ? JSON.stringify(values.education.split(',').map(e => e.trim())) : '[]',
      }
      // Update email separately if changed
      if (values.email && values.email !== profileData?.email) {
        await authAPI.updateEmail(values.email)
      }
      // Use consultantAPI for consultant-specific profile updates
      await consultantAPI.updateProfile(updateData)
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

  const stats = profileData?.consultant ? {
    totalSessions: 0, // TODO: Get from API
    completedSessions: 0,
    totalEarnings: profileData.consultant.totalEarnings || 0,
    rating: profileData.consultant.rating || 0,
    totalRatings: profileData.consultant.totalRatings || 0,
  } : null

  return (
    <div className="relative min-h-screen pb-8 dashboard-bg">
      {/* Modern Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-br from-olive-green-100/40 to-turquoise-100/40 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-tr from-teal-100/40 to-olive-green-100/40 rounded-full blur-3xl opacity-30 -z-10" />

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Modern Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3">
            {language === 'ar' ? 'الملف الشخصي' : 'Profile Settings'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            {language === 'ar' ? 'إدارة معلوماتك الشخصية والمهنية' : 'Manage your personal and professional information'}
          </p>
        </div>

        <Row gutter={[24, 24]}>
          {/* Profile Card */}
          <Col xs={24} md={8}>
            <Card 
              className="glass-card text-center shadow-professional-xl rounded-2xl border-0"
            >
              <Upload 
                showUploadList={false}
                beforeUpload={handleAvatarUpload}
                accept="image/*"
              >
                <div className="relative inline-block mb-4">
                  <Avatar 
                    size={140} 
                    src={profileData?.avatar || user?.avatar || profileData?.consultant?.profilePicture} 
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
                {profileData?.consultant ? `${profileData.consultant.firstName} ${profileData.consultant.lastName}` : user?.email}
              </h2>
              <div className="mb-3">
                <Tag color="green" className="mb-2">
                  {language === 'ar' ? 'مستشار' : 'Consultant'}
                </Tag>
                {profileData?.consultant?.isVerified && (
                  <Tag color="blue" icon={<CheckCircleFilled />}>
                    {language === 'ar' ? 'موثق' : 'Verified'}
                  </Tag>
                )}
              </div>

              {stats && (
                <div className="mt-6 space-y-4">
                  <Divider className="my-4" />
                  <div className="text-center mb-4">
                    <Rate disabled value={stats.rating} allowHalf className="text-2xl" />
                    <div className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stats.rating.toFixed(1)} ({stats.totalRatings} {language === 'ar' ? 'تقييم' : 'ratings'})
                    </div>
                  </div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title={language === 'ar' ? 'الجلسات' : 'Sessions'}
                        value={stats.totalSessions}
                        valueStyle={{ fontSize: '18px', color: theme === 'dark' ? '#fff' : '#7a8c66' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title={language === 'ar' ? 'مكتملة' : 'Completed'}
                        value={stats.completedSessions}
                        valueStyle={{ fontSize: '18px', color: theme === 'dark' ? '#fff' : '#14b8a6' }}
                      />
                    </Col>
                  </Row>
                  <Divider className="my-4" />
                  <Statistic
                    title={language === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings'}
                    value={stats.totalEarnings}
                    prefix="SAR"
                    valueStyle={{ fontSize: '20px', color: theme === 'dark' ? '#fff' : '#7a8c66', fontWeight: 'bold' }}
                  />
                </div>
              )}
            </Card>
          </Col>

          {/* Form Section */}
          <Col xs={24} md={16}>
            <Card 
              className="glass-card shadow-professional-xl rounded-2xl border-0"
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
                      <Input size="large" prefix={<MailOutlined />} disabled />
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

                <Divider>{language === 'ar' ? 'المعلومات المهنية' : 'Professional Information'}</Divider>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="academicDegree"
                      label={language === 'ar' ? 'الدرجة العلمية' : 'Academic Degree'}
                      rules={[{ required: true }]}
                    >
                      <Input size="large" prefix={<BookOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="specialization"
                      label={language === 'ar' ? 'التخصص' : 'Specialization'}
                      rules={[{ required: true }]}
                    >
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="yearsOfExperience"
                      label={language === 'ar' ? 'سنوات الخبرة' : 'Years of Experience'}
                    >
                      <Input type="number" size="large" min={0} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="pricePerSession"
                      label={language === 'ar' ? 'سعر الجلسة (ريال)' : 'Price Per Session (SAR)'}
                      rules={[{ required: true }]}
                    >
                      <Input type="number" size="large" prefix={<DollarOutlined />} min={0} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="bio"
                  label={language === 'ar' ? 'السيرة الذاتية' : 'Bio'}
                >
                  <TextArea rows={4} size="large" />
                </Form.Item>

                <Form.Item
                  name="expertiseFields"
                  label={language === 'ar' ? 'مجالات الخبرة (مفصولة بفواصل)' : 'Expertise Fields (comma-separated)'}
                >
                  <TextArea rows={3} size="large" placeholder={language === 'ar' ? 'مثال: اقتصاد، تحليل مالي، دراسات جدوى' : 'Example: Economics, Financial Analysis, Feasibility Studies'} />
                </Form.Item>

                <Divider>{language === 'ar' ? 'التعليم والشهادات' : 'Education & Certifications'}</Divider>

                <Form.Item
                  name="education"
                  label={language === 'ar' ? 'التعليم (مفصول بفواصل)' : 'Education (comma-separated)'}
                >
                  <TextArea rows={2} size="large" placeholder={language === 'ar' ? 'مثال: بكالوريوس اقتصاد، ماجستير إدارة أعمال' : 'Example: BSc Economics, MBA'} />
                </Form.Item>

                <Form.Item
                  name="certifications"
                  label={language === 'ar' ? 'الشهادات (مفصولة بفواصل)' : 'Certifications (comma-separated)'}
                >
                  <TextArea rows={2} size="large" placeholder={language === 'ar' ? 'مثال: شهادة محلل مالي معتمد' : 'Example: Certified Financial Analyst'} />
                </Form.Item>

                <Form.Item
                  name="languages"
                  label={language === 'ar' ? 'اللغات (مفصولة بفواصل)' : 'Languages (comma-separated)'}
                >
                  <Input size="large" placeholder={language === 'ar' ? 'مثال: العربية، الإنجليزية' : 'Example: Arabic, English'} />
                </Form.Item>

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

                <Divider>{language === 'ar' ? 'الحالة' : 'Status'}</Divider>

                <Form.Item
                  name="isAvailable"
                  label={language === 'ar' ? 'متاح للاستشارات' : 'Available for Consultations'}
                  valuePropName="checked"
                >
                  <Switch checkedChildren={language === 'ar' ? 'متاح' : 'Available'} unCheckedChildren={language === 'ar' ? 'غير متاح' : 'Unavailable'} />
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
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default ConsultantProfile
