import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Input, Drawer } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  MessageOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuOutlined,
  SearchOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  BookOutlined,
  AppstoreOutlined,
  GlobalOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import NotificationDropdown from "../common/NotificationDropdown";
import { useWindowSize } from "../../hooks/useWindowSize";

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, settings } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [collapsed, setCollapsed] = useState(isMobile); // Auto-collapse on mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isRTL = language === "ar";

  // Auto-handle mobile menu
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  useEffect(() => {
    // Add animation class to content when route changes
    const contentElement = document.querySelector(".admin-content");
    if (contentElement) {
      contentElement.classList.add("fade-in");
      setTimeout(() => {
        contentElement.classList.remove("fade-in");
      }, 500);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: language === "ar" ? "لوحة التحكم" : "Dashboard",
    },
    {
      key: "/admin/clients",
      icon: <UserOutlined />,
      label: language === "ar" ? "العملاء" : "Clients",
    },
    {
      key: "/admin/consultants",
      icon: <TeamOutlined />,
      label: language === "ar" ? "المستشارون" : "Consultants",
    },
    {
      key: "/admin/sessions",
      icon: <CalendarOutlined />,
      label: language === "ar" ? "الجلسات" : "Sessions",
    },
    {
      key: "/admin/payments",
      icon: <DollarOutlined />,
      label: language === "ar" ? "المدفوعات" : "Payments",
    },
    // {
    //   key: "/admin/cms",
    //   icon: <FileTextOutlined />,
    //   label: "CMS",
    // },
    {
      key: "/admin/articles",
      icon: <BookOutlined />,
      label: language === "ar" ? "المقالات" : "Articles",
    },
    {
      key: "/admin/services",
      icon: <AppstoreOutlined />,
      label: language === "ar" ? "الخدمات" : "Services",
    },
    {
      key: "/admin/sliders",
      icon: <PictureOutlined />,
      label: language === "ar" ? "السلايدرات" : "Sliders",
    },
    {
      key: "/admin/reports",
      icon: <FileTextOutlined />,
      label: language === "ar" ? "التقارير" : "Reports",
    },
    {
      key: "/admin/partners",
      icon: <TeamOutlined />,
      label: language === "ar" ? "الشركاء" : "Partners",
    },
    {
      key: "/admin/categories",
      icon: <AppstoreOutlined />,
      label: language === "ar" ? "الفئات" : "Categories",
    },
    {
      key: "/admin/monitoring",
      icon: <BellOutlined />,
      label: language === "ar" ? "المراقبة" : "Monitoring",
    },
    {
      key: "/admin/chat",
      icon: <MessageOutlined />,
      label: language === "ar" ? "المحادثات" : "Chat",
    },
    {
      key: "/admin/support",
      icon: <FileTextOutlined />,
      label: language === "ar" ? "الدعم الفني" : "Support",
    },
    {
      key: "/admin/permissions",
      icon: <UserOutlined />,
      label: language === "ar" ? "الصلاحيات" : "Permissions",
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: language === "ar" ? "الإعدادات" : "Settings",
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: language === "ar" ? "الملف الشخصي" : "Profile",
      onClick: ({ domEvent }) => {
        if (domEvent) {
          domEvent.stopPropagation();
          domEvent.preventDefault();
        }
        setTimeout(() => {
          setUserMenuOpen(false);
          navigate("/admin/profile");
        }, 100);
      },
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: language === "ar" ? "الإعدادات" : "Settings",
      onClick: ({ domEvent }) => {
        if (domEvent) {
          domEvent.stopPropagation();
          domEvent.preventDefault();
        }
        setTimeout(() => {
          setUserMenuOpen(false);
          navigate("/admin/settings");
        }, 100);
      },
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: language === "ar" ? "تسجيل الخروج" : "Logout",
      onClick: ({ domEvent }) => {
        if (domEvent) {
          domEvent.stopPropagation();
          domEvent.preventDefault();
        }
        setTimeout(() => {
          setUserMenuOpen(false);
          handleLogout();
        }, 100);
      },
    },
  ];

  // Fix sidebar positioning: RTL (Arabic) = right side, LTR (English) = left side
  const sidebarStyle = !isMobile ? {
    overflow: "auto",
    height: "100vh",
    position: "fixed",
    top: 0,
    bottom: 0,
    [isRTL ? "right" : "left"]: 0,
    transition: "all 0.3s cubic-bezier(0.2, 0, 0, 1)",
    zIndex: 1000,
  } : { display: 'none' };

  const layoutStyle = !isMobile ? {
    transition: "all 0.3s cubic-bezier(0.2, 0, 0, 1)",
    [isRTL ? "marginRight" : "marginLeft"]: collapsed ? 80 : 250,
  } : {
    [isRTL ? "marginRight" : "marginLeft"]: 0,
  };

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div
        className={`p-4 sm:p-6 flex items-center justify-between border-b ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-gradient-to-r from-white to-gray-50"
        }`}
      >
        <div
          className={`flex items-center gap-3 transition-all duration-300 ${
            collapsed && !isMobile ? "justify-center w-full" : ""
          }`}
        >
          {settings.logo ? (
            <img
              src={settings.logo}
              alt="Logo"
              className={`${
                collapsed && !isMobile ? "w-15 h-12" : "h-10"
              } object-contain cursor-pointer transition-all duration-300`}
              onClick={() => navigate("/admin")}
            />
          ) : (
            <div
              className="w-12 h-12 bg-gradient-to-br from-olive-green-600 via-olive-green-500 to-turquoise-500 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 cursor-pointer"
              onClick={() => navigate("/admin")}
              style={{ backgroundColor: settings.primaryColor }}
            >
              <span className="text-white font-bold text-xl">
                {language === "ar"
                  ? settings.dashboardNameAr?.[0] || "ج"
                  : settings.dashboardName?.[0] || "J"}
              </span>
            </div>
          )}
          {!collapsed && !isMobile && (
            <div
              className="animate-fade-in cursor-pointer"
              onClick={() => navigate("/admin")}
            >
              <div
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => {
          navigate(key);
          if (isMobile) {
            setMobileMenuOpen(false);
          }
        }}
        className="border-0 mt-4 px-2 admin-menu"
        style={{
          background: "transparent",
        }}
      />

      {/* Collapse Button - Only show on desktop */}
      {!isMobile && (
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Button
            type="text"
            icon={
              collapsed ? (
                isRTL ? (
                  <DoubleLeftOutlined />
                ) : (
                  <DoubleRightOutlined />
                )
              ) : isRTL ? (
                <DoubleRightOutlined />
              ) : (
                <DoubleLeftOutlined />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
            className="w-full hover:bg-olive-green-50 text-olive-green-600 border border-olive-green-200 rounded-lg transition-all duration-300"
          >
            {!collapsed && (
              <span className="ml-2">
                {language === "ar" ? "طي" : "Collapse"}
              </span>
            )}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <Layout className="min-h-screen">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={250}
          className="admin-sidebar bg-gradient-to-b from-white to-gray-50 shadow-2xl border-r border-gray-200"
          style={sidebarStyle}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          title={
            <div className="flex items-center gap-3">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt="Logo"
                  className="h-10 object-contain"
                  onClick={() => {
                    navigate("/admin");
                    setMobileMenuOpen(false);
                  }}
                />
              ) : (
                <div
                  className="w-10 h-10 bg-gradient-to-br from-olive-green-600 via-olive-green-500 to-turquoise-500 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: settings.primaryColor }}
                  onClick={() => {
                    navigate("/admin");
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="text-white font-bold text-xl">
                    {language === "ar"
                      ? settings.dashboardNameAr?.[0] || "ج"
                      : settings.dashboardName?.[0] || "J"}
                  </span>
                </div>
              )}
            </div>
          }
          placement={isRTL ? "right" : "left"}
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
          className="admin-drawer"
          styles={{
            body: { padding: 0 },
          }}
        >
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </Drawer>
      )}

      <Layout style={layoutStyle} className="transition-all duration-300">
        <Header
          className="bg-white shadow-professional-lg px-3 sm:px-6 flex items-center justify-between fixed top-0 z-[1001] backdrop-blur-sm bg-white/95 glass-effect"
          style={{
            position: "fixed",
            width: isMobile ? '100%' : `calc(100% - ${collapsed ? 80 : 250}px)`,
            [isRTL ? "right" : "left"]: isMobile ? 0 : (collapsed ? 80 : 250),
            transition: "all 0.3s cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed)}
            className="text-lg hover:bg-olive-green-50 text-olive-green-600 rounded-lg transition-all duration-300"
            style={{ pointerEvents: "auto" }}
          />
          {!isMobile && (
            <Input
              placeholder={language === "ar" ? "بحث..." : "Search..."}
              prefix={<SearchOutlined className="text-gray-400" />}
              className="max-w-md mx-4 rounded-lg border-gray-200 focus:border-olive-green-500 transition-all duration-300 hidden md:block"
              allowClear
              style={{ pointerEvents: "auto" }}
            />
          )}
          <div
            className="flex items-center gap-2 sm:gap-4"
            style={{
              pointerEvents: "auto",
              position: "relative",
              zIndex: 1002,
            }}
          >
            <Button
              type="text"
              icon={<GlobalOutlined />}
              onClick={toggleLanguage}
              className="text-base sm:text-lg hover:bg-olive-green-50 text-olive-green-600 rounded-lg transition-all duration-300 font-semibold px-2 sm:px-4"
              title={
                language === "ar" ? "Switch to English" : "التبديل إلى العربية"
              }
              style={{ pointerEvents: "auto" }}
            >
              <span className="hidden xs:inline">{language === "ar" ? "EN" : "AR"}</span>
            </Button>
            <NotificationDropdown userId={user?.id} />
            <Button
              type="text"
              icon={<MessageOutlined />}
              className="text-base sm:text-lg hover:bg-olive-green-50 text-gray-600 rounded-lg transition-all duration-300 hidden sm:inline-flex"
              style={{ pointerEvents: "auto" }}
            />
            <Dropdown
              menu={{ items: userMenuItems }}
              placement={isRTL ? "bottomLeft" : "bottomRight"}
              trigger={["click"]}
              open={userMenuOpen}
              destroyTooltipOnHide={false}
              transitionName=""
              getPopupContainer={() => document.body}
              popupRender={(menu) => (
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {menu}
                </div>
              )}
              onOpenChange={(visible) => {
                // Only update if the change is intentional
                if (visible !== userMenuOpen) {
                  setUserMenuOpen(visible);
                }
              }}
            >
              <div className="flex items-center gap-1 sm:gap-2 cursor-pointer hover:bg-gray-100 px-2 sm:px-3 py-1 sm:py-2 rounded-lg group">
                <Avatar
                  src={user?.avatar || user?.admin?.profilePicture}
                  icon={<UserOutlined />}
                  size={isMobile ? 'default' : 'large'}
                  className="ring-2 ring-olive-green-200 group-hover:ring-olive-green-400 transition-all duration-300"
                />
                <span className="hidden lg:inline font-medium text-gray-700 text-sm sm:text-base">
                  {user?.admin
                    ? `${user.admin.firstName} ${user.admin.lastName}`
                    : user?.email || (language === "ar" ? "المدير" : "Admin")}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen admin-content"
          style={{ marginTop: isMobile ? "56px" : "64px" }}
        >
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
