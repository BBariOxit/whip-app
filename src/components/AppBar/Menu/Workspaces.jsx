import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddBoxIcon from '@mui/icons-material/AddBox'
import { useNavigate } from 'react-router-dom'
import { fetchWorkspacesAPI } from '~/apis'
import { CreateWorkspaceModal } from '~/components/Modal/CreateWorkspaceModal/CreateWorkspaceModal'

const stringToColor = (string) => {
  let hash = 0
  for (let i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.slice(-2)
  }
  return color
}

function Workspaces() {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const [workspaces, setWorkspaces] = useState([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchWorkspacesAPI().then(res => setWorkspaces(res))
  }, [])

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleGoToWorkspace = (workspaceId) => {
    handleClose()
    navigate(`/boards?workspaceId=${workspaceId}`)
  }

  const handleWorkspaceCreated = (newWorkspace) => {
    setWorkspaces([newWorkspace, ...workspaces])
  }

  return (
    <Box>
      <Button
        sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#475569' }}
        id="basic-button-workspaces"
        aria-controls={open ? 'basic-menu-workspaces' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        Workspaces
      </Button>
      <Menu
        id="basic-menu-workspaces"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button-workspaces',
          sx: { py: 0 }
        }}
        PaperProps={{
          sx: { mt: 0.5, minWidth: 200, borderRadius: '8px' }
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, pt: 1, pb: 0.5, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: '600', color: 'text.secondary', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Your Workspaces
          </Typography>
        </Box>
        
        {workspaces.map(wsp => {
          const firstLetter = wsp.title.charAt(0).toUpperCase()
          return (
            <MenuItem key={wsp._id} onClick={() => handleGoToWorkspace(wsp._id)} sx={{ gap: 1.5, px: 2, py: 1 }}>
              <Avatar 
                variant="rounded" 
                sx={{ 
                  width: 28, 
                  height: 28, 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  bgcolor: stringToColor(wsp.title),
                  borderRadius: '6px'
                }}
              >
                {firstLetter}
              </Avatar>
              <ListItemText primaryTypographyProps={{ 
                fontSize: '14px', 
                fontWeight: 500,
                sx: {
                  display: 'block',
                  maxWidth: '140px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              }}>
                {wsp.title}
              </ListItemText>
            </MenuItem>
          )
        })}

        <Divider sx={{ my: 0.5 }} />
        
        <MenuItem onClick={() => {
          handleClose()
          setIsCreateModalOpen(true)
        }} sx={{ gap: 1.5, px: 2, py: 1 }}>
          <Box sx={{ 
            width: 28, 
            height: 28, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'text.secondary'
          }}>
            <AddBoxIcon fontSize="medium" />
          </Box>
          <ListItemText primaryTypographyProps={{ fontSize: '14px', fontWeight: 500 }}>
            Create Workspace
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal 
        open={isCreateModalOpen} 
        handleClose={() => setIsCreateModalOpen(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </Box>
  )
}

export default Workspaces