import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Rate, Space, message, Spin } from 'antd'
import { FileTextOutlined, EyeOutlined, MessageOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { bookingsAPI, sessionsAPI } from '../../services/api'
import dayjs from 'dayjs'

const ClientConsultations = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      const response = await bookingsAPI.getBookings()
      const formattedConsultations = response.bookings.map(booking => ({
        id: booking.id,
        bookingId: booking.id,
        consultant: booking.consultant 
          ? `${booking.consultant.firstName} ${booking.consultant.lastName}`
          : language === 'ar' ? 'غير متوفر' : 'N/A',
        type: booking.service 
          ? (language === 'ar' ? booking.service.titleAr : booking.service.title)
          : language === 'ar' ? 'غير محدد' : 'Not specified',
        date: booking.scheduledAt 
          ? dayjs(booking.scheduledAt).format('YYYY-MM-DD')
          : '-',
        status: booking.status?.toLowerCase() || 'pending',
        rating: booking.rating || null,
        session: booking.session,
      }))
      setConsultations(formattedConsultations)
    } catch (err) {
      console.error('Error fetching consultations:', err)
      message.error(language === 'ar' ? 'فشل تحميل الاستشارات' : 'Failed to load consultations')
    } finally {
      setLoading(false)
    }
  }

  const handleStartSession = async (bookingId) => {
    try {
      const videoRoomResponse = await sessionsAPI.generateVideoRoom(bookingId)
      await sessionsAPI.startSession(bookingId, videoRoomResponse.room?.roomId)
      message.success(language === 'ar' ? 'تم بدء الجلسة بنجاح' : 'Session started successfully')
      fetchConsultations()
      navigate(`/client/chat/${bookingId}`)
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل بدء الجلسة' : 'Failed to start session'))
    }
  }

  const columns = [
    {
      title: language === 'ar' ? 'المستشار' : 'Consultant',
      dataIndex: 'consultant',
      key: 'consultant',
    },
    {
      title: language === 'ar' ? 'النوع' : 'Type',
      dataIndex: 'type',
      key: 'type',
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
          completed: 'green',
          pending: 'orange',
          cancelled: 'red',
          confirmed: 'blue',
          in_progress: 'green',
        }
        const labels = {
          completed: language === 'ar' ? 'مكتمل' : 'Completed',
          pending: language === 'ar' ? 'قيد الانتظار' : 'Pending',
          cancelled: language === 'ar' ? 'ملغي' : 'Cancelled',
          confirmed: language === 'ar' ? 'مؤكد' : 'Confirmed',
          in_progress: language === 'ar' ? 'قيد التنفيذ' : 'In Progress',
        }
        return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>
      },
    },
    {
      title: language === 'ar' ? 'التقييم' : 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (rating ? <Rate disabled defaultValue={rating} /> : '-'),
    },
    {
      title: language === 'ar' ? 'الإجراءات' : 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {(record.status === 'confirmed' || record.status === 'pending') && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
              onClick={() => handleStartSession(record.bookingId)}
            >
              {language === 'ar' ? 'بدء الجلسة' : 'Start Session'}
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button
              icon={<MessageOutlined />}
              onClick={() => navigate(`/client/chat/${record.bookingId}`)}
            >
              {language === 'ar' ? 'فتح المحادثة' : 'Open Chat'}
            </Button>
          )}
          <Button
            type="link"
            icon={<FileTextOutlined />}
            onClick={() => navigate(`/client/reports?bookingId=${record.bookingId}`)}
          >
            {language === 'ar' ? 'عرض التقرير' : 'View Report'}
          </Button>
          {record.status === 'completed' && !record.rating && (
            <Button
              type="link"
              onClick={() => console.log('Rate', record.id)}
            >
              {language === 'ar' ? 'تقييم' : 'Rate'}
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {language === 'ar' ? 'استشاراتي' : 'My Consultations'}
      </h1>
      <Card>
        <Table
          columns={columns}
          dataSource={consultations}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}

export default ClientConsultations

