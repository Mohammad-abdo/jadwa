import React, { useState, useEffect } from 'react'
import { Layout, Card, Row, Col, Input, Select, Spin, Empty, Image, Tag, Button } from 'antd'
import { SearchOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import { useLanguage } from '../../contexts/LanguageContext'
import { articlesAPI } from '../../services/api'
import dayjs from 'dayjs'

const { Content } = Layout
const { Search } = Input

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
      setArticles(response.articles || [])
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
      <Content className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'ar' ? 'المدونة' : 'Blog'}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'اكتشف آخر المقالات والأخبار حول الاستشارات والدراسات الاقتصادية'
                : 'Discover the latest articles and news about consulting and economic studies'}
            </p>
          </div>

          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <Search
              placeholder={language === 'ar' ? 'ابحث في المقالات...' : 'Search articles...'}
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1"
            />
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 200 }}
              size="large"
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
                  className="mb-8 overflow-hidden"
                  style={{ borderRadius: '16px' }}
                  cover={
                    articles[0].featuredImage ? (
                      <div className="relative h-96 overflow-hidden">
                        <img
                          src={articles[0].featuredImage}
                          alt={language === 'ar' ? articles[0].titleAr || articles[0].title : articles[0].title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          {articles[0].category && (
                            <Tag color="blue" className="mb-2">
                              {articles[0].category}
                            </Tag>
                          )}
                          <h2 className="text-3xl md:text-4xl font-bold mb-2">
                            {language === 'ar' ? articles[0].titleAr || articles[0].title : articles[0].title}
                          </h2>
                          {articles[0].excerpt && (
                            <p className="text-lg text-gray-200 mb-4 line-clamp-2">
                              {language === 'ar' ? articles[0].excerptAr || articles[0].excerpt : articles[0].excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <CalendarOutlined />
                              {dayjs(articles[0].publishedAt || articles[0].createdAt).format('YYYY-MM-DD')}
                            </span>
                            <span className="flex items-center gap-1">
                              <EyeOutlined />
                              {articles[0].views || 0}
                            </span>
                          </div>
                          <Button
                            type="primary"
                            size="large"
                            className="mt-4 bg-white text-gray-900 hover:bg-gray-100"
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
              <Row gutter={[24, 24]}>
                {articles.slice(1).map((article) => (
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
    </Layout>
  )
}

export default BlogPage

