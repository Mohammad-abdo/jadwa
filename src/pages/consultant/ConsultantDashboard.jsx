import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ConsultantLayout from '../../components/consultant/ConsultantLayout'
import ConsultantHome from './ConsultantHome'
import ConsultantSessions from './ConsultantSessions'
import ConsultantProfile from './ConsultantProfile'
import ConsultantEarnings from './ConsultantEarnings'
import ConsultantSupportTickets from './ConsultantSupportTickets'
import ConsultantChat from './ConsultantChat'
import ConsultantBookings from './ConsultantBookings'
import ConsultantReports from './ConsultantReports'

const ConsultantDashboard = () => {
  return (
    <ConsultantLayout>
      <Routes>
        <Route path="/" element={<ConsultantHome />} />
        <Route path="/sessions" element={<ConsultantSessions />} />
        <Route path="/bookings" element={<ConsultantBookings />} />
        <Route path="/chat/:bookingId?" element={<ConsultantChat />} />
        <Route path="/chat/session/:sessionId" element={<ConsultantChat />} />
        <Route path="/sessions/:sessionId" element={<ConsultantChat />} />
        <Route path="/reports" element={<ConsultantReports />} />
        <Route path="/profile" element={<ConsultantProfile />} />
        <Route path="/earnings" element={<ConsultantEarnings />} />
        <Route path="/support" element={<ConsultantSupportTickets />} />
        <Route path="*" element={<Navigate to="/consultant" replace />} />
      </Routes>
    </ConsultantLayout>
  )
}

export default ConsultantDashboard

