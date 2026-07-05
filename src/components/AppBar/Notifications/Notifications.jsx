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
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectCurrentNotifications,
  selectInAppNotifications,
  selectUnreadCount,
  fetchInvitationsAPI,
  fetchNotificationsAPI,
  updateBoardInvitationAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
  deleteNotificationAPI,
  addNotification,
  addInAppNotification
} from '~/redux/notifications/notificationsSlice'
import { socketIoInstance } from '~/socketClient'
import { selectCurrentUser } from '~/redux/user/userSlice'

import { useNavigate } from 'react-router-dom'

const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

// Icon cho từng loại thông báo chung (in-app)
const genericIconByType = (type) => {
  switch (type) {
    case 'MENTION': return <AlternateEmailIcon fontSize="small" />
    default: return <ViewColumnOutlinedIcon fontSize="small" />
  }
}

function Notifications() {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClickNotificationIcon = (event) => {
    setAnchorEl(event.currentTarget)
    // khi click vào phần icon thông báo thì tắt trạng thái "có thông báo mới" (chấm pulse)
    setNewNotification(false)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const navigate = useNavigate()

  // state để theo dõi xem có thông báo mới đến real-time hay ko
  const [newNotification, setNewNotification] = useState(false)

  const currentUser = useSelector(selectCurrentUser)
  const invitations = useSelector(selectCurrentNotifications)
  const inAppNotifications = useSelector(selectInAppNotifications)
  const unreadCount = useSelector(selectUnreadCount)

  const dispatch = useDispatch()

  useEffect(() => {
    // Lấy cả lời mời (invitations) lẫn thông báo chung
    dispatch(fetchInvitationsAPI())
    dispatch(fetchNotificationsAPI())

    // Lời mời vào board (real-time)
    const onReceiveNewInvitation = (invitation) => {
      if (invitation.inviteeId === currentUser._id) {
        dispatch(addNotification(invitation))
        setNewNotification(true)
      }
    }
    // Thông báo chung (real-time) — server đã emit tới đúng room user:<id>
    const onReceiveNewNotification = (notification) => {
      dispatch(addInAppNotification(notification))
      setNewNotification(true)
    }

    socketIoInstance.on('BE_USER_INVITED_TO_BOARD', onReceiveNewInvitation)
    socketIoInstance.on('BE_NEW_NOTIFICATION', onReceiveNewNotification)

    return () => {
      socketIoInstance.off('BE_USER_INVITED_TO_BOARD', onReceiveNewInvitation)
      socketIoInstance.off('BE_NEW_NOTIFICATION', onReceiveNewNotification)
    }
  }, [dispatch, currentUser._id])

  // cập nhật trạng thái của một lời mời
  const updateBoardInvitation = (status, invitationId) => {
    dispatch(updateBoardInvitationAPI({ status, invitationId }))
      .then(res => {
        if (res.payload.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
          navigate(`/boards/${res.payload.boardInvitation.boardId}`)
        }
      })
  }

  const handleClickGeneric = (notif) => {
    if (!notif.isRead) dispatch(markNotificationReadAPI(notif._id))
    handleClose()
    if (notif.boardId) navigate(`/boards/${notif.boardId}`)
  }

  // Xoá (ẩn) 1 thông báo chung — chặn nổi bọt để không kích hoạt điều hướng của MenuItem
  const handleDismissGeneric = (event, notifId) => {
    event.stopPropagation()
    dispatch(deleteNotificationAPI(notifId))
  }

  // Gộp lời mời + thông báo chung, sắp xếp mới nhất lên đầu
  const mergedList = [
    ...(invitations || []),
    ...(inAppNotifications || [])
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  // Chuông sáng khi: có lời mời đang chờ (PENDING) HOẶC có thông báo in-app chưa đọc.
  // Cả 2 đều lấy từ redux (sống qua remount + được refetch) nên không bị mất chỉ vì đổi route.
  // Giữ newNotification để bật chấm tức thì khi có tin real-time đến.
  const hasPendingInvite = (invitations || []).some(
    i => i.boardInvitation?.status === BOARD_INVITATION_STATUS.PENDING
  )
  const hasDot = newNotification || hasPendingInvite || unreadCount > 0

  return (
    <Box>
      <Tooltip title="Notifications">
        <Badge
          color="warning"
          variant={hasDot ? 'dot' : 'none'}
          sx={{ cursor: 'pointer' }}
          id="basic-button-open-notification"
          aria-controls={open ? 'basic-notification-drop-down' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClickNotificationIcon}
        >
          <NotificationsNoneIcon sx={{
            color: (theme) => hasDot ? 'warning.light' : (theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b'),
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
            maxHeight: 480,
            '& .MuiList-root': { p: 0 }
          }
        }}
      >
        {/* Header: Mark all as read (chỉ hiện khi có thông báo chung chưa đọc) */}
        {unreadCount > 0 && (
          <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'flex-end', borderBottom: (theme) => theme.palette.mode === 'dark' ? '1px solid #30363d' : '1px solid #d0d7de' }}>
            <Button
              size="small"
              onClick={() => dispatch(markAllNotificationsReadAPI())}
              sx={{ textTransform: 'none', fontSize: '12px', fontWeight: 600, minWidth: 0, p: 0 }}
            >
              Mark all as read
            </Button>
          </Box>
        )}

        {mergedList.length === 0 && (
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

        {mergedList.map((item, index) => {
          const isInvitation = Boolean(item.boardInvitation)
          return (
            <div key={item._id || index} style={{ margin: 0, padding: 0 }}>
              <MenuItem
                onClick={!isInvitation ? () => handleClickGeneric(item) : undefined}
                sx={{
                  minWidth: 400,
                  maxWidth: 420,
                  p: 2,
                  whiteSpace: 'normal',
                  bgcolor: 'transparent',
                  cursor: isInvitation ? 'default' : 'pointer',
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                {isInvitation ? (
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* Icon lời mời */}
                    <Box sx={{ flexShrink: 0 }}>
                      <Box sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: (theme) => item.boardInvitation?.status === BOARD_INVITATION_STATUS.PENDING
                          ? (theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)')
                          : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
                        color: item.boardInvitation?.status === BOARD_INVITATION_STATUS.PENDING
                          ? '#3b82f6'
                          : (theme => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b'),
                        borderRadius: '50%', width: 40, height: 40
                      }}>
                        <GroupAddIcon fontSize="small" />
                      </Box>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{
                        fontSize: '13.5px', lineHeight: 1.4,
                        color: (theme) => item.boardInvitation?.status === BOARD_INVITATION_STATUS.PENDING
                          ? (theme.palette.mode === 'dark' ? '#e6edf3' : '#1d2125')
                          : (theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b')
                      }}>
                        <strong>{item?.inviter?.displayName || item?.inviter?.username || item?.inviter?.fullName}</strong> had invited you to join the board <strong>{item?.board?.title}</strong>
                      </Box>
                      <Typography variant="span" sx={{ fontSize: '11.5px', color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)', fontWeight: 500 }}>
                        {dayjs(item.createdAt).format('MMM D, YYYY h:mm A')}
                      </Typography>
                    </Box>

                    <Box sx={{ flexShrink: 0, width: '85px', display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                      {item.boardInvitation?.status === BOARD_INVITATION_STATUS.PENDING && (
                        <>
                          <Button
                            className="interceptor-loading"
                            variant="contained"
                            size="small"
                            sx={{ px: 2, py: 0.5, fontSize: '12px', fontWeight: 600, textTransform: 'none', borderRadius: '6px', color: '#ffffff', bgcolor: '#3b82f6', boxShadow: 'none', minWidth: '85px', '&:hover': { bgcolor: '#2563eb', boxShadow: 'none' } }}
                            onClick={() => updateBoardInvitation(BOARD_INVITATION_STATUS.ACCEPTED, item._id)}
                          >
                            Accept
                          </Button>
                          <Button
                            className="interceptor-loading"
                            variant="text"
                            size="small"
                            sx={{ px: 2, py: 0.5, fontSize: '12px', fontWeight: 600, textTransform: 'none', borderRadius: '6px', color: (theme) => theme.palette.mode === 'dark' ? '#f87171' : '#dc2626', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.08)' : 'rgba(220, 38, 38, 0.08)', minWidth: '85px', '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(220, 38, 38, 0.15)' } }}
                            onClick={() => updateBoardInvitation(BOARD_INVITATION_STATUS.REJECTED, item._id)}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {item.boardInvitation?.status === BOARD_INVITATION_STATUS.ACCEPTED && (
                        <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: (theme) => theme.palette.mode === 'dark' ? '#34d399' : '#059669', mt: 1 }}>Accepted</Typography>
                      )}
                      {item.boardInvitation?.status === BOARD_INVITATION_STATUS.REJECTED && (
                        <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: (theme) => theme.palette.mode === 'dark' ? '#f87171' : '#dc2626', mt: 1 }}>Declined</Typography>
                      )}
                    </Box>
                  </Box>
                ) : (
                  /* Thông báo chung (in-app) */
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flexShrink: 0 }}>
                      <Box sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: (theme) => !item.isRead
                          ? (theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)')
                          : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
                        color: !item.isRead ? '#3b82f6' : (theme => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b'),
                        borderRadius: '50%', width: 40, height: 40
                      }}>
                        {genericIconByType(item.type)}
                      </Box>
                    </Box>
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{
                        fontSize: '13.5px', lineHeight: 1.4,
                        fontWeight: item.isRead ? 400 : 500,
                        color: (theme) => item.isRead
                          ? (theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b')
                          : (theme.palette.mode === 'dark' ? '#e6edf3' : '#1d2125')
                      }}>
                        {item.message}
                      </Box>
                      <Typography variant="span" sx={{ fontSize: '11.5px', color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)', fontWeight: 500 }}>
                        {dayjs(item.createdAt).format('MMM D, YYYY h:mm A')}
                      </Typography>
                    </Box>
                    <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      {!item.isRead && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3b82f6' }} />
                      )}
                      <Tooltip title="Dismiss">
                        <IconButton
                          size="small"
                          onClick={(e) => handleDismissGeneric(e, item._id)}
                          sx={{
                            p: 0.25,
                            color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                            '&:hover': { color: (theme) => theme.palette.mode === 'dark' ? '#e2e8f0' : '#0f172a' }
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                )}
              </MenuItem>
              {index !== (mergedList.length - 1) && (
                <Divider sx={{ my: '0 !important', borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }} />
              )}
            </div>
          )
        })}
      </Menu>
    </Box>
  )
}

export default Notifications
