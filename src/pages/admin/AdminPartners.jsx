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
  Upload,
  Image,
  Switch,
  Popconfirm,
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { partnersAPI, filesAPI } from '../../services/api'

const { TextArea } = Input

const AdminPartners = () => {
  const { language } = useLanguage()
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [partnerModalVisible, setPartnerModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchPartners()
  }, [])

  const normalizeImageUrl = (url) => {
    if (!url) return null;
    // If it's already a full URL (http/https), return as is
    if (/^https?:\/\//.test(url)) {
      return url;
    }
    // If it's a file:// path, return null (invalid)
    if (/^file:\/\//.test(url)) {
      return null;
    }
    // If it's a relative path, construct full URL
    const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return url.startsWith('/') ? `${apiBase}${url}` : `${apiBase}/${url}`;
  };

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const response = await partnersAPI.getPartners()
      // Normalize logo URLs to ensure they're proper URLs
      const normalizedPartners = (response.partners || []).map(partner => ({
        ...partner,
        logo: normalizeImageUrl(partner.logo)
      }))
      setPartners(normalizedPartners)
    } catch (err) {
      console.error('Error fetching partners:', err)
      message.error(language === 'ar' ? 'فشل تحميل الشركاء' : 'Failed to load partners')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      // Use USER for now until GENERAL is added to database enum via migration
      formData.append('ownerType', 'USER')
      formData.append('ownerId', editingItem?.id || 'new')

      const uploadRes = await filesAPI.uploadFile(formData)
      if (uploadRes.success && uploadRes.file) {
        const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
        let logoUrl = uploadRes.file.fileUrl || uploadRes.file.url
        // Ensure it's a full URL, not a file path
        if (logoUrl && !/^https?:\/\//.test(logoUrl)) {
          logoUrl = logoUrl.startsWith('/') ? `${apiBase}${logoUrl}` : `${apiBase}/${logoUrl}`
        }
        // Normalize the URL to ensure it's valid
        const normalizedUrl = normalizeImageUrl(logoUrl)
        setImageUrl(normalizedUrl)
        form.setFieldsValue({ logo: normalizedUrl })
        message.success(language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully')
        return false // Prevent default upload
      }
    } catch (err) {
      console.error('Error uploading image:', err)
      message.error(language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image')
    }
    return false
  }

  const handleSubmit = async (values) => {
    try {
      const partnerData = {
        ...values,
        logo: imageUrl || values.logo,
      }

      if (editingItem) {
        await partnersAPI.updatePartner(editingItem.id, partnerData)
        message.success(language === 'ar' ? 'تم تحديث الشريك بنجاح' : 'Partner updated successfully')
      } else {
        await partnersAPI.createPartner(partnerData)
        message.success(language === 'ar' ? 'تم إضافة الشريك بنجاح' : 'Partner created successfully')
      }

      setPartnerModalVisible(false)
      setEditingItem(null)
      setImageUrl(null)
      form.resetFields()
      fetchPartners()
    } catch (err) {
      console.error('Error saving partner:', err)
      message.error(language === 'ar' ? 'فشل حفظ الشريك' : 'Failed to save partner')
    }
  }

  const handleDelete = async (id) => {
    try {
      await partnersAPI.deletePartner(id)
      message.success(language === 'ar' ? 'تم حذف الشريك بنجاح' : 'Partner deleted successfully')
      fetchPartners()
    } catch (err) {
      console.error('Error deleting partner:', err)
      message.error(language === 'ar' ? 'فشل حذف الشريك' : 'Failed to delete partner')
    }
  }

  const handleEdit = (partner) => {
    setEditingItem(partner)
    // Normalize the logo URL when editing
    const normalizedLogo = normalizeImageUrl(partner.logo)
    setImageUrl(normalizedLogo)
    form.setFieldsValue({
      name: partner.name,
      nameAr: partner.nameAr,
      logo: normalizedLogo,
      website: partner.website,
      description: partner.description,
      descriptionAr: partner.descriptionAr,
      isActive: partner.isActive,
      order: partner.order,
    })
    setPartnerModalVisible(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setImageUrl(null)
    form.resetFields()
    setPartnerModalVisible(true)
  }

  const filteredPartners = partners.filter(partner =>
    partner.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    partner.nameAr?.toLowerCase().includes(searchText.toLowerCase())
  )

  const columns = [
    {
      title: language === 'ar' ? 'الشعار' : 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: 100,
      render: (logo) => {
        const normalizedLogo = normalizeImageUrl(logo);
        return normalizedLogo ? (
          <Image
            src={normalizedLogo}
            alt="Partner logo"
            width={80}
            height={50}
            style={{ objectFit: 'contain' }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling?.style?.setProperty('display', 'flex');
            }}
          />
        ) : (
          <div style={{ width: 80, height: 50, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {language === 'ar' ? 'لا يوجد' : 'No logo'}
          </div>
        );
      },
    },
    {
      title: language === 'ar' ? 'الاسم' : 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => language === 'ar' && record.nameAr ? record.nameAr : text,
    },
    {
      title: language === 'ar' ? 'الموقع الإلكتروني' : 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (website) => website ? (
        <a href={website} target="_blank" rel="noopener noreferrer">
          {website}
        </a>
      ) : '-',
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
        </Tag>
      ),
    },
    {
      title: language === 'ar' ? 'الترتيب' : 'Order',
      dataIndex: 'order',
      key: 'order',
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: language === 'ar' ? 'الإجراءات' : 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            {language === 'ar' ? 'تعديل' : 'Edit'}
          </Button>
          <Popconfirm
            title={language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?'}
            onConfirm={() => handleDelete(record.id)}
            okText={language === 'ar' ? 'نعم' : 'Yes'}
            cancelText={language === 'ar' ? 'لا' : 'No'}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
            >
              {language === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-olive-green-600 to-turquoise-500 bg-clip-text text-transparent mb-2">
              {language === 'ar' ? 'إدارة الشركاء' : 'Partners Management'}
            </h1>
            <p className="text-gray-500">
              {language === 'ar' ? 'إدارة شركاء المنصة وعرضهم في الصفحة الرئيسية' : 'Manage platform partners and display them on the homepage'}
            </p>
          </div>
          <Space>
            <Input
              placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchPartners}
              loading={loading}
            >
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
              onClick={handleAdd}
            >
              {language === 'ar' ? 'إضافة شريك جديد' : 'Add New Partner'}
            </Button>
          </Space>
        </div>
      </div>

      <Card className="shadow-lg rounded-xl border-0">
        <Table
          columns={columns}
          dataSource={filteredPartners}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => {
              return language === 'ar' ? `إجمالي ${total} شريك` : `Total ${total} partners`;
            },
          }}
        />
      </Card>

      <Modal
        title={editingItem ? (language === 'ar' ? 'تعديل الشريك' : 'Edit Partner') : (language === 'ar' ? 'إضافة شريك جديد' : 'Add New Partner')}
        open={partnerModalVisible}
        onCancel={() => {
          setPartnerModalVisible(false)
          setEditingItem(null)
          setImageUrl(null)
          form.resetFields()
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isActive: true, order: 0 }}
        >
          <Form.Item
            name="name"
            label={language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
            rules={[{ required: true, message: language === 'ar' ? 'يرجى إدخال الاسم' : 'Please enter name' }]}
          >
            <Input placeholder={language === 'ar' ? 'اسم الشريك بالإنجليزية' : 'Partner name in English'} />
          </Form.Item>

          <Form.Item
            name="nameAr"
            label={language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
          >
            <Input placeholder={language === 'ar' ? 'اسم الشريك بالعربية' : 'Partner name in Arabic'} />
          </Form.Item>

          <Form.Item
            name="logo"
            label={language === 'ar' ? 'الشعار' : 'Logo'}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                beforeUpload={handleImageUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>
                  {language === 'ar' ? 'رفع الشعار' : 'Upload Logo'}
                </Button>
              </Upload>
              {imageUrl && (
                <Image
                  src={normalizeImageUrl(imageUrl)}
                  alt="Partner logo"
                  width={200}
                  height={100}
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    console.error('Failed to load image:', imageUrl);
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <Input
                placeholder={language === 'ar' ? 'أو أدخل رابط الصورة' : 'Or enter image URL'}
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value)
                  form.setFieldsValue({ logo: e.target.value })
                }}
              />
            </Space>
          </Form.Item>

          <Form.Item
            name="website"
            label={language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item
            name="description"
            label={language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
          >
            <TextArea rows={3} placeholder={language === 'ar' ? 'وصف الشريك بالإنجليزية' : 'Partner description in English'} />
          </Form.Item>

          <Form.Item
            name="descriptionAr"
            label={language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
          >
            <TextArea rows={3} placeholder={language === 'ar' ? 'وصف الشريك بالعربية' : 'Partner description in Arabic'} />
          </Form.Item>

          <Form.Item
            name="order"
            label={language === 'ar' ? 'الترتيب' : 'Order'}
            tooltip={language === 'ar' ? 'رقم الترتيب لعرض الشركاء (الأقل يظهر أولاً)' : 'Order number for displaying partners (lower numbers appear first)'}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="isActive"
            label={language === 'ar' ? 'الحالة' : 'Status'}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" className="bg-olive-green-600 hover:bg-olive-green-700 border-0">
                {editingItem ? (language === 'ar' ? 'تحديث' : 'Update') : (language === 'ar' ? 'إضافة' : 'Add')}
              </Button>
              <Button onClick={() => {
                setPartnerModalVisible(false)
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

export default AdminPartners

