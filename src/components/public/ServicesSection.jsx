import React from 'react'
import { Card, Button } from 'antd'
import {
  BarChartOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  VideoCameraOutlined,
  FolderOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'

const ServicesSection = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()

  const services = [
    {
      icon: <BarChartOutlined className="text-4xl" />,
      title: t('economicConsulting'),
      description: language === 'ar'
        ? 'استشارات متخصصة في المجال الاقتصادي والاستثماري لاتخاذ قرارات مدروسة'
        : 'Specialized consultations in economics and investment for informed decision-making',
      color: 'from-olive-green-500 to-olive-green-600',
    },
    {
      icon: <FileTextOutlined className="text-4xl" />,
      title: t('feasibilityStudies'),
      description: language === 'ar'
        ? 'دراسات شاملة لتقييم جدوى المشاريع قبل البدء في التنفيذ'
        : 'Comprehensive studies to evaluate project feasibility before implementation',
      color: 'from-turquoise-500 to-turquoise-600',
    },
    {
      icon: <CalculatorOutlined className="text-4xl" />,
      title: t('economicAnalysis'),
      description: language === 'ar'
        ? 'تحليل اقتصادي وقياسي متقدم باستخدام أحدث الأدوات والمنهجيات'
        : 'Advanced economic and econometric analysis using latest tools and methodologies',
      color: 'from-olive-green-400 to-turquoise-500',
    },
    {
      icon: <VideoCameraOutlined className="text-4xl" />,
      title: t('videoConsultation'),
      description: language === 'ar'
        ? 'استشارات مباشرة عبر الفيديو أو المحادثة مع مستشارين متخصصين'
        : 'Direct consultations via video or chat with specialized consultants',
      color: 'from-turquoise-400 to-olive-green-500',
    },
    {
      icon: <FolderOutlined className="text-4xl" />,
      title: t('reportsTemplates'),
      description: language === 'ar'
        ? 'تقارير اقتصادية جاهزة وقوالب قابلة للتخصيص لمشروعك'
        : 'Ready economic reports and customizable templates for your project',
      color: 'from-olive-green-600 to-turquoise-600',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">{t('services')}</h2>
          <p className="section-subtitle">
            {language === 'ar'
              ? 'نقدم مجموعة شاملة من الخدمات الاستشارية المتخصصة'
              : 'We offer a comprehensive range of specialized consulting services'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="card hover:scale-105 transition-transform duration-300"
              variant="borderless"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-4`}>
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <Button
                type="primary"
                className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
                onClick={() => navigate('/services')}
              >
                {language === 'ar' ? 'طلب الخدمة' : 'Request Service'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection

