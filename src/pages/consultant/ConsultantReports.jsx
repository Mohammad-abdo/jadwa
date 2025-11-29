import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, message, Upload, Modal, Form, Input, Select, Descriptions, Image, Typography } from 'antd'
import { UploadOutlined, EyeOutlined, DownloadOutlined, FileTextOutlined, PlusOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { reportAPI, bookingsAPI } from '../../services/api'
import dayjs from 'dayjs'

const { Text, Paragraph } = Typography

const { TextArea } = Input

const ConsultantReports = () => {
  const { t, language } = useLanguage()
  const [reports, setReports] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchReports()
    fetchBookingsForReport()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await reportAPI.getReports()
      const formattedReports = response.reports.map(report => ({
        id: report.id,
        title: report.title,
        client: report.client 
          ? `${report.client.firstName} ${report.client.lastName}`
          : language === 'ar' ? 'غير متوفر' : 'N/A',
        date: dayjs(report.createdAt).format('YYYY-MM-DD'),
        status: report.status,
        reportType: report.reportType,
        pdfUrl: report.pdfUrl,
        wordUrl: report.wordUrl,
      }))
      setReports(formattedReports)
    } catch (err) {
      console.error('Error fetching reports:', err)
      message.error(language === 'ar' ? 'فشل تحميل التقارير' : 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const fetchBookingsForReport = async () => {
    try {
      const response = await bookingsAPI.getBookings({ status: 'COMPLETED' })
      setBookings((response.bookings || []).filter(b => !b.report))
    } catch (err) {
      console.error('Error fetching bookings:', err)
    }
  }

  const handleUploadReport = async (values) => {
    try {
      if (!selectedBooking && !values.bookingId) {
        message.error(language === 'ar' ? 'يرجى اختيار حجز' : 'Please select a booking')
        return
      }
      
      const bookingId = selectedBooking?.id || values.bookingId
      
      const formData = new FormData()
      if (values.pdf && values.pdf.fileList && values.pdf.fileList[0]) {
        formData.append('pdf', values.pdf.fileList[0].originFileObj)
      }
      if (values.word && values.word.fileList && values.word.fileList[0]) {
        formData.append('word', values.word.fileList[0].originFileObj)
      }
      formData.append('bookingId', bookingId)
      formData.append('title', values.title)
      formData.append('reportType', values.reportType)
      if (values.summary) {
        formData.append('summary', values.summary)
      }

      await reportAPI.uploadReport(formData)
      message.success(language === 'ar' ? 'تم رفع التقرير بنجاح' : 'Report uploaded successfully')
      setUploadModalVisible(false)
      form.resetFields()
      setSelectedBooking(null)
      fetchReports()
      fetchBookingsForReport()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل رفع التقرير' : 'Failed to upload report'))
    }
  }

  const columns = [
    {
      title: language === 'ar' ? 'عنوان التقرير' : 'Report Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: language === 'ar' ? 'العميل' : 'Client',
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: language === 'ar' ? 'النوع' : 'Type',
      dataIndex: 'reportType',
      key: 'reportType',
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
          UNDER_REVIEW: 'orange',
          APPROVED: 'green',
          REJECTED: 'red',
        }
        const labels = {
          UNDER_REVIEW: language === 'ar' ? 'قيد المراجعة' : 'Under Review',
          APPROVED: language === 'ar' ? 'موافق عليه' : 'Approved',
          REJECTED: language === 'ar' ? 'مرفوض' : 'Rejected',
        }
        const icons = {
          UNDER_REVIEW: <ClockCircleOutlined />,
          APPROVED: <CheckCircleOutlined />,
          REJECTED: <CloseCircleOutlined />,
        }
        return (
          <Tag color={colors[status]} icon={icons[status]}>
            {labels[status] || status}
          </Tag>
        )
      },
    },
    {
      title: language === 'ar' ? 'الإجراءات' : 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedReport(record)
              setViewModalVisible(true)
            }}
          >
            {language === 'ar' ? 'معاينة' : 'Preview'}
          </Button>
          {record.pdfUrl && (
            <Button
              icon={<DownloadOutlined />}
              onClick={() => window.open(record.pdfUrl, '_blank')}
            >
              {language === 'ar' ? 'PDF' : 'PDF'}
            </Button>
          )}
          {record.wordUrl && (
            <Button
              icon={<DownloadOutlined />}
              onClick={() => window.open(record.wordUrl, '_blank')}
            >
              {language === 'ar' ? 'Word' : 'Word'}
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-olive-green-600 to-turquoise-500 bg-clip-text text-transparent mb-2">
            {language === 'ar' ? 'التقارير' : 'Reports'}
          </h1>
          <p className="text-gray-500">
            {language === 'ar' ? 'إدارة وتحميل التقارير' : 'Manage and upload reports'}
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
          onClick={() => {
            form.resetFields()
            setUploadModalVisible(true)
          }}
        >
          {language === 'ar' ? 'رفع تقرير جديد' : 'Upload New Report'}
        </Button>
      </div>

      <Card className="shadow-lg rounded-xl border-0">
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => (language === 'ar' ? `إجمالي ${total} تقرير` : `Total ${total} reports`)
          }}
        />
      </Card>

      <Modal
        title={language === 'ar' ? 'رفع تقرير جديد' : 'Upload New Report'}
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false)
          form.resetFields()
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUploadReport}
        >
          <Form.Item
            name="bookingId"
            label={language === 'ar' ? 'اختر الحجز' : 'Select Booking'}
            rules={[{ required: true, message: language === 'ar' ? 'يرجى اختيار حجز' : 'Please select a booking' }]}
          >
            <Select
              placeholder={language === 'ar' ? 'اختر الحجز' : 'Select booking'}
              onChange={(value) => {
                const booking = bookings.find(b => b.id === value)
                setSelectedBooking(booking)
                form.setFieldValue('bookingId', value)
              }}
            >
              {bookings.map(booking => (
                <Select.Option key={booking.id} value={booking.id}>
                  {booking.client ? `${booking.client.firstName} ${booking.client.lastName}` : booking.id} - {booking.service ? (language === 'ar' ? booking.service.titleAr : booking.service.title) : ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="title"
            label={language === 'ar' ? 'عنوان التقرير' : 'Report Title'}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="reportType"
            label={language === 'ar' ? 'نوع التقرير' : 'Report Type'}
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="FEASIBILITY_STUDY">{language === 'ar' ? 'دراسة جدوى' : 'Feasibility Study'}</Select.Option>
              <Select.Option value="ECONOMIC_ANALYSIS">{language === 'ar' ? 'تحليل اقتصادي' : 'Economic Analysis'}</Select.Option>
              <Select.Option value="FINANCIAL_REPORT">{language === 'ar' ? 'تقرير مالي' : 'Financial Report'}</Select.Option>
              <Select.Option value="CONSULTATION_SUMMARY">{language === 'ar' ? 'ملخص استشارة' : 'Consultation Summary'}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="summary"
            label={language === 'ar' ? 'ملخص التقرير' : 'Report Summary'}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="pdf"
            label={language === 'ar' ? 'ملف PDF' : 'PDF File'}
            rules={[{ required: true, message: language === 'ar' ? 'يرجى رفع ملف PDF' : 'Please upload PDF file' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".pdf"
            >
              <Button icon={<UploadOutlined />}>{language === 'ar' ? 'اختر ملف PDF' : 'Select PDF File'}</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="word"
            label={language === 'ar' ? 'ملف Word (اختياري)' : 'Word File (Optional)'}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".doc,.docx"
            >
              <Button icon={<UploadOutlined />}>{language === 'ar' ? 'اختر ملف Word' : 'Select Word File'}</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" className="bg-olive-green-600">
                {language === 'ar' ? 'رفع' : 'Upload'}
              </Button>
              <Button onClick={() => {
                setUploadModalVisible(false)
                form.resetFields()
              }}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </Space>
          </Form.Item>
          </Form>
        </Modal>

        {/* Report Preview Modal */}
        <Modal
          title={language === 'ar' ? 'معاينة التقرير' : 'Report Preview'}
          open={viewModalVisible}
          onCancel={() => {
            setViewModalVisible(false)
            setSelectedReport(null)
          }}
          footer={[
            <Button key="close" onClick={() => {
              setViewModalVisible(false)
              setSelectedReport(null)
            }}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>,
            selectedReport?.pdfUrl && (
              <Button
                key="pdf"
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => window.open(selectedReport.pdfUrl, '_blank')}
              >
                {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
              </Button>
            ),
            selectedReport?.wordUrl && (
              <Button
                key="word"
                icon={<DownloadOutlined />}
                onClick={() => window.open(selectedReport.wordUrl, '_blank')}
              >
                {language === 'ar' ? 'تحميل Word' : 'Download Word'}
              </Button>
            ),
          ]}
          width={800}
        >
          {selectedReport && (
            <div>
              <Descriptions bordered column={2} className="mb-4">
                <Descriptions.Item label={language === 'ar' ? 'عنوان التقرير' : 'Report Title'} span={2}>
                  <Text strong>{selectedReport.title}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={language === 'ar' ? 'العميل' : 'Client'}>
                  {selectedReport.client}
                </Descriptions.Item>
                <Descriptions.Item label={language === 'ar' ? 'نوع التقرير' : 'Report Type'}>
                  {selectedReport.reportType}
                </Descriptions.Item>
                <Descriptions.Item label={language === 'ar' ? 'التاريخ' : 'Date'}>
                  {selectedReport.date}
                </Descriptions.Item>
                <Descriptions.Item label={language === 'ar' ? 'الحالة' : 'Status'} span={2}>
                  <Tag
                    color={
                      selectedReport.status === 'APPROVED' ? 'green' :
                      selectedReport.status === 'REJECTED' ? 'red' : 'orange'
                    }
                    icon={
                      selectedReport.status === 'APPROVED' ? <CheckCircleOutlined /> :
                      selectedReport.status === 'REJECTED' ? <CloseCircleOutlined /> :
                      <ClockCircleOutlined />
                    }
                  >
                    {selectedReport.status === 'UNDER_REVIEW' ? (language === 'ar' ? 'قيد المراجعة' : 'Under Review') :
                     selectedReport.status === 'APPROVED' ? (language === 'ar' ? 'موافق عليه' : 'Approved') :
                     (language === 'ar' ? 'مرفوض' : 'Rejected')}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
              {selectedReport.pdfUrl && (
                <div className="mt-4">
                  <Text strong className="block mb-2">
                    {language === 'ar' ? 'معاينة PDF:' : 'PDF Preview:'}
                  </Text>
                  <iframe
                    src={selectedReport.pdfUrl}
                    style={{ width: '100%', height: '500px', border: '1px solid #d9d9d9' }}
                    title="PDF Preview"
                  />
                </div>
              )}
              {!selectedReport.pdfUrl && (
                <div className="text-center py-8 text-gray-500">
                  <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <Paragraph>
                    {language === 'ar' ? 'لا توجد معاينة متاحة' : 'No preview available'}
                  </Paragraph>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    )
  }
  
  export default ConsultantReports

