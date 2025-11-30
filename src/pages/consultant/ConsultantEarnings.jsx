import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Button, Tag, Space, Modal, Form, Input, message, Spin } from 'antd'
import { DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined } from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { consultantAPI } from '../../services/api'

const ConsultantEarnings = () => {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [withdrawalModalVisible, setWithdrawalModalVisible] = useState(false)
  const [earnings, setEarnings] = useState([])
  const [availableBalance, setAvailableBalance] = useState(0)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [pendingEarnings, setPendingEarnings] = useState(0)

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      const response = await consultantAPI.getEarnings()
      setEarnings(response.earnings || [])
      setAvailableBalance(response.availableBalance || 0)
      setTotalEarnings(response.totalEarnings || 0)
      setPendingEarnings(response.pendingEarnings || 0)
    } catch (err) {
      console.error('Error fetching earnings:', err)
      message.error(err.message || (language === 'ar' ? 'فشل تحميل الأرباح' : 'Failed to load earnings'))
    } finally {
      setLoading(false)
    }
  }

  const handleRequestWithdrawal = async (values) => {
    try {
      setLoading(true)
      await consultantAPI.requestWithdrawal({
        amount: values.amount,
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        iban: values.iban,
      })
      message.success(language === 'ar' ? 'تم إرسال طلب السحب بنجاح' : 'Withdrawal request submitted successfully')
      setWithdrawalModalVisible(false)
      form.resetFields()
      fetchEarnings()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل إرسال طلب السحب' : 'Failed to submit withdrawal request'))
    } finally {
      setLoading(false)
    }
  }

  const mockEarnings = [
    {
      id: 1,
      client: language === 'ar' ? 'خالد السعيد' : 'Khaled Al-Saeed',
      amount: 500,
      date: '2025-01-15',
      status: 'paid',
    },
    {
      id: 2,
      client: language === 'ar' ? 'فاطمة أحمد' : 'Fatima Ahmed',
      amount: 600,
      date: '2025-01-14',
      status: 'pending',
    },
    {
      id: 3,
      client: language === 'ar' ? 'محمد حسن' : 'Mohammed Hassan',
      amount: 500,
      date: '2025-01-13',
      status: 'paid',
    },
  ]

  const columns = [
    {
      title: language === 'ar' ? 'العميل' : 'Client',
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: language === 'ar' ? 'المبلغ' : 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount} ${language === 'ar' ? 'ريال' : 'SAR'}`,
    },
    {
      title: language === 'ar' ? 'التاريخ' : 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          paid: 'green',
          pending: 'orange',
        }
        const labels = {
          paid: language === 'ar' ? 'مدفوع' : 'Paid',
          pending: language === 'ar' ? 'قيد الانتظار' : 'Pending',
        }
        return <Tag color={colors[status]}>{labels[status]}</Tag>
      },
    },
  ]

  return (
    <div className="relative min-h-screen pb-8 dashboard-bg">
      {/* Modern Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-br from-olive-green-100/40 to-turquoise-100/40 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-tr from-teal-100/40 to-olive-green-100/40 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Modern Header */}
      <div className="mb-8 relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3">
          {language === 'ar' ? 'الأرباح' : 'Earnings'}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 font-medium">
          {language === 'ar' ? 'عرض تفاصيل أرباحك وإحصائياتك المالية' : 'View your earnings details and financial statistics'}
        </p>
      </div>

      <Row gutter={[16, 16]} className="mb-8 relative z-10">
        <Col xs={24} sm={8}>
          <Card className="modern-kpi-card card-hover shadow-professional-lg border-0">
            <Statistic
              title={language === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings'}
              value={totalEarnings || 0}
              prefix={<DollarOutlined />}
              suffix={language === 'ar' ? 'ريال' : 'SAR'}
              valueStyle={{ color: '#14b8a6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="modern-kpi-card card-hover shadow-professional-lg border-0">
            <Statistic
              title={language === 'ar' ? 'المتاح للسحب' : 'Available for Withdrawal'}
              value={availableBalance || 0}
              prefix={<CheckCircleOutlined />}
              suffix={language === 'ar' ? 'ريال' : 'SAR'}
              valueStyle={{ color: '#7a8c66' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="modern-kpi-card card-hover shadow-professional-lg border-0">
            <Statistic
              title={language === 'ar' ? 'قيد الانتظار' : 'Pending'}
              value={pendingEarnings || 0}
              prefix={<ClockCircleOutlined />}
              suffix={language === 'ar' ? 'ريال' : 'SAR'}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={language === 'ar' ? 'سجل الأرباح' : 'Earnings History'}
        extra={
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => console.log('Export PDF')}
            >
              {language === 'ar' ? 'تصدير PDF' : 'Export PDF'}
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => console.log('Export Excel')}
            >
              {language === 'ar' ? 'تصدير Excel' : 'Export Excel'}
            </Button>
            <Button
              type="primary"
              className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
              onClick={() => setWithdrawalModalVisible(true)}
              disabled={availableBalance <= 0}
            >
              {language === 'ar' ? 'طلب سحب' : 'Request Payout'}
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={earnings}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={language === 'ar' ? 'طلب سحب' : 'Request Withdrawal'}
        open={withdrawalModalVisible}
        onCancel={() => {
          setWithdrawalModalVisible(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRequestWithdrawal}
        >
          <Form.Item
            name="amount"
            label={language === 'ar' ? 'المبلغ' : 'Amount'}
            rules={[
              { required: true, message: language === 'ar' ? 'يرجى إدخال المبلغ' : 'Please enter amount' },
              { 
                validator: (_, value) => {
                  if (value && parseFloat(value) > availableBalance) {
                    return Promise.reject(new Error(language === 'ar' ? `المبلغ المتاح: ${availableBalance} ريال` : `Available balance: ${availableBalance} SAR`))
                  }
                  if (value && parseFloat(value) <= 0) {
                    return Promise.reject(new Error(language === 'ar' ? 'المبلغ يجب أن يكون أكبر من صفر' : 'Amount must be greater than zero'))
                  }
                  return Promise.resolve()
                }
              }
            ]}
          >
            <Input
              type="number"
              prefix={<DollarOutlined />}
              suffix={language === 'ar' ? 'ريال' : 'SAR'}
              placeholder={language === 'ar' ? 'أدخل المبلغ' : 'Enter amount'}
            />
          </Form.Item>
          <Form.Item
            name="bankName"
            label={language === 'ar' ? 'اسم البنك' : 'Bank Name'}
            rules={[{ required: true, message: language === 'ar' ? 'يرجى إدخال اسم البنك' : 'Please enter bank name' }]}
          >
            <Input placeholder={language === 'ar' ? 'اسم البنك' : 'Bank Name'} />
          </Form.Item>
          <Form.Item
            name="accountNumber"
            label={language === 'ar' ? 'رقم الحساب' : 'Account Number'}
            rules={[{ required: true, message: language === 'ar' ? 'يرجى إدخال رقم الحساب' : 'Please enter account number' }]}
          >
            <Input placeholder={language === 'ar' ? 'رقم الحساب' : 'Account Number'} />
          </Form.Item>
          <Form.Item
            name="iban"
            label="IBAN"
            rules={[{ required: true, message: language === 'ar' ? 'يرجى إدخال IBAN' : 'Please enter IBAN' }]}
          >
            <Input placeholder="IBAN" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => {
                setWithdrawalModalVisible(false)
                form.resetFields()
              }}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} className="bg-olive-green-600 hover:bg-olive-green-700 border-0">
                {language === 'ar' ? 'إرسال الطلب' : 'Submit Request'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ConsultantEarnings

