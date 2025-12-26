import ModeSelect from '~/components/ModeSelect'
import Box from '@mui/material/Box'
import AppsIcon from '@mui/icons-material/Apps'
import { ReactComponent as trelloLogo } from '~/assets/trello.svg'
import SvgIcon from '@mui/material/SvgIcon'

function AppBar() {
  return (
    <Box
      sx={{
        width: '100%',
        height: (theme) => theme.trello.appBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box>
        <AppsIcon sx={{ color: 'primary.main' }}/>
        <SvgIcon component={trelloLogo} inheritViewBox />
      </Box>

      <Box>
        <ModeSelect />
      </Box>
    </Box>
  )
}

export default AppBar
