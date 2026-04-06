import { useEffect } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { changePassword, clearError } from '../store/authSlice'
import ModalPortal from './ModalPortal'

const Schema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your new password'),
})

const fieldClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const errorClass = 'text-xs text-red-500 mt-1'

interface Props {
  onClose: () => void
}

export default function ChangePasswordModal({ onClose }: Props) {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  return (
    <ModalPortal>
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 w-full max-w-md p-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Change Password</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            title="Close"
          >
            ✕
          </button>
        </div>

        <Formik
          initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
          validationSchema={Schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await dispatch(changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }))
              onClose()
            } catch {
              // error shown via Redux state
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <Field type="password" name="currentPassword" placeholder="Enter current password" className={fieldClass} />
                <ErrorMessage name="currentPassword" component="p" className={errorClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <Field type="password" name="newPassword" placeholder="At least 8 characters" className={fieldClass} />
                <ErrorMessage name="newPassword" component="p" className={errorClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <Field type="password" name="confirmPassword" placeholder="Repeat new password" className={fieldClass} />
                <ErrorMessage name="confirmPassword" component="p" className={errorClass} />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {isSubmitting || loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
    </ModalPortal>
  )
}
