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
      setArticle(response.article)
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
      <Content className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          {/* Back Button */}
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/blog')}
            className="mb-6"
          >
            {language === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
          </Button>

          {/* Article Header */}
          <Card className="mb-8">
            <div className="mb-4">
              {article.category && (
                <Tag color="blue" className="mb-2">
                  {article.category}
                </Tag>
              )}
              <Tag color={article.status === 'PUBLISHED' ? 'green' : 'orange'}>
                {article.status === 'PUBLISHED' 
                  ? (language === 'ar' ? 'منشور' : 'Published')
                  : (language === 'ar' ? 'مسودة' : 'Draft')}
              </Tag>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'ar' ? article.titleAr || article.title : article.title}
            </h1>

            {article.excerpt && (
              <p className="text-xl text-gray-600 mb-6">
                {language === 'ar' ? article.excerptAr || article.excerpt : article.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Avatar icon={<UserOutlined />} />
                <div>
                  <div className="font-semibold">{article.author?.email || 'Admin'}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <CalendarOutlined />
                    {dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}
                    <span className="mx-2">•</span>
                    <EyeOutlined />
                    {article.views || 0} {language === 'ar' ? 'مشاهدة' : 'views'}
                  </div>
                </div>
              </div>
              <Button
                icon={<ShareAltOutlined />}
                onClick={handleShare}
              >
                {language === 'ar' ? 'مشاركة' : 'Share'}
              </Button>
            </div>
          </Card>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="mb-8">
              <img
                src={article.featuredImage}
                alt={language === 'ar' ? article.titleAr || article.title : article.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <Card>
            <div
              className="prose prose-lg max-w-none"
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


