import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/authSlice'
import ChangePasswordModal from '../components/ChangePasswordModal'

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const location = useLocation()

  const [showPasswordModal, setShowPasswordModal] = useState(false)

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-indigo-100 to-purple-200">
      {/* Top Bar */}
      <div className="bg-indigo-950/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">
          <span key={location.key} className="title-shimmer">Task Manager</span>
        </h1>
        <button
          onClick={() => navigate('/')}
          className="no-sweep text-sm text-indigo-200 hover:text-white font-medium"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 space-y-6 animate-fade-in">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-blue-600">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Details */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Full Name</p>
              <p className="text-sm font-medium text-gray-800 bg-gray-50 px-4 py-2.5 rounded-lg">
                {user?.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Email Address</p>
              <p className="text-sm font-medium text-gray-800 bg-gray-50 px-4 py-2.5 rounded-lg">
                {user?.email}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">User ID</p>
              <p className="text-xs font-mono text-gray-500 bg-gray-50 px-4 py-2.5 rounded-lg break-all">
                {user?.id}
              </p>
            </div>
          </div>

          <hr className="border-gray-100" />

          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full border border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            Change Password
          </button>

          <button
            onClick={handleLogout}
            className="w-full border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-2.5 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>

    {showPasswordModal && (
      <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
    )}
    </>
  )
}
