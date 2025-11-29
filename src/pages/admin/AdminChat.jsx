import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Card, 
  Input, 
  Button, 
  Avatar, 
  List, 
  Empty, 
  Spin, 
  Typography, 
  Space, 
  Badge, 
  Select,
  Popconfirm,
  message as antMessage,
  Tag,
  Modal,
  Upload,
  Image
} from 'antd'
import { 
  SendOutlined, 
  UserOutlined, 
  PaperClipOutlined, 
  DeleteOutlined,
  StopOutlined,
  MessageOutlined,
  PictureOutlined,
  SoundOutlined,
  VideoCameraOutlined,
  SmileOutlined,
  CloseOutlined,
  FileOutlined,
  AudioOutlined,
  PauseOutlined
} from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { messageAPI, adminAPI, filesAPI } from '../../services/api'
import useVoiceRecorder from '../../hooks/useVoiceRecorder'
import WhatsAppAudioPlayer from '../../components/common/WhatsAppAudioPlayer'
import dayjs from 'dayjs'
import './AdminChat.css'

const { TextArea } = Input
const { Text } = Typography

const AdminChat = () => {
  const { language } = useLanguage()
  const { user } = useAuth()
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [impersonateUserId, setImpersonateUserId] = useState(null)
  const [impersonateModalVisible, setImpersonateModalVisible] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [showUsersList, setShowUsersList] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const {
    isRecording,
    recordingTime,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    cancelRecording,
    formatTime
  } = useVoiceRecorder()

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      fetchConversations()
      fetchAllUsers()
    }
  }, [user])

  // If sessionId is provided in URL, select that conversation
  useEffect(() => {
    if (sessionId && conversations.length > 0) {
      const conversation = conversations.find(c => c.sessionId === sessionId)
      if (conversation) {
        setSelectedConversation(conversation)
        fetchMessages(conversation.sessionId)
      }
    }
  }, [sessionId, conversations])

  const fetchAllUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await adminAPI.getAllUsers()
      setAllUsers(response.users || [])
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.sessionId)
      // Poll for new messages every 5 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.sessionId)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await messageAPI.getConversations()
      setConversations(response.conversations || [])
    } catch (err) {
      console.error('Error fetching conversations:', err)
      antMessage.error(err.message || (language === 'ar' ? 'فشل تحميل المحادثات' : 'Failed to load conversations'))
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (sessionId) => {
    if (!sessionId) return
    
    try {
      const response = await messageAPI.getMessages(sessionId)
      setMessages(response.messages || [])
      // Mark messages as read when viewing chat
      if (response.messages && response.messages.length > 0) {
        try {
          await messageAPI.markAsRead(sessionId)
        } catch (err) {
          console.error('Error marking messages as read:', err)
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      antMessage.error(err.message || (language === 'ar' ? 'فشل تحميل الرسائل' : 'Failed to load messages'))
    }
  }

  const handleStartConversation = async (targetUserId) => {
    try {
      setLoading(true)
      const response = await adminAPI.createDirectSession(targetUserId, 'chat')
      
      // Create conversation object
      const newConversation = {
        id: response.session.id,
        sessionId: response.session.id,
        bookingId: null,
        name: allUsers.find(u => u.id === targetUserId)?.email || 'User',
        clientName: null,
        consultantName: null,
        clientId: targetUserId,
        consultantUserId: null,
        avatar: allUsers.find(u => u.id === targetUserId)?.avatar,
        lastMessage: '',
        lastMessageTime: new Date(),
        status: 'IN_PROGRESS',
        unreadCount: 0,
        isDirect: true,
      }
      
      setSelectedConversation(newConversation)
      setShowUsersList(false)
      fetchConversations()
      antMessage.success(language === 'ar' ? 'تم بدء المحادثة' : 'Conversation started')
    } catch (err) {
      console.error('Error starting conversation:', err)
      antMessage.error(err.message || (language === 'ar' ? 'فشل بدء المحادثة' : 'Failed to start conversation'))
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ownerType', 'MESSAGE')
      formData.append('ownerId', selectedConversation?.sessionId || '')

      const fileResponse = await filesAPI.uploadFile(formData)
      const newAttachments = [...attachments, fileResponse.file.fileUrl]
      setAttachments(newAttachments)
      
      antMessage.success(language === 'ar' ? 'تم رفع الملف' : 'File uploaded')
    } catch (err) {
      console.error('Error uploading file:', err)
      antMessage.error(err.message || (language === 'ar' ? 'فشل رفع الملف' : 'Failed to upload file'))
    }
    return false
  }

  const handleVoiceRecording = async () => {
    if (isRecording) {
      stopRecording()
    } else {
      await startRecording()
    }
  }

  const handleSendVoiceMessage = async () => {
    if (!audioBlob || !selectedConversation) return

    try {
      setSending(true)
      
      // Convert blob to file
      const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })
      
      // Upload audio file
      const formData = new FormData()
      formData.append('file', audioFile)
      formData.append('ownerType', 'MESSAGE')
      formData.append('ownerId', selectedConversation.sessionId)

      const fileResponse = await filesAPI.uploadFile(formData)
      const audioUrl = fileResponse.file.fileUrl

      // Determine receiver for direct sessions
      let receiverId = null
      const senderId = impersonateUserId || user?.id
      if (selectedConversation.isDirect || !selectedConversation.bookingId) {
        if (selectedConversation.clientId && selectedConversation.clientId !== senderId) {
          receiverId = selectedConversation.clientId
        } else if (selectedConversation.consultantUserId && selectedConversation.consultantUserId !== senderId) {
          receiverId = selectedConversation.consultantUserId
        }
      }

      // Send message with audio
      await messageAPI.sendMessageAsAdmin(selectedConversation.sessionId, {
        content: language === 'ar' ? 'رسالة صوتية' : 'Voice message',
        messageType: 'audio',
        attachments: [audioUrl],
        senderId: senderId,
        ...(receiverId && { receiverId }),
      })

      // Clean up
      cancelRecording()
      await fetchMessages(selectedConversation.sessionId)
      antMessage.success(language === 'ar' ? 'تم إرسال الرسالة الصوتية' : 'Voice message sent')
    } catch (err) {
      console.error('Error sending voice message:', err)
      antMessage.error(err.message || (language === 'ar' ? 'فشل إرسال الرسالة الصوتية' : 'Failed to send voice message'))
    } finally {
      setSending(false)
    }
  }

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || !selectedConversation) return

    try {
      setSending(true)
      
      // Determine message type based on attachments
      let messageType = 'text'
      if (attachments.length > 0) {
        const hasImage = attachments.some(url => /\.(jpg|jpeg|png|gif|webp)$/i.test(url))
        const hasAudio = attachments.some(url => /\.(mp3|wav|ogg|m4a|webm)$/i.test(url))
        const hasVideo = attachments.some(url => /\.(mp4|webm|ogg)$/i.test(url))
        
        if (hasImage) messageType = 'image'
        else if (hasAudio) messageType = 'audio'
        else if (hasVideo) messageType = 'video'
        else messageType = 'file'
      }
      
      // If impersonating, send as that user, otherwise send as admin
      const senderId = impersonateUserId || user?.id
      
      // Determine receiver for direct sessions
      let receiverId = null
      if (selectedConversation.isDirect || !selectedConversation.bookingId) {
        // For direct sessions, find the other user
        // If sending as admin, receiver is the other user in the conversation
        // Check both clientId and consultantUserId (one will be the other user)
        if (selectedConversation.clientId && selectedConversation.clientId !== senderId) {
          receiverId = selectedConversation.clientId
        } else if (selectedConversation.consultantUserId && selectedConversation.consultantUserId !== senderId) {
          receiverId = selectedConversation.consultantUserId
        } else {
          // If we're sending as the client/consultant, find the other participant from messages
          // This will be handled by the backend if receiverId is not provided
        }
      }
      
      await messageAPI.sendMessageAsAdmin(selectedConversation.sessionId, {
        content: newMessage || (attachments.length > 0 ? '📎 ملف مرفق' : ''),
        messageType,
        attachments: attachments.length > 0 ? attachments : [],
        senderId: senderId, // Admin can send as any user
        ...(receiverId && { receiverId }), // Include receiverId for direct sessions
      })
      
      setNewMessage('')
      setAttachments([])
      await fetchMessages(selectedConversation.sessionId)
      antMessage.success(language === 'ar' ? 'تم إرسال الرسالة' : 'Message sent')
    } catch (err) {
      console.error('Error sending message:', err)
      antMessage.error(err.message || (language === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send message'))
    } finally {
      setSending(false)
    }
  }

  const handleDeleteSession = async (sessionId) => {
    try {
      await adminAPI.deleteSession(sessionId)
      antMessage.success(language === 'ar' ? 'تم حذف المحادثة' : 'Session deleted')
      if (selectedConversation?.sessionId === sessionId) {
        setSelectedConversation(null)
        setMessages([])
      }
      fetchConversations()
    } catch (err) {
      console.error('Error deleting session:', err)
      antMessage.error(err.message || (language === 'ar' ? 'فشل حذف المحادثة' : 'Failed to delete session'))
    }
  }

  const handleStopSession = async (sessionId) => {
    try {
      await adminAPI.stopSession(sessionId)
      antMessage.success(language === 'ar' ? 'تم إيقاف المحادثة' : 'Session stopped')
      fetchConversations()
      if (selectedConversation?.sessionId === sessionId) {
        fetchMessages(sessionId)
      }
    } catch (err) {
      console.error('Error stopping session:', err)
      antMessage.error(err.message || (language === 'ar' ? 'فشل إيقاف المحادثة' : 'Failed to stop session'))
    }
  }

  const getConversationName = (conv) => {
    if (conv.clientName && conv.consultantName) {
      return `${conv.clientName} ↔ ${conv.consultantName}`
    }
    return conv.name || (language === 'ar' ? 'محادثة' : 'Conversation')
  }

  return (
    <>
    <div className="flex h-[calc(100vh-64px)] bg-gray-50" style={{ margin: '-12px -12px 0 -12px', width: 'calc(100% + 24px)' }}>
      {/* Conversations Sidebar - WhatsApp Style */}
      <div className="w-1/3 min-w-[300px] max-w-[400px] bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageOutlined className="text-olive-green-600" />
            <span className="font-semibold text-gray-900">{language === 'ar' ? 'المحادثات' : 'Conversations'}</span>
          </div>
          <Space>
            <Button 
              type="text" 
              size="small"
              icon={<UserOutlined />}
              onClick={() => setShowUsersList(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              {language === 'ar' ? 'جديد' : 'New'}
            </Button>
            <Button 
              type="text" 
              size="small"
              icon={<MessageOutlined />}
              onClick={() => setImpersonateModalVisible(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              {language === 'ar' ? 'إرسال كـ' : 'Send As'}
            </Button>
          </Space>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="small" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <MessageOutlined className="text-4xl text-gray-300 mb-4" />
              <Text type="secondary">{language === 'ar' ? 'لا توجد محادثات' : 'No conversations'}</Text>
            </div>
          ) : (
            <List
              className="px-0"
              dataSource={conversations}
              renderItem={(conv) => {
                const isActive = selectedConversation?.sessionId === conv.sessionId
                return (
                  <List.Item
                    className={`cursor-pointer px-4 py-3 border-b border-gray-100 transition-colors ${
                      isActive 
                        ? 'bg-olive-green-50 border-l-4 border-l-olive-green-600' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedConversation(conv)
                      fetchMessages(conv.sessionId)
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge count={conv.unreadCount > 0 ? conv.unreadCount : 0} size="small" offset={[-5, 5]} showZero={false}>
                          <Avatar 
                            icon={<UserOutlined />} 
                            size={48}
                            className="shadow-sm"
                          />
                        </Badge>
                      }
                      title={
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold text-sm ${isActive ? 'text-olive-green-700' : 'text-gray-900'}`}>
                            {getConversationName(conv)}
                          </span>
                          {conv.status && (
                            <Tag 
                              color={conv.status === 'ACTIVE' || conv.status === 'IN_PROGRESS' ? 'green' : conv.status === 'COMPLETED' ? 'blue' : 'default'} 
                              size="small"
                              className="text-xs"
                            >
                              {conv.status}
                            </Tag>
                          )}
                        </div>
                      }
                      description={
                        <div className="mt-1">
                          <p className="text-xs text-gray-600 truncate mb-1">
                            {conv.lastMessage || (language === 'ar' ? 'لا توجد رسائل' : 'No messages')}
                          </p>
                          <p className="text-xs text-gray-400">
                            {conv.lastMessageTime ? dayjs(conv.lastMessageTime).fromNow() : ''}
                          </p>
                        </div>
                      }
                    />
                    <Space className="ml-2">
                      <Popconfirm
                        title={language === 'ar' ? 'إيقاف المحادثة؟' : 'Stop session?'}
                        onConfirm={() => handleStopSession(conv.sessionId)}
                        okText={language === 'ar' ? 'نعم' : 'Yes'}
                        cancelText={language === 'ar' ? 'لا' : 'No'}
                      >
                        <Button 
                          type="text" 
                          icon={<StopOutlined />} 
                          danger
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                      <Popconfirm
                        title={language === 'ar' ? 'حذف المحادثة؟' : 'Delete session?'}
                        description={language === 'ar' ? 'هل أنت متأكد من حذف هذه المحادثة؟' : 'Are you sure you want to delete this conversation?'}
                        onConfirm={() => handleDeleteSession(conv.sessionId)}
                        okText={language === 'ar' ? 'نعم' : 'Yes'}
                        cancelText={language === 'ar' ? 'لا' : 'No'}
                        okButtonProps={{ danger: true }}
                      >
                        <Button 
                          type="text" 
                          icon={<DeleteOutlined />} 
                          danger
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Popconfirm>
                    </Space>
                  </List.Item>
                )
              }}
            />
          )}
        </div>
      </div>

      {/* Chat Area - WhatsApp Style */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Header Bar - WhatsApp/Facebook Style - Fixed */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10 sticky top-0 flex-shrink-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar 
                  icon={<UserOutlined />}
                  size={40}
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-gray-900 truncate">
                    {getConversationName(selectedConversation)}
                  </h2>
                  <p className="text-xs text-gray-500 truncate">
                    {selectedConversation?.status === 'ACTIVE' || selectedConversation?.status === 'IN_PROGRESS'
                      ? (language === 'ar' ? 'نشط' : 'Active')
                      : selectedConversation?.status === 'STOPPED'
                      ? (language === 'ar' ? 'متوقف' : 'Stopped')
                      : selectedConversation?.status === 'COMPLETED'
                      ? (language === 'ar' ? 'مكتمل' : 'Completed')
                      : (language === 'ar' ? 'مجدول' : 'Scheduled')}
                  </p>
                </div>
              </div>
              <Space className="flex-shrink-0">
                {impersonateUserId && (
                  <Tag color="orange" className="text-xs">
                    {language === 'ar' ? 'إرسال كـ مستخدم آخر' : 'Sending as user'}
                  </Tag>
                )}
                <Button
                  type="text"
                  icon={<MessageOutlined />}
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setImpersonateModalVisible(true)}
                  title={language === 'ar' ? 'إرسال كـ' : 'Send As'}
                />
              </Space>
            </div>

            {/* Messages Area - Takes remaining space - Only this scrolls */}
            <div 
              className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6"
              style={{ 
                scrollBehavior: 'smooth',
                backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                height: '100%',
                overflowY: 'auto'
              }}
            >
              <div className="max-w-4xl mx-auto space-y-3">
                {loading && messages.length === 0 ? (
                  <div className="flex justify-center items-center py-12">
                    <Spin size="large" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <div className="text-4xl mb-2">💬</div>
                    <p>{language === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isOwn = msg.senderId === (impersonateUserId || user?.id)
                    const msgAttachments = msg.attachments ? (typeof msg.attachments === 'string' ? JSON.parse(msg.attachments) : msg.attachments) : []
                    const prevMsg = index > 0 ? messages[index - 1] : null
                    const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId
                    const showTime = !prevMsg || dayjs(msg.createdAt).diff(dayjs(prevMsg.createdAt), 'minute') > 5
                    
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-2 ${showTime ? 'mt-4' : ''}`}>
                        {!isOwn && (
                          <Avatar 
                            src={msg.sender?.avatar}
                            icon={<UserOutlined />}
                            size={32}
                            className="flex-shrink-0"
                          />
                        )}
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%] md:max-w-[60%]`}>
                          {showTime && (
                            <div className="text-center w-full mb-2">
                              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                                {dayjs(msg.createdAt).format('MMM DD, YYYY HH:mm')}
                              </span>
                            </div>
                          )}
                          {!isOwn && showAvatar && (
                            <Text type="secondary" className="text-xs mb-1 px-1">
                              {msg.sender?.email || 'Unknown'}
                            </Text>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwn
                                ? 'bg-[#dcf8c6] text-gray-900 rounded-tr-sm'
                                : 'bg-white text-gray-900 rounded-tl-sm shadow-sm'
                            }`}
                          >
                            {msgAttachments.length > 0 && (
                              <div className="mb-2 space-y-2">
                                {msgAttachments.map((url, idx) => {
                                  const isBase64 = url.startsWith('data:image/') || url.startsWith('data:video/') || url.startsWith('data:audio/')
                                  const isImage = msg.messageType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || (isBase64 && url.startsWith('data:image/'))
                                  const isAudio = msg.messageType === 'audio' || /\.(mp3|wav|ogg|m4a|webm)$/i.test(url) || (isBase64 && url.startsWith('data:audio/'))
                                  const isVideo = msg.messageType === 'video' || (/\.(mp4|webm)$/i.test(url) && msg.messageType !== 'audio') || (isBase64 && url.startsWith('data:video/'))
                                  
                                  if (isImage) {
                                    return (
                                      <div key={idx} className="image-attachment mb-2 -mx-2">
                                        {isBase64 ? (
                                          <img
                                            src={url}
                                            alt="Image attachment"
                                            style={{ 
                                              maxWidth: '100%', 
                                              maxHeight: '300px',
                                              borderRadius: '8px', 
                                              display: 'block',
                                              objectFit: 'cover',
                                              width: '100%'
                                            }}
                                            onError={(e) => {
                                              e.target.style.display = 'none'
                                            }}
                                          />
                                        ) : (
                                          <Image
                                            key={idx}
                                            src={url.startsWith('http') ? url : url.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}` : url.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}` : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/MESSAGE/${url.split('/').pop()}`}
                                            alt="Image attachment"
                                            style={{ 
                                              maxWidth: '100%', 
                                              maxHeight: '300px',
                                              borderRadius: '8px', 
                                              display: 'block',
                                              objectFit: 'cover',
                                              width: '100%'
                                            }}
                                            preview={{
                                              mask: language === 'ar' ? 'معاينة' : 'Preview'
                                            }}
                                            onError={(e) => {
                                              console.error('Image failed to load:', url)
                                              e.target.style.display = 'none'
                                            }}
                                          />
                                        )}
                                      </div>
                                    )
                                  } else if (isAudio) {
                                    const audioSrc = url.startsWith('http') 
                                      ? url 
                                      : url.startsWith('/uploads') 
                                        ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}` 
                                        : url.startsWith('/') 
                                          ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}` 
                                          : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/MESSAGE/${url.split('/').pop()}`
                                    return (
                                      <div key={idx} className="audio-attachment">
                                        <WhatsAppAudioPlayer
                                          src={audioSrc}
                                          isOwnMessage={isOwn}
                                          language={language}
                                        />
                                      </div>
                                    )
                                  } else if (isVideo) {
                                    return (
                                      <div key={idx} className="video-attachment">
                                        <video controls src={url} className="w-full max-w-md rounded" />
                                      </div>
                                    )
                                  } else {
                                    return (
                                      <div key={idx} className={`file-attachment flex items-center gap-2 p-2 rounded ${isOwn ? 'bg-white/50' : 'bg-gray-100'}`}>
                                        <FileOutlined className={isOwn ? 'text-gray-700' : 'text-blue-600'} />
                                        <a 
                                          href={url} 
                                          download 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className={`text-sm ${isOwn ? 'text-gray-700 hover:text-gray-900' : 'text-blue-600 hover:text-blue-800'}`}
                                        >
                                          {url.split('/').pop()}
                                        </a>
                                      </div>
                                    )
                                  }
                                })}
                              </div>
                            )}
                            {msg.content && msg.content.trim() && !(msg.messageType === 'image' && msgAttachments.length > 0 && !msg.content.includes('📎')) && (
                              <p className={`text-sm ${msgAttachments.length > 0 ? 'mt-2' : ''} whitespace-pre-wrap break-words`}>{msg.content}</p>
                            )}
                            <span className={`text-xs mt-1 ${isOwn ? 'text-gray-600' : 'text-gray-500'} self-end`}>
                              {dayjs(msg.createdAt).format('HH:mm')}
                            </span>
                          </div>
                        </div>
                        {isOwn && (
                          <Avatar 
                            src={user?.avatar}
                            icon={<UserOutlined />}
                            size={32}
                            className="flex-shrink-0"
                          />
                        )}
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mb-3 pb-3 border-b border-gray-200 px-4">
                <div className="flex flex-wrap gap-3">
                  {attachments.map((url, idx) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                    const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
                    const isAudio = /\.(mp3|wav|ogg|m4a|webm)$/i.test(url);
                    const fileName = url.split('/').pop();
                    const fileUrl = url.startsWith('http') 
                      ? url 
                      : url.startsWith('/uploads') 
                        ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}` 
                        : url.startsWith('/') 
                          ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}` 
                          : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/MESSAGE/${url.split('/').pop()}`;
                    
                    return (
                      <div key={idx} className="relative group">
                        {isImage ? (
                          <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <Image
                              src={fileUrl}
                              alt={fileName}
                              width={200}
                              height={200}
                              className="object-cover"
                              preview={false}
                              onError={(e) => {
                                console.error('Image failed to load:', fileUrl);
                                e.target.style.display = 'none';
                              }}
                            />
                            <Button
                              type="text"
                              size="small"
                              icon={<CloseOutlined />}
                              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                            />
                          </div>
                        ) : isVideo ? (
                          <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm w-[200px]">
                            <video
                              src={fileUrl}
                              className="w-full h-[150px] object-cover"
                              controls={false}
                              muted
                              onError={(e) => {
                                console.error('Video failed to load:', fileUrl);
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <VideoCameraOutlined className="text-white text-2xl" />
                            </div>
                            <Button
                              type="text"
                              size="small"
                              icon={<CloseOutlined />}
                              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 p-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                            />
                          </div>
                        ) : isAudio ? (
                          <div className="relative rounded-lg border border-gray-200 shadow-sm bg-gray-50 p-3 min-w-[200px]">
                            <div className="flex items-center gap-2">
                              <AudioOutlined className="text-gray-600 text-lg" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 truncate">{fileName}</p>
                                <audio src={fileUrl} controls className="w-full mt-1" preload="metadata" />
                              </div>
                            </div>
                            <Button
                              type="text"
                              size="small"
                              icon={<CloseOutlined />}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 p-0 flex items-center justify-center"
                              onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                            />
                          </div>
                        ) : (
                          <div className="relative flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm min-w-[200px]">
                            <FileOutlined className="text-gray-600 text-xl" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 truncate font-medium">{fileName}</p>
                              <p className="text-xs text-gray-500">
                                {language === 'ar' ? 'ملف' : 'File'}
                              </p>
                            </div>
                            <Button
                              type="text"
                              size="small"
                              icon={<CloseOutlined />}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 p-0 flex items-center justify-center flex-shrink-0"
                              onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Voice Recording Preview */}
            {audioUrl && !isRecording && (
              <div className="p-3 bg-blue-50 border-t border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <audio src={audioUrl} controls className="max-w-xs" />
                  <span className="text-sm text-gray-600">{formatTime(recordingTime)}</span>
                </div>
                <Space>
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleSendVoiceMessage}
                    loading={sending}
                  >
                    {language === 'ar' ? 'إرسال' : 'Send'}
                  </Button>
                  <Button
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={cancelRecording}
                  />
                </Space>
              </div>
            )}

            {/* Recording Indicator */}
            {isRecording && (
              <div className="p-3 bg-red-50 border-t border-red-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-600 font-semibold">
                    {language === 'ar' ? 'جاري التسجيل...' : 'Recording...'} {formatTime(recordingTime)}
                  </span>
                </div>
                <Button
                  danger
                  size="small"
                  icon={<StopOutlined />}
                  onClick={stopRecording}
                >
                  {language === 'ar' ? 'إيقاف' : 'Stop'}
                </Button>
              </div>
            )}

            {/* Input Area - Fixed at bottom */}
            <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
              <div className="flex items-end gap-2">
                <Upload
                  showUploadList={false}
                  beforeUpload={handleFileUpload}
                  accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                  multiple
                >
                  <Button 
                    icon={<PaperClipOutlined />} 
                    type="text"
                    className="text-gray-600 hover:text-gray-900"
                    size="large"
                  />
                </Upload>
                <Button 
                  type={isRecording ? 'primary' : 'text'}
                  danger={isRecording}
                  icon={isRecording ? <PauseOutlined /> : <AudioOutlined />}
                  onClick={handleVoiceRecording}
                  disabled={selectedConversation?.status === 'STOPPED' || selectedConversation?.status === 'COMPLETED'}
                  title={language === 'ar' ? 'تسجيل صوتي' : 'Voice recording'}
                  className={isRecording ? '' : 'text-gray-600 hover:text-gray-900'}
                  size="large"
                />
                <Button 
                  icon={<SmileOutlined />} 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  type="text"
                  className={`text-gray-600 hover:text-gray-900 ${showEmojiPicker ? 'bg-gray-100' : ''}`}
                  size="large"
                />
                <div className="flex-1 relative">
                  <TextArea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
                    rows={1}
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    variant="borderless"
                    disabled={selectedConversation?.status === 'STOPPED' || selectedConversation?.status === 'COMPLETED' || isRecording}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    style={{ 
                      resize: 'none',
                      borderRadius: '24px',
                      padding: '10px 16px',
                      backgroundColor: '#f0f0f0',
                      border: 'none',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  className="bg-olive-green-600 hover:bg-olive-green-700 border-0 rounded-full"
                  onClick={handleSendMessage}
                  loading={sending}
                  disabled={(!newMessage.trim() && attachments.length === 0) || selectedConversation?.status === 'STOPPED' || selectedConversation?.status === 'COMPLETED' || isRecording}
                  size="large"
                  shape="circle"
                />
              </div>
              {showEmojiPicker && (
                <div className="p-3 bg-white border-t border-gray-200 max-h-48 overflow-y-auto shadow-inner">
                  <div className="grid grid-cols-8 gap-1">
                    {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃'].map((emoji) => (
                      <Button
                        key={emoji}
                        type="text"
                        className="text-xl p-1"
                        onClick={() => {
                          setNewMessage(prev => prev + emoji)
                          setShowEmojiPicker(false)
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center py-12 px-6">
              <div className="mb-6">
                <MessageOutlined className="text-7xl text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gray-700">
                {language === 'ar' ? 'اختر محادثة للبدء' : 'Select a Conversation to Start'}
              </h2>
              <p className="text-gray-500 max-w-md mx-auto text-base">
                {language === 'ar' 
                  ? 'اختر محادثة من القائمة الجانبية للبدء في الدردشة' 
                  : 'Select a conversation from the sidebar to start chatting'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Impersonate Modal */}
      <Modal
        title={language === 'ar' ? 'إرسال الرسالة كـ' : 'Send Message As'}
        open={impersonateModalVisible}
        onCancel={() => setImpersonateModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => {
            setImpersonateModalVisible(false)
            setImpersonateUserId(null)
          }}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>,
          <Button key="clear" onClick={() => {
            setImpersonateUserId(null)
            antMessage.info(language === 'ar' ? 'سيتم الإرسال كمدير' : 'Will send as admin')
          }}>
            {language === 'ar' ? 'إرسال كمدير' : 'Send as Admin'}
          </Button>
        ]}
      >
        <div className="space-y-4">
          <Text type="secondary">
            {language === 'ar' 
              ? 'اختر المستخدم الذي تريد الإرسال باسمه. اتركه فارغاً للإرسال كمدير.'
              : 'Select the user you want to send as. Leave empty to send as admin.'}
          </Text>
          <div>
            <Text strong>{language === 'ar' ? 'اختر المستخدم:' : 'Select User:'}</Text>
            {usersLoading ? (
              <div className="flex justify-center py-4">
                <Spin />
              </div>
            ) : (
              <Select
                className="w-full mt-2"
                placeholder={language === 'ar' ? 'اختر مستخدم للإرسال باسمه' : 'Select user to send as'}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={allUsers.map(u => ({
                  value: u.id,
                  label: `${u.email}${u.client ? ` (${u.client.firstName} ${u.client.lastName})` : ''}${u.consultant ? ` (${u.consultant.firstName} ${u.consultant.lastName})` : ''} - ${u.role}`,
                }))}
                onChange={(value) => {
                  setImpersonateUserId(value)
                  const selectedUser = allUsers.find(u => u.id === value)
                  antMessage.success(
                    language === 'ar' 
                      ? `سيتم الإرسال كـ ${selectedUser?.email}` 
                      : `Will send as ${selectedUser?.email}`
                  )
                }}
                allowClear
                onClear={() => {
                  setImpersonateUserId(null)
                  antMessage.info(language === 'ar' ? 'سيتم الإرسال كمدير' : 'Will send as admin')
                }}
              />
            )}
            {selectedConversation && (
              <div className="mt-4">
                <Text strong>{language === 'ar' ? 'المشاركون في المحادثة:' : 'Conversation Participants:'}</Text>
                <div className="mt-2 space-y-2">
                  {selectedConversation?.clientId && (
                    <Button
                      block
                      onClick={() => {
                        setImpersonateUserId(selectedConversation.clientId)
                        setImpersonateModalVisible(false)
                        antMessage.success(language === 'ar' ? 'سيتم الإرسال كعميل' : 'Will send as client')
                      }}
                    >
                      {language === 'ar' ? 'إرسال كعميل' : 'Send as Client'} ({selectedConversation.clientName || 'Client'})
                    </Button>
                  )}
                  {selectedConversation?.consultantUserId && (
                    <Button
                      block
                      onClick={() => {
                        setImpersonateUserId(selectedConversation.consultantUserId)
                        setImpersonateModalVisible(false)
                        antMessage.success(language === 'ar' ? 'سيتم الإرسال كمستشار' : 'Will send as consultant')
                      }}
                    >
                      {language === 'ar' ? 'إرسال كمستشار' : 'Send as Consultant'} ({selectedConversation.consultantName || 'Consultant'})
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Users List Modal */}
      <Modal
        title={language === 'ar' ? 'اختر مستخدم للدردشة' : 'Select User to Chat'}
        open={showUsersList}
        onCancel={() => setShowUsersList(false)}
        footer={null}
        width={600}
      >
        {usersLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <List
            dataSource={allUsers.filter(u => u.id !== user?.id)}
            renderItem={(u) => (
              <List.Item
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleStartConversation(u.id)}
              >
                <List.Item.Meta
                  avatar={<Avatar src={u.avatar} icon={<UserOutlined />} />}
                  title={
                    <div>
                      <Text strong>
                        {u.email}
                        {u.client && ` (${u.client.firstName} ${u.client.lastName})`}
                        {u.consultant && ` (${u.consultant.firstName} ${u.consultant.lastName})`}
                      </Text>
                      <Tag color="blue" className="ml-2">{u.role}</Tag>
                    </div>
                  }
                  description={u.client ? 'Client' : u.consultant ? 'Consultant' : 'User'}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
    </>
  )
}

export default AdminChat

