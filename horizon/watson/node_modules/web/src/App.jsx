
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { ThemeProvider } from '@/contexts/ThemeContext.jsx';
import { LanguageProvider } from '@/contexts/LanguageContext.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';

import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import DashboardPage from '@/pages/DashboardPage.jsx';
import RotinaPage from '@/pages/RotinaPage.jsx';
import CiclosPage from '@/pages/CiclosPage.jsx';
import EstudarPage from '@/pages/EstudarPage.jsx';
import AgentePage from '@/pages/AgentePage.jsx';
import CadernoPage from '@/pages/CadernoPage.jsx';
import TutoriaisPage from '@/pages/TutoriaisPage.jsx';
import AccountSettingsPage from '@/pages/AccountSettingsPage.jsx';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <AuthProvider>
            <ScrollToTop />
            <Toaster />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rotina"
                element={
                  <ProtectedRoute>
                    <RotinaPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ciclos"
                element={
                  <ProtectedRoute>
                    <CiclosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/estudar"
                element={
                  <ProtectedRoute>
                    <EstudarPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agente"
                element={
                  <ProtectedRoute>
                    <AgentePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/caderno"
                element={
                  <ProtectedRoute>
                    <CadernoPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tutoriais"
                element={
                  <ProtectedRoute>
                    <TutoriaisPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AccountSettingsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
