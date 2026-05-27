import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

function PageLoadingSpinner({ caption }) {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      width: '100vw',
      height: 'calc(100vh / 0.9)'
    }}>
      <CircularProgress />
      <Typography>{caption}</Typography>
    </Box>
  )
}

export default PageLoadingSpinner