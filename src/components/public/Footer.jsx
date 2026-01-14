import React from 'react'
import { Layout, Row, Col } from 'antd'
import {
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  InstagramOutlined,
  WhatsAppOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'

const { Footer: AntFooter } = Layout

const Footer = () => {
  const { t, language } = useLanguage()
  const { settings } = useTheme()

  const quickLinks = [
    { label: t('home'), path: '/' },
    { label: t('about'), path: '/about' },
    { label: t('services'), path: '/services' },
    { label: t('consultants'), path: '/consultants' },
    { label: t('reports'), path: '/reports' },
    { label: t('blog'), path: '/blog' },
    { label: t('contact'), path: '/contact' },
    { label: language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions', path: '/terms' },
  ]

  return (
    <AntFooter className="bg-gray-900 text-white py-10 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <Row gutter={[32, 48]} className="sm:gutter-[40]">
          {/* Logo and Description */}
          <Col xs={24} lg={8}>
            <div className="flex items-center mb-6">
              {settings.websiteLogo ? (
                <img 
                  src={settings.websiteLogo} 
                  alt={`${settings.websiteName || 'Jadwa'} - ${settings.websiteNameAr || 'جدوى'}`}
                  className="h-14 sm:h-16 w-auto object-contain"
                />
              ) : (
                <div className="text-white text-2xl sm:text-3xl font-bold">
                  {settings.websiteName || 'Jadwa'}
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm sm:text-base mb-6 leading-relaxed max-w-sm">
              {language === 'ar'
                ? 'منصة متخصصة في الاستشارات الاقتصادية والإدارية تقدم حلولاً مبتكرة لتنمية أعمالك.'
                : 'A specialized platform for economic and administrative consulting offering innovative solutions for your business growth.'}
            </p>
            <div className="flex space-x-5 space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-turquoise-400 transition-all transform hover:scale-110">
                <FacebookOutlined className="text-xl sm:text-2xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-turquoise-400 transition-all transform hover:scale-110">
                <TwitterOutlined className="text-xl sm:text-2xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-turquoise-400 transition-all transform hover:scale-110">
                <LinkedinOutlined className="text-xl sm:text-2xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-turquoise-400 transition-all transform hover:scale-110">
                <InstagramOutlined className="text-xl sm:text-2xl" />
              </a>
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} lg={5}>
            <h3 className="text-lg sm:text-xl font-bold mb-6 text-white border-b border-gray-700 pb-2 inline-block">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-turquoise-400 transition-colors text-sm sm:text-base flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-turquoise-500 rounded-full opacity-0 hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Contact Info */}
          <Col xs={24} sm={12} lg={6}>
            <h3 className="text-lg sm:text-xl font-bold mb-6 text-white border-b border-gray-700 pb-2 inline-block">
              {t('contactInfo')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400 text-sm sm:text-base group">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-turquoise-500/20 transition-colors">
                  <PhoneOutlined className="text-turquoise-400" />
                </div>
                <span dir="ltr" className="hover:text-white transition-colors">9200 00000</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm sm:text-base group">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-turquoise-500/20 transition-colors">
                  <MailOutlined className="text-turquoise-400" />
                </div>
                <span className="break-all hover:text-white transition-colors">info@jadwa.sa</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm sm:text-base group">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-turquoise-500/20 transition-colors">
                  <WhatsAppOutlined className="text-turquoise-400" />
                </div>
                <a href="#" className="hover:text-white transition-colors">
                  {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400 text-sm sm:text-base group">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-turquoise-500/20 transition-colors mt-1">
                  <EnvironmentOutlined className="text-turquoise-400" />
                </div>
                <span className="leading-relaxed hover:text-white transition-colors">
                  {language === 'ar'
                    ? 'مكة المكرمة – المملكة العربية السعودية'
                    : 'Makkah Al-Mukarramah – Saudi Arabia'}
                </span>
              </li>
            </ul>
          </Col>

          {/* Legal */}
          <Col xs={24} sm={12} lg={5}>
            <h3 className="text-lg sm:text-xl font-bold mb-6 text-white border-b border-gray-700 pb-2 inline-block">
              {language === 'ar' ? 'معلومات قانونية' : 'Legal'}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-turquoise-400 transition-colors text-sm sm:text-base block py-1"
                >
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-turquoise-400 transition-colors text-sm sm:text-base block py-1"
                >
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </Col>
        </Row>

        <div className="border-t border-gray-800 mt-10 sm:mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm sm:text-base">
            {language === 'ar'
              ? `© 2025 ${settings.websiteNameAr || 'جدوى'} للاستشارات الإدارية والاقتصادية – جميع الحقوق محفوظة`
              : `© 2025 ${settings.websiteName || 'Jadwa'} for Administrative and Economic Consulting – All Rights Reserved`}
          </p>
        </div>
      </div>
    </AntFooter>
  )
}

export default Footer

