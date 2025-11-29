import React, { useState, useEffect } from 'react'
import { Layout, Card, Row, Col, Spin, Alert } from 'antd'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import { useLanguage } from '../../contexts/LanguageContext'
import { cmsAPI } from '../../services/api'

const { Content } = Layout

const AboutPage = () => {
  const { t, language } = useLanguage()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAboutPage()
  }, [])

  const fetchAboutPage = async () => {
    try {
      setLoading(true)
      // Try to fetch 'about' page from CMS
      const response = await cmsAPI.getPageBySlug('about')
      setPage(response.page)
    } catch (err) {
      console.error('Error fetching about page:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : error ? (
            <Alert
              message={language === 'ar' ? 'خطأ في تحميل الصفحة' : 'Error loading page'}
              description={error}
              type="error"
              showIcon
            />
          ) : page ? (
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                {language === 'ar' ? page.titleAr || page.title : page.title}
              </h1>
              <Card className="mb-8">
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: language === 'ar' ? (page.contentAr || page.content) : page.content 
                  }}
                />
              </Card>
            </div>
          ) : (
            <div>
              <h1 className="text-4xl font-bold mb-6">{t('about')}</h1>
              <Card>
                <div className="prose prose-lg">
                  <h2>{language === 'ar' ? 'من نحن' : 'Who We Are'}</h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {language === 'ar'
                      ? 'منصة جدوي هي منصة استشارية متخصصة في تقديم الخدمات الاستشارية الاقتصادية والإدارية والمالية. نحن نقدم حلولاً شاملة لعملائنا من خلال فريق من المستشارين الخبراء.'
                      : 'Jadwa Platform is a specialized consulting platform providing economic, administrative, and financial consulting services. We offer comprehensive solutions to our clients through a team of expert consultants.'}
                  </p>
                  
                  <h2>{language === 'ar' ? 'رؤيتنا' : 'Our Vision'}</h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {language === 'ar'
                      ? 'أن نكون المنصة الرائدة في مجال الاستشارات في المملكة العربية السعودية والمنطقة.'
                      : 'To be the leading consulting platform in Saudi Arabia and the region.'}
                  </p>

                  <h2>{language === 'ar' ? 'مهمتنا' : 'Our Mission'}</h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {language === 'ar'
                      ? 'تقديم خدمات استشارية عالية الجودة تساعد عملاءنا على اتخاذ قرارات مدروسة وتحقيق أهدافهم.'
                      : 'To provide high-quality consulting services that help our clients make informed decisions and achieve their goals.'}
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Content>
      <Footer />
    </Layout>
  )
}

export default AboutPage

