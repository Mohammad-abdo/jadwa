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
    <section className="py-20 md:py-28 bg-gradient-to-br from-[#f0f7f4] to-[#e8f5f0]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
            {t('smartPlatform')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'ar'
              ? 'منصة ذكية تجمع بين التكنولوجيا والخبرة الاستشارية'
              : 'A smart platform that combines technology and consulting expertise'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl"
              styles={{ body: { padding: '40px 32px' } }}
            >
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mx-auto mb-6 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SmartPlatformSection

