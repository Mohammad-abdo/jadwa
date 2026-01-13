import React, { useState } from 'react'
import { Layout, Typography, Card, Tabs, Space } from 'antd'
import { FileTextOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'
import PublicNavbar from '../../components/public/Header'
import PublicFooter from '../../components/public/Footer'
import 'react-quill/dist/quill.snow.css'

const { Content } = Layout
const { Title, Paragraph } = Typography

const TermsPage = () => {
  const { language } = useLanguage()
  const { settings } = useTheme()
  const [activeTab, setActiveTab] = useState('client')

  const activeClientTerms = language === 'ar' ? settings.termsClient : (settings.termsClientEn || settings.termsClient)
  const activeConsultantTerms = language === 'ar' ? settings.termsConsultant : (settings.termsConsultantEn || settings.termsConsultant)

  const items = [
    {
      key: 'client',
      label: (
        <Space>
          <UserOutlined />
          <span>{language === 'ar' ? 'شروط العملاء' : 'Client Terms'}</span>
        </Space>
      ),
      children: (
        <div className="py-4 custom">
          {activeClientTerms ? (
            <div 
              className="ql-editor prose max-w-none text-gray-700 custom"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              dangerouslySetInnerHTML={{ __html: activeClientTerms }} 
              style={{ padding: 0, minHeight: 'auto'    , textAlign : language === 'ar' ? 'right' : 'left' }}
            />
          ) : (
            <Paragraph className="text-base leading-loose text-gray-700">
              {language === 'ar' ? 'لا توجد شروط وأحكام مضافة حالياً.' : 'No terms and conditions available at the moment.'}
            </Paragraph>
          )}
        </div>
      ),
    },
    {
      key: 'consultant',
      label: (
        <Space>
          <TeamOutlined />
          <span>{language === 'ar' ? 'شروط المستشارين' : 'Consultant Terms'}</span>
        </Space>
      ),
      children: (
        <div className="py-4 custom">
          {activeConsultantTerms ? (
            <div 
              className="ql-editor prose max-w-none text-gray-700 custom"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              dangerouslySetInnerHTML={{ __html: activeConsultantTerms }} 
              style={{ padding: 0, minHeight: 'auto'  , textAlign : language === 'ar' ? 'right' : 'left'}}
            />
          ) : (
            <Paragraph className="text-base leading-loose text-gray-700">
              {language === 'ar' ? 'لا توجد شروط وأحكام مضافة حالياً.' : 'No terms and conditions available at the moment.'}
            </Paragraph>
          )}
        </div>
      ),
    },
  ]

  return (
    <Layout className="min-h-screen bg-white">
      <PublicNavbar />
      
      <Content className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Title level={1} className="mb-4">
              {language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
            </Title>
            <Paragraph type="secondary" className="text-lg">
              {language === 'ar' ? 'سياسات استخدام المنصة للعملاء والمستشارين' : 'Platform usage policies for clients and consultants'}
            </Paragraph>
          </div>

          <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab} 
              items={items} 
              centered
              size="large"
              tabBarStyle={{ marginBottom: 32 }}
            />
          </Card>
        </div>
      </Content>

      <PublicFooter />
    </Layout>
  )
}

export default TermsPage
