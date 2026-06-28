import { useState } from 'react'
import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

export function DeleteWorkspaceModal({ isOpen, handleClose, workspaceToDelete, onSubmit }) {
  const [confirmText, setConfirmText] = useState('')

  const handleModalClose = () => {
    setConfirmText('')
    handleClose()
  }

  const handleDelete = () => {
    if (workspaceToDelete?.title === confirmText) {
      onSubmit(workspaceToDelete._id)
      setConfirmText('')
    }
  }

  return (
    <Modal open={isOpen} onClose={handleModalClose} onClick={(e) => e.stopPropagation()}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 450,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#fff',
        boxShadow: 24,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#e1e4e8',
        p: 3,
        outline: 'none'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, color: '#f85149' }}>
          <WarningAmberIcon fontSize="large" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Delete Workspace
          </Typography>
        </Box>

        <Typography sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#8b949e' : '#57606a', mb: 2, fontSize: '14px' }}>
          This action <strong>CANNOT</strong> be undone. This will permanently delete the <strong>{workspaceToDelete?.title}</strong> workspace, along with all of its Boards, Columns, and Cards.
        </Typography>

        <Typography sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#8b949e' : '#57606a', mb: 1, fontSize: '14px' }}>
          Please type <strong>{workspaceToDelete?.title}</strong> to confirm.
        </Typography>

        <TextField
          fullWidth
          size="small"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={workspaceToDelete?.title}
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={handleModalClose} sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#8b949e' : '#57606a' }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            disabled={confirmText !== workspaceToDelete?.title}
            onClick={handleDelete}
            sx={{ fontWeight: 'bold' }}
          >
            I understand, delete this workspace
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
