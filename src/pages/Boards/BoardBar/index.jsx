import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FilterListIcon from '@mui/icons-material/FilterList'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import avatar from '~/assets/avatar.png'
import PersonAddIcon from '@mui/icons-material/PersonAdd'


const MENU_STYLE = {
  color: '#B6C2CF',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '& .MuiSvgIcon-root': {
    color: '#B6C2CF'
  },
  '&:hover': {
    bgcolor: 'primary.50'
  }
}

function BoardBar() {
  return (
    <Box px={2} sx={{
      width: '100%',
      height: (theme) => theme.trello.boardBarHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      paddingX: 2,
      overflowX: 'auto',
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
      borderBottom: '1px solid #B6C2CF'
    }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          sx={MENU_STYLE}
          icon={<DashboardIcon />}
          label="phanbao dashboard"
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<VpnLockIcon />}
          label="Public/Private Workspace"
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<AddToDriveIcon />}
          label="Add to google drive"
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<BoltIcon />}
          label="Automation"
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<FilterListIcon />}
          label="Filters"
          clickable
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon = {<PersonAddIcon />}
          sx={{
            color: '#B6C2CF',
            borderColor: '#B6C2CF',
            '&:hover': { borderColor: '#B6C2CF' }
          }}
        >Invite</Button>
        <AvatarGroup
          max={7}
          sx={{
            gap: '10px',
            '& .MuiAvatar-root': {
              width: '34px',
              height: '34px',
              fontSize: 16
            }
          }}
        >
          <Tooltip title='phanbao'>
            <Avatar
              alt="Phan Bao"
              src={avatar}
            />
          </Tooltip>
          <Tooltip title='phanbao'>
            <Avatar
              alt="Phan Bao"
              src='https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/Image%20FP_2024/meme-meo-4.jpg'
            />
          </Tooltip>
          <Tooltip title='phanbao'>
            <Avatar
              alt="Phan Bao"
              src='https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/Image%20FP_2024/meme-meo-9.jpg'
            />
          </Tooltip>
          <Tooltip title='phanbao'>
            <Avatar
              alt="Phan Bao"
              src='https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/Image%20FP_2024/meme-meo-31.jpg'
            />
          </Tooltip>
          <Tooltip title='phanbao'>
            <Avatar
              alt="Phan Bao"
              src='https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/Image%20FP_2024/meme-meo-18.jpg'
            />
          </Tooltip>
          <Tooltip title='phanbao'>
            <Avatar
              alt="Phan Bao"
              src='https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/Image%20FP_2024/meme-meo-49.jpg'
            />
          </Tooltip>
          <Tooltip title='phanbao'>
            <Avatar
              alt="Phan Bao"
              src='https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/Image%20FP_2024/meme-meo-43.jpg'
            />
          </Tooltip>
          <Tooltip title='phanbao'>
            <Avatar
              alt="Phan Bao"
              src='https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/Image%20FP_2024/meme-meo-4.jpg'
            />
          </Tooltip>
          <Tooltip title='phanbao'>
            <Avatar
              alt="Phan Bao"
              src='https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/Image%20FP_2024/meme-meo-9.jpg'
            />
          </Tooltip>
          <Tooltip title='phanbao'>
            <Avatar
              alt="Phan Bao"
              src='https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/Image%20FP_2024/meme-meo-31.jpg'
            />
          </Tooltip>
          <Tooltip title='phanbao'>
            <Avatar
              alt="Phan Bao"
              src='https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/Image%20FP_2024/meme-meo-18.jpg'
            />
          </Tooltip>
          <Tooltip title='phanbao'>
            <Avatar
              alt="Phan Bao"
              src='https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/Image%20FP_2024/meme-meo-49.jpg'
            />
          </Tooltip>
          <Tooltip title='phanbao'>
            <Avatar
              alt="Phan Bao"
              src='https://cdn11.dienmaycholon.vn/filewebdmclnew/public/userupload/files/Image%20FP_2024/meme-meo-43.jpg'
            />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar
