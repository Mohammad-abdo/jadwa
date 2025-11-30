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
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
            {t('reports')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'ar'
              ? 'تقارير وتحليلات اقتصادية شاملة ومحدثة'
              : 'Comprehensive and up-to-date economic reports and analyses'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl group"
              styles={{ body: { padding: '0' } }}
              hoverable
              cover={
                <div className="relative h-64 overflow-hidden">
                  <img
                    alt={report.title}
                    src={report.image}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#1a4d3a] px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {report.category}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              }
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <FileTextOutlined className="text-[#1a4d3a] text-xl mr-2" />
                  <span className="text-sm text-gray-500 font-medium">{report.category}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 min-h-[56px]">{report.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed min-h-[72px]">{report.description}</p>
                <div className="flex gap-3">
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    className="bg-gradient-to-r from-[#1a4d3a] to-[#2d5f4f] hover:from-[#153d2d] hover:to-[#1a4d3a] border-0 flex-1 font-semibold shadow-md hover:shadow-lg transition-all"
                    onClick={() => navigate(`/reports/${report.id}`)}
                  >
                    {language === 'ar' ? 'عرض' : 'View'}
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    className="border-2 border-[#1a4d3a] text-[#1a4d3a] hover:bg-[#1a4d3a] hover:text-white font-semibold transition-all"
                  >
                    {language === 'ar' ? 'تحميل' : 'Download'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            size="large"
            type="primary"
            className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#c9a227] hover:to-[#e6c93d] border-0 text-[#1a4d3a] h-14 px-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
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

