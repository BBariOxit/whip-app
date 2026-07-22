import { Box, Typography, TextField, Button, Avatar } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import SaveIcon from '@mui/icons-material/Save'
import { alpha } from '@mui/material/styles'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import VisuallyHiddenInput from '~/components/Form/VisuallyHiddenInput'
import { selectCurrentUser, updateUserAPI } from '~/redux/user/userSlice'
import { FIELD_REQUIRED_MESSAGE, singleFileValidator } from '~/utils/validators'
import {
  SettingsContentShell,
  SettingsPageHeader,
  SettingsSection
} from './SettingsComponents'
import { settingsFieldSx } from './settingsStyles'

const navItems = [
  { id: 'profile-details', label: 'Profile details' }
]

function AccountTab() {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)

  const initialGeneralForm = {
    displayName: currentUser?.displayName
  }
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialGeneralForm
  })

  const submitChangeGeneralInformation = (data) => {
    const { displayName } = data
    if (displayName === currentUser?.displayName) return

    const updateRequest = dispatch(updateUserAPI({ displayName })).unwrap()
    toast.promise(updateRequest, {
      loading: 'Updating...',
      success: 'User updated successfully!'
    })
    updateRequest.catch(() => {})
  }

  const uploadAvatar = (e) => {
    const error = singleFileValidator(e.target?.files[0])
    if (error) {
      toast.error(error)
      return
    }

    let reqData = new FormData()
    reqData.append('avatar', e.target?.files[0])

    const uploadRequest = dispatch(updateUserAPI(reqData)).unwrap()
    toast.promise(uploadRequest, {
      loading: 'Uploading...',
      success: 'Avatar uploaded successfully!'
    })
    uploadRequest.catch(() => {}).finally(() => {
      e.target.value = ''
    })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SettingsPageHeader
        title="Profile"
        description="Manage your profile and account information."
      />

      <SettingsContentShell navItems={navItems}>
        <SettingsSection id="profile-details" title="Profile details">
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 220px' },
            gap: { xs: 3, md: 4 },
            alignItems: 'start'
          }}>
            <Box sx={{ minWidth: 0 }}>
              <form onSubmit={handleSubmit(submitChangeGeneralInformation)} style={{ width: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    label="Username"
                    defaultValue={currentUser?.username}
                    fullWidth
                    disabled
                    sx={settingsFieldSx}
                  />

                  <TextField
                    label="Email address"
                    defaultValue={currentUser?.email}
                    disabled
                    fullWidth
                    sx={settingsFieldSx}
                  />

                  <Box>
                    <TextField
                      label="Display name"
                      fullWidth
                      inputProps={{ maxLength: 50 }}
                      sx={settingsFieldSx}
                      {...register('displayName', {
                        required: FIELD_REQUIRED_MESSAGE,
                        maxLength: { value: 50, message: 'Display Name cannot exceed 50 characters' }
                      })}
                      error={!!errors['displayName']}
                    />
                    <FieldErrorAlert errors={errors} fieldName={'displayName'} />
                  </Box>

                  <Box sx={{ pt: 0.5 }}>
                    <Button
                      className="interceptor-loading"
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon fontSize="small" />}
                      sx={{
                        minHeight: 42,
                        px: 2.5,
                        borderRadius: '8px',
                        boxShadow: 'none',
                        fontWeight: 700,
                        '&:hover': { boxShadow: 'none' }
                      }}
                    >
                      Update profile
                    </Button>
                  </Box>
                </Box>
              </form>
            </Box>

            <Box
              sx={(theme) => ({
                order: { xs: -1, md: 0 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'stretch' },
                gap: 2,
                p: 2,
                borderRadius: '8px',
                bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.035) : '#f8fafc',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? alpha('#fff', 0.08) : '#e2e8f0'
              })}
            >
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 750, color: 'text.primary', alignSelf: 'stretch' }}>
                Profile picture
              </Typography>

              <Box
                component="label"
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  alignSelf: 'center',
                  '&:hover .avatar-overlay': { opacity: 1 }
                }}
              >
                <Avatar
                  src={currentUser?.avatar}
                  sx={(theme) => ({
                    width: 148,
                    height: 148,
                    border: '3px solid',
                    borderColor: theme.palette.mode === 'dark' ? alpha('#fff', 0.16) : '#fff',
                    boxShadow: theme.palette.mode === 'dark' ? '0 18px 32px rgba(0, 0, 0, 0.28)' : '0 18px 32px rgba(15, 23, 42, 0.15)'
                  })}
                />
                <Box
                  className="avatar-overlay"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: 148,
                    height: 148,
                    borderRadius: '50%',
                    bgcolor: 'rgba(2, 6, 23, 0.66)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.75,
                    opacity: 0,
                    transition: 'opacity 0.18s ease',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 750
                  }}
                >
                  <CloudUploadIcon fontSize="small" />
                  Upload
                </Box>
                <VisuallyHiddenInput type="file" onChange={uploadAvatar} />
              </Box>

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon fontSize="small" />}
                sx={{
                  minHeight: 38,
                  borderRadius: '8px',
                  alignSelf: 'stretch'
                }}
              >
                Upload photo
                <VisuallyHiddenInput type="file" onChange={uploadAvatar} />
              </Button>
            </Box>
          </Box>
        </SettingsSection>
      </SettingsContentShell>
    </Box>
  )
}

export default AccountTab
