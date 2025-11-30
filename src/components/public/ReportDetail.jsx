import React, { useState, useEffect } from 'react'
import { Card, Button, Spin, message, Descriptions, Tag, Space } from 'antd'
import { ArrowLeftOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { reportAPI } from '../../services/api'

const ReportDetail = ({ reportId }) => {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (reportId) {
      fetchReport()
    }
  }, [reportId])

  const fetchReport = async () => {
    try {
      setLoading(true)
      // This is for article-type reports, not booking reports
      // For now, just show a placeholder or redirect
      // TODO: Implement article-type reports management from admin dashboard
      message.info(language === 'ar' ? 'هذه الصفحة قيد التطوير' : 'This page is under development')
      navigate('/reports')
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل تحميل التقرير' : 'Failed to load report'))
      navigate('/reports')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <p>{language === 'ar' ? 'التقرير غير موجود' : 'Report not found'}</p>
          <Button onClick={() => navigate('/reports')}>
            {language === 'ar' ? 'العودة' : 'Go Back'}
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/reports')}
          className="mb-6"
        >
          {language === 'ar' ? 'العودة' : 'Back'}
        </Button>

        <Card className="shadow-lg">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{report.title}</h1>
            <Space wrap>
              <Tag color="blue">{report.reportType}</Tag>
              <Tag color={report.status === 'APPROVED' ? 'green' : 'orange'}>
                {report.status}
              </Tag>
            </Space>
          </div>

          {report.summary && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {language === 'ar' ? 'ملخص' : 'Summary'}
              </h2>
              <p className="text-gray-700">{report.summary}</p>
            </div>
          )}

          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            {report.booking && (
              <>
                <Descriptions.Item label={language === 'ar' ? 'الحجز' : 'Booking'}>
                  {report.booking.id}
                </Descriptions.Item>
                {report.booking.service && (
                  <Descriptions.Item label={language === 'ar' ? 'الخدمة' : 'Service'}>
                    {language === 'ar' ? report.booking.service.titleAr : report.booking.service.title}
                  </Descriptions.Item>
                )}
              </>
            )}
            {report.createdAt && (
              <Descriptions.Item label={language === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}>
                {new Date(report.createdAt).toLocaleDateString()}
              </Descriptions.Item>
            )}
          </Descriptions>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            {report.pdfUrl && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                size="large"
                className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
                href={report.pdfUrl}
                download
              >
                {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
              </Button>
            )}
            {report.wordUrl && (
              <Button
                icon={<FileTextOutlined />}
                size="large"
                href={report.wordUrl}
                download
              >
                {language === 'ar' ? 'تحميل Word' : 'Download Word'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ReportDetail

