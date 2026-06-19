import dayjs from 'dayjs'

/**
 * Tính trạng thái hiển thị của due date để render màu badge phù hợp.
 * @param {number|null} dueDate - Timestamp (ms) của deadline
 * @param {boolean} dueComplete - Trạng thái đã hoàn thành hay chưa
 * @returns {'completed'|'overdue'|'due-soon'|'normal'|null}
 */
export const getDueDateState = (dueDate, dueComplete) => {
  if (!dueDate) return null
  if (dueComplete) return 'completed' // Xanh lá

  const now = dayjs()
  const targetDate = dayjs(dueDate)

  if (targetDate.isBefore(now)) return 'overdue' // Đỏ
  if (targetDate.diff(now, 'hours') <= 24) return 'due-soon' // Vàng

  return 'normal' // Xám
}

/**
 * Trả về màu nền tương ứng với trạng thái due date
 */
export const getDueDateColor = (state, theme) => {
  const isDark = theme?.palette?.mode === 'dark'
  switch (state) {
  case 'completed': return '#4bce97'
  case 'overdue': return '#ef4444'
  case 'due-soon': return '#e2b203'
  case 'normal': return isDark ? '#2c3542' : '#eaedf0'
  default: return 'transparent'
  }
}

/**
 * Trả về màu chữ tương ứng (để đảm bảo contrast)
 */
export const getDueDateTextColor = (state, theme) => {
  const isDark = theme?.palette?.mode === 'dark'
  switch (state) {
  case 'completed': return '#1d2125'
  case 'overdue': return '#fff'
  case 'due-soon': return '#1d2125'
  case 'normal': return isDark ? '#e6edf3' : '#1d2125'
  default: return 'inherit'
  }
}
