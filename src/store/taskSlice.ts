import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, ThunkAction, Action } from '@reduxjs/toolkit'
import type { AxiosError } from 'axios'
import api from '../services/api'

type Thunk = ThunkAction<void, any, unknown, Action<string>>
type VoidThunk = ThunkAction<Promise<void>, any, unknown, Action<string>>

export type TaskStatus = 'pending' | 'progress' | 'completed' | 'assigned' | 'submitted' | 'revision'

export interface Task {
  _id: string
  title: string
  description: string
  notes: string
  status: TaskStatus
  owner: { _id: string; name: string; email: string }
  assignedTo?: { _id: string; name: string; email: string }
  assignedBy?: { _id: string; name: string; email: string }
  proof?: string
  screenshot?: string
  screenshotRequired?: boolean
  adminFeedback?: string
  approvalNote?: string
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
  pendingReviews: Task[]
  pendingReviewsLoading: boolean
  pendingReviewsError: string | null
  userTasks: Task[]
  userTasksLoading: boolean
  userTasksError: string | null
  userTaskCounts: Record<string, number>
  userTaskCountsLoading: boolean
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  draftNotes: {},
  pendingReviews: [],
  pendingReviewsLoading: false,
  pendingReviewsError: null,
  userTasks: [],
  userTasksLoading: false,
  userTasksError: null,
  userTaskCounts: {},
  userTaskCountsLoading: false,
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
    setPendingReviews: (state, action: PayloadAction<Task[]>) => {
      state.pendingReviews = action.payload
    },
    updatePendingReview: (state, action: PayloadAction<Task>) => {
      state.pendingReviews = state.pendingReviews.filter((t) => t._id !== action.payload._id)
    },
    setPendingReviewsLoading: (state, action: PayloadAction<boolean>) => {
      state.pendingReviewsLoading = action.payload
    },
    setPendingReviewsError: (state, action: PayloadAction<string | null>) => {
      state.pendingReviewsError = action.payload
    },
    setUserTasks: (state, action: PayloadAction<Task[]>) => {
      state.userTasks = action.payload
    },
    setUserTasksLoading: (state, action: PayloadAction<boolean>) => {
      state.userTasksLoading = action.payload
    },
    setUserTasksError: (state, action: PayloadAction<string | null>) => {
      state.userTasksError = action.payload
    },
    setUserTaskCounts: (state, action: PayloadAction<Record<string, number>>) => {
      state.userTaskCounts = action.payload
    },
    setUserTaskCountsLoading: (state, action: PayloadAction<boolean>) => {
      state.userTaskCountsLoading = action.payload
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

export const assignTask =
  (payload: { title: string; description?: string; assignedTo: string; screenshotRequired?: boolean }): VoidThunk =>
  async (dispatch) => {
    try {
      dispatch(setTaskLoading(true))
      dispatch(setTaskError(null))
      await api.post<Task>('/tasks/assign', payload)
      dispatch(setTaskLoading(false))
    } catch (err) {
      const error = err as AxiosError<ApiError>
      dispatch(setTaskError(error.response?.data?.message || 'Failed to assign task.'))
      dispatch(setTaskLoading(false))
      throw err
    }
  }

export const submitProof =
  (taskId: string, proof: string, screenshot?: string): VoidThunk =>
  async (dispatch) => {
    try {
      dispatch(setTaskLoading(true))
      dispatch(setTaskError(null))
      const { data } = await api.patch<Task>(`/tasks/${taskId}/submit-proof`, { proof, screenshot })
      dispatch(updateTaskInList(data))
      dispatch(setTaskLoading(false))
    } catch (err) {
      const error = err as AxiosError<ApiError>
      dispatch(setTaskError(error.response?.data?.message || 'Failed to submit proof.'))
      dispatch(setTaskLoading(false))
      throw err
    }
  }

export const fetchPendingReviews = (): Thunk => async (dispatch) => {
  try {
    dispatch(setPendingReviewsLoading(true))
    dispatch(setPendingReviewsError(null))
    const { data } = await api.get<Task[]>('/tasks/pending-review')
    dispatch(setPendingReviews(data))
    dispatch(setPendingReviewsLoading(false))
  } catch (err) {
    const error = err as AxiosError<ApiError>
    dispatch(setPendingReviewsError(error.response?.data?.message || 'Failed to fetch reviews.'))
    dispatch(setPendingReviewsLoading(false))
  }
}

export const fetchUserTasksForAdmin =
  (uid: string): Thunk =>
  async (dispatch) => {
    try {
      dispatch(setUserTasksLoading(true))
      dispatch(setUserTasksError(null))
      const { data } = await api.get<Task[]>(`/tasks/user/${uid}`)
      dispatch(setUserTasks(data.filter((t) => !!t.assignedTo)))
      dispatch(setUserTasksLoading(false))
    } catch (err) {
      const error = err as AxiosError<ApiError>
      dispatch(setUserTasksError(error.response?.data?.message || 'Failed to fetch user tasks.'))
      dispatch(setUserTasksLoading(false))
    }
  }

export const reviewTask =
  (taskId: string, payload: { approved: boolean; feedback?: string; approvalNote?: string }): VoidThunk =>
  async (dispatch) => {
    try {
      const { data } = await api.patch<Task>(`/tasks/${taskId}/review`, payload)
      dispatch(updatePendingReview(data))
    } catch (err) {
      const error = err as AxiosError<ApiError>
      dispatch(setPendingReviewsError(error.response?.data?.message || 'Failed to submit review.'))
      throw err
    }
  }

export const fetchUserTaskCounts = (): Thunk => async (dispatch) => {
  try {
    dispatch(setUserTaskCountsLoading(true))
    const { data } = await api.get<Record<string, number>>('/tasks/user-counts')
    dispatch(setUserTaskCounts(data))
    dispatch(setUserTaskCountsLoading(false))
  } catch {
    dispatch(setUserTaskCountsLoading(false))
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
  setPendingReviews,
  updatePendingReview,
  setPendingReviewsLoading,
  setPendingReviewsError,
  setUserTasks,
  setUserTasksLoading,
  setUserTasksError,
  setUserTaskCounts,
  setUserTaskCountsLoading,
} = taskSlice.actions
export default taskSlice.reducer
