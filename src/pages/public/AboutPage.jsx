import React from 'react'
import { Layout, Card, Row, Col, Statistic } from 'antd'
import {
  CheckCircleOutlined,
  BulbOutlined,
  SafetyOutlined,
  RocketOutlined,
  HeartOutlined,
  TeamOutlined,
  TrophyOutlined,
  GlobalOutlined,
  BarChartOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  UserOutlined,
  AimOutlined,
  BankOutlined,
  SolutionOutlined,
} from '@ant-design/icons'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import ScrollToTop from '../../components/public/ScrollToTop'
import { useLanguage } from '../../contexts/LanguageContext'

const { Content } = Layout
//update

const AboutPage = () => {
  const { t, language } = useLanguage()

  const values = [
    {
      icon: <SafetyOutlined className="text-4xl" />,
      title: language === 'ar' ? 'النزاهة والشفافية' : 'Integrity & Transparency',
      description: language === 'ar' 
        ? 'نلتزم بأعلى معايير الأخلاقيات والشفافية في جميع تعاملاتنا مع العملاء'
        : 'We commit to the highest standards of ethics and transparency in all our client interactions',
    },
    {
      icon: <RocketOutlined className="text-4xl" />,
      title: language === 'ar' ? 'الاحترافية' : 'Professionalism',
      description: language === 'ar'
        ? 'فريق من الخبراء المعتمدين ذوي الخبرة الواسعة في مختلف المجالات الاستشارية'
        : 'A team of certified experts with extensive experience in various consulting fields',
    },
    {
      icon: <BulbOutlined className="text-4xl" />,
      title: language === 'ar' ? 'التحليل العلمي' : 'Scientific Analysis',
      description: language === 'ar'
        ? 'اعتماد على أدوات التحليل الاقتصادي القياسي والذكاء الاصطناعي في تقديم الحلول'
        : 'Relying on econometric analysis tools and artificial intelligence in providing solutions',
    },
    {
      icon: <HeartOutlined className="text-4xl" />,
      title: language === 'ar' ? 'الموثوقية' : 'Reliability',
      description: language === 'ar'
        ? 'نتائج موثوقة ودقيقة قائمة على البيانات والأبحاث العلمية المعتمدة'
        : 'Reliable and accurate results based on data and accredited scientific research',
    },
  ]

  const services = [
    {
      icon: <BarChartOutlined className="text-3xl" />,
      title: language === 'ar' ? 'الاستشارات الاقتصادية' : 'Economic Consulting',
      description: language === 'ar'
        ? 'تحليل اقتصادي شامل ودراسات جدوى للمشاريع الاستثمارية'
        : 'Comprehensive economic analysis and feasibility studies for investment projects',
    },
    {
      icon: <TeamOutlined className="text-3xl" />,
      title: language === 'ar' ? 'الاستشارات الإدارية' : 'Administrative Consulting',
      description: language === 'ar'
        ? 'تحسين الهياكل التنظيمية وإدارة الموارد البشرية'
        : 'Organizational structure improvement and human resources management',
    },
    {
      icon: <CalculatorOutlined className="text-3xl" />,
      title: language === 'ar' ? 'الاستشارات المالية والمحاسبية' : 'Financial & Accounting Consulting',
      description: language === 'ar'
        ? 'تحليل مالي متقدم وخدمات محاسبية متخصصة'
        : 'Advanced financial analysis and specialized accounting services',
    },
    {
      icon: <FileTextOutlined className="text-3xl" />,
      title: language === 'ar' ? 'التقارير والدراسات' : 'Reports & Studies',
      description: language === 'ar'
        ? 'إعداد تقارير احترافية ودراسات متخصصة في مختلف المجالات'
        : 'Professional report preparation and specialized studies in various fields',
    },
  ]

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />
      <Content className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <>
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
                {language === 'ar' ? 'من نحن' : 'About Us'}
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-olive-green-600 to-turquoise-500 mx-auto mb-8"></div>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {language === 'ar'
                  ? 'منصة جدوى للاستشارات الإدارية والاقتصادية - منصة سعودية رائدة في تقديم الحلول الاستشارية المتخصصة'
                  : 'Jadwa for Administrative and Economic Consulting - A leading Saudi platform providing specialized consulting solutions'}
              </p>
            </div>

            {/* Who We Are Section */}
            <Card className="bg-white shadow-lg rounded-2xl border-0 mb-12">
                <Row gutter={[32, 32]} align="middle">
                  <Col xs={24} lg={12}>
                    <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                        {language === 'ar' ? 'من نحن' : 'Who We Are'}
                      </h2>
                      <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        {language === 'ar'
                          ? 'منصة جدوى هي منصة سعودية متخصصة في تقديم الخدمات الاستشارية عالية الجودة في مجالات الاقتصاد، الإدارة، والتمويل. نسعى من خلال فريق من الخبراء الأكاديميين والمستشارين المعتمدين إلى تمكين القرارات الاستثمارية والإدارية بالاعتماد على أدوات التحليل الاقتصادي القياسي والذكاء الاصطناعي.'
                          : 'Jadwa is a Saudi platform specialized in providing high-quality consulting services in the fields of economics, management, and finance. Through a team of academic experts and certified consultants, we seek to empower investment and administrative decisions by relying on econometric analysis tools and artificial intelligence.'}
                      </p>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {language === 'ar'
                          ? 'نقدم حلولاً شاملة ومتكاملة تساعد الشركات والأفراد والجهات الحكومية على اتخاذ قرارات مدروسة ومبنية على بيانات دقيقة وتحليلات علمية متقدمة.'
                          : 'We provide comprehensive and integrated solutions that help companies, individuals, and government entities make informed decisions based on accurate data and advanced scientific analysis.'}
                      </p>
                    </div>
                  </Col>
                  <Col xs={24} lg={12}>
                    <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-olive-green-600 to-turquoise-500 text-white">
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                              <BulbOutlined />
                              {language === 'ar' ? 'رؤيتنا' : 'Our Vision'}
                            </h4>
                            <p className="text-gray-100 leading-relaxed">
                              {language === 'ar'
                                ? 'أن نكون المنصة الأولى في العالم العربي في التحليل والاستشارات الاقتصادية المبنية على القياس الكمي والذكاء الاصطناعي، وأن نكون الشريك المفضل لصُنّاع القرار والمستثمرين.'
                                : 'To be the leading platform in the Arab world for quantitative-based economic analysis and consulting, and to be the preferred partner for decision-makers and investors.'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                              <RocketOutlined />
                              {language === 'ar' ? 'مهمتنا' : 'Our Mission'}
                            </h4>
                            <p className="text-gray-100 leading-relaxed">
                              {language === 'ar'
                                ? 'دعم صُنّاع القرار والمستثمرين والمشروعات عبر استشارات علمية وعملية موثوقة، وتمكينهم من اتخاذ قرارات استراتيجية مبنية على تحليلات دقيقة وبيانات موثوقة.'
                                : 'Supporting decision-makers, investors, and projects through reliable scientific and practical consultations, enabling them to make strategic decisions based on accurate analysis and reliable data.'}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </Col>
                </Row>
              </Card>

            {/* Statistics Section */}
            <Row gutter={[16, 16]} className="mb-12">
              <Col xs={12} sm={6}>
                <Card className="bg-white shadow-lg border-0 text-center hover:shadow-xl transition-shadow">
                    <Statistic
                      title={language === 'ar' ? 'مستشارون خبراء' : 'Expert Consultants'}
                      value={50}
                      prefix={<UserOutlined className="text-olive-green-600" />}
                      valueStyle={{ color: '#7a8c66', fontSize: '28px', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
              <Col xs={12} sm={6}>
                <Card className="bg-white shadow-lg border-0 text-center hover:shadow-xl transition-shadow">
                  <Statistic
                    title={language === 'ar' ? 'مشروع مكتمل' : 'Completed Projects'}
                    value={500}
                    prefix={<CheckCircleOutlined className="text-turquoise-500" />}
                    valueStyle={{ color: '#14b8a6', fontSize: '28px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="bg-white shadow-lg border-0 text-center hover:shadow-xl transition-shadow">
                  <Statistic
                    title={language === 'ar' ? 'عميل راضٍ' : 'Satisfied Clients'}
                    value={1000}
                    prefix={<HeartOutlined className="text-pink-500" />}
                    valueStyle={{ color: '#ec4899', fontSize: '28px', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="bg-white shadow-lg border-0 text-center hover:shadow-xl transition-shadow">
                    <Statistic
                      title={language === 'ar' ? 'سنة خبرة' : 'Years of Experience'}
                      value={10}
                      prefix={<TrophyOutlined className="text-yellow-500" />}
                      valueStyle={{ color: '#eab308', fontSize: '28px', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
              </Row>

            {/* Services Section */}
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900">
                {language === 'ar' ? 'خدماتنا' : 'Our Services'}
              </h2>
              <Row gutter={[24, 24]}>
                {services.map((service, index) => (
                  <Col xs={24} sm={12} lg={6} key={index}>
                    <Card className="bg-white shadow-lg border-0 h-full text-center hover:shadow-xl transition-shadow">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-olive-green-600 to-turquoise-500 flex items-center justify-center text-white mx-auto mb-6 shadow-md">
                        {service.icon}
                      </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">{service.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{service.description}</p>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>

            {/* Values Section */}
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900">
                {language === 'ar' ? 'قيمنا الأساسية' : 'Our Core Values'}
              </h2>
              <Row gutter={[24, 24]}>
                {values.map((value, index) => (
                  <Col xs={24} sm={12} lg={6} key={index}>
                    <Card className="bg-white shadow-lg border-0 h-full text-center hover:shadow-xl transition-shadow">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-olive-green-600 to-turquoise-500 flex items-center justify-center text-white mx-auto mb-6 shadow-md">
                        {value.icon}
                      </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{value.description}</p>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>

            {/* Why Choose Us Section */}
            <Card className="bg-white shadow-xl rounded-2xl border-0 mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900">
                  {language === 'ar' ? 'لماذا تختار جدوى؟' : 'Why Choose Jadwa?'}
                </h2>
                <Row gutter={[32, 32]}>
                  <Col xs={24} md={12}>
                    <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <ul className="space-y-4 text-lg text-gray-700">
                        <li className="flex items-start gap-3">
                          <CheckCircleOutlined className="text-olive-green-600 text-2xl mt-1 flex-shrink-0" />
                          <span>
                            {language === 'ar'
                              ? 'فريق من الخبراء المعتمدين ذوي الخبرة الواسعة في مختلف المجالات'
                              : 'A team of certified experts with extensive experience in various fields'}
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircleOutlined className="text-olive-green-600 text-2xl mt-1 flex-shrink-0" />
                          <span>
                            {language === 'ar'
                              ? 'استخدام أحدث أدوات التحليل الاقتصادي القياسي والذكاء الاصطناعي'
                              : 'Using the latest econometric analysis tools and artificial intelligence'}
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircleOutlined className="text-olive-green-600 text-2xl mt-1 flex-shrink-0" />
                          <span>
                            {language === 'ar'
                              ? 'نتائج موثوقة ودقيقة قائمة على البيانات والأبحاث العلمية'
                              : 'Reliable and accurate results based on data and scientific research'}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      <ul className="space-y-4 text-lg text-gray-700">
                        <li className="flex items-start gap-3">
                          <CheckCircleOutlined className="text-olive-green-600 text-2xl mt-1 flex-shrink-0" />
                          <span>
                            {language === 'ar'
                              ? 'حلول مخصصة تلبي احتياجات كل عميل بشكل فريد'
                              : 'Customized solutions that uniquely meet each client\'s needs'}
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircleOutlined className="text-olive-green-600 text-2xl mt-1 flex-shrink-0" />
                          <span>
                            {language === 'ar'
                              ? 'التزام بأعلى معايير الجودة والشفافية في جميع الخدمات'
                              : 'Commitment to the highest standards of quality and transparency in all services'}
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircleOutlined className="text-olive-green-600 text-2xl mt-1 flex-shrink-0" />
                          <span>
                            {language === 'ar'
                              ? 'دعم مستمر ومتابعة بعد تقديم الخدمة لضمان تحقيق النتائج'
                              : 'Continuous support and follow-up after service delivery to ensure results'}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </Col>
              </Row>
            </Card>

            {/* Our Story Section */}
            <Card className="bg-white shadow-lg rounded-2xl border-0 mb-12">
              <Row gutter={[32, 32]} align="middle">
                <Col xs={24} lg={12}>
                  <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                      {language === 'ar' ? 'قصتنا' : 'Our Story'}
                    </h2>
                    <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                      {language === 'ar'
                        ? 'بدأت منصة جدوى رحلتها بهدف واضح: تمكين الشركات والأفراد من اتخاذ قرارات اقتصادية وإدارية مدروسة ومبنية على بيانات دقيقة. تأسست المنصة على يد مجموعة من الخبراء الأكاديميين والمستشارين المعتمدين الذين يجمعون بين المعرفة النظرية العميقة والخبرة العملية الواسعة.'
                        : 'Jadwa Platform began its journey with a clear goal: to enable companies and individuals to make informed economic and administrative decisions based on accurate data. The platform was founded by a group of academic experts and certified consultants who combine deep theoretical knowledge with extensive practical experience.'}
                    </p>
                    <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                      {language === 'ar'
                        ? 'على مر السنين، طورنا منهجيات متقدمة في التحليل الاقتصادي القياسي، ودمجنا أحدث تقنيات الذكاء الاصطناعي في عملياتنا لضمان تقديم تحليلات دقيقة وموثوقة. نحن فخورون بكوننا شريكاً موثوقاً للعديد من الشركات الكبرى والمؤسسات الحكومية في المملكة العربية السعودية.'
                        : 'Over the years, we have developed advanced methodologies in econometric analysis and integrated the latest artificial intelligence technologies into our processes to ensure accurate and reliable analysis. We are proud to be a trusted partner for many major companies and government institutions in Saudi Arabia.'}
                    </p>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-olive-green-50 to-turquoise-50 p-6 rounded-lg text-center">
                      <TrophyOutlined className="text-4xl text-olive-green-600 mb-3" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {language === 'ar' ? 'الجودة' : 'Quality'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {language === 'ar'
                          ? 'نلتزم بأعلى معايير الجودة في جميع خدماتنا'
                          : 'We commit to the highest quality standards in all our services'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-turquoise-50 to-olive-green-50 p-6 rounded-lg text-center">
                      <AimOutlined className="text-4xl text-turquoise-600 mb-3" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {language === 'ar' ? 'الدقة' : 'Accuracy'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {language === 'ar'
                          ? 'تحليلات دقيقة مبنية على بيانات موثوقة'
                          : 'Accurate analysis based on reliable data'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-olive-green-50 to-turquoise-50 p-6 rounded-lg text-center">
                      <SolutionOutlined className="text-4xl text-olive-green-600 mb-3" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {language === 'ar' ? 'الحلول' : 'Solutions'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {language === 'ar'
                          ? 'حلول مخصصة تلبي احتياجات كل عميل'
                          : 'Customized solutions that meet each client\'s needs'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-turquoise-50 to-olive-green-50 p-6 rounded-lg text-center">
                      <BankOutlined className="text-4xl text-turquoise-600 mb-3" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {language === 'ar' ? 'الخبرة' : 'Expertise'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {language === 'ar'
                          ? 'فريق من الخبراء المعتمدين'
                          : 'A team of certified experts'}
                      </p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Our Approach Section */}
            <Card className="bg-white shadow-lg rounded-2xl border-0 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900">
                {language === 'ar' ? 'منهجيتنا' : 'Our Approach'}
              </h2>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-olive-green-100 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-olive-green-600">1</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">
                      {language === 'ar' ? 'التحليل' : 'Analysis'}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {language === 'ar'
                        ? 'نبدأ بتحليل شامل للوضع الحالي وجمع البيانات اللازمة لفهم التحديات والفرص المتاحة'
                        : 'We start with a comprehensive analysis of the current situation and collect the necessary data to understand challenges and opportunities'}
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-turquoise-100 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-turquoise-600">2</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">
                      {language === 'ar' ? 'التخطيط' : 'Planning'}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {language === 'ar'
                        ? 'نطور استراتيجية واضحة وخطة عمل مفصلة مبنية على التحليل والبيانات المتاحة'
                        : 'We develop a clear strategy and detailed action plan based on analysis and available data'}
                    </p>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-olive-green-100 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-olive-green-600">3</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">
                      {language === 'ar' ? 'التنفيذ' : 'Implementation'}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {language === 'ar'
                        ? 'ننفذ الحلول المقترحة مع متابعة مستمرة وضمان تحقيق النتائج المرجوة'
                        : 'We implement the proposed solutions with continuous follow-up and ensure achieving the desired results'}
                    </p>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Contact Section */}
            <Card className="bg-gradient-to-r from-olive-green-600 to-turquoise-500 text-white rounded-2xl border-0 text-center p-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {language === 'ar' ? 'هل تريد معرفة المزيد؟' : 'Want to Know More?'}
              </h2>
              <p className="text-xl mb-6 text-gray-100">
                {language === 'ar'
                  ? 'تواصل معنا اليوم واحصل على استشارة مجانية'
                  : 'Contact us today and get a free consultation'}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2">
                  <GlobalOutlined className="text-2xl" />
                  <span className="text-lg">www.jadwa.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <TeamOutlined className="text-2xl" />
                  <span className="text-lg">
                    {language === 'ar' ? 'فريق الدعم متاح 24/7' : 'Support team available 24/7'}
                  </span>
                </div>
              </div>
            </Card>
          </>
        </div>
      </Content>
      <Footer />
      <ScrollToTop />
    </Layout>
  )
}

export default AboutPage

