import React, { useState, useEffect } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button, Drawer } from 'antd'
import {
  HomeOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MessageOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  GlobalOutlined,
  FilePdfOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import NotificationDropdown from '../common/NotificationDropdown'
import { useWindowSize } from '../../hooks/useWindowSize'

const { Header, Sider, Content } = Layout

const ClientLayout = ({ children }) => {
  const { t, language, toggleLanguage } = useLanguage()
  const { user, logout } = useAuth()
  const { settings } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { width } = useWindowSize()
  const isMobile = width < 768
  const [collapsed, setCollapsed] = useState(isMobile)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const isRTL = language === 'ar'

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true)
    }
  }, [isMobile])

  useEffect(() => {
    const contentElement = document.querySelector('.client-content')
    if (contentElement) {
      contentElement.classList.add('fade-in')
      setTimeout(() => {
        contentElement.classList.remove('fade-in')
      }, 500)
    }
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const menuItems = [
    {
      key: '/client',
      icon: <HomeOutlined />,
      label: language === 'ar' ? 'الرئيسية' : 'Home',
    },
    {
      key: '/client/bookings',
      icon: <CalendarOutlined />,
      label: language === 'ar' ? 'حجوزاتي' : 'My Bookings',
    },
    {
      key: '/client/consultations',
      icon: <FileTextOutlined />,
      label: language === 'ar' ? 'استشاراتي' : 'My Consultations',
    },
    {
      key: '/client/reports',
      icon: <FilePdfOutlined />,
      label: language === 'ar' ? 'التقارير' : 'Reports',
    },
    {
      key: '/client/chat',
      icon: <MessageOutlined />,
      label: language === 'ar' ? 'الرسائل' : 'Messages',
    },
    {
      key: '/client/support',
      icon: <FileTextOutlined />,
      label: language === 'ar' ? 'الدعم الفني' : 'Support',
    },
    {
      key: '/client/profile',
      icon: <UserOutlined />,
      label: language === 'ar' ? 'حسابي' : 'My Account',
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: language === 'ar' ? 'الملف الشخصي' : 'Profile',
      onClick: ({ domEvent }) => {
        if (domEvent) {
          domEvent.stopPropagation()
          domEvent.preventDefault()
        }
        setTimeout(() => {
          setUserMenuOpen(false)
          navigate('/client/profile')
        }, 100)
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: language === 'ar' ? 'الإعدادات' : 'Settings',
      onClick: ({ domEvent }) => {
        if (domEvent) {
          domEvent.stopPropagation()
          domEvent.preventDefault()
        }
        setTimeout(() => {
          setUserMenuOpen(false)
          navigate('/client/profile')
        }, 100)
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: language === 'ar' ? 'تسجيل الخروج' : 'Logout',
      onClick: ({ domEvent }) => {
        if (domEvent) {
          domEvent.stopPropagation()
          domEvent.preventDefault()
        }
        setTimeout(() => {
          setUserMenuOpen(false)
          handleLogout()
        }, 100)
      },
    },
  ]

  const sidebarStyle = !isMobile ? {
    overflow: 'auto',
    height: '100vh',
    position: 'fixed',
    top: 0,
    bottom: 0,
    [isRTL ? 'right' : 'left']: 0,
    transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
    zIndex: 1000,
  } : { display: 'none' }

  const layoutStyle = !isMobile ? {
    transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
    [isRTL ? 'marginRight' : 'marginLeft']: collapsed ? 80 : 250,
  } : {
    [isRTL ? 'marginRight' : 'marginLeft']: 0,
  }

  const SidebarContent = (
    <>
      <div className="p-6 flex items-center justify-between border-b border-gray-200">
        <div className={`flex items-center gap-3 transition-all duration-300 ${collapsed && !isMobile ? 'justify-center w-full' : ''}`}>
          {settings.logo ? (
            <img
              src={settings.logo}
              alt="Logo"
              className={`${collapsed && !isMobile ? 'w-12 h-12' : 'h-10'} object-contain cursor-pointer transition-all duration-300`}
              onClick={() => navigate('/client')}
            />
          ) : (
            <div 
              className="w-12 h-12 bg-gradient-to-br from-olive-green-600 via-olive-green-500 to-turquoise-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 cursor-pointer"
              style={{ backgroundColor: settings.primaryColor }}
              onClick={() => navigate('/client')}
            >
              <span className="text-white font-bold text-xl">
                {language === 'ar' ? settings.dashboardNameAr?.[0] || 'ج' : settings.dashboardName?.[0] || 'J'}
              </span>
            </div>
          )}
          {(!collapsed || isMobile) && (
            <div className="animate-fade-in cursor-pointer" onClick={() => navigate('/client')}>
              <div className="text-base font-bold text-olive-green-700" style={{ color: settings.primaryColor }}>
                {settings.dashboardName || 'Jadwa'}
              </div>
              <div className="text-xs text-gray-500">{settings.dashboardNameAr || 'جدوى'}</div>
            </div>
          )}
        </div>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => {
           navigate(key)
           if (isMobile) setMobileMenuOpen(false)
        }}
        className="border-0 mt-4 px-2"
        style={{ background: 'transparent' }}
      />
      {!isMobile && (
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Button
            type="text"
            icon={collapsed ? (isRTL ? <DoubleLeftOutlined /> : <DoubleRightOutlined />) : (isRTL ? <DoubleRightOutlined /> : <DoubleLeftOutlined />)}
            onClick={() => setCollapsed(!collapsed)}
            className="w-full hover:bg-olive-green-50 text-olive-green-600 border border-olive-green-200 rounded-lg transition-all duration-300"
          >
            {!collapsed && <span className="ml-2">{language === 'ar' ? 'طي' : 'Collapse'}</span>}
          </Button>
        </div>
      )}
    </>
  )

  return (
    <Layout className="min-h-screen">
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={250}
          className="client-sidebar bg-gradient-to-b from-white to-gray-50 shadow-2xl border-r border-gray-200"
          style={sidebarStyle}
        >
          {SidebarContent}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          placement={isRTL ? 'right' : 'left'}
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
          styles={{ body: { padding: 0 } }}
          closable={false}
        >
          <div className="h-full flex flex-col">
            {SidebarContent}
          </div>
        </Drawer>
      )}

      <Layout style={layoutStyle} className="transition-all duration-300">
        <Header className="bg-white shadow-md px-3 md:px-6 flex items-center justify-between fixed top-0 z-[1001] backdrop-blur-sm bg-white/95" style={{ 
          position: 'fixed', 
          width: isMobile ? '100%' : `calc(100% - ${collapsed ? 80 : 250}px)`,
          [isRTL ? 'right' : 'left']: isMobile ? 0 : (collapsed ? 80 : 250),
          transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)'
        }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed)}
            className="text-lg hover:bg-olive-green-50 text-olive-green-600 rounded-lg transition-all duration-300"
            style={{ pointerEvents: 'auto' }}
          />
          <div className="flex items-center gap-2 md:gap-4" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1002 }}>
            <Button
              type="text"
              icon={<GlobalOutlined />}
              onClick={toggleLanguage}
              className="text-lg hover:bg-olive-green-50 text-olive-green-600 rounded-lg transition-all duration-300 font-semibold"
              title={
                language === "ar" ? "Switch to English" : "التبديل إلى العربية"
              }
              style={{ pointerEvents: 'auto' }}
            >
              {language === "ar" ? "EN" : "AR"}
            </Button>
            <NotificationDropdown userId={user?.id} />
            <Dropdown 
              menu={{ items: userMenuItems }} 
              placement={isRTL ? "bottomLeft" : "bottomRight"}
              trigger={['click']}
              open={userMenuOpen}
              destroyTooltipOnHide={false}
              transitionName=""
              getPopupContainer={() => document.body}
              popupRender={(menu) => (
                <div 
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  {menu}
                </div>
              )}
              onOpenChange={(visible) => {
                // Only update if the change is intentional
                if (visible !== userMenuOpen) {
                  setUserMenuOpen(visible)
                }
              }}
            >
              <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg group"
              >
                <Avatar 
                  src={user?.avatar || user?.client?.profilePicture} 
                  icon={<UserOutlined />}
                  className="ring-2 ring-olive-green-200 group-hover:ring-olive-green-400 transition-all duration-300"
                />
                <span className="hidden md:inline font-medium text-gray-700">
                  {user?.client ? `${user.client.firstName} ${user.client.lastName}` : user?.email}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="p-3 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen client-content" style={{ marginTop: '64px' }}>
          <div className="animate-fade-in">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default ClientLayout

