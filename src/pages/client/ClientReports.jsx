import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, message, Spin, Descriptions, Modal, Typography } from 'antd'
import { DownloadOutlined, EyeOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { reportAPI } from '../../services/api'
import dayjs from 'dayjs'

const { Text, Paragraph } = Typography

const ClientReports = () => {
  const { language } = useLanguage()
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    fetchReports()
  }, [bookingId])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = {}
      if (bookingId) params.bookingId = bookingId
      const response = await reportAPI.getReports(params)
      setReports(response.reports || [])
    } catch (err) {
      console.error('Error fetching reports:', err)
      message.error(language === 'ar' ? 'فشل تحميل التقارير' : 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (url, filename) => {
    if (!url) {
      message.warning(language === 'ar' ? 'الملف غير متوفر' : 'File not available')
      return
    }
    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = filename || 'report.pdf'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success(language === 'ar' ? 'جاري تحميل الملف...' : 'Downloading file...')
  }

  const columns = [
    {
      title: language === 'ar' ? 'عنوان التقرير' : 'Report Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: language === 'ar' ? 'نوع التقرير' : 'Report Type',
      dataIndex: 'reportType',
      key: 'reportType',
      render: (type) => {
        const labels = {
          FEASIBILITY_STUDY: language === 'ar' ? 'دراسة جدوى' : 'Feasibility Study',
          ECONOMIC_ANALYSIS: language === 'ar' ? 'تحليل اقتصادي' : 'Economic Analysis',
          FINANCIAL_REPORT: language === 'ar' ? 'تقرير مالي' : 'Financial Report',
          CONSULTATION_SUMMARY: language === 'ar' ? 'ملخص استشارة' : 'Consultation Summary',
        }
        return <Tag color="blue">{labels[type] || type}</Tag>
      },
    },
    {
      title: language === 'ar' ? 'المستشار' : 'Consultant',
      key: 'consultant',
      render: (_, record) => {
        if (record.consultant) {
          return `${record.consultant.firstName || ''} ${record.consultant.lastName || ''}`.trim()
        }
        if (record.booking?.consultant) {
          return `${record.booking.consultant.firstName || ''} ${record.booking.consultant.lastName || ''}`.trim()
        }
        return '-'
      },
    },
    {
      title: language === 'ar' ? 'تاريخ الرفع' : 'Upload Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          DRAFT: 'default',
          UNDER_REVIEW: 'processing',
          APPROVED: 'success',
          REJECTED: 'error',
          COMPLETED: 'success',
        }
        const labels = {
          DRAFT: language === 'ar' ? 'مسودة' : 'Draft',
          UNDER_REVIEW: language === 'ar' ? 'قيد المراجعة' : 'Under Review',
          APPROVED: language === 'ar' ? 'موافق عليه' : 'Approved',
          REJECTED: language === 'ar' ? 'مرفوض' : 'Rejected',
          COMPLETED: language === 'ar' ? 'مكتمل' : 'Completed',
        }
        return (
          <Tag color={colors[status] || 'default'} icon={status === 'APPROVED' || status === 'COMPLETED' ? <CheckCircleOutlined /> : status === 'UNDER_REVIEW' ? <ClockCircleOutlined /> : <CloseCircleOutlined />}>
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
          {(record.status === 'APPROVED' || record.status === 'COMPLETED') && (
            <>
              {record.pdfUrl && (
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
                  onClick={() => handleDownload(record.pdfUrl, `${record.title || 'report'}.pdf`)}
                >
                  {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
                </Button>
              )}
              {record.wordUrl && (
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(record.wordUrl, `${record.title || 'report'}.docx`)}
                >
                  {language === 'ar' ? 'تحميل Word' : 'Download Word'}
                </Button>
              )}
            </>
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
            {language === 'ar' ? 'التقارير' : 'Reports'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            {language === 'ar' 
              ? 'عرض وتحميل التقارير المرفوعة من المستشارين' 
              : 'View and download reports uploaded by consultants'}
          </p>
        </div>
      </div>

      <Card className="glass-card shadow-professional-xl rounded-2xl border-0 relative z-10">
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: language === 'ar' ? 'لا توجد تقارير متاحة' : 'No reports available',
          }}
        />
      </Card>

      {/* View Report Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-olive-green-600" />
            <span>{language === 'ar' ? 'تفاصيل التقرير' : 'Report Details'}</span>
          </div>
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false)
          setSelectedReport(null)
        }}
        footer={(() => {
          const buttons = [
            <Button key="close" onClick={() => {
              setViewModalVisible(false)
              setSelectedReport(null)
            }}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          ]
          
          if (selectedReport && (selectedReport.status === 'APPROVED' || selectedReport.status === 'COMPLETED')) {
            if (selectedReport.pdfUrl) {
              buttons.push(
                <Button
                  key="pdf"
                  type="primary"
                  icon={<DownloadOutlined />}
                  className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
                  onClick={() => handleDownload(selectedReport.pdfUrl, `${selectedReport.title || 'report'}.pdf`)}
                >
                  {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
                </Button>
              )
            }
            if (selectedReport.wordUrl) {
              buttons.push(
                <Button
                  key="word"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(selectedReport.wordUrl, `${selectedReport.title || 'report'}.docx`)}
                >
                  {language === 'ar' ? 'تحميل Word' : 'Download Word'}
                </Button>
              )
            }
          }
          
          return buttons
        })()}
        width={800}
      >
        {selectedReport && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label={language === 'ar' ? 'العنوان' : 'Title'}>
              {selectedReport.title}
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'نوع التقرير' : 'Report Type'}>
              <Tag color="blue">
                {selectedReport.reportType === 'FEASIBILITY_STUDY' 
                  ? (language === 'ar' ? 'دراسة جدوى' : 'Feasibility Study')
                  : selectedReport.reportType === 'ECONOMIC_ANALYSIS'
                  ? (language === 'ar' ? 'تحليل اقتصادي' : 'Economic Analysis')
                  : selectedReport.reportType === 'FINANCIAL_REPORT'
                  ? (language === 'ar' ? 'تقرير مالي' : 'Financial Report')
                  : (language === 'ar' ? 'ملخص استشارة' : 'Consultation Summary')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'المستشار' : 'Consultant'}>
              {selectedReport.consultant 
                ? `${selectedReport.consultant.firstName || ''} ${selectedReport.consultant.lastName || ''}`.trim()
                : selectedReport.booking?.consultant
                ? `${selectedReport.booking.consultant.firstName || ''} ${selectedReport.booking.consultant.lastName || ''}`.trim()
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={language === 'ar' ? 'الحالة' : 'Status'}>
              <Tag color={
                selectedReport.status === 'APPROVED' || selectedReport.status === 'COMPLETED' ? 'success' :
                selectedReport.status === 'UNDER_REVIEW' ? 'processing' :
                selectedReport.status === 'REJECTED' ? 'error' : 'default'
              }>
                {selectedReport.status === 'APPROVED' 
                  ? (language === 'ar' ? 'موافق عليه' : 'Approved')
                  : selectedReport.status === 'COMPLETED'
                  ? (language === 'ar' ? 'مكتمل' : 'Completed')
                  : selectedReport.status === 'UNDER_REVIEW'
                  ? (language === 'ar' ? 'قيد المراجعة' : 'Under Review')
                  : selectedReport.status === 'REJECTED'
                  ? (language === 'ar' ? 'مرفوض' : 'Rejected')
                  : (language === 'ar' ? 'مسودة' : 'Draft')}
              </Tag>
            </Descriptions.Item>
            {selectedReport.summary && (
              <Descriptions.Item label={language === 'ar' ? 'ملخص' : 'Summary'}>
                <Paragraph>{selectedReport.summary}</Paragraph>
              </Descriptions.Item>
            )}
            <Descriptions.Item label={language === 'ar' ? 'تاريخ الرفع' : 'Upload Date'}>
              {dayjs(selectedReport.createdAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            {selectedReport.updatedAt && (
              <Descriptions.Item label={language === 'ar' ? 'آخر تحديث' : 'Last Updated'}>
                {dayjs(selectedReport.updatedAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default ClientReports

