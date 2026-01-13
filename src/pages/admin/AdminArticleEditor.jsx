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
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TipTapImage from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
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
      // fileUrl from backend is already a complete URL (e.g., http://localhost:5000/uploads/ARTICLE/filename.png)
      // Use it directly without modification
      const imageUrl = data.file.fileUrl

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

  // TipTap editor instances
  // Note: StarterKit includes Link, Underline, and other basic extensions
  const editorEn = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable Link and Underline from StarterKit since we want custom config
        link: false,
        underline: false,
      }),
      TipTapImage.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: contentEn || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (html !== contentEn) {
        setContentEn(html)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
        'data-placeholder': language === 'ar' ? 'اكتب محتوى المقال بالإنجليزية...' : 'Write article content in English...',
      },
    },
  })

  const editorAr = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable Link and Underline from StarterKit since we want custom config
        link: false,
        underline: false,
      }),
      TipTapImage.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'right',
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: contentAr || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (html !== contentAr) {
        setContentAr(html)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
        dir: 'rtl',
        'data-placeholder': language === 'ar' ? 'اكتب محتوى المقال بالعربية...' : 'Write article content in Arabic...',
      },
    },
  })

  // Update editor content when content state changes (e.g., when loading article)
  // Only update if the content is different and editor is ready
  useEffect(() => {
    if (editorEn && contentEn !== undefined) {
      const currentContent = editorEn.getHTML()
      // Only update if content actually changed (avoid infinite loops)
      if (contentEn !== currentContent && contentEn !== '<p></p>') {
        editorEn.commands.setContent(contentEn || '', false)
      }
    }
  }, [contentEn, editorEn])

  useEffect(() => {
    if (editorAr && contentAr !== undefined) {
      const currentContent = editorAr.getHTML()
      // Only update if content actually changed (avoid infinite loops)
      if (contentAr !== currentContent && contentAr !== '<p></p>') {
        editorAr.commands.setContent(contentAr || '', false)
      }
    }
  }, [contentAr, editorAr])

  const insertImageToEditor = (url, isArabic = false) => {
    const editor = isArabic ? editorAr : editorEn
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const handleSubmit = async (values) => {
    try {
      setSaving(true)
      const tags = values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : []

      // Get HTML content from editors
      const finalContentEn = editorEn?.getHTML() || contentEn || ''
      const finalContentAr = editorAr?.getHTML() || contentAr || ''

      const articleData = {
        ...values,
        content: finalContentEn,
        contentAr: finalContentAr,
        featuredImage: featuredImage || null,
        images: galleryImages.length > 0 ? JSON.stringify(galleryImages) : null,
        tags,
      }
      
      // Ensure images is null if empty array
      if (articleData.images === '[]' || articleData.images === '') {
        articleData.images = null;
      }

      console.log('Saving article with data:', { ...articleData, content: finalContentEn.substring(0, 50) + '...' })

      if (isEditing) {
        const response = await articlesAPI.updateArticle(id, articleData)
        console.log('Article updated:', response)
        message.success(language === 'ar' ? 'تم تحديث المقال بنجاح' : 'Article updated successfully')
        // Refresh the page to show updated article
        setTimeout(() => {
          navigate('/admin/articles')
        }, 1000)
      } else {
        const response = await articlesAPI.createArticle(articleData)
        console.log('Article created:', response)
        message.success(language === 'ar' ? 'تم إنشاء المقال بنجاح' : 'Article created successfully')
        // Navigate to articles list
        navigate('/admin/articles')
      }
    } catch (err) {
      console.error('Error saving article:', err)
      message.error(err.message || (language === 'ar' ? 'فشل حفظ المقال' : 'Failed to save article'))
    } finally {
      setSaving(false)
    }
  }

  // Toolbar component for TipTap
  const Toolbar = ({ editor, isArabic = false }) => {
    if (!editor) return null

    return (
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-2 bg-gray-50 rounded-t-lg">
        <div className="flex gap-1 border-r pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-2 py-1 rounded ${editor.isActive('underline') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-2 py-1 rounded ${editor.isActive('strike') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Strike"
          >
            <s>S</s>
          </button>
        </div>

        <div className="flex gap-1 border-r pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="flex gap-1 border-r pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Bullet List"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Ordered List"
          >
            1.
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-2 py-1 rounded ${editor.isActive('blockquote') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Quote"
          >
            "
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`px-2 py-1 rounded ${editor.isActive('codeBlock') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Code Block"
          >
            {'</>'}
          </button>
        </div>

        <div className="flex gap-1 border-r pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Align Left"
          >
            ⬅
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Align Center"
          >
            ⬌
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`px-2 py-1 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Align Right"
          >
            ➡
          </button>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              const input = document.createElement('input')
              input.setAttribute('type', 'file')
              input.setAttribute('accept', 'image/*')
              input.click()
              input.onchange = async () => {
                const file = input.files[0]
                if (file) {
                  const url = await handleImageUpload(file, false)
                  if (url) {
                    editor.chain().focus().setImage({ src: url }).run()
                  }
                }
              }
            }}
            className="px-2 py-1 rounded bg-white hover:bg-gray-100"
            title="Insert Image"
          >
            🖼
          </button>
          <button
            type="button"
            onClick={() => {
              const url = window.prompt('Enter URL:')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
            className={`px-2 py-1 rounded ${editor.isActive('link') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
            title="Insert Link"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="px-2 py-1 rounded bg-white hover:bg-gray-100"
            title="Remove Link"
            disabled={!editor.isActive('link')}
          >
            🔗❌
          </button>
        </div>
      </div>
    )
  }

  const tabItems = [
    {
      key: 'en',
      label: language === 'ar' ? 'المحتوى الإنجليزي' : 'English Content',
      children: (
        <div className="editor-tab">
          <Form.Item label={language === 'ar' ? 'المحتوى (إنجليزي)' : 'Content (English)'}>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <Toolbar editor={editorEn} />
              <EditorContent editor={editorEn} />
            </div>
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
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <Toolbar editor={editorAr} isArabic />
              <EditorContent editor={editorAr} />
            </div>
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

              <Tabs 
                items={tabItems} 
                defaultActiveKey={language === 'ar' ? 'ar' : 'en'}
                destroyOnHidden={false}
              />
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

