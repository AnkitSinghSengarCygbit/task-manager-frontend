import { useEffect, useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchAllUsers } from '../../store/authSlice'
import { assignTask } from '../../store/taskSlice'

const Schema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  assignedTo: Yup.string().required('Please select a user to assign this task to'),
  screenshotRequired: Yup.boolean(),
})

const fieldClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
const errorClass = 'text-xs text-red-500 mt-1'

export default function AdminAssignTaskPage() {
  const dispatch = useAppDispatch()
  const { userList, userListLoading } = useAppSelector((state) => state.auth)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const regularUsers = userList.filter((u) => u.role !== 'admin')

  useEffect(() => {
    dispatch(fetchAllUsers())
  }, [dispatch])

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Assign Task</h2>

      <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 animate-fade-in">
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-5">
            {successMsg}
          </div>
        )}

        <Formik
          initialValues={{ title: '', description: '', assignedTo: '', screenshotRequired: false }}
          validationSchema={Schema}
          onSubmit={async (values, { resetForm, setFieldError }) => {
            try {
              await dispatch(assignTask({
                title: values.title,
                description: values.description,
                assignedTo: values.assignedTo,
                screenshotRequired: values.screenshotRequired,
              }))
              setSuccessMsg(`Task "${values.title}" assigned successfully.`)
              resetForm()
              setTimeout(() => setSuccessMsg(null), 4000)
            } catch {
              setFieldError('title', 'Failed to assign task. Please try again.')
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <Field type="text" name="title" placeholder="What needs to be done?" className={fieldClass} />
                <ErrorMessage name="title" component="p" className={errorClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <Field
                  as="textarea"
                  name="description"
                  placeholder="Provide additional details or context..."
                  rows={3}
                  className={`${fieldClass} resize-none`}
                />
                <ErrorMessage name="description" component="p" className={errorClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                {userListLoading ? (
                  <p className="text-sm text-gray-400">Loading users...</p>
                ) : (
                  <Field as="select" name="assignedTo" className={fieldClass}>
                    <option value="">— Select a user —</option>
                    {regularUsers.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </Field>
                )}
                <ErrorMessage name="assignedTo" component="p" className={errorClass} />
              </div>

              {/* Screenshot required toggle */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-gray-700">Require screenshot proof</p>
                  <p className="text-xs text-gray-400 mt-0.5">User must upload a screenshot when submitting</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFieldValue('screenshotRequired', !values.screenshotRequired)}
                  className={`no-sweep relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    values.screenshotRequired ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      values.screenshotRequired ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Assigning...' : 'Assign Task'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
