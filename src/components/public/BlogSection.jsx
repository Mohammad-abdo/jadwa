import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Tag, Spin } from 'antd'
import { CalendarOutlined, EyeOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { articlesAPI } from '../../services/api'
import dayjs from 'dayjs'

const BlogSection = () => {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatestArticles()
  }, [])

  const fetchLatestArticles = async () => {
    try {
      const response = await articlesAPI.getArticles({ 
        status: 'PUBLISHED',
        limit: 3 
      })
      setArticles(response.articles?.slice(0, 3) || [])
    } catch (err) {
      console.error('Error fetching articles:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spin size="large" />
      </div>
    )
  }

  if (articles.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            {language === 'ar' ? 'آخر المقالات' : 'Latest Articles'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === 'ar'
              ? 'اكتشف آخر الأخبار والمقالات حول الاستشارات والدراسات الاقتصادية'
              : 'Discover the latest news and articles about consulting and economic studies'}
          </p>
        </div>

        <Row gutter={[24, 24]}>
          {articles.map((article) => (
            <Col xs={24} sm={12} lg={8} key={article.id}>
              <Card
                hoverable
                className="h-full transition-all duration-300 hover:shadow-xl"
                style={{ borderRadius: '12px', overflow: 'hidden' }}
                cover={
                  article.featuredImage ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        alt={language === 'ar' ? article.titleAr || article.title : article.title}
                        src={article.featuredImage}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-olive-green-400 to-turquoise-400 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {language === 'ar' 
                          ? (article.titleAr || article.title).charAt(0) 
                          : article.title.charAt(0)}
                      </span>
                    </div>
                  )
                }
                onClick={() => navigate(`/blog/${article.slug}`)}
              >
                <div className="mb-2">
                  {article.category && (
                    <Tag color="blue">{article.category}</Tag>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2 line-clamp-2 hover:text-olive-green-600 transition-colors">
                  {language === 'ar' ? article.titleAr || article.title : article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {language === 'ar' ? article.excerptAr || article.excerpt : article.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <CalendarOutlined />
                    {dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}
                  </span>
                  <span className="flex items-center gap-1">
                    <EyeOutlined />
                    {article.views || 0}
                  </span>
                </div>
                <Button
                  type="link"
                  icon={<ArrowRightOutlined />}
                  className="p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/blog/${article.slug}`)
                  }}
                >
                  {language === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="text-center mt-8">
          <Button
            type="primary"
            size="large"
            className="bg-olive-green-600 hover:bg-olive-green-700"
            onClick={() => navigate('/blog')}
          >
            {language === 'ar' ? 'عرض جميع المقالات' : 'View All Articles'}
          </Button>
        </div>
      </div>
    </section>
  )
}

export default BlogSection


