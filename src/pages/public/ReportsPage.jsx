import React from 'react'
import { Layout } from 'antd'
import { useParams } from 'react-router-dom'
import Header from '../../components/public/Header'
import Footer from '../../components/public/Footer'
import ReportsSection from '../../components/public/ReportsSection'
import ReportDetail from '../../components/public/ReportDetail'

const { Content } = Layout

const ReportsPage = () => {
  const { id } = useParams()

  return (
    <Layout className="min-h-screen">
      <Header />
      <Content>
        {id ? <ReportDetail reportId={id} /> : <ReportsSection />}
      </Content>
      <Footer />
    </Layout>
  )
}

export default ReportsPage

