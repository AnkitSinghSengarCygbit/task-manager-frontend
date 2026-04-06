import { NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { logout } from '../../store/authSlice'

const navLinks = [
  { to: '/admin/profile', label: 'Profile' },
  { to: '/admin/users', label: 'User List' },
  { to: '/admin/assign', label: 'Assign Task' },
  { to: '/admin/reviews', label: 'Reviews' },
]

export default function AdminSidebar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-full bg-indigo-950/80 backdrop-blur-md border-r border-white/10 flex flex-col shrink-0">
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-6 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full border border-red-400/50 text-red-300 hover:bg-red-500/20 font-semibold py-2.5 rounded-lg transition-colors text-sm"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
