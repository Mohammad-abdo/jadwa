import React from 'react'
import { Layout } from 'antd'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import ConsultantsSection from '../../components/public/ConsultantsSection'
import { useLanguage } from '../../contexts/LanguageContext'

const { Content } = Layout

const ConsultantsPage = () => {
  return (
    <Layout className="min-h-screen">
      <Header />
      <Content>
        <ConsultantsSection />
      </Content>
      <Footer />
    </Layout>
  )
}

export default ConsultantsPage

