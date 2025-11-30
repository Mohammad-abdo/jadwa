import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Statistic, Spin, Alert, List, Avatar, Tag, Empty } from 'antd'
import {
  BarChartOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  VideoCameraOutlined,
  FolderOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  MessageOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { clientAPI } from '../../services/api'
import dayjs from 'dayjs'

const ClientHome = () => {
  const { language } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
  })
  const [upcomingBookings, setUpcomingBookings] = useState([])
  const [recentBookings, setRecentBookings] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await clientAPI.getDashboardStats()
      setStats(response.stats)
      setUpcomingBookings(response.upcomingBookings || [])
      setRecentBookings(response.recentBookings || [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Modern KPI Card Component - Enhanced Design
  const KPICard = ({ 
    title, 
    value, 
    icon, 
    color, 
    suffix = '', 
    delay = 0 
  }) => (
    <Card 
      className="modern-kpi-card card-hover shadow-professional-lg relative overflow-hidden h-full border-0"
      style={{ animationDelay: `${delay}s` }}
      styles={{ body: { padding: '20px' } }}
    >
      {/* Modern decorative background */}
      <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full ${color} opacity-5 blur-2xl`} />
      <div className={`absolute -bottom-6 -left-6 w-24 h-24 rounded-full ${color} opacity-5 blur-xl`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl ${color} bg-opacity-10 shadow-sm`}>
            <div className="text-2xl sm:text-3xl">
              {icon}
            </div>
          </div>
        </div>
        <Statistic
          title={<span className="text-gray-600 font-semibold text-xs sm:text-sm uppercase tracking-wide">{title}</span>}
          value={value}
          suffix={suffix}
          valueStyle={{ 
            color: color.includes('teal') ? '#14b8a6' : 
                   color.includes('olive') ? '#7a8c66' : 
                   color.includes('blue') ? '#1890ff' : '#faad14',
            fontWeight: 800,
            fontSize: 'clamp(20px, 4vw, 28px)',
            lineHeight: 1.2
          }}
        />
      </div>
    </Card>
  )

  const services = [
    {
      icon: <BarChartOutlined className="text-3xl" />,
      title: language === 'ar' ? 'الاستشارات الاقتصادية' : 'Economic Consultations',
      color: 'from-olive-green-500 to-olive-green-600',
      path: '/client/bookings',
    },
    {
      icon: <FileTextOutlined className="text-3xl" />,
      title: language === 'ar' ? 'دراسات الجدوى' : 'Feasibility Studies',
      color: 'from-turquoise-500 to-turquoise-600',
      path: '/client/bookings',
    },
    {
      icon: <CalculatorOutlined className="text-3xl" />,
      title: language === 'ar' ? 'التحليل الاقتصادي' : 'Econometric Analysis',
      color: 'from-olive-green-400 to-turquoise-500',
      path: '/client/bookings',
    },
    {
      icon: <VideoCameraOutlined className="text-3xl" />,
      title: language === 'ar' ? 'استشارة فيديو/محادثة' : 'Video/Chat Consultation',
      color: 'from-turquoise-400 to-olive-green-500',
      path: '/client/bookings',
    },
    {
      icon: <FolderOutlined className="text-3xl" />,
      title: language === 'ar' ? 'التقارير الاقتصادية' : 'Ready Economic Reports',
      color: 'from-olive-green-600 to-turquoise-600',
      path: '/client/consultations',
    },
  ]

  const clientName = user?.client 
    ? `${user.client.firstName || ''} ${user.client.lastName || ''}`.trim()
    : user?.email || (language === 'ar' ? 'عميل' : 'Client')

  return (
    <div className="relative min-h-screen pb-8 dashboard-bg">
      {/* Modern Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-br from-olive-green-100/40 to-turquoise-100/40 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-tr from-teal-100/40 to-olive-green-100/40 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Modern Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-10 relative z-10 px-2 sm:px-0">
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3">
            {language === 'ar' ? `مرحباً، ${clientName}` : `Welcome, ${clientName}`}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            {language === 'ar'
              ? 'إليك نظرة سريعة على حسابك'
              : 'Here is a quick overview of your account'}
          </p>
        </div>
        <div className="text-sm sm:text-base text-gray-700 glass-card px-4 py-3 rounded-xl shadow-professional whitespace-nowrap font-medium">
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-olive-green-600" />
            {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert
          message={language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error Loading Data'}
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          className="mb-6"
        />
      ) : (
        <>
          {/* Statistics - Improved Responsive Grid */}
          <Row gutter={[12, 12]} className="mb-4 md:mb-6">
            <Col xs={12} sm={12} md={6} lg={6} xl={6}>
              <KPICard
                title={language === 'ar' ? 'إجمالي الحجوزات' : 'Total Bookings'}
                value={stats.totalBookings}
                icon={<CalendarOutlined className="text-xl sm:text-2xl text-teal-500" />}
                color="bg-teal-500"
                delay={0.1}
              />
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={6}>
              <KPICard
                title={language === 'ar' ? 'الحجوزات المعلقة' : 'Pending Bookings'}
                value={stats.pendingBookings}
                icon={<ClockCircleOutlined className="text-xl sm:text-2xl text-orange-500" />}
                color="bg-orange-500"
                delay={0.2}
              />
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={6}>
              <KPICard
                title={language === 'ar' ? 'الحجوزات المكتملة' : 'Completed Bookings'}
                value={stats.completedBookings}
                icon={<CheckCircleOutlined className="text-xl sm:text-2xl text-green-500" />}
                color="bg-green-500"
                delay={0.3}
              />
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} xl={6}>
              <KPICard
                title={language === 'ar' ? 'إجمالي الإنفاق' : 'Total Spent'}
                value={stats.totalSpent}
                icon={<DollarOutlined className="text-xl sm:text-2xl text-olive-green-600" />}
                color="bg-olive-green-600"
                suffix={language === 'ar' ? ' ريال' : ' SAR'}
                delay={0.4}
              />
            </Col>
          </Row>

          <Row gutter={[12, 12]} className="mb-4 md:mb-6">
            {/* Upcoming Bookings */}
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <Card 
                title={
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-olive-green-500 to-olive-green-600">
                      <CalendarOutlined className="text-white text-lg sm:text-xl" />
                    </div>
                    <span className="text-base sm:text-lg font-bold text-gray-800">{language === 'ar' ? 'الحجوزات القادمة' : 'Upcoming Bookings'}</span>
                  </div>
                }
                className="glass-card card-hover shadow-professional-xl rounded-2xl border-0 h-full"
                style={{ animationDelay: '0.2s' }}
                styles={{ 
                  body: { padding: '24px' },
                  head: { 
                    background: 'transparent',
                    borderBottom: '2px solid rgba(0,0,0,0.05)',
                    padding: '20px 24px'
                  }
                }}
                extra={
                  upcomingBookings.length > 0 && (
                    <Button 
                      type="link" 
                      onClick={() => navigate('/client/bookings')}
                      className="text-olive-green-600 text-xs sm:text-sm p-0"
                    >
                      {language === 'ar' ? 'عرض الكل' : 'View All'} <ArrowRightOutlined />
                    </Button>
                  )
                }
              >
                {upcomingBookings.length > 0 ? (
                  <List
                    dataSource={upcomingBookings}
                    renderItem={(booking) => (
                      <List.Item className="hover:bg-gray-50 rounded-lg p-2 sm:p-3 transition-colors">
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              src={booking.consultant?.user?.avatar}
                              icon={<UserOutlined />}
                              size={{ xs: 40, sm: 48 }}
                            />
                          }
                          title={
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-wrap">
                              <span className="font-semibold text-sm sm:text-base">
                                {booking.service?.title || booking.service?.titleAr || 'Consultation'}
                              </span>
                              <Tag color="blue" className="text-xs">
                                {dayjs(booking.scheduledAt).format('MMM DD, YYYY')}
                              </Tag>
                            </div>
                          }
                          description={
                            <div>
                              <div className="text-gray-600 text-xs sm:text-sm">
                                {booking.consultant?.firstName} {booking.consultant?.lastName}
                              </div>
                              {booking.selectedTimeSlot && (
                                <div className="text-xs text-gray-500 mt-1">
                                  <ClockCircleOutlined /> {booking.selectedTimeSlot}
                                </div>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty 
                    description={language === 'ar' ? 'لا توجد حجوزات قادمة' : 'No upcoming bookings'}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="py-8"
                  />
                )}
              </Card>
            </Col>

            {/* Quick Actions */}
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <Card 
                title={
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600">
                      <FileTextOutlined className="text-white text-lg sm:text-xl" />
                    </div>
                    <span className="text-base sm:text-lg font-bold text-gray-800">{language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</span>
                  </div>
                }
                className="glass-card card-hover shadow-professional-xl rounded-2xl border-0 h-full"
                style={{ animationDelay: '0.3s' }}
                styles={{ 
                  body: { padding: '24px' },
                  head: { 
                    background: 'transparent',
                    borderBottom: '2px solid rgba(0,0,0,0.05)',
                    padding: '20px 24px'
                  }
                }}
              >
                <div className="space-y-2 sm:space-y-3">
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<PlusOutlined />}
                    className="bg-olive-green-600 hover:bg-olive-green-700 border-0 h-11 sm:h-12 text-sm sm:text-base"
                    onClick={() => navigate('/client/bookings')}
                  >
                    {language === 'ar' ? 'حجز استشارة جديدة' : 'Book New Consultation'}
                  </Button>
                  <Button
                    size="large"
                    block
                    icon={<FileTextOutlined />}
                    className="border-olive-green-600 text-olive-green-600 hover:bg-olive-green-50 h-11 sm:h-12 text-sm sm:text-base"
                    onClick={() => navigate('/client/consultations')}
                  >
                    {language === 'ar' ? 'عرض الاستشارات السابقة' : 'View Previous Consultations'}
                  </Button>
                  <Button
                    size="large"
                    block
                    icon={<MessageOutlined />}
                    className="border-turquoise-500 text-turquoise-500 hover:bg-turquoise-50 h-11 sm:h-12 text-sm sm:text-base"
                    onClick={() => navigate('/client/chat')}
                  >
                    {language === 'ar' ? 'فتح المحادثة' : 'Open Chat'}
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Services - Improved Responsive Grid */}
      <div className="mb-6 md:mb-8 relative z-10 px-2 sm:px-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">
          {language === 'ar' ? 'خدماتنا' : 'Our Services'}
        </h2>
        <Row gutter={[12, 12]} className="sm:gutter-[16]">
          {services.map((service, index) => (
            <Col xs={12} sm={12} md={8} lg={6} xl={6} key={index}>
              <Card
                className="glass-card text-center cursor-pointer shadow-professional-xl border-0 card-hover h-full"
                onClick={() => navigate(service.path)}
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                styles={{ body: { padding: '20px' } }}
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white mx-auto mb-3 sm:mb-4 shadow-lg`}>
                  <div className="text-xl sm:text-3xl">{service.icon}</div>
                </div>
                <h3 className="font-semibold mb-2 sm:mb-3 text-gray-900 text-sm sm:text-base line-clamp-2">{service.title}</h3>
                <Button
                  type="primary"
                  size="small"
                  className="bg-olive-green-600 hover:bg-olive-green-700 border-0 w-full text-xs sm:text-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(service.path)
                  }}
                >
                  {language === 'ar' ? 'طلب الخدمة' : 'Request Service'}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}

export default ClientHome
