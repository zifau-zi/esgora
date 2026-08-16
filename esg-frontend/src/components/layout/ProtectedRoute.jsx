import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { LoadingScreen } from '../ui/Feedback.jsx'

export default function ProtectedRoute() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  const isStudentArea = location.pathname.startsWith('/student')

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingScreen label="Memeriksa sesi Anda..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={isStudentArea ? '/student/login' : '/admin/login'} replace />
  }

  const isStudent = user?.role === 'Siswa'
  if (isStudentArea && !isStudent) {
    return <Navigate to="/student/login" replace />
  }
  if (!isStudentArea && isStudent) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
