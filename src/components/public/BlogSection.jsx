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
      const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
      
      // Normalize image URLs
      const articlesWithImages = (response.articles?.slice(0, 3) || []).map(article => {
        if (article.featuredImage) {
          let featuredImage = article.featuredImage
          // Check if URL already contains the base URL (to avoid duplication)
          const baseUrlPattern = /^https?:\/\//
          if (baseUrlPattern.test(featuredImage)) {
            // Already a full URL, check for duplicates
            if (featuredImage.includes(`${apiBase}${apiBase}`) || featuredImage.match(/http:\/\/localhost:5000/g)?.length > 1) {
              // Remove duplicate base URL
              featuredImage = featuredImage.replace(/http:\/\/localhost:5000/g, '').replace(/^\/+/, '')
              featuredImage = `http://localhost:5000/${featuredImage}`
            }
          } else {
            // It's a relative path, construct full URL
            featuredImage = featuredImage.startsWith('/')
              ? `${apiBase}${featuredImage}`
              : `${apiBase}/${featuredImage}`
          }
          article.featuredImage = featuredImage
        }
        return article
      })
      
      setArticles(articlesWithImages)
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
                    <div className="relative h-56 overflow-hidden">
                      <img
                        alt={language === 'ar' ? article.titleAr || article.title : article.title}
                        src={article.featuredImage}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          console.error('Failed to load article image:', article.featuredImage)
                          e.target.style.display = 'none'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ) : (
                    <div className="h-56 bg-gradient-to-br from-[#1a4d3a] to-[#2d5f4f] flex items-center justify-center">
                      <span className="text-white text-5xl font-bold">
                        {language === 'ar' 
                          ? (article.titleAr || article.title).charAt(0) 
                          : article.title.charAt(0)}
                      </span>
                    </div>
                  )
                }
                onClick={() => navigate(`/blog/${article.slug}`)}
              >
                <div className="p-6">
                  <div className="mb-3">
                    {article.category && (
                      <Tag color="blue" className="mb-2">{article.category}</Tag>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-3 line-clamp-2 text-gray-900 group-hover:text-[#1a4d3a] transition-colors min-h-[56px]">
                    {language === 'ar' ? article.titleAr || article.title : article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed min-h-[72px]">
                      {language === 'ar' ? article.excerptAr || article.excerpt : article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
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
                    className="p-0 text-[#1a4d3a] hover:text-[#2d5f4f] font-semibold"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/blog/${article.slug}`)
                    }}
                  >
                    {language === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                  </Button>
                </div>
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


