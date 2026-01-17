import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Spin, Alert, Table, Tag, Avatar, Tooltip } from 'antd'
import { useWindowSize } from '../../hooks/useWindowSize'
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
  const { width } = useWindowSize()
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

  // Premium KPI Card Component
  const KPICard = ({ 
    title, 
    value, 
    icon, 
    suffix = '', 
    prefix = null,
    growth = null,
    delay = 0,
    subtitle = null,
    highlight = false
  }) => (
    <Card 
      className={`relative overflow-hidden h-full border-0 shadow-lg group transition-all duration-300 hover:-translate-y-1 ${
        highlight 
          ? 'bg-gradient-to-br from-olive-green-600 to-olive-green-800 text-white' 
          : 'bg-white hover:shadow-xl'
      }`}
      style={{ animationDelay: `${delay}s` }}
      styles={{ body: { padding: 'clamp(16px, 3vw, 24px)' } }}
    >
      {/* Background decoration for highlighted cards */}
      {highlight && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-12 -mb-12 pointer-events-none" />
        </>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl transition-colors duration-300 ${
            highlight 
              ? 'bg-white/20 text-white border border-white/30 shadow-inner' 
              : 'bg-olive-green-50 text-olive-green-600 border border-olive-green-100 group-hover:bg-olive-green-100'
          }`}>
            <div className={`text-lg xs:text-xl sm:text-2xl ${highlight ? 'text-white' : ''}`}>
              {icon}
            </div>
          </div>
          {growth !== null && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] xs:text-xs font-bold backdrop-blur-sm ${
              highlight
                ? 'bg-white/20 text-white border border-white/30'
                : growth >= 0 
                  ? 'bg-green-50 text-green-600 border border-green-100' 
                  : 'bg-red-50 text-red-600 border border-red-100'
            }`}>
              {growth >= 0 ? <RiseOutlined /> : <FallOutlined />}
              {Math.abs(growth).toFixed(1)}%
            </div>
          )}
        </div>
        
        <Statistic
          title={<span className={`font-medium text-[10px] xs:text-xs sm:text-sm uppercase tracking-wider ${
            highlight ? 'text-white/80' : 'text-gray-500'
          }`}>{title}</span>}
          value={value}
          prefix={prefix}
          suffix={suffix}
          valueStyle={{ 
            color: highlight ? '#ffffff' : '#1f2937',
            fontWeight: 700,
            fontSize: 'clamp(20px, 4vw + 8px, 28px)',
            lineHeight: 1.2,
            letterSpacing: '-0.01em'
          }}
        />
        
        {subtitle && (
          <div className={`mt-3 text-[11px] xs:text-xs sm:text-sm font-medium flex items-center gap-2 ${
            highlight ? 'text-white/70' : 'text-gray-400'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${highlight ? 'bg-white/60' : 'bg-olive-green-400'}`}></div>
            {subtitle}
          </div>
        )}
      </div>
    </Card>
  )

  // Chart data
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
        color: item.status === 'COMPLETED' ? '#10b981' : // Emerald-500
               item.status === 'PENDING' ? '#f59e0b' :   // Amber-500
               item.status === 'CONFIRMED' ? '#3b82f6' : // Blue-500
               item.status === 'CANCELLED' ? '#ef4444' : '#6b7280' // Red-500
      }))
    : [
        { name: language === 'ar' ? 'مكتملة' : 'Completed', value: stats.completedSessions, color: '#10b981' },
        { name: language === 'ar' ? 'ملغاة' : 'Cancelled', value: stats.cancelledSessions, color: '#ef4444' },
      ]

  const serviceData = [
    { name: language === 'ar' ? 'استشارات' : 'Consultations', value: 35, color: '#84cc16' }, // Olive-Green
    { name: language === 'ar' ? 'دراسات جدوى' : 'Feasibility', value: 25, color: '#14b8a6' }, // Teal
    { name: language === 'ar' ? 'تحليلات' : 'Analysis', value: 40, color: '#f59e0b' },      // Amber
  ]

  // Recent bookings columns
  const recentBookingsColumns = [
    {
      title: language === 'ar' ? 'العميل' : 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
      render: (text) => <span className="font-semibold text-gray-700">{text}</span>
    },
    {
      title: language === 'ar' ? 'المستشار' : 'Consultant',
      dataIndex: 'consultantName',
      key: 'consultantName',
      render: (text) => <span className="text-gray-600">{text}</span>
    },
    {
      title: language === 'ar' ? 'الخدمة' : 'Service',
      dataIndex: 'serviceName',
      key: 'serviceName',
      render: (text) => <Tag color="cyan">{text}</Tag>
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          COMPLETED: { color: 'success', text: language === 'ar' ? 'مكتملة' : 'Completed' },
          PENDING: { color: 'warning', text: language === 'ar' ? 'معلقة' : 'Pending' },
          CONFIRMED: { color: 'processing', text: language === 'ar' ? 'مؤكدة' : 'Confirmed' },
          CANCELLED: { color: 'error', text: language === 'ar' ? 'ملغاة' : 'Cancelled' },
        }[status] || { color: 'default', text: status }
        return <Tag color={config.color} className="font-medium">{config.text}</Tag>
      },
    },
    {
      title: language === 'ar' ? 'التاريخ' : 'Date',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      render: (date) => <span className="text-gray-500 font-mono text-xs">{date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'}</span>,
    },
  ]

  // Top consultants columns
  const topConsultantsColumns = [
    {
      title: language === 'ar' ? 'المستشار' : 'Consultant',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div className="flex items-center gap-3">
          <Avatar 
            icon={<UserOutlined />} 
            className="bg-olive-green-100 text-olive-green-600"
          />
          <span className="font-semibold text-gray-700">{text}</span>
        </div>
      ),
    },
    {
      title: language === 'ar' ? 'الحجوزات' : 'Bookings',
      dataIndex: 'bookings',
      key: 'bookings',
      render: (value) => <span className="font-bold text-olive-green-600 bg-olive-green-50 px-2 py-1 rounded-md">{value}</span>,
    },
    {
      title: language === 'ar' ? 'التقييم' : 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <div className="flex items-center gap-1.5">
          <StarOutlined className="text-amber-400" />
          <span className="font-bold text-gray-700">{rating?.toFixed(1) || '0.0'}</span>
        </div>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message={language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error Loading Data'}
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          className="rounded-xl shadow-sm border-red-200 bg-red-50"
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen pb-8">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-olive-green-50/20 -z-20" />
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-olive-green-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-turquoise-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply" />

      {/* Modern Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10 px-2 sm:px-0">
        <div className="flex-1 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 mb-3 tracking-tight">
            {t('dashboardOverview')}
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">
            {t('platformPerformance')}
          </p>
        </div>
        
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-olive-green-500 to-olive-green-600 text-white shadow-lg shadow-olive-green-500/20">
              <CalendarOutlined className="text-lg" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{language === 'ar' ? 'التاريخ' : 'Date'}</div>
              <div className="text-sm font-bold text-gray-700">
                {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-12 gap-4 lg:gap-6 mb-8">
        {/* Primary Stats - Full Width on Mobile, 4 columns on large */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <KPICard
            title={t('monthlyRevenue')}
            value={stats.monthlyRevenue}
            icon={<DollarOutlined />}
            suffix={language === 'ar' ? ' ريال' : ' SAR'}
            growth={stats.revenueGrowth}
            highlight={true}
            delay={0.1}
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <KPICard
            title={t('activeClients')}
            value={stats.activeClients}
            icon={<UserOutlined />}
            subtitle={t('totalClients') + `: ${stats.totalClients}`}
            delay={0.2}
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <KPICard
            title={t('completedSessions')}
            value={stats.completedSessions}
            icon={<CheckCircleOutlined />}
            growth={12.5} // Example growth
            subtitle={t('totalSessions') + `: ${stats.totalSessions}`}
            delay={0.3}
          />
        </div>
        <div className="col-span-12 sm:col-span-6 lg:col-span-3">
          <KPICard
            title={t('averageRating')}
            value={stats.averageRating}
            icon={<StarOutlined />}
            suffix="/ 5"
            subtitle={t('totalRatings') + `: ${stats.totalRatings}`}
            delay={0.4}
          />
        </div>

        {/* Secondary Stats - 3 columns on large */}
        <div className="col-span-6 md:col-span-4 lg:col-span-2">
          <KPICard title={t('activeConsultants')} value={stats.activeConsultants} icon={<TeamOutlined />} delay={0.5} />
        </div>
        <div className="col-span-6 md:col-span-4 lg:col-span-2">
          <KPICard title={t('pendingSessions')} value={stats.pendingSessions} icon={<ClockCircleOutlined />} delay={0.6} />
        </div>
         <div className="col-span-6 md:col-span-4 lg:col-span-2">
          <KPICard title={t('confirmedSessions')} value={stats.confirmedSessions} icon={<CheckCircleOutlined />} delay={0.7} />
        </div>
         <div className="col-span-6 md:col-span-4 lg:col-span-2">
          <KPICard title={t('totalServices')} value={stats.totalServices} icon={<AppstoreOutlined />} delay={0.8} />
        </div>
         <div className="col-span-6 md:col-span-4 lg:col-span-2">
          <KPICard title={t('totalArticles')} value={stats.totalArticles} icon={<BookOutlined />} delay={0.9} />
        </div>
         <div className="col-span-6 md:col-span-4 lg:col-span-2">
          <KPICard title={t('totalReports')} value={stats.totalReports} icon={<FileTextOutlined />} delay={1.0} />
        </div>
      </div>

      {/* Main Charts Section */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-olive-green-100 text-olive-green-600">
                  <TrophyOutlined className="text-xl" />
                </div>
                <span className="text-xl font-bold text-gray-800">{t('monthlyRevenueTrend')}</span>
              </div>
            }
            className="h-full border-0 shadow-lg rounded-2xl overflow-hidden glass-card"
            styles={{ 
              header: { borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '24px' },
              body: { padding: '24px' }
            }}
          >
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#84cc16" 
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
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                  <CheckCircleOutlined className="text-xl" />
                </div>
                <span className="text-xl font-bold text-gray-800">{t('sessionsStatus')}</span>
              </div>
            }
            className="h-full border-0 shadow-lg rounded-2xl overflow-hidden glass-card"
            styles={{ 
              header: { borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '24px' },
              body: { padding: '24px' }
            }}
          >
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={sessionStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sessionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                  }}
                />
                <Legend 
                  verticalAlign="middle" 
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  wrapperStyle={{ right: 0 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Secondary Charts & Lists */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card 
            title={
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <ClockCircleOutlined className="text-xl" />
                </div>
                <span className="text-xl font-bold text-gray-800">{t('recentBookings')}</span>
              </div>
            }
            className="h-full border-0 shadow-lg rounded-2xl overflow-hidden glass-card"
             styles={{ 
              header: { borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '24px' },
              body: { padding: '0' }
            }}
          >
            <Table
              dataSource={stats.recentBookings || []}
              columns={recentBookingsColumns}
              pagination={false}
              size="middle"
              rowKey="id"
              scroll={{ x: 'max-content' }}
              className="custom-table"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card 
            title={
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                  <StarOutlined className="text-xl" />
                </div>
                <span className="text-xl font-bold text-gray-800">{t('topConsultants')}</span>
              </div>
            }
            className="h-full border-0 shadow-lg rounded-2xl overflow-hidden glass-card"
             styles={{ 
              header: { borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '24px' },
              body: { padding: '0' }
            }}
          >
            <Table
              dataSource={stats.topConsultants || []}
              columns={topConsultantsColumns}
              pagination={false}
              size="middle"
              rowKey="id"
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminHome
