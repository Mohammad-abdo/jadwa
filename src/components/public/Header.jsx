import React, { useState } from "react";
import { Layout, Menu, Button, Drawer } from "antd";
import {
  MenuOutlined,
  UserOutlined,
  BarChartOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  TeamOutlined,
  FileTextOutlined,
  BookOutlined,
  ContactsOutlined,
  LogoutOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

const { Header: AntHeader } = Layout;

const Header = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { settings } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get dashboard route based on role
  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'CLIENT') return '/client';
    if (user.role === 'CONSULTANT') return '/consultant';
    return '/admin';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };
  
  // Get current active menu key based on pathname
  const getActiveKey = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/about')) return 'about';
    if (path.startsWith('/services')) return 'services';
    if (path.startsWith('/consultants')) return 'consultants';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/blog')) return 'blog';
    if (path.startsWith('/contact')) return 'contact';
    return '';
  };

  const handleMenuClick = ({ key }) => {
    const routes = {
      home: "/",
      about: "/about",
      services: "/services",
      consultants: "/consultants",
      reports: "/reports",
      blog: "/blog",
      contact: "/contact",
    };
    
    if (routes[key]) {
      navigate(routes[key]);
      setMobileMenuOpen(false);
    }
  };

  const menuItems = [
    { 
      key: "home", 
      icon: <HomeOutlined />,
      label: t("home")
    },
    { 
      key: "about", 
      icon: <InfoCircleOutlined />,
      label: t("about")
    },
    { 
      key: "services", 
      icon: <AppstoreOutlined />,
      label: t("services")
    },
    {
      key: "consultants",
      icon: <TeamOutlined />,
      label: t("consultants"),
    },
    { 
      key: "reports", 
      icon: <FileTextOutlined />,
      label: t("reports")
    },
    { 
      key: "blog", 
      icon: <BookOutlined />,
      label: t("blog")
    },
    { 
      key: "contact", 
      icon: <ContactsOutlined />,
      label: t("contact")
    },
  ];

  return (
    <AntHeader className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 w-full border-b border-white/20" style={{ height: 'auto', paddingInline: 0 }}>
      {/* Container - wider max-width for modern feel */}
      <div className="max-w-[1920px] mx-auto flex items-center justify-between h-20 sm:h-24 px-4 sm:px-8 md:px-12 transition-all duration-300">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="flex items-center gap-2 relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-olive-green-500/20 to-turquoise-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {settings.websiteLogo ? (
              <img
                src={settings.websiteLogo}
                alt={settings.websiteName || 'Logo'}
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 relative z-10"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#1a4d3a] to-[#2d5f4f] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-olive-green-500/30 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 relative z-10">
                <BarChartOutlined className="text-white text-lg sm:text-xl" />
              </div>
            )}
            <span className={`font-bold text-xl sm:text-2xl text-gray-900 tracking-tight ${settings.websiteLogo ? 'hidden sm:block' : 'block'} group-hover:text-[#1a4d3a] transition-colors`}>
               {settings.websiteName || 'Jadwa'}
            </span>
          </div>
        </Link>

        {/* Desktop Custom Menu */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center px-8">
          <nav className="flex items-center p-1 bg-gray-100/50 backdrop-blur-sm rounded-full border border-white/50 shadow-inner">
            {menuItems.map((item) => {
              const isActive = getActiveKey() === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick({ key: item.key })}
                  className={`
                    relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2
                    ${isActive 
                      ? 'bg-white text-[#1a4d3a] shadow-md transform scale-105' 
                      : 'text-gray-600 hover:text-[#1a4d3a] hover:bg-white/50'
                    }
                  `}
                >
                  <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="group relative px-3 py-1.5 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 hover:border-[#1a4d3a]/30 transition-all duration-300"
          >
            <span className="relative z-10 text-sm font-bold text-gray-600 group-hover:text-[#1a4d3a]">
              {language === "ar" ? "EN" : "AR"}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-olive-green-50 to-turquoise-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          
          <div className="h-8 w-px bg-gray-200 mx-1" />

          {isAuthenticated ? (
            <>
              <Button
                type="text"
                icon={<DashboardOutlined />}
                onClick={() => navigate(getDashboardRoute())}
                className="text-gray-700 hover:text-[#1a4d3a] font-semibold text-base h-11 px-5 rounded-xl hover:bg-gray-50 flex items-center gap-2"
              >
                {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
              </Button>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="border-0 font-semibold shadow-sm hover:shadow-red-200 transition-all hover:scale-105 h-11 px-6 text-base rounded-xl bg-red-50 text-red-600 hover:bg-red-100/80 hover:text-red-700"
              >
                {language === 'ar' ? 'خروج' : 'Logout'}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="text"
                icon={<UserOutlined />}
                onClick={() => navigate("/login")}
                className="text-gray-700 hover:text-[#1a4d3a] font-semibold text-base h-11 px-5 rounded-xl hover:bg-gray-50"
              >
                {t("login")}
              </Button>
              <Button
                type="primary"
                className="bg-gradient-to-r from-[#1a4d3a] to-[#2d5f4f] hover:from-[#143d2e] hover:to-[#234b3f] border-0 text-white font-bold shadow-lg shadow-olive-green-900/10 hover:shadow-olive-green-900/20 transition-all hover:scale-105 h-11 px-6 text-base rounded-xl"
                onClick={() => navigate("/register")}
              >
                {t("requestConsultation")}
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          className="lg:hidden text-[#1a4d3a] hover:bg-olive-green-50 h-12 w-12 flex items-center justify-center rounded-2xl border border-gray-100 shadow-sm"
          size="large"
          onClick={() => setMobileMenuOpen(true)}
        />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            {settings.websiteLogo ? (
              <img
                src={settings.websiteLogo}
                alt={settings.websiteName || 'Logo'}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div className="w-9 h-9 bg-gradient-to-br from-[#1a4d3a] to-[#2d5f4f] rounded-lg flex items-center justify-center shadow-md">
                <BarChartOutlined className="text-white text-lg" />
              </div>
            )}
            <span className="font-bold text-xl text-gray-900">{settings.websiteName || 'Jadwa'}</span>
          </div>
        }
        placement={language === "ar" ? "right" : "left"}
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={320}
        className="mobile-drawer"
        styles={{
          header: { borderBottom: '1px solid #f3f4f6', padding: '20px 24px' },
          body: { padding: '24px' },
          mask: { backdropFilter: 'blur(4px)' }
        }}
      >
        <div className="flex flex-col h-full animate-fade-in">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isActive = getActiveKey() === item.key;
              return (
                <div
                  key={item.key}
                  onClick={() => handleMenuClick({ key: item.key })}
                  className={`
                    flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-300
                    ${isActive 
                      ? 'bg-olive-green-50 text-[#1a4d3a] font-bold shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a4d3a] font-medium'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-base">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1a4d3a]" />}
                </div>
              );
            })}
          </div>
          
          <div className="mt-auto pt-8 border-t border-gray-100 space-y-6">
             <div className="bg-gray-50 p-1.5 rounded-xl flex shadow-inner">
              <button 
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${language === 'en' ? 'bg-white shadow text-[#1a4d3a]' : 'text-gray-500 hover:text-gray-900'}`}
                onClick={() => {
                  if (language !== 'en') toggleLanguage();
                }}
              >
                English
              </button>
              <button 
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${language === 'ar' ? 'bg-white shadow text-[#1a4d3a]' : 'text-gray-500 hover:text-gray-900'}`}
                onClick={() => {
                  if (language !== 'ar') toggleLanguage();
                }}
              >
                العربية
              </button>
            </div>

            {isAuthenticated ? (
              <div className="space-y-3">
                <Button
                  block
                  type="primary"
                  icon={<DashboardOutlined />}
                  className="bg-gradient-to-r from-[#1a4d3a] to-[#2d5f4f] border-0 text-white font-bold h-12 text-base rounded-xl shadow-lg shadow-olive-green-900/20"
                  onClick={() => {
                    navigate(getDashboardRoute());
                    setMobileMenuOpen(false);
                  }}
                >
                  {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                </Button>
                <Button
                  block
                  danger
                  type="text"
                  icon={<LogoutOutlined />}
                  className="h-12 text-base font-bold rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                  onClick={handleLogout}
                >
                  {language === 'ar' ? 'خروج' : 'Logout'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  block
                  type="primary"
                  className="bg-gradient-to-r from-[#1a4d3a] to-[#2d5f4f] border-0 text-white font-bold h-12 text-base rounded-xl shadow-lg shadow-olive-green-900/20"
                  onClick={() => {
                    navigate("/register");
                    setMobileMenuOpen(false);
                  }}
                >
                  {t("requestConsultation")}
                </Button>
                <Button
                  block
                  type="default"
                  icon={<UserOutlined />}
                  className="h-12 text-base font-bold rounded-xl border-gray-200 hover:border-[#1a4d3a] hover:text-[#1a4d3a] text-gray-700 bg-white"
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  {t("login")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </AntHeader>
  );
};

export default Header;
