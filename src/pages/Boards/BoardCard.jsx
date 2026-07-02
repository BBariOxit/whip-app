import { useState } from 'react'
import { Box, Card, CardActionArea, CardContent, Typography, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Checkbox, Button } from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { Link } from 'react-router-dom'
import { useConfirm } from 'material-ui-confirm'
import { deleteBoardAPI, updateBoardDetailAPI, joinBoardAPI } from '~/apis'
import { toast } from 'sonner'
import { BoardModalForm } from './create'

const GRADIENTS = [
  'linear-gradient(to right, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
  'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
  'linear-gradient(to right, #a8caba 0%, #5d4157 100%)',
  'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)'
]

export const BoardCard = ({ board, index, onBoardDeleted, onBoardUpdated, isBulkMode, isSelected, onSelect, canManage = true, currentUser }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const confirmDelete = useConfirm()

  const handleOpenMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
  }

  const handleCloseMenu = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setAnchorEl(null)
  }

  const handleDelete = () => {
    handleCloseMenu()
    confirmDelete({
      title: 'Delete Board',
      description: `You are about to permanently delete the board "${board.title}". Type "DELETE ${board.title}" to confirm.`,
      confirmationText: 'Delete',
      cancellationText: 'Cancel',
      confirmationKeyword: `DELETE ${board.title}`,
      buttonOrder: ['confirm', 'cancel'],
      confirmationButtonProps: { color: 'error', variant: 'contained' },
      dialogProps: { maxWidth: 'xs' },
      confirmationKeywordTextFieldProps: {
        autoFocus: true,
        variant: 'outlined',
        size: 'small',
        sx: { 
          mt: 2,
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)' },
            '&:hover fieldset': { borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }
          }
        }
      }
    }).then(async () => {
      // Call API
      await deleteBoardAPI(board._id)
      toast.success('Board deleted successfully!')
      if (onBoardDeleted) onBoardDeleted(board._id)
    }).catch(() => {
      // Cancelled
    })
  }

  const handleEdit = () => {
    handleCloseMenu()
    setIsEditModalOpen(true)
  }

  const handleUpdateBoard = async (updateData) => {
    try {
      const updatedBoard = await updateBoardDetailAPI(board._id, updateData)
      toast.success('Board updated successfully!')
      setIsEditModalOpen(false)
      if (onBoardUpdated) onBoardUpdated(updatedBoard)
    } catch (error) {
      toast.error('Failed to update board!')
    }
  }

  return (
    <>
      <Card sx={{ 
        width: '100%',
        height: '180px',
        borderRadius: '16px',
        boxShadow: (theme) => theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0,0,0,0.5)' 
          : '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: (theme) => theme.palette.mode === 'dark'
            ? '0 12px 28px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)'
            : '0 12px 28px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
          '& .more-options-btn': {
            opacity: 1
          }
        }
      }}>
        {/* NÚT 3 CHẤM */}
        {(canManage || (currentUser && board.ownerIds?.includes(currentUser._id))) && (
          <IconButton
            className="more-options-btn"
            onClick={handleOpenMenu}
            sx={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
              bgcolor: 'rgba(0, 0, 0, 0.3)',
              color: '#fff',
              zIndex: 10,
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.6)' }
            }}
            size="small"
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        )}

        {/* DROP DOWN MENU */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseMenu}
          disableScrollLock={true}
          disableAutoFocusItem={true}
          autoFocus={false}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          MenuListProps={{ sx: { py: 0 } }}
          sx={{
            '& .MuiPaper-root': {
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1f242c' : '#fff',
              border: (theme) => theme.palette.mode === 'dark' ? '1px solid #30363d' : 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              borderRadius: '8px'
            }
          }}
        >
          <MenuItem onClick={handleEdit}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Edit board</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'inherit' }}><DeleteIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Delete board</ListItemText>
          </MenuItem>
        </Menu>

        <CardActionArea 
          component={isBulkMode ? "div" : Link} 
          to={isBulkMode ? undefined : `/boards/${board._id}`}
          onClick={(e) => {
            if (isBulkMode) {
              e.preventDefault()
              if (onSelect) onSelect()
            }
          }}
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'stretch', 
            justifyContent: 'flex-start',
            cursor: 'pointer'
          }}
        >
          {/* BULK MODE CHECKBOX */}
          {isBulkMode && (
            <Checkbox
              checked={isSelected}
              onChange={(e) => {
                // handle onChange instead of onClick on checkbox
              }}
              sx={{ 
                position: 'absolute', 
                top: 8, 
                left: 8, 
                color: 'rgba(255, 255, 255, 0.7)',
                zIndex: 2,
                '&.Mui-checked': { color: '#58a6ff' },
                bgcolor: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                padding: '4px',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' }
              }}
            />
          )}

          <Box sx={{ 
            height: '100px', 
            background: board?.background ? 
              (board.background.type === 'gradient' ? `linear-gradient(135deg, ${board.background.color1} 0%, ${board.background.color2} 100%)` : board.background.color1)
              : GRADIENTS[index % GRADIENTS.length],
            position: 'relative',
            flexShrink: 0
          }}></Box>

          <CardContent sx={{ 
            p: 1.5, 
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            '&:last-child': { pb: 1.5 },
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e2125' : '#ffffff'
          }}>
            <Typography gutterBottom variant="h6" component="div" sx={{
              fontWeight: 700,
              fontSize: '1rem',
              mb: 0.5,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.2,
              minHeight: '2.4em'
            }}>
              {board?.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ 
                overflow: 'hidden', 
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.5,
                minHeight: '1.5em'
              }}>
              {board?.description || 'No description provided'}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>

      <BoardModalForm 
        isOpen={isEditModalOpen}
        handleClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateBoard}
        title="Edit board"
        submitText="Update Board"
        initialData={board}
      />
    </>
  )
}
