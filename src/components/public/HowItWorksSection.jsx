import React from 'react'
import { Card, Steps } from 'antd'
import { CheckCircleOutlined, CalendarOutlined, CreditCardOutlined, FileTextOutlined } from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'

const HowItWorksSection = () => {
  const { language } = useLanguage()

  const steps = [
    {
      title: language === 'ar' ? 'اختر نوع الاستشارة' : 'Choose Service Type',
      description: language === 'ar' 
        ? 'اقتصادية – مالية – إدارية – دراسة جدوى – تحليل قياسي'
        : 'Economic – Financial – Administrative – Feasibility Study – Econometric Analysis',
      icon: <CheckCircleOutlined className="text-3xl" />,
    },
    {
      title: language === 'ar' ? 'احجز موعدك' : 'Book Your Appointment',
      description: language === 'ar'
        ? 'عبر الجلسة المرئية أو الدردشة أو الطلب الكتابي'
        : 'Via video session, chat, or written request',
      icon: <CalendarOutlined className="text-3xl" />,
    },
    {
      title: language === 'ar' ? 'قم بالدفع الإلكتروني' : 'Make Payment',
      description: language === 'ar'
        ? 'باستخدام مدى أو Apple Pay أو البطاقة الائتمانية'
        : 'Using Mada, Apple Pay, or credit card',
      icon: <CreditCardOutlined className="text-3xl" />,
    },
    {
      title: language === 'ar' ? 'احصل على تقريرك' : 'Get Your Report',
      description: language === 'ar'
        ? 'عبر لوحة التحكم الخاصة بك أو البريد الإلكتروني'
        : 'Via your dashboard or email',
      icon: <FileTextOutlined className="text-3xl" />,
    },
  ]

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
            {language === 'ar' ? 'آلية العمل في المنصة' : 'How It Works'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'ar'
              ? 'خطوات بسيطة للحصول على استشارة متخصصة'
              : 'Simple steps to get specialized consultation'}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Steps
            direction={language === 'ar' ? 'horizontal' : 'horizontal'}
            current={-1}
            items={steps.map((step, index) => ({
              title: (
                <div className={`${language === 'ar' ? 'text-right' : 'text-left'} mt-4`}>
                  <div className="text-xl font-bold text-gray-900 mb-2">{step.title}</div>
                  <div className="text-gray-600 text-sm">{step.description}</div>
                </div>
              ),
              icon: (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1a4d3a] to-[#2d5f4f] flex items-center justify-center text-white shadow-lg">
                  {step.icon}
                </div>
              ),
              status: 'finish',
            }))}
            className="mb-12"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl text-center"
              styles={{ body: { padding: '32px' } }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1a4d3a] to-[#2d5f4f] flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
                {step.icon}
              </div>
              <div className="text-3xl font-bold text-[#1a4d3a] mb-3">{index + 1}</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection

