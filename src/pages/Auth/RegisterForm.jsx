import { Link, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import GoogleIcon from '@mui/icons-material/Google'
import GitHubIcon from '@mui/icons-material/GitHub'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  FIELD_REQUIRED_MESSAGE,
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE,
  PASSWORD_CONFIRMATION_MESSAGE
} from '~/utils/validators'
import FieldErrorAlert from '~/components/Form/FieldErrorAlert'
import { registerUserAPI } from '~/apis'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { googleLoginUserAPI } from '~/redux/user/userSlice'
import { useGoogleLogin } from '@react-oauth/google'
import { API_ROOT } from '~/utils/constants'

function RegisterForm() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const submitRegister = (data) => {
    const { email, password } = data
    toast.promise(
      registerUserAPI({ email, password }),
      { pending: 'Registration is in progress...' },
    ).then(user => {
      navigate(`/login?registeredEmail=${user.email}`)
    }).catch(error => {
      console.log(error)
    })
  }

  // Google Login handler
  const handleGoogleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      try {
        const result = await dispatch(googleLoginUserAPI(tokenResponse.access_token)).unwrap()
        if (!result.error) {
          toast.success('Logged in with Google successfully!')
          navigate('/')
        }
      } catch (error) {
        toast.error(error?.message || 'Google login failed!')
      }
    },
    onError: () => {
      toast.error('Google login failed!')
    }
  })

  // GitHub Login handler
  const handleGitHubLogin = () => {
    const isDev = API_ROOT.includes('localhost')
    const redirectUri = isDev
      ? 'http://localhost:5173/login'
      : 'https://whip.cobweb.id.vn/login'

    // Sử dụng trực tiếp Client ID tương ứng với môi trường để tránh lỗi Vite không nhận biến môi trường
    const githubClientId = isDev ? 'Ov23lifKQ43LuBu5QwoX' : 'Ov23liZb9ZubWYOkBgJz'
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`
    
    window.location.href = githubAuthUrl
  }

  // Custom styles cho text field
  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      borderRadius: '12px',
      '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
        WebkitBackgroundClip: 'text !important',
        WebkitTextFillColor: (theme) => theme.palette.mode === 'dark' ? '#fff !important' : '#000 !important',
        transition: 'background-color 5000s ease-in-out 0s !important',
        boxShadow: 'inset 0 0 20px 20px transparent !important',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
        transition: 'all 0.2s ease'
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)'
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#58a6ff',
        borderWidth: '2px',
        boxShadow: '0 0 0 3px rgba(88,166,255,0.15)'
      }
    },
    '& .MuiInputLabel-root': {
      color: 'text.secondary',
      '&.Mui-focused': {
        color: '#58a6ff'
      }
    }
  }

  return (
    <Box sx={{
      width: '100%',
      maxWidth: '400px',
      mx: 'auto',
      px: 3
    }}>
      {/* Logo & Title */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Box
            component="img"
            src="/whip.svg"
            alt="Whip"
            sx={{ width: 32, height: 32 }}
          />
          <Typography sx={{
            fontSize: '1.5rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Whip
          </Typography>
        </Box>
        <Typography variant="h4" sx={{
          fontWeight: 700,
          fontSize: '1.75rem',
          color: 'text.primary',
          mb: 0.5
        }}>
          Create your account
        </Typography>
        <Typography sx={{
          color: 'text.secondary',
          fontSize: '0.95rem'
        }}>
          Start managing your projects for free
        </Typography>
      </Box>

      {/* Social Login Buttons */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{
            py: 1.2,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 500,
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
            color: 'text.primary',
            '&:hover': {
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'
            }
          }}
        >
          Google
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GitHubIcon />}
          onClick={handleGitHubLogin}
          sx={{
            py: 1.2,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 500,
            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
            color: 'text.primary',
            '&:hover': {
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'
            }
          }}
        >
          GitHub
        </Button>
      </Box>

      {/* Divider */}
      <Divider sx={{
        mb: 3,
        '&::before, &::after': {
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
        }
      }}>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', px: 1 }}>
          or continue with email
        </Typography>
      </Divider>

      {/* Register Form */}
      <form onSubmit={handleSubmit(submitRegister)}>
        <Box sx={{ mb: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Email"
            type="text"
            variant="outlined"
            error={!!errors['email']}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: 'text.secondary', fontSize: '20px' }} />
                </InputAdornment>
              )
            }}
            sx={textFieldSx}
            {...register('email', {
              required: FIELD_REQUIRED_MESSAGE,
              pattern: {
                value: EMAIL_RULE,
                message: EMAIL_RULE_MESSAGE
              }
            })}
          />
          <FieldErrorAlert errors={errors} fieldName="email" />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            error={!!errors['password']}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: '20px' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={textFieldSx}
            {...register('password', {
              required: FIELD_REQUIRED_MESSAGE,
              pattern: {
                value: PASSWORD_RULE,
                message: PASSWORD_RULE_MESSAGE
              }
            })}
          />
          <FieldErrorAlert errors={errors} fieldName="password" />
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            variant="outlined"
            error={!!errors['password_Confirmation']}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: 'text.secondary', fontSize: '20px' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={textFieldSx}
            {...register('password_Confirmation', {
              validate: (value, formValues) => {
                return value === formValues.password || PASSWORD_CONFIRMATION_MESSAGE
              }
            })}
          />
          <FieldErrorAlert errors={errors} fieldName="password_Confirmation" />
        </Box>

        {/* Register Button */}
        <Button
          className='interceptor-loading'
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.95rem',
            textTransform: 'none',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
              boxShadow: '0 6px 20px rgba(59,130,246,0.45)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Create account
        </Button>
      </form>

      {/* Login Link */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Typography
              component="span"
              sx={{
                color: '#58a6ff',
                fontWeight: 600,
                fontSize: '0.9rem',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Sign in
            </Typography>
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

export default RegisterForm
