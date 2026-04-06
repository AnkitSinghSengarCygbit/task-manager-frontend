import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchAllUsers } from '../../store/authSlice'
import { fetchUserTasksForAdmin, type Task, type TaskStatus } from '../../store/taskSlice'
import AdminTaskDetailModal from '../../components/admin/AdminTaskDetailModal'

function getAdminStatus(status: TaskStatus): { label: string; cls: string } {
  if (status === 'assigned')  return { label: 'Pending',                cls: 'bg-yellow-100 text-yellow-700' }
  if (status === 'submitted') return { label: 'Pending for Review',     cls: 'bg-indigo-100 text-indigo-700' }
  if (status === 'revision')  return { label: 'Awaiting Resubmission',  cls: 'bg-orange-100 text-orange-700' }
  return                              { label: 'Completed',              cls: 'bg-green-100 text-green-700'   }
}

export default function AdminUserTasksPage() {
  const { userId } = useParams<{ userId: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { userList } = useAppSelector((state) => state.auth)
  const { userTasks, userTasksLoading, userTasksError } = useAppSelector((state) => state.tasks)

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const user = userList.find((u) => u._id === userId)

  useEffect(() => {
    if (userList.length === 0) dispatch(fetchAllUsers())
  }, [dispatch, userList.length])

  useEffect(() => {
    if (userId) dispatch(fetchUserTasksForAdmin(userId))
  }, [dispatch, userId])

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate('/admin/users')}
        className="no-sweep flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        User List
      </button>

      {/* User info header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-blue-600">
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{user?.name ?? 'User'}</h2>
          <p className="text-sm text-gray-500">{user?.email ?? userId}</p>
        </div>
      </div>

      {/* States */}
      {userTasksLoading && (
        <p className="text-center text-gray-400 py-12 text-sm">Loading tasks...</p>
      )}

      {userTasksError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
          {userTasksError}
        </div>
      )}

      {!userTasksLoading && !userTasksError && userTasks.length === 0 && (
        <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-white/50 shadow-xl p-10 text-center text-gray-400">
          No tasks assigned to this user yet.
        </div>
      )}

      {/* Task list */}
      {!userTasksLoading && userTasks.length > 0 && (
        <div className="space-y-3">
          {userTasks.map((task) => {
            const { label, cls } = getAdminStatus(task.status)
            return (
              <div
                key={task._id}
                onClick={() => setSelectedTask(task)}
                className="bg-white/75 backdrop-blur-sm rounded-xl shadow-md border border-white/50 p-4 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">{task.description}</p>
                    )}
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
                    {label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Task detail modal */}
      {selectedTask && (
        <AdminTaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
}
