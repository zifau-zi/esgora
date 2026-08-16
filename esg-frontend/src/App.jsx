import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from './components/layout/PublicLayout.jsx'
import AdminLayout from './components/layout/AdminLayout.jsx'
import StudentLayout from './components/layout/StudentLayout.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import HomePage from './pages/public/HomePage.jsx'
import SchoolProfilePage from './pages/public/SchoolProfilePage.jsx'
import LoginPage from './pages/admin/LoginPage.jsx'
import DashboardPage from './pages/admin/DashboardPage.jsx'
import ESGFormPage from './pages/admin/ESGFormPage.jsx'
import ResultsPage from './pages/admin/ResultsPage.jsx'
import StudentLoginPage from './pages/student/StudentLoginPage.jsx'
import StudentDashboard from './pages/student/StudentDashboard.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/sekolah/:schoolId" element={<SchoolProfilePage />} />
      </Route>

      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/student/login" element={<StudentLoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/form-esg" element={<ESGFormPage />} />
          <Route path="/admin/hasil-analisis" element={<ResultsPage />} />
        </Route>

        <Route element={<StudentLayout />}>
          <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/form-esg" element={<ESGFormPage />} />
          <Route path="/student/hasil-analisis" element={<ResultsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
