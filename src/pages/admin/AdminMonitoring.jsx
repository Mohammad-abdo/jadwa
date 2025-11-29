import React, { useState, useEffect } from 'react'
import { Card, Table, Tabs, Statistic, Row, Col, Tag, Alert, Button, Select, DatePicker, Spin } from 'antd'
import { ReloadOutlined, SecurityScanOutlined, FileTextOutlined, WarningOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useLanguage } from '../../contexts/LanguageContext'
import { monitoringAPI } from '../../services/api'

const AdminMonitoring = () => {
  const { t, language } = useLanguage()
  const [systemLogs, setSystemLogs] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [securityStats, setSecurityStats] = useState(null)
  const [loading, setLoading] = useState({ logs: false, stats: false })
  const [logLevel, setLogLevel] = useState('all')
  const [logAction, setLogAction] = useState('all')

  useEffect(() => {
    fetchSecurityStats()
    fetchSystemLogs()
    fetchAuditLogs()
  }, [logLevel, logAction])

  const fetchSecurityStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }))
      const response = await monitoringAPI.getSecurityStats()
      setSecurityStats(response)
    } catch (err) {
      console.error('Error fetching security stats:', err)
    } finally {
      setLoading(prev => ({ ...prev, stats: false }))
    }
  }

  const fetchSystemLogs = async () => {
    try {
      setLoading(prev => ({ ...prev, logs: true }))
      const params = {}
      if (logLevel !== 'all') params.level = logLevel
      const response = await monitoringAPI.getSystemLogs(params)
      setSystemLogs(response.logs || [])
    } catch (err) {
      console.error('Error fetching system logs:', err)
    } finally {
      setLoading(prev => ({ ...prev, logs: false }))
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const params = {}
      if (logAction !== 'all') params.action = logAction
      const response = await monitoringAPI.getAuditLogs(params)
      setAuditLogs(response.logs || [])
    } catch (err) {
      console.error('Error fetching audit logs:', err)
    }
  }

  const getLogLevelColor = (level) => {
    const colors = {
      INFO: 'blue',
      WARNING: 'orange',
      ERROR: 'red',
      CRITICAL: 'magenta',
    }
    return colors[level] || 'default'
  }

  const getActionColor = (action) => {
    const colors = {
      CREATE: 'green',
      UPDATE: 'blue',
      DELETE: 'red',
      LOGIN: 'cyan',
      LOGOUT: 'gray',
    }
    return colors[action] || 'default'
  }

  const systemLogColumns = [
    {
      title: language === 'ar' ? 'المستوى' : 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level) => <Tag color={getLogLevelColor(level)}>{level}</Tag>,
    },
    {
      title: language === 'ar' ? 'الرسالة' : 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: language === 'ar' ? 'المستخدم' : 'User',
      dataIndex: ['user', 'email'],
      key: 'user',
      render: (email) => email || '-',
    },
    {
      title: language === 'ar' ? 'التاريخ' : 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
  ]

  const auditLogColumns = [
    {
      title: language === 'ar' ? 'الإجراء' : 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => <Tag color={getActionColor(action)}>{action}</Tag>,
    },
    {
      title: language === 'ar' ? 'النوع' : 'Resource Type',
      dataIndex: 'resourceType',
      key: 'resourceType',
    },
    {
      title: language === 'ar' ? 'المستخدم' : 'User',
      dataIndex: ['user', 'email'],
      key: 'user',
    },
    {
      title: language === 'ar' ? 'الوصف' : 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: language === 'ar' ? 'التاريخ' : 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
  ]

  const tabItems = [
    {
      key: 'security',
      label: language === 'ar' ? 'الأمان' : 'Security',
      icon: <SecurityScanOutlined />,
      children: (
        <div>
          {securityStats && (
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title={language === 'ar' ? 'تسجيلات الدخول' : 'Total Logins'}
                    value={securityStats.stats?.totalLogins || 0}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title={language === 'ar' ? 'فشل تسجيل الدخول' : 'Failed Logins'}
                    value={securityStats.stats?.failedLogins || 0}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title={language === 'ar' ? 'أنشطة مشبوهة' : 'Suspicious Activities'}
                    value={securityStats.stats?.suspiciousActivities || 0}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title={language === 'ar' ? 'المستخدمون النشطون' : 'Active Users'}
                    value={securityStats.stats?.activeUsers || 0}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>
          )}
          {securityStats?.recentAudits && securityStats.recentAudits.length > 0 && (
            <Card title={language === 'ar' ? 'العمليات الأخيرة' : 'Recent Activities'}>
              <Table
                columns={auditLogColumns}
                dataSource={securityStats.recentAudits}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'system-logs',
      label: language === 'ar' ? 'سجلات النظام' : 'System Logs',
      icon: <FileTextOutlined />,
      children: (
        <div>
          <div className="mb-4 flex items-center gap-4">
            <Select
              value={logLevel}
              onChange={setLogLevel}
              style={{ width: 150 }}
            >
              <Select.Option value="all">{language === 'ar' ? 'الكل' : 'All'}</Select.Option>
              <Select.Option value="INFO">INFO</Select.Option>
              <Select.Option value="WARNING">WARNING</Select.Option>
              <Select.Option value="ERROR">ERROR</Select.Option>
              <Select.Option value="CRITICAL">CRITICAL</Select.Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchSystemLogs}
              loading={loading.logs}
            >
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </Button>
          </div>
          <Card>
            <Table
              columns={systemLogColumns}
              dataSource={systemLogs}
              rowKey="id"
              loading={loading.logs}
              pagination={{ pageSize: 20 }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'audit-logs',
      label: language === 'ar' ? 'سجلات التدقيق' : 'Audit Logs',
      icon: <WarningOutlined />,
      children: (
        <div>
          <div className="mb-4 flex items-center gap-4">
            <Select
              value={logAction}
              onChange={setLogAction}
              style={{ width: 150 }}
            >
              <Select.Option value="all">{language === 'ar' ? 'الكل' : 'All'}</Select.Option>
              <Select.Option value="CREATE">CREATE</Select.Option>
              <Select.Option value="UPDATE">UPDATE</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
              <Select.Option value="LOGIN">LOGIN</Select.Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAuditLogs}
            >
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </Button>
          </div>
          <Card>
            <Table
              columns={auditLogColumns}
              dataSource={auditLogs}
              rowKey="id"
              pagination={{ pageSize: 20 }}
            />
          </Card>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-olive-green-600 to-turquoise-500 bg-clip-text text-transparent mb-2">
          {language === 'ar' ? 'المراقبة والأمان' : 'Monitoring & Security'}
        </h1>
        <p className="text-gray-500">
          {language === 'ar' ? 'مراقبة النظام وسجلات الأمان' : 'System monitoring and security logs'}
        </p>
      </div>
      <h1 className="text-3xl font-bold mb-6">
        {language === 'ar' ? 'المراقبة والأمان' : 'Monitoring & Security'}
      </h1>
      <Card className="shadow-lg rounded-xl border-0">
        <Tabs items={tabItems} />
      </Card>
    </div>
  )
}

export default AdminMonitoring

