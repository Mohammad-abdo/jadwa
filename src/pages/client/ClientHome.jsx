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

  // Modern KPI Card Component
  const KPICard = ({ 
    title, 
    value, 
    icon, 
    color, 
    suffix = '', 
    delay = 0 
  }) => (
    <Card 
      className="card-hover scale-in shadow-professional-lg relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Decorative background */}
      <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full ${color} opacity-10 blur-2xl`} />
      <div className={`absolute -bottom-6 -left-6 w-24 h-24 rounded-full ${color} opacity-10 blur-xl`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            {icon}
          </div>
        </div>
        <Statistic
          title={<span className="text-gray-600 font-medium">{title}</span>}
          value={value}
          suffix={suffix}
          valueStyle={{ 
            color: color.includes('teal') ? '#14b8a6' : 
                   color.includes('olive') ? '#7a8c66' : 
                   color.includes('blue') ? '#1890ff' : '#faad14',
            fontWeight: 'bold',
            fontSize: '24px'
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
    <div className="relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-olive-green-100 to-turquoise-100 rounded-full blur-3xl opacity-20 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-100 to-olive-green-100 rounded-full blur-3xl opacity-20 -z-10" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-olive-green-600 via-olive-green-500 to-turquoise-500 bg-clip-text text-transparent mb-2 animate-fade-in">
            {language === 'ar' ? `مرحباً، ${clientName}` : `Welcome, ${clientName}`}
          </h1>
          <p className="text-gray-500 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {language === 'ar'
              ? 'إليك نظرة سريعة على حسابك'
              : 'Here is a quick overview of your account'}
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
          {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
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
        />
      ) : (
        <>
          {/* Statistics */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              <KPICard
                title={language === 'ar' ? 'إجمالي الحجوزات' : 'Total Bookings'}
                value={stats.totalBookings}
                icon={<CalendarOutlined className="text-2xl text-teal-500" />}
                color="bg-teal-500"
                delay={0.1}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <KPICard
                title={language === 'ar' ? 'الحجوزات المعلقة' : 'Pending Bookings'}
                value={stats.pendingBookings}
                icon={<ClockCircleOutlined className="text-2xl text-orange-500" />}
                color="bg-orange-500"
                delay={0.2}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <KPICard
                title={language === 'ar' ? 'الحجوزات المكتملة' : 'Completed Bookings'}
                value={stats.completedBookings}
                icon={<CheckCircleOutlined className="text-2xl text-green-500" />}
                color="bg-green-500"
                delay={0.3}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <KPICard
                title={language === 'ar' ? 'إجمالي الإنفاق' : 'Total Spent'}
                value={stats.totalSpent}
                icon={<DollarOutlined className="text-2xl text-olive-green-600" />}
                color="bg-olive-green-600"
                suffix={language === 'ar' ? ' ريال' : ' SAR'}
                delay={0.4}
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
            {/* Upcoming Bookings */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-olive-green-600" />
                    <span>{language === 'ar' ? 'الحجوزات القادمة' : 'Upcoming Bookings'}</span>
                  </div>
                }
                className="shadow-professional-lg card-hover slide-in rounded-xl border-0 bg-gradient-to-br from-white to-gray-50"
                style={{ animationDelay: '0.2s' }}
                extra={
                  upcomingBookings.length > 0 && (
                    <Button 
                      type="link" 
                      onClick={() => navigate('/client/bookings')}
                      className="text-olive-green-600"
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
                      <List.Item className="hover:bg-gray-50 rounded-lg p-3 transition-colors">
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              src={booking.consultant?.user?.avatar}
                              icon={<UserOutlined />}
                              size={48}
                            />
                          }
                          title={
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">
                                {booking.service?.title || booking.service?.titleAr || 'Consultation'}
                              </span>
                              <Tag color="blue">
                                {dayjs(booking.scheduledAt).format('MMM DD, YYYY')}
                              </Tag>
                            </div>
                          }
                          description={
                            <div>
                              <div className="text-gray-600">
                                {booking.consultant?.firstName} {booking.consultant?.lastName}
                              </div>
                              {booking.selectedTimeSlot && (
                                <div className="text-sm text-gray-500 mt-1">
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
                  />
                )}
              </Card>
            </Col>

            {/* Quick Actions */}
            <Col xs={24} lg={12}>
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <FileTextOutlined className="text-teal-500" />
                    <span>{language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}</span>
                  </div>
                }
                className="shadow-professional-lg card-hover slide-in rounded-xl border-0 bg-gradient-to-br from-white to-gray-50"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="space-y-3">
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<PlusOutlined />}
                    className="bg-olive-green-600 hover:bg-olive-green-700 border-0 h-12 text-base"
                    onClick={() => navigate('/client/bookings')}
                  >
                    {language === 'ar' ? 'حجز استشارة جديدة' : 'Book New Consultation'}
                  </Button>
                  <Button
                    size="large"
                    block
                    icon={<FileTextOutlined />}
                    className="border-olive-green-600 text-olive-green-600 hover:bg-olive-green-50 h-12 text-base"
                    onClick={() => navigate('/client/consultations')}
                  >
                    {language === 'ar' ? 'عرض الاستشارات السابقة' : 'View Previous Consultations'}
                  </Button>
                  <Button
                    size="large"
                    block
                    icon={<MessageOutlined />}
                    className="border-turquoise-500 text-turquoise-500 hover:bg-turquoise-50 h-12 text-base"
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

      {/* Services */}
      <div className="mb-8 relative z-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {language === 'ar' ? 'خدماتنا' : 'Our Services'}
        </h2>
        <Row gutter={[16, 16]}>
          {services.map((service, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              <Card
                className="card text-center hover:scale-105 transition-all duration-300 cursor-pointer shadow-professional-lg border-0 bg-gradient-to-br from-white to-gray-50 card-hover"
                onClick={() => navigate(service.path)}
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                  {service.icon}
                </div>
                <h3 className="font-semibold mb-3 text-gray-900">{service.title}</h3>
                <Button
                  type="primary"
                  className="bg-olive-green-600 hover:bg-olive-green-700 border-0 w-full"
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
