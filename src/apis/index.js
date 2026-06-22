import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { toast } from 'sonner'

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

export const getArchivedItemsAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}/archived-items`)
  return response.data
}

export const updateBoardDetailAPI = async (boardId, updateData) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  return response.data
}

export const deleteBoardAPI = async (boardId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/boards/${boardId}`)
  return response.data
}

export const bulkDeleteBoardsAPI = async (boardIds) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/boards/bulk-delete`, {
    data: { boardIds }
  })
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

export const clearAllCardsInColumnAPI = async (columnId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/columns/clear-cards/${columnId}`)
  return response.data
}

export const updateColumnCardsLayoutAPI = async (columnId, newLayout) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/columns/${columnId}/cards-layout`, { newLayout })
  return response.data
}

export const archiveColumnAPI = async (columnId) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/columns/${columnId}/archive`)
  return response.data
}

export const restoreColumnAPI = async (columnId) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/columns/${columnId}/restore`)
  return response.data
}

// cards
export const createNewCardAPI = async (newCardData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/cards`, newCardData)
  return response.data
}

export const deleteCardAPI = async (cardId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/cards/${cardId}`)
  return response.data
}

export const archiveCardAPI = async (cardId) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}/archive`)
  return response.data
}

export const restoreCardAPI = async (cardId) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cards/${cardId}/restore`)
  return response.data
}

/** Users */
export const registerUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/register`, data)
  toast.success('Account created successfully! Please check and verify your account before logging in!', { theme: 'colored' })
  return response.data
}

export const googleLoginAPI = async (credential) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/google-login`, { credential })
  return response.data
}

export const githubLoginAPI = async (code) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/github-login`, { code })
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

export const fetchTemplatesAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/templates`)
  return response.data
}

export const cloneTemplateAPI = async (templateBoardId) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/boards/templates/clone`, { templateBoardId })
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

/** Custom Fields */
export const createCustomFieldAPI = async (boardId, data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/boards/${boardId}/custom-fields`, data)
  return response.data
}

export const updateCustomFieldAPI = async (boardId, fieldId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/boards/${boardId}/custom-fields/${fieldId}`, data)
  return response.data
}

export const deleteCustomFieldAPI = async (boardId, fieldId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/boards/${boardId}/custom-fields/${fieldId}`)
  return response.data
}

/** Activities */
export const getCardActivitiesAPI = async (cardId, page = 1, limit = 10) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/activities?cardId=${cardId}&page=${page}&limit=${limit}`)
  return response.data
}

/** Attachments */
export const uploadCardAttachmentAPI = async (cardId, formData) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/cards/${cardId}/attachments`, formData)
  return response.data
}

export const deleteCardAttachmentAPI = async (cardId, publicId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/cards/${cardId}/attachments`, { data: { publicId } })
  return response.data
}

/** Comments */
export const createCommentAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/comments`, data)
  return response.data
}

export const getCardCommentsAPI = async (cardId, page = 1, limit = 10) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/comments?cardId=${cardId}&page=${page}&limit=${limit}`)
  return response.data
}

export const getCommentRepliesAPI = async (parentId, page = 1, limit = 10) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/comments/${parentId}/replies?page=${page}&limit=${limit}`)
  return response.data
}

export const updateCommentAPI = async (commentId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/comments/${commentId}`, data)
  return response.data
}

export const deleteCommentAPI = async (commentId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/comments/${commentId}`)
  return response.data
}