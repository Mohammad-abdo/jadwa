import React from 'react'
import { Button } from 'antd'
import { ArrowLeftOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'

const HeroSection = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()

  return (
    <div className="relative min-h-[650px] md:min-h-[800px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920)',
          filter: 'brightness(0.4)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a4d3a]/90 via-[#2d5f4f]/85 to-[#1a4d3a]/90" />
      </div>

      {/* Content */}
      <div className={`relative z-10 max-w-7xl mx-auto px-4 md:px-8 ${language === 'ar' ? 'text-right' : 'text-left'} text-white`}>
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight tracking-tight animate-fade-in-down">
            {language === 'ar' 
              ? 'نحو قرارات اقتصادية أكثر جدوى'
              : 'Towards More Viable Economic Decisions'}
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-10 text-gray-100 leading-relaxed font-light animate-fade-in-up animate-delay-200">
            {language === 'ar'
              ? 'منصة استشارية متكاملة تقدم حلولاً اقتصادية وإدارية ومالية قائمة على التحليل الكمي والقياس العلمي، لتساعد الشركات والأفراد والجهات الحكومية على اتخاذ قرارات أكثر دقة وكفاءة'
              : 'An integrated consulting platform offering economic, administrative, and financial solutions based on quantitative analysis and scientific measurement, helping companies, individuals, and government entities make more accurate and efficient decisions'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center animate-fade-in-up animate-delay-400">
            <Button
              type="primary"
              size="large"
              className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#c9a227] hover:to-[#e6c93d] border-0 h-14 px-10 text-lg font-semibold text-[#1a4d3a] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse-once"
              icon={language === 'ar' ? <ArrowLeftOutlined /> : <PlayCircleOutlined />}
              onClick={() => navigate('/register')}
            >
              {language === 'ar' ? 'احجز استشارة الآن' : 'Book a Consultation Now'}
            </Button>
            <Button
              size="large"
              className="bg-transparent hover:bg-white/10 border-2 border-white text-white h-14 px-10 text-lg font-semibold backdrop-blur-sm hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-300 hover-scale"
              onClick={() => navigate('/services')}
            >
              {language === 'ar' ? 'تعرف على خدماتنا' : 'Learn More About Our Services'}
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/95 to-transparent" />
    </div>
  )
}

export default HeroSection

