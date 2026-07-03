// Cấu hình Socket-io phía client tại đây và export ra biến socketIoInstance
// https://socket.io/how-to-use-with-react
import { io } from 'socket.io-client'
import { API_ROOT } from '~/utils/constants'
// withCredentials: gửi kèm cookie accessToken khi handshake để BE xác thực socket (phục vụ phân quyền join room)
export const socketIoInstance = io(API_ROOT, { withCredentials: true })