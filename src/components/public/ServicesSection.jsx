import React, { useState, useEffect } from 'react'
import { Card, Button, Spin } from 'antd'
import {
  BarChartOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  VideoCameraOutlined,
  FolderOutlined,
  TeamOutlined,
  DollarOutlined,
  SearchOutlined,
  GlobalOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { servicesAPI } from '../../services/api'

const ServicesSection = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await servicesAPI.getServices({ status: 'ACTIVE' })
      // Show first 5 services on home page, or all on services page
      setServices(response.services || [])
    } catch (err) {
      console.error('Error fetching services:', err)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  // Icon mapping based on category
  const getIcon = (category) => {
    const iconMap = {
      'ECONOMIC': <BarChartOutlined className="text-4xl" />,
      'ADMINISTRATIVE': <TeamOutlined className="text-4xl" />,
      'FINANCIAL_ACCOUNTING': <DollarOutlined className="text-4xl" />,
      'ANALYSIS_REPORTS': <FileTextOutlined className="text-4xl" />,
      'FIELD_SURVEY': <SearchOutlined className="text-4xl" />,
      'DIGITAL_CUSTOMER': <VideoCameraOutlined className="text-4xl" />,
    }
    return iconMap[category] || <FolderOutlined className="text-4xl" />
  }

  // Color mapping based on category
  const getColor = (category) => {
    const colorMap = {
      'ECONOMIC': 'from-olive-green-500 to-olive-green-600',
      'ADMINISTRATIVE': 'from-turquoise-500 to-turquoise-600',
      'FINANCIAL_ACCOUNTING': 'from-olive-green-400 to-turquoise-500',
      'ANALYSIS_REPORTS': 'from-turquoise-400 to-olive-green-500',
      'FIELD_SURVEY': 'from-olive-green-600 to-turquoise-600',
      'DIGITAL_CUSTOMER': 'from-turquoise-500 to-olive-green-500',
    }
    return colorMap[category] || 'from-olive-green-500 to-turquoise-500'
  }

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16 animate-fade-in-down">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
            {t('services')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'ar'
              ? 'نقدم مجموعة شاملة من الخدمات الاستشارية المتخصصة'
              : 'We offer a comprehensive range of specialized consulting services'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {services.slice(0, 5).map((service, index) => (
              <Card
                key={service.id}
                className={`h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden group hover-lift card-entrance`}
                style={{ animationDelay: `${index * 0.1}s` }}
                styles={{ body: { padding: '32px' } }}
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getColor(service.category)} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {getIcon(service.category)}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 min-h-[56px]">
                  {language === 'ar' ? service.titleAr || service.title : service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed min-h-[72px] line-clamp-3">
                  {language === 'ar' ? service.descriptionAr || service.description : service.description}
                </p>
                {service.price && service.price > 0 && (
                  <div className="mb-4 text-[#1a4d3a] font-bold text-lg">
                    {service.price} {language === 'ar' ? 'ريال' : 'SAR'}
                  </div>
                )}
                <Button
                  type="primary"
                  className="w-full bg-gradient-to-r from-[#1a4d3a] to-[#2d5f4f] hover:from-[#153d2d] hover:to-[#1a4d3a] border-0 h-11 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => navigate('/services')}
                >
                  {language === 'ar' ? 'طلب عرض تجريبي' : 'Request Demo'}
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {language === 'ar' ? 'لا توجد خدمات متاحة حالياً' : 'No services available at the moment'}
          </div>
        )}
      </div>
    </section>
  )
}

export default ServicesSection

