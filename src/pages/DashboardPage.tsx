import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/authSlice'
import { fetchMyTasks, type Task, type TaskStatus } from '../store/taskSlice'
import SubmitProofModal from '../components/SubmitProofModal'

// ─── Display status grouping ───────────────────────────────────────────────────
//   assigned            → "Pending"
//   submitted | revision → "In Progress"
//   completed           → "Completed"

type DisplayTab = 'all' | 'pending' | 'progress' | 'completed'

function getDisplayGroup(status: TaskStatus): 'pending' | 'progress' | 'completed' {
  if (status === 'assigned') return 'pending'
  if (status === 'submitted' || status === 'revision') return 'progress'
  return 'completed'
}

const STATUS_TABS: { label: string; value: DisplayTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'progress' },
  { label: 'Completed', value: 'completed' },
]

const DISPLAY_BADGE: Record<'pending' | 'progress' | 'completed', string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

const DISPLAY_LABEL: Record<'pending' | 'progress' | 'completed', string> = {
  pending: 'Pending',
  progress: 'In Progress',
  completed: 'Completed',
}

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const { tasks, loading } = useAppSelector((state) => state.tasks)
  const location = useLocation()

  const [activeTab, setActiveTab] = useState<DisplayTab>('all')
  const [selectedProofTask, setSelectedProofTask] = useState<Task | null>(null)

  useEffect(() => {
    if (user) dispatch(fetchMyTasks(user.id))
  }, [dispatch, user])

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  function isClickable(task: Task): boolean {
    return task.status === 'assigned' || task.status === 'revision'
  }

  // Only show admin-assigned tasks; filter by display group
  const assignedTasks = tasks.filter((t) => !!t.assignedTo)
  const filteredTasks =
    activeTab === 'all' ? assignedTasks : assignedTasks.filter((t) => getDisplayGroup(t.status) === activeTab)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-indigo-100 to-purple-200">
      {/* Top Bar */}
      <div className="bg-indigo-950/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">
          <span key={location.key} className="title-shimmer">Task Manager</span>
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="no-sweep flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-indigo-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-indigo-100">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-indigo-100 font-medium">{user?.name}</span>
          </button>
          <button
            onClick={handleLogout}
            className="ml-2 text-sm border border-red-400/50 text-red-300 hover:bg-red-500/20 font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <h2 className="text-xl font-bold text-gray-800 mb-6">My Tasks</h2>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Task List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12 text-sm">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm">No tasks found.</div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const displayGroup = getDisplayGroup(task.status)
              return (
                <div
                  key={task._id}
                  onClick={() => isClickable(task) && setSelectedProofTask(task)}
                  className={`bg-white/75 backdrop-blur-sm rounded-xl shadow-md border border-white/50 p-4 transition-shadow ${
                    isClickable(task) ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'
                  }`}
                >
                  <p className="font-medium text-gray-800">{task.title}</p>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>
                  )}

                  {/* Assigned-by info */}
                  {task.status === 'assigned' && task.assignedBy && (
                    <p className="text-xs text-purple-600 mt-1">
                      Assigned by <span className="font-semibold">{task.assignedBy.name}</span>
                    </p>
                  )}

                  {/* Awaiting review note */}
                  {task.status === 'submitted' && (
                    <p className="text-xs text-indigo-500 mt-1 font-medium">Awaiting admin review…</p>
                  )}

                  {/* Admin rejection feedback */}
                  {task.status === 'revision' && task.adminFeedback && (
                    <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-700">
                      <span className="font-semibold">Admin feedback: </span>{task.adminFeedback}
                    </div>
                  )}

                  {/* Admin approval suggestion */}
                  {task.status === 'completed' && task.approvalNote && (
                    <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
                      <span className="font-semibold">Admin suggestion: </span>{task.approvalNote}
                    </div>
                  )}

                  <span className={`mt-2 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${DISPLAY_BADGE[displayGroup]}`}>
                    {DISPLAY_LABEL[displayGroup]}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedProofTask && (
        <SubmitProofModal
          task={selectedProofTask}
          onClose={() => setSelectedProofTask(null)}
        />
      )}
    </div>
  )
}
