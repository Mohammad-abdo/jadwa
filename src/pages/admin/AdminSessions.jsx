import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, Select, DatePicker, Input, message, Alert, Modal, Form } from 'antd'
import { EyeOutlined, ReloadOutlined, SearchOutlined, EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useLanguage } from '../../contexts/LanguageContext'
import { adminAPI } from '../../services/api'

const AdminSessions = () => {
  const { t, language } = useLanguage()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await adminAPI.getBookings(params)
      const formattedBookings = response.bookings.map(booking => ({
        id: booking.id,
        client: booking.client 
          ? `${booking.client.firstName} ${booking.client.lastName}`
          : (language === 'ar' ? 'غير متوفر' : 'N/A'),
        consultant: booking.consultant
          ? `${booking.consultant.firstName} ${booking.consultant.lastName}`
          : (language === 'ar' ? 'غير متوفر' : 'N/A'),
        type: booking.service 
          ? (language === 'ar' ? booking.service.titleAr : booking.service.title)
          : booking.bookingType || (language === 'ar' ? 'غير محدد' : 'Not specified'),
        date: booking.scheduledAt 
          ? dayjs(booking.scheduledAt).format('YYYY-MM-DD HH:mm')
          : (language === 'ar' ? 'غير محدد' : 'Not scheduled'),
        status: booking.status,
        price: booking.price,
        duration: booking.duration,
        notes: booking.notes,
        rating: booking.rating,
        paymentStatus: booking.paymentStatus,
        fullData: booking,
      }))
      setBookings(formattedBookings)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError(err.message || 'Failed to load bookings')
      message.error(language === 'ar' ? 'فشل تحميل الجلسات' : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'orange',
      CONFIRMED: 'blue',
      COMPLETED: 'green',
      CANCELLED: 'red',
      IN_PROGRESS: 'purple',
    }
    return colors[status] || 'default'
  }

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: language === 'ar' ? 'قيد الانتظار' : 'Pending',
      CONFIRMED: language === 'ar' ? 'مؤكدة' : 'Confirmed',
      COMPLETED: language === 'ar' ? 'مكتملة' : 'Completed',
      CANCELLED: language === 'ar' ? 'ملغية' : 'Cancelled',
      IN_PROGRESS: language === 'ar' ? 'قيد التنفيذ' : 'In Progress',
    }
    return labels[status] || status
  }

  const handleUpdateBooking = async (values) => {
    try {
      const updateData = {
        ...values,
        scheduledAt: values.scheduledAt ? values.scheduledAt.toISOString() : null,
      }
      
      if (selectedBooking) {
        await adminAPI.updateBooking(selectedBooking.id, updateData)
        message.success(language === 'ar' ? 'تم تحديث الجلسة بنجاح' : 'Session updated successfully')
      } else {
        await adminAPI.createBooking(updateData)
        message.success(language === 'ar' ? 'تم إنشاء الجلسة بنجاح' : 'Session created successfully')
      }
      setEditModalVisible(false)
      setSelectedBooking(null)
      form.resetFields()
      fetchBookings()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حفظ الجلسة' : 'Failed to save session'))
    }
  }

  const handleDeleteBooking = async (id) => {
    try {
      await adminAPI.deleteBooking(id)
      message.success(language === 'ar' ? 'تم حذف الجلسة بنجاح' : 'Session deleted successfully')
      fetchBookings()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حذف الجلسة' : 'Failed to delete session'))
    }
  }

  const columns = [
    {
      title: language === 'ar' ? 'العميل' : 'Client',
      dataIndex: 'client',
      key: 'client',
      sorter: (a, b) => a.client.localeCompare(b.client),
    },
    {
      title: language === 'ar' ? 'المستشار' : 'Consultant',
      dataIndex: 'consultant',
      key: 'consultant',
      sorter: (a, b) => a.consultant.localeCompare(b.consultant),
    },
    {
      title: language === 'ar' ? 'النوع' : 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: language === 'ar' ? 'التاريخ والوقت' : 'Date & Time',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: language === 'ar' ? 'المبلغ' : 'Amount',
      dataIndex: 'price',
      key: 'price',
      render: (price) => price ? `${price} ${language === 'ar' ? 'ريال' : 'SAR'}` : '-',
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
      filters: [
        { text: language === 'ar' ? 'قيد الانتظار' : 'Pending', value: 'PENDING' },
        { text: language === 'ar' ? 'مؤكدة' : 'Confirmed', value: 'CONFIRMED' },
        { text: language === 'ar' ? 'مكتملة' : 'Completed', value: 'COMPLETED' },
        { text: language === 'ar' ? 'ملغية' : 'Cancelled', value: 'CANCELLED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: language === 'ar' ? 'الإجراءات' : 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedBooking(record)
              setDetailModalVisible(true)
            }}
          >
            {language === 'ar' ? 'عرض' : 'View'}
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedBooking(record)
              form.setFieldsValue({
                status: record.status,
                scheduledAt: record.date ? dayjs(record.date) : null,
                price: record.price,
                duration: record.duration,
                consultantNotes: record.notes,
              })
              setEditModalVisible(true)
            }}
          >
            {language === 'ar' ? 'تعديل' : 'Edit'}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الجلسة؟' : 'Are you sure you want to delete this session?')) {
                handleDeleteBooking(record.id)
              }
            }}
          >
            {language === 'ar' ? 'حذف' : 'Delete'}
          </Button>
        </Space>
      ),
    },
  ]

  if (error && !loading) {
    return (
      <Alert
        message={language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error Loading Data'}
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={fetchBookings}>
            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        }
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-olive-green-600 to-turquoise-500 bg-clip-text text-transparent mb-2">
            {language === 'ar' ? 'الجلسات' : 'Sessions'}
          </h1>
          <p className="text-gray-500">
            {language === 'ar' ? 'إدارة جميع الجلسات والحجوزات' : 'Manage all sessions and bookings'}
          </p>
        </div>
        <Space>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder={language === 'ar' ? 'الحالة' : 'Status'}
            style={{ width: 150 }}
          >
            <Select.Option value="all">{language === 'ar' ? 'الكل' : 'All'}</Select.Option>
            <Select.Option value="PENDING">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</Select.Option>
            <Select.Option value="CONFIRMED">{language === 'ar' ? 'مؤكدة' : 'Confirmed'}</Select.Option>
            <Select.Option value="COMPLETED">{language === 'ar' ? 'مكتملة' : 'Completed'}</Select.Option>
            <Select.Option value="CANCELLED">{language === 'ar' ? 'ملغية' : 'Cancelled'}</Select.Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchBookings}
            loading={loading}
          >
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
            onClick={() => {
              setSelectedBooking(null)
              form.resetFields()
              setEditModalVisible(true)
            }}
          >
            {language === 'ar' ? 'إضافة جلسة' : 'Add Session'}
          </Button>
        </Space>
      </div>
      <Card className="shadow-lg rounded-xl border-0">
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => (language === 'ar' ? `إجمالي ${total} جلسة` : `Total ${total} sessions`)
          }}
        />
      </Card>

      <Modal
        title={language === 'ar' ? 'تفاصيل الجلسة' : 'Session Details'}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setSelectedBooking(null)
        }}
        maskClosable={true}
        keyboard={true}
        footer={null}
        width={700}
        destroyOnHidden={true}
        className="modern-modal"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>{language === 'ar' ? 'العميل:' : 'Client:'}</strong> {selectedBooking.client}
              </div>
              <div>
                <strong>{language === 'ar' ? 'المستشار:' : 'Consultant:'}</strong> {selectedBooking.consultant}
              </div>
              <div>
                <strong>{language === 'ar' ? 'النوع:' : 'Type:'}</strong> {selectedBooking.type}
              </div>
              <div>
                <strong>{language === 'ar' ? 'التاريخ:' : 'Date:'}</strong> {selectedBooking.date}
              </div>
              <div>
                <strong>{language === 'ar' ? 'المبلغ:' : 'Amount:'}</strong> {selectedBooking.price ? `${selectedBooking.price} ${language === 'ar' ? 'ريال' : 'SAR'}` : '-'}
              </div>
              <div>
                <strong>{language === 'ar' ? 'المدة:' : 'Duration:'}</strong> {selectedBooking.duration ? `${selectedBooking.duration} ${language === 'ar' ? 'دقيقة' : 'minutes'}` : '-'}
              </div>
              <div>
                <strong>{language === 'ar' ? 'الحالة:' : 'Status:'}</strong>
                <Tag color={getStatusColor(selectedBooking.status)} className="ml-2">
                  {getStatusLabel(selectedBooking.status)}
                </Tag>
              </div>
              {selectedBooking.rating && (
                <div>
                  <strong>{language === 'ar' ? 'التقييم:' : 'Rating:'}</strong> {selectedBooking.rating}/5
                </div>
              )}
            </div>
            {selectedBooking.notes && (
              <div>
                <strong>{language === 'ar' ? 'ملاحظات:' : 'Notes:'}</strong>
                <p className="mt-2 text-gray-600">{selectedBooking.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={selectedBooking ? (language === 'ar' ? 'تعديل الجلسة' : 'Edit Session') : (language === 'ar' ? 'إضافة جلسة جديدة' : 'Add New Session')}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          setSelectedBooking(null)
          form.resetFields()
        }}
        maskClosable={true}
        keyboard={true}
        footer={null}
        width={700}
        destroyOnHidden={true}
        className="modern-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateBooking}
          initialValues={selectedBooking ? {
            status: selectedBooking.status,
            scheduledAt: selectedBooking.date ? dayjs(selectedBooking.date) : null,
            price: selectedBooking.price,
            duration: selectedBooking.duration,
            consultantNotes: selectedBooking.notes,
          } : {
            status: 'PENDING',
          }}
        >
            {!selectedBooking && (
              <>
                <Form.Item
                  name="clientId"
                  label={language === 'ar' ? 'العميل' : 'Client'}
                  rules={[{ required: true }]}
                >
                  <Input placeholder={language === 'ar' ? 'معرف العميل' : 'Client ID'} />
                </Form.Item>
                <Form.Item
                  name="consultantId"
                  label={language === 'ar' ? 'المستشار' : 'Consultant'}
                  rules={[{ required: true }]}
                >
                  <Input placeholder={language === 'ar' ? 'معرف المستشار' : 'Consultant ID'} />
                </Form.Item>
                <Form.Item
                  name="serviceId"
                  label={language === 'ar' ? 'الخدمة' : 'Service'}
                >
                  <Input placeholder={language === 'ar' ? 'معرف الخدمة' : 'Service ID'} />
                </Form.Item>
              </>
            )}
            <Form.Item
              name="status"
              label={language === 'ar' ? 'الحالة' : 'Status'}
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="PENDING">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</Select.Option>
                <Select.Option value="CONFIRMED">{language === 'ar' ? 'مؤكدة' : 'Confirmed'}</Select.Option>
                <Select.Option value="COMPLETED">{language === 'ar' ? 'مكتملة' : 'Completed'}</Select.Option>
                <Select.Option value="CANCELLED">{language === 'ar' ? 'ملغية' : 'Cancelled'}</Select.Option>
                <Select.Option value="IN_PROGRESS">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="scheduledAt"
              label={language === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full" />
            </Form.Item>
            <Form.Item
              name="price"
              label={language === 'ar' ? 'السعر' : 'Price'}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              name="duration"
              label={language === 'ar' ? 'المدة (بالدقائق)' : 'Duration (minutes)'}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              name="consultantNotes"
              label={language === 'ar' ? 'ملاحظات المستشار' : 'Consultant Notes'}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" className="bg-olive-green-600">
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </Button>
                <Button onClick={() => {
                  setEditModalVisible(false)
                  setSelectedBooking(null)
                  form.resetFields()
                }}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}

export default AdminSessions

