import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { MobileMenuProvider } from './contexts/MobileMenuContext.jsx';
import { SidebarProvider } from '@/components/ui/sidebar.jsx';
import { Toaster } from '@/components/ui/sonner.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import PasswordResetPage from './pages/PasswordResetPage.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import SchedulesPage from './pages/SchedulesPage.jsx';
import EnrollmentsPage from './pages/EnrollmentsPage.jsx';
import ServiceAreasPage from './pages/ServiceAreasPage.jsx';
import PricingTablePage from './pages/PricingTablePage.jsx';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage.jsx';
import PublicTeacherProfile from './pages/PublicTeacherProfile.jsx';
import EnrollmentSuccessPage from './pages/EnrollmentSuccessPage.jsx';
import EnrollmentFailedPage from './pages/EnrollmentFailedPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import StudentManagementPage from './pages/StudentManagementPage.jsx';
import FinancialManagementPage from './pages/FinancialManagementPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

function App() {
  return (
    <AuthProvider>
      <MobileMenuProvider>
        <SidebarProvider>
          <Router>
            <ScrollToTop />
            <div className="w-full min-h-screen">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/password-reset" element={<PasswordResetPage />} />
                
                <Route path="/professor/:teacherId" element={<PublicTeacherProfile />} />
                <Route path="/enrollment-success/:enrollmentId" element={<EnrollmentSuccessPage />} />
                <Route path="/enrollment-failed" element={<EnrollmentFailedPage />} />
                
                <Route path="/dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/schedules" element={<ProtectedRoute><SchedulesPage /></ProtectedRoute>} />
                <Route path="/enrollments" element={<ProtectedRoute><EnrollmentsPage /></ProtectedRoute>} />
                <Route path="/students" element={<ProtectedRoute><StudentManagementPage /></ProtectedRoute>} />
                <Route path="/financial-management" element={<ProtectedRoute><FinancialManagementPage /></ProtectedRoute>} />
                <Route path="/financial" element={<ProtectedRoute><FinancialManagementPage /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                <Route path="/service-areas" element={<ProtectedRoute><ServiceAreasPage /></ProtectedRoute>} />
                <Route path="/pricing" element={<ProtectedRoute><PricingTablePage /></ProtectedRoute>} />
                <Route path="/terms" element={<ProtectedRoute><TermsAndConditionsPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                
                <Route path="/profile" element={<Navigate to="/settings" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </SidebarProvider>
      </MobileMenuProvider>
    </AuthProvider>
  );
}

export default App;