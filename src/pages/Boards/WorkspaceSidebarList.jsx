import { Box, Typography, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Avatar } from '@mui/material'
import AddBoxIcon from '@mui/icons-material/AddBox'

export const WorkspaceSidebarList = ({ workspaces, currentWorkspaceId, onSelectWorkspace, onOpenCreateModal }) => {
  
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
              selected={isSelected}
              onClick={() => onSelectWorkspace(wsp._id, wsp.title)}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                bgcolor: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' }
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
                  color: isSelected ? '#fff' : '#c9d1d9',
                  sx: {
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }} 
              />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )
}
