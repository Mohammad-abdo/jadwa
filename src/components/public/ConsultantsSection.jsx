import React, { useState, useEffect } from 'react'
import { Card, Button, Avatar, Rate, Spin } from 'antd'
import { UserOutlined, RightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { consultantAPI } from '../../services/api'

const ConsultantsSection = ({ limit = null, showViewAll = true }) => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [consultants, setConsultants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConsultants()
  }, [])

  const fetchConsultants = async () => {
    try {
      setLoading(true)
      const params = { isAvailable: true }
      if (limit) params.limit = limit
      const response = await consultantAPI.getConsultants(params)
      setConsultants(response.consultants || [])
    } catch (err) {
      console.error('Error fetching consultants:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
            {t('ourConsultants')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'ar'
              ? 'فريق من المستشارين المتخصصين ذوي الخبرة الواسعة'
              : 'A team of specialized consultants with extensive experience'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : consultants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {consultants.map((consultant, index) => {
              const fullName = `${consultant.firstName || ''} ${consultant.lastName || ''}`.trim() || consultant.user?.email || 'Consultant'
              return (
                <Card
                  key={consultant.id}
                  className={`text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl hover-lift card-entrance`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  styles={{ body: { padding: '32px 24px' } }}
                  hoverable
                >
                  <Avatar
                    size={120}
                    src={consultant.user?.avatar}
                    icon={<UserOutlined />}
                    className="mb-6 border-4 border-white shadow-xl"
                  />
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{fullName}</h3>
                  {consultant.specialization && (
                    <p className="text-[#1a4d3a] mb-4 font-semibold">{consultant.specialization}</p>
                  )}
                  {consultant.rating && (
                    <Rate disabled defaultValue={consultant.rating} allowHalf className="mb-6" style={{ color: '#d4af37' }} />
                  )}
                  <Button
                    type="primary"
                    className="w-full bg-gradient-to-r from-[#1a4d3a] to-[#2d5f4f] hover:from-[#153d2d] hover:to-[#1a4d3a] border-0 h-11 font-semibold shadow-md hover:shadow-lg transition-all"
                    onClick={() => navigate(`/consultants/${consultant.id}`)}
                  >
                    {language === 'ar' ? 'عرض الملف الشخصي' : 'View Profile'}
                  </Button>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {language === 'ar' ? 'لا يوجد مستشارون متاحون حالياً' : 'No consultants available at the moment'}
          </div>
        )}

        {showViewAll && (
          <div className="text-center">
            <Button
              size="large"
              type="primary"
              className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#c9a227] hover:to-[#e6c93d] border-0 text-[#1a4d3a] h-14 px-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              icon={language === 'ar' ? <RightOutlined /> : <RightOutlined />}
              onClick={() => navigate('/consultants')}
            >
              {t('viewAllConsultants')}
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

export default ConsultantsSection

