import { configureStore } from '@reduxjs/toolkit'
import { activeBoardReducer } from './activeBoard/activeBoardSlice'
import { userReducer } from './user/userSlice'
import { activeCardReducer } from './activeCard/activeCardSlice'
import { notificationsReducer } from './notifications/notificationsSlice'

/**
 * Cấu hình redux-persist
 * https://www.npmjs.com/package/redux-persist
 * Bài viết hướng dẫn này dễ hiểu hơn:
 * https://edvins.io/how-to-use-redux-persist-with-redux-toolkit
 */

import { combineReducers } from 'redux' // lưu ý chúng ta có sẵn redux trong node_modules bởi vì khi cài @reduxjs/toolkit là đã có luôn
import { createMigrate, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // default là localstorage

// Cấu hình persist
const migrations = {
  1: (state) => {
    if (!state?.user?.currentUser) return state

    // Legacy sessions persisted JWTs and do not contain the current security fields.
    // Require a one-time sign-in so those secrets are removed and user data is refreshed.
    return {
      ...state,
      user: { ...state.user, currentUser: null }
    }
  }
}

const rootPersistConfig = {
  version: 1,
  migrate: createMigrate(migrations, { debug: false }),
  key: 'root', // key của cái persist do chúng ta chỉ định, cứ để mặc định là root
  storage: storage, // Biến storage ở trên - lưu vào localstorage
  whitelist: ['user'] // định nghĩa các slice dữ liệu ĐƯỢC PHÉP duy trì qua mỗi lần f5 trình duyệt
  // blacklist: ['user'] // định nghĩa các slice KHÔNG ĐƯỢC PHÉP duy trì qua mỗi lần f5 trình duyệt
}

// Combine các reducers trong dự án của chúng ta ở đây
const reducers = combineReducers({
  activeBoard: activeBoardReducer,
  user: userReducer,
  activeCard: activeCardReducer,
  notifications: notificationsReducer
})

// Thực hiện persist Reducer
const persistedReducers = persistReducer(rootPersistConfig, reducers)

export const store = configureStore({
  reducer: persistedReducers,

  // serializableCheck: false — fix warning khi dùng redux-persist
  // immutableCheck: false — middleware dev này deep-walk TOÀN BỘ state (board rất lớn) 2 lần cho mỗi dispatch,
  // gây khựng rõ rệt ở dev đúng lúc thả card/column (dispatch updateCurrentActiveBoard). Prod vốn không có.
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false, immutableCheck: false })
})
