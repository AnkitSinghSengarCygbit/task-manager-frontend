import { combineReducers, configureStore } from '@reduxjs/toolkit'
import type { Action, ThunkAction } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import taskReducer from './taskSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  tasks: taskReducer,
})

export type AppState = ReturnType<typeof rootReducer>

export function setupStore() {
  return configureStore({
    reducer: rootReducer,
  })
}

export const store = setupStore()

export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>
