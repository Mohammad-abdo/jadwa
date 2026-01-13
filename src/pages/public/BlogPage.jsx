import React, { useState, useEffect } from 'react'
import { Layout, Card, Row, Col, Input, Select, Spin, Empty, Image, Tag, Button, Space } from 'antd'
import { SearchOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import ScrollToTop from '../../components/public/ScrollToTop'
import { useLanguage } from '../../contexts/LanguageContext'
import { articlesAPI } from '../../services/api'
import dayjs from 'dayjs'

const { Content } = Layout

const BlogPage = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchArticles()
  }, [searchText, categoryFilter])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const params = { status: 'PUBLISHED' }
      if (searchText) params.search = searchText
      if (categoryFilter !== 'all') params.category = categoryFilter

      const response = await articlesAPI.getArticles(params)
      const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
      
      // Normalize image URLs
      const articlesWithImages = (response.articles || []).map(article => {
        if (article.featuredImage) {
          let featuredImage = article.featuredImage
          // Check if URL already contains the base URL (to avoid duplication)
          const baseUrlPattern = /^https?:\/\//
          if (baseUrlPattern.test(featuredImage)) {
            // Already a full URL, use it as-is
            // But check if it's duplicated (contains base URL twice)
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

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))]

  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-gray-900">
              {language === 'ar' ? 'المدونة' : 'Blog'}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              {language === 'ar' 
                ? 'اكتشف آخر المقالات والأخبار حول الاستشارات والدراسات الاقتصادية'
                : 'Discover the latest articles and news about consulting and economic studies'}
            </p>
          </div>

          <div className="mb-12 flex flex-col md:flex-row gap-4">
            <Space.Compact className="flex-1">
              <Input
                placeholder={language === 'ar' ? 'ابحث في المقالات...' : 'Search articles...'}
                allowClear
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={() => {}}
                className="flex-1 border-2 border-gray-200 focus:border-[#1a4d3a] rounded-lg"
              />
              <Button 
                type="primary" 
                icon={<SearchOutlined />} 
                size="large"
                className="bg-gradient-to-r from-[#1a4d3a] to-[#2d5f4f] hover:from-[#153d2d] hover:to-[#1a4d3a] border-0 font-semibold"
                onClick={() => {}}
              />
            </Space.Compact>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 200 }}
              size="large"
              className="border-2 border-gray-200 focus:border-[#1a4d3a] rounded-lg"
            >
              <Select.Option value="all">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</Select.Option>
              {categories.map(cat => (
                <Select.Option key={cat} value={cat}>{cat}</Select.Option>
              ))}
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : articles.length === 0 ? (
            <Empty 
              description={language === 'ar' ? 'لا توجد مقالات متاحة' : 'No articles available'}
              className="py-12"
            />
          ) : (
            <>
              {/* Featured Article (First one) */}
              {articles.length > 0 && (
                <Card
                  className="mb-12 overflow-hidden border-0 shadow-2xl"
                  styles={{ body: { padding: '0' } }}
                  style={{ borderRadius: '24px' }}
                  cover={
                    articles[0].featuredImage ? (
                      <div className="relative h-[500px] overflow-hidden">
                        <img
                          src={articles[0].featuredImage}
                          alt={language === 'ar' ? articles[0].titleAr || articles[0].title : articles[0].title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Failed to load featured image:', articles[0].featuredImage)
                            e.target.style.display = 'none'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                          {articles[0].category && (
                            <Tag color="blue" className="mb-4 text-sm px-4 py-1 font-semibold">
                              {articles[0].category}
                            </Tag>
                          )}
                          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                            {language === 'ar' ? articles[0].titleAr || articles[0].title : articles[0].title}
                          </h2>
                          {articles[0].excerpt && (
                            <p className="text-xl text-gray-100 mb-6 line-clamp-2 leading-relaxed">
                              {language === 'ar' ? articles[0].excerptAr || articles[0].excerpt : articles[0].excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-6 text-base mb-6">
                            <span className="flex items-center gap-2">
                              <CalendarOutlined />
                              {dayjs(articles[0].publishedAt || articles[0].createdAt).format('YYYY-MM-DD')}
                            </span>
                            <span className="flex items-center gap-2">
                              <EyeOutlined />
                              {articles[0].views || 0}
                            </span>
                          </div>
                          <Button
                            type="primary"
                            size="large"
                            className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#c9a227] hover:to-[#e6c93d] border-0 text-[#1a4d3a] h-14 px-10 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                            onClick={() => navigate(`/blog/${articles[0].slug}`)}
                          >
                            {language === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                          </Button>
                        </div>
                      </div>
                    ) : null
                  }
                />
              )}

              {/* Other Articles Grid */}
              <Row gutter={[32, 32]}>
                {articles.slice(1).map((article) => (
                  <Col xs={24} sm={12} lg={8} key={article.id}>
                    <Card
                      hoverable
                      className="h-full transition-all duration-300 hover:shadow-2xl border-0 rounded-2xl overflow-hidden group"
                      styles={{ body: { padding: '0' } }}
                      cover={
                        article.featuredImage ? (
                          <div className="relative h-48 overflow-hidden">
                            <img
                              alt={language === 'ar' ? article.titleAr || article.title : article.title}
                              src={article.featuredImage}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              onError={(e) => {
                                console.error('Failed to load article image:', article.featuredImage)
                                e.target.style.display = 'none'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="h-48 bg-gradient-to-br from-olive-green-400 to-turquoise-400 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold">
                              {language === 'ar' ? (article.titleAr || article.title).charAt(0) : article.title.charAt(0)}
                            </span>
                          </div>
                        )
                      }
                      onClick={() => navigate(`/blog/${article.slug}`)}
                    >
                      <div className="mb-2">
                        {article.category && (
                          <Tag color="blue" className="mb-2">
                            {article.category}
                          </Tag>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2 hover:text-olive-green-600 transition-colors">
                        {language === 'ar' ? article.titleAr || article.title : article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {language === 'ar' ? article.excerptAr || article.excerpt : article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarOutlined />
                          {dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}
                        </span>
                        <span className="flex items-center gap-1">
                          <EyeOutlined />
                          {article.views || 0}
                        </span>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </div>
      </Content>
      <Footer />
      <ScrollToTop />
    </Layout>
  )
}

export default BlogPage

