import React from 'react'
import { Card, Button, Avatar, Rate } from 'antd'
import { UserOutlined, RightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'

const ConsultantsSection = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()

  const consultants = [
    {
      id: 1,
      name: language === 'ar' ? 'د. أحمد محمد' : 'Dr. Ahmed Mohammed',
      specialty: language === 'ar' ? 'استشارات اقتصادية' : 'Economic Consulting',
      rating: 4.8,
      image: 'https://i.pravatar.cc/150?img=12',
    },
    {
      id: 2,
      name: language === 'ar' ? 'د. فاطمة العلي' : 'Dr. Fatima Al-Ali',
      specialty: language === 'ar' ? 'دراسات الجدوى' : 'Feasibility Studies',
      rating: 4.9,
      image: 'https://i.pravatar.cc/150?img=47',
    },
    {
      id: 3,
      name: language === 'ar' ? 'د. خالد السعيد' : 'Dr. Khaled Al-Saeed',
      specialty: language === 'ar' ? 'التحليل الاقتصادي' : 'Economic Analysis',
      rating: 4.7,
      image: 'https://i.pravatar.cc/150?img=33',
    },
    {
      id: 4,
      name: language === 'ar' ? 'د. سارة أحمد' : 'Dr. Sara Ahmed',
      specialty: language === 'ar' ? 'الاستشارات المالية' : 'Financial Consulting',
      rating: 4.9,
      image: 'https://i.pravatar.cc/150?img=20',
    },
    {
      id: 5,
      name: language === 'ar' ? 'د. محمد حسن' : 'Dr. Mohammed Hassan',
      specialty: language === 'ar' ? 'الاستثمار والتخطيط' : 'Investment & Planning',
      rating: 4.8,
      image: 'https://i.pravatar.cc/150?img=51',
    },
    {
      id: 6,
      name: language === 'ar' ? 'د. نورا العبدالله' : 'Dr. Nora Al-Abdullah',
      specialty: language === 'ar' ? 'التحليل القياسي' : 'Econometric Analysis',
      rating: 4.6,
      image: 'https://i.pravatar.cc/150?img=45',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">{t('ourConsultants')}</h2>
          <p className="section-subtitle">
            {language === 'ar'
              ? 'فريق من المستشارين المتخصصين ذوي الخبرة الواسعة'
              : 'A team of specialized consultants with extensive experience'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {consultants.map((consultant) => (
            <Card
              key={consultant.id}
              className="card text-center"
              variant="borderless"
              hoverable
            >
              <Avatar
                size={100}
                src={consultant.image}
                icon={<UserOutlined />}
                className="mb-4"
              />
              <h3 className="text-xl font-bold mb-2">{consultant.name}</h3>
              <p className="text-turquoise-600 mb-3">{consultant.specialty}</p>
              <Rate disabled defaultValue={consultant.rating} allowHalf className="mb-4" />
              <Button
                type="primary"
                className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
                onClick={() => navigate(`/consultants/${consultant.id}`)}
              >
                {language === 'ar' ? 'عرض الملف الشخصي' : 'View Profile'}
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            size="large"
            type="primary"
            className="bg-turquoise-500 hover:bg-turquoise-600 border-0 h-12 px-8"
            icon={language === 'ar' ? <RightOutlined /> : <RightOutlined />}
            onClick={() => navigate('/consultants')}
          >
            {t('viewAllConsultants')}
          </Button>
        </div>
      </div>
    </section>
  )
}

export default ConsultantsSection

