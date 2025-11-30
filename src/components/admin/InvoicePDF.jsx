import React from 'react'
import dayjs from 'dayjs'

const InvoicePDF = ({ invoice, language }) => {
  const getMethodLabel = (method) => {
    const labels = {
      CARD: language === 'ar' ? 'بطاقة' : 'Card',
      MADA: language === 'ar' ? 'مدى' : 'Mada',
      BANK_TRANSFER: language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer',
      APPLE_PAY: 'Apple Pay',
      GOOGLE_PAY: 'Google Pay',
    }
    return labels[method] || method
  }

  const getStatusLabel = (status) => {
    const labels = {
      COMPLETED: language === 'ar' ? 'مكتمل' : 'Completed',
      PENDING: language === 'ar' ? 'قيد الانتظار' : 'Pending',
      FAILED: language === 'ar' ? 'فشل' : 'Failed',
    }
    return labels[status] || status
  }

  return (
    <div
      id="invoice-content"
      style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '20mm',
        backgroundColor: '#fff',
        fontFamily: 'Arial, sans-serif',
        direction: language === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '3px solid #7a8c66',
          paddingBottom: '20px',
          marginBottom: '30px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#7a8c66',
                background: 'linear-gradient(135deg, #7a8c66 0%, #14b8a6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {language === 'ar' ? 'جدوى' : 'Jadwa'}
            </h1>
            <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
              {language === 'ar' ? 'منصة الاستشارات الإدارية والاقتصادية' : 'Administrative and Economic Consulting Platform'}
            </p>
          </div>
          <div style={{ textAlign: language === 'ar' ? 'left' : 'right' }}>
            <h2
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              {language === 'ar' ? 'فاتورة' : 'INVOICE'}
            </h2>
            <p style={{ margin: '5px 0', color: '#666', fontSize: '12px' }}>
              {language === 'ar' ? 'رقم الفاتورة' : 'Invoice Number'}
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>
              {language === 'ar' ? 'معلومات الفاتورة' : 'Invoice Information'}
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '5px 0', color: '#666', fontSize: '14px' }}>
                    {language === 'ar' ? 'رقم الفاتورة:' : 'Invoice Number:'}
                  </td>
                  <td style={{ padding: '5px 0', fontWeight: 'bold', fontSize: '14px' }}>
                    {invoice.invoiceNumber}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0', color: '#666', fontSize: '14px' }}>
                    {language === 'ar' ? 'تاريخ الإصدار:' : 'Issue Date:'}
                  </td>
                  <td style={{ padding: '5px 0', fontSize: '14px' }}>
                    {dayjs(invoice.date).format('YYYY-MM-DD')}
                  </td>
                </tr>
                {invoice.paidAt && (
                  <tr>
                    <td style={{ padding: '5px 0', color: '#666', fontSize: '14px' }}>
                      {language === 'ar' ? 'تاريخ الدفع:' : 'Paid Date:'}
                    </td>
                    <td style={{ padding: '5px 0', fontSize: '14px' }}>
                      {dayjs(invoice.paidAt).format('YYYY-MM-DD')}
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={{ padding: '5px 0', color: '#666', fontSize: '14px' }}>
                    {language === 'ar' ? 'رقم المعاملة:' : 'Transaction ID:'}
                  </td>
                  <td style={{ padding: '5px 0', fontSize: '14px' }}>
                    {invoice.transactionId || 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ flex: 1, textAlign: language === 'ar' ? 'right' : 'left' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>
              {language === 'ar' ? 'معلومات العميل' : 'Client Information'}
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '5px 0', color: '#666', fontSize: '14px' }}>
                    {language === 'ar' ? 'الاسم:' : 'Name:'}
                  </td>
                  <td style={{ padding: '5px 0', fontSize: '14px' }}>
                    {invoice.client?.name || (language === 'ar' ? 'غير محدد' : 'N/A')}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0', color: '#666', fontSize: '14px' }}>
                    {language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}
                  </td>
                  <td style={{ padding: '5px 0', fontSize: '14px' }}>
                    {invoice.client?.email || (language === 'ar' ? 'غير محدد' : 'N/A')}
                  </td>
                </tr>
                {invoice.client?.phone && (
                  <tr>
                    <td style={{ padding: '5px 0', color: '#666', fontSize: '14px' }}>
                      {language === 'ar' ? 'الهاتف:' : 'Phone:'}
                    </td>
                    <td style={{ padding: '5px 0', fontSize: '14px' }}>
                      {invoice.client.phone}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>
          {language === 'ar' ? 'تفاصيل الخدمة' : 'Service Details'}
        </h3>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #ddd',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th
                style={{
                  padding: '12px',
                  textAlign: language === 'ar' ? 'right' : 'left',
                  borderBottom: '2px solid #7a8c66',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {language === 'ar' ? 'الخدمة' : 'Service'}
              </th>
              <th
                style={{
                  padding: '12px',
                  textAlign: 'center',
                  borderBottom: '2px solid #7a8c66',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {language === 'ar' ? 'المستشار' : 'Consultant'}
              </th>
              <th
                style={{
                  padding: '12px',
                  textAlign: 'center',
                  borderBottom: '2px solid #7a8c66',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
              </th>
              <th
                style={{
                  padding: '12px',
                  textAlign: 'center',
                  borderBottom: '2px solid #7a8c66',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {language === 'ar' ? 'المبلغ' : 'Amount'}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                {invoice.service?.title || (language === 'ar' ? invoice.service?.titleAr : null) || (language === 'ar' ? 'غير محدد' : 'N/A')}
              </td>
              <td
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  textAlign: 'center',
                  fontSize: '14px',
                }}
              >
                {invoice.consultant?.name || (language === 'ar' ? 'غير محدد' : 'N/A')}
              </td>
              <td
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  textAlign: 'center',
                  fontSize: '14px',
                }}
              >
                {getMethodLabel(invoice.method)}
              </td>
              <td
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {typeof invoice.amount === 'string'
                  ? parseFloat(invoice.amount).toFixed(2)
                  : invoice.amount?.toFixed(2) || '0.00'}{' '}
                {invoice.currency || 'SAR'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '30px',
          marginBottom: '30px',
        }}
      >
        <div style={{ width: '300px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td
                  style={{
                    padding: '10px',
                    textAlign: language === 'ar' ? 'right' : 'left',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderTop: '2px solid #7a8c66',
                    borderBottom: '2px solid #7a8c66',
                  }}
                >
                  {language === 'ar' ? 'الإجمالي:' : 'Total:'}
                </td>
                <td
                  style={{
                    padding: '10px',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#7a8c66',
                    borderTop: '2px solid #7a8c66',
                    borderBottom: '2px solid #7a8c66',
                  }}
                >
                  {typeof invoice.amount === 'string'
                    ? parseFloat(invoice.amount).toFixed(2)
                    : invoice.amount?.toFixed(2) || '0.00'}{' '}
                  {invoice.currency || 'SAR'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Status */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
          {language === 'ar' ? 'حالة الدفع:' : 'Payment Status:'}{' '}
          <span style={{ fontWeight: 'bold', color: '#7a8c66' }}>
            {getStatusLabel(invoice.status)}
          </span>
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '50px',
          paddingTop: '20px',
          borderTop: '1px solid #ddd',
          textAlign: 'center',
          color: '#999',
          fontSize: '12px',
        }}
      >
        <p style={{ margin: '5px 0' }}>
          {language === 'ar'
            ? 'شكراً لاستخدامك منصة جدوى للاستشارات'
            : 'Thank you for using Jadwa Consulting Platform'}
        </p>
        <p style={{ margin: '5px 0' }}>
          {language === 'ar'
            ? 'للاستفسارات: info@jadwa.sa | الهاتف: 9200 00000'
            : 'For inquiries: info@jadwa.sa | Phone: 9200 00000'}
        </p>
      </div>
    </div>
  )
}

export default InvoicePDF

