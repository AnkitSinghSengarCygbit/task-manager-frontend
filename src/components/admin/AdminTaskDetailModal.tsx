import { useNavigate } from 'react-router-dom'
import type { Task } from '../../store/taskSlice'
import ModalPortal from '../ModalPortal'

interface Props {
  task: Task
  onClose: () => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function AdminTaskDetailModal({ task, onClose }: Props) {
  const navigate = useNavigate()

  const statusMeta = (() => {
    if (task.status === 'assigned')  return { label: 'Pending',               cls: 'bg-yellow-100 text-yellow-700' }
    if (task.status === 'submitted') return { label: 'Pending for Review',    cls: 'bg-indigo-100 text-indigo-700' }
    if (task.status === 'revision')  return { label: 'Awaiting Resubmission', cls: 'bg-orange-100 text-orange-700' }
    return                                  { label: 'Completed',             cls: 'bg-green-100 text-green-700'   }
  })()

  return (
    <ModalPortal>
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 w-full max-w-lg p-6 space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-lg leading-snug">{task.title}</p>
            {task.description && (
              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="no-sweep shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Status badge */}
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusMeta.cls}`}>
          {statusMeta.label}
        </span>

        {/* ── PENDING (assigned) ─────────────────────────────────── */}
        {task.status === 'assigned' && (
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Assigned on</span>
                <span className="font-medium text-gray-700">{formatDate(task.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Screenshot required</span>
                <span className={`font-semibold ${task.screenshotRequired ? 'text-blue-600' : 'text-gray-400'}`}>
                  {task.screenshotRequired ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 italic">Waiting for user to submit proof.</p>
          </div>
        )}

        {/* ── PENDING FOR REVIEW (submitted) ─────────────────────── */}
        {task.status === 'submitted' && (
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Submitted Proof</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.proof || '—'}</p>
              </div>
              {task.screenshot && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Screenshot</p>
                  <img
                    src={task.screenshot}
                    alt="Submitted screenshot"
                    className="rounded-lg max-h-52 w-full object-contain border border-gray-200 bg-white"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Submitted on</span>
              <span className="font-medium text-gray-700">{formatDate(task.updatedAt)}</span>
            </div>
            <button
              onClick={() => { onClose(); navigate('/admin/reviews') }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              Go to Reviews →
            </button>
          </div>
        )}

        {/* ── AWAITING RESUBMISSION (revision) ───────────────────── */}
        {task.status === 'revision' && (
          <div className="space-y-3">
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Feedback Sent</p>
              <p className="text-sm text-orange-700">{task.adminFeedback || '—'}</p>
            </div>
            {task.proof && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Previous Proof</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.proof}</p>
              </div>
            )}
            <p className="text-xs text-gray-400 italic">Waiting for the user to resubmit.</p>
          </div>
        )}

        {/* ── COMPLETED ──────────────────────────────────────────── */}
        {task.status === 'completed' && (
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-3">
              {task.proof && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Final Proof</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.proof}</p>
                </div>
              )}
              {task.screenshot && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Screenshot</p>
                  <img
                    src={task.screenshot}
                    alt="Completion screenshot"
                    className="rounded-lg max-h-52 w-full object-contain border border-gray-200 bg-white"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Completed on</span>
              <span className="font-medium text-green-600">{formatDate(task.updatedAt)}</span>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Close
        </button>
      </div>
    </div>
    </ModalPortal>
  )
}
