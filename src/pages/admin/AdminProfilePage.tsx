import { useState } from 'react'
import { useAppSelector } from '../../store/hooks'
import ChangePasswordModal from '../../components/ChangePasswordModal'

export default function AdminProfilePage() {
  const user = useAppSelector((state) => state.auth.user)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  return (
    <div className="max-w-lg mx-auto">
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
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Role</p>
            <p className="text-sm font-medium text-gray-800 bg-gray-50 px-4 py-2.5 rounded-lg capitalize">
              {user?.role}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">User ID</p>
            <p className="text-xs font-mono text-gray-500 bg-gray-50 px-4 py-2.5 rounded-lg break-all">
              {user?.id}
            </p>
          </div>
          <hr className="border-gray-100" />

          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full border border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            Change Password
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  )
}
