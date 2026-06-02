import AppsIcon from '@mui/icons-material/Apps'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import SvgIcon from '@mui/material/SvgIcon'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ModeSelect from '~/components/ModeSelect/ModeSelect'
import Profiles from './Menu/Profiles'
import Recent from './Menu/Recent'
import Starred from './Menu/Starred'
import Templates from './Menu/Templates'
import Workspaces from './Menu/Workspaces'
import Notifications from './Notifications/Notifications'
import AutoCompleteSearchBoard from './SearchBoards/AutoCompleteSearchBoard'

function AppBar() {
  return (
    <Box sx={{
      width: '100%',
      height: (theme) => theme.trello.appBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.paper' : '#e0f2fe'),
      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      boxShadow: (theme) => (theme.palette.mode === 'light'
        ? '0 1px 3px 0 rgb(0 0 0 / 0.05)'
        : 'none'),
      '&::-webkit-scrollbar-track': { m: 2 }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Link to="/boards">
          <Tooltip title="Boards List">
            <AppsIcon sx={{
              color: 'text.secondary',
              verticalAlign: 'middle'
            }}/>
          </Tooltip>
        </Link>

        <Link to='/' style={{ color: 'inherit' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DashboardIcon fontSize='small' sx={{
              color: (theme) => theme.palette.mode === 'dark' ? 'text.secondary' : 'primary.main'
            }}/>
            <Typography variant='span' sx={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: (theme) => theme.palette.mode === 'dark' ? 'text.secondary' : 'primary.main'
            }}>Whip</Typography>
          </Box>
        </Link>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Workspaces />
          <Recent />
          <Starred />
          <Templates />
          <Button
            sx={{
              color: 'text.secondary',
              border: 'none',
              '&:hover': { border:'none' }
            }}
            variant="outlined"
            startIcon = {<LibraryAddIcon />}>
          Create</Button>
        </Box>

      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* tìm kiếm nhanh một cái board */}
        <AutoCompleteSearchBoard />
        
        {/* dark - light mode */}
        <ModeSelect />

        < Notifications />

        <Tooltip title="Help">
          <HelpOutlineIcon sx={{
            cursor: 'pointer',
            color: 'text.secondary'
          }}/>
        </Tooltip>
        <Profiles />
      </Box>
    </Box>
  )
}

export default AppBar
