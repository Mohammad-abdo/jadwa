import React, { createContext, useContext, useState, useEffect } from "react";
import { ConfigProvider } from "antd";
import arEG from "antd/locale/ar_EG";
import enUS from "antd/locale/en_US";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

const translations = {
  ar: {
    // Header
    home: "الرئيسية",
    about: "من نحن",
    services: "الخدمات",
    consultants: "المستشارون",
    reports: "التقارير والتحليلات",
    blog: "المدونة",
    contact: "اتصل بنا",
    login: "تسجيل الدخول",
    myAccount: "حسابي",
    requestConsultation: "طلب استشارة",

    // Hero
    heroTitle: "نحو قرارات اقتصادية واستثمارية أكثر جدوى",
    heroSubtitle: "استشارات اقتصادية وإدارية قائمة على التحليلات والقياس",
    bookConsultation: "احجز استشارة الآن",
    exploreServices: "استكشف الخدمات",

    // Services
    services: "خدماتنا",
    economicConsulting: "الاستشارات الاقتصادية",
    feasibilityStudies: "دراسات الجدوى",
    economicAnalysis: "التحليل الاقتصادي والقياسي",
    videoConsultation: "استشارة فيديو/محادثة",
    reportsTemplates: "التقارير الاقتصادية والقوالب",

    // Consultants
    ourConsultants: "مستشارونا",
    viewAllConsultants: "عرض جميع المستشارين",

    // Platform
    smartPlatform: "المنصة الذكية",
    instantBooking: "حجز استشارة فوري",
    dashboardReports: "تقارير لوحة تحليلية",
    supportSectors: "دعم القطاعين الحكومي والخاص",

    // Reports
    reports: "التقارير",
    viewAllReports: "عرض جميع التقارير",
    saudiEconomy2025: "اتجاهات الاقتصاد السعودي 2025",
    meccaProjects: "تحليل تأثير المشاريع الضخمة - مكة",
    investmentIndex: "مؤشر نشاط الاستثمار جدوى",

    // Testimonials
    testimonials: "آراء العملاء",

    // Partners
    partners: "شركاؤنا",

    // Footer
    quickLinks: "روابط سريعة",
    contactInfo: "معلومات الاتصال",
    privacy: "سياسة الخصوصية",
    terms: "الشروط والأحكام",
    copyright: "© 2025 منصة جدوى للاستشارات",

    // Admin Dashboard
    dashboardOverview: "لوحة التحكم",
    platformPerformance: "نظرة عامة على أداء المنصة",
    activeClients: "العملاء النشطون",
    totalClients: "إجمالي العملاء",
    activeConsultants: "المستشارون النشطون",
    totalConsultants: "إجمالي المستشارين",
    completedSessions: "الجلسات المكتملة",
    totalSessions: "إجمالي الجلسات",
    pendingSessions: "الجلسات المعلقة",
    confirmedSessions: "الجلسات المؤكدة",
    monthlyRevenue: "الإيرادات الشهرية",
    totalRevenue: "إجمالي الإيرادات",
    revenueGrowth: "نمو الإيرادات",
    averageRating: "متوسط التقييم",
    totalRatings: "إجمالي التقييمات",
    cancelledSessions: "الجلسات الملغاة",
    totalBookings: "إجمالي الحجوزات",
    totalServices: "إجمالي الخدمات",
    activeServices: "الخدمات النشطة",
    totalArticles: "إجمالي المقالات",
    publishedArticles: "المقالات المنشورة",
    totalPayments: "إجمالي المدفوعات",
    pendingPayments: "المدفوعات المعلقة",
    totalReports: "إجمالي التقارير",
    monthlyRevenueTrend: "اتجاه الإيرادات الشهرية",
    sessionsStatus: "حالة الجلسات",
    servicesDistribution: "توزيع الخدمات",
    performanceComparison: "مقارنة الأداء",
    topConsultants: "أفضل المستشارين",
    recentBookings: "الحجوزات الأخيرة",
    revenueByMonth: "الإيرادات حسب الشهر",
    sessionsByStatus: "الجلسات حسب الحالة",
  },
  en: {
    // Header
    home: "Home",
    about: "About",
    services: "Services",
    consultants: "Consultants",
    reports: "Reports & Analytics",
    blog: "Blog",
    contact: "Contact Us",
    login: "Login",
    myAccount: "My Account",
    requestConsultation: "Request Consultation",

    // Hero
    heroTitle: "Towards More Viable Economic and Investment Decisions",
    heroSubtitle:
      "Economic and administrative consulting based on analytics and measurement",
    bookConsultation: "Book Consultation Now",
    exploreServices: "Explore Services",

    // Services
    services: "Our Services",
    economicConsulting: "Economic Consultations",
    feasibilityStudies: "Feasibility Studies",
    economicAnalysis: "Economic & Econometric Analysis",
    videoConsultation: "Video/Chat Consultation",
    reportsTemplates: "Economic Reports & Templates",

    // Consultants
    ourConsultants: "Our Consultants",
    viewAllConsultants: "View All Consultants",

    // Platform
    smartPlatform: "Smart Platform",
    instantBooking: "Instant Consultation Booking",
    dashboardReports: "Analytical Dashboard Reports",
    supportSectors: "Support for Government & Private Sectors",

    // Reports
    reports: "Reports",
    viewAllReports: "View All Reports",
    saudiEconomy2025: "Saudi Economy Trends 2025",
    meccaProjects: "Mega Projects Impact Analysis – Makkah",
    investmentIndex: "Jadwa Investment Activity Index",

    // Testimonials
    testimonials: "Testimonials",

    // Partners
    partners: "Our Partners",

    // Footer
    quickLinks: "Quick Links",
    contactInfo: "Contact Information",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    copyright: "© 2025 Jadwa Consulting Platform",

    // Admin Dashboard
    dashboardOverview: "Dashboard Overview",
    platformPerformance: "Platform performance overview",
    activeClients: "Active Clients",
    totalClients: "Total Clients",
    activeConsultants: "Active Consultants",
    totalConsultants: "Total Consultants",
    completedSessions: "Completed Sessions",
    totalSessions: "Total Sessions",
    pendingSessions: "Pending Sessions",
    confirmedSessions: "Confirmed Sessions",
    monthlyRevenue: "Monthly Revenue",
    totalRevenue: "Total Revenue",
    revenueGrowth: "Revenue Growth",
    averageRating: "Average Rating",
    totalRatings: "Total Ratings",
    cancelledSessions: "Cancelled Sessions",
    totalBookings: "Total Bookings",
    totalServices: "Total Services",
    activeServices: "Active Services",
    totalArticles: "Total Articles",
    publishedArticles: "Published Articles",
    totalPayments: "Total Payments",
    pendingPayments: "Pending Payments",
    totalReports: "Total Reports",
    monthlyRevenueTrend: "Monthly Revenue Trend",
    sessionsStatus: "Sessions Status",
    servicesDistribution: "Services Distribution",
    performanceComparison: "Performance Comparison",
    topConsultants: "Top Consultants",
    recentBookings: "Recent Bookings",
    revenueByMonth: "Revenue by Month",
    sessionsByStatus: "Sessions by Status",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "ar";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.setAttribute(
      "dir",
      language === "ar" ? "rtl" : "ltr"
    );
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ar" ? "en" : "ar"));
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const antdLocale = language === "ar" ? arEG : enUS;

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t }}
    >
      <ConfigProvider
        locale={antdLocale}
        direction={language === "ar" ? "rtl" : "ltr"}
      >
        {children}
      </ConfigProvider>
    </LanguageContext.Provider>
  );
};
