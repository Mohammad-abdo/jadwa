import React from 'react'
import { Card } from 'antd'
import {
  CalendarOutlined,
  DashboardOutlined,
  BankOutlined,
} from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'

const SmartPlatformSection = () => {
  const { t, language } = useLanguage()

  const features = [
    {
      icon: <CalendarOutlined className="text-4xl" />,
      title: t('instantBooking'),
      description: language === 'ar'
        ? 'احجز استشارة في أي وقت مع مستشارك المفضل بسهولة وسرعة'
        : 'Book a consultation anytime with your preferred consultant easily and quickly',
      color: 'from-olive-green-500 to-olive-green-600',
    },
    {
      icon: <DashboardOutlined className="text-4xl" />,
      title: t('dashboardReports'),
      description: language === 'ar'
        ? 'لوحة تحليلية شاملة مع تقارير مفصلة ورسوم بيانية تفاعلية'
        : 'Comprehensive analytical dashboard with detailed reports and interactive charts',
      color: 'from-turquoise-500 to-turquoise-600',
    },
    {
      icon: <BankOutlined className="text-4xl" />,
      title: t('supportSectors'),
      description: language === 'ar'
        ? 'خدمات مخصصة للقطاعين الحكومي والخاص مع حلول متكاملة'
        : 'Customized services for government and private sectors with integrated solutions',
      color: 'from-olive-green-400 to-turquoise-500',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-olive-green-50 to-turquoise-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">{t('smartPlatform')}</h2>
          <p className="section-subtitle">
            {language === 'ar'
              ? 'منصة ذكية تجمع بين التكنولوجيا والخبرة الاستشارية'
              : 'A smart platform that combines technology and consulting expertise'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="card text-center bg-white"
              variant="borderless"
            >
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mx-auto mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SmartPlatformSection

