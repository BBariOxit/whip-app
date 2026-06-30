import { useState } from 'react'
import { Modal, Box, Typography, TextField, Button, CircularProgress, Select, MenuItem, InputLabel, FormControl } from '@mui/material'
import { inviteWorkspaceMemberAPI } from '~/apis'
import { toast } from 'sonner'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#ffffff',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
  border: '1px solid',
  borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de',
}

export const InviteWorkspaceMemberModal = ({ open, handleClose, workspaceId, onMemberInvited }) => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      await inviteWorkspaceMemberAPI(workspaceId, { inviteeEmail: email, role })
      if (onMemberInvited) {
        onMemberInvited() // callback to refresh member list
      }
      handleClose()
      setEmail('')
      setRole('member')
    } catch (error) {
      // error is handled in interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="invite-workspace-member-modal-title"
    >
      <Box sx={style}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography id="invite-workspace-member-modal-title" variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Invite to Workspace
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            autoFocus
          />
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="member">Member</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button 
              onClick={handleClose} 
              variant="outlined" 
              color="inherit"
              sx={{ 
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#d0d7de',
                '&:hover': { 
                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                  boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 0 0 1px rgba(255,255,255,0.3)' : '0 0 0 1px rgba(0,0,0,0.3)'
                } 
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading || !email.trim()}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              Send Invite
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  )
}
