import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Empty,
  message,
  Descriptions,
  Timeline,
} from "antd";
import { PlusOutlined, EyeOutlined, MessageOutlined } from "@ant-design/icons";
import { useLanguage } from "../../contexts/LanguageContext";
import { supportAPI } from "../../services/api";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const ConsultantSupportTickets = () => {
  const { language } = useLanguage();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [commentForm] = Form.useForm();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await supportAPI.getMyTickets();
      setTickets(response.tickets || []);
    } catch (err) {
      message.error(
        language === "ar" ? "فشل تحميل التذاكر" : "Failed to load tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (values) => {
    try {
      await supportAPI.createTicket(values);
      message.success(
        language === "ar"
          ? "تم إنشاء التذكرة بنجاح"
          : "Ticket created successfully"
      );
      setCreateModalVisible(false);
      form.resetFields();
      fetchTickets();
    } catch (err) {
      message.error(
        language === "ar" ? "فشل إنشاء التذكرة" : "Failed to create ticket"
      );
    }
  };

  const handleAddComment = async (values) => {
    try {
      await supportAPI.addComment(selectedTicket.id, values.content);
      message.success(language === "ar" ? "تم إضافة التعليق" : "Comment added");
      setCommentModalVisible(false);
      commentForm.resetFields();
      fetchTickets();
      if (viewModalVisible) {
        const updated = await supportAPI.getTicketById(selectedTicket.id);
        setSelectedTicket(updated.ticket);
      }
    } catch (err) {
      message.error(
        language === "ar" ? "فشل إضافة التعليق" : "Failed to add comment"
      );
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: "blue",
      IN_PROGRESS: "orange",
      RESOLVED: "green",
      CLOSED: "default",
    };
    return colors[status] || "default";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: "default",
      MEDIUM: "blue",
      HIGH: "orange",
      URGENT: "red",
    };
    return colors[priority] || "default";
  };

  const columns = [
    {
      title: language === "ar" ? "رقم التذكرة" : "Ticket Number",
      dataIndex: "ticketNumber",
      key: "ticketNumber",
    },
    {
      title: language === "ar" ? "الموضوع" : "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: language === "ar" ? "الفئة" : "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => category || "-",
    },
    {
      title: language === "ar" ? "الأولوية" : "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{priority}</Tag>
      ),
    },
    {
      title: language === "ar" ? "الحالة" : "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: language === "ar" ? "تاريخ الإنشاء" : "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: language === "ar" ? "الإجراءات" : "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedTicket(record);
              setViewModalVisible(true);
            }}
          >
            {language === "ar" ? "عرض" : "View"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen pb-8 dashboard-bg">
      {/* Modern Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-br from-olive-green-100/40 to-turquoise-100/40 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-tr from-teal-100/40 to-olive-green-100/40 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 relative z-10">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3">
            {language === "ar" ? "تذاكر الدعم الفني" : "Support Tickets"}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            {language === "ar"
              ? "إنشاء ومتابعة تذاكر الدعم الفني"
              : "Create and track support tickets"}
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          className="bg-olive-green-600 hover:bg-olive-green-700 border-0 shadow-professional"
          onClick={() => setCreateModalVisible(true)}
        >
          {language === "ar" ? "إنشاء تذكرة جديدة" : "Create New Ticket"}
        </Button>
      </div>

      <Card className="glass-card shadow-professional-xl rounded-2xl border-0 relative z-10">
        <Table
          columns={columns}
          dataSource={tickets}
          loading={loading}
          rowKey="id"
          locale={{
            emptyText: (
              <Empty
                description={language === "ar" ? "لا توجد تذاكر" : "No tickets"}
              />
            ),
          }}
        />
      </Card>

      {/* Create Ticket Modal */}
      <Modal
        title={language === "ar" ? "إنشاء تذكرة جديدة" : "Create New Ticket"}
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
        className="modern-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTicket}>
          <Form.Item
            name="subject"
            label={language === "ar" ? "الموضوع" : "Subject"}
            rules={[
              {
                required: true,
                message:
                  language === "ar"
                    ? "الرجاء إدخال الموضوع"
                    : "Please enter subject",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="category"
            label={language === "ar" ? "الفئة" : "Category"}
          >
            <Select>
              <Option value="technical">
                {language === "ar" ? "تقني" : "Technical"}
              </Option>
              <Option value="billing">
                {language === "ar" ? "مالي" : "Billing"}
              </Option>
              <Option value="general">
                {language === "ar" ? "عام" : "General"}
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label={language === "ar" ? "الأولوية" : "Priority"}
            initialValue="MEDIUM"
          >
            <Select>
              <Option value="LOW">
                {language === "ar" ? "منخفضة" : "Low"}
              </Option>
              <Option value="MEDIUM">
                {language === "ar" ? "متوسطة" : "Medium"}
              </Option>
              <Option value="HIGH">
                {language === "ar" ? "عالية" : "High"}
              </Option>
              <Option value="URGENT">
                {language === "ar" ? "عاجلة" : "Urgent"}
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label={language === "ar" ? "الوصف" : "Description"}
            rules={[
              {
                required: true,
                message:
                  language === "ar"
                    ? "الرجاء إدخال الوصف"
                    : "Please enter description",
              },
            ]}
          >
            <TextArea rows={6} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {language === "ar" ? "إنشاء التذكرة" : "Create Ticket"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Ticket Modal */}
      <Modal
        title={language === "ar" ? "تفاصيل التذكرة" : "Ticket Details"}
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedTicket(null);
        }}
        footer={null}
        width={800}
        className="modern-modal"
      >
        {selectedTicket && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item
                label={language === "ar" ? "رقم التذكرة" : "Ticket Number"}
              >
                {selectedTicket.ticketNumber}
              </Descriptions.Item>
              <Descriptions.Item
                label={language === "ar" ? "الحالة" : "Status"}
              >
                <Tag color={getStatusColor(selectedTicket.status)}>
                  {selectedTicket.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={language === "ar" ? "الأولوية" : "Priority"}
              >
                <Tag color={getPriorityColor(selectedTicket.priority)}>
                  {selectedTicket.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={language === "ar" ? "الفئة" : "Category"}
              >
                {selectedTicket.category || "-"}
              </Descriptions.Item>
              <Descriptions.Item
                label={language === "ar" ? "الموضوع" : "Subject"}
                span={2}
              >
                {selectedTicket.subject}
              </Descriptions.Item>
              <Descriptions.Item
                label={language === "ar" ? "الوصف" : "Description"}
                span={2}
              >
                {selectedTicket.description}
              </Descriptions.Item>
            </Descriptions>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {language === "ar" ? "التعليقات" : "Comments"}
                </h3>
                <Button
                  type="primary"
                  icon={<MessageOutlined />}
                  onClick={() => setCommentModalVisible(true)}
                >
                  {language === "ar" ? "إضافة تعليق" : "Add Comment"}
                </Button>
              </div>

              <Timeline
                items={
                  selectedTicket.comments?.map((comment) => ({
                    key: comment.id,
                    children: (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold">
                            {comment.user?.email}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {dayjs(comment.createdAt).format(
                              "YYYY-MM-DD HH:mm"
                            )}
                          </span>
                        </div>
                        <p>{comment.comment || comment.content}</p>
                      </div>
                    ),
                  })) || []
                }
              />
              {(!selectedTicket.comments ||
                selectedTicket.comments.length === 0) && (
                <Empty
                  description={
                    language === "ar" ? "لا توجد تعليقات" : "No comments"
                  }
                />
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Comment Modal */}
      <Modal
        title={language === "ar" ? "إضافة تعليق" : "Add Comment"}
        open={commentModalVisible}
        onCancel={() => {
          setCommentModalVisible(false);
          commentForm.resetFields();
        }}
        footer={null}
        className="modern-modal"
      >
        <Form form={commentForm} layout="vertical" onFinish={handleAddComment}>
          <Form.Item
            name="content"
            label={language === "ar" ? "التعليق" : "Comment"}
            rules={[
              {
                required: true,
                message:
                  language === "ar"
                    ? "الرجاء إدخال التعليق"
                    : "Please enter comment",
              },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {language === "ar" ? "إضافة التعليق" : "Add Comment"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConsultantSupportTickets;
