import React from 'react'
import { Card, Rate, Avatar } from 'antd'
import { MessageOutlined } from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'

const TestimonialsSection = () => {
  const { t, language } = useLanguage()

  const testimonials = [
    {
      id: 1,
      name: language === 'ar' ? 'أحد عملاء المنصة' : 'Platform Client',
      company: language === 'ar' ? 'شركة تطوير الأعمال 2025' : 'Business Development Company 2025',
      rating: 5,
      text: language === 'ar'
        ? 'خدمة متميزة تجمع بين التحليل العلمي والرؤية الاقتصادية الدقيقة.'
        : 'Distinguished service that combines scientific analysis and accurate economic vision.',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    {
      id: 2,
      name: language === 'ar' ? 'مستثمر من مكة المكرمة' : 'Investor from Makkah',
      company: language === 'ar' ? 'مستثمر' : 'Investor',
      rating: 5,
      text: language === 'ar'
        ? 'دراسة الجدوى التي حصلنا عليها من جدوى ساعدتنا في اتخاذ قرار استثماري ناجح.'
        : 'The feasibility study we obtained from Jadwa helped us make a successful investment decision.',
      avatar: 'https://i.pravatar.cc/150?img=47',
    },
    {
      id: 3,
      name: language === 'ar' ? 'أحد عملاء المنصة' : 'Platform Client',
      company: language === 'ar' ? 'شركة استثمارية' : 'Investment Company',
      rating: 5,
      text: language === 'ar'
        ? 'التحليلات الاقتصادية المقدمة ساعدتنا في فهم السوق بشكل أفضل واتخاذ قرارات مدروسة.'
        : 'The economic analyses provided helped us better understand the market and make informed decisions.',
      avatar: 'https://i.pravatar.cc/150?img=33',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">{t('testimonials')}</h2>
          <p className="section-subtitle">
            {language === 'ar'
              ? 'ماذا يقول عملاؤنا عن خدماتنا'
              : 'What our clients say about our services'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="card relative"
              variant="borderless"
            >
              <div className="text-6xl text-olive-green-200 absolute top-4 right-4 font-serif leading-none">"</div>
              <div className="mb-4">
                <Rate disabled defaultValue={testimonial.rating} className="mb-3" />
                <p className="text-gray-700 italic">{testimonial.text}</p>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse mt-6 pt-4 border-t border-gray-200">
                <Avatar src={testimonial.avatar} size={50} />
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.company}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection

