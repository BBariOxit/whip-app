import { useLocation, Navigate, useSearchParams, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import SandboxBoard from './Sandbox/SandboxBoard'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, githubLoginUserAPI } from '~/redux/user/userSlice'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

function Auth() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isLogin = location.pathname === '/login'
  const isRegister = location.pathname === '/register'

  const currentUser = useSelector(selectCurrentUser)
  const [searchParams] = useSearchParams()
  const [isProcessingGitHub, setIsProcessingGitHub] = useState(false)

  // Xử lý GitHub OAuth callback - khi GitHub redirect về với ?code=xxx
  useEffect(() => {
    const code = searchParams.get('code')
    if (code && !currentUser && !isProcessingGitHub) {
      setIsProcessingGitHub(true)

      toast.promise(
        dispatch(githubLoginUserAPI(code)).unwrap(),
        { pending: 'Logging in with GitHub...' }
      ).then(res => {
        if (!res.error) {
          toast.success('Logged in with GitHub successfully!')
          const pendingRedirect = localStorage.getItem('redirectAfterLogin')
          if (pendingRedirect) {
            localStorage.removeItem('redirectAfterLogin')
            navigate(pendingRedirect, { replace: true })
          } else {
            navigate('/', { replace: true })
          }
        }
      }).catch((error) => {
        toast.error(error?.message || 'GitHub login failed!')
        // Xóa code khỏi URL để tránh retry
        navigate('/login', { replace: true })
      }).finally(() => {
        setIsProcessingGitHub(false)
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (currentUser) {
    const pendingRedirect = localStorage.getItem('redirectAfterLogin')
    if (pendingRedirect) {
      localStorage.removeItem('redirectAfterLogin')
      return <Navigate to={pendingRedirect} replace={true} />
    }
    return <Navigate to="/" replace={true} />
  }

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <ModeSelect />
      </Box>
      {/* LEFT SIDE - Form Area */}
      <Box sx={{
        width: { xs: '100%', md: '42%' },
        minWidth: { md: '440px' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0b0d10' : '#ffffff',
        borderRight: 'none',
        position: 'relative',
        overflow: 'hidden',
        py: 4,
        // Mesh gradient phía sau form
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          left: '-30%',
          width: '300px',
          height: '300px',
          background: (theme) => theme.palette.mode === 'dark'
            ? 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0,
          pointerEvents: 'none'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-10%',
          right: '-20%',
          width: '250px',
          height: '250px',
          background: (theme) => theme.palette.mode === 'dark'
            ? 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0,
          pointerEvents: 'none'
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
          {isProcessingGitHub ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 8 }}>
              <CircularProgress size={48} />
              <Typography sx={{ color: 'text.secondary' }}>Logging in with GitHub...</Typography>
            </Box>
          ) : (
            <>
              {isLogin && <LoginForm />}
              {isRegister && <RegisterForm />}
            </>
          )}
        </Box>
      </Box>

      {/* RIGHT SIDE - Sandbox Area */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0f1117' : '#f1f5f9',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        // Background subtle pattern
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: (theme) => theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 20% 80%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(59,130,246,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.03) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
          <SandboxBoard />
        </Box>
      </Box>
    </Box>
  )
}

export default Auth