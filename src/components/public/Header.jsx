import React, { useState } from 'react'
import { Layout, Menu, Button, Drawer } from 'antd'
import { MenuOutlined, UserOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'

const { Header: AntHeader } = Layout

const Header = () => {
  const { t, language, toggleLanguage } = useLanguage()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    { key: 'home', label: <Link to="/">{t('home')}</Link> },
    { key: 'about', label: <Link to="/about">{t('about')}</Link> },
    { key: 'services', label: <Link to="/services">{t('services')}</Link> },
    { key: 'consultants', label: <Link to="/consultants">{t('consultants')}</Link> },
    { key: 'reports', label: <Link to="/reports">{t('reports')}</Link> },
    { key: 'blog', label: <Link to="/blog">{t('blog')}</Link> },
    { key: 'contact', label: <Link to="/contact">{t('contact')}</Link> },
  ]

  return (
    <AntHeader className="bg-white shadow-md sticky top-0 z-50 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src="/assets/images/logo/logo.png" 
            alt="Jadwa - جدوى" 
            className="h-12 md:h-14 w-auto object-contain"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 space-x-reverse flex-1 justify-center">
          <Menu
            mode="horizontal"
            items={menuItems}
            className="border-0 bg-transparent"
            style={{ minWidth: '600px' }}
          />
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center space-x-4 space-x-reverse">
          <Button
            type="text"
            onClick={toggleLanguage}
            className="text-olive-green-600 hover:text-olive-green-700"
          >
            {language === 'ar' ? 'EN' : 'AR'}
          </Button>
          <Button
            type="text"
            icon={<UserOutlined />}
            onClick={() => navigate('/login')}
          >
            {t('login')}
          </Button>
          <Button
            type="primary"
            className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
            onClick={() => navigate('/login')}
          >
            {t('requestConsultation')}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          className="md:hidden"
          onClick={() => setMobileMenuOpen(true)}
        />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement={language === 'ar' ? 'right' : 'left'}
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
      >
        <Menu
          mode="vertical"
          items={menuItems}
          className="border-0"
        />
        <div className="mt-4 space-y-2">
          <Button
            block
            onClick={toggleLanguage}
            className="mb-2"
          >
            {language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          </Button>
          <Button
            block
            type="primary"
            className="bg-olive-green-600"
            onClick={() => {
              navigate('/login')
              setMobileMenuOpen(false)
            }}
          >
            {t('requestConsultation')}
          </Button>
        </div>
      </Drawer>
    </AntHeader>
  )
}

export default Header

