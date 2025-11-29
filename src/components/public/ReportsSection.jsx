import React from 'react'
import { Card, Button } from 'antd'
import { FileTextOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'

const ReportsSection = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()

  const reports = [
    {
      id: 1,
      title: t('saudiEconomy2025'),
      description: language === 'ar'
        ? 'تحليل شامل لاتجاهات الاقتصاد السعودي وتوقعات 2025'
        : 'Comprehensive analysis of Saudi economy trends and 2025 forecasts',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
      category: language === 'ar' ? 'تحليل اقتصادي' : 'Economic Analysis',
    },
    {
      id: 2,
      title: t('meccaProjects'),
      description: language === 'ar'
        ? 'دراسة تأثير المشاريع الضخمة في مكة المكرمة على الاقتصاد'
        : 'Study of mega projects impact in Makkah on the economy',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
      category: language === 'ar' ? 'دراسة جدوى' : 'Feasibility Study',
    },
    {
      id: 3,
      title: t('investmentIndex'),
      description: language === 'ar'
        ? 'مؤشر نشاط الاستثمار في المملكة العربية السعودية'
        : 'Investment activity index in Saudi Arabia',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      category: language === 'ar' ? 'مؤشرات' : 'Indicators',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">{t('reports')}</h2>
          <p className="section-subtitle">
            {language === 'ar'
              ? 'تقارير وتحليلات اقتصادية شاملة ومحدثة'
              : 'Comprehensive and up-to-date economic reports and analyses'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="card overflow-hidden"
              variant="borderless"
              hoverable
              cover={
                <div className="relative h-48 overflow-hidden">
                  <img
                    alt={report.title}
                    src={report.image}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-olive-green-600 text-white px-3 py-1 rounded-full text-sm">
                    {report.category}
                  </div>
                </div>
              }
            >
              <div className="flex items-center mb-3">
                <FileTextOutlined className="text-turquoise-500 text-xl ml-2" />
                <span className="text-sm text-gray-500">{report.category}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{report.title}</h3>
              <p className="text-gray-600 mb-4">{report.description}</p>
              <div className="flex gap-2">
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  className="bg-olive-green-600 hover:bg-olive-green-700 border-0 flex-1"
                  onClick={() => navigate(`/reports/${report.id}`)}
                >
                  {language === 'ar' ? 'عرض' : 'View'}
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  className="border-olive-green-600 text-olive-green-600 hover:bg-olive-green-50"
                >
                  {language === 'ar' ? 'تحميل' : 'Download'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            size="large"
            type="primary"
            className="bg-turquoise-500 hover:bg-turquoise-600 border-0 h-12 px-8"
            onClick={() => navigate('/reports')}
          >
            {t('viewAllReports')}
          </Button>
        </div>
      </div>
    </section>
  )
}

export default ReportsSection

