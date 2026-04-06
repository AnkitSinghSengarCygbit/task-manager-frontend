import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/authSlice'

export default function AdminHeader() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const location = useLocation()

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <header className="bg-indigo-950/80 backdrop-blur-md border-b border-white/10 h-16 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-bold text-white">
        <span key={location.key} className="title-shimmer">Task Manager Admin</span>
      </h1>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-700 rounded-full flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-indigo-100">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm font-medium text-indigo-100">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="ml-2 text-sm border border-red-400/50 text-red-300 hover:bg-red-500/20 font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
