import React from 'react'
import { Layout } from 'antd'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import ConsultantsSection from '../../components/public/ConsultantsSection'

const { Content } = Layout

const ConsultantsPage = () => {
  return (
    <Layout className="min-h-screen">
      <Header />
      <Content>
        <ConsultantsSection showViewAll={false} />
      </Content>
      <Footer />
    </Layout>
  )
}

export default ConsultantsPage

