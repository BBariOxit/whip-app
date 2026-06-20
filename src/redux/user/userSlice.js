import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { toast } from 'sonner'

// khởi tạo state của 1 slice trong redux
const initialState = {
  currentUser: null
}
// Các hành động gọi api (bất đồng bộ) và cập nhật dữ liệu vào Redux, dùng Middleware createAsyncThunk đi kèm với extraReducers
export const loginUserAPI = createAsyncThunk(
  'user/loginUserAPI', 
  async (data) => {
    const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/login`, data)
    // lưu ý: axios trả về kết quả qua property của nó là data
    return response.data  
  }  
)

export const googleLoginUserAPI = createAsyncThunk(
  'user/googleLoginUserAPI',
  async (credential) => {
    const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/google-login`, { credential })
    return response.data
  }
)

export const githubLoginUserAPI = createAsyncThunk(
  'user/githubLoginUserAPI',
  async (code) => {
    const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/github-login`, { code })
    return response.data
  }
)

export const logoutUserAPI = createAsyncThunk(
  'user/logoutUserAPI',
  async (showSuccessMessage = true) => {
    const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/logout`)
    if (showSuccessMessage) {
      toast.success('Logged out successfully!')
    }
    return response.data
  }
)

export const updateUserAPI = createAsyncThunk(
  'user/updateUserAPI',
  async (data) => {
    const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/update`, data)
    return response.data
  }
)

// khởi tạo slice trong kho lưu trữ redux
export const userSlice = createSlice({
  name: 'user',
  initialState,
  // reducers: nơi xử lý dữ liệu đồng bộ
  reducers: {},
  // extraReducers: nơi xử lý các hành động bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(loginUserAPI.fulfilled, (state, action) => {
      // action.payload chính là cái response.data đã được return ở trên
      const user = action.payload
      state.currentUser = user
    })
    builder.addCase(googleLoginUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = user
    })
    builder.addCase(githubLoginUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = user
    })
    builder.addCase(logoutUserAPI.fulfilled, (state) => {
      // B1: Logout thành công thì sẽ clear thông tin currentUser về null ở đây
      // B2: Kết hợp sử dụng Protected Routes ở App.js -> sẽ tự động chuyển hướng về trang login
      state.currentUser = null
    })
    builder.addCase(updateUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = user
    })
  }
})

// Actions: Là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer (chạy đồng bộ)
// Để ý ở trên thì không thấy properties actions đâu cả, bởi vì những cái actions này đơn giản là được thằng redux tạo tự động theo tên của reducer nhé.
// export const { } = userSlice.actions

// Selectors: Là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentUser = (state) => {
  return state.user.currentUser
}

export const userReducer = userSlice.reducer