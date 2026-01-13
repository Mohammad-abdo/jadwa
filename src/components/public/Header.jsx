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
    <AntHeader className="bg-white shadow-lg sticky top-0 z-50 w-full px-3 sm:px-4 md:px-8 backdrop-blur-sm bg-white/95 border-b border-gray-100" style={{ height: 'auto', paddingInline: 0 }}>
      {/* Container with max-width to handle content width, keeping header full width */}
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 sm:h-24 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
          <div className="flex items-center mx-3 gap-2">
            {settings.websiteLogo ? (
              <img
                src={settings.websiteLogo}
                alt={settings.websiteName || 'Logo'}
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#1a4d3a] to-[#2d5f4f] rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <BarChartOutlined className="text-white text-lg sm:text-xl md:text-2xl" />
              </div>
            )}
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden xl:flex items-center gap-2 lg:gap-4 xl:gap-8 flex-1 justify-center">
          <Menu
            mode="horizontal"
            items={menuItems}
            onClick={handleMenuClick}
            selectedKeys={[getActiveKey()]}
            className={`border-0 bg-transparent font-semibold justify-center ${language === 'ar' ? 'text-sm xl:text-base' : 'text-base xl:text-lg'}`}
            style={{ borderBottom: 'none', lineHeight: '80px' }}
          />
        </div>

        {/* Actions */}
        <div className="hidden xl:flex items-center gap-2 xl:gap-4">
          <Button
            type="text"
            onClick={toggleLanguage}
            className="text-[#1a4d3a] hover:text-[#2d5f4f] font-medium text-base xl:text-lg h-10 xl:h-11"
          >
            {language === "ar" ? "EN" : "AR"}
          </Button>
          
          {isAuthenticated ? (
            <>
              <Button
                type="text"
                icon={<DashboardOutlined />}
                onClick={() => navigate(getDashboardRoute())}
                className="text-gray-700 hover:text-[#1a4d3a] font-medium text-base xl:text-lg h-10 xl:h-11"
              >
                {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
              </Button>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="border-0 font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 h-10 xl:h-12 px-4 xl:px-6 text-sm xl:text-base"
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
                className="text-gray-700 hover:text-[#1a4d3a] font-medium text-base xl:text-lg h-10 xl:h-11"
              >
                {t("login")}
              </Button>
              <Button
                type="primary"
                className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#c9a227] hover:to-[#e6c93d] border-0 text-[#1a4d3a] font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105 h-10 xl:h-12 px-4 xl:px-6 text-sm xl:text-base"
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
          className="xl:hidden text-[#1a4d3a] hover:bg-gray-100"
          size="large"
          onClick={() => setMobileMenuOpen(true)}
        />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            {settings.websiteLogo ? (
              <img
                src={settings.websiteLogo}
                alt={settings.websiteName || 'Logo'}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-[#1a4d3a] to-[#2d5f4f] rounded-lg flex items-center justify-center">
                <BarChartOutlined className="text-white text-base" />
              </div>
            )}
            <span className="font-bold text-lg">{settings.websiteName || 'Jadwa'}</span>
          </div>
        }
        placement={language === "ar" ? "right" : "left"}
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        className="mobile-drawer"
      >
        <Menu 
          mode="vertical" 
          items={menuItems} 
          className="border-0 mobile-menu"
          onClick={handleMenuClick}
        />
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
          <Button 
            block 
            onClick={() => {
              toggleLanguage();
              setMobileMenuOpen(false);
            }} 
            className="mb-2 h-11 text-base"
          >
            {language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          </Button>
          
          {isAuthenticated ? (
            <>
              <Button
                block
                type="primary"
                icon={<DashboardOutlined />}
                className="bg-gradient-to-r from-[#1a4d3a] to-[#2d5f4f] border-0 text-white font-semibold h-11 text-base"
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
                className="h-11 text-base"
                onClick={handleLogout}
              >
                {language === 'ar' ? 'خروج' : 'Logout'}
              </Button>
            </>
          ) : (
            <>
              <Button
                block
                type="primary"
                className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#c9a227] hover:to-[#e6c93d] border-0 text-[#1a4d3a] font-semibold h-11 text-base"
                onClick={() => {
                  navigate("/register");
                  setMobileMenuOpen(false);
                }}
              >
                {t("requestConsultation")}
              </Button>
              <Button
                block
                type="text"
                icon={<UserOutlined />}
                className="h-11 text-base"
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
              >
                {t("login")}
              </Button>
            </>
          )}
        </div>
      </Drawer>
    </AntHeader>
  );
};

export default Header;
