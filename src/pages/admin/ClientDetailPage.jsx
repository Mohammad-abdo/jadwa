import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Card, 
  Descriptions, 
  Table, 
  Tag, 
  Button, 
  Tabs, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  message, 
  Spin, 
  Alert,
  Space,
  Statistic,
  Row,
  Col,
  Divider,
  Timeline,
  Tooltip
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MessageOutlined,
  UserOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WalletOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  StopOutlined
} from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { adminAPI } from '../../services/api'
import dayjs from 'dayjs'

const { TextArea } = Input

const ClientDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [clientData, setClientData] = useState(null)
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState([])
  const [reports, setReports] = useState([])
  const [modalVisible, setModalVisible] = useState({ deduction: false, suspend: false })
  const [form] = Form.useForm()

  useEffect(() => {
    fetchClientDetails()
  }, [id])

  const fetchClientDetails = async () => {
    try {
      setLoading(true)
      const [clientRes, bookingsRes, paymentsRes, reportsRes] = await Promise.all([
        adminAPI.getClientById(id),
        adminAPI.getClientBookings(id),
        adminAPI.getClientPayments(id),
        adminAPI.getClientReports(id),
      ])
      
      setClientData(clientRes.client)
      setBookings(bookingsRes.bookings || [])
      setPayments(paymentsRes.payments || [])
      setReports(reportsRes.reports || [])
    } catch (err) {
      console.error('Error fetching client details:', err)
      message.error(err.message || (language === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load data'))
    } finally {
      setLoading(false)
    }
  }

  // Removed handleSendProfit - Admin can only send profits to consultants, not clients

  const handleDeduction = async (values) => {
    try {
      await adminAPI.deductFromClient(id, values.amount, values.reason)
      message.success(language === 'ar' ? 'تم خصم المبلغ بنجاح' : 'Amount deducted successfully')
      setModalVisible({ ...modalVisible, deduction: false })
      form.resetFields()
      fetchClientDetails()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل الخصم' : 'Failed to deduct'))
    }
  }

  const handleSuspend = async (values) => {
    try {
      await adminAPI.suspendClient(id, values.reason, values.duration)
      message.success(language === 'ar' ? 'تم تعليق الحساب بنجاح' : 'Account suspended successfully')
      setModalVisible({ ...modalVisible, suspend: false })
      form.resetFields()
      fetchClientDetails()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل تعليق الحساب' : 'Failed to suspend account'))
    }
  }

  const bookingsColumns = [
    {
      title: language === 'ar' ? 'التاريخ' : 'Date',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
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
        const colors = {
          PENDING: 'orange',
          CONFIRMED: 'blue',
          COMPLETED: 'green',
          CANCELLED: 'red',
        }
        return <Tag color={colors[status]}>{status}</Tag>
      },
    },
    {
      title: language === 'ar' ? 'السعر' : 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price} SAR`,
    },
  ]

  const paymentsColumns = [
    {
      title: language === 'ar' ? 'التاريخ' : 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: language === 'ar' ? 'المبلغ' : 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount} SAR`,
    },
    {
      title: language === 'ar' ? 'الطريقة' : 'Method',
      dataIndex: 'method',
      key: 'method',
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          PENDING: 'orange',
          COMPLETED: 'green',
          FAILED: 'red',
          REFUNDED: 'blue',
        }
        return <Tag color={colors[status]}>{status}</Tag>
      },
    },
    {
      title: language === 'ar' ? 'رقم المعاملة' : 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  if (!clientData) {
    return (
      <Alert
        message={language === 'ar' ? 'العميل غير موجود' : 'Client not found'}
        type="error"
        action={
          <Button onClick={() => navigate('/admin/clients')}>
            {language === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
        }
      />
    )
  }

  const tabItems = [
    {
      key: 'overview',
      label: language === 'ar' ? 'نظرة عامة' : 'Overview',
      icon: <UserOutlined />,
      children: (
        <Card>
          <Descriptions title={language === 'ar' ? 'معلومات العميل' : 'Client Information'} column={2}>
            <Descriptions.Item label={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}>
              {clientData.firstName} {clientData.lastName}
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}>
              {clientData.user?.email}
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'رقم الهاتف' : 'Phone'}>
              {clientData.user?.phone || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'المدينة' : 'City'}>
              {clientData.city || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'القطاع' : 'Sector'}>
              {clientData.sector || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'اسم الشركة' : 'Company Name'}>
              {clientData.companyName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'الحالة' : 'Status'}>
              <Tag color={clientData.user?.isActive ? 'green' : 'red'}>
                {clientData.user?.isActive 
                  ? (language === 'ar' ? 'نشط' : 'Active')
                  : (language === 'ar' ? 'معلق' : 'Suspended')
                }
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'تاريخ التسجيل' : 'Registration Date'}>
              {dayjs(clientData.createdAt).format('YYYY-MM-DD')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    {
      key: 'bookings',
      label: language === 'ar' ? 'الحجوزات' : 'Bookings',
      icon: <CalendarOutlined />,
      children: (
        <Table
          columns={bookingsColumns}
          dataSource={bookings}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'payments',
      label: language === 'ar' ? 'المدفوعات' : 'Payments',
      icon: <DollarOutlined />,
      children: (
        <Table
          columns={paymentsColumns}
          dataSource={payments}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'reports',
      label: language === 'ar' ? 'التقارير' : 'Reports',
      icon: <FileTextOutlined />,
      children: (
        <div>
          {reports.map(report => (
            <Card key={report.id} className="mb-4">
              <h3>{report.title}</h3>
              <p className="text-gray-600">{report.summary}</p>
              <Tag>{report.status}</Tag>
            </Card>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/clients')}
            >
              {language === 'ar' ? 'العودة' : 'Back'}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {clientData.firstName} {clientData.lastName}
              </h1>
              <p className="text-gray-500">{clientData.user?.email}</p>
            </div>
          </div>
          <Space>
            {/* Admin can only send profits to consultants, not clients */}
            <Button
              icon={<MinusCircleOutlined />}
              onClick={() => setModalVisible({ ...modalVisible, deduction: true })}
            >
              {language === 'ar' ? 'خصم' : 'Deduction'}
            </Button>
            <Button
              danger
              icon={<StopOutlined />}
              onClick={() => setModalVisible({ ...modalVisible, suspend: true })}
            >
              {language === 'ar' ? 'تعليق الحساب' : 'Suspend Account'}
            </Button>
          </Space>
        </div>

        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title={language === 'ar' ? 'إجمالي الحجوزات' : 'Total Bookings'}
                value={bookings.length}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={language === 'ar' ? 'إجمالي المدفوعات' : 'Total Payments'}
                value={payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)}
                prefix={<DollarOutlined />}
                suffix="SAR"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={language === 'ar' ? 'التقارير' : 'Reports'}
                value={reports.length}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={language === 'ar' ? 'الحالة' : 'Status'}
                value={clientData.user?.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معلق' : 'Suspended')}
                valueStyle={{ color: clientData.user?.isActive ? '#52c41a' : '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Card>
          <Tabs items={tabItems} />
        </Card>

        {/* Modals */}
        {/* Removed Send Profit modal - Admin can only send profits to consultants, not clients */}
        <Modal
          title={language === 'ar' ? 'خصم من العميل' : 'Deduct from Client'}
          open={modalVisible.deduction}
          onCancel={() => {
            setModalVisible({ ...modalVisible, deduction: false })
            form.resetFields()
          }}
          footer={null}
        >
          <Form form={form} onFinish={handleDeduction} layout="vertical">
            <Form.Item
              name="amount"
              label={language === 'ar' ? 'المبلغ' : 'Amount'}
              rules={[{ required: true, type: 'number', min: 0.01 }]}
            >
              <InputNumber
                prefix="SAR"
                style={{ width: '100%' }}
                min={0.01}
                step={0.01}
              />
            </Form.Item>
            <Form.Item
              name="reason"
              label={language === 'ar' ? 'السبب' : 'Reason'}
              rules={[{ required: true }]}
            >
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" danger block>
                {language === 'ar' ? 'خصم' : 'Deduct'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={language === 'ar' ? 'تعليق حساب العميل' : 'Suspend Client Account'}
          open={modalVisible.suspend}
          onCancel={() => {
            setModalVisible({ ...modalVisible, suspend: false })
            form.resetFields()
          }}
          footer={null}
        >
          <Form form={form} onFinish={handleSuspend} layout="vertical">
            <Form.Item
              name="reason"
              label={language === 'ar' ? 'السبب' : 'Reason'}
              rules={[{ required: true }]}
            >
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="duration"
              label={language === 'ar' ? 'المدة (أيام)' : 'Duration (days)'}
              rules={[{ required: true, type: 'number', min: 1 }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                placeholder={language === 'ar' ? '0 = دائم' : '0 = Permanent'}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" danger block>
                {language === 'ar' ? 'تعليق' : 'Suspend'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  )
}

export default ClientDetailPage

