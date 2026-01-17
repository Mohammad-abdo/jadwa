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
  Switch,
  Upload,
  Image,
  Row,
  Col,
  Popconfirm,
  Tooltip
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  UploadOutlined,
  PictureOutlined
} from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { slidersAPI, filesAPI } from '../../services/api'

const { TextArea } = Input

const AdminSliders = () => {
  const { t, language } = useLanguage()
  const [sliders, setSliders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sliderModalVisible, setSliderModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [iconUrl, setIconUrl] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchSliders()
  }, [])

  const fetchSliders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await slidersAPI.getSliders()
      const formattedSliders = response.sliders.map(slider => ({
        ...slider,
        key: slider.id,
        title: language === 'ar' ? slider.titleAr || slider.title : slider.title,
      }))
      setSliders(formattedSliders)
    } catch (err) {
      console.error('Error fetching sliders:', err)
      setError(err.message || 'Failed to load sliders')
      message.error(language === 'ar' ? 'فشل تحميل السلايدرات' : 'Failed to load sliders')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ownerType', 'GENERAL')
      
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
    return false
  }

  const handleIconUpload = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ownerType', 'GENERAL')
      
      const uploadRes = await filesAPI.uploadFile(formData)
      if (uploadRes.file && uploadRes.file.fileUrl) {
        setIconUrl(uploadRes.file.fileUrl)
        form.setFieldsValue({ icon: uploadRes.file.fileUrl })
        message.success(language === 'ar' ? 'تم رفع الأيقونة بنجاح' : 'Icon uploaded successfully')
      } else {
        throw new Error('File upload failed')
      }
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل رفع الأيقونة' : 'Failed to upload icon'))
    }
    return false
  }

  const handleSliderSubmit = async (values) => {
    try {
      let imageUrlToSave = imageUrl || editingItem?.image
      let iconUrlToSave = iconUrl || editingItem?.icon
      
      if (values.image && typeof values.image === 'string') {
        imageUrlToSave = values.image
      }
      if (values.icon && typeof values.icon === 'string') {
        iconUrlToSave = values.icon
      }

      const sliderData = {
        ...values,
        order: parseInt(values.order || 0),
        image: imageUrlToSave,
        icon: iconUrlToSave || null,
        isActive: values.isActive !== undefined ? values.isActive : true,
      }

      if (editingItem) {
        await slidersAPI.updateSlider(editingItem.id, sliderData)
        message.success(language === 'ar' ? 'تم تحديث السلايدر بنجاح' : 'Slider updated successfully')
      } else {
        await slidersAPI.createSlider(sliderData)
        message.success(language === 'ar' ? 'تم إنشاء السلايدر بنجاح' : 'Slider created successfully')
      }
      setSliderModalVisible(false)
      setEditingItem(null)
      setImageUrl(null)
      setIconUrl(null)
      form.resetFields()
      fetchSliders()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حفظ السلايدر' : 'Failed to save slider'))
    }
  }

  const handleDeleteSlider = async (id) => {
    try {
      await slidersAPI.deleteSlider(id)
      message.success(language === 'ar' ? 'تم حذف السلايدر بنجاح' : 'Slider deleted successfully')
      fetchSliders()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حذف السلايدر' : 'Failed to delete slider'))
    }
  }

  const columns = [
    {
      title: language === 'ar' ? 'السلايدر' : 'Slider',
      key: 'slider',
      width: 300,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.image ? (
            <Image
              src={record.image}
              alt={record.title}
              width={80}
              height={60}
              className="object-cover rounded-lg shadow-sm"
              preview={false}
            />
          ) : (
            <div className="w-20 h-15 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <PictureOutlined className="text-2xl text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-800">{record.title}</div>
            {record.subtitle && (
              <div className="text-sm text-gray-500">{record.subtitle}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: language === 'ar' ? 'الترتيب' : 'Order',
      dataIndex: 'order',
      key: 'order',
      sorter: (a, b) => a.order - b.order,
      render: (order) => <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{order}</span>
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'} className="rounded-full px-3 border-0 font-medium">
          {isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
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
              className="text-olive-green-600 hover:text-olive-green-700 bg-olive-green-50 border-olive-green-200"
              onClick={() => {
                setEditingItem(record)
                setImageUrl(record.image)
                setIconUrl(record.icon)
                form.setFieldsValue({
                  ...record,
                  isActive: record.isActive,
                })
                setSliderModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip title={language === 'ar' ? 'حذف' : 'Delete'}>
            <Popconfirm
              title={language === 'ar' ? 'هل أنت متأكد من حذف هذا السلايدر؟' : 'Are you sure to delete this slider?'}
              onConfirm={() => handleDeleteSlider(record.id)}
              okText={language === 'ar' ? 'نعم' : 'Yes'}
              cancelText={language === 'ar' ? 'لا' : 'No'}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                className="hover:bg-red-50"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div className="relative min-h-screen pb-8">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-olive-green-50/20 -z-20" />
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-olive-green-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-turquoise-200/20 rounded-full blur-[100px] -z-10 mix-blend-multiply" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10 px-2 sm:px-0">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 mb-3 tracking-tight">
            {language === 'ar' ? 'إدارة السلايدرات' : 'Manage Sliders'}
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">
            {language === 'ar' ? 'إدارة السلايدرات المعروضة في الصفحة الرئيسية' : 'Manage sliders displayed on the home page'}
          </p>
        </div>
        
        <Space className="flex-wrap animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchSliders}
            loading={loading}
            className="rounded-xl h-12 px-6 border-gray-200 hover:text-olive-green-600 hover:border-olive-green-200"
          >
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="rounded-xl h-12 px-6 bg-olive-green-600 hover:bg-olive-green-700 border-0 shadow-lg shadow-olive-green-500/30"
            onClick={() => {
              setEditingItem(null)
              setImageUrl(null)
              setIconUrl(null)
              form.resetFields()
              setSliderModalVisible(true)
            }}
          >
            {language === 'ar' ? 'إضافة سلايدر جديد' : 'Add New Slider'}
          </Button>
        </Space>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden glass-card relative z-10">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={sliders}
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
            size="middle"
            className="custom-table"
          />
        </div>
      </Card>

      {/* Modal */}
      <Modal
        title={
          <div className="text-xl font-bold text-gray-800 mb-4">
            {editingItem ? (language === 'ar' ? 'تعديل السلايدر' : 'Edit Slider') : (language === 'ar' ? 'إضافة سلايدر جديد' : 'Add New Slider')}
          </div>
        }
        open={sliderModalVisible}
        onCancel={() => {
          setSliderModalVisible(false)
          setEditingItem(null)
          setImageUrl(null)
          setIconUrl(null)
          form.resetFields()
        }}
        footer={null}
        width={800}
        destroyOnHidden={true}
        className="modern-modal"
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSliderSubmit}
          initialValues={{ isActive: true, order: 0 }}
          className="pt-4"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="title"
                label={language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                rules={[{ required: true, message: language === 'ar' ? 'يرجى إدخال العنوان' : 'Please enter title' }]}
              >
                <Input size="large" className="rounded-lg" placeholder={language === 'ar' ? 'أدخل العنوان' : 'Enter title'} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="titleAr"
                label={language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
              >
                <Input size="large" className="rounded-lg" placeholder={language === 'ar' ? 'أدخل العنوان العربي' : 'Enter Arabic title'} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="subtitle"
                label={language === 'ar' ? 'العنوان الفرعي (إنجليزي)' : 'Subtitle (English)'}
              >
                <Input size="large" className="rounded-lg" placeholder={language === 'ar' ? 'أدخل العنوان الفرعي' : 'Enter subtitle'} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="subtitleAr"
                label={language === 'ar' ? 'العنوان الفرعي (عربي)' : 'Subtitle (Arabic)'}
              >
                <Input size="large" className="rounded-lg" placeholder={language === 'ar' ? 'أدخل العنوان الفرعي العربي' : 'Enter Arabic subtitle'} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label={language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
          >
            <TextArea rows={3} className="rounded-lg" placeholder={language === 'ar' ? 'أدخل الوصف' : 'Enter description'} />
          </Form.Item>

          <Form.Item
            name="descriptionAr"
            label={language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
          >
            <TextArea rows={3} className="rounded-lg" placeholder={language === 'ar' ? 'أدخل الوصف العربي' : 'Enter Arabic description'} />
          </Form.Item>

          <Form.Item
            name="image"
            label={language === 'ar' ? 'الصورة' : 'Image'}
            rules={[{ required: true, message: language === 'ar' ? 'يرجى رفع الصورة' : 'Please upload image' }]}
          >
            <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-4">
              <Upload
                beforeUpload={handleImageUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} size="large" className="rounded-lg">
                  {language === 'ar' ? 'رفع الصورة' : 'Upload Image'}
                </Button>
              </Upload>
              {(imageUrl || form.getFieldValue('image')) && (
                <Image
                  src={imageUrl || form.getFieldValue('image')}
                  alt="Preview"
                  width={200}
                  className="rounded-lg shadow-sm border border-gray-200"
                />
              )}
            </div>
          </Form.Item>

          <Form.Item
            name="icon"
            label={language === 'ar' ? 'الأيقونة (اختياري)' : 'Icon (Optional)'}
          >
            <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center gap-4">
              <Upload
                beforeUpload={handleIconUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />} size="large" className="rounded-lg">
                  {language === 'ar' ? 'رفع الأيقونة' : 'Upload Icon'}
                </Button>
              </Upload>
              {(iconUrl || form.getFieldValue('icon')) && (
                <Image
                  src={iconUrl || form.getFieldValue('icon')}
                  alt="Icon Preview"
                  width={80}
                  height={80}
                  className="rounded-lg object-contain"
                />
              )}
            </div>
          </Form.Item>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="buttonText"
                label={language === 'ar' ? 'نص الزر (إنجليزي)' : 'Button Text (English)'}
              >
                <Input size="large" className="rounded-lg" placeholder={language === 'ar' ? 'مثال: ابدأ الآن' : 'e.g., Get Started'} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="buttonTextAr"
                label={language === 'ar' ? 'نص الزر (عربي)' : 'Button Text (Arabic)'}
              >
                <Input size="large" className="rounded-lg" placeholder={language === 'ar' ? 'مثال: ابدأ الآن' : 'e.g., ابدأ الآن'} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="buttonLink"
            label={language === 'ar' ? 'رابط الزر' : 'Button Link'}
          >
            <Input size="large" className="rounded-lg" placeholder={language === 'ar' ? 'مثال: /services' : 'e.g., /services'} />
          </Form.Item>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="order"
                label={language === 'ar' ? 'الترتيب' : 'Order'}
              >
                <InputNumber min={0} size="large" className="w-full rounded-lg" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="isActive"
                label={language === 'ar' ? 'الحالة' : 'Status'}
                valuePropName="checked"
              >
                <Switch checkedChildren={language === 'ar' ? 'نشط' : 'Active'} unCheckedChildren={language === 'ar' ? 'غير نشط' : 'Inactive'} />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
            <Button 
              size="large" 
              className="rounded-lg h-11 px-8 hover:bg-gray-100 hover:text-gray-700 hover:border-gray-200"
              onClick={() => {
                setSliderModalVisible(false)
                setEditingItem(null)
                setImageUrl(null)
                setIconUrl(null)
                form.resetFields()
              }}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              className="rounded-lg h-11 px-8 bg-olive-green-600 hover:bg-olive-green-700 border-0 shadow-lg shadow-olive-green-500/20"
            >
              {editingItem ? (language === 'ar' ? 'تحديث' : 'Update') : (language === 'ar' ? 'إنشاء' : 'Create')}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminSliders

