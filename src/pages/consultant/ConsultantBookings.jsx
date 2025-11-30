import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, message, Select, DatePicker } from 'antd'
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, MessageOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { bookingsAPI, sessionsAPI } from '../../services/api'
import dayjs from 'dayjs'

const ConsultantBookings = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await bookingsAPI.getBookings(params)
      const formattedBookings = response.bookings.map(booking => ({
        id: booking.id,
        client: booking.client 
          ? `${booking.client.firstName} ${booking.client.lastName}`
          : language === 'ar' ? 'غير متوفر' : 'N/A',
        service: booking.service 
          ? (language === 'ar' ? booking.service.titleAr : booking.service.title)
          : language === 'ar' ? 'غير محدد' : 'Not specified',
        date: booking.scheduledAt 
          ? dayjs(booking.scheduledAt).format('YYYY-MM-DD HH:mm')
          : '-',
        status: booking.status,
        price: booking.price,
        bookingType: booking.bookingType,
      }))
      setBookings(formattedBookings)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      message.error(language === 'ar' ? 'فشل تحميل الحجوزات' : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await bookingsAPI.updateBookingStatus(id, status)
      message.success(language === 'ar' ? 'تم تحديث الحالة بنجاح' : 'Status updated successfully')
      fetchBookings()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل تحديث الحالة' : 'Failed to update status'))
    }
  }

  const handleStartSession = async (bookingId) => {
    try {
      // First generate video room if needed
      const videoRoomResponse = await sessionsAPI.generateVideoRoom(bookingId)
      
      // Then start the session
      await sessionsAPI.startSession(bookingId, videoRoomResponse.room?.roomId)
      
      message.success(language === 'ar' ? 'تم بدء الجلسة بنجاح' : 'Session started successfully')
      fetchBookings()
      
      // Navigate to chat page
      navigate(`/consultant/chat/${bookingId}`)
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل بدء الجلسة' : 'Failed to start session'))
    }
  }

  const columns = [
    {
      title: language === 'ar' ? 'العميل' : 'Client',
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: language === 'ar' ? 'الخدمة' : 'Service',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: language === 'ar' ? 'التاريخ والوقت' : 'Date & Time',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: language === 'ar' ? 'المبلغ' : 'Amount',
      dataIndex: 'price',
      key: 'price',
      render: (price) => price ? `${price} ${language === 'ar' ? 'ريال' : 'SAR'}` : '-',
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          PENDING: 'orange',
          CONFIRMED: 'blue',
          IN_PROGRESS: 'green',
          COMPLETED: 'green',
          CANCELLED: 'red',
        }
        const labels = {
          PENDING: language === 'ar' ? 'قيد الانتظار' : 'Pending',
          CONFIRMED: language === 'ar' ? 'مؤكد' : 'Confirmed',
          IN_PROGRESS: language === 'ar' ? 'قيد التنفيذ' : 'In Progress',
          COMPLETED: language === 'ar' ? 'مكتمل' : 'Completed',
          CANCELLED: language === 'ar' ? 'ملغي' : 'Cancelled',
        }
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>
      },
    },
    {
      title: language === 'ar' ? 'الإجراءات' : 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<MessageOutlined />}
            onClick={() => navigate(`/consultant/chat/${record.id}`)}
          >
            {language === 'ar' ? 'محادثة' : 'Chat'}
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                className="bg-green-600"
                onClick={() => handleStatusUpdate(record.id, 'CONFIRMED')}
              >
                {language === 'ar' ? 'قبول' : 'Accept'}
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleStatusUpdate(record.id, 'CANCELLED')}
              >
                {language === 'ar' ? 'رفض' : 'Reject'}
              </Button>
            </>
          )}
          {record.status === 'CONFIRMED' && (
            <Button
              type="primary"
              className="bg-olive-green-600"
              onClick={() => handleStartSession(record.id)}
            >
              {language === 'ar' ? 'بدء الجلسة' : 'Start Session'}
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="relative min-h-screen pb-8 dashboard-bg">
      {/* Modern Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-br from-olive-green-100/40 to-turquoise-100/40 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-tr from-teal-100/40 to-olive-green-100/40 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 relative z-10">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3">
            {language === 'ar' ? 'الحجوزات' : 'Bookings'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            {language === 'ar' ? 'إدارة جميع حجوزات الاستشارات' : 'Manage all consultation bookings'}
          </p>
        </div>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 200 }}
          size="large"
        >
          <Select.Option value="all">{language === 'ar' ? 'الكل' : 'All'}</Select.Option>
          <Select.Option value="PENDING">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</Select.Option>
          <Select.Option value="CONFIRMED">{language === 'ar' ? 'مؤكد' : 'Confirmed'}</Select.Option>
          <Select.Option value="IN_PROGRESS">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</Select.Option>
          <Select.Option value="COMPLETED">{language === 'ar' ? 'مكتمل' : 'Completed'}</Select.Option>
        </Select>
      </div>

      <Card className="glass-card shadow-professional-xl rounded-2xl border-0 relative z-10">
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => (language === 'ar' ? `إجمالي ${total} حجز` : `Total ${total} bookings`)
          }}
        />
      </Card>
    </div>
  )
}

export default ConsultantBookings

