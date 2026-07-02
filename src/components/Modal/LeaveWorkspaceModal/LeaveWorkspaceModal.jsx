import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Box } from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn'

export const LeaveWorkspaceModal = ({ isOpen, onClose, workspaceName, onConfirm }) => {
  const [inputText, setInputText] = useState('')
  const expectedText = `LEAVE ${workspaceName?.toUpperCase()}`
  const isMatch = inputText === expectedText

  const handleConfirm = () => {
    if (isMatch) {
      onConfirm()
      setInputText('')
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#f85149', fontWeight: 'bold' }}>
        <WarningAmberIcon /> Leave Workspace
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography mb={2}>
          You will lose all access to <strong>{workspaceName}</strong>.
        </Typography>

        <Box sx={{ 
          p: 2, borderRadius: 1, mb: 3, display: 'flex', gap: 1.5, alignItems: 'flex-start',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 234, 127, 0.1)' : '#fff8c4',
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 234, 127, 0.2)' : '#ffe58f'
        }}>
          <AssignmentReturnIcon sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffea7f' : '#d4b106', mt: 0.3 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffea7f' : '#d4b106', fontWeight: 'bold' }}>
              Automatic Asset Transfer:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Any <strong>Boards</strong> you own will automatically be transferred to the <strong>Workspace Owner</strong>.
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ color: 'text.secondary', mb: 2 }}>
          You are about to leave the workspace "{workspaceName}". Type "{expectedText}" to confirm.
        </Typography>

        <TextField
          fullWidth
          size="small"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          variant="contained" 
          color="error" 
          disabled={!isMatch} 
          onClick={handleConfirm}
        >
          Leave Workspace
        </Button>
      </DialogActions>
    </Dialog>
  )
}
