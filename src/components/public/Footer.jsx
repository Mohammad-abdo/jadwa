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

const { Footer: AntFooter } = Layout

const Footer = () => {
  const { t, language } = useLanguage()

  const quickLinks = [
    { label: t('home'), path: '/' },
    { label: t('about'), path: '/about' },
    { label: t('services'), path: '/services' },
    { label: t('consultants'), path: '/consultants' },
    { label: t('reports'), path: '/reports' },
    { label: t('blog'), path: '/blog' },
    { label: t('contact'), path: '/contact' },
  ]

  return (
    <AntFooter className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Row gutter={[32, 32]}>
          {/* Logo and Description */}
          <Col xs={24} sm={12} md={6}>
            <div className="flex items-center mb-4">
              <img 
                src="/assets/images/logo/logo-white.png" 
                alt="Jadwa - جدوى" 
                className="h-14 md:h-16 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {language === 'ar'
                ? 'منصة متخصصة في الاستشارات الاقتصادية والإدارية'
                : 'A specialized platform for economic and administrative consulting'}
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-turquoise-400 transition-colors">
                <FacebookOutlined className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-turquoise-400 transition-colors">
                <TwitterOutlined className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-turquoise-400 transition-colors">
                <LinkedinOutlined className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-turquoise-400 transition-colors">
                <InstagramOutlined className="text-xl" />
              </a>
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={6}>
            <h3 className="text-lg font-bold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-turquoise-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Contact Info */}
          <Col xs={24} sm={12} md={6}>
            <h3 className="text-lg font-bold mb-4">{t('contactInfo')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 space-x-reverse text-gray-400 text-sm">
                <PhoneOutlined className="text-turquoise-400" />
                <span>9200 00000</span>
              </li>
              <li className="flex items-center space-x-2 space-x-reverse text-gray-400 text-sm">
                <MailOutlined className="text-turquoise-400" />
                <span>info@jadwa.sa</span>
              </li>
              <li className="flex items-center space-x-2 space-x-reverse text-gray-400 text-sm">
                <WhatsAppOutlined className="text-turquoise-400" />
                <a href="#" className="hover:text-turquoise-400">
                  {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                </a>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse text-gray-400 text-sm">
                <EnvironmentOutlined className="text-turquoise-400 mt-1" />
                <span>
                  {language === 'ar'
                    ? 'مكة المكرمة – المملكة العربية السعودية'
                    : 'Makkah Al-Mukarramah – Saudi Arabia'}
                </span>
              </li>
              <li className="flex items-center space-x-2 space-x-reverse text-gray-400 text-sm">
                <a href="https://www.jadwa.sa" className="hover:text-turquoise-400">
                  www.jadwa.sa
                </a>
              </li>
            </ul>
          </Col>

          {/* Legal */}
          <Col xs={24} sm={12} md={6}>
            <h3 className="text-lg font-bold mb-4">
              {language === 'ar' ? 'معلومات قانونية' : 'Legal'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-turquoise-400 transition-colors text-sm"
                >
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-turquoise-400 transition-colors text-sm"
                >
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </Col>
        </Row>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          {language === 'ar'
            ? '© 2025 جدوى للاستشارات الإدارية والاقتصادية – جميع الحقوق محفوظة'
            : '© 2025 Jadwa for Administrative and Economic Consulting – All Rights Reserved'}
        </div>
      </div>
    </AntFooter>
  )
}

export default Footer

