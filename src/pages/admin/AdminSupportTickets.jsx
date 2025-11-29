import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, Select, Tag, Space, Empty, message, Descriptions, Timeline, Badge } from 'antd'
import { EyeOutlined, EditOutlined, CheckCircleOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { supportAPI } from '../../services/api'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

const AdminSupportTickets = () => {
  const { language } = useLanguage()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [commentModalVisible, setCommentModalVisible] = useState(false)
  const [filters, setFilters] = useState({})
  const [form] = Form.useForm()
  const [commentForm] = Form.useForm()

  useEffect(() => {
    fetchTickets()
  }, [filters])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await supportAPI.getAllTickets(filters)
      setTickets(response.tickets || [])
    } catch (err) {
      message.error(language === 'ar' ? 'فشل تحميل التذاكر' : 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTicket = async (values) => {
    try {
      await supportAPI.updateTicket(selectedTicket.id, values)
      message.success(language === 'ar' ? 'تم تحديث التذكرة' : 'Ticket updated')
      setEditModalVisible(false)
      form.resetFields()
      fetchTickets()
      if (viewModalVisible) {
        const updated = await supportAPI.getTicketById(selectedTicket.id)
        setSelectedTicket(updated.ticket)
      }
    } catch (err) {
      message.error(language === 'ar' ? 'فشل تحديث التذكرة' : 'Failed to update ticket')
    }
  }

  const handleAddComment = async (values) => {
    try {
      await supportAPI.addComment(selectedTicket.id, values.content)
      message.success(language === 'ar' ? 'تم إضافة التعليق' : 'Comment added')
      setCommentModalVisible(false)
      commentForm.resetFields()
      fetchTickets()
      if (viewModalVisible) {
        const updated = await supportAPI.getTicketById(selectedTicket.id)
        setSelectedTicket(updated.ticket)
      }
    } catch (err) {
      message.error(language === 'ar' ? 'فشل إضافة التعليق' : 'Failed to add comment')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'blue',
      IN_PROGRESS: 'orange',
      RESOLVED: 'green',
      CLOSED: 'default',
    }
    return colors[status] || 'default'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'default',
      MEDIUM: 'blue',
      HIGH: 'orange',
      URGENT: 'red',
    }
    return colors[priority] || 'default'
  }

  const columns = [
    {
      title: language === 'ar' ? 'رقم التذكرة' : 'Ticket Number',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
    },
    {
      title: language === 'ar' ? 'المستخدم' : 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <span>{record.user?.email || '-'}</span>
        </Space>
      ),
    },
    {
      title: language === 'ar' ? 'الموضوع' : 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: language === 'ar' ? 'الفئة' : 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => category || '-',
    },
    {
      title: language === 'ar' ? 'الأولوية' : 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{priority}</Tag>
      ),
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: language === 'ar' ? 'مُخصص إلى' : 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (assignedTo) => assignedTo || <Tag color="default">{language === 'ar' ? 'غير مُخصص' : 'Unassigned'}</Tag>,
    },
    {
      title: language === 'ar' ? 'تاريخ الإنشاء' : 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: language === 'ar' ? 'الإجراءات' : 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedTicket(record)
              setViewModalVisible(true)
            }}
          >
            {language === 'ar' ? 'عرض' : 'View'}
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setSelectedTicket(record)
              form.setFieldsValue({
                status: record.status,
                priority: record.priority,
                assignedTo: record.assignedTo,
                resolution: record.resolution,
              })
              setEditModalVisible(true)
            }}
          >
            {language === 'ar' ? 'تعديل' : 'Edit'}
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'إدارة تذاكر الدعم الفني' : 'Support Tickets Management'}
        </h1>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Space wrap>
          <Select
            placeholder={language === 'ar' ? 'الحالة' : 'Status'}
            style={{ width: 150 }}
            allowClear
            onChange={(value) => setFilters({ ...filters, status: value })}
          >
            <Option value="OPEN">{language === 'ar' ? 'مفتوحة' : 'Open'}</Option>
            <Option value="IN_PROGRESS">{language === 'ar' ? 'قيد المعالجة' : 'In Progress'}</Option>
            <Option value="RESOLVED">{language === 'ar' ? 'محلولة' : 'Resolved'}</Option>
            <Option value="CLOSED">{language === 'ar' ? 'مغلقة' : 'Closed'}</Option>
          </Select>

          <Select
            placeholder={language === 'ar' ? 'الأولوية' : 'Priority'}
            style={{ width: 150 }}
            allowClear
            onChange={(value) => setFilters({ ...filters, priority: value })}
          >
            <Option value="LOW">{language === 'ar' ? 'منخفضة' : 'Low'}</Option>
            <Option value="MEDIUM">{language === 'ar' ? 'متوسطة' : 'Medium'}</Option>
            <Option value="HIGH">{language === 'ar' ? 'عالية' : 'High'}</Option>
            <Option value="URGENT">{language === 'ar' ? 'عاجلة' : 'Urgent'}</Option>
          </Select>

          <Select
            placeholder={language === 'ar' ? 'الفئة' : 'Category'}
            style={{ width: 150 }}
            allowClear
            onChange={(value) => setFilters({ ...filters, category: value })}
          >
            <Option value="technical">{language === 'ar' ? 'تقني' : 'Technical'}</Option>
            <Option value="billing">{language === 'ar' ? 'مالي' : 'Billing'}</Option>
            <Option value="general">{language === 'ar' ? 'عام' : 'General'}</Option>
          </Select>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={tickets}
          loading={loading}
          rowKey="id"
          locale={{
            emptyText: <Empty description={language === 'ar' ? 'لا توجد تذاكر' : 'No tickets'} />,
          }}
        />
      </Card>

      {/* View Ticket Modal */}
      <Modal
        title={language === 'ar' ? 'تفاصيل التذكرة' : 'Ticket Details'}
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false)
          setSelectedTicket(null)
        }}
        footer={null}
        width={800}
        className="modern-modal"
      >
        {selectedTicket && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label={language === 'ar' ? 'رقم التذكرة' : 'Ticket Number'}>
                {selectedTicket.ticketNumber}
              </Descriptions.Item>
              <Descriptions.Item label={language === 'ar' ? 'المستخدم' : 'User'}>
                {selectedTicket.user?.email || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={language === 'ar' ? 'الحالة' : 'Status'}>
                <Tag color={getStatusColor(selectedTicket.status)}>{selectedTicket.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={language === 'ar' ? 'الأولوية' : 'Priority'}>
                <Tag color={getPriorityColor(selectedTicket.priority)}>{selectedTicket.priority}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={language === 'ar' ? 'مُخصص إلى' : 'Assigned To'}>
                {selectedTicket.assignedTo || <Tag color="default">{language === 'ar' ? 'غير مُخصص' : 'Unassigned'}</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label={language === 'ar' ? 'الفئة' : 'Category'}>
                {selectedTicket.category || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={language === 'ar' ? 'الموضوع' : 'Subject'} span={2}>
                {selectedTicket.subject}
              </Descriptions.Item>
              <Descriptions.Item label={language === 'ar' ? 'الوصف' : 'Description'} span={2}>
                {selectedTicket.description}
              </Descriptions.Item>
              {selectedTicket.resolution && (
                <Descriptions.Item label={language === 'ar' ? 'الحل' : 'Resolution'} span={2}>
                  {selectedTicket.resolution}
                </Descriptions.Item>
              )}
            </Descriptions>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {language === 'ar' ? 'التعليقات' : 'Comments'}
                </h3>
                <Button
                  type="primary"
                  icon={<MessageOutlined />}
                  onClick={() => setCommentModalVisible(true)}
                >
                  {language === 'ar' ? 'إضافة تعليق' : 'Add Comment'}
                </Button>
              </div>

              <Timeline
                items={selectedTicket.comments?.map((comment) => ({
                  key: comment.id,
                  children: (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">{comment.user?.email}</span>
                        <span className="text-gray-500 text-sm">
                          {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}
                        </span>
                      </div>
                      <p>{comment.comment || comment.content}</p>
                    </div>
                  ),
                })) || []}
              />
              {(!selectedTicket.comments || selectedTicket.comments.length === 0) && (
                <Empty description={language === 'ar' ? 'لا توجد تعليقات' : 'No comments'} />
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Ticket Modal */}
      <Modal
        title={language === 'ar' ? 'تعديل التذكرة' : 'Edit Ticket'}
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={600}
        className="modern-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateTicket}
        >
          <Form.Item
            name="status"
            label={language === 'ar' ? 'الحالة' : 'Status'}
          >
            <Select>
              <Option value="OPEN">{language === 'ar' ? 'مفتوحة' : 'Open'}</Option>
              <Option value="IN_PROGRESS">{language === 'ar' ? 'قيد المعالجة' : 'In Progress'}</Option>
              <Option value="RESOLVED">{language === 'ar' ? 'محلولة' : 'Resolved'}</Option>
              <Option value="CLOSED">{language === 'ar' ? 'مغلقة' : 'Closed'}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label={language === 'ar' ? 'الأولوية' : 'Priority'}
          >
            <Select>
              <Option value="LOW">{language === 'ar' ? 'منخفضة' : 'Low'}</Option>
              <Option value="MEDIUM">{language === 'ar' ? 'متوسطة' : 'Medium'}</Option>
              <Option value="HIGH">{language === 'ar' ? 'عالية' : 'High'}</Option>
              <Option value="URGENT">{language === 'ar' ? 'عاجلة' : 'Urgent'}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="assignedTo"
            label={language === 'ar' ? 'مُخصص إلى' : 'Assigned To'}
          >
            <Input placeholder={language === 'ar' ? 'معرف المستخدم' : 'User ID'} />
          </Form.Item>

          <Form.Item
            name="resolution"
            label={language === 'ar' ? 'الحل' : 'Resolution'}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {language === 'ar' ? 'تحديث التذكرة' : 'Update Ticket'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Comment Modal */}
      <Modal
        title={language === 'ar' ? 'إضافة تعليق' : 'Add Comment'}
        open={commentModalVisible}
        onCancel={() => {
          setCommentModalVisible(false)
          commentForm.resetFields()
        }}
        footer={null}
        className="modern-modal"
      >
        <Form
          form={commentForm}
          layout="vertical"
          onFinish={handleAddComment}
        >
          <Form.Item
            name="content"
            label={language === 'ar' ? 'التعليق' : 'Comment'}
            rules={[{ required: true, message: language === 'ar' ? 'الرجاء إدخال التعليق' : 'Please enter comment' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {language === 'ar' ? 'إضافة التعليق' : 'Add Comment'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminSupportTickets

