import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import PasswordIcon from '@mui/icons-material/Password'
import LockResetIcon from '@mui/icons-material/LockReset'
import LockIcon from '@mui/icons-material/Lock'
import LogoutIcon from '@mui/icons-material/Logout'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined'
import { alpha } from '@mui/material/styles'

import { FIELD_REQUIRED_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useForm } from 'react-hook-form'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { updateUserAPI, logoutUserAPI } from '~/redux/user/userSlice'
import {
  SettingsContentShell,
  SettingsPageHeader,
  SettingsRow,
  SettingsSection
} from './SettingsComponents'
import { settingsFieldSx } from './settingsStyles'

const navItems = [
  { id: 'security-password', label: 'Password' },
  { id: 'security-sessions', label: 'Sessions' },
  { id: 'security-2fa', label: 'Two-step login' }
]

function SecurityTab() {
  const dispatch = useDispatch()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

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
        dispatch(updateUserAPI({ current_password, new_password })),
        { pending: 'Updating... ' }
      ).then(res => {
        if (!res.error) {
          toast.success('successfully! changed your password. Please login again!')
          dispatch(logoutUserAPI(false))
        }
      }).catch(() => {})

    }).catch(() => {})
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SettingsPageHeader
        title="Security & password"
        description="Manage your password, sessions, and account security."
      />

      <SettingsContentShell navItems={navItems}>
        <SettingsSection id="security-password" title="Password">
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
              You will be signed out after a successful password change.
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
                  type="password"
                  variant="outlined"
                  sx={settingsFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PasswordIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    )
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
                  type="password"
                  variant="outlined"
                  sx={settingsFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    )
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
                  type="password"
                  variant="outlined"
                  sx={settingsFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockResetIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    )
                  }}
                  {...register('new_password_confirmation', {
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
        </SettingsSection>

        <SettingsSection id="security-sessions" title="Sessions">
          <SettingsRow
            title="Current session"
            description="This browser is currently signed in to your Whip account."
          >
            <Chip
              icon={<DevicesOutlinedIcon />}
              label="Active now"
              color="success"
              variant="outlined"
              sx={{
                minWidth: 148,
                minHeight: 40,
                borderRadius: '999px',
                borderWidth: 2,
                fontWeight: 700,
                '& .MuiChip-label': { px: 1 }
              }}
            />
          </SettingsRow>

          <SettingsRow
            title="Other sessions"
            description="Sign out from other browsers and devices connected to this account."
            last
          >
            <Button variant="outlined" disabled sx={{ minHeight: 38, borderRadius: '8px' }}>
              Sign out all
            </Button>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="security-2fa" title="Two-step login">
          <SettingsRow
            title="Authenticator app"
            description="Add a second step when signing in to protect your account."
            last
          >
            <Button variant="outlined" disabled sx={{ minHeight: 38, borderRadius: '8px' }}>
              Set up
            </Button>
          </SettingsRow>
        </SettingsSection>
      </SettingsContentShell>
    </Box>
  )
}

export default SecurityTab
