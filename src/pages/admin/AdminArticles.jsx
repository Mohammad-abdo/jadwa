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
  Select, 
  Upload, 
  Image,
  Row,
  Col,
  Statistic,
  InputNumber,
  Switch,
  DatePicker,
  Popconfirm,
  Tooltip,
  Badge
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined, 
  CheckCircleOutlined,
  EyeOutlined,
  FileImageOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  BookOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { articlesAPI } from '../../services/api'

const { TextArea } = Input
const { RangePicker } = DatePicker

const AdminArticles = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [articleModalVisible, setArticleModalVisible] = useState(false)
  const [previewModalVisible, setPreviewModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [previewArticle, setPreviewArticle] = useState(null)
  const [form] = Form.useForm()
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    views: 0
  })

  // Fetch articles when component mounts or filters change
  useEffect(() => {
    fetchArticles()
  }, [searchText, statusFilter, categoryFilter])

  // Refresh articles when navigating to this page
  useEffect(() => {
    if (location.pathname === '/admin/articles') {
      fetchArticles()
    }
  }, [location.pathname])

  useEffect(() => {
    calculateStats()
  }, [articles])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter
      }
      if (searchText) params.search = searchText
      if (categoryFilter && categoryFilter !== 'all') params.category = categoryFilter

      const response = await articlesAPI.getArticles(params)
      const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://jadwa.developteam.site'
      
      const formattedArticles = response.articles.map(article => {
        // Ensure featuredImage URL is complete
        let featuredImage = article.featuredImage
        if (featuredImage) {
          // Check if URL already contains the base URL (to avoid duplication)
          const baseUrlPattern = /^https?:\/\//
          if (baseUrlPattern.test(featuredImage)) {
            // Already a full URL, use it as-is
            // But check if it's duplicated (contains base URL twice)
            if (featuredImage.includes(`${apiBase}${apiBase}`) || featuredImage.match(/http:\/\/localhost:5000/g)?.length > 1) {
              // Remove duplicate base URL
              featuredImage = featuredImage.replace(/http:\/\/localhost:5000/g, '').replace(/^\/+/, '')
              featuredImage = `https://jadwa.developteam.site${featuredImage}`
            }
          } else {
            // It's a relative path, construct full URL
            featuredImage = featuredImage.startsWith('/') 
              ? `${apiBase}${featuredImage}` 
              : `${apiBase}/${featuredImage}`
          }
        }
        
        return {
          ...article,
          key: article.id,
          title: language === 'ar' ? article.titleAr || article.title : article.title,
          date: article.publishedAt 
            ? dayjs(article.publishedAt).format('YYYY-MM-DD')
            : dayjs(article.createdAt).format('YYYY-MM-DD'),
          featuredImage, // Use normalized URL
        }
      })
      setArticles(formattedArticles)
    } catch (err) {
      console.error('Error fetching articles:', err)
      setError(err.message || 'Failed to load articles')
      message.error(language === 'ar' ? 'فشل تحميل المقالات' : 'Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const total = articles.length
    const published = articles.filter(a => a.status === 'PUBLISHED').length
    const draft = articles.filter(a => a.status === 'DRAFT').length
    const views = articles.reduce((sum, a) => sum + (a.views || 0), 0)
    setStats({ total, published, draft, views })
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
      form.resetFields()
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

  const handleDeleteArticle = async (id) => {
    try {
      await articlesAPI.deleteArticle(id)
      message.success(language === 'ar' ? 'تم حذف المقال بنجاح' : 'Article deleted successfully')
      fetchArticles()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حذف المقال' : 'Failed to delete article'))
    }
  }

  const handlePreview = (article) => {
    setPreviewArticle(article)
    setPreviewModalVisible(true)
  }

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))]

  const columns = [
    {
      title: language === 'ar' ? 'المقال' : 'Article',
      key: 'article',
      width: 300,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {record.featuredImage ? (
            <Image
              src={record.featuredImage}
              alt={record.title}
              width={60}
              height={60}
              className="rounded-lg object-cover"
              preview={false}
            />
          ) : (
            <div className="w-15 h-15 bg-gradient-to-br from-olive-green-400 to-turquoise-400 rounded-lg flex items-center justify-center">
              <BookOutlined className="text-white text-xl" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{record.title}</div>
            {record.category && (
              <Tag color="blue" className="mt-1">{record.category}</Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: language === 'ar' ? 'المؤلف' : 'Author',
      dataIndex: ['author', 'email'],
      key: 'author',
      render: (email) => email || '-',
    },
    {
      title: language === 'ar' ? 'التاريخ' : 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: language === 'ar' ? 'المشاهدات' : 'Views',
      dataIndex: 'views',
      key: 'views',
      sorter: (a, b) => (a.views || 0) - (b.views || 0),
      render: (views) => (
        <Badge count={views || 0} showZero style={{ backgroundColor: '#52c41a' }} />
      ),
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
      filters: [
        { text: language === 'ar' ? 'منشور' : 'Published', value: 'PUBLISHED' },
        { text: language === 'ar' ? 'مسودة' : 'Draft', value: 'DRAFT' },
        { text: language === 'ar' ? 'مؤرشف' : 'Archived', value: 'ARCHIVED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: language === 'ar' ? 'الإجراءات' : 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={language === 'ar' ? 'معاينة' : 'Preview'}>
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title={language === 'ar' ? 'تعديل' : 'Edit'}>
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/admin/articles/edit/${record.id}`)}
            />
          </Tooltip>
          {record.status !== 'PUBLISHED' && (
            <Tooltip title={language === 'ar' ? 'نشر' : 'Publish'}>
              <Popconfirm
                title={language === 'ar' ? 'هل أنت متأكد من نشر هذا المقال؟' : 'Are you sure to publish this article?'}
                onConfirm={() => handlePublishArticle(record.id)}
                okText={language === 'ar' ? 'نعم' : 'Yes'}
                cancelText={language === 'ar' ? 'لا' : 'No'}
              >
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  className="bg-green-600"
                />
              </Popconfirm>
            </Tooltip>
          )}
          <Tooltip title={language === 'ar' ? 'حذف' : 'Delete'}>
            <Popconfirm
              title={language === 'ar' ? 'هل أنت متأكد من حذف هذا المقال؟' : 'Are you sure to delete this article?'}
              onConfirm={() => handleDeleteArticle(record.id)}
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

  const getPaginationTotal = (total) => {
    return language === 'ar' ? `إجمالي ${total} مقال` : `Total ${total} articles`;
  };

  return (
    <div className="relative min-h-screen pb-8 dashboard-bg">
      {/* Modern Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-br from-olive-green-100/40 to-turquoise-100/40 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-tr from-teal-100/40 to-olive-green-100/40 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 relative z-10">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3">
            {language === 'ar' ? 'المقالات' : 'Articles'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            {language === 'ar' ? 'إدارة جميع المقالات والمدونة' : 'Manage all articles and blog posts'}
          </p>
        </div>
        <Space className="flex-wrap">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchArticles}
              loading={loading}
            >
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </Button>
            <Button
              icon={<ExportOutlined />}
            >
              {language === 'ar' ? 'تصدير' : 'Export'}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-olive-green-600 hover:bg-olive-green-700 border-0 shadow-lg"
              size="large"
              onClick={() => navigate('/admin/articles/new')}
            >
              {language === 'ar' ? 'إضافة مقال جديد' : 'Add New Article'}
            </Button>
          </Space>
        </div>

        {/* Statistics */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card className="glass-card card-hover shadow-professional-lg border-0">
              <Statistic
                title={language === 'ar' ? 'إجمالي المقالات' : 'Total Articles'}
                value={stats.total}
                prefix={<BookOutlined className="text-olive-green-600" />}
                valueStyle={{ color: '#7a8c66' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="glass-card card-hover shadow-professional-lg border-0">
              <Statistic
                title={language === 'ar' ? 'منشورة' : 'Published'}
                value={stats.published}
                prefix={<CheckCircleOutlined className="text-green-600" />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="glass-card card-hover shadow-professional-lg border-0">
              <Statistic
                title={language === 'ar' ? 'مسودات' : 'Drafts'}
                value={stats.draft}
                prefix={<FileImageOutlined className="text-orange-600" />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="glass-card card-hover shadow-professional-lg border-0">
              <Statistic
                title={language === 'ar' ? 'إجمالي المشاهدات' : 'Total Views'}
                value={stats.views}
                prefix={<EyeOutlined className="text-blue-600" />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="glass-card shadow-professional-lg rounded-xl border-0 mb-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder={language === 'ar' ? 'ابحث في المقالات...' : 'Search articles...'}
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                size="large"
              >
                <Select.Option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</Select.Option>
                <Select.Option value="PUBLISHED">{language === 'ar' ? 'منشور' : 'Published'}</Select.Option>
                <Select.Option value="DRAFT">{language === 'ar' ? 'مسودة' : 'Draft'}</Select.Option>
                <Select.Option value="ARCHIVED">{language === 'ar' ? 'مؤرشف' : 'Archived'}</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: '100%' }}
                size="large"
              >
                <Select.Option value="all">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</Select.Option>
                {categories.map(cat => (
                  <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

      {/* Articles Table */}
      <Card className="glass-card shadow-professional-xl rounded-2xl border-0 relative z-10">
        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: getPaginationTotal,
            showQuickJumper: true,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Article Modal */}
      <Modal
        title={editingItem ? (language === 'ar' ? 'تعديل المقال' : 'Edit Article') : (language === 'ar' ? 'إضافة مقال جديد' : 'Add New Article')}
        open={articleModalVisible}
        onCancel={() => {
          setArticleModalVisible(false)
          setEditingItem(null)
          form.resetFields()
        }}
        maskClosable={true}
        keyboard={true}
        footer={null}
        width={900}
        destroyOnHidden={true}
        className="modern-modal article-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleArticleSubmit}
          initialValues={editingItem || { status: 'DRAFT' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="title" label={language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'} rules={[{ required: true }]}>
                <Input placeholder={language === 'ar' ? 'العنوان بالإنجليزية' : 'Title in English'} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="titleAr" label={language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}>
                <Input placeholder={language === 'ar' ? 'العنوان بالعربية' : 'Title in Arabic'} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="content" label={language === 'ar' ? 'المحتوى (إنجليزي)' : 'Content (English)'}>
                <TextArea rows={8} placeholder={language === 'ar' ? 'المحتوى بالإنجليزية' : 'Content in English'} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contentAr" label={language === 'ar' ? 'المحتوى (عربي)' : 'Content (Arabic)'}>
                <TextArea rows={8} placeholder={language === 'ar' ? 'المحتوى بالعربية' : 'Content in Arabic'} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="excerpt" label={language === 'ar' ? 'الملخص (إنجليزي)' : 'Excerpt (English)'}>
                <TextArea rows={3} placeholder={language === 'ar' ? 'ملخص المقال بالإنجليزية' : 'Article excerpt in English'} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="excerptAr" label={language === 'ar' ? 'الملخص (عربي)' : 'Excerpt (Arabic)'}>
                <TextArea rows={3} placeholder={language === 'ar' ? 'ملخص المقال بالعربية' : 'Article excerpt in Arabic'} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="category" label={language === 'ar' ? 'الفئة' : 'Category'}>
                <Input placeholder={language === 'ar' ? 'الفئة' : 'Category'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="featuredImage" label={language === 'ar' ? 'صورة مميزة' : 'Featured Image'}>
                <Input placeholder={language === 'ar' ? 'رابط الصورة' : 'Image URL'} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label={language === 'ar' ? 'الحالة' : 'Status'}>
                <Select>
                  <Select.Option value="DRAFT">{language === 'ar' ? 'مسودة' : 'Draft'}</Select.Option>
                  <Select.Option value="PUBLISHED">{language === 'ar' ? 'منشور' : 'Published'}</Select.Option>
                  <Select.Option value="ARCHIVED">{language === 'ar' ? 'مؤرشف' : 'Archived'}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="tags" label={language === 'ar' ? 'العلامات' : 'Tags'}>
            <Input placeholder={language === 'ar' ? 'علامات مفصولة بفواصل' : 'Tags separated by commas'} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" className="bg-olive-green-600">
                {language === 'ar' ? 'حفظ' : 'Save'}
              </Button>
              <Button onClick={() => {
                setArticleModalVisible(false)
                setEditingItem(null)
                form.resetFields()
              }}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={language === 'ar' ? 'معاينة المقال' : 'Article Preview'}
        open={previewModalVisible}
        onCancel={() => {
          setPreviewModalVisible(false)
          setPreviewArticle(null)
        }}
        maskClosable={true}
        keyboard={true}
        footer={null}
        width={800}
        destroyOnHidden={true}
        className="modern-modal"
      >
        {previewArticle && (
          <div>
            {previewArticle.featuredImage && (
              <Image
                src={previewArticle.featuredImage}
                alt={previewArticle.title}
                className="w-full mb-4 rounded-lg"
              />
            )}
            <h2 className="text-2xl font-bold mb-4">{previewArticle.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: previewArticle.content || previewArticle.contentAr || '' }} />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminArticles


