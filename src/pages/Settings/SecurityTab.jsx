import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import PasswordIcon from '@mui/icons-material/Password'
import LockResetIcon from '@mui/icons-material/LockReset'
import LockIcon from '@mui/icons-material/Lock'
import LogoutIcon from '@mui/icons-material/Logout'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { alpha } from '@mui/material/styles'

import { FIELD_REQUIRED_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { changePasswordAPI, selectCurrentUser } from '~/redux/user/userSlice'
import { requestPasswordResetAPI } from '~/apis'
import {
  SettingsContentShell,
  SettingsPageHeader,
  SettingsSection
} from './SettingsComponents'
import { settingsFieldSx } from './settingsStyles'

const navItems = [
  { id: 'security-password', label: 'Password' }
]

const getLoginProviderLabel = (loginType) => {
  if (loginType === 'github') return 'GitHub'
  if (loginType === 'google') return 'Google'
  return 'an external provider'
}

const PasswordVisibilityButton = ({ visible, onToggle, label }) => (
  <InputAdornment position="end">
    <IconButton onClick={onToggle} edge="end" size="small" aria-label={`${visible ? 'Hide' : 'Show'} ${label}`}>
      {visible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
    </IconButton>
  </InputAdornment>
)

function SecurityTab() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const [visibleFields, setVisibleFields] = useState({ current: false, next: false, confirmation: false })
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const toggleVisibility = (field) => () => {
    setVisibleFields(previous => ({ ...previous, [field]: !previous[field] }))
  }

  const confirmChangePassword = useConfirm()
  const submitChangePassword = (data) => {
    confirmChangePassword({
      title: <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LogoutIcon sx={{ color: 'warning.dark' }} /> Change Password
      </Box>,
      description: 'You have to login again after successfully changing your password. Continue?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    }).then(() => {
      const { current_password, new_password } = data

      toast.promise(
        dispatch(changePasswordAPI({ current_password, new_password })).unwrap(),
        { pending: 'Updating... ' }
      ).then(() => {
        toast.success('Password changed. Please sign in again.')
      }).catch(() => {})

    }).catch(() => {})
  }

  const requestPasswordSetup = () => {
    toast.promise(
      requestPasswordResetAPI(currentUser.email),
      {
        pending: 'Sending password setup email...',
        success: 'Check your email for a password setup link.'
      }
    ).catch(() => {})
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SettingsPageHeader
        title="Security & password"
        description="Manage password access to your account."
      />

      <SettingsContentShell navItems={navItems}>
        <SettingsSection id="security-password" title="Password">
          {currentUser?.hasPassword ? (
            <>
              <Box
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 2,
                  mx: { xs: 1, sm: 2 },
                  mb: 3,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  bgcolor: theme.palette.mode === 'dark' ? '#161b22' : '#f8fafc'
                })}
              >
                <Box
                  sx={(theme) => ({
                    width: 34,
                    height: 34,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.12)
                  })}
                >
                  <ShieldOutlinedIcon fontSize="small" />
                </Box>
                <Box sx={{ minWidth: 0, color: 'text.secondary', fontSize: '0.875rem' }}>
                  Changing your password signs you out on every device.
                </Box>
              </Box>

              <form onSubmit={handleSubmit(submitChangePassword)} style={{ width: '100%' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2.5,
                    width: '100%',
                    px: { xs: 1, sm: 2 }
                  }}
                >
                  <Box>
                    <TextField
                      fullWidth
                      label="Current password"
                      type={visibleFields.current ? 'text' : 'password'}
                      variant="outlined"
                      sx={settingsFieldSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PasswordIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: <PasswordVisibilityButton visible={visibleFields.current} onToggle={toggleVisibility('current')} label="current password" />
                      }}
                      {...register('current_password', {
                        required: FIELD_REQUIRED_MESSAGE,
                        pattern: {
                          value: PASSWORD_RULE,
                          message: PASSWORD_RULE_MESSAGE
                        }
                      })}
                      error={!!errors['current_password']}
                    />
                    <FieldErrorAlert errors={errors} fieldName={'current_password'} />
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      label="New password"
                      type={visibleFields.next ? 'text' : 'password'}
                      variant="outlined"
                      sx={settingsFieldSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: <PasswordVisibilityButton visible={visibleFields.next} onToggle={toggleVisibility('next')} label="new password" />
                      }}
                      {...register('new_password', {
                        required: FIELD_REQUIRED_MESSAGE,
                        pattern: {
                          value: PASSWORD_RULE,
                          message: PASSWORD_RULE_MESSAGE
                        }
                      })}
                      error={!!errors['new_password']}
                    />
                    <FieldErrorAlert errors={errors} fieldName={'new_password'} />
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      label="Confirm new password"
                      type={visibleFields.confirmation ? 'text' : 'password'}
                      variant="outlined"
                      sx={settingsFieldSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockResetIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                        endAdornment: <PasswordVisibilityButton visible={visibleFields.confirmation} onToggle={toggleVisibility('confirmation')} label="password confirmation" />
                      }}
                      {...register('new_password_confirmation', {
                        required: FIELD_REQUIRED_MESSAGE,
                        validate: (value) => {
                          if (value === watch('new_password')) return true
                          return 'Password confirmation does not match.'
                        }
                      })}
                      error={!!errors['new_password_confirmation']}
                    />
                    <FieldErrorAlert errors={errors} fieldName={'new_password_confirmation'} />
                  </Box>

                  <Box sx={{ pt: 0.5 }}>
                    <Button
                      className="interceptor-loading"
                      type="submit"
                      variant="contained"
                      startIcon={<LockResetIcon fontSize="small" />}
                      sx={{
                        minHeight: 42,
                        px: 2.5,
                        borderRadius: '8px',
                        boxShadow: 'none',
                        fontWeight: 700,
                        '&:hover': { boxShadow: 'none' }
                      }}
                    >
                      Change password
                    </Button>
                  </Box>
                </Box>
              </form>
            </>
          ) : (
            <Alert severity="info" variant="outlined" sx={{ mx: { xs: 1, sm: 2 } }}>
              This account signs in with {getLoginProviderLabel(currentUser?.loginType)} and does not have a Whip password.
              <Button onClick={requestPasswordSetup} size="small" sx={{ display: 'block', mt: 1, px: 0 }}>
                Email me a password setup link
              </Button>
            </Alert>
          )}
        </SettingsSection>
      </SettingsContentShell>
    </Box>
  )
}

export default SecurityTab
