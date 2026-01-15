import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ClientLayout from '../../components/client/ClientLayout'
import ClientHome from './ClientHome'
import ClientBookings from './ClientBookings'
import ClientConsultations from './ClientConsultations'
import ClientChat from './ClientChat'
import ClientProfile from './ClientProfile'
import ClientSupportTickets from './ClientSupportTickets'
import ClientReports from './ClientReports'
import PaymentResult from './PaymentResult'

const ClientDashboard = () => {
  return (
    <ClientLayout>
      <Routes>
        <Route path="/" element={<ClientHome />} />
        <Route path="/bookings" element={<ClientBookings />} />
        <Route path="/payment-result" element={<PaymentResult />} />
        <Route path="/consultations" element={<ClientConsultations />} />
        <Route path="/chat" element={<ClientChat />} />
        <Route path="/chat/session/:sessionId" element={<ClientChat />} />
        <Route path="/sessions/:sessionId" element={<ClientChat />} />
        <Route path="/chat/:id" element={<ClientChat />} />
        <Route path="/reports" element={<ClientReports />} />
        <Route path="/support" element={<ClientSupportTickets />} />
        <Route path="/profile" element={<ClientProfile />} />
        <Route path="*" element={<Navigate to="/client" replace />} />
      </Routes>
    </ClientLayout>
  )
}

export default ClientDashboard

