import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(localizedFormat)
import Badge from '@mui/material/Badge'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import DoneIcon from '@mui/icons-material/Done'
import NotInterestedIcon from '@mui/icons-material/NotInterested'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectCurrentNotifications,
  fetchInvitationsAPI,
  updateBoardInvitationAPI,
  addNotification
} from '~/redux/notifications/notificationsSlice'
import { socketIoInstance } from '~/socketClient'
import { selectCurrentUser } from '~/redux/user/userSlice'

import { useNavigate } from 'react-router-dom'

const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

function Notifications() {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClickNotificationIcon = (event) => {
    setAnchorEl(event.currentTarget)

    // khi click vào phần icon thông báo thì tắt trạng thái có thông báo mới
    setNewNotification(false)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  // khởi tạo navigate
  const navigate = useNavigate()

  // state để theo dõi xem có thông báo mới hay ko
  const [newNotification, setNewNotification] = useState(false)

  // lấy thông tin user hiện tại đang đăng nhập
  const currentUser = useSelector(selectCurrentUser)

  // lấy dữ liệu notifications trong redux
  const notifications = useSelector(selectCurrentNotifications)

  // fetch danh sách các lời mời invitations
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchInvitationsAPI())

    // tạo một func xử lý khi nhận đc sự kiện real time
    const onRecieveNewInvitation = (invitation) => {
      // Nếu thằng user đang đăng nhập hiện tại trong redux chính là thằng invitee trong bản ghi invitation
      if (invitation.inviteeId === currentUser._id) {
        // B1: thêm bản ghi invitation mới vào redux
        dispatch(addNotification(invitation))

        // B2: cập nhật trạng thái đang có thông báo đến
        setNewNotification(true)
      }
    }
    
    // lắng nghe 1 sự kiện real time tên là "BE_USER_INVITED_TO_BOARD"
    socketIoInstance.on('BE_USER_INVITED_TO_BOARD', onRecieveNewInvitation)

    // dọn dẹp, tắt sự kiện listener khi component unmount
    return () => {
      socketIoInstance.off('BE_USER_INVITED_TO_BOARD', onRecieveNewInvitation)
    }

  }, [dispatch, currentUser._id])

  // cập nhật trạng thái của một lời mời
  const updateBoardInvitation = (status, invitationId) => {
    // console.log('status: ', status)
    // console.log('invitationId: ', invitationId)
    dispatch(updateBoardInvitationAPI({ status, invitationId }))
      .then(res => {
        // console.log('Update result: ', res.payload)
        if (res.payload.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
          navigate(`/boards/${res.payload.boardInvitation.boardId}`)
        }
      })
  }

  return (
    <Box>
      <Tooltip title="Notifications">
        <Badge
          color="warning"
          // variant="dot"
          // variant="none"
          variant={newNotification ? 'dot' : 'none'}
          sx={{ cursor: 'pointer' }}
          id="basic-button-open-notification"
          aria-controls={open ? 'basic-notification-drop-down' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClickNotificationIcon}
        >
          <NotificationsNoneIcon sx={{
            color: (theme) => newNotification ? 'warning.light' : (theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b'),
            '&:hover': { color: (theme) => theme.palette.mode === 'dark' ? '#e2e8f0' : '#0f172a' },
            transition: 'color 0.2s ease'
          }} />
        </Badge>
      </Tooltip>

      <Menu
        sx={{ mt: 2 }}
        id="basic-notification-drop-down"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock={true}
        disableAutoFocusItem={true}
        autoFocus={false}
        transitionDuration={0}
        MenuListProps={{ 
          'aria-labelledby': 'basic-button-open-notification',
          disablePadding: true,
          sx: { p: 0 }
        }}
        PaperProps={{
          sx: {
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1f242c' : '#fff',
            border: (theme) => theme.palette.mode === 'dark' ? '1px solid #30363d' : 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            borderRadius: '10px',
            overflow: 'hidden',
            '& .MuiList-root': {
              p: 0
            }
          }
        }}
      >
        {(!notifications || notifications.length === 0) && (
          <MenuItem sx={{ 
            minWidth: 320, 
            py: 3, 
            justifyContent: 'center', 
            color: (theme) => theme.palette.mode === 'dark' ? '#A0AEC0' : '#718096',
            cursor: 'default',
            '&:hover': { bgcolor: 'transparent' }
          }}>
            You do not have any new notifications.
          </MenuItem>
        )}
        {notifications?.map((notification, index) => (
          <div key={index} style={{ margin: 0, padding: 0 }}>
            <MenuItem sx={{
              minWidth: 320,
              maxWidth: 360,
              p: 2.5,
              whiteSpace: 'normal',
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
              }
            }}>
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Nội dung của thông báo */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)', 
                    color: '#3b82f6',
                    borderRadius: '50%',
                    p: 1,
                    mt: 0.5
                  }}>
                    <GroupAddIcon fontSize="small" />
                  </Box>
                  <Box sx={{ 
                    fontSize: '14px', 
                    lineHeight: 1.5,
                    color: (theme) => theme.palette.mode === 'dark' ? '#e6edf3' : '#1d2125'
                  }}>
                    <strong>{notification?.inviter?.displayName || notification?.inviter?.username || notification?.inviter?.fullName}</strong> had invited you to join the board <strong>{notification?.board?.title}</strong>
                  </Box>
                </Box>

                {/* Khi Status của thông báo này là PENDING thì sẽ hiện 2 Button */}
                { notification.boardInvitation?.status === BOARD_INVITATION_STATUS.PENDING && 
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      className="interceptor-loading"
                      type="submit"
                      variant="contained"
                      size="small"
                      sx={{
                        px: 2,
                        py: 0.5,
                        fontSize: '12.5px',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: '6px',
                        color: '#ffffff',
                        bgcolor: '#3b82f6',
                        boxShadow: 'none',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: '#2563eb',
                          boxShadow: 'none'
                        }
                      }}
                      onClick={() => updateBoardInvitation(BOARD_INVITATION_STATUS.ACCEPTED, notification._id)}
                    >
                      Accept
                    </Button>
                    <Button
                      className="interceptor-loading"
                      type="submit"
                      variant="text"
                      size="small"
                      sx={{
                        px: 2,
                        py: 0.5,
                        fontSize: '12.5px',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: '6px',
                        color: (theme) => theme.palette.mode === 'dark' ? '#f1f5f9' : '#334155',
                        bgcolor: 'transparent',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'
                        }
                      }}
                      onClick={() => updateBoardInvitation(BOARD_INVITATION_STATUS.REJECTED, notification._id)}
                    >
                      Reject
                    </Button>
                  </Box>
                }

                {/* Khi Status của thông báo này là ACCEPTED hoặc REJECTED thì sẽ hiện thông tin đó lên */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'flex-end' }}>

                  { notification.boardInvitation?.status === BOARD_INVITATION_STATUS.ACCEPTED &&
                    <Chip 
                      icon={<DoneIcon sx={{ '&&': { color: (theme) => theme.palette.mode === 'dark' ? '#34d399' : '#059669' } }} />} 
                      label="Accepted" 
                      size="small" 
                      sx={{
                      fontSize: '11px',
                      fontWeight: 600,
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(209, 250, 229, 0.7)',
                      color: (theme) => theme.palette.mode === 'dark' ? '#34d399' : '#059669',
                      border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(52, 211, 153, 0.2)' : '1px solid rgba(52, 211, 153, 0.3)',
                      p: '2px 4px'
                    }}/>
                  }

                  { notification.boardInvitation?.status === BOARD_INVITATION_STATUS.REJECTED &&
                    <Chip 
                      icon={<NotInterestedIcon sx={{ '&&': { color: (theme) => theme.palette.mode === 'dark' ? '#f87171' : '#dc2626' } }} />} 
                      label="Rejected" 
                      size="small" 
                      sx={{
                      fontSize: '11px',
                      fontWeight: 600,
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.12)' : 'rgba(254, 226, 226, 0.7)',
                      color: (theme) => theme.palette.mode === 'dark' ? '#f87171' : '#dc2626',
                      border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(248, 113, 113, 0.2)' : '1px solid rgba(248, 113, 113, 0.3)',
                      p: '2px 4px'
                    }}/>
                  }
                </Box>

                {/* Thời gian của thông báo */}
                <Box sx={{ textAlign: 'right' }}>
                  <Typography 
                    variant="span" 
                    sx={{ 
                      fontSize: '11px', 
                      color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                      fontWeight: 500
                    }}
                  >
                    {dayjs(notification.createdAt).format('llll')}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            {index !== (notifications?.length - 1) && (
              <Divider sx={{ my: '0 !important', borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }} />
            )}
          </div>
        ))}
      </Menu>
    </Box>
  )
}

export default Notifications
