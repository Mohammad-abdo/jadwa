import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  message, 
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Input,
} from 'antd'
import { 
  ReloadOutlined,
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  ExportOutlined,
  FileTextOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useLanguage } from '../../contexts/LanguageContext'
import { adminAPI } from '../../services/api'
import { getCookie } from '../../utils/cookies'

const { RangePicker } = DatePicker

const AdminReports = () => {
  const { t, language } = useLanguage()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState(null)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSessions: 0,
    totalClients: 0,
    averageRating: 0
  })

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = {}
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD')
        params.endDate = dateRange[1].format('YYYY-MM-DD')
      }

      const response = await adminAPI.getReports(params)
      setReports(response.reports || [])
      
      // Calculate stats
      const totalRevenue = response.reports?.reduce((sum, r) => sum + (r.revenue || 0), 0) || 0
      const totalSessions = response.reports?.length || 0
      setStats({
        totalRevenue,
        totalSessions,
        totalClients: response.stats?.totalClients || 0,
        averageRating: response.stats?.averageRating || 0
      })
    } catch (err) {
      console.error('Error fetching reports:', err)
      message.error(language === 'ar' ? 'فشل تحميل التقارير' : 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      const params = {}
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD')
        params.endDate = dateRange[1].format('YYYY-MM-DD')
      }
      const url = adminAPI.exportReportsPDF(params)
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
      })
      const data = await response.json()
      
      // For now, show the data in a modal or download as JSON
      // In production, use a PDF library to generate actual PDF
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `reports-${dayjs().format('YYYY-MM-DD')}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      message.success(language === 'ar' ? 'تم تصدير البيانات بنجاح' : 'Data exported successfully')
    } catch (err) {
      message.error(language === 'ar' ? 'فشل تصدير PDF' : 'Failed to export PDF')
    }
  }

  const handleExportCSV = async () => {
    try {
      const params = {}
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD')
        params.endDate = dateRange[1].format('YYYY-MM-DD')
      }
      const token = localStorage.getItem('accessToken') || getCookie('accessToken') || ''
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/reports/export/csv?${new URLSearchParams(params).toString()}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to download CSV')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `reports-${dayjs().format('YYYY-MM-DD')}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      message.success(language === 'ar' ? 'تم تصدير ملف CSV بنجاح' : 'CSV exported successfully')
    } catch (err) {
      console.error('Export CSV error:', err)
      message.error(language === 'ar' ? 'فشل تصدير CSV' : 'Failed to export CSV')
    }
  }

  // Mock chart data - replace with real data
  const revenueData = [
    { month: language === 'ar' ? 'يناير' : 'Jan', revenue: 50000 },
    { month: language === 'ar' ? 'فبراير' : 'Feb', revenue: 75000 },
    { month: language === 'ar' ? 'مارس' : 'Mar', revenue: 60000 },
    { month: language === 'ar' ? 'أبريل' : 'Apr', revenue: 90000 },
    { month: language === 'ar' ? 'مايو' : 'May', revenue: stats.totalRevenue || 85000 },
  ]

  const columns = [
    {
      title: language === 'ar' ? 'التاريخ' : 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: language === 'ar' ? 'الإيرادات' : 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => `${revenue} ${language === 'ar' ? 'ريال' : 'SAR'}`,
      sorter: (a, b) => a.revenue - b.revenue,
    },
    {
      title: language === 'ar' ? 'عدد الجلسات' : 'Sessions',
      dataIndex: 'sessions',
      key: 'sessions',
      sorter: (a, b) => a.sessions - b.sessions,
    },
    {
      title: language === 'ar' ? 'عدد العملاء' : 'Clients',
      dataIndex: 'clients',
      key: 'clients',
      sorter: (a, b) => a.clients - b.clients,
    },
    {
      title: language === 'ar' ? 'الإجراءات' : 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
        >
          {language === 'ar' ? 'عرض' : 'View'}
        </Button>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-olive-green-600 to-turquoise-500 bg-clip-text text-transparent mb-2">
              {language === 'ar' ? 'التقارير' : 'Reports'}
            </h1>
            <p className="text-gray-500">
              {language === 'ar' ? 'تقارير مفصلة عن أداء المنصة' : 'Detailed reports on platform performance'}
            </p>
          </div>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              size="large"
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchReports}
              loading={loading}
            >
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </Button>
            <Button
              icon={<FileTextOutlined />}
              onClick={handleExportPDF}
            >
              {language === 'ar' ? 'تصدير PDF' : 'Export PDF'}
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExportCSV}
            >
              {language === 'ar' ? 'تصدير CSV' : 'Export CSV'}
            </Button>
          </Space>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title={language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
                value={stats.totalRevenue}
                prefix={<DollarOutlined className="text-olive-green-600" />}
                suffix="SAR"
                valueStyle={{ color: '#7a8c66' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title={language === 'ar' ? 'إجمالي الجلسات' : 'Total Sessions'}
                value={stats.totalSessions}
                prefix={<CalendarOutlined className="text-blue-600" />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title={language === 'ar' ? 'إجمالي العملاء' : 'Total Clients'}
                value={stats.totalClients}
                prefix={<UserOutlined className="text-green-600" />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title={language === 'ar' ? 'متوسط التقييم' : 'Average Rating'}
                value={stats.averageRating}
                precision={1}
                suffix="/ 5"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={16}>
            <Card 
              title={language === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
              className="shadow-lg rounded-xl border-0"
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7a8c66" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#7a8c66" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#7a8c66" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card 
              title={language === 'ar' ? 'نظرة عامة' : 'Overview'}
              className="shadow-lg rounded-xl border-0"
            >
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'الإيرادات' : 'Revenue'}</div>
                  <div className="text-2xl font-bold text-olive-green-600">{stats.totalRevenue} SAR</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'الجلسات' : 'Sessions'}</div>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">{language === 'ar' ? 'العملاء' : 'Clients'}</div>
                  <div className="text-2xl font-bold text-green-600">{stats.totalClients}</div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Reports Table */}
      <Card className="shadow-lg rounded-xl border-0">
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => (language === 'ar' ? `إجمالي ${total} تقرير` : `Total ${total} reports`),
          }}
        />
      </Card>
    </div>
  )
}

export default AdminReports

