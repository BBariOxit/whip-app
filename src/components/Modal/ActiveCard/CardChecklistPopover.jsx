import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Popover from '@mui/material/Popover'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

function CardChecklistPopover({ anchorEl, handleClose, onAddChecklist }) {
  const [title, setTitle] = useState('Checklist')

  const handleAdd = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    onAddChecklist(trimmed)
    setTitle('Checklist')
    handleClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  const open = Boolean(anchorEl)
  const id = open ? 'checklist-popover' : undefined

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={() => {
        handleClose()
        setTitle('Checklist')
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Box sx={{ width: 300, p: 2 }}>
        <Typography sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
          Add checklist
        </Typography>
        <Typography sx={{ mb: 0.5, fontSize: 13, fontWeight: 600 }}>Title</Typography>
        <TextField
          fullWidth
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="info"
          fullWidth
          onClick={handleAdd}
          disabled={!title.trim()}
        >
          Add
        </Button>
      </Box>
    </Popover>
  )
}

export default CardChecklistPopover
