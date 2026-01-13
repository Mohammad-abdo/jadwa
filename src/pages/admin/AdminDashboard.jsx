import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminHome from './AdminHome'
import AdminClients from './AdminClients'
import AdminConsultants from './AdminConsultants'
import AdminSessions from './AdminSessions'
import AdminPayments from './AdminPayments'
import AdminCMS from './AdminCMS'
import AdminArticles from './AdminArticles'
import AdminServices from './AdminServices'
import AdminReports from './AdminReports'
import AdminPartners from './AdminPartners'
import AdminCategories from './AdminCategories'
import AdminSliders from './AdminSliders'
import AdminSettings from './AdminSettings'
import AdminMonitoring from './AdminMonitoring'
import AdminPermissions from './AdminPermissions'
import ClientDetailPage from './ClientDetailPage'
import ConsultantDetailPage from './ConsultantDetailPage'
import AdminArticleEditor from './AdminArticleEditor'
import AdminChat from './AdminChat'
import AdminSupportTickets from './AdminSupportTickets'
import AdminProfile from './AdminProfile'

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/profile" element={<AdminProfile />} />
        <Route path="/clients" element={<AdminClients />} />
        <Route path="/clients/:id" element={<ClientDetailPage />} />
        <Route path="/consultants" element={<AdminConsultants />} />
        <Route path="/consultants/:id" element={<ConsultantDetailPage />} />
        <Route path="/sessions" element={<AdminSessions />} />
        <Route path="/payments" element={<AdminPayments />} />
        <Route path="/cms" element={<AdminCMS />} />
        <Route path="/articles" element={<AdminArticles />} />
        <Route path="/articles/new" element={<AdminArticleEditor />} />
        <Route path="/articles/edit/:id" element={<AdminArticleEditor />} />
        <Route path="/chat" element={<AdminChat />} />
        <Route path="/chat/:sessionId" element={<AdminChat />} />
        <Route path="/services" element={<AdminServices />} />
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/partners" element={<AdminPartners />} />
        <Route path="/categories" element={<AdminCategories />} />
        <Route path="/sliders" element={<AdminSliders />} />
        <Route path="/monitoring" element={<AdminMonitoring />} />
        <Route path="/permissions" element={<AdminPermissions />} />
        <Route path="/support" element={<AdminSupportTickets />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  )
}

export default AdminDashboard

