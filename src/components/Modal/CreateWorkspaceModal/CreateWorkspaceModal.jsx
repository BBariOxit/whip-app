import { useState } from 'react'
import { Modal, Box, Typography, TextField, Button, CircularProgress } from '@mui/material'
import { createWorkspaceAPI } from '~/apis'
import { toast } from 'sonner'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 440,
  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#22272e' : '#fff',
  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? '#30363d' : '#e1e4e8'}`,
  boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
  p: 3.5,
  borderRadius: '14px',
  outline: 'none'
}

export const CreateWorkspaceModal = ({ open, handleClose, onWorkspaceCreated }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Please enter a workspace name')
      return
    }

    setLoading(true)
    try {
      const newWorkspace = await createWorkspaceAPI({ title, description })
      onWorkspaceCreated(newWorkspace)
      handleClose()
      setTitle('')
      setDescription('')
    } catch (error) {
      // error is handled in interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="create-workspace-modal-title"
    >
      <Box sx={style}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography id="create-workspace-modal-title" variant="h6" component="h2" sx={{ fontWeight: 700 }}>
              Create Workspace
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Group your boards and invite members to collaborate.
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: 'text.secondary',
              mt: '-4px',
              mr: '-4px',
              '&:hover': {
                color: 'text.primary',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Workspace Name"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            inputProps={{ maxLength: 30 }}
            sx={{ mb: 2 }}
            autoFocus
          />
          <TextField
            fullWidth
            label="Description (optional)"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              color="inherit"
              sx={{
                px: 2.5,
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#d0d7de',
                '&:hover': {
                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                  boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 0 0 1px rgba(255,255,255,0.3)' : '0 0 0 1px rgba(0,0,0,0.3)'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !title.trim()}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{
                px: 3,
                fontWeight: 600,
                boxShadow: 'none',
                bgcolor: '#3b82f6',
                '&:hover': { bgcolor: '#2563eb', boxShadow: 'none' }
              }}
            >
              Create
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  )
}
