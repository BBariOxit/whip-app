// Quản lý danh sách "board vừa xem gần đây" bằng localStorage (thuần client, không đụng server).
// Bảo mật/riêng tư: key được gắn theo userId để trên cùng 1 trình duyệt, tài khoản này không thấy
// lịch sử của tài khoản khác. Chỉ lưu vài field tối thiểu cần cho dropdown (không lưu nội dung nhạy cảm).

const MAX_RECENT_BOARDS = 6
const STORAGE_PREFIX = 'whip_recent_boards'

const buildKey = (userId) => `${STORAGE_PREFIX}_${userId}`

// Đọc danh sách recent của 1 user. Parse an toàn: hỏng dữ liệu / localStorage lỗi thì trả mảng rỗng.
export const getRecentBoards = (userId) => {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(buildKey(userId))
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Ghi nhận 1 board vừa được mở: đẩy lên đầu, khử trùng lặp, giới hạn số lượng.
export const addRecentBoard = (userId, board) => {
  if (!userId || !board?._id) return
  try {
    const boardData = {
      _id: board._id,
      title: board.title,
      background: board.background,
      // getDetails trả về board.workspace (đã unwind) khi board thuộc workspace; personal thì không có
      workspaceName: board.workspace?.title || 'Personal Board'
    }

    const next = [
      boardData,
      ...getRecentBoards(userId).filter(b => b._id !== board._id)
    ].slice(0, MAX_RECENT_BOARDS)

    localStorage.setItem(buildKey(userId), JSON.stringify(next))
  } catch {
    // localStorage đầy / bị chặn (private mode) -> bỏ qua, không phá luồng chính
  }
}

export const clearRecentBoards = (userId) => {
  if (!userId) return false
  try {
    localStorage.removeItem(buildKey(userId))
    return true
  } catch {
    return false
  }
}
