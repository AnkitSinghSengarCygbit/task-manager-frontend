import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchPendingReviews, reviewTask, type Task } from '../../store/taskSlice'

export default function AdminReviewPage() {
  const dispatch = useAppDispatch()
  const { pendingReviews, pendingReviewsLoading, pendingReviewsError } = useAppSelector((state) => state.tasks)

  // Per-card state: { [taskId]: { expanded: boolean, feedback: string, approvalNote: string, submitting: boolean, error: string | null } }
  const [cardState, setCardState] = useState<
    Record<string, { expanded: boolean; feedback: string; approvalNote: string; submitting: boolean; error: string | null }>
  >({})

  useEffect(() => {
    dispatch(fetchPendingReviews())
  }, [dispatch])

  function getCard(id: string) {
    return cardState[id] ?? { expanded: false, feedback: '', approvalNote: '', submitting: false, error: null }
  }

  function setCard(id: string, patch: Partial<typeof cardState[string]>) {
    setCardState((prev) => ({ ...prev, [id]: { ...getCard(id), ...patch } }))
  }

  function countWords(text: string): number {
    return text.trim() ? text.trim().split(/\s+/).length : 0
  }

  async function handleApprove(task: Task) {
    const card = getCard(task._id)
    setCard(task._id, { submitting: true, error: null })
    try {
      await dispatch(reviewTask(task._id, { approved: true, approvalNote: card.approvalNote.trim() }))
    } catch {
      setCard(task._id, { submitting: false, error: 'Failed to approve. Please try again.' })
    }
  }

  async function handleRevision(task: Task) {
    const card = getCard(task._id)
    if (!card.feedback.trim()) {
      setCard(task._id, { error: 'Please enter feedback before sending revision.' })
      return
    }
    setCard(task._id, { submitting: true, error: null })
    try {
      await dispatch(reviewTask(task._id, { approved: false, feedback: card.feedback.trim() }))
    } catch {
      setCard(task._id, { submitting: false, error: 'Failed to send revision. Please try again.' })
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Pending Reviews</h2>

      {pendingReviewsLoading && (
        <p className="text-center text-gray-500 py-10">Loading submitted tasks...</p>
      )}

      {pendingReviewsError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
          {pendingReviewsError}
        </div>
      )}

      {!pendingReviewsLoading && !pendingReviewsError && pendingReviews.length === 0 && (
        <div className="bg-white/75 backdrop-blur-md rounded-2xl border border-white/50 shadow-xl p-10 text-center text-gray-400 animate-fade-in">
          No submissions awaiting review.
        </div>
      )}

      <div className="space-y-4">
        {pendingReviews.map((task) => {
          const card = getCard(task._id)
          return (
            <div
              key={task._id}
              className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-5 space-y-4 animate-fade-in"
            >
              {/* Task info row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{task.title}</p>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{task.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Assigned to:{' '}
                    <span className="font-medium text-gray-600">
                      {task.assignedTo?.name ?? '—'} ({task.assignedTo?.email ?? '—'})
                    </span>
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
                  Awaiting Review
                </span>
              </div>

              {/* Submitted proof */}
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
                      className="rounded-lg max-h-60 w-full object-contain border border-gray-200 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Optional approval note */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Suggestion for user <span className="normal-case font-normal">(optional · max 200 words)</span>
                </label>
                <textarea
                  value={card.approvalNote}
                  onChange={(e) => setCard(task._id, { approvalNote: e.target.value })}
                  placeholder="Share what the user did well or could improve next time..."
                  rows={2}
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none ${
                    countWords(card.approvalNote) > 200
                      ? 'border-red-300 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-green-400'
                  }`}
                />
                {countWords(card.approvalNote) > 0 && (
                  <p className={`text-xs text-right ${countWords(card.approvalNote) > 200 ? 'text-red-500' : 'text-gray-400'}`}>
                    {countWords(card.approvalNote)} / 200 words
                  </p>
                )}
              </div>

              {/* Per-card error */}
              {card.error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                  {card.error}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(task)}
                  disabled={card.submitting || countWords(card.approvalNote) > 200}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                  {card.submitting && !card.expanded ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => setCard(task._id, { expanded: !card.expanded, error: null })}
                  disabled={card.submitting}
                  className="flex-1 border border-orange-300 text-orange-600 hover:bg-orange-50 disabled:opacity-50 font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                  Request Revision
                </button>
              </div>

              {/* Feedback textarea — expands when "Request Revision" is clicked */}
              {card.expanded && (
                <div className="space-y-3 animate-fade-in">
                  <textarea
                    value={card.feedback}
                    onChange={(e) => setCard(task._id, { feedback: e.target.value })}
                    placeholder="Explain what needs to be fixed or what is still missing..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCard(task._id, { expanded: false, feedback: '', error: null })}
                      className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold py-2 rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRevision(task)}
                      disabled={card.submitting}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                    >
                      {card.submitting ? 'Sending...' : 'Send Revision'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
