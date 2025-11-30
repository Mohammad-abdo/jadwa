import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Switch, 
  InputNumber, 
  Select, 
  Space, 
  Popconfirm, 
  Tooltip, 
  Tag,
  message,
  Alert
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined 
} from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { categoriesAPI } from '../../services/api'

const { TextArea } = Input

const AdminCategories = () => {
  const { language } = useLanguage()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await categoriesAPI.getCategories()
      setCategories(response.categories || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err.message || 'Failed to load categories')
      message.error(language === 'ar' ? 'فشل تحميل الفئات' : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        await categoriesAPI.updateCategory(editingCategory.id, values)
        message.success(language === 'ar' ? 'تم تحديث الفئة بنجاح' : 'Category updated successfully')
      } else {
        await categoriesAPI.createCategory(values)
        message.success(language === 'ar' ? 'تم إنشاء الفئة بنجاح' : 'Category created successfully')
      }
      setModalVisible(false)
      form.resetFields()
      setEditingCategory(null)
      fetchCategories()
    } catch (err) {
      console.error('Error saving category:', err)
      message.error(err.message || (language === 'ar' ? 'فشل حفظ الفئة' : 'Failed to save category'))
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    form.setFieldsValue({
      ...category,
      parentId: category.parentId || undefined,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await categoriesAPI.deleteCategory(id)
      message.success(language === 'ar' ? 'تم حذف الفئة بنجاح' : 'Category deleted successfully')
      fetchCategories()
    } catch (err) {
      console.error('Error deleting category:', err)
      message.error(err.message || (language === 'ar' ? 'فشل حذف الفئة' : 'Failed to delete category'))
    }
  }

  const handleCancel = () => {
    setModalVisible(false)
    form.resetFields()
    setEditingCategory(null)
  }

  const columns = [
    {
      title: language === 'ar' ? 'الاسم' : 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          {record.nameAr && (
            <div className="text-sm text-gray-500">{record.nameAr}</div>
          )}
        </div>
      ),
    },
    {
      title: language === 'ar' ? 'الرابط' : 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: language === 'ar' ? 'الأب' : 'Parent',
      dataIndex: 'parent',
      key: 'parent',
      render: (parent) => parent ? parent.name : '-',
    },
    {
      title: language === 'ar' ? 'الاستخدام' : 'Usage',
      key: 'usage',
      render: (_, record) => {
        const total = (record._count?.consultants || 0) + 
                     (record._count?.services || 0) + 
                     (record._count?.articles || 0)
        return (
          <div className="flex gap-2">
            {record._count?.consultants > 0 && (
              <Tag color="blue">{record._count.consultants} {language === 'ar' ? 'مستشار' : 'Consultants'}</Tag>
            )}
            {record._count?.services > 0 && (
              <Tag color="green">{record._count.services} {language === 'ar' ? 'خدمة' : 'Services'}</Tag>
            )}
            {record._count?.articles > 0 && (
              <Tag color="orange">{record._count.articles} {language === 'ar' ? 'مقال' : 'Articles'}</Tag>
            )}
            {total === 0 && <span className="text-gray-400">-</span>}
          </div>
        )
      },
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
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title={language === 'ar' ? 'هل أنت متأكد من حذف هذه الفئة؟' : 'Are you sure to delete this category?'}
            onConfirm={() => handleDelete(record.id)}
            okText={language === 'ar' ? 'نعم' : 'Yes'}
            cancelText={language === 'ar' ? 'لا' : 'No'}
            disabled={(record._count?.consultants || 0) + (record._count?.services || 0) + (record._count?.articles || 0) > 0}
          >
            <Tooltip 
              title={
                (record._count?.consultants || 0) + (record._count?.services || 0) + (record._count?.articles || 0) > 0
                  ? (language === 'ar' ? 'لا يمكن الحذف: الفئة مستخدمة' : 'Cannot delete: category is in use')
                  : (language === 'ar' ? 'حذف' : 'Delete')
              }
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                disabled={(record._count?.consultants || 0) + (record._count?.services || 0) + (record._count?.articles || 0) > 0}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // Build parent options (exclude self when editing)
  const parentOptions = categories
    .filter(cat => !editingCategory || cat.id !== editingCategory.id)
    .map(cat => ({
      value: cat.id,
      label: `${cat.name}${cat.nameAr ? ` (${cat.nameAr})` : ''}`,
    }))

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-olive-green-600 to-turquoise-500 bg-clip-text text-transparent mb-2">
              {language === 'ar' ? 'الفئات' : 'Categories'}
            </h1>
            <p className="text-gray-500">
              {language === 'ar' ? 'إدارة الفئات المستخدمة في المستشارين والخدمات والمقالات' : 'Manage categories for consultants, services, and articles'}
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchCategories}
              loading={loading}
            >
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingCategory(null)
                form.resetFields()
                setModalVisible(true)
              }}
            >
              {language === 'ar' ? 'إضافة فئة' : 'Add Category'}
            </Button>
          </Space>
        </div>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}

      <Card className="border-0 shadow-lg rounded-2xl">
        <Table
          columns={columns}
          dataSource={categories}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => {
              return language === 'ar' 
                ? `إجمالي ${total} فئة` 
                : `Total ${total} categories`;
            },
          }}
        />
      </Card>

      <Modal
        title={
          editingCategory
            ? (language === 'ar' ? 'تعديل الفئة' : 'Edit Category')
            : (language === 'ar' ? 'إضافة فئة جديدة' : 'Add New Category')
        }
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
            order: 0,
          }}
        >
          <Form.Item
            name="name"
            label={language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
            rules={[{ required: true, message: language === 'ar' ? 'الاسم مطلوب' : 'Name is required' }]}
          >
            <Input placeholder={language === 'ar' ? 'أدخل الاسم' : 'Enter name'} />
          </Form.Item>

          <Form.Item
            name="nameAr"
            label={language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
          >
            <Input placeholder={language === 'ar' ? 'أدخل الاسم بالعربية' : 'Enter name in Arabic'} />
          </Form.Item>

          <Form.Item
            name="slug"
            label={language === 'ar' ? 'الرابط' : 'Slug'}
            tooltip={language === 'ar' ? 'سيتم إنشاؤه تلقائياً إذا لم يتم تحديده' : 'Will be auto-generated if not provided'}
          >
            <Input placeholder={language === 'ar' ? 'category-slug' : 'category-slug'} />
          </Form.Item>

          <Form.Item
            name="description"
            label={language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
          >
            <TextArea rows={3} placeholder={language === 'ar' ? 'أدخل الوصف' : 'Enter description'} />
          </Form.Item>

          <Form.Item
            name="descriptionAr"
            label={language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
          >
            <TextArea rows={3} placeholder={language === 'ar' ? 'أدخل الوصف بالعربية' : 'Enter description in Arabic'} />
          </Form.Item>

          <Form.Item
            name="parentId"
            label={language === 'ar' ? 'الفئة الأب' : 'Parent Category'}
          >
            <Select
              placeholder={language === 'ar' ? 'اختر الفئة الأب (اختياري)' : 'Select parent category (optional)'}
              allowClear
              options={parentOptions}
            />
          </Form.Item>

          <Form.Item
            name="icon"
            label={language === 'ar' ? 'الأيقونة' : 'Icon'}
            tooltip={language === 'ar' ? 'اسم الأيقونة أو رابط الصورة' : 'Icon name or image URL'}
          >
            <Input placeholder={language === 'ar' ? 'مثال: HomeOutlined' : 'e.g., HomeOutlined'} />
          </Form.Item>

          <Form.Item
            name="color"
            label={language === 'ar' ? 'اللون' : 'Color'}
            tooltip={language === 'ar' ? 'كود اللون (Hex)' : 'Color code (Hex)'}
          >
            <Input placeholder="#1a4d3a" />
          </Form.Item>

          <Form.Item
            name="order"
            label={language === 'ar' ? 'الترتيب' : 'Order'}
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
              <Button type="primary" htmlType="submit">
                {editingCategory
                  ? (language === 'ar' ? 'تحديث' : 'Update')
                  : (language === 'ar' ? 'إنشاء' : 'Create')}
              </Button>
              <Button onClick={handleCancel}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminCategories

