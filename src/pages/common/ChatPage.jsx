import React, { useState, useEffect, useRef } from 'react'
import { Card, Input, Button, Avatar, List, Empty, Spin, Typography, Space, Badge } from 'antd'
import { SendOutlined, UserOutlined, PaperClipOutlined, SmileOutlined } from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { messageAPI } from '../../services/api'
import dayjs from 'dayjs'
import './ChatPage.css'

const { TextArea } = Input
const { Text } = Typography

const ChatPage = () => {
  const { language } = useLanguage()
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversations()
  }, [])

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
      const response = await messageAPI.getConversations()
      setConversations(response.conversations || [])
    } catch (err) {
      console.error('Error fetching conversations:', err)
    }
  }

  const fetchMessages = async (sessionId) => {
    try {
      setLoading(true)
      const response = await messageAPI.getMessages(sessionId)
      setMessages(response.messages || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      setSending(true)
      await messageAPI.sendMessage(selectedConversation.sessionId, {
        content: newMessage,
        messageType: 'text',
        attachments: [],
      })
      setNewMessage('')
      // Refresh messages
      await fetchMessages(selectedConversation.sessionId)
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Conversations List */}
        <div className="conversations-sidebar">
          <Card
            title={language === 'ar' ? 'المحادثات' : 'Conversations'}
            className="h-full"
            styles={{ body: { padding: 0 } }}
          >
            {conversations.length === 0 ? (
              <Empty
                description={language === 'ar' ? 'لا توجد محادثات' : 'No conversations'}
                className="p-8"
              />
            ) : (
              <List
                dataSource={conversations}
                renderItem={(conv) => (
                  <List.Item
                    className={`conversation-item ${
                      selectedConversation?.id === conv.id ? 'active' : ''
                    }`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={conv.name}
                      description={conv.lastMessage}
                    />
                    {conv.unreadCount > 0 && (
                      <Badge count={conv.unreadCount} />
                    )}
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>

        {/* Chat Area */}
        <div className="chat-main">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Card className="chat-header" styles={{ body: { padding: '12px 16px' } }}>
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <div>
                    <Text strong>{selectedConversation.name}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">
                      {language === 'ar' ? 'متصل الآن' : 'Online now'}
                    </Text>
                  </div>
                </Space>
              </Card>

              {/* Messages */}
              <div className="messages-container">
                {loading && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <Spin size="large" />
                  </div>
                ) : messages.length === 0 ? (
                  <Empty
                    description={language === 'ar' ? 'لا توجد رسائل' : 'No messages'}
                    className="p-8"
                  />
                ) : (
                  <List
                    dataSource={messages}
                    renderItem={(message) => {
                      const isOwn = message.senderId === user?.id
                      return (
                        <div
                          className={`message-item ${isOwn ? 'own' : 'other'}`}
                          key={message.id}
                        >
                          <div className="message-content">
                            <Text>{message.content}</Text>
                            <Text className="message-time" type="secondary">
                              {dayjs(message.createdAt).format('HH:mm')}
                            </Text>
                          </div>
                        </div>
                      )
                    }}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <Card className="message-input-card" styles={{ body: { padding: '12px 16px' } }}>
                <Space.Compact style={{ width: '100%' }}>
                  <Button icon={<PaperClipOutlined />} />
                  <TextArea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    onPressEnter={(e) => {
                      if (!e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button icon={<SmileOutlined />} />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={sending}
                    disabled={!newMessage.trim()}
                  >
                    {language === 'ar' ? 'إرسال' : 'Send'}
                  </Button>
                </Space.Compact>
              </Card>
            </>
          ) : (
            <div className="flex justify-center items-center h-full">
              <Empty
                description={language === 'ar' ? 'اختر محادثة للبدء' : 'Select a conversation to start'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPage

