import React from 'react'
import { Button } from 'antd'
import { ArrowLeftOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'

const HeroSection = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()

  return (
    <div className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-olive-green-900/80 to-turquoise-900/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          {t('heroTitle')}
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
          {t('heroSubtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            type="primary"
            size="large"
            className="bg-turquoise-500 hover:bg-turquoise-600 border-0 h-12 px-8 text-lg"
            icon={language === 'ar' ? <ArrowLeftOutlined /> : <PlayCircleOutlined />}
            onClick={() => navigate('/login')}
          >
            {t('bookConsultation')}
          </Button>
          <Button
            size="large"
            className="bg-white/10 hover:bg-white/20 border-2 border-white text-white h-12 px-8 text-lg backdrop-blur-sm"
            onClick={() => navigate('/services')}
          >
            {t('exploreServices')}
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
    </div>
  )
}

export default HeroSection

