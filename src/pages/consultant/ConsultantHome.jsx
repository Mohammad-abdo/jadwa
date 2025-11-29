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

  // Modern KPI Card Component
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
                   color.includes('yellow') ? '#faad14' : 
                   color.includes('green') ? '#52c41a' : '#1890ff',
            fontWeight: 'bold',
            fontSize: '24px'
          }}
        />
        {subtitle && (
          <div className="mt-2 text-xs text-gray-500">{subtitle}</div>
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
    <div className="relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-olive-green-100 to-turquoise-100 rounded-full blur-3xl opacity-20 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-100 to-olive-green-100 rounded-full blur-3xl opacity-20 -z-10" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-olive-green-600 via-olive-green-500 to-turquoise-500 bg-clip-text text-transparent mb-2 animate-fade-in">
            {language === 'ar' ? `مرحباً، ${consultantName}` : `Welcome, ${consultantName}`}
          </h1>
          <p className="text-gray-500 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {language === 'ar' ? 'نظرة عامة على أدائك' : 'Overview of your performance'}
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

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <KPICard
            title={language === 'ar' ? 'إجمالي الجلسات' : 'Total Sessions'}
            value={stats.totalSessions}
            icon={<CalendarOutlined className="text-2xl text-teal-500" />}
            color="bg-teal-500"
            delay={0.1}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KPICard
            title={language === 'ar' ? 'الجلسات المعلقة' : 'Pending Sessions'}
            value={stats.pendingSessions}
            icon={<ClockCircleOutlined className="text-2xl text-orange-500" />}
            color="bg-orange-500"
            delay={0.2}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KPICard
            title={language === 'ar' ? 'التقييم' : 'Rating'}
            value={stats.rating}
            precision={1}
            icon={<StarOutlined className="text-2xl text-yellow-500" />}
            color="bg-yellow-500"
            suffix="/ 5"
            subtitle={language === 'ar' ? `${stats.totalRatings} تقييمات` : `${stats.totalRatings} ratings`}
            delay={0.3}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KPICard
            title={language === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings'}
            value={stats.totalEarnings}
            icon={<DollarOutlined className="text-2xl text-olive-green-600" />}
            color="bg-olive-green-600"
            suffix={language === 'ar' ? ' ريال' : ' SAR'}
            delay={0.4}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Upcoming Sessions */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <CalendarOutlined className="text-olive-green-600" />
                <span>{language === 'ar' ? 'الجلسات القادمة' : 'Upcoming Sessions'}</span>
              </div>
            }
            className="shadow-professional-lg card-hover slide-in rounded-xl border-0 bg-gradient-to-br from-white to-gray-50"
            style={{ animationDelay: '0.2s' }}
            extra={
              upcomingSessions.length > 0 && (
                <Button 
                  type="link" 
                  onClick={() => navigate('/consultant/sessions')}
                  className="text-olive-green-600"
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
                    className="hover:bg-gray-50 rounded-lg p-3 transition-colors"
                    actions={[
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
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
                          size={48}
                        />
                      }
                      title={
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">
                            {session.client?.firstName} {session.client?.lastName}
                          </span>
                          <Tag color="blue">
                            {dayjs(session.scheduledAt).format('MMM DD, YYYY')}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <div className="text-gray-600">
                            {session.service?.title || session.service?.titleAr || 'Consultation'}
                          </div>
                          {session.selectedTimeSlot && (
                            <div className="text-sm text-gray-500 mt-1">
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
              />
            )}
          </Card>
        </Col>

        {/* Recent Sessions */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <TrophyOutlined className="text-yellow-500" />
                <span>{language === 'ar' ? 'الجلسات الأخيرة' : 'Recent Sessions'}</span>
              </div>
            }
            className="shadow-professional-lg card-hover slide-in rounded-xl border-0 bg-gradient-to-br from-white to-gray-50"
            style={{ animationDelay: '0.3s' }}
            extra={
              recentSessions.length > 0 && (
                <Button 
                  type="link" 
                  onClick={() => navigate('/consultant/sessions')}
                  className="text-olive-green-600"
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
                  <List.Item className="hover:bg-gray-50 rounded-lg p-3 transition-colors">
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={session.client?.user?.avatar}
                          icon={<UserOutlined />}
                          size={48}
                        />
                      }
                      title={
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">
                            {session.client?.firstName} {session.client?.lastName}
                          </span>
                          <Tag color={session.status === 'COMPLETED' ? 'green' : session.status === 'IN_PROGRESS' ? 'blue' : 'orange'}>
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
                          <div className="text-gray-600">
                            {session.service?.title || session.service?.titleAr || 'Consultation'}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
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
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ConsultantHome
