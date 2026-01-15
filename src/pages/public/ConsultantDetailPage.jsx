import React, { useState, useEffect } from 'react'
import { Layout, Card, Spin, Alert, Tag, Avatar, Descriptions, Button, Space, Row, Col, Divider } from 'antd'
import { 
  ArrowLeftOutlined, 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  BookOutlined,
  DollarOutlined,
  CalendarOutlined,
  StarOutlined,
  CheckCircleOutlined,
  LockOutlined
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'
import { consultantAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const { Content } = Layout

const ConsultantDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const { settings } = useTheme()
  const { user } = useAuth()
  const [consultant, setConsultant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      fetchConsultant()
    }
  }, [id])

  const fetchConsultant = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await consultantAPI.getConsultantById(id)
      setConsultant(response.consultant)
    } catch (err) {
      console.error('Error fetching consultant:', err)
      setError(err.message || 'Failed to load consultant')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout className="min-h-screen">
        <Header />
        <Content className="py-20">
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Content>
        <Footer />
      </Layout>
    )
  }

  if (error || !consultant) {
    return (
      <Layout className="min-h-screen">
        <Header />
        <Content className="py-20">
          <div className="max-w-4xl mx-auto px-4">
            <Alert
              message={language === 'ar' ? 'خطأ' : 'Error'}
              description={error || (language === 'ar' ? 'المستشار غير موجود' : 'Consultant not found')}
              type="error"
              showIcon
              action={
                <Button onClick={() => navigate('/consultants')}>
                  {language === 'ar' ? 'العودة' : 'Go Back'}
                </Button>
              }
            />
          </div>
        </Content>
        <Footer />
      </Layout>
    )
  }

  const fullName = consultant.user 
    ? `${consultant.firstName || ''} ${consultant.lastName || ''}`.trim() || consultant.user.email
    : `${consultant.firstName || ''} ${consultant.lastName || ''}`.trim() || 'Consultant'

  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Back Button */}
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/consultants')}
            className="mb-8 text-[#1a4d3a] hover:text-[#2d5f4f] border-[#1a4d3a] hover:border-[#2d5f4f] font-semibold"
          >
            {language === 'ar' ? 'العودة' : 'Back to Consultants'}
          </Button>

          {/* Consultant Header Card */}
          <Card className="mb-8 border-0 shadow-lg rounded-2xl overflow-hidden" styles={{ body: { padding: '48px' } }}>
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} md={6} className="text-center md:text-left">
                <Avatar
                  size={160}
                  src={consultant.user?.avatar}
                  icon={<UserOutlined />}
                  className="border-4 border-[#1a4d3a] shadow-xl mb-4 md:mb-0"
                />
              </Col>
              <Col xs={24} md={18}>
                <div className="mb-4">
                  <Tag color="green" className="mb-3 text-sm px-4 py-1 font-semibold">
                    {consultant.status === 'APPROVED' 
                      ? (language === 'ar' ? 'موافق عليه' : 'Approved')
                      : (language === 'ar' ? 'قيد المراجعة' : 'Pending Review')}
                  </Tag>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
                  {fullName}
                </h1>
                {consultant.academicDegree && (
                  <p className="text-2xl text-[#1a4d3a] mb-4 font-semibold">
                    {consultant.academicDegree}
                  </p>
                )}
                {consultant.specialization && (
                  <p className="text-xl text-gray-600 mb-4">
                    {consultant.specialization}
                  </p>
                )}
                {consultant.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <StarOutlined className="text-[#d4af37] text-xl" />
                    <span className="text-2xl font-bold text-gray-900">{consultant.rating.toFixed(1)}</span>
                    <span className="text-gray-500">/ 5.0</span>
                  </div>
                )}
                <Space size="large" wrap>
                  <Button
                    type="primary"
                    size="large"
                    className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#c9a227] hover:to-[#e6c93d] border-0 text-[#1a4d3a] h-12 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    onClick={() => {
                      if (user?.role === 'CLIENT') {
                        // Navigate to client booking page with pre-selected consultant
                        navigate('/client/bookings', { state: { consultantId: consultant.id } })
                      } else {
                        navigate('/register')
                      }
                    }}
                  >
                    {language === 'ar' ? 'احجز استشارة' : 'Book Consultation'}
                  </Button>
                  <Button
                    size="large"
                    className="border-2 border-[#1a4d3a] text-[#1a4d3a] hover:bg-[#1a4d3a] hover:text-white h-12 px-8 text-lg font-semibold transition-all"
                    onClick={() => navigate('/contact')}
                  >
                    {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Consultant Details */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              {/* About Section */}
              {consultant.bio && (
                <Card className="mb-6 border-0 shadow-lg rounded-2xl" styles={{ body: { padding: '32px' } }}>
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">
                    {language === 'ar' ? 'نبذة عن المستشار' : 'About'}
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                    {consultant.bio}
                  </p>
                </Card>
              )}

              {/* Experience & Qualifications */}
              <Card className="mb-6 border-0 shadow-lg rounded-2xl" styles={{ body: { padding: '32px' } }}>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  {language === 'ar' ? 'المؤهلات والخبرة' : 'Qualifications & Experience'}
                </h2>
                <Descriptions column={1} bordered>
                  {consultant.yearsOfExperience && (
                    <Descriptions.Item 
                      label={language === 'ar' ? 'سنوات الخبرة' : 'Years of Experience'}
                    >
                      {consultant.yearsOfExperience} {language === 'ar' ? 'سنة' : 'years'}
                    </Descriptions.Item>
                  )}
                  {consultant.academicDegree && (
                    <Descriptions.Item 
                      label={language === 'ar' ? 'الدرجة العلمية' : 'Academic Degree'}
                    >
                      {consultant.academicDegree}
                    </Descriptions.Item>
                  )}
                  {consultant.specialization && (
                    <Descriptions.Item 
                      label={language === 'ar' ? 'التخصص' : 'Specialization'}
                    >
                      {consultant.specialization}
                    </Descriptions.Item>
                  )}
                  {consultant.pricePerSession && (
                    <Descriptions.Item 
                      label={language === 'ar' ? 'سعر الجلسة' : 'Price Per Session'}
                    >
                      <span className="text-[#1a4d3a] font-bold text-lg">
                        {consultant.pricePerSession} {language === 'ar' ? 'ريال' : 'SAR'}
                      </span>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              {/* Contact Information */}
              <Card className="mb-6 border-0 shadow-lg rounded-2xl relative overflow-hidden" styles={{ body: { padding: '32px' } }}>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  {language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                </h2>
                
                {!settings.showConsultantContactInfo && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white p-4 rounded-full shadow-lg mb-2">
                       <LockOutlined className="text-2xl text-gray-500" />
                    </div>
                    <span className="text-gray-600 font-medium">
                      {language === 'ar' ? 'معلومات الاتصال محجوبة' : 'Contact Info Hidden'}
                    </span>
                  </div>
                )}

                <Space direction="vertical" size="large" className={`w-full transition-all duration-300 ${!settings.showConsultantContactInfo ? 'blur-sm opacity-50 select-none' : ''}`}>
                  {consultant.user?.email && (
                    <div className="flex items-center gap-3">
                      <MailOutlined className="text-[#1a4d3a] text-xl" />
                      <span className="text-gray-700">{consultant.user.email}</span>
                    </div>
                  )}
                  {consultant.user?.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneOutlined className="text-[#1a4d3a] text-xl" />
                      <span className="text-gray-700">{consultant.user.phone}</span>
                    </div>
                  )}
                </Space>
              </Card>

              {/* Quick Stats */}
              <Card className="border-0 shadow-lg rounded-2xl" styles={{ body: { padding: '32px' } }}>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  {language === 'ar' ? 'الإحصائيات' : 'Statistics'}
                </h2>
                <Space direction="vertical" size="large" className="w-full">
                  {consultant.rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{language === 'ar' ? 'التقييم' : 'Rating'}</span>
                      <div className="flex items-center gap-2">
                        <StarOutlined className="text-[#d4af37]" />
                        <span className="font-bold text-lg">{consultant.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                  {consultant.totalSessions !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{language === 'ar' ? 'إجمالي الجلسات' : 'Total Sessions'}</span>
                      <span className="font-bold text-lg">{consultant.totalSessions || 0}</span>
                    </div>
                  )}
                  {consultant.totalClients !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{language === 'ar' ? 'عدد العملاء' : 'Total Clients'}</span>
                      <span className="font-bold text-lg">{consultant.totalClients || 0}</span>
                    </div>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
      <Footer />
    </Layout>
  )
}

export default ConsultantDetailPage

