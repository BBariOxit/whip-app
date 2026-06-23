import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { toast } from 'sonner'
import { moveCardAPI } from '~/apis'
import { moveCardOptimistic } from '~/redux/activeBoard/activeBoardSlice'
import { clearAndHideCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'

function CardMoveDialog({ isOpen, onClose, card, board, isActiveCardModal = false }) {
  const dispatch = useDispatch()
  const [selectedColumnId, setSelectedColumnId] = useState('')
  const [selectedPosition, setSelectedPosition] = useState(1)
  const [isMoving, setIsMoving] = useState(false)

  // Vị trí hiện tại của Card để disable nút Move và hiển thị indicator "current"
  const currentCardPosition = (() => {
    const prevColumn = board?.columns?.find(c => c._id === card?.columnId)
    return (prevColumn?.cardOrderIds?.indexOf(card?._id) || 0) + 1
  })()

  useEffect(() => {
    if (isOpen) {
      setSelectedColumnId(card?.columnId)
      setSelectedPosition(currentCardPosition)
    }
  }, [isOpen, card?.columnId, currentCardPosition])

  const handleExecuteMove = async () => {
    const prevColumn = board?.columns?.find(c => c._id === card?.columnId)
    const currentPos = (prevColumn?.cardOrderIds?.indexOf(card?._id) || 0) + 1

    // Nếu người dùng không thay đổi Cột và Vị trí thì không làm gì
    if (!selectedColumnId || (selectedColumnId === card?.columnId && selectedPosition === currentPos)) return

    setIsMoving(true)
    const prevColumnId = card?.columnId
    const nextColumnId = selectedColumnId
    const targetIndex = selectedPosition - 1 

    try {
      const nextColumn = board?.columns?.find(c => c._id === nextColumnId)

      // 1. Tạo mảng cardOrderIds của cột cũ (loại bỏ thẻ hiện tại)
      const prevCardOrderIds = (prevColumn?.cardOrderIds || []).filter(id => id !== card?._id)
      
      // 2. Tạo mảng cardOrderIds của cột mới
      let nextCardOrderIds = []
      if (prevColumnId === nextColumnId) {
        // Nếu di chuyển trong cùng một cột, mảng đích chính là mảng cũ đã loại bỏ card
        nextCardOrderIds = [...prevCardOrderIds]
      } else {
        // Nếu di chuyển sang cột khác, base từ mảng của cột mới
        nextCardOrderIds = [...(nextColumn?.cardOrderIds || [])].filter(id => id !== card?._id)
      }

      // 3. Chèn cardId vào đúng vị trí do user chọn
      nextCardOrderIds.splice(targetIndex, 0, card?._id)

      // Optimistic update Redux state ngay lập tức
      dispatch(moveCardOptimistic({
        cardId: card?._id,
        prevColumnId,
        nextColumnId,
        targetIndex
      }))

      if (isActiveCardModal) {
        dispatch(clearAndHideCurrentActiveCard())
      }

      onClose()

      // Gọi API
      await moveCardAPI({
        cardId: card?._id,
        prevColumnId,
        prevCardOrderIds,
        nextColumnId,
        nextCardOrderIds
      })

      toast.success('Card moved successfully!')
    } catch (error) {
      toast.error('Failed to move card!')
    } finally {
      setIsMoving(false)
    }
  }

  const currentColumnForPositions = board?.columns?.find(c => c._id === selectedColumnId)
  const isSameColumn = selectedColumnId === card?.columnId
  const maxPosition = isSameColumn 
    ? (currentColumnForPositions?.cardOrderIds?.length || 0) 
    : (currentColumnForPositions?.cardOrderIds?.length || 0) + 1

  const availablePositions = Array.from({ length: maxPosition }, (_, i) => i + 1)

  return (
    <Dialog
      open={isOpen}
      onClose={(e) => { e?.stopPropagation(); onClose() }}
      onClick={(e) => e.stopPropagation()}
      sx={{ mt: -8 }}
      PaperProps={{
        sx: {
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#fff',
          backgroundImage: 'none',
          border: (theme) => theme.palette.mode === 'dark' ? '1px solid #373e47' : '1px solid #d0d7de',
          borderRadius: '10px',
          minWidth: 300,
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)'
        }
      }}
    >
      <DialogTitle sx={{
        pb: 1.5,
        fontWeight: 600,
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: (theme) => theme.palette.mode === 'dark' ? '#cdd9e5' : 'text.primary',
        borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#373e47' : '#d0d7de'}`
      }}>
        <DriveFileMoveOutlinedIcon sx={{ fontSize: 20, color: '#539bf5' }} />
        Move card
      </DialogTitle>

      <DialogContent sx={{ pt: '20px !important', pb: '16px !important' }}>
        <FormControl fullWidth size="small">
          <InputLabel
            id="move-card-column-label"
            sx={{
              fontSize: '14px',
              color: (theme) => theme.palette.mode === 'dark' ? '#768390' : 'text.secondary',
              '&.Mui-focused': { color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : 'text.primary' }
            }}
          >
            Column
          </InputLabel>
          <Select
            labelId="move-card-column-label"
            id="move-card-column-select"
            value={selectedColumnId}
            label="Column"
            onChange={(e) => setSelectedColumnId(e.target.value)}
            sx={{
              fontSize: '14px',
              color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : 'text.primary',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => theme.palette.mode === 'dark' ? '#373e47' : '#d0d7de'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => theme.palette.mode === 'dark' ? '#768390' : '#bbb'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => theme.palette.mode === 'dark' ? '#768390' : '#888'
              },
              '& .MuiSvgIcon-root': {
                color: '#539bf5'
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#fff',
                  border: (theme) => theme.palette.mode === 'dark' ? '1px solid #373e47' : '1px solid #d0d7de',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  borderRadius: '8px',
                  mt: 1,
                  maxHeight: 296, // ~8 items
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': { width: '4px' },
                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                  '&::-webkit-scrollbar-thumb': {
                    background: (theme) => theme.palette.mode === 'dark' ? '#373e47' : '#d0d7de',
                    borderRadius: '4px'
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: (theme) => theme.palette.mode === 'dark' ? '#768390' : '#bbb'
                  },
                  '& .MuiMenuItem-root': {
                    fontSize: '14px',
                    py: 1,
                    color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : 'text.primary',
                    '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#262c36' : '#f6f8fa' },
                    '&.Mui-selected': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2d333b' : '#f0f0f0' },
                    '&.Mui-selected:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#323a45' : '#e8e8e8' }
                  }
                }
              }
            }}
          >
            {board?.columns?.filter(col => col._id && !col.FE_PlaceholderCard).map(col => (
              <MenuItem key={col._id} value={col._id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Typography variant="body2" sx={{ flexGrow: 1, fontSize: '14px' }}>{col.title}</Typography>
                  {col._id === card?.columnId && (
                    <MyLocationIcon sx={{ fontSize: 16, color: '#539bf5' }} />
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Ô chọn Vị trí */}
        <FormControl fullWidth size="small" sx={{ mt: 2 }}>
          <InputLabel
            id="move-card-position-label"
            sx={{
              fontSize: '14px',
              color: (theme) => theme.palette.mode === 'dark' ? '#768390' : 'text.secondary',
              '&.Mui-focused': { color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : 'text.primary' }
            }}
          >
            Position
          </InputLabel>
          <Select
            labelId="move-card-position-label"
            id="move-card-position-select"
            value={selectedPosition}
            label="Position"
            onChange={(e) => setSelectedPosition(e.target.value)}
            sx={{
              fontSize: '14px',
              color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : 'text.primary',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => theme.palette.mode === 'dark' ? '#373e47' : '#d0d7de'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => theme.palette.mode === 'dark' ? '#768390' : '#bbb'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => theme.palette.mode === 'dark' ? '#768390' : '#888'
              },
              '& .MuiSvgIcon-root': {
                color: '#539bf5'
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#fff',
                  border: (theme) => theme.palette.mode === 'dark' ? '1px solid #373e47' : '1px solid #d0d7de',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  borderRadius: '8px',
                  mt: 1,
                  maxHeight: 250,
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': { width: '4px' },
                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                  '&::-webkit-scrollbar-thumb': {
                    background: (theme) => theme.palette.mode === 'dark' ? '#373e47' : '#d0d7de',
                    borderRadius: '4px'
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: (theme) => theme.palette.mode === 'dark' ? '#768390' : '#bbb'
                  },
                  '& .MuiMenuItem-root': {
                    fontSize: '14px',
                    py: 1,
                    color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : 'text.primary',
                    '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#262c36' : '#f6f8fa' },
                    '&.Mui-selected': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2d333b' : '#f0f0f0' },
                    '&.Mui-selected:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#323a45' : '#e8e8e8' }
                  }
                }
              }
            }}
          >
            {availablePositions.map(pos => {
              let text = pos
              if (pos === 1) text = 'Top'
              else if (pos === availablePositions.length) text = 'Bottom'

              return (
                <MenuItem key={pos} value={pos}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Typography variant="body2" sx={{ flexGrow: 1, fontSize: '14px' }}>{text}</Typography>
                  </Box>
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2, pt: 0.5, gap: 1 }}>
        <Button
          onClick={(e) => { e.stopPropagation(); onClose() }}
          size="small"
          sx={{
            fontSize: '14px',
            color: (theme) => theme.palette.mode === 'dark' ? '#768390' : 'text.secondary',
            '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#262c36' : '#f6f8fa' }
          }}
        >
          Cancel
        </Button>
        <Button
          id="move-card-confirm-btn"
          variant="contained"
          size="small"
          disabled={!selectedColumnId || (selectedColumnId === card?.columnId && selectedPosition === currentCardPosition) || isMoving}
          onClick={(e) => { e.stopPropagation(); handleExecuteMove() }}
          sx={{
            fontSize: '14px',
            bgcolor: 'primary.main',
            color: 'white',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: 'none'
            },
            '&:disabled': { opacity: 0.4 }
          }}
        >
          {isMoving ? 'Moving...' : 'Move'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CardMoveDialog
