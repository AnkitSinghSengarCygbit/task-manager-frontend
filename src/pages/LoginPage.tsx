import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginUser, clearError, logout } from '../store/authSlice'
import AuthLayout from '../components/AuthLayout'
import RoleToggle from '../components/RoleToggle'

const LoginSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
})

const fieldClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const errorClass = 'text-xs text-red-500 mt-1'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [roleError, setRoleError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  return (
    <AuthLayout title="Welcome Back">
      <RoleToggle value={role} onChange={(r) => { setRole(r); setRoleError(null) }} />
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            setRoleError(null)
            const user = await dispatch(loginUser({ email: values.email, password: values.password }))
            if (user.role !== role) {
              dispatch(logout())
              setRoleError(
                role === 'admin'
                  ? 'This account does not have admin access.'
                  : 'Please use the Admin login for this account.'
              )
              return
            }
            navigate(user.role === 'admin' ? '/admin' : '/')
          } catch {
            // error shown via Redux state
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            {(error || roleError) && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {roleError || error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {role === 'admin' ? 'Admin Email' : 'Email'}
              </label>
              <Field type="email" name="email" placeholder="john@example.com" className={fieldClass} />
              <ErrorMessage name="email" component="p" className={errorClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {role === 'admin' ? 'Admin Password' : 'Password'}
              </label>
              <Field type="password" name="password" placeholder="Your password" className={fieldClass} />
              <ErrorMessage name="password" component="p" className={errorClass} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200"
            >
              {isSubmitting || loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-sm text-center text-gray-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Register
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  )
}
