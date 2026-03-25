import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/authSlice'
import { fetchMyTasks, createTask, updateTask, deleteTask, clearDraftNote, type Task, type TaskStatus } from '../store/taskSlice'
import TaskDetailModal from '../components/TaskDetailModal'

const STATUS_TABS: { label: string; value: TaskStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'progress' },
  { label: 'Completed', value: 'completed' },
]

const STATUS_BADGE: Record<TaskStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: 'Pending',
  progress: 'In Progress',
  completed: 'Completed',
}

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const { tasks, loading, draftNotes } = useAppSelector((state) => state.tasks)

  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    if (user) {
      const status = activeTab === 'all' ? undefined : activeTab
      dispatch(fetchMyTasks(user.id, status))
    }
  }, [dispatch, user, activeTab])

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    try {
      await dispatch(createTask({ title: form.title.trim(), description: form.description.trim() }))
      setForm({ title: '', description: '' })
      setShowForm(false)
    } catch {
      // error shown via Redux state
    }
    setSubmitting(false)
  }

  function handleDelete(id: string) {
    dispatch(deleteTask(id))
  }

  function handleModalSave() {
    if (!selectedTask) return
    const notes = draftNotes[selectedTask._id] ?? selectedTask.notes ?? ''
    dispatch(updateTask({ id: selectedTask._id, status: 'completed', notes }))
    dispatch(clearDraftNote(selectedTask._id))
    setSelectedTask(null)
  }

  function handleModalCancel() {
    if (!selectedTask) return
    const hasNotes = (draftNotes[selectedTask._id] ?? '').trim().length > 0
    if (hasNotes && selectedTask.status !== 'completed') {
      dispatch(updateTask({ id: selectedTask._id, status: 'progress' }))
    }
    setSelectedTask(null)
  }

  function handleModalClose() {
    setSelectedTask(null)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">Task Manager</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-700 font-medium">{user?.name}</span>
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">My Tasks</h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add Task'}
          </button>
        </div>

        {/* Add Task Form */}
        {showForm && (
          <form
            onSubmit={handleCreateTask}
            className="bg-white rounded-xl shadow-sm p-5 mb-6 space-y-3"
          >
            <input
              type="text"
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </form>
        )}

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
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm">No tasks found.</div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                onClick={() => task.status !== 'completed' && setSelectedTask(task)}
                className={`bg-white rounded-xl shadow-sm p-4 flex items-start justify-between gap-4 transition-shadow ${
                  task.status !== 'completed' ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{task.title}</p>
                  {task.status === 'completed' && task.notes ? (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{task.notes}</p>
                  ) : task.description ? (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{task.description}</p>
                  ) : null}
                  <span
                    className={`mt-2 inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[task.status]}`}
                  >
                    {STATUS_LABEL[task.status]}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(task._id) }}
                  className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none mt-0.5 shrink-0"
                  title="Delete task"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onSave={handleModalSave}
          onCancel={handleModalCancel}
          onClose={handleModalClose}
        />
      )}

    </div>
  )
}
