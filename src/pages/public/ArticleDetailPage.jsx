import React, { useState, useEffect } from 'react'
import { Layout, Card, Spin, Alert, Tag, Avatar, Divider, Row, Col, Button, Space } from 'antd'
import { CalendarOutlined, EyeOutlined, UserOutlined, ArrowLeftOutlined, ShareAltOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import { useLanguage } from '../../contexts/LanguageContext'
import { articlesAPI } from '../../services/api'
import dayjs from 'dayjs'

const { Content } = Layout

const ArticleDetailPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])

  useEffect(() => {
    if (slug) {
      fetchArticle()
      fetchRelatedArticles()
    }
  }, [slug])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await articlesAPI.getArticleBySlug(slug)
      const article = response.article
      
      // Normalize featuredImage URL
      if (article && article.featuredImage) {
        const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
        let featuredImage = article.featuredImage
        
        // Check if URL already contains the base URL (to avoid duplication)
        const baseUrlPattern = /^https?:\/\//
        if (baseUrlPattern.test(featuredImage)) {
          // Already a full URL, check for duplicates
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
        article.featuredImage = featuredImage
      }
      
      // Normalize images in content (TipTap HTML may contain image tags)
      if (article && (article.content || article.contentAr)) {
        const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
        
        const normalizeImageUrls = (html) => {
          if (!html) return html
          return html.replace(/<img([^>]+)src=["']([^"']+)["']/gi, (match, attrs, src) => {
            let normalizedSrc = src
            // If it's already a full URL, check for duplicates
            if (src.startsWith('http://') || src.startsWith('https://')) {
              if (src.includes(`${apiBase}${apiBase}`) || src.match(/http:\/\/localhost:5000/g)?.length > 1) {
                normalizedSrc = src.replace(/http:\/\/localhost:5000/g, '').replace(/^\/+/, '')
                normalizedSrc = `https://jadwa.developteam.site${normalizedSrc}`
              }
            } else {
              // Relative path, construct full URL
              normalizedSrc = src.startsWith('/')
                ? `${apiBase}${src}`
                : `${apiBase}/${src}`
            }
            return `<img${attrs}src="${normalizedSrc}"`
          })
        }
        
        if (article.content) {
          article.content = normalizeImageUrls(article.content)
        }
        if (article.contentAr) {
          article.contentAr = normalizeImageUrls(article.contentAr)
        }
      }
      
      setArticle(article)
    } catch (err) {
      console.error('Error fetching article:', err)
      setError(err.message || 'Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedArticles = async () => {
    try {
      const response = await articlesAPI.getArticles({ 
        status: 'PUBLISHED',
        category: article?.category,
        limit: 3
      })
      setRelatedArticles(response.articles?.filter(a => a.slug !== slug).slice(0, 3) || [])
    } catch (err) {
      console.error('Error fetching related articles:', err)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: language === 'ar' ? article?.titleAr || article?.title : article?.title,
        text: language === 'ar' ? article?.excerptAr || article?.excerpt : article?.excerpt,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert(language === 'ar' ? 'تم نسخ الرابط' : 'Link copied to clipboard')
    }
  }

  if (loading) {
    return (
      <Layout className="min-h-screen">
        <Header />
        <Content className="py-16">
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Content>
        <Footer />
      </Layout>
    )
  }

  if (error || !article) {
    return (
      <Layout className="min-h-screen">
        <Header />
        <Content className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <Alert
              message={language === 'ar' ? 'خطأ' : 'Error'}
              description={error || (language === 'ar' ? 'المقال غير موجود' : 'Article not found')}
              type="error"
              showIcon
              action={
                <Button onClick={() => navigate('/blog')}>
                  {language === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
                </Button>
              }
            />
          </div>
        </Content>
        <Footer />
      </Layout>
    )
  }

  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          {/* Back Button */}
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/blog')}
            className="mb-8 text-[#1a4d3a] hover:text-[#2d5f4f] border-[#1a4d3a] hover:border-[#2d5f4f] font-semibold"
          >
            {language === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
          </Button>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-8 shadow-2xl">
              <img
                src={article.featuredImage}
                alt={language === 'ar' ? article.titleAr || article.title : article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Failed to load featured image:', article.featuredImage)
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Article Header */}
          <Card className="mb-8 border-0 shadow-lg rounded-2xl" styles={{ body: { padding: '40px' } }}>
            <div className="mb-6">
              {article.category && (
                <Tag color="blue" className="mb-3 text-sm px-4 py-1 font-semibold">
                  {article.category}
                </Tag>
              )}
              <Tag color={article.status === 'PUBLISHED' ? 'green' : 'orange'} className="text-sm px-4 py-1 font-semibold">
                {article.status === 'PUBLISHED' 
                  ? (language === 'ar' ? 'منشور' : 'Published')
                  : (language === 'ar' ? 'مسودة' : 'Draft')}
              </Tag>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900 leading-tight">
              {language === 'ar' ? article.titleAr || article.title : article.title}
            </h1>

            {article.excerpt && (
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                {language === 'ar' ? article.excerptAr || article.excerpt : article.excerpt}
              </p>
            )}

            <Divider className="my-6" />

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Avatar size={56} icon={<UserOutlined />} className="border-2 border-[#1a4d3a]" />
                <div>
                  <div className="font-bold text-gray-900">{article.author?.email || 'Admin'}</div>
                  <div className="text-base text-gray-500 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      <CalendarOutlined />
                      {dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center gap-1">
                      <EyeOutlined />
                      {article.views || 0} {language === 'ar' ? 'مشاهدة' : 'views'}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                icon={<ShareAltOutlined />}
                onClick={handleShare}
                className="bg-gradient-to-r from-[#1a4d3a] to-[#2d5f4f] hover:from-[#153d2d] hover:to-[#1a4d3a] border-0 text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {language === 'ar' ? 'مشاركة' : 'Share'}
              </Button>
            </div>
          </Card>

          {/* Article Content */}
          <Card className="mb-8 border-0 shadow-lg rounded-2xl" styles={{ body: { padding: '48px' } }}>
            <div
              className="prose prose-lg max-w-none article-content"
              style={{
                fontSize: '18px',
                lineHeight: '1.8',
                color: '#374151',
              }}
              dangerouslySetInnerHTML={{
                __html: language === 'ar' 
                  ? (article.contentAr || article.content)
                  : article.content
              }}
            />
          </Card>

          {/* Tags */}
          {article.tags && (
            <Card className="mt-8">
              <h3 className="text-lg font-bold mb-4">
                {language === 'ar' ? 'العلامات' : 'Tags'}
              </h3>
              <Space wrap>
                {JSON.parse(article.tags || '[]').map((tag, index) => (
                  <Tag key={index} color="blue">
                    {tag}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-6">
                {language === 'ar' ? 'مقالات ذات صلة' : 'Related Articles'}
              </h2>
              <Row gutter={[24, 24]}>
                {relatedArticles.map((relatedArticle) => (
                  <Col xs={24} sm={12} lg={8} key={relatedArticle.id}>
                    <Card
                      hoverable
                      className="h-full"
                      cover={
                        relatedArticle.featuredImage ? (
                          <img
                            alt={language === 'ar' ? relatedArticle.titleAr || relatedArticle.title : relatedArticle.title}
                            src={relatedArticle.featuredImage}
                            className="h-48 object-cover"
                          />
                        ) : null
                      }
                      onClick={() => navigate(`/blog/${relatedArticle.slug}`)}
                    >
                      <h3 className="text-lg font-bold mb-2 line-clamp-2">
                        {language === 'ar' ? relatedArticle.titleAr || relatedArticle.title : relatedArticle.title}
                      </h3>
                      {relatedArticle.excerpt && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {language === 'ar' ? relatedArticle.excerptAr || relatedArticle.excerpt : relatedArticle.excerpt}
                        </p>
                      )}
                      <div className="text-xs text-gray-500">
                        {dayjs(relatedArticle.publishedAt || relatedArticle.createdAt).format('YYYY-MM-DD')}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      </Content>
      <Footer />
    </Layout>
  )
}

export default ArticleDetailPage


