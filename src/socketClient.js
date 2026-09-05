// Cấu hình Socket-io phía client tại đây và export ra biến socketIoInstance
// https://socket.io/how-to-use-with-react
import { io } from 'socket.io-client'
import { API_ROOT } from '~/utils/constants'

// Khi domain chạy qua Cloudflare Proxy, long-polling (HTTP polling) bị chặn hoặc trả về
// 0 bytes do Cloudflare terminate connection sớm. Fix: ưu tiên 'websocket' transport trước,
// fallback về 'polling' nếu WebSocket không khả dụng.
// Xem thêm: https://socket.io/docs/v4/client-options/#transports
// withCredentials: gửi kèm cookie accessToken khi handshake để BE xác thực socket (phục vụ phân quyền join room)
export const socketIoInstance = io(API_ROOT, {
  withCredentials: true,
  // Ưu tiên WebSocket (persistent connection) trước polling để tương thích với Cloudflare Proxy
  transports: ['websocket', 'polling'],
  // Tự động reconnect khi Cloudflare tạm thời drop connection
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000
})