import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Popover from '@mui/material/Popover'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import CheckIcon from '@mui/icons-material/Check'

function CardLayoutPopover({ anchorEl, handleClose, activeCard, onUpdateCardLayout }) {
  const currentLayout = activeCard?.layout || 'detailed'

  const handleSelectLayout = (layout) => {
    onUpdateCardLayout(layout)
    handleClose()
  }

  const open = Boolean(anchorEl)
  const id = open ? 'card-layout-popover' : undefined

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            borderRadius: '8px',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#282e33' : '#fff',
            border: (theme) => theme.palette.mode === 'dark' ? '1px solid #30363d' : 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }
        }
      }}
    >
      <Box sx={{ width: 230 }}>
        <MenuList sx={{ p: 0 }}>
          <MenuItem onClick={() => handleSelectLayout('compact')} sx={{ py: 1, pl: 2, pr: 4, display: 'flex', alignItems: 'center', position: 'relative' }}>
            <ListItemText primary="Compact" secondary="Title only" primaryTypographyProps={{ fontSize: 14 }} secondaryTypographyProps={{ fontSize: 12 }} />
            {currentLayout === 'compact' && (
              <CheckIcon fontSize="small" color="primary" sx={{ stroke: 'currentColor', strokeWidth: 1, position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
            )}
          </MenuItem>
          <MenuItem onClick={() => handleSelectLayout('standard')} sx={{ py: 1, pl: 2, pr: 4, display: 'flex', alignItems: 'center', position: 'relative' }}>
            <ListItemText primary="Standard" secondary="Title, labels, badges" primaryTypographyProps={{ fontSize: 14 }} secondaryTypographyProps={{ fontSize: 12 }} />
            {currentLayout === 'standard' && (
              <CheckIcon fontSize="small" color="primary" sx={{ stroke: 'currentColor', strokeWidth: 1, position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
            )}
          </MenuItem>
          <MenuItem onClick={() => handleSelectLayout('detailed')} sx={{ py: 1, pl: 2, pr: 4, display: 'flex', alignItems: 'center', position: 'relative' }}>
            <ListItemText primary="Detailed" secondary="Cover, custom fields, etc." primaryTypographyProps={{ fontSize: 14 }} secondaryTypographyProps={{ fontSize: 12 }} />
            {currentLayout === 'detailed' && (
              <CheckIcon fontSize="small" color="primary" sx={{ stroke: 'currentColor', strokeWidth: 1, position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }} />
            )}
          </MenuItem>
        </MenuList>
      </Box>
    </Popover>
  )
}

export default CardLayoutPopover
