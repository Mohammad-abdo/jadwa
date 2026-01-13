import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Select,
  Input,
  message,
  Alert,
  Statistic,
  Row,
  Col,
  DatePicker,
  Form,
  Modal,
} from "antd";
import {
  DownloadOutlined,
  ReloadOutlined,
  SearchOutlined,
  DollarOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useLanguage } from "../../contexts/LanguageContext";
import { adminAPI } from "../../services/api";
import { getCookie } from "../../utils/cookies";
import InvoicePDF from "../../components/admin/InvoicePDF";

const { RangePicker } = DatePicker;

const AdminPayments = () => {
  const { t, language } = useLanguage();
  const [payments, setPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [clientFilter, setClientFilter] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterForm] = Form.useForm();
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [summary, setSummary] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const applyFilters = (paymentsList) => {
    let filtered = [...paymentsList];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Method filter
    if (methodFilter !== "all") {
      filtered = filtered.filter((p) => p.method === methodFilter);
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const startDate = dayjs(dateRange[0]).startOf("day");
      const endDate = dayjs(dateRange[1]).endOf("day");
      filtered = filtered.filter((p) => {
        const paymentDate = dayjs(p.date);
        return paymentDate.isAfter(startDate) && paymentDate.isBefore(endDate);
      });
    }

    // Client filter
    if (clientFilter) {
      filtered = filtered.filter((p) =>
        p.client.toLowerCase().includes(clientFilter.toLowerCase())
      );
    }

    setPayments(filtered);
  };

  useEffect(() => {
    if (allPayments.length > 0) {
      applyFilters(allPayments);
    }
  }, [statusFilter, methodFilter, dateRange, clientFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await adminAPI.getPayments(params);
      const formattedPayments = (response.payments || []).map((payment) => {
        // Handle amount conversion (Prisma Decimal returns as string)
        const amount =
          typeof payment.amount === "string"
            ? parseFloat(payment.amount)
            : payment.amount
            ? parseFloat(payment.amount)
            : 0;

        // Get client name from booking
        let clientName = language === "ar" ? "غير متوفر" : "N/A";
        if (payment.booking?.client) {
          clientName =
            `${payment.booking.client.firstName || ""} ${
              payment.booking.client.lastName || ""
            }`.trim() || clientName;
        }

        // Get consultant name from booking
        let consultantName = language === "ar" ? "غير متوفر" : "N/A";
        if (payment.booking?.consultant) {
          consultantName =
            `${payment.booking.consultant.firstName || ""} ${
              payment.booking.consultant.lastName || ""
            }`.trim() || consultantName;
        }

        return {
          id: payment.id,
          invoiceNumber: payment.invoiceNumber,
          client: clientName,
          consultant: consultantName,
          amount: isNaN(amount) ? 0 : amount,
          date: payment.createdAt
            ? dayjs(payment.createdAt).format("YYYY-MM-DD HH:mm")
            : "-",
          paidAt: payment.paidAt
            ? dayjs(payment.paidAt).format("YYYY-MM-DD HH:mm")
            : null,
          status: payment.status,
          method: payment.method,
          transactionId: payment.transactionId,
          currency: payment.currency || "SAR",
          service: payment.booking?.service
            ? language === "ar"
              ? payment.booking.service.titleAr || payment.booking.service.title
              : payment.booking.service.title
            : "-",
        };
      });

      // Calculate summary - ensure amounts are numbers
      const total = formattedPayments.reduce((sum, p) => {
        const amount =
          typeof p.amount === "string" ? parseFloat(p.amount) : p.amount || 0;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      const completed = formattedPayments
        .filter((p) => p.status === "COMPLETED")
        .reduce((sum, p) => {
          const amount =
            typeof p.amount === "string" ? parseFloat(p.amount) : p.amount || 0;
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

      const pending = formattedPayments.filter(
        (p) => p.status === "PENDING"
      ).length;

      const failed = formattedPayments.filter(
        (p) => p.status === "FAILED"
      ).length;

      setSummary({
        total: Number(total.toFixed(2)),
        completed: Number(completed.toFixed(2)),
        pending,
        failed,
      });
      setAllPayments(formattedPayments);
      applyFilters(formattedPayments);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.message || "Failed to load payments");
      message.error(
        language === "ar" ? "فشل تحميل المدفوعات" : "Failed to load payments"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      COMPLETED: "green",
      PENDING: "orange",
      FAILED: "red",
      REFUNDED: "purple",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      COMPLETED: language === "ar" ? "مكتمل" : "Completed",
      PENDING: language === "ar" ? "قيد الانتظار" : "Pending",
      FAILED: language === "ar" ? "فشل" : "Failed",
      REFUNDED: language === "ar" ? "مسترد" : "Refunded",
    };
    return labels[status] || status;
  };

  const getMethodLabel = (method) => {
    const labels = {
      CARD: language === "ar" ? "بطاقة" : "Card",
      MADA: language === "ar" ? "مدى" : "Mada",
      BANK_TRANSFER: language === "ar" ? "تحويل بنكي" : "Bank Transfer",
      APPLE_PAY: "Apple Pay",
      GOOGLE_PAY: "Google Pay",
    };
    return labels[method] || method;
  };

  const handleExportCSV = async () => {
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (methodFilter !== "all") params.method = methodFilter;
      const token = localStorage.getItem("accessToken") || "";
      const url = `${
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      }/admin/payments/export/csv?${new URLSearchParams(params).toString()}`;

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
      link.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      message.success(
        language === "ar"
          ? "تم تصدير ملف CSV بنجاح"
          : "CSV exported successfully"
      );
    } catch (err) {
      console.error("Export CSV error:", err);
      message.error(
        language === "ar" ? "فشل تصدير CSV" : "Failed to export CSV"
      );
    }
  };

  const handleExportExcel = () => {
    try {
      // Create CSV content
      const headers = [
        language === "ar" ? "رقم الفاتورة" : "Invoice #",
        language === "ar" ? "العميل" : "Client",
        language === "ar" ? "المستشار" : "Consultant",
        language === "ar" ? "المبلغ" : "Amount",
        language === "ar" ? "طريقة الدفع" : "Payment Method",
        language === "ar" ? "التاريخ" : "Date",
        language === "ar" ? "الحالة" : "Status",
      ];

      const csvContent = [
        headers.join(","),
        ...payments.map((p) =>
          [
            p.invoiceNumber || "",
            `"${p.client}"`,
            `"${p.consultant}"`,
            p.amount,
            p.method,
            p.date,
            p.status,
          ].join(",")
        ),
      ].join("\n");

      // Add BOM for Excel UTF-8 support
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success(
        language === "ar"
          ? "تم تصدير ملف Excel بنجاح"
          : "Excel exported successfully"
      );
    } catch (err) {
      console.error("Export Excel error:", err);
      message.error(
        language === "ar" ? "فشل تصدير Excel" : "Failed to export Excel"
      );
    }
  };

  const handleExportPDF = () => {
    message.info(
      language === "ar"
        ? "ميزة تصدير PDF قيد التطوير"
        : "PDF export feature is under development"
    );
  };

  const handleFilterSubmit = (values) => {
    setStatusFilter(values.status || "all");
    setMethodFilter(values.method || "all");
    setDateRange(values.dateRange || null);
    setClientFilter(values.client || "");
    setFilterModalVisible(false);
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setMethodFilter("all");
    setDateRange(null);
    setClientFilter("");
    filterForm.resetFields();
  };

  const columns = [
    {
      title: language === "ar" ? "رقم الفاتورة" : "Invoice #",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
    },
    {
      title: language === "ar" ? "العميل" : "Client",
      dataIndex: "client",
      key: "client",
      sorter: (a, b) => a.client.localeCompare(b.client),
    },
    {
      title: language === "ar" ? "المستشار" : "Consultant",
      dataIndex: "consultant",
      key: "consultant",
    },
    {
      title: language === "ar" ? "الخدمة" : "Service",
      dataIndex: "service",
      key: "service",
    },
    {
      title: language === "ar" ? "المبلغ" : "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => {
        const numAmount =
          typeof amount === "string" ? parseFloat(amount) : amount || 0;
        return `${isNaN(numAmount) ? 0 : numAmount.toFixed(2)} ${
          record.currency || "SAR"
        }`;
      },
      sorter: (a, b) => {
        const amountA =
          typeof a.amount === "string" ? parseFloat(a.amount) : a.amount || 0;
        const amountB =
          typeof b.amount === "string" ? parseFloat(b.amount) : b.amount || 0;
        return (isNaN(amountA) ? 0 : amountA) - (isNaN(amountB) ? 0 : amountB);
      },
    },
    {
      title: language === "ar" ? "طريقة الدفع" : "Payment Method",
      dataIndex: "method",
      key: "method",
      render: (method) => getMethodLabel(method),
    },
    {
      title: language === "ar" ? "التاريخ" : "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: language === "ar" ? "الحالة" : "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
      filters: [
        { text: language === "ar" ? "مكتمل" : "Completed", value: "COMPLETED" },
        {
          text: language === "ar" ? "قيد الانتظار" : "Pending",
          value: "PENDING",
        },
        { text: language === "ar" ? "فشل" : "Failed", value: "FAILED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: language === "ar" ? "الإجراءات" : "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          icon={<DownloadOutlined />}
          onClick={async () => {
            try {
              const token = localStorage.getItem("accessToken") || "";
              const url = `${
                import.meta.env.VITE_API_URL || "http://localhost:5000/api"
              }/admin/payments/${record.id}/invoice`;
              const response = await fetch(url, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              const data = await response.json();

              if (data.success && data.invoice) {
                setSelectedInvoice(data.invoice);
                setInvoiceModalVisible(true);
              } else {
                message.error(
                  language === "ar"
                    ? "فشل تحميل بيانات الفاتورة"
                    : "Failed to load invoice data"
                );
              }
            } catch (err) {
              message.error(
                language === "ar"
                  ? "فشل تحميل الفاتورة"
                  : "Failed to download invoice"
              );
            }
          }}
          disabled={record.status !== "COMPLETED"}
        >
          {language === "ar" ? "فاتورة" : "Invoice"}
        </Button>
      ),
    },
  ];

  if (error && !loading) {
    return (
      <Alert
        message={
          language === "ar" ? "خطأ في تحميل البيانات" : "Error Loading Data"
        }
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={fetchPayments}>
            {language === "ar" ? "إعادة المحاولة" : "Retry"}
          </Button>
        }
      />
    );
  }

  return (
    <div className="relative min-h-screen pb-8 dashboard-bg">
      {/* Modern Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-br from-olive-green-100/40 to-turquoise-100/40 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-tr from-teal-100/40 to-olive-green-100/40 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 relative z-10">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3">
            {language === "ar" ? "المدفوعات" : "Payments"}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            {language === "ar"
              ? "إدارة جميع المعاملات المالية"
              : "Manage all financial transactions"}
          </p>
        </div>
        <Space className="flex-wrap">
          <Button
            icon={<FilterOutlined />}
            onClick={() => setFilterModalVisible(true)}
          >
            {language === "ar" ? "فلترة متقدمة" : "Advanced Filter"}
          </Button>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Select.Option value="all">
              {language === "ar" ? "الكل" : "All"}
            </Select.Option>
            <Select.Option value="COMPLETED">
              {language === "ar" ? "مكتمل" : "Completed"}
            </Select.Option>
            <Select.Option value="PENDING">
              {language === "ar" ? "قيد الانتظار" : "Pending"}
            </Select.Option>
            <Select.Option value="FAILED">
              {language === "ar" ? "فشل" : "Failed"}
            </Select.Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchPayments}
            loading={loading}
          >
            {language === "ar" ? "تحديث" : "Refresh"}
          </Button>
          <Space.Compact>
            <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
              {language === "ar" ? "Excel" : "Excel"}
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
              {language === "ar" ? "CSV" : "CSV"}
            </Button>
            <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>
              {language === "ar" ? "PDF" : "PDF"}
            </Button>
          </Space.Compact>
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={language === "ar" ? "إجمالي المدفوعات" : "Total Payments"}
              value={Number(summary.total).toFixed(2)}
              prefix={<DollarOutlined />}
              suffix="SAR"
              valueStyle={{ color: "#7a8c66" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={language === "ar" ? "المكتملة" : "Completed"}
              value={Number(summary.completed).toFixed(2)}
              prefix={<DollarOutlined />}
              suffix="SAR"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={language === "ar" ? "قيد الانتظار" : "Pending"}
              value={summary.pending}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={language === "ar" ? "فاشلة" : "Failed"}
              value={summary.failed}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="glass-card shadow-professional-xl rounded-2xl border-0 relative z-10">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={payments}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => {
                return language === "ar"
                  ? `إجمالي ${total} دفعة`
                  : `Total ${total} payments`;
              },
            }}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </Card>

      {/* Advanced Filter Modal */}
      <Modal
        title={language === "ar" ? "فلترة متقدمة" : "Advanced Filter"}
        open={filterModalVisible}
        onCancel={() => setFilterModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={filterForm}
          layout="vertical"
          onFinish={handleFilterSubmit}
          initialValues={{
            status: statusFilter,
            method: methodFilter,
            dateRange: dateRange,
            client: clientFilter,
          }}
        >
          <Form.Item
            name="status"
            label={language === "ar" ? "الحالة" : "Status"}
          >
            <Select
              placeholder={language === "ar" ? "اختر الحالة" : "Select status"}
            >
              <Select.Option value="all">
                {language === "ar" ? "الكل" : "All"}
              </Select.Option>
              <Select.Option value="COMPLETED">
                {language === "ar" ? "مكتمل" : "Completed"}
              </Select.Option>
              <Select.Option value="PENDING">
                {language === "ar" ? "قيد الانتظار" : "Pending"}
              </Select.Option>
              <Select.Option value="FAILED">
                {language === "ar" ? "فشل" : "Failed"}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="method"
            label={language === "ar" ? "طريقة الدفع" : "Payment Method"}
          >
            <Select
              placeholder={
                language === "ar" ? "اختر طريقة الدفع" : "Select payment method"
              }
            >
              <Select.Option value="all">
                {language === "ar" ? "الكل" : "All"}
              </Select.Option>
              <Select.Option value="CARD">
                {language === "ar" ? "بطاقة" : "Card"}
              </Select.Option>
              <Select.Option value="MADA">
                {language === "ar" ? "مدى" : "Mada"}
              </Select.Option>
              <Select.Option value="BANK_TRANSFER">
                {language === "ar" ? "تحويل بنكي" : "Bank Transfer"}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="dateRange"
            label={language === "ar" ? "نطاق التاريخ" : "Date Range"}
          >
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="client"
            label={language === "ar" ? "اسم العميل" : "Client Name"}
          >
            <Input
              placeholder={language === "ar" ? "ابحث عن عميل" : "Search client"}
              allowClear
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {language === "ar" ? "تطبيق" : "Apply"}
              </Button>
              <Button onClick={handleResetFilters}>
                {language === "ar" ? "إعادة تعيين" : "Reset"}
              </Button>
              <Button onClick={() => setFilterModalVisible(false)}>
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Invoice Modal */}
      <Modal
        title={language === "ar" ? "فاتورة" : "Invoice"}
        open={invoiceModalVisible}
        onCancel={() => {
          setInvoiceModalVisible(false);
          setSelectedInvoice(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setInvoiceModalVisible(false);
              setSelectedInvoice(null);
            }}
          >
            {language === "ar" ? "إغلاق" : "Close"}
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => {
              if (!selectedInvoice) return;
              
              // Create a new window with the invoice content
              const printWindow = window.open("", "_blank");
              if (!printWindow) {
                message.error(
                  language === "ar"
                    ? "يرجى السماح بالنوافذ المنبثقة لتحميل الفاتورة"
                    : "Please allow popups to download invoice"
                );
                return;
              }

              printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Invoice ${selectedInvoice.invoiceNumber}</title>
                    <style>
                      @media print {
                        @page {
                          size: A4;
                          margin: 0;
                        }
                        body {
                          margin: 0;
                          padding: 0;
                        }
                      }
                    </style>
                  </head>
                  <body>
                    ${document.getElementById("invoice-print-content")?.innerHTML || ""}
                  </body>
                </html>
              `);
              printWindow.document.close();

              // Wait for content to load, then print
              setTimeout(() => {
                printWindow.print();
                message.success(
                  language === "ar"
                    ? "جاري تحميل الفاتورة..."
                    : "Downloading invoice..."
                );
              }, 250);
            }}
            className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
          >
            {language === "ar" ? "تحميل PDF" : "Download PDF"}
          </Button>,
        ]}
        width={900}
        style={{ top: 20 }}
      >
        <div id="invoice-print-content" style={{ display: "none" }}>
          {selectedInvoice && <InvoicePDF invoice={selectedInvoice} language={language} />}
        </div>
        <div style={{ maxHeight: "70vh", overflow: "auto" }}>
          {selectedInvoice && <InvoicePDF invoice={selectedInvoice} language={language} />}
        </div>
      </Modal>
    </div>
  );
};

export default AdminPayments;
