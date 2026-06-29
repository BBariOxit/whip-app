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
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'

function InviteBoardUser({ boardId, boardMembers = [], workspaceMembers = [] }) {
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
      setValue('inviteeEmail', null)
      setAnchorPopoverElement(null)
      socketIoInstance.emit('FE_USER_INVITED_TO_BOARD', invitation)
    })
  }

  const handleInviteSuggestedUser = (email) => {
    setValue('inviteeEmail', email)
    handleSubmit(submitInviteUserToBoard)()
  }

  // Lọc ra những người có trong workspace nhưng CHƯA CÓ trong board
  const suggestedUsersToInvite = workspaceMembers?.filter(
    (wspMember) => !boardMembers.some((bMemberId) => bMemberId.toString() === wspMember._id.toString())
  ) || []

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
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#ffffff',
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'divider',
            borderWidth: '2px',
            '&:hover': { 
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)', 
              borderWidth: '2px',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#ffffff'
            }
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

            {/* HIỂN THỊ SUGGESTED USERS TỪ WORKSPACE */}
            {suggestedUsersToInvite.length > 0 && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                  Suggested from Workspace
                </Typography>
                <List sx={{ pt: 0, pb: 0, maxHeight: 200, overflow: 'auto' }}>
                  {suggestedUsersToInvite.map((user) => (
                    <ListItem 
                      key={user._id} 
                      disableGutters 
                      sx={{ py: 0.5 }}
                    >
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Avatar sx={{ width: 30, height: 30 }} src={user.avatar} alt={user.displayName} />
                      </ListItemAvatar>
                      <ListItemText 
                        primary={user.displayName} 
                        secondary={user.email} 
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                        sx={{ my: 0 }}
                      />
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => handleInviteSuggestedUser(user.email)}
                        sx={{ textTransform: 'none', px: 1, minWidth: 'auto', height: 28 }}
                      >
                        Add
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Box>
        </form>
      </Popover>
    </Box>
  )
}

export default InviteBoardUser
