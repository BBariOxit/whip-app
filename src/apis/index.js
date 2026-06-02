import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { toast } from 'react-toastify'

/* * Lưu ý: Đối với việc sử dụng axios
* Tất cả các function bên dưới các bạn sẽ thấy mình chỉ request và lấy data luôn, mà không có try catch hay then catch
hay then catch gì để bắt lỗi.
* Lý do là vì ở phía Front-end chúng ta không cần thiết làm như vậy đối với mọi request bởi nó sẽ gây
ra việc dư thừa code catch lỗi quá nhiều.
* Giải pháp Clean Code gọn gàng đó là chúng ta sẽ catch lỗi tập trung tại một nơi bằng cách
tận dụng một thứ cực kỳ mạnh mẽ trong axios đó là Interceptors
* Hiểu đơn giản Interceptors là cách mà chúng ta sẽ đánh chặn vào giữa request hoặc
response để xử lý logic mà chúng ta muốn. */

// boards
export const fetchBoardDetailAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
  // lưu ý: axios trả về kết quả qua property của nó là data
  return response.data
}

export const updateBoardDetailAPI = async (boardId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  return response.data
}

export const moveCarDifferentColumnlAPI = async (updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/supports/moving_card`, updateData)
  return response.data
}

// columns
export const createNewColumnAPI = async (newColumnData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/columns`, newColumnData)
  return response.data
}

export const updateColumnDetailAPI = async (columnId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)
  return response.data
}

export const deleteColumnDetailAPI = async (columnId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/columns/${columnId}`)
  return response.data
}

// cards
export const createNewCardAPI = async (newCardData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/cards`, newCardData)
  return response.data
}

/** Users */
export const registerUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/register`, data)
  toast.success('Account created successfully! Please check and verify your account before logging in!', { theme: 'colored' })
  return response.data
}

export const verifyUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/verify`, data)
  toast.success('Account verified successfully! Now you can login to enjoy our services! Have a good day!', { theme: 'colored' })
  return response.data
}

export const refreshTokenAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/refresh_token`)
  return response.data
}

export const fetchBoardsAPI = async (searchPath) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards${searchPath}`)
  return response.data
}

export const createNewBoardAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/boards`, data)
  toast.success('Board created successfully')
  return response.data
} 

export const updateCardDetailsAPI = async (cardId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}`, updateData)
  return response.data
}

export const inviteUserToBoardAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/invitations/board`, data)
  toast.success('User invited to board successfully!')
  return response.data
}

export const createNewCardLabelAPI = async (newLabelData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/labels`, newLabelData)
  return response.data
}

export const updateCardLabelAPI = async (labelId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/labels/${labelId}`, updateData)
  return response.data
}

export const deleteCardLabelAPI = async (labelId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/labels/${labelId}`)
  return response.data
}

/** Activities */
export const getCardActivitiesAPI = async (cardId, page = 1, limit = 10) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/activities?cardId=${cardId}&page=${page}&limit=${limit}`)
  return response.data
}