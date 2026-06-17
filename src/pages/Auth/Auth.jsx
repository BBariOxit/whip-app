import { useLocation, Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import SandboxBoard from './Sandbox/SandboxBoard'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'

function Auth() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'
  const isRegister = location.pathname === '/register'

  const currentUser = useSelector(selectCurrentUser)
  if (currentUser) {
    return <Navigate to="/" replace={true} />
  }

  return (
    <Box sx={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* LEFT SIDE - Form Area */}
      <Box sx={{
        width: { xs: '100%', md: '42%' },
        minWidth: { md: '440px' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0b0d10' : '#ffffff',
        borderRight: (theme) => ({
          xs: 'none',
          md: theme.palette.mode === 'dark'
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid rgba(0,0,0,0.08)'
        }),
        position: 'relative',
        overflowY: 'auto',
        py: 4,
        // Mesh gradient phía sau form ở dark mode
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
          {isLogin && <LoginForm />}
          {isRegister && <RegisterForm />}
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