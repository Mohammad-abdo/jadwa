import React from 'react'
import { Layout } from 'antd'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import ServicesSection from '../../components/public/ServicesSection'
import { useLanguage } from '../../contexts/LanguageContext'

const { Content } = Layout

const ServicesPage = () => {
  const { t } = useLanguage()

  return (
    <Layout className="min-h-screen">
      <Header />
      <Content>
        <ServicesSection />
      </Content>
      <Footer />
    </Layout>
  )
}

export default ServicesPage

