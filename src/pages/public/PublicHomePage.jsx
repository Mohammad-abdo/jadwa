import React from 'react'
import { Layout } from 'antd'
import Header from '../../components/public/Header'
import HeroSection from '../../components/public/HeroSection'
import AboutUsSection from '../../components/public/AboutUsSection'
import ServicesSection from '../../components/public/ServicesSection'
import ConsultantsSection from '../../components/public/ConsultantsSection'
import HowItWorksSection from '../../components/public/HowItWorksSection'
import SmartPlatformSection from '../../components/public/SmartPlatformSection'
import ReportsSection from '../../components/public/ReportsSection'
import TestimonialsSection from '../../components/public/TestimonialsSection'
import PartnersSection from '../../components/public/PartnersSection'
import BlogSection from '../../components/public/BlogSection'
import Footer from '../../components/public/Footer'
import ScrollToTop from '../../components/public/ScrollToTop'

const { Content } = Layout

const PublicHomePage = () => {
  return (
    <Layout className="min-h-screen">
      <Header />
      <Content>
        <HeroSection />
        <AboutUsSection />
        <ServicesSection />
        <ConsultantsSection />
        <HowItWorksSection />
        <SmartPlatformSection />
        <ReportsSection />
        <BlogSection />
        <TestimonialsSection />
        <PartnersSection />
      </Content>
      <Footer />
      <ScrollToTop />
    </Layout>
  )
}

export default PublicHomePage

