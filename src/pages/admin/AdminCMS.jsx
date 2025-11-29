import React, { useState, useEffect } from 'react'
import { Card, Tabs, Button, Table, Space, Tag, message, Modal, Form, Input, Switch, InputNumber, Alert, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useLanguage } from '../../contexts/LanguageContext'
import { cmsAPI, articlesAPI } from '../../services/api'

const { TextArea } = Input

const AdminCMS = () => {
  const { t, language } = useLanguage()
  const [pages, setPages] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState({ pages: false, articles: false })
  const [error, setError] = useState(null)
  const [pageModalVisible, setPageModalVisible] = useState(false)
  const [articleModalVisible, setArticleModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()
  const [articleForm] = Form.useForm()

  useEffect(() => {
    fetchPages()
    fetchArticles()
  }, [])

  const fetchPages = async () => {
    try {
      setLoading(prev => ({ ...prev, pages: true }))
      setError(null)
      const response = await cmsAPI.getPages({ isPublished: false }) // Get all pages including drafts
      const formattedPages = response.pages.map(page => ({
        id: page.id,
        title: language === 'ar' ? page.titleAr || page.title : page.title,
        slug: page.slug,
        status: page.isPublished ? 'published' : 'draft',
        isPublished: page.isPublished,
        order: page.order,
      }))
      setPages(formattedPages)
    } catch (err) {
      console.error('Error fetching pages:', err)
      setError(err.message || 'Failed to load pages')
      message.error(language === 'ar' ? 'فشل تحميل الصفحات' : 'Failed to load pages')
    } finally {
      setLoading(prev => ({ ...prev, pages: false }))
    }
  }

  const fetchArticles = async () => {
    try {
      setLoading(prev => ({ ...prev, articles: true }))
      setError(null)
      const response = await articlesAPI.getArticles({ status: 'all' }) // Get all articles
      const formattedArticles = response.articles.map(article => ({
        id: article.id,
        title: language === 'ar' ? article.titleAr || article.title : article.title,
        date: article.publishedAt 
          ? dayjs(article.publishedAt).format('YYYY-MM-DD')
          : dayjs(article.createdAt).format('YYYY-MM-DD'),
        status: article.status,
        views: article.views || 0,
        category: article.category,
      }))
      setArticles(formattedArticles)
    } catch (err) {
      console.error('Error fetching articles:', err)
      setError(err.message || 'Failed to load articles')
      message.error(language === 'ar' ? 'فشل تحميل المقالات' : 'Failed to load articles')
    } finally {
      setLoading(prev => ({ ...prev, articles: false }))
    }
  }

  const handlePageSubmit = async (values) => {
    try {
      if (editingItem) {
        await cmsAPI.updatePage(editingItem.id, values)
        message.success(language === 'ar' ? 'تم تحديث الصفحة بنجاح' : 'Page updated successfully')
      } else {
        await cmsAPI.createPage(values)
        message.success(language === 'ar' ? 'تم إنشاء الصفحة بنجاح' : 'Page created successfully')
      }
      setPageModalVisible(false)
      setEditingItem(null)
      form.resetFields()
      fetchPages()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حفظ الصفحة' : 'Failed to save page'))
    }
  }

  const handleArticleSubmit = async (values) => {
    try {
      // Process tags - convert string to array if needed
      if (values.tags && typeof values.tags === 'string') {
        values.tags = values.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }
      
      if (editingItem) {
        await articlesAPI.updateArticle(editingItem.id, values)
        message.success(language === 'ar' ? 'تم تحديث المقال بنجاح' : 'Article updated successfully')
      } else {
        await articlesAPI.createArticle(values)
        message.success(language === 'ar' ? 'تم إنشاء المقال بنجاح' : 'Article created successfully')
      }
      setArticleModalVisible(false)
      setEditingItem(null)
      articleForm.resetFields()
      fetchArticles()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حفظ المقال' : 'Failed to save article'))
    }
  }

  const handlePublishArticle = async (id) => {
    try {
      await articlesAPI.publishArticle(id)
      message.success(language === 'ar' ? 'تم نشر المقال بنجاح' : 'Article published successfully')
      fetchArticles()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل نشر المقال' : 'Failed to publish article'))
    }
  }

  const handleDeletePage = async (id) => {
    try {
      await cmsAPI.deletePage(id)
      message.success(language === 'ar' ? 'تم حذف الصفحة بنجاح' : 'Page deleted successfully')
      fetchPages()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حذف الصفحة' : 'Failed to delete page'))
    }
  }

  const handleDeleteArticle = async (id) => {
    try {
      await articlesAPI.deleteArticle(id)
      message.success(language === 'ar' ? 'تم حذف المقال بنجاح' : 'Article deleted successfully')
      fetchArticles()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حذف المقال' : 'Failed to delete article'))
    }
  }

  const pageColumns = [
    { 
      title: language === 'ar' ? 'العنوان' : 'Title', 
      dataIndex: 'title', 
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    { 
      title: language === 'ar' ? 'الرابط' : 'Slug', 
      dataIndex: 'slug', 
      key: 'slug' 
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? (language === 'ar' ? 'منشور' : 'Published') : (language === 'ar' ? 'مسودة' : 'Draft')}
        </Tag>
      ),
      filters: [
        { text: language === 'ar' ? 'منشور' : 'Published', value: 'published' },
        { text: language === 'ar' ? 'مسودة' : 'Draft', value: 'draft' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: language === 'ar' ? 'الإجراءات' : 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record)
              setPageModalVisible(true)
            }}
          >
            {language === 'ar' ? 'تعديل' : 'Edit'}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الصفحة؟' : 'Are you sure you want to delete this page?')) {
                handleDeletePage(record.id)
              }
            }}
          >
            {language === 'ar' ? 'حذف' : 'Delete'}
          </Button>
        </Space>
      ),
    },
  ]

  const articleColumns = [
    { 
      title: language === 'ar' ? 'العنوان' : 'Title', 
      dataIndex: 'title', 
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    { 
      title: language === 'ar' ? 'التاريخ' : 'Date', 
      dataIndex: 'date', 
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: language === 'ar' ? 'الفئة' : 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: language === 'ar' ? 'المشاهدات' : 'Views',
      dataIndex: 'views',
      key: 'views',
      sorter: (a, b) => a.views - b.views,
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          PUBLISHED: 'green',
          DRAFT: 'orange',
          ARCHIVED: 'gray',
        }
        const labels = {
          PUBLISHED: language === 'ar' ? 'منشور' : 'Published',
          DRAFT: language === 'ar' ? 'مسودة' : 'Draft',
          ARCHIVED: language === 'ar' ? 'مؤرشف' : 'Archived',
        }
        return <Tag color={colors[status]}>{labels[status]}</Tag>
      },
    },
    {
      title: language === 'ar' ? 'الإجراءات' : 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status !== 'PUBLISHED' && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              className="bg-green-600"
              onClick={() => handlePublishArticle(record.id)}
            >
              {language === 'ar' ? 'نشر' : 'Publish'}
            </Button>
          )}
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record)
              setArticleModalVisible(true)
            }}
          >
            {language === 'ar' ? 'تعديل' : 'Edit'}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المقال؟' : 'Are you sure you want to delete this article?')) {
                handleDeleteArticle(record.id)
              }
            }}
          >
            {language === 'ar' ? 'حذف' : 'Delete'}
          </Button>
        </Space>
      ),
    },
  ]

  const tabItems = [
    {
      key: 'pages',
      label: language === 'ar' ? 'الصفحات' : 'Pages',
      children: (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchPages}
              loading={loading.pages}
            >
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
              onClick={() => {
                setEditingItem(null)
                form.resetFields()
                setPageModalVisible(true)
              }}
            >
              {language === 'ar' ? 'إضافة صفحة' : 'Add Page'}
            </Button>
          </div>
          <Table 
            columns={pageColumns} 
            dataSource={pages} 
            rowKey="id"
            loading={loading.pages}
            pagination={{ pageSize: 10 }}
          />
        </div>
      ),
    },
    {
      key: 'blog',
      label: language === 'ar' ? 'المدونة' : 'Blog',
      children: (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchArticles}
              loading={loading.articles}
            >
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
              onClick={() => {
                setEditingItem(null)
                articleForm.resetFields()
                setArticleModalVisible(true)
              }}
            >
              {language === 'ar' ? 'إضافة مقال' : 'Add Post'}
            </Button>
          </div>
          <Table
            columns={articleColumns}
            dataSource={articles}
            rowKey="id"
            loading={loading.articles}
            pagination={{ pageSize: 10 }}
          />
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-olive-green-600 to-turquoise-500 bg-clip-text text-transparent mb-2">
          CMS
        </h1>
        <p className="text-gray-500">
          {language === 'ar' ? 'إدارة المحتوى والصفحات والمقالات' : 'Manage content, pages, and articles'}
        </p>
      </div>
      {error && (
        <Alert
          message={language === 'ar' ? 'خطأ' : 'Error'}
          description={error}
          type="error"
          closable
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}
      <Card className="shadow-lg rounded-xl border-0">
        <Tabs items={tabItems} />
      </Card>

      {/* Page Modal */}
      <Modal
        title={editingItem ? (language === 'ar' ? 'تعديل الصفحة' : 'Edit Page') : (language === 'ar' ? 'إضافة صفحة' : 'Add Page')}
        open={pageModalVisible}
        onCancel={() => {
          setPageModalVisible(false)
          setEditingItem(null)
          form.resetFields()
        }}
        maskClosable={true}
        keyboard={true}
        footer={null}
        width={800}
        destroyOnHidden={true}
        className="modern-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePageSubmit}
          initialValues={editingItem || { isPublished: false, order: 0 }}
        >
          <Form.Item name="title" label={language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="titleAr" label={language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label={language === 'ar' ? 'المحتوى (إنجليزي)' : 'Content (English)'}>
            <TextArea rows={6} />
          </Form.Item>
          <Form.Item name="contentAr" label={language === 'ar' ? 'المحتوى (عربي)' : 'Content (Arabic)'}>
            <TextArea rows={6} />
          </Form.Item>
          <Form.Item name="order" label={language === 'ar' ? 'الترتيب' : 'Order'}>
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="isPublished" valuePropName="checked">
            <Switch checkedChildren={language === 'ar' ? 'منشور' : 'Published'} unCheckedChildren={language === 'ar' ? 'مسودة' : 'Draft'} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" className="bg-olive-green-600">
                {language === 'ar' ? 'حفظ' : 'Save'}
              </Button>
              <Button onClick={() => {
                setPageModalVisible(false)
                setEditingItem(null)
                form.resetFields()
              }}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Article Modal */}
      <Modal
        title={editingItem ? (language === 'ar' ? 'تعديل المقال' : 'Edit Article') : (language === 'ar' ? 'إضافة مقال' : 'Add Article')}
        open={articleModalVisible}
        onCancel={() => {
          setArticleModalVisible(false)
          setEditingItem(null)
          articleForm.resetFields()
        }}
        maskClosable={true}
        keyboard={true}
        footer={null}
        width={800}
        destroyOnHidden={true}
        className="modern-modal"
      >
          <Form
          form={articleForm}
          layout="vertical"
          onFinish={handleArticleSubmit}
          initialValues={
            editingItem
              ? {
                  ...editingItem,
                  tags: editingItem.tags
                    ? (typeof editingItem.tags === 'string'
                        ? JSON.parse(editingItem.tags).join(', ')
                        : editingItem.tags.join(', '))
                    : '',
                }
              : { status: 'DRAFT' }
          }
        >
          <Form.Item name="title" label={language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="titleAr" label={language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label={language === 'ar' ? 'المحتوى (إنجليزي)' : 'Content (English)'}>
            <TextArea rows={8} />
          </Form.Item>
          <Form.Item name="contentAr" label={language === 'ar' ? 'المحتوى (عربي)' : 'Content (Arabic)'}>
            <TextArea rows={8} />
          </Form.Item>
          <Form.Item name="excerpt" label={language === 'ar' ? 'الملخص (إنجليزي)' : 'Excerpt (English)'}>
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="excerptAr" label={language === 'ar' ? 'الملخص (عربي)' : 'Excerpt (Arabic)'}>
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="category" label={language === 'ar' ? 'الفئة' : 'Category'}>
            <Input placeholder={language === 'ar' ? 'الفئة' : 'Category'} />
          </Form.Item>
          <Form.Item name="featuredImage" label={language === 'ar' ? 'صورة مميزة' : 'Featured Image'}>
            <Input placeholder={language === 'ar' ? 'رابط الصورة' : 'Image URL'} />
          </Form.Item>
          <Form.Item name="tags" label={language === 'ar' ? 'العلامات' : 'Tags'}>
            <Input placeholder={language === 'ar' ? 'علامات مفصولة بفواصل' : 'Tags separated by commas'} />
          </Form.Item>
          <Form.Item name="status" label={language === 'ar' ? 'الحالة' : 'Status'}>
            <Select>
              <Select.Option value="DRAFT">{language === 'ar' ? 'مسودة' : 'Draft'}</Select.Option>
              <Select.Option value="PUBLISHED">{language === 'ar' ? 'منشور' : 'Published'}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" className="bg-olive-green-600">
                {language === 'ar' ? 'حفظ' : 'Save'}
              </Button>
              <Button onClick={() => {
                setArticleModalVisible(false)
                setEditingItem(null)
                articleForm.resetFields()
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

export default AdminCMS

