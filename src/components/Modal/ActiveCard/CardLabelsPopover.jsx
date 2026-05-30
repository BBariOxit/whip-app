import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentActive, addNewLabel } from '~/redux/activeBoard/activeBoardSlice'
import { createNewCardLabelAPI } from '~/apis'

const COLORS = ['#4bce97', '#e2b203', '#faa53d', '#f87462', '#9f8fef', '#579dff']

function CardLabelsPopover({ anchorEl, handleClose, activeCard, onUpdateCardLabels }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActive)
  const boardLabels = board?.labels || []
  const cardLabelIds = activeCard?.labelIds || []

  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])

  const toggleLabel = (labelId) => {
    let newLabelIds = [...cardLabelIds]
    if (newLabelIds.includes(labelId)) {
      newLabelIds = newLabelIds.filter(id => id !== labelId)
    } else {
      newLabelIds.push(labelId)
    }
    onUpdateCardLabels(newLabelIds)
  }

  const handleCreateLabel = async () => {
    if (!newColor) return
    const newLabelData = {
      boardId: board._id,
      title: newTitle.trim(),
      color: newColor
    }
    const createdLabel = await createNewCardLabelAPI(newLabelData)
    dispatch(addNewLabel(createdLabel))
    setIsCreating(false)
    setNewTitle('')
    setNewColor(COLORS[0])
  }

  const open = Boolean(anchorEl)
  const id = open ? 'labels-popover' : undefined

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={() => {
        handleClose()
        setIsCreating(false)
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Box sx={{ width: 300, p: 2 }}>
        {isCreating ? (
          <>
            <Typography sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>Create a label</Typography>
            <TextField
              fullWidth
              size="small"
              label="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 600 }}>Select a color</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {COLORS.map(c => (
                <Box
                  key={c}
                  onClick={() => setNewColor(c)}
                  sx={{
                    width: 40, height: 32, bgcolor: c, borderRadius: 1, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: newColor === c ? '2px solid #000' : 'none'
                  }}
                >
                  {newColor === c && <CheckIcon fontSize="small" sx={{ color: 'white' }} />}
                </Box>
              ))}
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="primary" fullWidth onClick={handleCreateLabel}>
                Create
              </Button>
              <Button variant="outlined" color="inherit" fullWidth onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Typography sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>Labels</Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {boardLabels.map(label => {
                const isChecked = cardLabelIds.includes(label._id)
                return (
                  <Box
                    key={label._id}
                    onClick={() => toggleLabel(label._id)}
                    sx={{
                      bgcolor: label.color,
                      minHeight: 32,
                      borderRadius: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1.5,
                      py: 0.5,
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': { opacity: 0.8 }
                    }}
                  >
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{label.title}</Typography>
                    {isChecked && <CheckIcon fontSize="small" />}
                  </Box>
                )
              })}
            </Stack>
            <Button variant="contained" color="inherit" fullWidth onClick={() => setIsCreating(true)} sx={{ boxShadow: 'none' }}>
              Create a new label
            </Button>
          </>
        )}
      </Box>
    </Popover>
  )
}

export default CardLabelsPopover
