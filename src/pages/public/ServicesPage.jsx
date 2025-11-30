import React, { useState, useEffect } from 'react'
import { Layout, Card, Button, Tag, Spin, Row, Col, Input, Select, Space } from 'antd'
import { SearchOutlined, DollarOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
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
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchServices()
  }, [searchText, categoryFilter])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const params = { status: 'ACTIVE' }
      if (searchText) params.search = searchText
      if (categoryFilter !== 'all') params.category = categoryFilter

      const response = await servicesAPI.getServices(params)
      setServices(response.services || [])
    } catch (err) {
      console.error('Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }

  // Icon mapping based on category
  const getIcon = (category) => {
    const iconMap = {
      'ECONOMIC': <BarChartOutlined className="text-4xl" />,
      'ADMINISTRATIVE': <TeamOutlined className="text-4xl" />,
      'FINANCIAL_ACCOUNTING': <DollarOutlined className="text-4xl" />,
      'ANALYSIS_REPORTS': <FileTextOutlined className="text-4xl" />,
      'FIELD_SURVEY': <SearchIcon className="text-4xl" />,
      'DIGITAL_CUSTOMER': <VideoCameraOutlined className="text-4xl" />,
    }
    return iconMap[category] || <FileTextOutlined className="text-4xl" />
  }

  // Color mapping based on category
  const getColor = (category) => {
    const colorMap = {
      'ECONOMIC': 'from-olive-green-500 to-olive-green-600',
      'ADMINISTRATIVE': 'from-turquoise-500 to-turquoise-600',
      'FINANCIAL_ACCOUNTING': 'from-olive-green-400 to-turquoise-500',
      'ANALYSIS_REPORTS': 'from-turquoise-400 to-olive-green-500',
      'FIELD_SURVEY': 'from-olive-green-600 to-turquoise-600',
      'DIGITAL_CUSTOMER': 'from-turquoise-500 to-olive-green-500',
    }
    return colorMap[category] || 'from-olive-green-500 to-turquoise-500'
  }

  // Category labels
  const getCategoryLabel = (category) => {
    const labels = {
      'ECONOMIC': language === 'ar' ? 'اقتصادية' : 'Economic',
      'ADMINISTRATIVE': language === 'ar' ? 'إدارية' : 'Administrative',
      'FINANCIAL_ACCOUNTING': language === 'ar' ? 'مالية ومحاسبية' : 'Financial & Accounting',
      'ANALYSIS_REPORTS': language === 'ar' ? 'تحليل وتقارير' : 'Analysis & Reports',
      'FIELD_SURVEY': language === 'ar' ? 'ميدانية' : 'Field Survey',
      'DIGITAL_CUSTOMER': language === 'ar' ? 'رقمية' : 'Digital',
    }
    return labels[category] || category
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
      <Content className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
              {language === 'ar' ? 'الخدمات' : 'Services'}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'ar'
                ? 'القائمة الكاملة لخدمات منصة جدوى'
                : 'Complete list of Jadwa Platform services'}
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <Space.Compact className="flex-1">
              <Input
                placeholder={language === 'ar' ? 'ابحث عن خدمة...' : 'Search for a service...'}
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="large"
              />
            </Space.Compact>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categories}
              size="large"
              className="w-full md:w-64"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : services.length > 0 ? (
            <Row gutter={[24, 24]}>
              {services.map((service) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={service.id}>
                  <Card
                    className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl overflow-hidden group"
                    styles={{ body: { padding: '32px' } }}
                  >
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getColor(service.category)} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {getIcon(service.category)}
                    </div>
                    <Tag color="blue" className="mb-3">
                      {getCategoryLabel(service.category)}
                    </Tag>
                    <h3 className="text-xl font-bold mb-4 text-gray-900 min-h-[56px]">
                      {language === 'ar' ? service.titleAr || service.title : service.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed min-h-[72px] line-clamp-3">
                      {language === 'ar' ? service.descriptionAr || service.description : service.description}
                    </p>
                    {service.price && service.price > 0 && (
                      <div className="mb-4 text-[#1a4d3a] font-bold text-lg">
                        {service.price} {language === 'ar' ? 'ريال' : 'SAR'}
                      </div>
                    )}
                    {service.targetAudience && (
                      <div className="mb-4 text-sm text-gray-500">
                        <strong>{language === 'ar' ? 'الفئة المستهدفة: ' : 'Target Audience: '}</strong>
                        {service.targetAudience}
                      </div>
                    )}
                    <Button
                      type="primary"
                      className="w-full bg-gradient-to-r from-[#1a4d3a] to-[#2d5f4f] hover:from-[#153d2d] hover:to-[#1a4d3a] border-0 h-11 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                      onClick={() => navigate('/login')}
                    >
                      {language === 'ar' ? 'طلب الخدمة' : 'Request Service'}
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {language === 'ar' ? 'لا توجد خدمات متاحة' : 'No services available'}
            </div>
          )}
        </div>
      </Content>
      <Footer />
    </Layout>
  )
}

export default ServicesPage
