import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Row,
  Col,
  Statistic,
  DatePicker,
  Input,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  DownloadOutlined,
  ExportOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useLanguage } from "../../contexts/LanguageContext";
import { adminAPI } from "../../services/api";
import { getCookie } from "../../utils/cookies";

const { RangePicker } = DatePicker;

const AdminReports = () => {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSessions: 0,
    totalClients: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format("YYYY-MM-DD");
        params.endDate = dateRange[1].format("YYYY-MM-DD");
      }

      const response = await adminAPI.getReports(params);
      setReports(response.reports || []);

      // Calculate stats
      const totalRevenue =
        response.reports?.reduce((sum, r) => sum + (r.revenue || 0), 0) || 0;
      const totalSessions = response.reports?.length || 0;
      setStats({
        totalRevenue,
        totalSessions,
        totalClients: response.stats?.totalClients || 0,
        averageRating: response.stats?.averageRating || 0,
      });
    } catch (err) {
      console.error("Error fetching reports:", err);
      message.error(
        language === "ar" ? "فشل تحميل التقارير" : "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const params = {};
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format("YYYY-MM-DD");
        params.endDate = dateRange[1].format("YYYY-MM-DD");
      }

      const token =
        localStorage.getItem("accessToken") || getCookie("accessToken") || "";
      const apiBase =
        import.meta.env.VITE_API_URL || "https://jadwa.developteam.site/api";
      const url = `${apiBase}/admin/reports/export/pdf?${new URLSearchParams(
        params
      ).toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const htmlContent = await response.text();

      // Create a blob and download as HTML (user can print to PDF)
      const blob = new Blob([htmlContent], { type: "text/html" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `reports-${dayjs().format("YYYY-MM-DD")}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // Also open in new window for printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        // Auto-trigger print dialog
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }

      message.success(
        language === "ar"
          ? "تم تحميل ملف PDF بنجاح - استخدم Print to PDF في المتصفح"
          : "PDF downloaded successfully - Use Print to PDF in browser"
      );
    } catch (err) {
      console.error("Export PDF error:", err);
      message.error(
        language === "ar" ? "فشل تحميل PDF" : "Failed to download PDF"
      );
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = {};
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format("YYYY-MM-DD");
        params.endDate = dateRange[1].format("YYYY-MM-DD");
      }
      const token =
        localStorage.getItem("accessToken") || getCookie("accessToken") || "";
      const apiBase =
        import.meta.env.VITE_API_URL || "https://jadwa.developteam.site/api";
      const url = `${apiBase}/admin/reports/export/csv?${new URLSearchParams(
        params
      ).toString()}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download CSV");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `reports-${dayjs().format("YYYY-MM-DD")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      message.success(
        language === "ar"
          ? "تم تحميل ملف CSV بنجاح"
          : "CSV downloaded successfully"
      );
    } catch (err) {
      console.error("Export CSV error:", err);
      message.error(
        language === "ar" ? "فشل تحميل CSV" : "Failed to download CSV"
      );
    }
  };

  const columns = [
    {
      title: language === "ar" ? "التاريخ" : "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: language === "ar" ? "الإيرادات" : "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (revenue) =>
        `${revenue || 0} ${language === "ar" ? "ريال" : "SAR"}`,
      sorter: (a, b) => (a.revenue || 0) - (b.revenue || 0),
    },
    {
      title: language === "ar" ? "عدد الجلسات" : "Sessions",
      dataIndex: "sessions",
      key: "sessions",
      sorter: (a, b) => (a.sessions || 0) - (b.sessions || 0),
    },
    {
      title: language === "ar" ? "عدد العملاء" : "Clients",
      dataIndex: "clients",
      key: "clients",
      sorter: (a, b) => (a.clients || 0) - (b.clients || 0),
    },
  ];

  return (
    <div className="relative min-h-screen pb-8 dashboard-bg">
      {/* Modern Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-br from-olive-green-100/40 to-turquoise-100/40 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-tr from-teal-100/40 to-olive-green-100/40 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 relative z-10">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3">
            {language === "ar" ? "التقارير" : "Reports"}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            {language === "ar"
              ? "تحميل وتصدير جميع التقارير"
              : "Download and export all reports"}
          </p>
        </div>
        <Space wrap>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            size="large"
            format="YYYY-MM-DD"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchReports}
            loading={loading}
            size="large"
          >
            {language === "ar" ? "تحديث" : "Refresh"}
          </Button>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={handleExportPDF}
            size="large"
            className="bg-red-600 hover:bg-red-700 border-0"
          >
            {language === "ar" ? "تحميل PDF" : "Download PDF"}
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            size="large"
            className="bg-green-600 hover:bg-green-700 border-0"
          >
            {language === "ar" ? "تحميل CSV" : "Download CSV"}
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="modern-kpi-card card-hover shadow-professional-lg border-0">
            <Statistic
              title={language === "ar" ? "إجمالي الإيرادات" : "Total Revenue"}
              value={stats.totalRevenue}
              prefix={<DollarOutlined className="text-olive-green-600" />}
              suffix="SAR"
              valueStyle={{
                color: "#7a8c66",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="modern-kpi-card card-hover shadow-professional-lg border-0">
            <Statistic
              title={language === "ar" ? "إجمالي الجلسات" : "Total Sessions"}
              value={stats.totalSessions}
              prefix={<CalendarOutlined className="text-blue-600" />}
              valueStyle={{
                color: "#1890ff",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="modern-kpi-card card-hover shadow-professional-lg border-0">
            <Statistic
              title={language === "ar" ? "إجمالي العملاء" : "Total Clients"}
              value={stats.totalClients}
              prefix={<UserOutlined className="text-green-600" />}
              valueStyle={{
                color: "#52c41a",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="modern-kpi-card card-hover shadow-professional-lg border-0">
            <Statistic
              title={language === "ar" ? "عدد التقارير" : "Total Reports"}
              value={reports.length}
              prefix={<FileTextOutlined className="text-purple-600" />}
              valueStyle={{
                color: "#722ed1",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Reports Table */}
      <Card className="glass-card shadow-professional-xl rounded-2xl border-0 relative z-10">
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => {
              return language === "ar"
                ? `إجمالي ${total} تقرير`
                : `Total ${total} reports`;
            },
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
        />
      </Card>
    </div>
  );
};

export default AdminReports;
