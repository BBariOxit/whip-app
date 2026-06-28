import { useState } from 'react'
import { Box, Typography, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem } from '@mui/material'
import AddBoxIcon from '@mui/icons-material/AddBox'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'

export const WorkspaceSidebarList = ({ workspaces, currentWorkspaceId, onSelectWorkspace, onOpenCreateModal, onOpenDeleteModal, onOpenRenameModal }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [activeWorkspace, setActiveWorkspace] = useState(null)

  const handleOpenMenu = (e, wsp) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
    setActiveWorkspace(wsp)
  }

  const handleCloseMenu = (e) => {
    if (e) e.stopPropagation()
    setAnchorEl(null)
    setActiveWorkspace(null)
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    if (activeWorkspace) {
      onOpenDeleteModal(activeWorkspace)
    }
    handleCloseMenu()
  }
  // Hàm tạo màu random cho Avatar dựa vào tên
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

  return (
    <Box sx={{ mt: 3 }}>
      {/* HEADER: Chữ WORKSPACES và nút Cộng */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#8b949e', letterSpacing: '0.5px' }}>
          WORKSPACES
        </Typography>
        <IconButton size="small" sx={{ color: '#8b949e' }} onClick={onOpenCreateModal}>
          <AddBoxIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* LIST CÁC WORKSPACE */}
      <List disablePadding>
        {workspaces.map((wsp) => {
          const firstLetter = wsp.title.charAt(0).toUpperCase()
          const isSelected = currentWorkspaceId === wsp._id

          return (
            <ListItemButton 
              key={wsp._id} 
              onClick={() => onSelectWorkspace(wsp._id, wsp.title)}
              sx={{
                borderRadius: '12px',
                px: 2,
                py: '10px',
                mb: 0.5,
                bgcolor: (theme) => isSelected ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)') : 'transparent',
                '& .action-menu': { display: isSelected ? 'flex' : 'none' },
                '&:hover .action-menu': { display: 'flex' },
                '&:hover': { bgcolor: (theme) => isSelected 
                  ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)') 
                  : (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)') 
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: '40px' }}>
                <Avatar 
                  variant="rounded" 
                  sx={{ 
                    width: 28, 
                    height: 28, 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    bgcolor: stringToColor(wsp.title),
                  }}
                >
                  {firstLetter}
                </Avatar>
              </ListItemIcon>
              <ListItemText 
                primary={wsp.title} 
                primaryTypographyProps={{ 
                  variant: 'body2', 
                  fontWeight: isSelected ? 'bold' : 'normal',
                  color: isSelected ? 'text.primary' : 'text.secondary',
                  sx: {
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    pr: 1 // Add a bit of padding before the icon
                  }
                }} 
              />

              <IconButton 
                className="action-menu"
                size="small"
                onClick={(e) => handleOpenMenu(e, wsp)}
                sx={{ 
                  color: '#8b949e',
                  flexShrink: 0,
                  width: '28px',
                  height: '28px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: -0.5 // slightly offset to the right but not flush
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </ListItemButton>
          )
        })}
      </List>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{ sx: { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#fff', borderRadius: '8px', minWidth: '150px' } }}
      >
        <MenuItem onClick={() => { onOpenRenameModal(activeWorkspace); handleCloseMenu(); }} sx={{ fontSize: '14px', py: 1, gap: 1 }}>
          <EditOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          Rename
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: '#f85149', fontSize: '14px', py: 1, gap: 1 }}>
          <DeleteOutlineIcon fontSize="small" />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  )
}
