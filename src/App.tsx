import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from './store/hooks'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboardLayout from './layouts/AdminDashboardLayout'
import AdminProfilePage from './pages/admin/AdminProfilePage'
import AdminUserListPage from './pages/admin/AdminUserListPage'
import AdminAssignTaskPage from './pages/admin/AdminAssignTaskPage'
import AdminReviewPage from './pages/admin/AdminReviewPage'
import AdminUserTasksPage from './pages/admin/AdminUserTasksPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminPrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminPrivateRoute>
            <AdminDashboardLayout />
          </AdminPrivateRoute>
        }
      >
        <Route index element={<Navigate to="/admin/profile" replace />} />
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="users" element={<AdminUserListPage />} />
        <Route path="assign" element={<AdminAssignTaskPage />} />
        <Route path="reviews" element={<AdminReviewPage />} />
        <Route path="users/:userId" element={<AdminUserTasksPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
