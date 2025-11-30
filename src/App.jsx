import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import PublicHomePage from "./pages/public/PublicHomePage";
import AboutPage from "./pages/public/AboutPage";
import ServicesPage from "./pages/public/ServicesPage";
import ConsultantsPage from "./pages/public/ConsultantsPage";
import ConsultantDetailPage from "./pages/public/ConsultantDetailPage";
import ReportsPage from "./pages/public/ReportsPage";
import BlogPage from "./pages/public/BlogPage";
import ArticleDetailPage from "./pages/public/ArticleDetailPage";
import ContactPage from "./pages/public/ContactPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";

// Client Dashboard
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientBookings from "./pages/client/ClientBookings";
import ClientConsultations from "./pages/client/ClientConsultations";
import ClientChat from "./pages/client/ClientChat";
import ClientProfile from "./pages/client/ClientProfile";

// Consultant Dashboard
import ConsultantDashboard from "./pages/consultant/ConsultantDashboard";
import ConsultantSessions from "./pages/consultant/ConsultantSessions";
import ConsultantProfile from "./pages/consultant/ConsultantProfile";
import ConsultantEarnings from "./pages/consultant/ConsultantEarnings";

// Admin Dashboard
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClients from "./pages/admin/AdminClients";
import AdminConsultants from "./pages/admin/AdminConsultants";
import AdminSessions from "./pages/admin/AdminSessions";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminCMS from "./pages/admin/AdminCMS";
import AdminSettings from "./pages/admin/AdminSettings";
import ChatRedirect from "./components/ChatRedirect";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicHomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/consultants" element={<ConsultantsPage />} />
            <Route path="/consultants/:id" element={<ConsultantDetailPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:id" element={<ReportsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<ArticleDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Chat redirect route - redirects to role-based chat route */}
            <Route path="/chat/:id" element={<ChatRedirect />} />

            {/* Protected Client Routes */}
            <Route
              path="/client/*"
              element={
                <ProtectedRoute requiredRole="CLIENT">
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Consultant Routes */}
            <Route
              path="/consultant/*"
              element={
                <ProtectedRoute requiredRole="CONSULTANT">
                  <ConsultantDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes - Only Admin Roles */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
