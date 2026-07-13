import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import LinkOffOutlinedIcon from '@mui/icons-material/LinkOffOutlined'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import { getLocationPath } from '~/utils/authRedirect'

export const SharePageShell = ({ children }) => {
  const currentUser = useSelector(selectCurrentUser)
  const location = useLocation()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Box
        component="header"
        sx={{
          minHeight: 58,
          px: { xs: 2, md: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Typography component={Link} to="/" sx={{ color: 'text.primary', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 850 }}>
          Whip
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ModeSelect />
          {!currentUser && (
            <Button
              component={Link}
              to="/login"
              state={{ from: getLocationPath(location) }}
              variant="contained"
              sx={{ boxShadow: 'none', fontWeight: 700 }}
            >
              Log in
            </Button>
          )}
        </Box>
      </Box>
      {children}
    </Box>
  )
}

export const ShareLoading = ({ label = 'Loading shared content...' }) => (
  <Box sx={{ minHeight: 'calc(100vh - 58px)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
    <CircularProgress size={30} />
    <Typography color="text.secondary">{label}</Typography>
  </Box>
)

export const ShareError = ({ error }) => {
  const statusCode = error?.response?.status
  const isForbidden = statusCode === 401 || statusCode === 403
  const Icon = isForbidden ? LockOutlinedIcon : LinkOffOutlinedIcon
  const title = isForbidden ? 'You cannot access this shared item' : 'This shared link is unavailable'
  const description = isForbidden
    ? 'The board is private or your account does not have permission to view it.'
    : 'It may have been deleted, archived, or the link may be invalid.'

  return (
    <Box sx={{ minHeight: 'calc(100vh - 58px)', px: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 520, p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Icon sx={{ fontSize: 44, color: isForbidden ? 'warning.main' : 'text.secondary' }} />
        <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 800 }}>{title}</Typography>
        <Typography sx={{ mt: 1, color: 'text.secondary' }}>{description}</Typography>
        <Button component={Link} to="/" variant="outlined" sx={{ mt: 3 }}>Go to Whip</Button>
      </Box>
    </Box>
  )
}
