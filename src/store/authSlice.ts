import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, ThunkAction, Action } from '@reduxjs/toolkit'
import type { AxiosError } from 'axios'
import api from '../services/api'

type Thunk = ThunkAction<void, any, unknown, Action<string>>

export interface User {
  id: string
  name: string
  email: string
}

interface LoginResponse {
  token: string
  user: User
}

interface ApiError {
  message: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('currentUser') || 'null'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('currentUser')
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const registerUser =
  (credentials: { name: string; email: string; password: string }): Thunk =>
  async (dispatch) => {
    try {
      dispatch(setAuthLoading(true))
      dispatch(setAuthError(null))
      await api.post('/users/register', credentials)
      dispatch(setAuthLoading(false))
    } catch (err) {
      const error = err as AxiosError<ApiError>
      dispatch(setAuthError(error.response?.data?.message || 'Registration failed.'))
      dispatch(setAuthLoading(false))
      throw err
    }
  }

export const loginUser =
  (credentials: { email: string; password: string }): Thunk =>
  async (dispatch) => {
    try {
      dispatch(setAuthLoading(true))
      dispatch(setAuthError(null))
      const { data } = await api.post<LoginResponse>('/users/login', credentials)
      localStorage.setItem('token', data.token)
      localStorage.setItem('currentUser', JSON.stringify(data.user))
      dispatch(setUser(data.user))
      dispatch(setIsAuthenticated(true))
      dispatch(setAuthLoading(false))
    } catch (err) {
      const error = err as AxiosError<ApiError>
      dispatch(setAuthError(error.response?.data?.message || 'Login failed.'))
      dispatch(setAuthLoading(false))
      throw err
    }
  }

// ─── Exports ──────────────────────────────────────────────────────────────────

export const { setUser, setIsAuthenticated, setAuthLoading, setAuthError, logout, clearError } =
  authSlice.actions
export default authSlice.reducer
