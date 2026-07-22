import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const AuthFormShell = ({ title, description, children }) => (
  <Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto', px: 3 }}>
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Box component="img" src="/whip.svg" alt="Whip" sx={{ width: 32, height: 32 }} />
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'primary.main' }}>Whip</Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.75rem', color: 'text.primary', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>{description}</Typography>
    </Box>
    {children}
  </Box>
)

export default AuthFormShell
