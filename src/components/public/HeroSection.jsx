import React, { useState, useEffect } from 'react'
import { Button, Carousel } from 'antd'
import { ArrowLeftOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { slidersAPI } from '../../services/api'

const HeroSection = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [sliders, setSliders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSliders()
  }, [])

  const fetchSliders = async () => {
    try {
      setLoading(true)
      const response = await slidersAPI.getSliders({ isActive: 'true' })
      
      // Check if response has the expected structure
      if (!response || !response.sliders) {
        console.warn('Invalid slider response structure:', response)
        setSliders([])
        return
      }

      const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
      
      // Normalize image and icon URLs
      const slidersWithImages = (response.sliders || []).map(slider => {
        // Normalize image URL
        if (slider.image) {
          let imageUrl = slider.image
          const baseUrlPattern = /^https?:\/\//
          
          // If it's already a full URL, use it as is
          if (baseUrlPattern.test(imageUrl)) {
            // Check if it's a duplicate base URL (fix double URLs)
            if (imageUrl.includes(`${apiBase}${apiBase}`)) {
              imageUrl = imageUrl.replace(`${apiBase}${apiBase}`, apiBase)
            }
            slider.image = imageUrl
          } else {
            // It's a relative path, construct full URL
            imageUrl = imageUrl.startsWith('/')
              ? `${apiBase}${imageUrl}`
              : `${apiBase}/${imageUrl}`
            slider.image = imageUrl
          }
        }
        
        // Normalize icon URL
        if (slider.icon) {
          let iconUrl = slider.icon
          const baseUrlPattern = /^https?:\/\//
          
          if (baseUrlPattern.test(iconUrl)) {
            // Check if it's a duplicate base URL
            if (iconUrl.includes(`${apiBase}${apiBase}`)) {
              iconUrl = iconUrl.replace(`${apiBase}${apiBase}`, apiBase)
            }
            slider.icon = iconUrl
          } else {
            iconUrl = iconUrl.startsWith('/')
              ? `${apiBase}${iconUrl}`
              : `${apiBase}/${iconUrl}`
            slider.icon = iconUrl
          }
        }
        
        return slider
      })
      
      setSliders(slidersWithImages)
    } catch (err) {
      console.error('Error fetching sliders:', err)
      setSliders([])
    } finally {
      setLoading(false)
    }
  }

  // If no sliders, show default content
  if (!loading && sliders.length === 0) {
    return (
      <div className="relative min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] flex items-center justify-center overflow-hidden py-10 md:py-0">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920)',
            filter: 'brightness(0.3)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a4d3a]/60 via-[#2d5f4f]/50 to-[#1a4d3a]/60" />
        </div>

        {/* Content */}
        <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 ${language === 'ar' ? 'text-right' : 'text-left'} w-full`}>
          <div className="max-w-4xl">
            <h1 className="!text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-6 leading-tight tracking-tight animate-fade-in-down">
              {language === 'ar' 
                ? 'نحو قرارات اقتصادية أكثر جدوى'
                : 'Towards More Viable Economic Decisions'}
            </h1>
            <p className="!text-white text-sm sm:text-base md:text-xl lg:text-2xl mb-4 sm:mb-8 md:mb-10 leading-relaxed font-light">
              {language === 'ar'
                ? 'منصة استشارية متكاملة تقدم حلولاً اقتصادية وإدارية ومالية قائمة على التحليل الكمي والقياس العلمي، لتساعد الشركات والأفراد والجهات الحكومية على اتخاذ قرارات أكثر دقة وكفاءة'
                : 'An integrated consulting platform offering economic, administrative, and financial solutions based on quantitative analysis and scientific measurement, helping companies, individuals, and government entities make more accurate and efficient decisions'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <Button
                type="primary"
                size="large"
                className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#c9a227] hover:to-[#e6c93d] border-0 h-10 sm:h-12 md:h-14 px-6 sm:px-8 text-sm sm:text-base lg:text-lg font-semibold text-[#1a4d3a] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse-once w-full sm:w-auto"
                icon={language === 'ar' ? <ArrowLeftOutlined /> : <PlayCircleOutlined />}
                onClick={() => navigate('/register')}
              >
                {language === 'ar' ? 'احجز استشارة الآن' : 'Book a Consultation Now'}
              </Button>
              <Button
                size="large"
                className="bg-transparent hover:bg-white/10 border-2 border-white text-white h-10 sm:h-12 md:h-14 px-6 sm:px-8 text-sm sm:text-base lg:text-lg font-semibold backdrop-blur-sm hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-300 hover-scale w-full sm:w-auto"
                onClick={() => navigate('/services')}
              >
                {language === 'ar' ? 'تعرف على خدماتنا' : 'Learn More About Our Services'}
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-white via-white/90 to-transparent" />
      </div>
    )
  }

  return (
    <Carousel autoplay effect="fade" className="slider-carousel">
      {sliders.map((slider, index) => {
        const title = language === 'ar' ? slider.titleAr || slider.title : slider.title
        const subtitle = language === 'ar' ? slider.subtitleAr || slider.subtitle : slider.subtitle
        const description = language === 'ar' ? slider.descriptionAr || slider.description : slider.description
        const buttonText = language === 'ar' ? slider.buttonTextAr || slider.buttonText : slider.buttonText
        
        return (
          <div key={slider.id}>
            <div className="relative min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] flex items-center justify-center overflow-hidden py-10 md:py-0">
              {/* Background Image with Overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: slider.image ? `url(${slider.image})` : 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920)',
                  filter: 'brightness(0.3)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a4d3a]/60 via-[#2d5f4f]/50 to-[#1a4d3a]/60" />
              </div>

              {/* Content */}
              <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 ${language === 'ar' ? 'text-right' : 'text-left'} w-full`}>
                <div className="max-w-4xl">
                  {slider.icon && (
                    <div className="mb-4 sm:mb-6 animate-fade-in-down">
                      <img 
                        src={slider.icon} 
                        alt="Slider Icon" 
                        className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 object-contain"
                      />
                    </div>
                  )}
                  {title && (
                    <h1 className="!text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-6 leading-tight tracking-tight animate-fade-in-down">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="!text-white text-sm sm:text-base md:text-xl lg:text-2xl mb-2 sm:mb-4 leading-relaxed font-light">
                      {subtitle}
                    </p>
                  )}
                  {description && (
                    <p className="!text-gray-200 text-xs sm:text-sm md:text-lg mb-4 sm:mb-8 md:mb-10 leading-relaxed font-light">
                      {description}
                    </p>
                  )}
                  {buttonText && slider.buttonLink && (
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                      <Button
                        type="primary"
                        size="large"
                        className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#c9a227] hover:to-[#e6c93d] border-0 h-10 sm:h-12 md:h-14 px-6 sm:px-8 text-sm sm:text-base lg:text-lg font-semibold text-[#1a4d3a] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                        icon={language === 'ar' ? <ArrowLeftOutlined /> : <PlayCircleOutlined />}
                        onClick={() => {
                          if (slider.buttonLink.startsWith('http')) {
                            window.open(slider.buttonLink, '_blank')
                          } else {
                            navigate(slider.buttonLink)
                          }
                        }}
                      >
                        {buttonText}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-white via-white/90 to-transparent" />
            </div>
          </div>
        )
      })}
    </Carousel>
  )
}

export default HeroSection

