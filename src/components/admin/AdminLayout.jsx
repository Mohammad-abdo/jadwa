import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Input } from "antd";
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
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import NotificationDropdown from "../common/NotificationDropdown";

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, settings } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isRTL = language === "ar";

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
  const sidebarStyle = {
    overflow: "auto",
    height: "100vh",
    position: "fixed",
    top: 0,
    bottom: 0,
    [isRTL ? "right" : "left"]: 0,
    transition: "all 0.3s cubic-bezier(0.2, 0, 0, 1)",
    zIndex: 1000,
  };

  const layoutStyle = {
    transition: "all 0.3s cubic-bezier(0.2, 0, 0, 1)",
    [isRTL ? "marginRight" : "marginLeft"]: collapsed ? 80 : 250,
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        className="admin-sidebar bg-gradient-to-b from-white to-gray-50 shadow-2xl border-r border-gray-200"
        style={sidebarStyle}
      >
        {/* Logo Section */}
        <div
          className={`p-6 flex items-center justify-between border-b ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-gradient-to-r from-white to-gray-50"
          }`}
        >
          <div
            className={`flex items-center gap-3 transition-all duration-300 ${
              collapsed ? "justify-center w-full" : ""
            }`}
          >
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Logo"
                className={`${
                  collapsed ? "w-15 h-12" : "h-10"
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
            {!collapsed && (
              <div
                className="animate-fade-in cursor-pointer"
                onClick={() => navigate("/admin")}
              >
                {/* <div
                  className={`text-base font-bold ${
                    theme === "dark" ? "text-white" : "text-olive-green-700"
                  }`}
                  style={{ color: settings.primaryColor }}
                >
                  {language === "ar"
                    ? settings.dashboardNameAr || "جدوى"
                    : settings.dashboardName || "Jadwa"}
                </div> */}
                <div
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {/* {language === "ar" ? "لوحة التحكم" : "Admin Panel"} */}
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
          onClick={({ key }) => navigate(key)}
          className="border-0 mt-4 px-2 admin-menu"
          style={{
            background: "transparent",
          }}
        />

        {/* Collapse Button */}
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
      </Sider>

      <Layout style={layoutStyle} className="transition-all duration-300">
        <Header
          className="bg-white shadow-professional-lg px-6 flex items-center justify-between fixed top-0 z-[1001] backdrop-blur-sm bg-white/95 glass-effect"
          style={{
            position: "fixed",
            width: `calc(100% - ${collapsed ? 80 : 250}px)`,
            [isRTL ? "right" : "left"]: collapsed ? 80 : 250,
            transition: "all 0.3s cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg hover:bg-olive-green-50 text-olive-green-600 rounded-lg transition-all duration-300"
            style={{ pointerEvents: "auto" }}
          />
          <Input
            placeholder={language === "ar" ? "بحث..." : "Search..."}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="max-w-md mx-4 rounded-lg border-gray-200 focus:border-olive-green-500 transition-all duration-300"
            allowClear
            style={{ pointerEvents: "auto" }}
          />
          <div
            className="flex items-center gap-4"
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
              className="text-lg hover:bg-olive-green-50 text-olive-green-600 rounded-lg transition-all duration-300 font-semibold"
              title={
                language === "ar" ? "Switch to English" : "التبديل إلى العربية"
              }
              style={{ pointerEvents: "auto" }}
            >
              {language === "ar" ? "EN" : "AR"}
            </Button>
            <NotificationDropdown userId={user?.id} />
            <Button
              type="text"
              icon={<MessageOutlined />}
              className="text-lg hover:bg-olive-green-50 text-gray-600 rounded-lg transition-all duration-300"
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
              <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg group">
                <Avatar
                  src={user?.avatar || user?.admin?.profilePicture}
                  icon={<UserOutlined />}
                  className="ring-2 ring-olive-green-200 group-hover:ring-olive-green-400 transition-all duration-300"
                />
                <span className="hidden md:inline font-medium text-gray-700">
                  {user?.admin
                    ? `${user.admin.firstName} ${user.admin.lastName}`
                    : user?.email || (language === "ar" ? "المدير" : "Admin")}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          className="p-3 md:p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen admin-content"
          style={{ marginTop: "64px" }}
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
