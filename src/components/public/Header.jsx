import React, { useState } from "react";
import { Layout, Menu, Button, Drawer } from "antd";
import {
  MenuOutlined,
  UserOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

const { Header: AntHeader } = Layout;

const Header = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { key: "home", label: <Link to="/">{t("home")}</Link> },
    { key: "about", label: <Link to="/about">{t("about")}</Link> },
    { key: "services", label: <Link to="/services">{t("services")}</Link> },
    {
      key: "consultants",
      label: <Link to="/consultants">{t("consultants")}</Link>,
    },
    { key: "reports", label: <Link to="/reports">{t("reports")}</Link> },
    { key: "blog", label: <Link to="/blog">{t("blog")}</Link> },
    { key: "contact", label: <Link to="/contact">{t("contact")}</Link> },
  ];

  return (
    <AntHeader className="bg-white shadow-lg sticky top-0 z-50 px-4 md:px-8 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1a4d3a] to-[#2d5f4f] rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <BarChartOutlined className="text-white text-xl" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#1a4d3a] leading-tight">
                Jadwa
              </div>
              <div className="text-xs text-gray-500 leading-tight">جدوى</div>
            </div>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          <Menu
            mode="horizontal"
            items={menuItems}
            className="border-0 bg-transparent font-medium"
            style={{ minWidth: "600px" }}
          />
        </div>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <Button
            type="text"
            onClick={toggleLanguage}
            className="text-[#1a4d3a] hover:text-[#2d5f4f] font-medium"
          >
            {language === "ar" ? "EN" : "AR"}
          </Button>
          <Button
            type="text"
            icon={<UserOutlined />}
            onClick={() => navigate("/login")}
            className="text-gray-700 hover:text-[#1a4d3a] font-medium"
          >
            {t("login")}
          </Button>
          <Button
            type="primary"
            className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#c9a227] hover:to-[#e6c93d] border-0 text-[#1a4d3a] font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
            onClick={() => navigate("/register")}
          >
            {t("requestConsultation")}
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
        placement={language === "ar" ? "right" : "left"}
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
      >
        <Menu mode="vertical" items={menuItems} className="border-0" />
        <div className="mt-4 space-y-2">
          <Button block onClick={toggleLanguage} className="mb-2">
            {language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          </Button>
          <Button
            block
            type="primary"
            className="bg-olive-green-600"
            onClick={() => {
              navigate("/register");
              setMobileMenuOpen(false);
            }}
          >
            {t("requestConsultation")}
          </Button>
        </div>
      </Drawer>
    </AntHeader>
  );
};

export default Header;
