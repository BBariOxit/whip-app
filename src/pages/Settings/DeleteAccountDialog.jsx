import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import { deleteAccountAPI, requestAccountDeletionAPI } from '~/apis'

const getErrorMessage = (error, fallback) => (
  error?.response?.data?.message || error?.message || fallback
)

function DeleteAccountDialog({ open, accountEmail, onClose, onDeleted }) {
  const [codeSent, setCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [confirmationEmail, setConfirmationEmail] = useState('')
  const [isRequestingCode, setIsRequestingCode] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!open) return
    setCodeSent(false)
    setVerificationCode('')
    setConfirmationEmail('')
    setErrorMessage('')
  }, [open])

  const handleClose = () => {
    if (isRequestingCode || isDeleting) return
    onClose()
  }

  const handleRequestCode = async () => {
    setIsRequestingCode(true)
    setErrorMessage('')
    try {
      await requestAccountDeletionAPI()
      setCodeSent(true)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Could not send the verification code.'))
    } finally {
      setIsRequestingCode(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setErrorMessage('')
    try {
      const result = await deleteAccountAPI({
        confirmation_email: confirmationEmail.trim(),
        verification_code: verificationCode.trim()
      })
      onDeleted(result)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Could not delete your account.'))
    } finally {
      setIsDeleting(false)
    }
  }

  const canDelete = (
    codeSent &&
    /^\d{6}$/.test(verificationCode.trim()) &&
    confirmationEmail.trim().toLowerCase() === accountEmail?.toLowerCase() &&
    !isDeleting
  )

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main', fontWeight: 800 }}>
        <DeleteForeverIcon />
        Permanently delete account
      </DialogTitle>

      <DialogContent>
        <Alert severity="error" variant="outlined" sx={{ mb: 2.5 }}>
          This cannot be undone. Whip will delete your profile and personal boards where you are the only owner.
        </Alert>

        <Box component="ul" sx={{ mt: 0, mb: 2.5, pl: 2.5, color: 'text.secondary' }}>
          <Typography component="li" variant="body2" sx={{ mb: 0.75 }}>
            You will be removed from shared boards and workspaces.
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.75 }}>
            Your comments and activity retained for collaboration will be anonymized.
          </Typography>
          <Typography component="li" variant="body2">
            Workspace owners must transfer ownership or delete their workspaces first.
          </Typography>
        </Box>

        {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
        {codeSent && (
          <Alert severity="success" sx={{ mb: 2 }}>
            A 6-digit code was sent to {accountEmail}. It expires in 15 minutes.
          </Alert>
        )}

        <Button
          variant="outlined"
          startIcon={<EmailOutlinedIcon />}
          onClick={handleRequestCode}
          disabled={isRequestingCode || isDeleting}
          sx={{ mb: 2.5 }}
        >
          {isRequestingCode ? 'Sending code...' : (codeSent ? 'Send a new code' : 'Email verification code')}
        </Button>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="6-digit verification code"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            disabled={!codeSent || isDeleting}
            inputProps={{ inputMode: 'numeric', autoComplete: 'one-time-code', maxLength: 6 }}
            fullWidth
          />
          <TextField
            label={`Type ${accountEmail} to confirm`}
            value={confirmationEmail}
            onChange={(event) => setConfirmationEmail(event.target.value)}
            disabled={!codeSent || isDeleting}
            autoComplete="off"
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} disabled={isDeleting || isRequestingCode}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteForeverIcon />}
          onClick={handleDelete}
          disabled={!canDelete}
        >
          {isDeleting ? 'Deleting account...' : 'Delete account permanently'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteAccountDialog
