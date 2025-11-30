import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Spin, Alert, Table, Tag, Avatar, Tooltip } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  StarOutlined,
  CloseCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  BookOutlined,
  CreditCardOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'
import { useLanguage } from '../../contexts/LanguageContext'
import { adminAPI } from '../../services/api'
import dayjs from 'dayjs'

const AdminHome = () => {
  const { t, language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    activeClients: 0,
    totalClients: 0,
    activeConsultants: 0,
    totalConsultants: 0,
    completedSessions: 0,
    totalSessions: 0,
    pendingSessions: 0,
    confirmedSessions: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    lastMonthRevenue: 0,
    revenueGrowth: 0,
    averageRating: 0,
    totalRatings: 0,
    cancelledSessions: 0,
    totalBookings: 0,
    totalServices: 0,
    activeServices: 0,
    totalArticles: 0,
    publishedArticles: 0,
    totalPayments: 0,
    pendingPayments: 0,
    totalReports: 0,
    monthlyRevenueData: [],
    sessionsByStatus: [],
    topConsultants: [],
    recentBookings: [],
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminAPI.getDashboardStats()
      setStats(response.stats)
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Modern decorative shapes component
  const DecorativeShape = ({ className = '', delay = 0 }) => (
    <div 
      className={`absolute ${className} opacity-20 blur-3xl animate-pulse`}
      style={{ animationDelay: `${delay}s` }}
    />
  )

  // Modern KPI Card Component - Enhanced Design
  const KPICard = ({ 
    title, 
    value, 
    icon, 
    color, 
    suffix = '', 
    prefix = null,
    growth = null,
    delay = 0,
    subtitle = null 
  }) => (
    <Card 
      className="modern-kpi-card card-hover shadow-professional-lg relative overflow-hidden h-full border-0"
      style={{ animationDelay: `${delay}s` }}
      styles={{ body: { padding: '20px' } }}
    >
      {/* Modern decorative background shapes */}
      <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full ${color} opacity-5 blur-2xl`} />
      <div className={`absolute -bottom-6 -left-6 w-24 h-24 rounded-full ${color} opacity-5 blur-xl`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl ${color} bg-opacity-10 shadow-sm`}>
            <div className="text-2xl sm:text-3xl">
              {icon}
            </div>
          </div>
          {growth !== null && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
              growth >= 0 
                ? 'bg-green-50 text-green-600' 
                : 'bg-red-50 text-red-600'
            }`}>
              {growth >= 0 ? <RiseOutlined /> : <FallOutlined />}
              {Math.abs(growth).toFixed(1)}%
            </div>
          )}
        </div>
        <Statistic
          title={<span className="text-gray-600 font-semibold text-xs sm:text-sm uppercase tracking-wide">{title}</span>}
          value={value}
          prefix={prefix}
          suffix={suffix}
          valueStyle={{ 
            color: color.includes('teal') ? '#14b8a6' : 
                   color.includes('olive') ? '#7a8c66' : 
                   color.includes('yellow') ? '#faad14' : 
                   color.includes('red') ? '#ff4d4f' : '#1890ff',
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

  // Chart data from API
  const revenueData = stats.monthlyRevenueData?.length > 0 
    ? stats.monthlyRevenueData.map(item => ({
        month: item.month,
        revenue: item.revenue || 0
      }))
    : [
        { month: language === 'ar' ? 'يناير' : 'Jan', revenue: 50000 },
        { month: language === 'ar' ? 'فبراير' : 'Feb', revenue: 75000 },
        { month: language === 'ar' ? 'مارس' : 'Mar', revenue: 60000 },
        { month: language === 'ar' ? 'أبريل' : 'Apr', revenue: 90000 },
        { month: language === 'ar' ? 'مايو' : 'May', revenue: stats.monthlyRevenue || 85000 },
      ]

  const sessionStatusData = stats.sessionsByStatus?.length > 0
    ? stats.sessionsByStatus.map(item => ({
        name: language === 'ar' 
          ? (item.status === 'COMPLETED' ? 'مكتملة' : 
             item.status === 'PENDING' ? 'معلقة' : 
             item.status === 'CONFIRMED' ? 'مؤكدة' : 
             item.status === 'CANCELLED' ? 'ملغاة' : item.status)
          : item.status,
        value: item.count,
        color: item.status === 'COMPLETED' ? '#52c41a' :
               item.status === 'PENDING' ? '#faad14' :
               item.status === 'CONFIRMED' ? '#1890ff' :
               item.status === 'CANCELLED' ? '#ff4d4f' : '#8c8c8c'
      }))
    : [
        { name: language === 'ar' ? 'مكتملة' : 'Completed', value: stats.completedSessions, color: '#52c41a' },
        { name: language === 'ar' ? 'ملغاة' : 'Cancelled', value: stats.cancelledSessions, color: '#ff4d4f' },
      ]

  const serviceData = [
    { name: language === 'ar' ? 'استشارات' : 'Consultations', value: 35, color: '#14b8a6' },
    { name: language === 'ar' ? 'دراسات جدوى' : 'Feasibility', value: 25, color: '#7a8c66' },
    { name: language === 'ar' ? 'تحليلات' : 'Analysis', value: 40, color: '#faad14' },
  ]

  const COLORS = ['#14b8a6', '#7a8c66', '#faad14', '#1890ff', '#722ed1']

  // Recent bookings table columns
  const recentBookingsColumns = [
    {
      title: language === 'ar' ? 'العميل' : 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: language === 'ar' ? 'المستشار' : 'Consultant',
      dataIndex: 'consultantName',
      key: 'consultantName',
    },
    {
      title: language === 'ar' ? 'الخدمة' : 'Service',
      dataIndex: 'serviceName',
      key: 'serviceName',
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          COMPLETED: { color: 'green', text: language === 'ar' ? 'مكتملة' : 'Completed' },
          PENDING: { color: 'orange', text: language === 'ar' ? 'معلقة' : 'Pending' },
          CONFIRMED: { color: 'blue', text: language === 'ar' ? 'مؤكدة' : 'Confirmed' },
          CANCELLED: { color: 'red', text: language === 'ar' ? 'ملغاة' : 'Cancelled' },
        }
        const config = statusConfig[status] || { color: 'default', text: status }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: language === 'ar' ? 'التاريخ' : 'Date',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
    },
  ]

  // Top consultants table columns
  const topConsultantsColumns = [
    {
      title: language === 'ar' ? 'المستشار' : 'Consultant',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div className="flex items-center gap-2">
          <Avatar icon={<UserOutlined />} />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: language === 'ar' ? 'الحجوزات' : 'Bookings',
      dataIndex: 'bookings',
      key: 'bookings',
      render: (value) => <span className="font-semibold">{value}</span>,
    },
    {
      title: language === 'ar' ? 'التقييم' : 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <div className="flex items-center gap-1">
          <StarOutlined className="text-yellow-500" />
          <span className="font-semibold">{rating?.toFixed(1) || '0.0'}</span>
        </div>
      ),
    },
  ]

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

  return (
    <div className="relative min-h-screen pb-8 dashboard-bg">
      {/* Modern Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-br from-olive-green-100/40 to-turquoise-100/40 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-tr from-teal-100/40 to-olive-green-100/40 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Modern Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-10 relative z-10 px-2 sm:px-0">
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3">
            {t('dashboardOverview')}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            {t('platformPerformance')}
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

      {/* Main KPIs - Row 1 - Responsive Grid */}
      <Row gutter={[12, 12]} className="mb-4 md:mb-6">
        <Col xs={12} sm={12} md={8} lg={6} xl={4}>
          <KPICard
            title={t('activeClients')}
            value={stats.activeClients}
            icon={<UserOutlined className="text-xl sm:text-2xl text-teal-500" />}
            color="bg-teal-500"
            subtitle={t('totalClients') + `: ${stats.totalClients}`}
            delay={0.1}
          />
        </Col>
        <Col xs={12} sm={12} md={8} lg={6} xl={4}>
          <KPICard
            title={t('activeConsultants')}
            value={stats.activeConsultants}
            icon={<TeamOutlined className="text-xl sm:text-2xl text-olive-green-600" />}
            color="bg-olive-green-600"
            subtitle={t('totalConsultants') + `: ${stats.totalConsultants}`}
            delay={0.2}
          />
        </Col>
        <Col xs={12} sm={12} md={8} lg={6} xl={4}>
          <KPICard
            title={t('completedSessions')}
            value={stats.completedSessions}
            icon={<CheckCircleOutlined className="text-xl sm:text-2xl text-teal-500" />}
            color="bg-teal-500"
            subtitle={t('totalSessions') + `: ${stats.totalSessions}`}
            delay={0.3}
          />
        </Col>
        <Col xs={12} sm={12} md={8} lg={6} xl={4}>
          <KPICard
            title={t('monthlyRevenue')}
            value={stats.monthlyRevenue}
            icon={<DollarOutlined className="text-xl sm:text-2xl text-olive-green-600" />}
            color="bg-olive-green-600"
            suffix={language === 'ar' ? ' ريال' : ' SAR'}
            growth={stats.revenueGrowth}
            delay={0.4}
          />
        </Col>
        <Col xs={12} sm={12} md={8} lg={6} xl={4}>
          <KPICard
            title={t('averageRating')}
            value={stats.averageRating}
            icon={<StarOutlined className="text-xl sm:text-2xl text-yellow-500" />}
            color="bg-yellow-500"
            suffix="/ 5"
            subtitle={t('totalRatings') + `: ${stats.totalRatings}`}
            delay={0.5}
          />
        </Col>
        <Col xs={12} sm={12} md={8} lg={6} xl={4}>
          <KPICard
            title={t('cancelledSessions')}
            value={stats.cancelledSessions}
            icon={<CloseCircleOutlined className="text-xl sm:text-2xl text-red-500" />}
            color="bg-red-500"
            delay={0.6}
          />
        </Col>
      </Row>

      {/* Secondary KPIs - Row 2 - Responsive Grid */}
      <Row gutter={[12, 12]} className="mb-4 md:mb-6">
        <Col xs={12} sm={12} md={6} lg={4} xl={4}>
          <KPICard
            title={t('totalServices')}
            value={stats.totalServices}
            icon={<AppstoreOutlined className="text-lg sm:text-xl text-blue-500" />}
            color="bg-blue-500"
            subtitle={t('activeServices') + `: ${stats.activeServices}`}
            delay={0.7}
          />
        </Col>
        <Col xs={12} sm={12} md={6} lg={4} xl={4}>
          <KPICard
            title={t('totalArticles')}
            value={stats.totalArticles}
            icon={<BookOutlined className="text-lg sm:text-xl text-purple-500" />}
            color="bg-purple-500"
            subtitle={t('publishedArticles') + `: ${stats.publishedArticles}`}
            delay={0.8}
          />
        </Col>
        <Col xs={12} sm={12} md={6} lg={4} xl={4}>
          <KPICard
            title={t('totalPayments')}
            value={stats.totalPayments}
            icon={<CreditCardOutlined className="text-lg sm:text-xl text-green-500" />}
            color="bg-green-500"
            subtitle={t('pendingPayments') + `: ${stats.pendingPayments}`}
            delay={0.9}
          />
        </Col>
        <Col xs={12} sm={12} md={6} lg={4} xl={4}>
          <KPICard
            title={t('pendingSessions')}
            value={stats.pendingSessions}
            icon={<ClockCircleOutlined className="text-lg sm:text-xl text-orange-500" />}
            color="bg-orange-500"
            delay={1.0}
          />
        </Col>
        <Col xs={12} sm={12} md={6} lg={4} xl={4}>
          <KPICard
            title={t('confirmedSessions')}
            value={stats.confirmedSessions}
            icon={<CheckCircleOutlined className="text-lg sm:text-xl text-blue-500" />}
            color="bg-blue-500"
            delay={1.1}
          />
        </Col>
        <Col xs={12} sm={12} md={6} lg={4} xl={4}>
          <KPICard
            title={t('totalReports')}
            value={stats.totalReports}
            icon={<FileTextOutlined className="text-lg sm:text-xl text-indigo-500" />}
            color="bg-indigo-500"
            delay={1.2}
          />
        </Col>
      </Row>

      {/* Charts Row 1 - Responsive */}
      <Row gutter={[12, 12]} className="mb-4 md:mb-6">
        <Col xs={24} sm={24} md={24} lg={16} xl={16}>
          <Card 
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-olive-green-500 to-olive-green-600">
                  <TrophyOutlined className="text-white text-lg sm:text-xl" />
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-800">{t('monthlyRevenueTrend')}</span>
              </div>
            }
            className="glass-card card-hover shadow-professional-xl rounded-2xl border-0"
            style={{ animationDelay: '0.2s' }}
            styles={{ 
              body: { padding: '24px' },
              head: { 
                background: 'transparent',
                borderBottom: '2px solid rgba(0,0,0,0.05)',
                padding: '20px 24px'
              }
            }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7a8c66" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7a8c66" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <RechartsTooltip 
                  formatter={(value) => [`${value} ${language === 'ar' ? 'ريال' : 'SAR'}`, language === 'ar' ? 'الإيرادات' : 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#7a8c66" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Card 
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600">
                  <CheckCircleOutlined className="text-white text-lg sm:text-xl" />
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-800">{t('sessionsStatus')}</span>
              </div>
            }
            className="glass-card card-hover shadow-professional-xl rounded-2xl border-0"
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
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sessionStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sessionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 - Responsive */}
      <Row gutter={[12, 12]} className="mb-4 md:mb-6">
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Card 
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <AppstoreOutlined className="text-white text-lg sm:text-xl" />
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-800">{t('servicesDistribution')}</span>
              </div>
            }
            className="glass-card card-hover shadow-professional-xl rounded-2xl border-0"
            style={{ animationDelay: '0.4s' }}
            styles={{ 
              body: { padding: '24px' },
              head: { 
                background: 'transparent',
                borderBottom: '2px solid rgba(0,0,0,0.05)',
                padding: '20px 24px'
              }
            }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Card 
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                  <RiseOutlined className="text-white text-lg sm:text-xl" />
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-800">{t('performanceComparison')}</span>
              </div>
            }
            className="glass-card card-hover shadow-professional-xl rounded-2xl border-0"
            style={{ animationDelay: '0.5s' }}
            styles={{ 
              body: { padding: '24px' },
              head: { 
                background: 'transparent',
                borderBottom: '2px solid rgba(0,0,0,0.05)',
                padding: '20px 24px'
              }
            }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#7a8c66" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Tables Row - Responsive */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={24} lg={14} xl={14}>
          <Card 
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                  <ClockCircleOutlined className="text-white text-lg sm:text-xl" />
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-800">{t('recentBookings')}</span>
              </div>
            }
            className="glass-card card-hover shadow-professional-xl rounded-2xl border-0"
            style={{ animationDelay: '0.6s' }}
            styles={{ 
              body: { padding: '24px' },
              head: { 
                background: 'transparent',
                borderBottom: '2px solid rgba(0,0,0,0.05)',
                padding: '20px 24px'
              }
            }}
          >
            <div className="overflow-x-auto">
              <Table
                dataSource={stats.recentBookings || []}
                columns={recentBookingsColumns}
                pagination={{ pageSize: 5, responsive: true }}
                size="small"
                rowKey="id"
                scroll={{ x: 'max-content' }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={24} lg={10} xl={10}>
          <Card 
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600">
                  <TrophyOutlined className="text-white text-lg sm:text-xl" />
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-800">{t('topConsultants')}</span>
              </div>
            }
            className="glass-card card-hover shadow-professional-xl rounded-2xl border-0"
            style={{ animationDelay: '0.7s' }}
            styles={{ 
              body: { padding: '24px' },
              head: { 
                background: 'transparent',
                borderBottom: '2px solid rgba(0,0,0,0.05)',
                padding: '20px 24px'
              }
            }}
          >
            <div className="overflow-x-auto">
              <Table
                dataSource={stats.topConsultants || []}
                columns={topConsultantsColumns}
                pagination={false}
                size="small"
                rowKey="id"
                scroll={{ x: 'max-content' }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminHome
