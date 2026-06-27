import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Popover from '@mui/material/Popover'
import Button from '@mui/material/Button'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import TextField from '@mui/material/TextField'
import { useForm } from 'react-hook-form'
import { EMAIL_RULE, FIELD_REQUIRED_MESSAGE, EMAIL_RULE_MESSAGE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { inviteUserToBoardAPI } from '~/apis'
import { socketIoInstance } from '~/socketClient'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { toast } from 'sonner'

function InviteBoardUser({ boardId }) {
  /**
   * Xử lý Popover để ẩn hoặc hiện một popup nhỏ, tương tự docs để tham khảo ở đây:
   * https://mui.com/material-ui/react-popover/
  */
  const [anchorPopoverElement, setAnchorPopoverElement] = useState(null)
  const isOpenPopover = Boolean(anchorPopoverElement)
  const popoverId = isOpenPopover ? 'invite-board-user-popover' : undefined
  const handleTogglePopover = (event) => {
    if (!anchorPopoverElement) setAnchorPopoverElement(event.currentTarget)
    else setAnchorPopoverElement(null)
  }

  const currentUser = useSelector(selectCurrentUser)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()
  const submitInviteUserToBoard = (data) => {
    const { inviteeEmail } = data
    if (inviteeEmail === currentUser?.email) {
      toast.error('You cannot invite yourself!', { id: 'error-invite-self' })
      return
    }
    // console.log('inviteeEmail:', inviteeEmail)
    // gọi api mời người dùng nào đó vào làm thành viên của board
    inviteUserToBoardAPI({ inviteeEmail, boardId }).then(invitation => {
      // Clear thẻ input sử dụng react-hook-form bằng setValue
      setValue('inviteeEmail', null)
      setAnchorPopoverElement(null)

      // Mời một người dùng vào board xong thì cũng sẽ gửi/emit sự kiện socket lên server (tính năng real-time)
      socketIoInstance.emit('FE_USER_INVITED_TO_BOARD', invitation)
    })

  }

  return (
    <Box>
      <Tooltip title="Invite user to this board!">
        <Button
          aria-describedby={popoverId}
          onClick={handleTogglePopover}
          variant="outlined"
          startIcon={<PersonAddIcon />}
          sx={{
            color: 'text.primary',
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'divider',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'transparent', boxShadow: (theme) => `0 0 0 1px ${theme.palette.primary.main}` }
          }}
        >
          Invite
        </Button>
      </Tooltip>

      {/* Khi Click vào butotn Invite ở trên thì sẽ mở popover */}
      <Popover
        id={popoverId}
        open={isOpenPopover}
        anchorEl={anchorPopoverElement}
        onClose={handleTogglePopover}
        disableScrollLock={true}
        disableAutoFocus={true}
        disableEnforceFocus={true}
        transitionDuration={0}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <form onSubmit={handleSubmit(submitInviteUserToBoard, (errors) => {
          if (errors.inviteeEmail) {
            toast.error(errors.inviteeEmail.message, { id: 'error-invitee-email' })
          }
        })} style={{ width: '320px' }}>
          <Box sx={{ p: '15px 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="span" sx={{ fontWeight: 'bold', fontSize: '16px' }}>Invite User To This Board!</Typography>
            <Box>
              <TextField
                autoFocus
                fullWidth
                label="Enter email to invite..."
                type="text"
                variant="outlined"
                {...register('inviteeEmail', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: { value: EMAIL_RULE, message: EMAIL_RULE_MESSAGE }
                })}
                sx={{
                  '& .MuiInputBase-input:-webkit-autofill, & .MuiInputBase-input:-webkit-autofill:hover, & .MuiInputBase-input:-webkit-autofill:focus, & .MuiInputBase-input:-webkit-autofill:active, & .MuiInputBase-input:-internal-autofill-previewed': {
                    transition: 'background-color 5000s ease-in-out 0s',
                    WebkitTextFillColor: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#000'
                  }
                }}
              />
            </Box>

            <Box sx={{ alignSelf: 'flex-end' }}>
              <Button
                className="interceptor-loading"
                type="submit"
                variant="contained"
                color="info"
              >
                Invite
              </Button>
            </Box>
          </Box>
        </form>
      </Popover>
    </Box>
  )
}

export default InviteBoardUser
