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

  // KPI Card Component with modern design
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
      className="card-hover scale-in shadow-professional-lg relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Decorative background shapes */}
      <DecorativeShape 
        className={`w-32 h-32 rounded-full ${color} -top-8 -right-8`}
        delay={delay}
      />
      <DecorativeShape 
        className={`w-24 h-24 rounded-full ${color} -bottom-6 -left-6`}
        delay={delay + 0.3}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            {icon}
          </div>
          {growth !== null && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth >= 0 ? <RiseOutlined /> : <FallOutlined />}
              {Math.abs(growth).toFixed(1)}%
            </div>
          )}
        </div>
        <Statistic
          title={<span className="text-gray-600 font-medium">{title}</span>}
          value={value}
          prefix={prefix}
          suffix={suffix}
          valueStyle={{ 
            color: color.includes('teal') ? '#14b8a6' : 
                   color.includes('olive') ? '#7a8c66' : 
                   color.includes('yellow') ? '#faad14' : 
                   color.includes('red') ? '#ff4d4f' : '#1890ff',
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
    <div className="relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-olive-green-100 to-turquoise-100 rounded-full blur-3xl opacity-20 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-100 to-olive-green-100 rounded-full blur-3xl opacity-20 -z-10" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-olive-green-600 via-olive-green-500 to-turquoise-500 bg-clip-text text-transparent mb-2 animate-fade-in">
            {t('dashboardOverview')}
          </h1>
          <p className="text-gray-500 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {t('platformPerformance')}
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

      {/* Main KPIs - Row 1 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <KPICard
            title={t('activeClients')}
            value={stats.activeClients}
            icon={<UserOutlined className="text-2xl text-teal-500" />}
            color="bg-teal-500"
            subtitle={t('totalClients') + `: ${stats.totalClients}`}
            delay={0.1}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <KPICard
            title={t('activeConsultants')}
            value={stats.activeConsultants}
            icon={<TeamOutlined className="text-2xl text-olive-green-600" />}
            color="bg-olive-green-600"
            subtitle={t('totalConsultants') + `: ${stats.totalConsultants}`}
            delay={0.2}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <KPICard
            title={t('completedSessions')}
            value={stats.completedSessions}
            icon={<CheckCircleOutlined className="text-2xl text-teal-500" />}
            color="bg-teal-500"
            subtitle={t('totalSessions') + `: ${stats.totalSessions}`}
            delay={0.3}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <KPICard
            title={t('monthlyRevenue')}
            value={stats.monthlyRevenue}
            icon={<DollarOutlined className="text-2xl text-olive-green-600" />}
            color="bg-olive-green-600"
            suffix={language === 'ar' ? ' ريال' : ' SAR'}
            growth={stats.revenueGrowth}
            delay={0.4}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <KPICard
            title={t('averageRating')}
            value={stats.averageRating}
            icon={<StarOutlined className="text-2xl text-yellow-500" />}
            color="bg-yellow-500"
            suffix="/ 5"
            subtitle={t('totalRatings') + `: ${stats.totalRatings}`}
            delay={0.5}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <KPICard
            title={t('cancelledSessions')}
            value={stats.cancelledSessions}
            icon={<CloseCircleOutlined className="text-2xl text-red-500" />}
            color="bg-red-500"
            delay={0.6}
          />
        </Col>
      </Row>

      {/* Secondary KPIs - Row 2 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6} lg={4}>
          <KPICard
            title={t('totalServices')}
            value={stats.totalServices}
            icon={<AppstoreOutlined className="text-xl text-blue-500" />}
            color="bg-blue-500"
            subtitle={t('activeServices') + `: ${stats.activeServices}`}
            delay={0.7}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <KPICard
            title={t('totalArticles')}
            value={stats.totalArticles}
            icon={<BookOutlined className="text-xl text-purple-500" />}
            color="bg-purple-500"
            subtitle={t('publishedArticles') + `: ${stats.publishedArticles}`}
            delay={0.8}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <KPICard
            title={t('totalPayments')}
            value={stats.totalPayments}
            icon={<CreditCardOutlined className="text-xl text-green-500" />}
            color="bg-green-500"
            subtitle={t('pendingPayments') + `: ${stats.pendingPayments}`}
            delay={0.9}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <KPICard
            title={t('pendingSessions')}
            value={stats.pendingSessions}
            icon={<ClockCircleOutlined className="text-xl text-orange-500" />}
            color="bg-orange-500"
            delay={1.0}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <KPICard
            title={t('confirmedSessions')}
            value={stats.confirmedSessions}
            icon={<CheckCircleOutlined className="text-xl text-blue-500" />}
            color="bg-blue-500"
            delay={1.1}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <KPICard
            title={t('totalReports')}
            value={stats.totalReports}
            icon={<FileTextOutlined className="text-xl text-indigo-500" />}
            color="bg-indigo-500"
            delay={1.2}
          />
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <TrophyOutlined className="text-olive-green-600" />
                <span>{t('monthlyRevenueTrend')}</span>
              </div>
            }
            className="shadow-professional-lg card-hover slide-in rounded-xl border-0 bg-gradient-to-br from-white to-gray-50"
            style={{ animationDelay: '0.2s' }}
          >
            <ResponsiveContainer width="100%" height={300}>
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
        <Col xs={24} lg={8}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-teal-500" />
                <span>{t('sessionsStatus')}</span>
              </div>
            }
            className="shadow-professional-lg card-hover slide-in rounded-xl border-0 bg-gradient-to-br from-white to-gray-50"
            style={{ animationDelay: '0.3s' }}
          >
            <ResponsiveContainer width="100%" height={300}>
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

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <AppstoreOutlined className="text-blue-500" />
                <span>{t('servicesDistribution')}</span>
              </div>
            }
            className="shadow-professional-lg card-hover slide-in rounded-xl border-0 bg-gradient-to-br from-white to-gray-50"
            style={{ animationDelay: '0.4s' }}
          >
            <ResponsiveContainer width="100%" height={300}>
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
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <RiseOutlined className="text-green-500" />
                <span>{t('performanceComparison')}</span>
              </div>
            }
            className="shadow-professional-lg card-hover slide-in rounded-xl border-0 bg-gradient-to-br from-white to-gray-50"
            style={{ animationDelay: '0.5s' }}
          >
            <ResponsiveContainer width="100%" height={300}>
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

      {/* Tables Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <ClockCircleOutlined className="text-orange-500" />
                <span>{t('recentBookings')}</span>
              </div>
            }
            className="shadow-professional-lg card-hover slide-in rounded-xl border-0 bg-gradient-to-br from-white to-gray-50"
            style={{ animationDelay: '0.6s' }}
          >
            <Table
              dataSource={stats.recentBookings || []}
              columns={recentBookingsColumns}
              pagination={{ pageSize: 5 }}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <TrophyOutlined className="text-yellow-500" />
                <span>{t('topConsultants')}</span>
              </div>
            }
            className="shadow-professional-lg card-hover slide-in rounded-xl border-0 bg-gradient-to-br from-white to-gray-50"
            style={{ animationDelay: '0.7s' }}
          >
            <Table
              dataSource={stats.topConsultants || []}
              columns={topConsultantsColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminHome
