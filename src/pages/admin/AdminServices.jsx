import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  message, 
  Modal, 
  Form, 
  Input, 
  InputNumber,
  Select,
  Upload,
  Image,
  Row,
  Col,
  Statistic,
  Switch,
  Popconfirm,
  Tooltip,
  Badge
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  SearchOutlined,
  AppstoreOutlined,
  DollarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { servicesAPI, filesAPI } from '../../services/api'

const { TextArea } = Input

const AdminServices = () => {
  const { t, language } = useLanguage()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [serviceModalVisible, setServiceModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [form] = Form.useForm()
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revenue: 0
  })

  useEffect(() => {
    fetchServices()
  }, [searchText])

  useEffect(() => {
    calculateStats()
  }, [services])

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (searchText) params.search = searchText

      const response = await servicesAPI.getServices(params)
      const formattedServices = response.services.map(service => ({
        ...service,
        key: service.id,
        title: language === 'ar' ? service.titleAr || service.title : service.title,
      }))
      setServices(formattedServices)
    } catch (err) {
      console.error('Error fetching services:', err)
      setError(err.message || 'Failed to load services')
      message.error(language === 'ar' ? 'فشل تحميل الخدمات' : 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const total = services.length
    const active = services.filter(s => s.status === 'ACTIVE').length
    const revenue = services.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0)
    setStats({ total, active, revenue })
  }

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ownerType', 'SERVICE')
      formData.append('ownerId', editingItem?.id || 'new')

      const uploadRes = await filesAPI.uploadFile(formData)
      if (uploadRes.file && uploadRes.file.fileUrl) {
        setImageUrl(uploadRes.file.fileUrl)
        form.setFieldsValue({ image: uploadRes.file.fileUrl })
        message.success(language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully')
      } else {
        throw new Error('File upload failed')
      }
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image'))
    }
    return false // Prevent default upload behavior
  }

  const handleServiceSubmit = async (values) => {
    try {
      let imageUrlToSave = imageUrl || editingItem?.image
      
      // If image was uploaded, use the uploaded URL
      if (values.image && typeof values.image === 'string') {
        imageUrlToSave = values.image
      }

      const serviceData = {
        ...values,
        price: parseFloat(values.price),
        order: parseInt(values.order || 0),
        image: imageUrlToSave,
      }
      
      // Remove duration if it exists (not in schema)
      delete serviceData.duration

      if (editingItem) {
        await servicesAPI.updateService(editingItem.id, serviceData)
        message.success(language === 'ar' ? 'تم تحديث الخدمة بنجاح' : 'Service updated successfully')
      } else {
        await servicesAPI.createService(serviceData)
        message.success(language === 'ar' ? 'تم إنشاء الخدمة بنجاح' : 'Service created successfully')
      }
      setServiceModalVisible(false)
      setEditingItem(null)
      setImageUrl(null)
      form.resetFields()
      fetchServices()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حفظ الخدمة' : 'Failed to save service'))
    }
  }

  const handleDeleteService = async (id) => {
    try {
      await servicesAPI.deleteService(id)
      message.success(language === 'ar' ? 'تم حذف الخدمة بنجاح' : 'Service deleted successfully')
      fetchServices()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حذف الخدمة' : 'Failed to delete service'))
    }
  }

  const columns = [
    {
      title: language === 'ar' ? 'الخدمة' : 'Service',
      key: 'service',
      width: 300,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.icon ? (
            <div className="w-12 h-12 bg-gradient-to-br from-olive-green-400 to-turquoise-400 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">{record.icon}</span>
            </div>
          ) : (
            <AppstoreOutlined className="text-2xl text-olive-green-600" />
          )}
          <div>
            <div className="font-semibold text-gray-900">{record.title}</div>
            {record.category && (
              <Tag color="blue" className="mt-1">{record.category}</Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: language === 'ar' ? 'السعر' : 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => price ? `${price} ${language === 'ar' ? 'ريال' : 'SAR'}` : '-',
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
        </Tag>
      ),
    },
    {
      title: language === 'ar' ? 'الإجراءات' : 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={language === 'ar' ? 'تعديل' : 'Edit'}>
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditingItem(record)
                setImageUrl(record.image)
                form.setFieldsValue(record)
                setServiceModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title={language === 'ar' ? 'حذف' : 'Delete'}>
            <Popconfirm
              title={language === 'ar' ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Are you sure to delete this service?'}
              onConfirm={() => handleDeleteService(record.id)}
              okText={language === 'ar' ? 'نعم' : 'Yes'}
              cancelText={language === 'ar' ? 'لا' : 'No'}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div className="relative min-h-screen pb-8 dashboard-bg">
      {/* Modern Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-br from-olive-green-100/40 to-turquoise-100/40 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-tr from-teal-100/40 to-olive-green-100/40 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 relative z-10">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3">
            {language === 'ar' ? 'الخدمات' : 'Services'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            {language === 'ar' ? 'إدارة جميع الخدمات المتاحة' : 'Manage all available services'}
          </p>
        </div>
        <Space className="flex-wrap">
            <Input
              placeholder={language === 'ar' ? 'ابحث في الخدمات...' : 'Search services...'}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 250 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchServices}
              loading={loading}
            >
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-olive-green-600 hover:bg-olive-green-700 border-0 shadow-lg"
              size="large"
              onClick={() => {
                setEditingItem(null)
                setImageUrl(null)
                form.resetFields()
                setServiceModalVisible(true)
              }}
            >
              {language === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service'}
            </Button>
          </Space>
        </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="mb-6 relative z-10">
        <Col xs={24} sm={12} md={8}>
          <Card className="glass-card card-hover shadow-professional-lg border-0">
            <Statistic
              title={language === 'ar' ? 'إجمالي الخدمات' : 'Total Services'}
              value={stats.total}
              prefix={<AppstoreOutlined className="text-olive-green-600" />}
              valueStyle={{ color: '#7a8c66' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="glass-card card-hover shadow-professional-lg border-0">
            <Statistic
              title={language === 'ar' ? 'نشطة' : 'Active'}
              value={stats.active}
              prefix={<ClockCircleOutlined className="text-green-600" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="glass-card card-hover shadow-professional-lg border-0">
            <Statistic
              title={language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
              value={stats.revenue}
              prefix={<DollarOutlined className="text-blue-600" />}
              suffix="SAR"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Services Table */}
      <Card className="glass-card shadow-professional-xl rounded-2xl border-0 relative z-10">
        <Table
          columns={columns}
          dataSource={services}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => {
              return language === 'ar' ? `إجمالي ${total} خدمة` : `Total ${total} services`;
            },
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Service Modal */}
      <Modal
        title={editingItem ? (language === 'ar' ? 'تعديل الخدمة' : 'Edit Service') : (language === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service')}
        open={serviceModalVisible}
        onCancel={() => {
          setServiceModalVisible(false)
          setEditingItem(null)
          setImageUrl(null)
          form.resetFields()
        }}
        maskClosable={true}
        keyboard={true}
        footer={null}
        width={700}
        destroyOnHidden={true}
        className="modern-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleServiceSubmit}
          initialValues={editingItem || { status: 'ACTIVE' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="title" label={language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="titleAr" label={language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="description" label={language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}>
                <TextArea rows={4} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="descriptionAr" label={language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}>
                <TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="price" label={language === 'ar' ? 'السعر' : 'Price'}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label={language === 'ar' ? 'الفئة' : 'Category'} rules={[{ required: true }]}>
                <Select placeholder={language === 'ar' ? 'اختر الفئة' : 'Select Category'}>
                  <Select.Option value="ECONOMIC">{language === 'ar' ? 'اقتصادي' : 'Economic'}</Select.Option>
                  <Select.Option value="ADMINISTRATIVE">{language === 'ar' ? 'إداري' : 'Administrative'}</Select.Option>
                  <Select.Option value="FINANCIAL_ACCOUNTING">{language === 'ar' ? 'مالي ومحاسبي' : 'Financial & Accounting'}</Select.Option>
                  <Select.Option value="ANALYSIS_REPORTS">{language === 'ar' ? 'تحليل وتقارير' : 'Analysis & Reports'}</Select.Option>
                  <Select.Option value="FIELD_SURVEY">{language === 'ar' ? 'مسح ميداني' : 'Field Survey'}</Select.Option>
                  <Select.Option value="DIGITAL_CUSTOMER">{language === 'ar' ? 'عميل رقمي' : 'Digital Customer'}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="icon" label={language === 'ar' ? 'الأيقونة' : 'Icon'}>
                <Input placeholder={language === 'ar' ? 'رمز الأيقونة (emoji)' : 'Icon emoji'} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label={language === 'ar' ? 'الحالة' : 'Status'}>
                <Select>
                  <Select.Option value="ACTIVE">{language === 'ar' ? 'نشط' : 'Active'}</Select.Option>
                  <Select.Option value="INACTIVE">{language === 'ar' ? 'غير نشط' : 'Inactive'}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="image" label={language === 'ar' ? 'صورة الخدمة' : 'Service Image'}>
            <Upload
              name="image"
              listType="picture-card"
              maxCount={1}
              beforeUpload={handleImageUpload}
              accept="image/*"
              onRemove={() => {
                setImageUrl(null)
                form.setFieldsValue({ image: null })
              }}
            >
              {imageUrl || editingItem?.image ? (
                <img src={imageUrl || editingItem?.image} alt="service" style={{ width: '100%' }} />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>{language === 'ar' ? 'رفع صورة' : 'Upload'}</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" className="bg-olive-green-600">
                {language === 'ar' ? 'حفظ' : 'Save'}
              </Button>
              <Button onClick={() => {
                setServiceModalVisible(false)
                setEditingItem(null)
                setImageUrl(null)
                form.resetFields()
              }}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminServices


