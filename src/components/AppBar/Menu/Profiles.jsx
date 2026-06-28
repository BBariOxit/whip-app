import Logout from '@mui/icons-material/Logout'
import PersonAdd from '@mui/icons-material/PersonAdd'
import Settings from '@mui/icons-material/Settings'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import React from 'react'
import avatar from '~/assets/avatar.png'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, logoutUserAPI } from '~/redux/user/userSlice'
import { useConfirm } from 'material-ui-confirm'
import { Link } from 'react-router-dom'

function Profiles() {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  const confirmLogout = useConfirm()
  const handleLogout = () => {
    confirmLogout({
      title: 'Log out of your account?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    }).then(() => {
      // thực hiện gọi api logout
      dispatch(logoutUserAPI())
    }).catch(() => {})
  }

  return (
    <Box>
      <Tooltip title="Account settings">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ p: 0 }}
          aria-controls={open ? 'basic-menu-profiles' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar
            sx={{ width: 34, height: 34, border: '3px solid white' }}
            alt='phan bao'
            src={currentUser?.avatar}
          />
        </IconButton>
      </Tooltip>
      <Menu
        id="basic-menu-profiles"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        disableScrollLock={true}
        disableAutoFocusItem={true}
        autoFocus={false}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{
          'aria-labelledby': 'basic-button-profiles',
          sx: { py: 1 }
        }}
        sx={{
          '& .MuiPaper-root': {
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1f242c' : '#fff',
            border: (theme) => theme.palette.mode === 'dark' ? '1px solid #30363d' : 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            borderRadius: '10px',
            mt: 1,
            minWidth: 200
          }
        }}
      >
        <MenuItem 
          component={Link} 
          to='/settings/account' 
          sx={{ color: 'inherit', mb: 1, '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}
        >
          <Avatar src={currentUser?.avatar} sx={{ width: 32, height: 32, mr: 1.5 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ fontWeight: 600, fontSize: '14px' }}>{currentUser?.displayName || 'Profile'}</Box>
            {currentUser?.username && <Box sx={{ fontSize: '12px', color: '#768390' }}>@{currentUser?.username}</Box>}
          </Box>
        </MenuItem>

        <Divider sx={{ my: 1, borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }} />

        <MenuItem sx={{ '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}>
          <ListItemIcon>
            <PersonAdd fontSize="small" sx={{ color: 'inherit' }} />
          </ListItemIcon>
          Add another account
        </MenuItem>
        
        <MenuItem 
          component={Link} 
          to='/settings/account' 
          sx={{ color: 'inherit', '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}
        >
          <ListItemIcon>
            <Settings fontSize="small" sx={{ color: 'inherit' }} />
          </ListItemIcon>
          Settings
        </MenuItem>

        <Divider sx={{ my: 1, borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }} />

        <MenuItem onClick={handleLogout} sx={{
          color: 'error.main',
          '&:hover': { bgcolor: 'rgba(255,0,0,0.1)' }
        }}>
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default Profiles