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
  Rate
} from 'antd'
import {
  ArrowLeftOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  WalletOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  StopOutlined,
  StarOutlined,
  CheckCircleFilled
} from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { adminAPI } from '../../services/api'
import dayjs from 'dayjs'

const { TextArea } = Input

const ConsultantDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [consultantData, setConsultantData] = useState(null)
  const [bookings, setBookings] = useState([])
  const [earnings, setEarnings] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [modalVisible, setModalVisible] = useState({ profit: false, deduction: false, suspend: false })
  const [form] = Form.useForm()

  useEffect(() => {
    fetchConsultantDetails()
  }, [id])

  const fetchConsultantDetails = async () => {
    try {
      setLoading(true)
      const [consultantRes, bookingsRes, earningsRes, withdrawalsRes] = await Promise.all([
        adminAPI.getConsultantById(id),
        adminAPI.getConsultantBookings(id),
        adminAPI.getConsultantEarnings(id),
        adminAPI.getConsultantWithdrawals(id),
      ])
      
      setConsultantData(consultantRes.consultant)
      setBookings(bookingsRes.bookings || [])
      setEarnings(earningsRes.earnings || [])
      setWithdrawals(withdrawalsRes.withdrawals || [])
    } catch (err) {
      console.error('Error fetching consultant details:', err)
      message.error(err.message || (language === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load data'))
    } finally {
      setLoading(false)
    }
  }

  const handleSendProfit = async (values) => {
    try {
      await adminAPI.sendProfitToConsultant(id, values.amount, values.notes)
      message.success(language === 'ar' ? 'تم إرسال الربح بنجاح' : 'Profit sent successfully')
      setModalVisible({ ...modalVisible, profit: false })
      form.resetFields()
      fetchConsultantDetails()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل إرسال الربح' : 'Failed to send profit'))
    }
  }

  const handleDeduction = async (values) => {
    try {
      await adminAPI.deductFromConsultant(id, values.amount, values.reason)
      message.success(language === 'ar' ? 'تم خصم المبلغ بنجاح' : 'Amount deducted successfully')
      setModalVisible({ ...modalVisible, deduction: false })
      form.resetFields()
      fetchConsultantDetails()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل الخصم' : 'Failed to deduct'))
    }
  }

  const handleSuspend = async (values) => {
    try {
      await adminAPI.suspendConsultant(id, values.reason, values.duration)
      message.success(language === 'ar' ? 'تم تعليق الحساب بنجاح' : 'Account suspended successfully')
      setModalVisible({ ...modalVisible, suspend: false })
      form.resetFields()
      fetchConsultantDetails()
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
      title: language === 'ar' ? 'العميل' : 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
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

  const earningsColumns = [
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
      title: language === 'ar' ? 'العمولة' : 'Platform Fee',
      dataIndex: 'platformFee',
      key: 'platformFee',
      render: (fee) => `${fee} SAR`,
    },
    {
      title: language === 'ar' ? 'صافي المبلغ' : 'Net Amount',
      dataIndex: 'netAmount',
      key: 'netAmount',
      render: (amount) => `${amount} SAR`,
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          pending: 'orange',
          available: 'green',
          withdrawn: 'blue',
        }
        return <Tag color={colors[status]}>{status}</Tag>
      },
    },
  ]

  const withdrawalsColumns = [
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
      title: language === 'ar' ? 'اسم البنك' : 'Bank Name',
      dataIndex: 'bankName',
      key: 'bankName',
    },
    {
      title: language === 'ar' ? 'رقم الحساب' : 'Account Number',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          PENDING: 'orange',
          APPROVED: 'green',
          REJECTED: 'red',
          COMPLETED: 'blue',
        }
        return <Tag color={colors[status]}>{status}</Tag>
      },
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  if (!consultantData) {
    return (
      <Alert
        message={language === 'ar' ? 'المستشار غير موجود' : 'Consultant not found'}
        type="error"
        action={
          <Button onClick={() => navigate('/admin/consultants')}>
            {language === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
        }
      />
    )
  }

  const totalEarnings = earnings.reduce((sum, e) => sum + (parseFloat(e.netAmount) || 0), 0)
  const availableEarnings = earnings.filter(e => e.status === 'available').reduce((sum, e) => sum + (parseFloat(e.netAmount) || 0), 0)

  const tabItems = [
    {
      key: 'overview',
      label: language === 'ar' ? 'نظرة عامة' : 'Overview',
      children: (
        <Card>
          <Descriptions title={language === 'ar' ? 'معلومات المستشار' : 'Consultant Information'} column={2}>
            <Descriptions.Item label={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}>
              {consultantData.firstName} {consultantData.lastName}
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}>
              {consultantData.user?.email}
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'الدرجة العلمية' : 'Academic Degree'}>
              {consultantData.academicDegree}
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'التخصص' : 'Specialization'}>
              {consultantData.specialization}
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'سعر الجلسة' : 'Price Per Session'}>
              {consultantData.pricePerSession} SAR
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'التقييم' : 'Rating'}>
              <Rate disabled value={consultantData.rating || 0} allowHalf />
              <span className="ml-2">({consultantData.totalRatings || 0} {language === 'ar' ? 'تقييم' : 'ratings'})</span>
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'الحالة' : 'Status'}>
              <Space>
                <Tag color={consultantData.user?.isActive ? 'green' : 'red'}>
                  {consultantData.user?.isActive 
                    ? (language === 'ar' ? 'نشط' : 'Active')
                    : (language === 'ar' ? 'معلق' : 'Suspended')
                  }
                </Tag>
                {consultantData.isVerified && (
                  <Tag color="blue" icon={<CheckCircleFilled />}>
                    {language === 'ar' ? 'موثق' : 'Verified'}
                  </Tag>
                )}
                <Tag color={consultantData.isAvailable ? 'green' : 'orange'}>
                  {consultantData.isAvailable 
                    ? (language === 'ar' ? 'متاح' : 'Available')
                    : (language === 'ar' ? 'غير متاح' : 'Unavailable')
                  }
                </Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings'}>
              {consultantData.totalEarnings || 0} SAR
            </Descriptions.Item>
          </Descriptions>
          {consultantData.bio && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">{language === 'ar' ? 'السيرة الذاتية' : 'Bio'}</h3>
              <p className="text-gray-600">{consultantData.bio}</p>
            </div>
          )}
        </Card>
      ),
    },
    {
      key: 'bookings',
      label: language === 'ar' ? 'الحجوزات' : 'Bookings',
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
      key: 'earnings',
      label: language === 'ar' ? 'الأرباح' : 'Earnings',
      children: (
        <Table
          columns={earningsColumns}
          dataSource={earnings}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'withdrawals',
      label: language === 'ar' ? 'السحوبات' : 'Withdrawals',
      children: (
        <Table
          columns={withdrawalsColumns}
          dataSource={withdrawals}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
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
              onClick={() => navigate('/admin/consultants')}
            >
              {language === 'ar' ? 'العودة' : 'Back'}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {consultantData.firstName} {consultantData.lastName}
              </h1>
              <p className="text-gray-500">{consultantData.user?.email}</p>
            </div>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={() => setModalVisible({ ...modalVisible, profit: true })}
            >
              {language === 'ar' ? 'إرسال ربح' : 'Send Profit'}
            </Button>
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
                title={language === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings'}
                value={totalEarnings}
                prefix={<DollarOutlined />}
                suffix="SAR"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={language === 'ar' ? 'الأرباح المتاحة' : 'Available Earnings'}
                value={availableEarnings}
                prefix={<WalletOutlined />}
                suffix="SAR"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={language === 'ar' ? 'التقييم' : 'Rating'}
                value={consultantData.rating || 0}
                prefix={<StarOutlined />}
                suffix="/ 5"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Card>
          <Tabs items={tabItems} />
        </Card>

        {/* Modals */}
        <Modal
          title={language === 'ar' ? 'إرسال ربح للمستشار' : 'Send Profit to Consultant'}
          open={modalVisible.profit}
          onCancel={() => {
            setModalVisible({ ...modalVisible, profit: false })
            form.resetFields()
          }}
          footer={null}
        >
          <Form form={form} onFinish={handleSendProfit} layout="vertical">
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
              name="notes"
              label={language === 'ar' ? 'ملاحظات' : 'Notes'}
            >
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {language === 'ar' ? 'إرسال' : 'Send'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={language === 'ar' ? 'خصم من المستشار' : 'Deduct from Consultant'}
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
          title={language === 'ar' ? 'تعليق حساب المستشار' : 'Suspend Consultant Account'}
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

export default ConsultantDetailPage

