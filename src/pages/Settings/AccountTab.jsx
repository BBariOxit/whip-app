import { Box, Typography, TextField, Button, Avatar, Divider } from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import VisuallyHiddenInput from '~/components/Form/VisuallyHiddenInput'
import { selectCurrentUser, updateUserAPI } from '~/redux/user/userSlice'
import { FIELD_REQUIRED_MESSAGE, singleFileValidator } from '~/utils/validators'

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

    toast.promise(
      dispatch(updateUserAPI({ displayName })),
      { pending: 'Updating... ' },
    ).then(res => {
      if (!res.error) {
        toast.success('User updated successfully!')
      }
    })
  }

  const uploadAvatar = (e) => {
    const error = singleFileValidator(e.target?.files[0])
    if (error) {
      toast.error(error)
      return
    }

    let reqData = new FormData()
    reqData.append('avatar', e.target?.files[0])

    toast.promise(
      dispatch(updateUserAPI(reqData)),
      { pending: 'Uploading... ' },
    ).then(res => {
      if (!res.error) {
        toast.success('Avatar uploaded successfully!')
      }
      e.target.value = ''
    })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* TIÊU ĐỀ TRANG KHU VỰC */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#24292f', mb: 0.5 }}>Public profile</Typography>
        <Typography sx={{ fontSize: '14px', color: '#768390' }}>Manage your public identity and account data.</Typography>
        <Divider sx={{ borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de', mt: 2 }} />
      </Box>

      {/* KHỐI LAYOUT CHỨA AVATAR VÀ FORM NẰM NGANG */}
      <Box sx={{ display: 'flex', gap: 5, alignItems: 'flex-start' }}>
        
        {/* CỘT NHẬP FORM TEXT (BÊN TRÁI TRONG KHỐI CHÍNH) */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <form onSubmit={handleSubmit(submitChangeGeneralInformation)} style={{ width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField 
                label="Username" 
                defaultValue={currentUser?.username} 
                fullWidth
                helperText={`Your profile URL: whip.cobweb.id.vn/u/${currentUser?.username}`}
                disabled
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#171b22' : '#f6f8fa' }, '& .MuiFormHelperText-root': { color: '#768390' } }}
              />

              <TextField 
                label="Email Address" 
                defaultValue={currentUser?.email} 
                disabled 
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#171b22' : '#f6f8fa' } }}
              />

              <Box>
                <TextField 
                  label="Display Name" 
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#171b22' : '#f6f8fa' } }}
                  {...register('displayName', {
                    required: FIELD_REQUIRED_MESSAGE
                  })}
                  error={!!errors['displayName']}
                />
                <FieldErrorAlert errors={errors} fieldName={'displayName'} />
              </Box>

              <Box sx={{ mt: 1 }}>
                <Button 
                  className="interceptor-loading"
                  type="submit" 
                  variant="contained" 
                  sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, px: 3, py: 1, fontWeight: 600, textTransform: 'none' }}
                >
                  Update profile
                </Button>
              </Box>
            </Box>
          </form>
        </Box>

        {/* CỘT AVATAR (BÊN PHẢI TRONG KHỐI CHÍNH) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, width: '200px' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 600, color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : '#57606a', width: '100%', textAlign: 'left' }}>Profile picture</Typography>
          
          {/* Khu vực Avatar Hover bọc lót tinh tế */}
          <Box 
            component="label"
            sx={{ 
              position: 'relative', 
              cursor: 'pointer', 
              borderRadius: '50%',
              '&:hover .avatar-overlay': { opacity: 1 } 
            }}
          >
            <Avatar src={currentUser?.avatar} sx={{ width: 140, height: 140, border: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }} />
            <Box className="avatar-overlay" sx={{ position: 'absolute', top: 0, left: 0, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, opacity: 0, transition: 'opacity 0.2s', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
              <CloudUploadIcon fontSize="small" />
              Edit
            </Box>
            <VisuallyHiddenInput type="file" onChange={uploadAvatar} />
          </Box>
        </Box>

      </Box>

    </Box>
  )
}

export default AccountTab
