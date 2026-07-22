import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useDispatch } from 'react-redux'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { resetPasswordAPI } from '~/apis'
import { clearCurrentUser } from '~/redux/user/userSlice'
import { FIELD_REQUIRED_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'
import AuthFormShell from './AuthFormShell'

function ResetPasswordForm() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()

  const submit = async ({ newPassword }) => {
    try {
      await resetPasswordAPI(token, newPassword)
      dispatch(clearCurrentUser())
      navigate('/login?passwordReset=true', { replace: true })
    } catch {
      // The shared HTTP interceptor displays invalid or expired link errors.
    }
  }

  return (
    <AuthFormShell title="Choose a new password" description="Use at least eight characters with a letter and a number.">
      {!token ? (
        <Alert severity="error">This password reset link is invalid.</Alert>
      ) : (
        <form onSubmit={handleSubmit(submit)}>
          <TextField
            autoFocus
            fullWidth
            label="New password"
            type={showPassword ? 'text' : 'password'}
            error={!!errors.newPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(value => !value)} edge="end" aria-label="Toggle password visibility">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            {...register('newPassword', {
              required: FIELD_REQUIRED_MESSAGE,
              pattern: { value: PASSWORD_RULE, message: PASSWORD_RULE_MESSAGE }
            })}
          />
          <FieldErrorAlert errors={errors} fieldName="newPassword" />

          <TextField
            fullWidth
            label="Confirm new password"
            type={showPassword ? 'text' : 'password'}
            error={!!errors.confirmPassword}
            sx={{ mt: 2 }}
            {...register('confirmPassword', {
              required: FIELD_REQUIRED_MESSAGE,
              validate: value => value === watch('newPassword') || 'Password confirmation does not match.'
            })}
          />
          <FieldErrorAlert errors={errors} fieldName="confirmPassword" />

          <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={{ mt: 2, py: 1.25 }}>
            Reset password
          </Button>
        </form>
      )}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Link to={token ? '/login' : '/forgot-password'}>
          <Typography component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
            {token ? 'Back to sign in' : 'Request a new link'}
          </Typography>
        </Link>
      </Box>
    </AuthFormShell>
  )
}

export default ResetPasswordForm
