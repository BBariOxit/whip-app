import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export const SettingsPageHeader = ({ title, description }) => (
  <Box>
    <Typography
      component="h1"
      sx={{
        fontSize: { xs: '1.65rem', md: '2rem' },
        lineHeight: 1.15,
        fontWeight: 800,
        color: 'text.primary'
      }}
    >
      {title}
    </Typography>
    <Typography sx={{ mt: 0.75, fontSize: '0.95rem', color: 'text.secondary' }}>
      {description}
    </Typography>
  </Box>
)

export const SettingsContentShell = ({ children, navItems }) => (
  <Box sx={{ display: 'flex', gap: 4, width: '100%', alignItems: 'flex-start' }}>
    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {children}
    </Box>
    <SettingsAnchorNav items={navItems} />
  </Box>
)

export const SettingsSection = ({ id, title, children, danger = false }) => (
  <Box
    id={id}
    sx={(theme) => ({
      p: { xs: 2.25, md: 3 },
      borderRadius: '8px',
      border: '1px solid',
      borderColor: danger ? '#f85149' : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'),
      bgcolor: danger
        ? (theme.palette.mode === 'dark' ? 'rgba(248, 81, 73, 0.05)' : '#fff8f8')
        : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff'),
      boxShadow: theme.palette.mode === 'light' && !danger ? '0 16px 40px rgba(15, 23, 42, 0.06)' : 'none',
      scrollMarginTop: '96px'
    })}
  >
    <Typography
      variant="h6"
      sx={{
        fontWeight: 750,
        mb: 3,
        color: danger ? '#f85149' : 'text.primary'
      }}
    >
      {title}
    </Typography>
    {children}
  </Box>
)

export const SettingsRow = ({ title, description, children, last = false }) => (
  <Box
    sx={(theme) => ({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: { xs: 'stretch', md: 'center' },
      flexDirection: { xs: 'column', md: 'row' },
      gap: 2,
      pb: last ? 0 : 2.5,
      mb: last ? 0 : 2.5,
      borderBottom: last ? 'none' : '1px solid',
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
    })}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body1" sx={{ fontWeight: 650, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.35, maxWidth: 540 }}>
        {description}
      </Typography>
    </Box>
    <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
      {children}
    </Box>
  </Box>
)

export const SettingsAnchorNav = ({ items }) => (
  <Box
    sx={{
      width: '180px',
      flexShrink: 0,
      position: 'sticky',
      top: '0rem',
      alignSelf: 'flex-start',
      display: { xs: 'none', lg: 'flex' },
      flexDirection: 'column',
      gap: 0.5
    }}
  >
    {items.map((item) => (
      <Box
        key={item.id}
        component="a"
        href={`#${item.id}`}
        onClick={(e) => {
          e.preventDefault()
          document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
        sx={(theme) => ({
          px: 1.5,
          py: 0.75,
          borderRadius: '6px',
          cursor: 'pointer',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: 550,
          color: item.danger ? '#f85149' : 'text.secondary',
          transition: 'all 0.15s',
          '&:hover': {
            color: item.danger ? '#f85149' : 'text.primary',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
          }
        })}
      >
        {item.label}
      </Box>
    ))}
  </Box>
)
