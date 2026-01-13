import React from 'react'
import { Card, Row, Col } from 'antd'
import { CheckCircleOutlined, BulbOutlined, SafetyOutlined, RocketOutlined, HeartOutlined } from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'

const AboutUsSection = () => {
  const { language } = useLanguage()

  const values = [
    {
      icon: SafetyOutlined,
      title: language === 'ar' ? 'النزاهة' : 'Integrity',
      description: language === 'ar' ? 'نلتزم بأعلى معايير الأخلاقيات والشفافية' : 'We commit to the highest standards of ethics and transparency',
    },
    {
      icon: RocketOutlined,
      title: language === 'ar' ? 'الاحتراف' : 'Professionalism',
      description: language === 'ar' ? 'فريق من الخبراء المعتمدين ذوي الخبرة الواسعة' : 'A team of certified experts with extensive experience',
    },
    {
      icon: BulbOutlined,
      title: language === 'ar' ? 'التحليل العلمي' : 'Scientific Analysis',
      description: language === 'ar' ? 'اعتماد على أدوات التحليل الاقتصادي القياسي والذكاء الاصطناعي' : 'Relying on econometric analysis tools and artificial intelligence',
    },
    {
      icon: RocketOutlined,
      title: language === 'ar' ? 'الابتكار' : 'Innovation',
      description: language === 'ar' ? 'استخدام أحدث التقنيات والأدوات في التحليل والاستشارات' : 'Using the latest technologies and tools in analysis and consulting',
    },
    {
      icon: HeartOutlined,
      title: language === 'ar' ? 'الموثوقية' : 'Reliability',
      description: language === 'ar' ? 'نتائج موثوقة ودقيقة قائمة على البيانات والأبحاث' : 'Reliable and accurate results based on data and research',
    },
  ]
  
  const IconComponent = ({ Icon }) => <Icon className="text-2xl sm:text-3xl" />

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in-down">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 text-gray-900">
            {language === 'ar' ? 'من نحن' : 'About Us'}
          </h2>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-[#1a4d3a] to-[#2d5f4f] mx-auto mb-6 sm:mb-8"></div>
        </div>

        <Row gutter={[16, 24]} className="sm:gutter-[24] md:gutter-[32] mb-8 sm:mb-12 md:mb-16">
          <Col xs={24} lg={12}>
            <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-[#1a4d3a]">
                {language === 'ar' 
                  ? 'جدوى للاستشارات الإدارية والاقتصادية'
                  : 'Jadwa for Administrative and Economic Consulting'}
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                {language === 'ar'
                  ? 'هي منصة سعودية متخصصة في تقديم الخدمات الاستشارية عالية الجودة في مجالات الاقتصاد، الإدارة، والتمويل. نسعى من خلال فريق من الخبراء الأكاديميين والمستشارين المعتمدين إلى تمكين القرارات الاستثمارية والإدارية بالاعتماد على أدوات التحليل الاقتصادي القياسي والذكاء الاصطناعي.'
                  : 'A Saudi platform specialized in providing high-quality consulting services in the fields of economics, management, and finance. Through a team of academic experts and certified consultants, we seek to empower investment and administrative decisions by relying on econometric analysis tools and artificial intelligence.'}
              </p>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <Card className="h-full border-0 shadow-lg rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1a4d3a] to-[#2d5f4f] text-white">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 flex items-center gap-2">
                      <CheckCircleOutlined />
                      {language === 'ar' ? 'رسالتنا' : 'Our Mission'}
                    </h4>
                    <p className="text-sm sm:text-base text-gray-100 leading-relaxed">
                      {language === 'ar'
                        ? 'دعم صُنّاع القرار والمستثمرين والمشروعات عبر استشارات علمية وعملية موثوقة.'
                        : 'Supporting decision-makers, investors, and projects through reliable scientific and practical consultations.'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 flex items-center gap-2">
                      <BulbOutlined />
                      {language === 'ar' ? 'رؤيتنا' : 'Our Vision'}
                    </h4>
                    <p className="text-sm sm:text-base text-gray-100 leading-relaxed">
                      {language === 'ar'
                        ? 'أن نكون المنصة الأولى في العالم العربي في التحليل والاستشارات الاقتصادية المبنية على القياس الكمي.'
                        : 'To be the leading platform in the Arab world for quantitative-based economic analysis and consulting.'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>

        <div className="mt-8 sm:mt-12 md:mt-16">
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
            {language === 'ar' ? 'قيمنا' : 'Our Values'}
          </h3>
          <Row gutter={[16, 16]} className="sm:gutter-[20] md:gutter-[24]">
            {values.map((value, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  className={`h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-xl sm:rounded-2xl text-center hover-lift card-entrance`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  styles={{ body: { padding: '24px 20px' } }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#1a4d3a] to-[#2d5f4f] flex items-center justify-center text-white mx-auto mb-4 sm:mb-6 shadow-lg">
                    <IconComponent Icon={value.icon} />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900">{value.title}</h4>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{value.description}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </section>
  )
}

export default AboutUsSection

