import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, ThunkAction, Action } from '@reduxjs/toolkit'
import type { AxiosError } from 'axios'
import api from '../services/api'

type Thunk = ThunkAction<void, any, unknown, Action<string>>
type LoginThunk = ThunkAction<Promise<User>, any, unknown, Action<string>>
type VoidThunk = ThunkAction<Promise<void>, any, unknown, Action<string>>

export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
}

export interface UserListItem {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
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
  userList: UserListItem[]
  userListLoading: boolean
  userListError: string | null
}

const initialState: AuthState = {
  user: JSON.parse(sessionStorage.getItem('currentUser') || 'null'),
  isAuthenticated: !!sessionStorage.getItem('token'),
  loading: false,
  error: null,
  userList: [],
  userListLoading: false,
  userListError: null,
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
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('currentUser')
    },
    clearError: (state) => {
      state.error = null
    },
    setUserList: (state, action: PayloadAction<UserListItem[]>) => {
      state.userList = action.payload
    },
    setUserListLoading: (state, action: PayloadAction<boolean>) => {
      state.userListLoading = action.payload
    },
    setUserListError: (state, action: PayloadAction<string | null>) => {
      state.userListError = action.payload
    },
  },
})

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const registerUser =
  (credentials: { name: string; email: string; password: string; role?: 'user' | 'admin' }): Thunk =>
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
  (credentials: { email: string; password: string }): LoginThunk =>
  async (dispatch) => {
    try {
      dispatch(setAuthLoading(true))
      dispatch(setAuthError(null))
      const { data } = await api.post<LoginResponse>('/users/login', credentials)
      sessionStorage.setItem('token', data.token)
      sessionStorage.setItem('currentUser', JSON.stringify(data.user))
      dispatch(setUser(data.user))
      dispatch(setIsAuthenticated(true))
      dispatch(setAuthLoading(false))
      return data.user
    } catch (err) {
      const error = err as AxiosError<ApiError>
      dispatch(setAuthError(error.response?.data?.message || 'Login failed.'))
      dispatch(setAuthLoading(false))
      throw err
    }
  }

export const changePassword =
  (credentials: { currentPassword: string; newPassword: string }): VoidThunk =>
  async (dispatch) => {
    try {
      dispatch(setAuthLoading(true))
      dispatch(setAuthError(null))
      await api.patch('/users/change-password', credentials)
      dispatch(setAuthLoading(false))
    } catch (err) {
      const error = err as AxiosError<ApiError>
      dispatch(setAuthError(error.response?.data?.message || 'Failed to change password.'))
      dispatch(setAuthLoading(false))
      throw err
    }
  }

export const fetchAllUsers = (): Thunk => async (dispatch) => {
  try {
    dispatch(setUserListLoading(true))
    dispatch(setUserListError(null))
    const { data } = await api.get<UserListItem[]>('/users')
    dispatch(setUserList(data))
    dispatch(setUserListLoading(false))
  } catch (err) {
    const error = err as AxiosError<ApiError>
    dispatch(setUserListError(error.response?.data?.message || 'Failed to fetch users.'))
    dispatch(setUserListLoading(false))
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const {
  setUser,
  setIsAuthenticated,
  setAuthLoading,
  setAuthError,
  logout,
  clearError,
  setUserList,
  setUserListLoading,
  setUserListError,
} = authSlice.actions
export default authSlice.reducer
