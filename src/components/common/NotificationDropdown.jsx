import React, { useState, useEffect } from 'react'
import { Badge, Dropdown, List, Button, Empty, Spin, Typography, Tag, Space } from 'antd'
import { BellOutlined, CheckOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { notificationsAPI } from '../../services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const { Text } = Typography

const NotificationDropdown = ({ userId }) => {
  const { language } = useLanguage()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchNotifications()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [userId])

  const fetchNotifications = async () => {
    if (!userId) {
      console.warn('NotificationDropdown: userId is not provided')
      return
    }
    try {
      setLoading(true)
      const response = await notificationsAPI.getNotifications()
      if (response && response.notifications) {
        const sorted = response.notifications.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        setNotifications(sorted)
        setUnreadCount(sorted.filter(n => !n.isRead).length)
      } else {
        console.warn('NotificationDropdown: Invalid response format', response)
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      // Set empty state on error to prevent UI issues
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation()
    try {
      await notificationsAPI.markAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation()
    try {
      await notificationsAPI.markAllAsRead()
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    try {
      await notificationsAPI.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      setUnreadCount(prev => {
        const deleted = notifications.find(n => n.id === id)
        return deleted && !deleted.isRead ? Math.max(0, prev - 1) : prev
      })
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING':
        return '📅'
      case 'MESSAGE':
        return '💬'
      case 'PAYMENT':
        return '💰'
      case 'SYSTEM':
        return '🔔'
      case 'SUPPORT':
        return '🎫'
      default:
        return '📢'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'BOOKING':
        return 'blue'
      case 'MESSAGE':
        return 'green'
      case 'PAYMENT':
        return 'gold'
      case 'SYSTEM':
        return 'red'
      case 'SUPPORT':
        return 'orange'
      default:
        return 'default'
    }
  }

  const notificationItems = [
    {
      key: 'header',
      label: (
        <div className="flex items-center justify-between p-2 border-b">
          <Text strong>{language === 'ar' ? 'الإشعارات' : 'Notifications'}</Text>
          <Space>
            {unreadCount > 0 && (
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={(e) => {
                  e.stopPropagation()
                  handleMarkAllAsRead(e)
                }}
              >
                {language === 'ar' ? 'قراءة الكل' : 'Mark all read'}
              </Button>
            )}
            <Button
              type="link"
              size="small"
              icon={<ReloadOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                fetchNotifications()
              }}
              loading={loading}
            />
          </Space>
        </div>
      ),
    },
    ...notifications.slice(0, 10).map(notification => ({
      key: notification.id,
      label: (
        <div
          className={`p-3 hover:bg-gray-50 ${
            !notification.isRead ? 'bg-blue-50 border-r-4 border-blue-500' : ''
          }`}
          onMouseDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            if (notification.link) {
              // Handle different link formats
              let link = notification.link
              // Convert /sessions/:sessionId to appropriate chat route based on user role
              if (link.startsWith('/sessions/')) {
                const sessionId = link.replace('/sessions/', '')
                const userRole = user?.role
                if (userRole === 'CLIENT') {
                  link = `/client/chat/session/${sessionId}`
                } else if (userRole === 'CONSULTANT') {
                  link = `/consultant/chat/session/${sessionId}`
                } else if (['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
                  link = `/admin/chat/${sessionId}`
                }
              } else if (link.startsWith('/chat/')) {
                // Handle /chat/:id format - redirect to role-based route
                const chatId = link.replace('/chat/', '')
                const userRole = user?.role
                if (userRole === 'CLIENT') {
                  link = `/client/chat/${chatId}`
                } else if (userRole === 'CONSULTANT') {
                  link = `/consultant/chat/${chatId}`
                } else if (['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
                  link = `/admin/chat/${chatId}`
                }
              }
              window.location.href = link
            }
            if (!notification.isRead) {
              handleMarkAsRead(notification.id, { stopPropagation: () => {} })
            }
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Text strong className={!notification.isRead ? 'text-blue-600' : ''}>
                  {notification.title}
                </Text>
                <Tag color={getNotificationColor(notification.type)} size="small">
                  {notification.type}
                </Tag>
              </div>
              <Text className="text-sm text-gray-600 block mb-2" ellipsis>
                {notification.message}
              </Text>
              <div className="flex items-center justify-between">
                <Text className="text-xs text-gray-400">
                  {dayjs(notification.createdAt).fromNow()}
                </Text>
                <Space size="small">
                  {!notification.isRead && (
                    <Button
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      title={language === 'ar' ? 'قراءة' : 'Mark as read'}
                    />
                  )}
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleDelete(notification.id, e)}
                    title={language === 'ar' ? 'حذف' : 'Delete'}
                  />
                </Space>
              </div>
            </div>
          </div>
        </div>
      ),
    })),
    ...(notifications.length === 0 ? [{
      key: 'empty',
      label: (
        <div className="p-8 text-center">
          <Empty
            description={language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ),
    }] : []),
  ]

  return (
    <Badge count={unreadCount} size="small" offset={[-5, 5]} style={{ pointerEvents: 'auto' }}>
      <Dropdown
        menu={{ items: notificationItems }}
        trigger={['click']}
        placement={language === 'ar' ? 'bottomLeft' : 'bottomRight'}
        open={open}
        dropdownStyle={{ width: '400px', zIndex: 1050 }}
        destroyTooltipOnHide={false}
        transitionName=""
        popupRender={(menu) => (
          <div 
            className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" 
            style={{ pointerEvents: 'auto', maxHeight: '500px', display: 'flex', flexDirection: 'column' }}
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <div 
              className="overflow-y-auto flex-1" 
              style={{ 
                maxHeight: '450px',
                overflowY: 'auto',
                overflowX: 'hidden',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {menu}
            </div>
          </div>
        )}
        getPopupContainer={() => document.body}
        onOpenChange={(visible) => {
          // Only update if the change is intentional (not from internal clicks)
          if (visible !== open) {
            setOpen(visible)
          }
        }}
      >
        <Button
          type="text"
          icon={<BellOutlined />}
          className="text-lg hover:bg-olive-green-50 text-gray-600 rounded-lg"
          style={{ pointerEvents: 'auto' }}
        />
      </Dropdown>
    </Badge>
  )
}

export default NotificationDropdown

