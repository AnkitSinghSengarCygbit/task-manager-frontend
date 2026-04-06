import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchAllUsers } from '../../store/authSlice'
import { fetchUserTaskCounts } from '../../store/taskSlice'

export default function AdminUserListPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { userList, userListLoading, userListError } = useAppSelector((state) => state.auth)
  const { userTaskCounts } = useAppSelector((state) => state.tasks)
  const regularUsers = userList.filter((u) => u.role !== 'admin')

  useEffect(() => {
    dispatch(fetchAllUsers())
    dispatch(fetchUserTaskCounts())
  }, [dispatch])

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">User List</h2>

      {userListLoading && (
        <p className="text-center text-gray-500 py-10">Loading users...</p>
      )}

      {userListError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
          {userListError}
        </div>
      )}

      {!userListLoading && !userListError && regularUsers.length === 0 && (
        <p className="text-center text-gray-500 py-10">No users found.</p>
      )}

      {!userListLoading && regularUsers.length > 0 && (
        <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden animate-fade-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-10">#</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Name</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tasks</th>
              </tr>
            </thead>
            <tbody>
              {regularUsers.map((u, idx) => (
                <tr
                  key={u._id}
                  onClick={() => navigate(`/admin/users/${u._id}`)}
                  className="border-b border-gray-50 last:border-0 hover:bg-blue-50/60 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-gray-400 font-medium">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-600">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800 hover:text-blue-600 transition-colors">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                      {userTaskCounts[u._id] ?? 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
