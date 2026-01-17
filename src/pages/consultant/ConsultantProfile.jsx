import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Switch, Row, Col, Avatar, Upload, Select, DatePicker, message, Divider, Tag, Statistic, Rate, Tabs, Badge } from 'antd'
import { 
  UserOutlined, 
  CameraOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  GlobalOutlined,
  LockOutlined,
  EditOutlined,
  CheckCircleFilled,
  DollarOutlined,
  BookOutlined,
  SaveOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
  LinkedinOutlined,
  TwitterOutlined
} from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/api'
const { authAPI, consultantAPI, filesAPI } = apiService
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select
const { TabPane } = Tabs

const ConsultantProfile = () => {
  const { t, language } = useLanguage()
  const { theme } = useTheme()
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [activeTab, setActiveTab] = useState('1')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await authAPI.getProfile()
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
    const uploadAPI = filesAPI || apiService?.filesAPI
    if (!uploadAPI) {
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
        message.success(language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Profile picture uploaded successfully')
        setProfileData(prev => ({ ...prev, avatar: response.file.fileUrl }))
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
      if (values.email && values.email !== profileData?.email) {
        await authAPI.updateEmail(values.email)
      }
      await consultantAPI.updateProfile(updateData)
      message.success(language === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Profile updated successfully')
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
    totalSessions: 0, // Get from API real data if available
    completedSessions: 0,
    totalEarnings: profileData.consultant.totalEarnings || 0,
    rating: profileData.consultant.rating || 0,
    totalRatings: profileData.consultant.totalRatings || 0,
  } : null

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Hero Banner */}
      <div className="h-64 bg-gradient-to-r from-olive-green-600 to-turquoise-600 relative overflow-hidden">
         <div className="absolute inset-0 bg-pattern opacity-10"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
           {/* Profile Card & Navigation */}
           <div className="w-full md:w-80 shrink-0 space-y-6">
              <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
                 <div className="flex flex-col items-center text-center p-2">
                    <div className="relative mb-4">
                      <div className="p-1.5 bg-white rounded-full shadow-md">
                        <Upload 
                          showUploadList={false}
                          beforeUpload={handleAvatarUpload}
                          accept="image/*"
                        >
                          <Avatar 
                            size={120} 
                            src={profileData?.avatar || user?.avatar || profileData?.consultant?.profilePicture} 
                            icon={<UserOutlined />}
                            className="cursor-pointer transition-transform hover:scale-105"
                          />
                          <div className="absolute bottom-1 right-1 bg-olive-green-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-olive-green-700 transition-colors">
                             <CameraOutlined />
                          </div>
                        </Upload>
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {profileData?.consultant ? `${profileData.consultant.firstName} ${profileData.consultant.lastName}` : user?.email}
                    </h2>
                    
                    <p className="text-gray-500 text-sm mb-3">
                      {profileData?.consultant?.specialization || (language === 'ar' ? 'مستشار' : 'Consultant')}
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      <Tag color="green" className="rounded-full px-3">{language === 'ar' ? 'مستشار' : 'Consultant'}</Tag>
                      {profileData?.consultant?.isVerified && (
                        <Tag color="blue" icon={<CheckCircleFilled />} className="rounded-full px-3">
                          {language === 'ar' ? 'موثق' : 'Verified'}
                        </Tag>
                      )}
                    </div>

                    <div className="w-full border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                       <div className="text-center">
                          <div className="text-lg font-bold text-gray-800">{stats?.rating?.toFixed(1) || '0.0'}</div>
                          <div className="text-xs text-gray-500">{language === 'ar' ? 'التقييم' : 'Rating'}</div>
                       </div>
                       <div className="text-center border-l border-gray-100 rtl:border-l-0 rtl:border-r">
                          <div className="text-lg font-bold text-gray-800">{stats?.totalSessions || '0'}</div>
                          <div className="text-xs text-gray-500">{language === 'ar' ? 'الجلسات' : 'Sessions'}</div>
                       </div>
                    </div>
                 </div>
              </Card>

              {/* Status Card */}
               <Card className="shadow-md rounded-2xl border-0">
                  <div className="flex items-center justify-between">
                     <span className="font-medium text-gray-700">{language === 'ar' ? 'حالة التوفر' : 'Availability Status'}</span>
                     <Form form={form} component={false}>
                        <Form.Item name="isAvailable" valuePropName="checked" noStyle>
                           <Switch 
                              onChange={(checked) => {
                                 onFinish({ ...form.getFieldsValue(), isAvailable: checked })
                              }}
                              className={form.getFieldValue('isAvailable') ? 'bg-green-500' : ''}
                           />
                        </Form.Item>
                     </Form>
                  </div>
               </Card>
           </div>

           {/* Main Content Tabs */}
           <div className="flex-1 min-w-0">
              <Card className="shadow-lg rounded-2xl border-0 min-h-[600px]">
                 <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    size="large"
                    className="profile-tabs"
                    items={[
                       {
                          key: '1',
                          label: (
                             <span className="flex items-center gap-2">
                                <DashboardOutlined />
                                {language === 'ar' ? 'نظرة عامة' : 'Overview'}
                             </span>
                          ),
                          children: (
                             <div className="py-4 space-y-6">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                   <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                                      <div className="flex items-center gap-3 mb-2">
                                         <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600"><DollarOutlined /></div>
                                         <span className="text-sm text-gray-600 font-medium">{language === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings'}</span>
                                      </div>
                                      <div className="text-2xl font-bold text-gray-800">
                                         {stats?.totalEarnings?.toLocaleString()} <span className="text-xs font-normal text-gray-500">SAR</span>
                                      </div>
                                   </div>
                                   <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                      <div className="flex items-center gap-3 mb-2">
                                         <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600"><DashboardOutlined /></div>
                                         <span className="text-sm text-gray-600 font-medium">{language === 'ar' ? 'الجلسات المكتملة' : 'Completed Sessions'}</span>
                                      </div>
                                      <div className="text-2xl font-bold text-gray-800">
                                         {stats?.completedSessions}
                                      </div>
                                   </div>
                                   <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                                      <div className="flex items-center gap-3 mb-2">
                                         <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600"><CheckCircleFilled /></div>
                                         <span className="text-sm text-gray-600 font-medium">{language === 'ar' ? 'التقييم العام' : 'Overall Rating'}</span>
                                      </div>
                                      <div className="flex items-end gap-2">
                                         <span className="text-2xl font-bold text-gray-800">{stats?.rating?.toFixed(1)}</span>
                                         <Rate disabled value={stats?.rating} count={1} className="text-orange-500 mb-1" />
                                      </div>
                                   </div>
                                </div>

                                <Divider />

                                {/* Bio Preview */}
                                <div>
                                   <h3 className="text-lg font-bold text-gray-800 mb-3">{language === 'ar' ? 'نبذة عني' : 'About Me'}</h3>
                                   <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                      {profileData?.consultant?.bio || (language === 'ar' ? 'لا توجد نبذة شخصية بعد.' : 'No bio provided yet.')}
                                   </p>
                                </div>
                             </div>
                          )
                       },
                       {
                          key: '2',
                          label: (
                             <span className="flex items-center gap-2">
                                <IdcardOutlined />
                                {language === 'ar' ? 'المعلومات الشخصية' : 'Personal Info'}
                             </span>
                          ),
                          children: (
                             <Form form={form} onFinish={onFinish} layout="vertical" className="py-4">
                                <Row gutter={24}>
                                   <Col xs={24} md={12}>
                                      <Form.Item name="firstName" label={language === 'ar' ? 'الاسم الأول' : 'First Name'} rules={[{ required: true }]}>
                                         <Input size="large" prefix={<UserOutlined className="text-gray-400" />} />
                                      </Form.Item>
                                   </Col>
                                   <Col xs={24} md={12}>
                                      <Form.Item name="lastName" label={language === 'ar' ? 'اسم العائلة' : 'Last Name'} rules={[{ required: true }]}>
                                         <Input size="large" prefix={<UserOutlined className="text-gray-400" />} />
                                      </Form.Item>
                                   </Col>
                                   <Col xs={24} md={12}>
                                      <Form.Item name="email" label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'} rules={[{ required: true, type: 'email' }]}>
                                         <Input size="large" prefix={<MailOutlined className="text-gray-400" />} disabled className="bg-gray-50" />
                                      </Form.Item>
                                   </Col>
                                   <Col xs={24} md={12}>
                                      <Form.Item name="phone" label={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}>
                                         <Input size="large" prefix={<PhoneOutlined className="text-gray-400" />} />
                                      </Form.Item>
                                   </Col>
                                   <Col xs={24} md={12}>
                                      <Form.Item name="dateOfBirth" label={language === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}>
                                         <DatePicker size="large" className="w-full" />
                                      </Form.Item>
                                   </Col>
                                   <Col xs={24} md={12}>
                                      <Form.Item name="gender" label={language === 'ar' ? 'الجنس' : 'Gender'}>
                                         <Select size="large">
                                            <Option value="MALE">{language === 'ar' ? 'ذكر' : 'Male'}</Option>
                                            <Option value="FEMALE">{language === 'ar' ? 'أنثى' : 'Female'}</Option>
                                         </Select>
                                      </Form.Item>
                                   </Col>
                                   <Col span={24}>
                                      <Divider style={{ margin: '12px 0 24px' }} />
                                      <h3 className="text-base font-semibold mb-4 text-gray-700">{language === 'ar' ? 'العنوان' : 'Address'}</h3>
                                   </Col>
                                   <Col xs={24} md={12}>
                                      <Form.Item name="country" label={language === 'ar' ? 'الدولة' : 'Country'}>
                                         <Input size="large" prefix={<GlobalOutlined className="text-gray-400" />} />
                                      </Form.Item>
                                   </Col>
                                   <Col xs={24} md={12}>
                                      <Form.Item name="city" label={language === 'ar' ? 'المدينة' : 'City'}>
                                         <Input size="large" prefix={<EnvironmentOutlined className="text-gray-400" />} />
                                      </Form.Item>
                                   </Col>
                                   <Col span={24}>
                                      <Form.Item name="address" label={language === 'ar' ? 'العنوان التفصيلي' : 'Detailed Address'}>
                                         <Input.TextArea rows={2} />
                                      </Form.Item>
                                   </Col>
                                </Row>
                                <div className="flex justify-end pt-4">
                                   <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={loading} className="bg-olive-green-600 hover:bg-olive-green-700 w-full sm:w-auto">
                                      {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                                   </Button>
                                </div>
                             </Form>
                          )
                       },
                       {
                          key: '3',
                          label: (
                             <span className="flex items-center gap-2">
                                <BookOutlined />
                                {language === 'ar' ? 'المعلومات المهنية' : 'Professional'}
                             </span>
                          ),
                          children: (
                             <Form form={form} onFinish={onFinish} layout="vertical" className="py-4">
                                <Row gutter={24}>
                                   <Col xs={24} md={12}>
                                      <Form.Item name="specialization" label={language === 'ar' ? 'المسمى الوظيفي / التخصص' : 'Job Title / Specialization'} rules={[{ required: true }]}>
                                         <Input size="large" />
                                      </Form.Item>
                                   </Col>
                                   <Col xs={24} md={12}>
                                      <Form.Item name="academicDegree" label={language === 'ar' ? 'الدرجة العلمية' : 'Academic Degree'} rules={[{ required: true }]}>
                                         <Input size="large" prefix={<BookOutlined className="text-gray-400" />} />
                                      </Form.Item>
                                   </Col>
                                   <Col xs={24} md={12}>
                                      <Form.Item name="yearsOfExperience" label={language === 'ar' ? 'سنوات الخبرة' : 'Years of Experience'}>
                                         <Input type="number" size="large" suffix={language === 'ar' ? 'سنوات' : 'Years'} />
                                      </Form.Item>
                                   </Col>
                                   <Col xs={24} md={12}>
                                      <Form.Item name="pricePerSession" label={language === 'ar' ? 'سعر الجلسة' : 'Session Price'} rules={[{ required: true }]}>
                                         <Input type="number" size="large" prefix={<DollarOutlined className="text-gray-400" />} suffix="SAR" />
                                      </Form.Item>
                                   </Col>
                                   <Col span={24}>
                                      <Form.Item name="bio" label={language === 'ar' ? 'نبذة تعريفية' : 'Bio'}>
                                         <Input.TextArea rows={4} showCount maxLength={500} />
                                      </Form.Item>
                                   </Col>
                                   <Col span={24}>
                                      <Form.Item name="expertiseFields" label={language === 'ar' ? 'مجالات الخبرة (مفصولة بفواصل)' : 'Expertise Fields (comma-separated)'}>
                                         <Input.TextArea placeholder="Economics, Finance, ..." />
                                      </Form.Item>
                                   </Col>
                                   <Col xs={24} md={12}>
                                      <Form.Item name="linkedin" label="LinkedIn">
                                         <Input size="large" prefix={<LinkedinOutlined className="text-blue-600" />} />
                                      </Form.Item>
                                   </Col>
                                   <Col xs={24} md={12}>
                                      <Form.Item name="twitter" label="Twitter (X)">
                                         <Input size="large" prefix={<TwitterOutlined className="text-black" />} />
                                      </Form.Item>
                                   </Col>
                                </Row>
                                <div className="flex justify-end pt-4">
                                   <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={loading} className="bg-olive-green-600 hover:bg-olive-green-700 w-full sm:w-auto">
                                      {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                                   </Button>
                                </div>
                             </Form>
                          )
                       },
                       {
                          key: '4',
                          label: (
                             <span className="flex items-center gap-2">
                                <SafetyCertificateOutlined />
                                {language === 'ar' ? 'الأمان' : 'Security'}
                             </span>
                          ),
                          children: (
                             <div className="py-4 max-w-lg">
                                <h3 className="text-base font-semibold mb-6 text-gray-700">{language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}</h3>
                                <Form onFinish={handlePasswordChange} layout="vertical">
                                   <Form.Item name="currentPassword" label={language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'} rules={[{ required: true }]}>
                                      <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} />
                                   </Form.Item>
                                   <Form.Item name="newPassword" label={language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'} rules={[{ required: true, min: 8 }]}>
                                      <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} />
                                   </Form.Item>
                                   <Form.Item name="confirmPassword" label={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} dependencies={['newPassword']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) { return Promise.resolve() } return Promise.reject(new Error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match')) }, })]}>
                                      <Input.Password size="large" prefix={<LockOutlined className="text-gray-400" />} />
                                   </Form.Item>
                                   <Button type="primary" htmlType="submit" size="large" loading={loading} className="bg-olive-green-600 hover:bg-olive-green-700 mt-2">
                                      {language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password'}
                                   </Button>
                                </Form>
                             </div>
                          )
                       }
                    ]}
                 />
              </Card>
           </div>
        </div>
      </div>
    </div>
  )
}

export default ConsultantProfile
