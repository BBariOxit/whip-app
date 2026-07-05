import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

// Khởi tạo State ban đầu cho kho chứa Notifications
const initialState = {
  currentNotifications: null,
  // Thông báo chung (không phải lời mời): board activity, mentions, member joins...
  inAppNotifications: [],
  unreadCount: 0
}

// API lấy danh sách lời mời (Invitations)
export const fetchInvitationsAPI = createAsyncThunk(
  'notifications/fetchInvitationsAPI',
  async () => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/invitations`)
    return response.data
  }
)

// API lấy danh sách thông báo chung + số chưa đọc
export const fetchNotificationsAPI = createAsyncThunk(
  'notifications/fetchNotificationsAPI',
  async () => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/notifications`)
    return response.data // { notifications, unreadCount }
  }
)

// Đánh dấu đã đọc 1 thông báo
export const markNotificationReadAPI = createAsyncThunk(
  'notifications/markNotificationReadAPI',
  async (notificationId) => {
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/notifications/${notificationId}/read`)
    return response.data
  }
)

// Đánh dấu đã đọc tất cả
export const markAllNotificationsReadAPI = createAsyncThunk(
  'notifications/markAllNotificationsReadAPI',
  async () => {
    await authorizedAxiosInstance.put(`${API_ROOT}/v1/notifications/read-all`)
    return true
  }
)

// Xoá (ẩn) 1 thông báo chung
export const deleteNotificationAPI = createAsyncThunk(
  'notifications/deleteNotificationAPI',
  async (notificationId) => {
    await authorizedAxiosInstance.delete(`${API_ROOT}/v1/notifications/${notificationId}`)
    return notificationId
  }
)

// API cập nhật trạng thái lời mời vào Board (Accept / Reject)
export const updateBoardInvitationAPI = createAsyncThunk(
  'notifications/updateBoardInvitationAPI',
  async ({ status, invitationId }) => {
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/invitations/board/${invitationId}`, { status })
    return response.data
  }
)

// Khởi tạo Slice quản lý Notification
export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearCurrentNotifications: (state) => {
      state.currentNotifications = null
    },
    updateCurrentNotifications: (state, action) => {
      state.currentNotifications = action.payload
    },
    // thêm mới 1 bản ghi notifications vào đầu mảng currentNotifications
    addNotification: (state, action) => {
      const incomingInvitation = action.payload
      state.currentNotifications.unshift(incomingInvitation)
    },
    // thêm 1 thông báo chung real-time (từ socket) vào đầu danh sách
    addInAppNotification: (state, action) => {
      state.inAppNotifications.unshift(action.payload)
      if (!action.payload.isRead) state.unreadCount += 1
    }
  },
  // ExtraReducers: Xử lý dữ liệu bất đồng bộ từ các API Thunk phía trên
  extraReducers: (builder) => {
    builder.addCase(fetchInvitationsAPI.fulfilled, (state, action) => {
      let incomingInvitations = action.payload
      // Đoạn này đảo ngược lại mảng invitations nhận được, đơn giản là để hiển thị cái mới nhất lên đầu
      state.currentNotifications = Array.isArray(incomingInvitations) ? incomingInvitations.reverse() : []
    })

    builder.addCase(updateBoardInvitationAPI.fulfilled, (state, action) => {
      const incomingInvitation = action.payload
      // Cập nhật lại dữ liệu boardInvitation (bên trong nó sẽ có Status mới sau khi update)
      const getInvitation = state.currentNotifications.find(i => i._id === incomingInvitation._id)
      if (getInvitation) {
        getInvitation.boardInvitation = incomingInvitation.boardInvitation
      }
    })

    builder.addCase(fetchNotificationsAPI.fulfilled, (state, action) => {
      state.inAppNotifications = action.payload?.notifications || []
      state.unreadCount = action.payload?.unreadCount || 0
    })

    builder.addCase(markNotificationReadAPI.fulfilled, (state, action) => {
      const updated = action.payload
      const target = state.inAppNotifications.find(n => n._id === updated?._id)
      if (target && !target.isRead) {
        target.isRead = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    })

    builder.addCase(markAllNotificationsReadAPI.fulfilled, (state) => {
      state.inAppNotifications.forEach(n => { n.isRead = true })
      state.unreadCount = 0
    })

    builder.addCase(deleteNotificationAPI.fulfilled, (state, action) => {
      const removedId = action.payload
      const target = state.inAppNotifications.find(n => n._id === removedId)
      // Nếu xoá 1 thông báo chưa đọc thì giảm bộ đếm chưa đọc
      if (target && !target.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
      state.inAppNotifications = state.inAppNotifications.filter(n => n._id !== removedId)
    })
  }
})

// Action creators are generated for each case reducer function
// Actions: Là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer (chạy đồng bộ)
// Để ý ở trên thì không thấy properties actions đâu cả, bởi vì những cái actions này đơn giản là được thằng redux tạo tự động theo tên của reducer nhé.
export const {
  clearCurrentNotifications,
  updateCurrentNotifications,
  addNotification,
  addInAppNotification
} = notificationsSlice.actions

// Selectors: Là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentNotifications = state => state.notifications.currentNotifications
export const selectInAppNotifications = state => state.notifications.inAppNotifications
export const selectUnreadCount = state => state.notifications.unreadCount

// Cái file này tên là notificationsSlice NHƯNG chúng ta sẽ export một thứ tên là Reducer, mọi người lưu ý :D
// export default notificationsSlice.reducer
export const notificationsReducer = notificationsSlice.reducer