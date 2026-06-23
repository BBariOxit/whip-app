import { useState } from 'react'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import FilterListIcon from '@mui/icons-material/FilterList'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import ArchiveIcon from '@mui/icons-material/Archive'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import { capitalizeFirstLetter } from '~/utils/formatters'
import BoardUserGroup from './BoardUserGroup'
import InviteBoardUser from './InviteBoardUser'
import ArchivedItemsDrawer from './ArchivedItemsDrawer'
import TemplateManagerDrawer from './TemplateManagerDrawer'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'

const MENU_STYLE = {
  color: 'text.primary',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '& .MuiSvgIcon-root': {
    color: 'text.primary'
  },
  '&:hover': {
    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#334155' : 'rgba(0,0,0,0.05)'
  }
}

function BoardBar({ board }) {
  const [isArchivedDrawerOpen, setIsArchivedDrawerOpen] = useState(false)
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false)
  const currentUser = useSelector(selectCurrentUser)

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
      bgcolor: 'background.boardBar',
      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      '&::-webkit-scrollbar-track': { m: 2 }
    }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title={board?.description}>
          <Chip
            sx={MENU_STYLE}
            icon={<ViewColumnIcon />}
            label={board?.title}
            clickable
          />
        </Tooltip>
        <Chip
          sx={MENU_STYLE}
          icon={<VpnLockIcon />}
          label={capitalizeFirstLetter(board?.type)}
          clickable
        />
        <Chip
          sx={MENU_STYLE}
          icon={<AddToDriveIcon />}
          label="Drive"
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
        <Chip
          sx={MENU_STYLE}
          icon={<ArchiveIcon />}
          label="Archive"
          clickable
          onClick={() => setIsArchivedDrawerOpen(true)}
        />
        <Chip
          sx={MENU_STYLE}
          icon={<DashboardCustomizeOutlinedIcon />}
          label="Templates"
          clickable
          onClick={() => setIsTemplateDrawerOpen(true)}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* xử lý cho phép chủ sở hữu board mời thành viên khác vào board */}
        <InviteBoardUser boardId={board._id} />

        {/* xử lý hiển thị danh sách thành viên của board */}
        <BoardUserGroup boardUsers={board?.FE_allUser} />
      </Box>

      <ArchivedItemsDrawer
        isOpen={isArchivedDrawerOpen}
        onClose={() => setIsArchivedDrawerOpen(false)}
        boardId={board?._id}
      />

      <TemplateManagerDrawer
        isOpen={isTemplateDrawerOpen}
        onClose={() => setIsTemplateDrawerOpen(false)}
        boardId={board?._id}
        currentUser={currentUser}
      />
    </Box>
  )
}

export default BoardBar
