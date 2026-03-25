import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, ThunkAction, Action } from '@reduxjs/toolkit'
import type { AxiosError } from 'axios'
import api from '../services/api'

type Thunk = ThunkAction<void, any, unknown, Action<string>>

export type TaskStatus = 'pending' | 'progress' | 'completed'

export interface Task {
  _id: string
  title: string
  description: string
  notes: string
  status: TaskStatus
  owner: { _id: string; name: string; email: string }
  createdAt: string
  updatedAt: string
}

interface ApiError {
  message: string
}

export interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null
  draftNotes: Record<string, string>
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  draftNotes: {},
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload)
    },
    updateTaskInList: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex((t) => t._id === action.payload._id)
      if (index !== -1) state.tasks[index] = action.payload
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload)
    },
    setTaskLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setTaskError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearTaskError: (state) => {
      state.error = null
    },
    setDraftNote: (state, action: PayloadAction<{ id: string; notes: string }>) => {
      state.draftNotes[action.payload.id] = action.payload.notes
    },
    clearDraftNote: (state, action: PayloadAction<string>) => {
      delete state.draftNotes[action.payload]
    },
  },
})

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchMyTasks =
  (uid: string, status?: TaskStatus): Thunk =>
  async (dispatch) => {
    try {
      dispatch(setTaskLoading(true))
      dispatch(setTaskError(null))
      const params = status ? { status } : {}
      const { data } = await api.get<Task[]>(`/tasks/user/${uid}`, { params })
      dispatch(setTasks(data))
      dispatch(setTaskLoading(false))
    } catch (err) {
      const error = err as AxiosError<ApiError>
      dispatch(setTaskError(error.response?.data?.message || 'Failed to fetch tasks.'))
      dispatch(setTaskLoading(false))
    }
  }

export const createTask =
  (payload: { title: string; description?: string }): Thunk =>
  async (dispatch) => {
    try {
      dispatch(setTaskLoading(true))
      dispatch(setTaskError(null))
      const { data } = await api.post<Task>('/tasks', payload)
      dispatch(addTask(data))
      dispatch(setTaskLoading(false))
    } catch (err) {
      const error = err as AxiosError<ApiError>
      dispatch(setTaskError(error.response?.data?.message || 'Failed to create task.'))
      dispatch(setTaskLoading(false))
      throw err
    }
  }

export const updateTask =
  (payload: { id: string; title?: string; description?: string; notes?: string; status?: TaskStatus }): Thunk =>
  async (dispatch) => {
    try {
      const { id, ...fields } = payload
      const { data } = await api.patch<Task>(`/tasks/${id}`, fields)
      dispatch(updateTaskInList(data))
    } catch (err) {
      const error = err as AxiosError<ApiError>
      dispatch(setTaskError(error.response?.data?.message || 'Failed to update task.'))
    }
  }

export const deleteTask =
  (id: string): Thunk =>
  async (dispatch) => {
    try {
      await api.delete(`/tasks/${id}`)
      dispatch(removeTask(id))
    } catch (err) {
      const error = err as AxiosError<ApiError>
      dispatch(setTaskError(error.response?.data?.message || 'Failed to delete task.'))
    }
  }

// ─── Exports ──────────────────────────────────────────────────────────────────

export const {
  setTasks,
  addTask,
  updateTaskInList,
  removeTask,
  setTaskLoading,
  setTaskError,
  clearTaskError,
  setDraftNote,
  clearDraftNote,
} = taskSlice.actions
export default taskSlice.reducer
