
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import HomePage from '@/pages/HomePage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import AdminDashboard from '@/pages/AdminDashboard.jsx';
import EmployeeManagement from '@/pages/EmployeeManagement.jsx';
import TimesheetManagement from '@/pages/TimesheetManagement.jsx';
import ManagerPanel from '@/pages/ManagerPanel.jsx';
import PayrollModule from '@/pages/PayrollModule.jsx';
import EmployeeClockIn from '@/pages/EmployeeClockIn.jsx';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EmployeeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timesheets"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TimesheetManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PayrollModule />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/manager-dashboard"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager-timesheets"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerPanel />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/clock-in"
            element={
              <ProtectedRoute>
                <EmployeeClockIn />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
