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
import { updateBoardDetailAPI } from '~/apis'
import { updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { cloneDeep } from 'lodash-es'

function ColumnMoveDialog({ isOpen, onClose, column, board }) {
  const dispatch = useDispatch()
  const [selectedPosition, setSelectedPosition] = useState(1)
  const [isMoving, setIsMoving] = useState(false)

  // Calculate current column position (1-based index) based on visual array to prevent out-of-sync bugs
  const currentColumnPosition = (() => {
    return (board?.columns?.findIndex(c => c._id === column?._id) || 0) + 1
  })()

  useEffect(() => {
    if (isOpen) {
      setSelectedPosition(currentColumnPosition)
    }
  }, [isOpen, currentColumnPosition])

  const handleExecuteMoveColumn = async () => {
    const targetIndex = selectedPosition - 1
    const oldColumnIndex = board?.columns?.findIndex(c => c._id === column?._id)

    if (oldColumnIndex === targetIndex) {
      toast.info('Column is already in this position!')
      onClose()
      return
    }

    setIsMoving(true)

    try {
      const nextBoard = cloneDeep(board)

      // 1. Remove column from old position
      const [movedColumn] = nextBoard.columns.splice(oldColumnIndex, 1)

      // 2. Insert into new position
      nextBoard.columns.splice(targetIndex, 0, movedColumn)
      
      // 3. Rebuild columnOrderIds to guarantee sync (healing any corrupted state)
      nextBoard.columnOrderIds = nextBoard.columns.map(c => c._id)

      // 3. Optimistic update Redux state immediately
      dispatch(updateCurrentActiveBoard(nextBoard))
      onClose()

      // 4. Call API to update board in background
      await updateBoardDetailAPI(board._id, {
        columnOrderIds: nextBoard.columnOrderIds
      })

      toast.success('Column moved successfully!')
    } catch (error) {
      console.error(error)
      toast.error('Failed to move column!')
    } finally {
      setIsMoving(false)
    }
  }

  const colCount = board?.columns?.length || 0
  const availablePositions = Array.from({ length: colCount }, (_, i) => i + 1)

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
        Move column
      </DialogTitle>

      <DialogContent sx={{ pt: '20px !important', pb: '16px !important' }}>
        <FormControl fullWidth size="small">
          <InputLabel
            id="move-column-position-label"
            sx={{
              fontSize: '14px',
              color: (theme) => theme.palette.mode === 'dark' ? '#768390' : 'text.secondary',
              '&.Mui-focused': { color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : 'text.primary' }
            }}
          >
            Position
          </InputLabel>
          <Select
            labelId="move-column-position-label"
            id="move-column-position-select"
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
              if (pos === 1) text = '1 (First)'
              else if (pos === availablePositions.length) text = `${pos} (Last)`

              return (
                <MenuItem key={pos} value={pos}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Typography variant="body2" sx={{ flexGrow: 1, fontSize: '14px' }}>{text}</Typography>
                    {pos === currentColumnPosition && (
                      <MyLocationIcon sx={{ fontSize: 16, color: '#539bf5' }} />
                    )}
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
          id="move-column-confirm-btn"
          variant="contained"
          size="small"
          disabled={selectedPosition === currentColumnPosition || isMoving}
          onClick={(e) => { e.stopPropagation(); handleExecuteMoveColumn() }}
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

export default ColumnMoveDialog
