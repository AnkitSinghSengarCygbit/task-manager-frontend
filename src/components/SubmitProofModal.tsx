import { useRef, useState } from 'react'
import { useAppDispatch } from '../store/hooks'
import { submitProof, type Task } from '../store/taskSlice'
import ModalPortal from './ModalPortal'

const MAX_WORDS = 200
const MAX_FILE_BYTES = 2 * 1024 * 1024 // 2 MB

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

interface Props {
  task: Task
  onClose: () => void
}

export default function SubmitProofModal({ task, onClose }: Props) {
  const dispatch = useAppDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [proof, setProof] = useState(task.proof ?? '')
  const [screenshot, setScreenshot] = useState<string | null>(task.screenshot ?? null)
  const [screenshotName, setScreenshotName] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wordCount = countWords(proof)
  const isOverLimit = wordCount > MAX_WORDS

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFileError('Only image files are allowed.')
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError('Image must be under 2 MB.')
      return
    }

    setFileError(null)
    const reader = new FileReader()
    reader.onload = () => {
      setScreenshot(reader.result as string)
      setScreenshotName(file.name)
    }
    reader.readAsDataURL(file)
  }

  function removeScreenshot() {
    setScreenshot(null)
    setScreenshotName(null)
    setFileError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const screenshotMissing = !!task.screenshotRequired && !screenshot

  async function handleSubmit() {
    if (!proof.trim() || isOverLimit || screenshotMissing) return
    setSubmitting(true)
    setError(null)
    try {
      await dispatch(submitProof(task._id, proof.trim(), screenshot ?? undefined))
      onClose()
    } catch {
      setError('Failed to submit proof. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalPortal>
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 w-full max-w-lg p-6 space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Submit Proof</h2>
          <button
            onClick={onClose}
            className="no-sweep text-gray-400 hover:text-gray-600 text-xl leading-none"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Task info */}
        <div>
          <p className="font-semibold text-gray-800">{task.title}</p>
          {task.description && (
            <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>
          )}
        </div>

        {/* Admin feedback callout (shown on revision) */}
        {task.status === 'revision' && task.adminFeedback && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Admin Feedback</p>
            <p className="text-sm text-orange-700">{task.adminFeedback}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Proof textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {task.status === 'revision' ? 'Updated proof of completion' : 'Proof of completion'}
          </label>
          <textarea
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            placeholder="Describe what you did to complete this task..."
            rows={5}
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 resize-none ${
              isOverLimit
                ? 'border-red-400 focus:ring-red-400'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-gray-400">Describe your work clearly so the admin can review it.</p>
            <span className={`text-xs font-medium shrink-0 ml-2 ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
              {wordCount} / {MAX_WORDS}
            </span>
          </div>
          {isOverLimit && (
            <p className="text-xs text-red-500 mt-1">Please keep your answer under {MAX_WORDS} words.</p>
          )}
        </div>

        {/* Screenshot upload — only shown when admin requires it */}
        {task.screenshotRequired && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Screenshot
          </label>

          {screenshot ? (
            <div className="space-y-2">
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={screenshot}
                  alt="Proof screenshot"
                  className="w-full max-h-48 object-contain"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 truncate mr-2">{screenshotName}</p>
                <button
                  type="button"
                  onClick={removeScreenshot}
                  className="no-sweep shrink-0 text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="no-sweep w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl py-6 flex flex-col items-center gap-1.5 transition-colors text-gray-400 hover:text-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-sm font-medium">Click to upload screenshot</span>
              <span className="text-xs">PNG, JPG, GIF up to 2 MB</span>
            </button>
          )}

          {fileError && (
            <p className="text-xs text-red-500 mt-1">{fileError}</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!proof.trim() || isOverLimit || screenshotMissing || submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  )
}
