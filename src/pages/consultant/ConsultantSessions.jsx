import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, Upload, Input, message, Spin, Select, Tabs } from 'antd'
import {
  PlayCircleOutlined,
  UploadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { bookingsAPI, sessionsAPI } from '../../services/api'
import dayjs from 'dayjs'

const { TextArea } = Input

const ConsultantSessions = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [allSessions, setAllSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      // Fetch all bookings and filter on frontend, or fetch without status filter
      const response = await bookingsAPI.getBookings()
      // Filter bookings with status CONFIRMED or COMPLETED
      // Note: IN_PROGRESS is a SessionStatus, not BookingStatus
      const filteredBookings = response.bookings.filter(booking => 
        ['CONFIRMED', 'COMPLETED'].includes(booking.status)
      )
      const formattedSessions = filteredBookings.map(booking => {
        const session = booking.session || {}
        return {
          id: booking.id,
          bookingId: booking.id,
          client: booking.client 
            ? `${booking.client.firstName} ${booking.client.lastName}`
            : language === 'ar' ? 'غير متوفر' : 'N/A',
          type: booking.service 
            ? (language === 'ar' ? booking.service.titleAr : booking.service.title)
            : language === 'ar' ? 'غير محدد' : 'Not specified',
          date: booking.scheduledAt 
            ? dayjs(booking.scheduledAt).format('YYYY-MM-DD')
            : '-',
          time: booking.scheduledAt 
            ? dayjs(booking.scheduledAt).format('HH:mm')
            : '-',
          duration: booking.duration || 60,
          status: session.status || booking.status?.toLowerCase() || 'upcoming',
          sessionId: session.id,
        }
      })
      setAllSessions(formattedSessions)
      // Filter based on active tab
      filterSessionsByTab(formattedSessions, activeTab)
    } catch (err) {
      console.error('Error fetching sessions:', err)
      message.error(language === 'ar' ? 'فشل تحميل الجلسات' : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const filterSessionsByTab = (sessionsList, tab) => {
    let filtered = sessionsList
    if (tab === 'pending') {
      filtered = sessionsList.filter(s => s.status === 'confirmed' || s.status === 'scheduled' || s.status === 'upcoming')
    } else if (tab === 'in_progress') {
      filtered = sessionsList.filter(s => s.status === 'in_progress')
    } else if (tab === 'completed') {
      filtered = sessionsList.filter(s => s.status === 'completed')
    }
    setSessions(filtered)
  }

  const handleTabChange = (key) => {
    setActiveTab(key)
    filterSessionsByTab(allSessions, key)
  }

  const handleStartSession = async (bookingId) => {
    try {
      const videoRoomResponse = await sessionsAPI.generateVideoRoom(bookingId)
      await sessionsAPI.startSession(bookingId, videoRoomResponse.room?.roomId)
      message.success(language === 'ar' ? 'تم بدء الجلسة بنجاح' : 'Session started successfully')
      fetchSessions()
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
      title: language === 'ar' ? 'النوع' : 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: language === 'ar' ? 'التاريخ والوقت' : 'Date & Time',
      key: 'datetime',
      render: (_, record) => `${record.date} - ${record.time}`,
    },
    {
      title: language === 'ar' ? 'المدة' : 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration} ${language === 'ar' ? 'دقيقة' : 'min'}`,
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          upcoming: 'blue',
          in_progress: 'green',
          completed: 'green',
          cancelled: 'red',
          scheduled: 'blue',
          confirmed: 'blue',
        }
        const labels = {
          upcoming: language === 'ar' ? 'قادمة' : 'Upcoming',
          in_progress: language === 'ar' ? 'قيد التنفيذ' : 'In Progress',
          completed: language === 'ar' ? 'مكتملة' : 'Completed',
          cancelled: language === 'ar' ? 'ملغية' : 'Cancelled',
          scheduled: language === 'ar' ? 'مجدولة' : 'Scheduled',
          confirmed: language === 'ar' ? 'مؤكدة' : 'Confirmed',
        }
        return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>
      },
    },
    {
      title: language === 'ar' ? 'الإجراءات' : 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {(record.status === 'upcoming' || record.status === 'scheduled' || record.status === 'confirmed') && (
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
              onClick={() => navigate(`/consultant/chat/${record.bookingId}`)}
            >
              {language === 'ar' ? 'فتح المحادثة' : 'Open Chat'}
            </Button>
          )}
          <Button
            icon={<UploadOutlined />}
            onClick={() => navigate(`/consultant/reports?bookingId=${record.bookingId}`)}
          >
            {language === 'ar' ? 'رفع تقرير' : 'Upload Report'}
          </Button>
        </Space>
      ),
    },
  ]

  const tabItems = [
    {
      key: 'all',
      label: language === 'ar' ? 'الكل' : 'All',
      icon: <FileTextOutlined />,
    },
    {
      key: 'pending',
      label: language === 'ar' ? 'الطلبات الواردة' : 'Incoming Requests',
      icon: <InboxOutlined />,
    },
    {
      key: 'in_progress',
      label: language === 'ar' ? 'قيد التنفيذ' : 'In Progress',
      icon: <PlayCircleOutlined />,
    },
    {
      key: 'completed',
      label: language === 'ar' ? 'مكتملة' : 'Completed',
      icon: <CheckCircleOutlined />,
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
          {language === 'ar' ? 'الجلسات' : 'Sessions'}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 font-medium">
          {language === 'ar' ? 'إدارة جميع جلساتك' : 'Manage all your sessions'}
        </p>
      </div>
      <Card className="glass-card shadow-professional-xl rounded-2xl border-0 relative z-10">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          className="mb-4"
        />
        <Table
          columns={columns}
          dataSource={sessions}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => (language === 'ar' ? `إجمالي ${total} جلسة` : `Total ${total} sessions`)
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  )
}

export default ConsultantSessions

