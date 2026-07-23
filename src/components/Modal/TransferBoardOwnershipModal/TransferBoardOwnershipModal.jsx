import { useEffect, useMemo, useState } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

const memberLabel = (member) => member.displayName || member.username || member.email || 'Board member'

const TransferBoardOwnershipModal = ({
  isOpen,
  onClose,
  boardTitle,
  members = [],
  onConfirm,
  isSubmitting = false
}) => {
  const [targetUserId, setTargetUserId] = useState('')
  const [confirmationText, setConfirmationText] = useState('')
  const expectedText = `TRANSFER ${boardTitle}`

  const eligibleMembers = useMemo(
    () => members.filter(member => member?._id && member.isActive !== false && !member._destroy),
    [members]
  )

  useEffect(() => {
    if (!isOpen) {
      setTargetUserId('')
      setConfirmationText('')
    }
  }, [isOpen])

  const canSubmit = Boolean(
    targetUserId &&
    confirmationText === expectedText &&
    !isSubmitting
  )

  const handleClose = () => {
    if (!isSubmitting) onClose()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main', fontWeight: 700 }}>
        <WarningAmberIcon />
        Transfer board ownership
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          The selected member will become the board owner. You will become a regular member and can leave the board afterward.
        </Typography>

        {eligibleMembers.length > 0 ? (
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="board-owner-select-label">New owner</InputLabel>
            <Select
              labelId="board-owner-select-label"
              value={targetUserId}
              label="New owner"
              onChange={(event) => setTargetUserId(event.target.value)}
              disabled={isSubmitting}
            >
              {eligibleMembers.map(member => (
                <MenuItem key={member._id} value={member._id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={member.avatar} sx={{ width: 24, height: 24 }}>
                      {memberLabel(member).charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{memberLabel(member)}</Typography>
                      {member.email && member.email !== memberLabel(member) && (
                        <Typography variant="caption" color="text.secondary">{member.email}</Typography>
                      )}
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Invite at least one active member to this board before transferring ownership.
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Type <strong>{expectedText}</strong> to confirm.
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={confirmationText}
          onChange={(event) => setConfirmationText(event.target.value)}
          disabled={isSubmitting || eligibleMembers.length === 0}
          autoComplete="off"
          inputProps={{ 'aria-label': 'Ownership transfer confirmation' }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={isSubmitting}>Cancel</Button>
        <Button
          onClick={() => onConfirm(targetUserId)}
          color="error"
          variant="contained"
          disabled={!canSubmit}
        >
          {isSubmitting ? 'Transferring...' : 'Transfer ownership'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TransferBoardOwnershipModal
