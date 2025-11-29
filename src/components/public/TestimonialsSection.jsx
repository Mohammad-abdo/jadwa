import React from 'react'
import { Card, Rate, Avatar } from 'antd'
import { MessageOutlined } from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'

const TestimonialsSection = () => {
  const { t, language } = useLanguage()

  const testimonials = [
    {
      id: 1,
      name: language === 'ar' ? 'أحمد السالم' : 'Ahmed Al-Salem',
      company: language === 'ar' ? 'شركة الاستثمار المتقدم' : 'Advanced Investment Co.',
      rating: 5,
      text: language === 'ar'
        ? 'خدمة ممتازة ومستشارون محترفون. ساعدونا في اتخاذ قرارات استثمارية مدروسة.'
        : 'Excellent service and professional consultants. Helped us make informed investment decisions.',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    {
      id: 2,
      name: language === 'ar' ? 'فاطمة النور' : 'Fatima Al-Noor',
      company: language === 'ar' ? 'مجموعة الأعمال الحديثة' : 'Modern Business Group',
      rating: 5,
      text: language === 'ar'
        ? 'دراسة الجدوى التي قدمتها المنصة كانت شاملة ودقيقة. أنصح بها بشدة.'
        : 'The feasibility study provided by the platform was comprehensive and accurate. Highly recommended.',
      avatar: 'https://i.pravatar.cc/150?img=47',
    },
    {
      id: 3,
      name: language === 'ar' ? 'خالد المطيري' : 'Khaled Al-Mutairi',
      company: language === 'ar' ? 'مؤسسة التطوير الاقتصادي' : 'Economic Development Foundation',
      rating: 4,
      text: language === 'ar'
        ? 'التحليلات الاقتصادية المقدمة ساعدتنا في فهم السوق بشكل أفضل.'
        : 'The economic analyses provided helped us understand the market better.',
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

