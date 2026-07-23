import React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import BusinessIcon from '@mui/icons-material/Business'
import UploadFileIcon from '@mui/icons-material/UploadFile'

/**
 * Nút Create ở navbar: bấm ra dropdown chọn tạo Board hay Workspace.
 * Component chỉ lo phần UI dropdown, còn việc mở modal tạo được delegate ra ngoài qua props
 * để mỗi trang tự xử lý hậu-tạo phù hợp ngữ cảnh (trang boards refresh tại chỗ, trong board thì điều hướng).
 */
function CreateMenu({ onCreateBoard, onCreateWorkspace, onImportWorkspace, onImportBoard }) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const handleOpen = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleSelectBoard = () => {
    handleClose()
    onCreateBoard?.()
  }

  const handleSelectWorkspace = () => {
    handleClose()
    onCreateWorkspace?.()
  }

  const handleSelectImport = () => {
    handleClose()
    onImportWorkspace?.()
  }

  const handleSelectImportBoard = () => {
    handleClose()
    onImportBoard?.()
  }

  return (
    <Box>
      <Button
        id="basic-button-create"
        aria-controls={open ? 'basic-menu-create' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleOpen}
        variant="outlined"
        startIcon={<LibraryAddIcon />}
        sx={{
          color: 'text.secondary',
          border: 'none',
          '&:hover': { border: 'none' }
        }}
      >
        Create
      </Button>

      <Menu
        id="basic-menu-create"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button-create', sx: { py: 0 } }}
        PaperProps={{ sx: { width: 240, borderRadius: '10px', mt: 1 } }}
      >
        <MenuItem onClick={handleSelectBoard} sx={{ py: 1.25, gap: 0.5 }}>
          <ListItemIcon><ViewColumnIcon fontSize="small" /></ListItemIcon>
          <ListItemText
            primary="Create board"
            secondary="Start a new board"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
            secondaryTypographyProps={{ fontSize: 12 }}
          />
        </MenuItem>
        {onImportBoard && (
          <MenuItem onClick={handleSelectImportBoard} sx={{ py: 1.25, gap: 0.5 }}>
            <ListItemIcon><UploadFileIcon fontSize="small" /></ListItemIcon>
            <ListItemText
              primary="Import board"
              secondary="Single board or personal archive"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
              secondaryTypographyProps={{ fontSize: 12 }}
            />
          </MenuItem>
        )}
        <MenuItem onClick={handleSelectWorkspace} sx={{ py: 1.25, gap: 0.5 }}>
          <ListItemIcon><BusinessIcon fontSize="small" /></ListItemIcon>
          <ListItemText
            primary="Create workspace"
            secondary="Group boards & members"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
            secondaryTypographyProps={{ fontSize: 12 }}
          />
        </MenuItem>
        {onImportWorkspace && (
          <MenuItem onClick={handleSelectImport} sx={{ py: 1.25, gap: 0.5 }}>
            <ListItemIcon><UploadFileIcon fontSize="small" /></ListItemIcon>
            <ListItemText
              primary="Import workspace"
              secondary="From a JSON file"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
              secondaryTypographyProps={{ fontSize: 12 }}
            />
          </MenuItem>
        )}
      </Menu>
    </Box>
  )
}

export default CreateMenu
