import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import PasswordIcon from '@mui/icons-material/Password'
import LockResetIcon from '@mui/icons-material/LockReset'
import LockIcon from '@mui/icons-material/Lock'
import LogoutIcon from '@mui/icons-material/Logout'

import { FIELD_REQUIRED_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { useForm } from 'react-hook-form'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { updateUserAPI, logoutUserAPI } from '~/redux/user/userSlice'

function SecurityTab() {
  const dispatch = useDispatch()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  // Ôn lại: https://www.npmjs.com/package/material-ui-confirm
  const confirmChangePassword = useConfirm()
  const submitChangePassword = (data) => {
    confirmChangePassword({
      // Title, Description, Content...vv của gói material-ui-confirm đều có type là ReactNode nên có thể thoải sử dụng MUI components, rất tiện lợi khi cần custom styles
      title: <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LogoutIcon sx={{ color: 'warning.dark' }} /> Change Password
      </Box>,
      description: 'You have to login again after successfully changing your password. Continue?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    }).then(() => {
      const { current_password, new_password } = data
      
      // Gọi API...
      toast.promise(
        dispatch(updateUserAPI({ current_password, new_password })),
        { pending: 'Updating... ' },
      ).then(res => {
        // Đoạn này phải kiểm tra không có lỗi (update thành công) thì mới thực hiện các hành động cần thiết
        if (!res.error) {
          toast.success('successfully! changed your password. Please login again!')
          dispatch(logoutUserAPI(false))
        }
      }).catch(error => {
        console.log(error)
      })

    }).catch(() => {})
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* TIÊU ĐỀ TRANG KHU VỰC */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#24292f', mb: 0.5 }}>Change password</Typography>
        <Typography sx={{ fontSize: '14px', color: '#768390' }}>Manage your password and security settings.</Typography>
        <Divider sx={{ borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de', mt: 2 }} />
      </Box>

      {/* KHỐI FORM THAY ĐỔI MẬT KHẨU */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '450px' }}>
        <form onSubmit={handleSubmit(submitChangePassword)} style={{ width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#171b22' : '#f6f8fa' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PasswordIcon fontSize="small" sx={{ color: '#768390' }} />
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
                label="New Password"
                type="password"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#171b22' : '#f6f8fa' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" sx={{ color: '#768390' }} />
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
                label="New Password Confirmation"
                type="password"
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#171b22' : '#f6f8fa' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockResetIcon fontSize="small" sx={{ color: '#768390' }} />
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

            <Box sx={{ mt: 1 }}>
              <Button
                className="interceptor-loading"
                type="submit"
                variant="contained"
                sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, px: 3, py: 1, fontWeight: 600, textTransform: 'none' }}
              >
                Change password
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  )
}

export default SecurityTab
