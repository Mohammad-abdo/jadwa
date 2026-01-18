
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Button, Tag, Space, Input, Modal, Form, message, Spin, Alert, Select, Upload, Image } from 'antd'
import { EditOutlined, UserDeleteOutlined, SearchOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { adminAPI, filesAPI } from '../../services/api'

const AdminClients = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [resetPasswordModal, setResetPasswordModal] = useState({ visible: false, userId: null })
  const [clientModal, setClientModal] = useState({ visible: false, editing: null })
  const [form] = Form.useForm()
  const [clientForm] = Form.useForm()
  const [companyLogoUrl, setCompanyLogoUrl] = useState(null)

  useEffect(() => {
    fetchClients()
  }, [searchText, statusFilter])

  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (searchText) params.search = searchText
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await adminAPI.getClients(params)
      const formattedClients = response.clients.map(client => ({
        id: client.id,
        userId: client.user.id,
        name: `${client.firstName} ${client.lastName}`,
        email: client.user.email,
        phone: client.user.phone,
        sessions: client._count?.bookings || 0,
        lastLogin: client.user.lastLogin 
          ? new Date(client.user.lastLogin).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')
          : language === 'ar' ? 'لم يسجل دخول' : 'Never',
        status: client.user.isActive ? 'active' : 'suspended',
        isActive: client.user.isActive,
      }))
      setClients(formattedClients)
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError(err.message || 'Failed to load clients')
      message.error(language === 'ar' ? 'فشل تحميل العملاء' : 'Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus
      await adminAPI.toggleUserStatus(userId, newStatus)
      message.success(
        language === 'ar' 
          ? `تم ${newStatus ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`
          : `User ${newStatus ? 'activated' : 'suspended'} successfully`
      )
      fetchClients()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل تحديث الحالة' : 'Failed to update status'))
    }
  }

  const handleResetPassword = async (values) => {
    try {
      await adminAPI.resetUserPassword(resetPasswordModal.userId, values.newPassword)
      message.success(language === 'ar' ? 'تم إعادة تعيين كلمة المرور بنجاح' : 'Password reset successfully')
      setResetPasswordModal({ visible: false, userId: null })
      form.resetFields()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل إعادة تعيين كلمة المرور' : 'Failed to reset password'))
    }
  }

  const normalizeImageUrl = (url) => {
    if (!url) return null;
    
    // If it's a file:// path or Windows file path (C:\, D:\, etc.) anywhere in the URL, return null (invalid)
    if (/file:\/\//.test(url) || /[A-Za-z]:[\\\/]/.test(url) || /fakepath/i.test(url)) {
      return null;
    }
    
    // If it's already a full URL (http/https), return as is
    if (/^https?:\/\//.test(url)) {
      return url;
    }
    
    // If it's a relative path, construct full URL
    const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://jadwa.developteam.site';
    return url.startsWith('/') ? `${apiBase}${url}` : `${apiBase}/${url}`;
  };

  const handleCompanyLogoUpload = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ownerType', 'USER')
      formData.append('ownerId', clientModal.editing?.id || 'new')

      const uploadRes = await filesAPI.uploadFile(formData)
      if (uploadRes.success && uploadRes.file) {
        const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://jadwa.developteam.site'
        let logoUrl = uploadRes.file.fileUrl || uploadRes.file.url
        // Ensure it's a full URL, not a file path
        if (logoUrl && !/^https?:\/\//.test(logoUrl)) {
          logoUrl = logoUrl.startsWith('/') ? `${apiBase}${logoUrl}` : `${apiBase}/${logoUrl}`
        }
        // Normalize the URL to ensure it's valid
        const normalizedUrl = normalizeImageUrl(logoUrl)
        if (normalizedUrl) {
          setCompanyLogoUrl(normalizedUrl)
          clientForm.setFieldsValue({ companyLogo: normalizedUrl })
          message.success(language === 'ar' ? 'تم رفع الشعار بنجاح' : 'Logo uploaded successfully')
        } else {
          message.error(language === 'ar' ? 'فشل رفع الشعار: رابط غير صالح' : 'Failed to upload logo: Invalid URL')
        }
        return false // Prevent default upload
      }
    } catch (err) {
      console.error('Error uploading logo:', err)
      message.error(language === 'ar' ? 'فشل رفع الشعار' : 'Failed to upload logo')
    }
    return false
  }

  const handleClientSubmit = async (values) => {
    try {
      // Get the logo from form values first, then fallback to companyLogoUrl state
      const logoValue = clientForm.getFieldValue('companyLogo') || companyLogoUrl || values.companyLogo || null
      
      const clientData = {
        ...values,
        companyLogo: logoValue, // Use null for empty logos (backend handles this)
      }

      if (clientModal.editing) {
        await adminAPI.updateClient(clientModal.editing.id, clientData)
        message.success(language === 'ar' ? 'تم تحديث العميل بنجاح' : 'Client updated successfully')
      } else {
        await adminAPI.createClient(clientData)
        message.success(language === 'ar' ? 'تم إنشاء العميل بنجاح' : 'Client created successfully')
      }
      setClientModal({ visible: false, editing: null })
      setCompanyLogoUrl(null)
      clientForm.resetFields()
      fetchClients()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حفظ العميل' : 'Failed to save client'))
    }
  }

  const handleDeleteClient = async (id) => {
    try {
      await adminAPI.deleteClient(id)
      message.success(language === 'ar' ? 'تم حذف العميل بنجاح' : 'Client deleted successfully')
      fetchClients()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حذف العميل' : 'Failed to delete client'))
    }
  }

  const columns = [
    {
      title: language === 'ar' ? 'الاسم' : 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: language === 'ar' ? 'البريد الإلكتروني' : 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: language === 'ar' ? 'رقم الهاتف' : 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: language === 'ar' ? 'عدد الجلسات' : 'Sessions Count',
      dataIndex: 'sessions',
      key: 'sessions',
      sorter: (a, b) => a.sessions - b.sessions,
    },
    {
      title: language === 'ar' ? 'آخر تسجيل دخول' : 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const colors = {
          active: 'green',
          suspended: 'red',
        }
        const labels = {
          active: language === 'ar' ? 'نشط' : 'Active',
          suspended: language === 'ar' ? 'معلق' : 'Suspended',
        }
        return <Tag color={colors[status]}>{labels[status]}</Tag>
      },
      filters: [
        { text: language === 'ar' ? 'نشط' : 'Active', value: 'active' },
        { text: language === 'ar' ? 'معلق' : 'Suspended', value: 'suspended' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: language === 'ar' ? 'الإجراءات' : 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate(`/admin/clients/${record.id}`)}
          >
            {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={async () => {
              try {
                const clientData = await adminAPI.getClientById(record.id)
                const client = clientData.client
                const normalizedLogo = normalizeImageUrl(client?.companyLogo)
                setCompanyLogoUrl(normalizedLogo)
                clientForm.setFieldsValue({
                  firstName: client?.firstName || '',
                  lastName: client?.lastName || '',
                  email: client?.user?.email || '',
                  phone: client?.user?.phone || '',
                  city: client?.city || '',
                  sector: client?.sector || '',
                  companyName: client?.companyName || '',
                  companyLogo: normalizedLogo || null,
                })
                setClientModal({ visible: true, editing: record })
              } catch (err) {
                message.error(language === 'ar' ? 'فشل تحميل بيانات العميل' : 'Failed to load client data')
              }
            }}
          >
            {language === 'ar' ? 'تعديل' : 'Edit'}
          </Button>
          <Button
            type={record.isActive ? 'default' : 'primary'}
            onClick={() => handleToggleStatus(record.userId, record.isActive)}
          >
            {record.isActive 
              ? (language === 'ar' ? 'تعطيل' : 'Suspend')
              : (language === 'ar' ? 'تفعيل' : 'Activate')
            }
          </Button>
          <Button
            danger
            icon={<UserDeleteOutlined />}
            onClick={() => setResetPasswordModal({ visible: true, userId: record.userId })}
          >
            {language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
          </Button>
          <Button
            danger
            onClick={() => {
              if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا العميل؟' : 'Are you sure you want to delete this client?')) {
                handleDeleteClient(record.id)
              }
            }}
          >
            {language === 'ar' ? 'حذف' : 'Delete'}
          </Button>
        </Space>
      ),
    },
  ]

  if (error && !loading) {
    return (
      <Alert
        message={language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error Loading Data'}
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={fetchClients}>
            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        }
      />
    )
  }

  return (
    <div className="relative min-h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Premium Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-olive-green-50/20" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-olive-green-200/20 rounded-full blur-[100px] opacity-40 mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-turquoise-200/20 rounded-full blur-[100px] opacity-40 mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8">

      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 relative z-10">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3">
            {language === 'ar' ? 'العملاء' : 'Clients'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            {language === 'ar' ? 'إدارة جميع العملاء المسجلين' : 'Manage all registered clients'}
          </p>
        </div>
        <Space>
          <Input
            placeholder={language === 'ar' ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
            prefix={<SearchOutlined />}
            className="w-64"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Select.Option value="all">{language === 'ar' ? 'الكل' : 'All'}</Select.Option>
            <Select.Option value="active">{language === 'ar' ? 'نشط' : 'Active'}</Select.Option>
            <Select.Option value="inactive">{language === 'ar' ? 'معلق' : 'Inactive'}</Select.Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchClients}
            loading={loading}
          >
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </Button>
          <Button
            type="primary"
            className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
            onClick={() => {
              clientForm.resetFields()
              setCompanyLogoUrl(null)
              setClientModal({ visible: true, editing: null })
            }}
          >
            {language === 'ar' ? 'إضافة عميل جديد' : 'Add New Client'}
          </Button>
        </Space>
      </div>
      <Card className="glass-card shadow-professional-xl rounded-2xl border-0 relative z-10">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={clients}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => {
                return language === 'ar' ? `إجمالي ${total} عميل` : `Total ${total} clients`;
              }
            }}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </Card>

      <Modal
        title={language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
        open={resetPasswordModal.visible}
        onCancel={() => {
          setResetPasswordModal({ visible: false, userId: null })
          form.resetFields()
        }}
        maskClosable={true}
        keyboard={true}
        footer={null}
        destroyOnHidden={true}
        className="modern-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleResetPassword}
        >
          <Form.Item
            name="newPassword"
            label={language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
            rules={[
              { required: true, message: language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter password' },
              { min: 8, message: language === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters' }
            ]}
          >
            <Input.Password placeholder={language === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" className="bg-olive-green-600">
                {language === 'ar' ? 'حفظ' : 'Save'}
              </Button>
              <Button onClick={() => {
                setResetPasswordModal({ visible: false, userId: null })
                form.resetFields()
              }}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={clientModal.editing ? (language === 'ar' ? 'تعديل العميل' : 'Edit Client') : (language === 'ar' ? 'إضافة عميل جديد' : 'Add New Client')}
        open={clientModal.visible}
        onCancel={() => {
          setClientModal({ visible: false, editing: null })
          setCompanyLogoUrl(null)
          clientForm.resetFields()
        }}
        maskClosable={true}
        keyboard={true}
        footer={null}
        width={600}
        destroyOnHidden={true}
        className="modern-modal"
      >
        <Form
          form={clientForm}
          layout="vertical"
          onFinish={handleClientSubmit}
        >
          {!clientModal.editing && (
            <>
              <Form.Item
                name="email"
                label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                rules={[
                  { required: true, message: language === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter email' },
                  { type: 'email', message: language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email' }
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="password"
                label={language === 'ar' ? 'كلمة المرور' : 'Password'}
                rules={[
                  { required: !clientModal.editing, message: language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter password' },
                  { min: 8, message: language === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters' }
                ]}
              >
                <Input.Password />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="firstName"
            label={language === 'ar' ? 'الاسم الأول' : 'First Name'}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label={language === 'ar' ? 'اسم العائلة' : 'Last Name'}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label={language === 'ar' ? 'رقم الهاتف' : 'Phone'}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="city"
            label={language === 'ar' ? 'المدينة' : 'City'}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="sector"
            label={language === 'ar' ? 'القطاع' : 'Sector'}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="companyName"
            label={language === 'ar' ? 'اسم الشركة' : 'Company Name'}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="companyLogo"
            label={language === 'ar' ? 'شعار الشركة' : 'Company Logo'}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                beforeUpload={handleCompanyLogoUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>
                  {language === 'ar' ? 'رفع الشعار' : 'Upload Logo'}
                </Button>
              </Upload>
              {(() => {
                const currentLogo = companyLogoUrl || clientForm.getFieldValue('companyLogo')
                return currentLogo ? (
                  <Image
                    src={normalizeImageUrl(currentLogo)}
                    alt="Company Logo"
                    width={200}
                    height={100}
                    style={{ objectFit: 'contain' }}
                    onError={(e) => {
                      console.error('Failed to load logo:', currentLogo);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : null
              })()}
              <Input
                placeholder={language === 'ar' ? 'أو أدخل رابط الشعار' : 'Or enter logo URL'}
                value={companyLogoUrl || clientForm.getFieldValue('companyLogo') || ''}
                onChange={(e) => {
                  const urlValue = e.target.value.trim()
                  setCompanyLogoUrl(urlValue)
                  clientForm.setFieldsValue({ companyLogo: urlValue || null })
                }}
              />
            </Space>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" className="bg-olive-green-600">
                {language === 'ar' ? 'حفظ' : 'Save'}
              </Button>
              <Button onClick={() => {
                setClientModal({ visible: false, editing: null })
                clientForm.resetFields()
              }}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      </div>
    </div>
  )
}

export default AdminClients

