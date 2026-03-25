import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setDraftNote } from '../store/taskSlice'
import type { Task } from '../store/taskSlice'

const MAX_WORDS = 200

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

interface Props {
  task: Task
  onSave: () => void
  onCancel: () => void
  onClose: () => void
}

export default function TaskDetailModal({ task, onSave, onCancel, onClose }: Props) {
  const dispatch = useAppDispatch()
  const draftNotes = useAppSelector((state) => state.tasks.draftNotes)

  const notes = draftNotes[task._id] ?? task.notes ?? ''
  const wordCount = countWords(notes)
  const isOverLimit = wordCount > MAX_WORDS

  function handleChange(value: string) {
    dispatch(setDraftNote({ id: task._id, notes: value }))
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
          title="Close"
        >
          ✕
        </button>

        {/* Task Info */}
        <div className="pr-6">
          <h2 className="text-lg font-bold text-gray-800">{task.title}</h2>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>
          )}
        </div>

        {/* Notes Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            What did you do for this task?
          </label>
          <textarea
            value={notes}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Describe what you worked on..."
            rows={5}
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none ${
              isOverLimit
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="text-green-600 font-medium">Save</span> to mark as Completed.{' '}
              <span className="text-blue-600 font-medium">Cancel</span> after writing to mark as In Progress.
            </p>
            <span className={`text-xs font-medium shrink-0 ml-2 ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
              {wordCount} / {MAX_WORDS}
            </span>
          </div>
          {isOverLimit && (
            <p className="text-xs text-red-500 mt-1">
              Please keep your answer under {MAX_WORDS} words.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!notes.trim() || isOverLimit}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Save as Completed
          </button>
        </div>
      </div>
    </div>
  )
}
