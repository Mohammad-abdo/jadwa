import React, { useState, useEffect } from 'react'
import { Layout, Card, Row, Col, Input, Select, Spin, Empty, Avatar, Rate, Tag, Button, Space, Alert } from 'antd'
import { SearchOutlined, UserOutlined, StarOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import ScrollToTop from '../../components/public/ScrollToTop'
import { useLanguage } from '../../contexts/LanguageContext'
import { consultantAPI } from '../../services/api'

const { Content } = Layout
const { Search } = Input

const ConsultantsPage = () => {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [consultants, setConsultants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')

  useEffect(() => {
    fetchConsultants()
  }, [searchText, specializationFilter, ratingFilter, availabilityFilter])

  const fetchConsultants = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      
      if (searchText) params.search = searchText
      if (specializationFilter !== 'all') params.specialization = specializationFilter
      if (ratingFilter !== 'all') params.minRating = parseFloat(ratingFilter)
      if (availabilityFilter === 'available') params.isAvailable = true
      if (availabilityFilter === 'unavailable') params.isAvailable = false

      const response = await consultantAPI.getConsultants(params)
      setConsultants(response.consultants || [])
    } catch (err) {
      console.error('Error fetching consultants:', err)
      setError(err.message || 'Failed to load consultants')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchText('')
    setSpecializationFilter('all')
    setRatingFilter('all')
    setAvailabilityFilter('all')
  }

  const hasActiveFilters = searchText || specializationFilter !== 'all' || ratingFilter !== 'all' || availabilityFilter !== 'all'

  // Get unique specializations from consultants
  const specializations = [...new Set(consultants.map(c => c.specialization).filter(Boolean))]

  return (
    <Layout className="min-h-screen bg-white">
      <Header />
      <Content className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Page Header */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900">
              {language === 'ar' ? 'المستشارون' : 'Our Consultants'}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              {language === 'ar' 
                ? 'فريق من المستشارين المتخصصين ذوي الخبرة الواسعة في مختلف المجالات الاقتصادية والإدارية'
                : 'A team of specialized consultants with extensive experience in various economic and administrative fields'}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Search
                placeholder={language === 'ar' ? 'ابحث عن مستشار...' : 'Search for a consultant...'}
                allowClear
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={fetchConsultants}
                className="flex-1"
                prefix={<SearchOutlined className="text-gray-400" />}
                style={{ borderRadius: '12px' }}
              />
              
              <Space.Compact className="flex flex-col md:flex-row gap-2 md:gap-0">
                <Select
                  value={specializationFilter}
                  onChange={setSpecializationFilter}
                  placeholder={language === 'ar' ? 'التخصص' : 'Specialization'}
                  style={{ width: 200 }}
                  size="large"
                  allowClear
                >
                  <Select.Option value="all">{language === 'ar' ? 'جميع التخصصات' : 'All Specializations'}</Select.Option>
                  {specializations.map(spec => (
                    <Select.Option key={spec} value={spec}>{spec}</Select.Option>
                  ))}
                </Select>
                
                <Select
                  value={ratingFilter}
                  onChange={setRatingFilter}
                  placeholder={language === 'ar' ? 'التقييم' : 'Rating'}
                  style={{ width: 150 }}
                  size="large"
                >
                  <Select.Option value="all">{language === 'ar' ? 'جميع التقييمات' : 'All Ratings'}</Select.Option>
                  <Select.Option value="4.5">4.5+ ⭐</Select.Option>
                  <Select.Option value="4.0">4.0+ ⭐</Select.Option>
                  <Select.Option value="3.5">3.5+ ⭐</Select.Option>
                  <Select.Option value="3.0">3.0+ ⭐</Select.Option>
                </Select>
                
                <Select
                  value={availabilityFilter}
                  onChange={setAvailabilityFilter}
                  placeholder={language === 'ar' ? 'الحالة' : 'Status'}
                  style={{ width: 150 }}
                  size="large"
                >
                  <Select.Option value="all">{language === 'ar' ? 'الكل' : 'All'}</Select.Option>
                  <Select.Option value="available">{language === 'ar' ? 'متاح' : 'Available'}</Select.Option>
                  <Select.Option value="unavailable">{language === 'ar' ? 'غير متاح' : 'Unavailable'}</Select.Option>
                </Select>
                
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
            <div className="mb-6 text-gray-600">
              {language === 'ar' 
                ? `تم العثور على ${consultants.length} مستشار`
                : `Found ${consultants.length} consultant${consultants.length !== 1 ? 's' : ''}`}
            </div>
          )}

          {/* Consultants Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          ) : consultants.length === 0 ? (
            <Empty 
              description={language === 'ar' ? 'لا يوجد مستشارون متاحون' : 'No consultants available'}
              className="py-20"
            />
          ) : (
            <Row gutter={[24, 24]}>
              {consultants.map((consultant) => {
                const fullName = `${consultant.firstName || ''} ${consultant.lastName || ''}`.trim() || consultant.user?.email || 'Consultant'
                const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
                const avatarUrl = consultant.user?.avatar 
                  ? (consultant.user.avatar.startsWith('http') 
                      ? consultant.user.avatar 
                      : `${apiBase}${consultant.user.avatar.startsWith('/') ? '' : '/'}${consultant.user.avatar}`)
                  : null

                return (
                  <Col xs={24} sm={12} lg={8} xl={6} key={consultant.id}>
                    <Card
                      hoverable
                      className="h-full transition-all duration-300 hover:shadow-2xl border-0 rounded-2xl overflow-hidden group"
                      styles={{ body: { padding: '0' } }}
                      onClick={() => navigate(`/consultants/${consultant.id}`)}
                    >
                      <div className="relative">
                        {/* Avatar Section */}
                        <div className="bg-gradient-to-br from-olive-green-50 to-turquoise-50 p-8 flex items-center justify-center">
                          <Avatar
                            size={120}
                            src={avatarUrl}
                            icon={<UserOutlined />}
                            className="border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        
                        {/* Content Section */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2 text-gray-900 line-clamp-1">
                            {fullName}
                          </h3>
                          
                          {consultant.specialization && (
                            <Tag 
                              color="blue" 
                              className="mb-3 text-xs px-2 py-1"
                            >
                              {consultant.specialization}
                            </Tag>
                          )}
                          
                          {consultant.rating && (
                            <div className="flex items-center gap-2 mb-4">
                              <Rate 
                                disabled 
                                defaultValue={consultant.rating} 
                                allowHalf 
                                style={{ fontSize: '14px', color: '#d4af37' }} 
                              />
                              <span className="text-sm text-gray-600">
                                {consultant.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          
                          {consultant.bio && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {language === 'ar' && consultant.bioAr ? consultant.bioAr : consultant.bio}
                            </p>
                          )}
                          
                          <Button
                            type="primary"
                            block
                            size="large"
                            className="bg-gradient-to-r from-[#1a4d3a] to-[#2d5f4f] hover:from-[#153d2d] hover:to-[#1a4d3a] border-0 font-semibold shadow-md hover:shadow-lg transition-all"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/consultants/${consultant.id}`)
                            }}
                          >
                            {language === 'ar' ? 'عرض الملف الشخصي' : 'View Profile'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          )}
        </div>
      </Content>
      <Footer />
      <ScrollToTop />
    </Layout>
  )
}

export default ConsultantsPage
