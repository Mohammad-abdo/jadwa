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
  RightOutlined,
  ArrowLeftOutlined,
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
      'ECONOMIC': <BarChartOutlined />,
      'ADMINISTRATIVE': <TeamOutlined />,
      'FINANCIAL_ACCOUNTING': <DollarOutlined />,
      'ANALYSIS_REPORTS': <FileTextOutlined />,
      'FIELD_SURVEY': <SearchOutlined />,
      'DIGITAL_CUSTOMER': <VideoCameraOutlined />,
    }
    return iconMap[category] || <FolderOutlined />
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
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in-down">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 text-gray-900">
            {t('services')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            {language === 'ar'
              ? 'نقدم مجموعة شاملة من الخدمات الاستشارية المتخصصة'
              : 'We offer a comprehensive range of specialized consulting services'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12 sm:py-16 md:py-20">
            <Spin size="large" />
          </div>
        ) : services.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {services.slice(0, 4).map((service, index) => (
                <Card
                  key={service.id}
                  className={`h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-xl sm:rounded-2xl overflow-hidden group hover-lift card-entrance flex flex-col`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  styles={{ body: { padding: '20px 16px', display: 'flex', flexDirection: 'column', flex: 1 } }}
                >
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-gray-900 min-h-[48px] sm:min-h-[56px]">
                    {language === 'ar' ? service.titleAr || service.title : service.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed min-h-[60px] sm:min-h-[72px] line-clamp-3 flex-grow">
                    {language === 'ar' ? service.descriptionAr || service.description : service.description}
                  </p>
                  {service.price && service.price > 0 && (
                    <div className="mb-3 sm:mb-4 text-[#1a4d3a] font-bold text-base sm:text-lg">
                      {service.price} {language === 'ar' ? 'ريال' : 'SAR'}
                    </div>
                  )}
                  <Button
                    type="primary"
                    className="w-full bg-gradient-to-r from-[#1a4d3a] to-[#2d5f4f] hover:from-[#153d2d] hover:to-[#1a4d3a] border-0 h-10 sm:h-11 font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 mb-4"
                    onClick={() => navigate('/services')}
                  >
                    {language === 'ar' ? 'طلب عرض تجريبي' : 'Request Demo'}
                  </Button>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${getColor(service.category)} flex items-center justify-center text-white mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg text-xl sm:text-2xl`}>
                    {getIcon(service.category)}
                  </div>
                </Card>
              ))}
            </div>
            {services.length > 4 && (
              <div className="text-center mt-8 sm:mt-10 md:mt-12">
                <Button
                  type="primary"
                  size="large"
                  className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#c9a227] hover:to-[#e6c93d] border-0 text-[#1a4d3a] h-12 sm:h-14 px-8 sm:px-10 md:px-12 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  icon={language === 'ar' ? <ArrowLeftOutlined /> : <RightOutlined />}
                  onClick={() => navigate('/services')}
                >
                  {language === 'ar' ? 'عرض جميع الخدمات' : 'Show All Services'}
                </Button>
              </div>
            )}
          </>
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

