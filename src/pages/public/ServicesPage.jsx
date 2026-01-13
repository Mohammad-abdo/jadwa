import React, { useState, useEffect } from 'react'
import { Layout, Card, Button, Tag, Spin, Row, Col, Input, Select, Space, Alert, Empty } from 'antd'
import { SearchOutlined, DollarOutlined, ClearOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import ScrollToTop from '../../components/public/ScrollToTop'
import { useLanguage } from '../../contexts/LanguageContext'
import { servicesAPI } from '../../services/api'
import {
  BarChartOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  VideoCameraOutlined,
  TeamOutlined,
  SearchOutlined as SearchIcon,
  GlobalOutlined,
} from '@ant-design/icons'

const { Content } = Layout
const { Search } = Input

const ServicesPage = () => {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchServices()
  }, [searchText, categoryFilter])

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = { status: 'ACTIVE' }
      if (searchText) params.search = searchText
      if (categoryFilter !== 'all') params.category = categoryFilter

      const response = await servicesAPI.getServices(params)
      setServices(response.services || [])
    } catch (err) {
      console.error('Error fetching services:', err)
      setError(err.message || 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchText('')
    setCategoryFilter('all')
  }

  const hasActiveFilters = searchText || categoryFilter !== 'all'

  // Helper to normalize category to string (handles both string and object)
  const getCategoryValue = (category) => {
    if (!category) return ''
    if (typeof category === 'string') return category
    if (typeof category === 'object') {
      // If it's a Category object, return the name or slug
      return category.name || category.slug || ''
    }
    return String(category)
  }

  // Icon mapping based on category
  const getIcon = (category) => {
    const categoryValue = getCategoryValue(category)
    const iconMap = {
      'ECONOMIC': <BarChartOutlined className="text-4xl" />,
      'ADMINISTRATIVE': <TeamOutlined className="text-4xl" />,
      'FINANCIAL_ACCOUNTING': <DollarOutlined className="text-4xl" />,
      'ANALYSIS_REPORTS': <FileTextOutlined className="text-4xl" />,
      'FIELD_SURVEY': <SearchIcon className="text-4xl" />,
      'DIGITAL_CUSTOMER': <VideoCameraOutlined className="text-4xl" />,
    }
    return iconMap[categoryValue] || <FileTextOutlined className="text-4xl" />
  }

  // Color mapping based on category
  const getColor = (category) => {
    const categoryValue = getCategoryValue(category)
    const colorMap = {
      'ECONOMIC': 'from-olive-green-500 to-olive-green-600',
      'ADMINISTRATIVE': 'from-turquoise-500 to-turquoise-600',
      'FINANCIAL_ACCOUNTING': 'from-olive-green-400 to-turquoise-500',
      'ANALYSIS_REPORTS': 'from-turquoise-400 to-olive-green-500',
      'FIELD_SURVEY': 'from-olive-green-600 to-turquoise-600',
      'DIGITAL_CUSTOMER': 'from-turquoise-500 to-olive-green-500',
    }
    return colorMap[categoryValue] || 'from-olive-green-500 to-turquoise-500'
  }

  // Category labels
  const getCategoryLabel = (category) => {
    const categoryValue = getCategoryValue(category)
    
    // If it's an object with name/nameAr, use those
    if (typeof category === 'object' && category !== null) {
      if (language === 'ar' && category.nameAr) return category.nameAr
      if (category.name) return category.name
    }
    
    // Otherwise use the mapped labels
    const labels = {
      'ECONOMIC': language === 'ar' ? 'اقتصادية' : 'Economic',
      'ADMINISTRATIVE': language === 'ar' ? 'إدارية' : 'Administrative',
      'FINANCIAL_ACCOUNTING': language === 'ar' ? 'مالية ومحاسبية' : 'Financial & Accounting',
      'ANALYSIS_REPORTS': language === 'ar' ? 'تحليل وتقارير' : 'Analysis & Reports',
      'FIELD_SURVEY': language === 'ar' ? 'ميدانية' : 'Field Survey',
      'DIGITAL_CUSTOMER': language === 'ar' ? 'رقمية' : 'Digital',
    }
    return labels[categoryValue] || categoryValue || 'Category'
  }

  const categories = [
    { value: 'all', label: language === 'ar' ? 'الكل' : 'All' },
    { value: 'ECONOMIC', label: language === 'ar' ? 'اقتصادية' : 'Economic' },
    { value: 'ADMINISTRATIVE', label: language === 'ar' ? 'إدارية' : 'Administrative' },
    { value: 'FINANCIAL_ACCOUNTING', label: language === 'ar' ? 'مالية ومحاسبية' : 'Financial & Accounting' },
    { value: 'ANALYSIS_REPORTS', label: language === 'ar' ? 'تحليل وتقارير' : 'Analysis & Reports' },
    { value: 'FIELD_SURVEY', label: language === 'ar' ? 'ميدانية' : 'Field Survey' },
    { value: 'DIGITAL_CUSTOMER', label: language === 'ar' ? 'رقمية' : 'Digital' },
  ]

  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900">
              {language === 'ar' ? 'الخدمات' : 'Our Services'}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              {language === 'ar'
                ? 'القائمة الكاملة لخدمات منصة جدوى الاستشارية والاقتصادية'
                : 'Complete list of Jadwa Platform consulting and economic services'}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder={language === 'ar' ? 'ابحث عن خدمة...' : 'Search for a service...'}
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={fetchServices}
                size="large"
                allowClear
                className="flex-1"
                style={{ borderRadius: '12px' }}
              />
              
              <Space.Compact className="flex flex-col md:flex-row gap-2 md:gap-0">
                <Select
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={categories}
                  size="large"
                  style={{ width: 200 }}
                  placeholder={language === 'ar' ? 'الفئة' : 'Category'}
                />
                
                {hasActiveFilters && (
                  <Button
                    icon={<ClearOutlined />}
                    onClick={clearFilters}
                    size="large"
                    className="border-gray-300"
                  >
                    {language === 'ar' ? 'مسح' : 'Clear'}
                  </Button>
                )}
              </Space.Compact>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              message={language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error Loading Data'}
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              className="mb-6"
            />
          )}

          {/* Results Count */}
          {!loading && (
            <div className="mb-6 text-gray-600 font-medium">
              {language === 'ar' 
                ? `تم العثور على ${services.length} خدمة`
                : `Found ${services.length} service${services.length !== 1 ? 's' : ''}`}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : services.length === 0 ? (
            <Empty 
              description={language === 'ar' ? 'لا توجد خدمات متاحة' : 'No services available'}
              className="py-20"
            />
          ) : (
            <Row gutter={[16, 16]} className="sm:gutter-[24]">
              {services.map((service) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={service.id}>
                  <Card
                    hoverable
                    className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden group"
                    styles={{ body: { padding: '0' } }}
                  >
                    <div className="p-6">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getColor(service.category)} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg mx-auto`}>
                        {getIcon(service.category)}
                      </div>
                      <Tag color="blue" className="mb-3 text-xs px-2 py-1">
                        {getCategoryLabel(service.category)}
                      </Tag>
                      <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">
                        {language === 'ar' ? service.titleAr || service.title : service.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3 min-h-[60px]">
                        {language === 'ar' ? service.descriptionAr || service.description : service.description}
                      </p>
                      {service.price && service.price > 0 && (
                        <div className="mb-4 text-[#1a4d3a] font-bold text-lg">
                          {service.price} {language === 'ar' ? 'ريال' : 'SAR'}
                        </div>
                      )}
                      {service.targetAudience && (
                        <div className="mb-4 text-xs text-gray-500">
                          <strong>{language === 'ar' ? 'الفئة المستهدفة: ' : 'Target Audience: '}</strong>
                          {service.targetAudience}
                        </div>
                      )}
                      <Button
                        type="primary"
                        block
                        size="large"
                        className="bg-gradient-to-r from-[#1a4d3a] to-[#2d5f4f] hover:from-[#153d2d] hover:to-[#1a4d3a] border-0 font-semibold shadow-md hover:shadow-lg transition-all"
                        onClick={() => navigate('/login')}
                      >
                        {language === 'ar' ? 'طلب الخدمة' : 'Request Service'}
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Content>
      <Footer />
      <ScrollToTop />
    </Layout>
  )
}

export default ServicesPage
