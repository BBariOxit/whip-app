import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Popover from '@mui/material/Popover'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

function CardLayoutPopover({ anchorEl, handleClose, onUpdateCardLayout, anchorOrigin, transformOrigin, sxProps }) {

  const handleSelectLayout = (layout) => {
    onUpdateCardLayout(layout)
    handleClose()
  }

  const open = Boolean(anchorEl)
  const id = open ? 'card-layout-popover' : undefined

  return (
    <Popover
      id="card-layout-popover"
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      disableScrollLock={true}
      disableAutoFocus={true}
      disableEnforceFocus={true}
      transitionDuration={0}
      anchorOrigin={anchorOrigin || { vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={transformOrigin}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            borderRadius: '8px',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#fff',
            border: (theme) => theme.palette.mode === 'dark' ? '1px solid #373e47' : 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            ...sxProps
          }
        }
      }}
    >
      <Box sx={{ minWidth: 180 }}>
        <MenuList sx={{ p: 0 }}>
          <MenuItem onClick={() => handleSelectLayout('compact')} sx={{ py: 1, px: 2 }}>
            <ListItemText primary="Compact" secondary="Title only" primaryTypographyProps={{ fontSize: 14 }} secondaryTypographyProps={{ fontSize: 12 }} />
          </MenuItem>
          <MenuItem onClick={() => handleSelectLayout('standard')} sx={{ py: 1, px: 2 }}>
            <ListItemText primary="Standard" secondary="Title, labels, badges" primaryTypographyProps={{ fontSize: 14 }} secondaryTypographyProps={{ fontSize: 12 }} />
          </MenuItem>
          <MenuItem onClick={() => handleSelectLayout('detailed')} sx={{ py: 1, px: 2 }}>
            <ListItemText primary="Detailed" secondary="Cover, custom fields, etc." primaryTypographyProps={{ fontSize: 14 }} secondaryTypographyProps={{ fontSize: 12 }} />
          </MenuItem>
        </MenuList>
      </Box>
    </Popover>
  )
}

export default CardLayoutPopover
