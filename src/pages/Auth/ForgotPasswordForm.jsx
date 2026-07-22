import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { requestPasswordResetAPI } from '~/apis'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, FIELD_REQUIRED_MESSAGE } from '~/utils/validators'
import AuthFormShell from './AuthFormShell'

function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const submit = async ({ email }) => {
    try {
      await requestPasswordResetAPI(email)
      setSubmitted(true)
    } catch {
      // The shared HTTP interceptor displays the server error.
    }
  }

  return (
    <AuthFormShell title="Reset your password" description="We will email you a secure, one-time reset link.">
      {submitted ? (
        <Alert severity="success" sx={{ borderRadius: '12px' }}>
          If an active account exists for that email, a reset link has been sent. It expires in 15 minutes.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(submit)}>
          <TextField
            autoFocus
            fullWidth
            label="Email"
            error={!!errors.email}
            {...register('email', {
              required: FIELD_REQUIRED_MESSAGE,
              pattern: { value: EMAIL_RULE, message: EMAIL_RULE_MESSAGE }
            })}
          />
          <FieldErrorAlert errors={errors} fieldName="email" />
          <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={{ mt: 2, py: 1.25 }}>
            Send reset link
          </Button>
        </form>
      )}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Link to="/login">
          <Typography component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>Back to sign in</Typography>
        </Link>
      </Box>
    </AuthFormShell>
  )
}

export default ForgotPasswordForm
