import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Upload,
  Image,
  Select,
  Switch,
  message,
  Row,
  Col,
  Divider,
  Tag,
  Tabs,
  Alert,
} from 'antd'
import {
  SaveOutlined,
  EyeOutlined,
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useLanguage } from '../../contexts/LanguageContext'
import { articlesAPI } from '../../services/api'
import { getCookie } from '../../utils/cookies'
import '../../styles/ArticleEditor.css'

const { TextArea } = Input
const { Option } = Select

const AdminArticleEditor = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [contentEn, setContentEn] = useState('')
  const [contentAr, setContentAr] = useState('')
  const [featuredImage, setFeaturedImage] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const quillRefEn = useRef(null)
  const quillRefAr = useRef(null)

  const isEditing = !!id

  useEffect(() => {
    if (isEditing) {
      fetchArticle()
    }
  }, [id])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const response = await articlesAPI.getArticleById(id)
      const article = response.article
      
      if (article) {
        form.setFieldsValue({
          title: article.title,
          titleAr: article.titleAr,
          excerpt: article.excerpt,
          excerptAr: article.excerptAr,
          category: article.category,
          status: article.status,
          tags: article.tags ? (typeof article.tags === 'string' ? JSON.parse(article.tags).join(', ') : article.tags.join(', ')) : '',
        })
        setContentEn(article.content || '')
        setContentAr(article.contentAr || '')
        setFeaturedImage(article.featuredImage)
        if (article.images) {
          const images = typeof article.images === 'string' ? JSON.parse(article.images) : article.images
          setGalleryImages(images || [])
        }
      }
    } catch (err) {
      message.error(language === 'ar' ? 'فشل تحميل المقال' : 'Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file, isFeatured = false) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ownerType', 'ARTICLE')
      if (isEditing) {
        formData.append('ownerId', id)
      }

      const token = getCookie('accessToken')
      const response = await fetch('http://localhost:5000/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      const imageUrl = `http://localhost:5000${data.file.fileUrl}`

      if (isFeatured) {
        setFeaturedImage(imageUrl)
        form.setFieldValue('featuredImage', imageUrl)
      } else {
        setGalleryImages(prev => [...prev, imageUrl])
      }

      message.success(language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully')
      return imageUrl
    } catch (err) {
      message.error(language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleRemoveFeatured = () => {
    setFeaturedImage(null)
    form.setFieldValue('featuredImage', null)
  }

  const insertImageToEditor = (url, isArabic = false) => {
    const quill = isArabic ? quillRefAr.current?.getEditor() : quillRefEn.current?.getEditor()
    if (quill) {
      const range = quill.getSelection(true)
      quill.insertEmbed(range.index, 'image', url)
      quill.setSelection(range.index + 1)
    }
  }

  const handleSubmit = async (values) => {
    try {
      setSaving(true)
      const tags = values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : []

      const articleData = {
        ...values,
        content: contentEn,
        contentAr: contentAr,
        featuredImage: featuredImage || null,
        images: galleryImages.length > 0 ? JSON.stringify(galleryImages) : null,
        tags,
      }
      
      // Ensure images is null if empty array
      if (articleData.images === '[]' || articleData.images === '') {
        articleData.images = null;
      }

      if (isEditing) {
        await articlesAPI.updateArticle(id, articleData)
        message.success(language === 'ar' ? 'تم تحديث المقال بنجاح' : 'Article updated successfully')
      } else {
        await articlesAPI.createArticle(articleData)
        message.success(language === 'ar' ? 'تم إنشاء المقال بنجاح' : 'Article created successfully')
        navigate('/admin/articles')
      }
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حفظ المقال' : 'Failed to save article'))
    } finally {
      setSaving(false)
    }
  }

  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      handlers: {
        image: function() {
          const input = document.createElement('input')
          input.setAttribute('type', 'file')
          input.setAttribute('accept', 'image/*')
          input.click()
          input.onchange = async () => {
            const file = input.files[0]
            if (file) {
              const url = await handleImageUpload(file, false)
              if (url) {
                const quill = quillRefEn.current?.getEditor()
                if (quill) {
                  const range = quill.getSelection(true)
                  quill.insertEmbed(range.index, 'image', url)
                }
              }
            }
          }
        },
      },
    },
  }

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video',
  ]

  const tabItems = [
    {
      key: 'en',
      label: language === 'ar' ? 'المحتوى الإنجليزي' : 'English Content',
      children: (
        <div className="editor-tab">
          <Form.Item label={language === 'ar' ? 'المحتوى (إنجليزي)' : 'Content (English)'}>
            <ReactQuill
              ref={quillRefEn}
              theme="snow"
              value={contentEn}
              onChange={setContentEn}
              modules={quillModules}
              formats={quillFormats}
              placeholder={language === 'ar' ? 'اكتب محتوى المقال بالإنجليزية...' : 'Write article content in English...'}
              style={{ minHeight: '400px', marginBottom: '50px' }}
            />
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'ar',
      label: language === 'ar' ? 'المحتوى العربي' : 'Arabic Content',
      children: (
        <div className="editor-tab">
          <Form.Item label={language === 'ar' ? 'المحتوى (عربي)' : 'Content (Arabic)'}>
            <ReactQuill
              ref={quillRefAr}
              theme="snow"
              value={contentAr}
              onChange={setContentAr}
              modules={quillModules}
              formats={quillFormats}
              placeholder={language === 'ar' ? 'اكتب محتوى المقال بالعربية...' : 'Write article content in Arabic...'}
              style={{ minHeight: '400px', marginBottom: '50px' }}
            />
          </Form.Item>
        </div>
      ),
    },
  ]

  return (
    <div className="article-editor-page">
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/articles')}
          className="mb-4"
        >
          {language === 'ar' ? 'العودة إلى القائمة' : 'Back to List'}
        </Button>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-olive-green-600 to-turquoise-500 bg-clip-text text-transparent mb-2">
          {isEditing 
            ? (language === 'ar' ? 'تعديل المقال' : 'Edit Article')
            : (language === 'ar' ? 'إضافة مقال جديد' : 'Add New Article')
          }
        </h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: 'DRAFT' }}
      >
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card className="mb-6">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="title"
                    label={language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                    rules={[{ required: true, message: language === 'ar' ? 'يرجى إدخال العنوان' : 'Please enter title' }]}
                  >
                    <Input size="large" placeholder={language === 'ar' ? 'عنوان المقال بالإنجليزية' : 'Article title in English'} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="titleAr"
                    label={language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                  >
                    <Input size="large" placeholder={language === 'ar' ? 'عنوان المقال بالعربية' : 'Article title in Arabic'} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="excerpt"
                    label={language === 'ar' ? 'الملخص (إنجليزي)' : 'Excerpt (English)'}
                  >
                    <TextArea
                      rows={3}
                      placeholder={language === 'ar' ? 'ملخص المقال بالإنجليزية' : 'Article excerpt in English'}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="excerptAr"
                    label={language === 'ar' ? 'الملخص (عربي)' : 'Excerpt (Arabic)'}
                  >
                    <TextArea
                      rows={3}
                      placeholder={language === 'ar' ? 'ملخص المقال بالعربية' : 'Article excerpt in Arabic'}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>{language === 'ar' ? 'محرر المحتوى' : 'Content Editor'}</Divider>

              <Tabs items={tabItems} defaultActiveKey={language === 'ar' ? 'ar' : 'en'} />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title={language === 'ar' ? 'الإعدادات' : 'Settings'} className="mb-6">
              <Form.Item
                name="status"
                label={language === 'ar' ? 'الحالة' : 'Status'}
              >
                <Select size="large">
                  <Option value="DRAFT">{language === 'ar' ? 'مسودة' : 'Draft'}</Option>
                  <Option value="PUBLISHED">{language === 'ar' ? 'منشور' : 'Published'}</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="category"
                label={language === 'ar' ? 'الفئة' : 'Category'}
              >
                <Input placeholder={language === 'ar' ? 'الفئة' : 'Category'} />
              </Form.Item>

              <Form.Item
                name="tags"
                label={language === 'ar' ? 'العلامات' : 'Tags'}
              >
                <Input placeholder={language === 'ar' ? 'علامات مفصولة بفواصل' : 'Tags separated by commas'} />
              </Form.Item>
            </Card>

            <Card title={language === 'ar' ? 'الصورة الرئيسية' : 'Featured Image'} className="mb-6">
              {featuredImage ? (
                <div className="relative mb-4">
                  <Image
                    src={featuredImage}
                    alt="Featured"
                    className="w-full rounded-lg"
                    preview={false}
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveFeatured}
                    className="mt-2 w-full"
                  >
                    {language === 'ar' ? 'حذف الصورة' : 'Remove Image'}
                  </Button>
                </div>
              ) : (
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleImageUpload(file, true)
                    return false
                  }}
                  disabled={uploading}
                >
                  <Button
                    icon={<UploadOutlined />}
                    loading={uploading}
                    className="w-full"
                    size="large"
                  >
                    {language === 'ar' ? 'رفع صورة رئيسية' : 'Upload Featured Image'}
                  </Button>
                </Upload>
              )}
            </Card>

            <Card title={language === 'ar' ? 'معرض الصور' : 'Image Gallery'}>
              <div className="space-y-4">
                {galleryImages.map((img, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={img}
                      alt={`Gallery ${index + 1}`}
                      className="w-full rounded-lg mb-2"
                      preview={false}
                    />
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveImage(index)}
                      className="w-full"
                    >
                      {language === 'ar' ? 'حذف' : 'Remove'}
                    </Button>
                  </div>
                ))}
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleImageUpload(file, false)
                    return false
                  }}
                  disabled={uploading}
                >
                  <Button
                    icon={<PlusOutlined />}
                    loading={uploading}
                    className="w-full"
                    block
                  >
                    {language === 'ar' ? 'إضافة صورة' : 'Add Image'}
                  </Button>
                </Upload>
              </div>
            </Card>
          </Col>
        </Row>

        <Card className="mt-6">
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={saving}
              size="large"
              className="bg-olive-green-600"
            >
              {language === 'ar' ? 'حفظ المقال' : 'Save Article'}
            </Button>
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                // Preview functionality
                message.info(language === 'ar' ? 'معاينة المقال' : 'Preview article')
              }}
              size="large"
            >
              {language === 'ar' ? 'معاينة' : 'Preview'}
            </Button>
          </Space>
        </Card>
      </Form>
    </div>
  )
}

export default AdminArticleEditor

