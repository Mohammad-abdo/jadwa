import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, List, Avatar, Tag, Button, Spin, Alert, Empty, Rate } from 'antd'
import {
  CalendarOutlined,
  UserOutlined,
  StarOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { consultantAPI } from '../../services/api'
import dayjs from 'dayjs'

const ConsultantHome = () => {
  const { language } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalSessions: 0,
    pendingSessions: 0,
    completedSessions: 0,
    totalEarnings: 0,
    rating: 0,
    totalRatings: 0,
  })
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [recentSessions, setRecentSessions] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await consultantAPI.getDashboardStats()
      setStats(response.stats)
      setUpcomingSessions(response.upcomingSessions || [])
      setRecentSessions(response.recentSessions || [])
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
    subtitle = null,
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
                   color.includes('yellow') ? '#faad14' : 
                   color.includes('green') ? '#52c41a' : '#1890ff',
            fontWeight: 800,
            fontSize: 'clamp(20px, 4vw, 28px)',
            lineHeight: 1.2
          }}
        />
        {subtitle && (
          <div className="mt-3 text-xs text-gray-500 font-medium">{subtitle}</div>
        )}
      </div>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        message={language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error Loading Data'}
        description={error}
        type="error"
        showIcon
        closable
        onClose={() => setError(null)}
      />
    )
  }

  const consultantName = user?.consultant
    ? `${user.consultant.firstName || ''} ${user.consultant.lastName || ''}`.trim()
    : user?.email || (language === 'ar' ? 'المستشار' : 'Consultant')

  return (
    <div className="relative min-h-screen pb-8 dashboard-bg">
      {/* Modern Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-br from-olive-green-100/40 to-turquoise-100/40 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-tr from-teal-100/40 to-olive-green-100/40 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Modern Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-10 relative z-10 px-2 sm:px-0">
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3">
            {language === 'ar' ? `مرحباً، ${consultantName}` : `Welcome, ${consultantName}`}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            {language === 'ar' ? 'نظرة عامة على أدائك' : 'Overview of your performance'}
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

      {/* Statistics - Improved Responsive Grid */}
      <Row gutter={[12, 12]} className="mb-4 md:mb-6">
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <KPICard
            title={language === 'ar' ? 'إجمالي الجلسات' : 'Total Sessions'}
            value={stats.totalSessions}
            icon={<CalendarOutlined className="text-xl sm:text-2xl text-teal-500" />}
            color="bg-teal-500"
            delay={0.1}
          />
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <KPICard
            title={language === 'ar' ? 'الجلسات المعلقة' : 'Pending Sessions'}
            value={stats.pendingSessions}
            icon={<ClockCircleOutlined className="text-xl sm:text-2xl text-orange-500" />}
            color="bg-orange-500"
            delay={0.2}
          />
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <KPICard
            title={language === 'ar' ? 'التقييم' : 'Rating'}
            value={stats.rating}
            precision={1}
            icon={<StarOutlined className="text-xl sm:text-2xl text-yellow-500" />}
            color="bg-yellow-500"
            suffix="/ 5"
            subtitle={language === 'ar' ? `${stats.totalRatings} تقييمات` : `${stats.totalRatings} ratings`}
            delay={0.3}
          />
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <KPICard
            title={language === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings'}
            value={stats.totalEarnings}
            icon={<DollarOutlined className="text-xl sm:text-2xl text-olive-green-600" />}
            color="bg-olive-green-600"
            suffix={language === 'ar' ? ' ريال' : ' SAR'}
            delay={0.4}
          />
        </Col>
      </Row>

      <Row gutter={[12, 12]} className="mb-4 md:mb-6">
        {/* Upcoming Sessions */}
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Card 
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-olive-green-500 to-olive-green-600">
                  <CalendarOutlined className="text-white text-lg sm:text-xl" />
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-800">{language === 'ar' ? 'الجلسات القادمة' : 'Upcoming Sessions'}</span>
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
              upcomingSessions.length > 0 && (
                <Button 
                  type="link" 
                  onClick={() => navigate('/consultant/sessions')}
                  className="text-olive-green-600 text-xs sm:text-sm p-0"
                >
                  {language === 'ar' ? 'عرض الكل' : 'View All'} <ArrowRightOutlined />
                </Button>
              )
            }
          >
            {upcomingSessions.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={upcomingSessions}
                renderItem={(session) => (
                  <List.Item 
                    className="hover:bg-gray-50 rounded-lg p-2 sm:p-3 transition-colors"
                    actions={[
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlayCircleOutlined />}
                        className="bg-olive-green-600 hover:bg-olive-green-700 border-0 text-xs sm:text-sm"
                        onClick={() => navigate(`/consultant/chat/${session.bookingId || session.id}`)}
                      >
                        {language === 'ar' ? 'بدء' : 'Start'}
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={session.client?.user?.avatar}
                          icon={<UserOutlined />}
                          size={{ xs: 40, sm: 48 }}
                        />
                      }
                      title={
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-wrap">
                          <span className="font-semibold text-sm sm:text-base">
                            {session.client?.firstName} {session.client?.lastName}
                          </span>
                          <Tag color="blue" className="text-xs">
                            {dayjs(session.scheduledAt).format('MMM DD, YYYY')}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <div className="text-gray-600 text-xs sm:text-sm">
                            {session.service?.title || session.service?.titleAr || 'Consultation'}
                          </div>
                          {session.selectedTimeSlot && (
                            <div className="text-xs text-gray-500 mt-1">
                              <ClockCircleOutlined /> {session.selectedTimeSlot}
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
                description={language === 'ar' ? 'لا توجد جلسات قادمة' : 'No upcoming sessions'}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                className="py-8"
              />
            )}
          </Card>
        </Col>

        {/* Recent Sessions */}
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Card 
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600">
                  <TrophyOutlined className="text-white text-lg sm:text-xl" />
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-800">{language === 'ar' ? 'الجلسات الأخيرة' : 'Recent Sessions'}</span>
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
            extra={
              recentSessions.length > 0 && (
                <Button 
                  type="link" 
                  onClick={() => navigate('/consultant/sessions')}
                  className="text-olive-green-600 text-xs sm:text-sm p-0"
                >
                  {language === 'ar' ? 'عرض الكل' : 'View All'} <ArrowRightOutlined />
                </Button>
              )
            }
          >
            {recentSessions.length > 0 ? (
              <List
                dataSource={recentSessions}
                renderItem={(session) => (
                  <List.Item className="hover:bg-gray-50 rounded-lg p-2 sm:p-3 transition-colors">
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={session.client?.user?.avatar}
                          icon={<UserOutlined />}
                          size={{ xs: 40, sm: 48 }}
                        />
                      }
                      title={
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-wrap">
                          <span className="font-semibold text-sm sm:text-base">
                            {session.client?.firstName} {session.client?.lastName}
                          </span>
                          <Tag color={session.status === 'COMPLETED' ? 'green' : session.status === 'IN_PROGRESS' ? 'blue' : 'orange'} className="text-xs">
                            {session.status === 'COMPLETED' 
                              ? (language === 'ar' ? 'مكتملة' : 'Completed')
                              : session.status === 'IN_PROGRESS'
                              ? (language === 'ar' ? 'قيد التنفيذ' : 'In Progress')
                              : session.status}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <div className="text-gray-600 text-xs sm:text-sm">
                            {session.service?.title || session.service?.titleAr || 'Consultation'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            <ClockCircleOutlined /> {dayjs(session.createdAt).format('MMM DD, YYYY')}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description={language === 'ar' ? 'لا توجد جلسات حديثة' : 'No recent sessions'}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                className="py-8"
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ConsultantHome
