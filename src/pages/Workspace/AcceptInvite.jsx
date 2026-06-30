import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Button, CircularProgress, Paper } from '@mui/material'
import { toast } from 'sonner'
import { acceptWorkspaceInviteAPI } from '~/apis'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

export const AcceptInvite = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const workspaceId = searchParams.get('workspaceId')
  
  const currentUser = useSelector(selectCurrentUser)
  const [status, setStatus] = useState('loading') // 'loading', 'success', 'error', 'auth_required'
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token || !workspaceId) {
      setStatus('error')
      setErrorMessage('Invalid invitation link.')
      return
    }

    if (!currentUser) {
      setStatus('auth_required')
      return
    }

    const acceptInvite = async () => {
      try {
        await acceptWorkspaceInviteAPI({ token, workspaceId })
        setStatus('success')
        setTimeout(() => {
          navigate(`/boards?workspaceId=${workspaceId}`)
        }, 2000)
      } catch (error) {
        setStatus('error')
        setErrorMessage(error.response?.data?.message || 'Failed to accept invitation.')
      }
    }

    acceptInvite()
  }, [token, workspaceId, currentUser, navigate])

  const handleLoginRedirect = () => {
    // Redirect to login and save the invite URL to redirect back after login
    localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search)
    navigate('/login')
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0d1117' : '#f6f8fa'
    }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#fff' }}>
        
        {status === 'loading' && (
          <>
            <CircularProgress size={48} sx={{ mb: 2, color: '#58a6ff' }} />
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              Processing Invitation...
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Please wait while we verify your invitation.
            </Typography>
          </>
        )}

        {status === 'auth_required' && (
          <>
            <ErrorOutlineIcon sx={{ fontSize: 60, color: '#e3b341', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              Authentication Required
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>
              You need to log in to accept this invitation. If you don't have an account with the invited email, please register first.
            </Typography>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleLoginRedirect}
              sx={{ bgcolor: '#238636', '&:hover': { bgcolor: '#2ea043' } }}
            >
              Go to Login
            </Button>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#3fb950', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              Invitation Accepted!
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              You are now a member of the workspace. Redirecting you...
            </Typography>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorOutlineIcon sx={{ fontSize: 60, color: '#f85149', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              Invitation Failed
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>
              {errorMessage}
            </Typography>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => navigate('/')}
              sx={{ borderColor: '#30363d', color: 'text.primary', '&:hover': { borderColor: '#8b949e' } }}
            >
              Go to Dashboard
            </Button>
          </>
        )}

      </Paper>
    </Box>
  )
}
