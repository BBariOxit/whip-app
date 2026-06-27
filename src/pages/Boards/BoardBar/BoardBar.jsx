import { useState } from 'react'
import PublicIcon from '@mui/icons-material/Public'
import LockIcon from '@mui/icons-material/Lock'
import { toast } from 'sonner'
import { updateBoardVisibilityAPI } from '~/apis'
import { useDispatch } from 'react-redux'
import { updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
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
import ShareModal from '~/components/Modal/ShareModal/ShareModal'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { selectIsReadOnly } from '~/redux/activeBoard/activeBoardSlice'
import { useConfirm } from 'material-ui-confirm'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Button from '@mui/material/Button'
import ShareIcon from '@mui/icons-material/Share'

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
  },
  '&.Mui-disabled': {
    opacity: 1
  }
}

function BoardBar({ board, isAuthorized }) {
  const [isArchivedDrawerOpen, setIsArchivedDrawerOpen] = useState(false)
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const currentUser = useSelector(selectCurrentUser)
  const isReadOnly = useSelector(selectIsReadOnly)
  const dispatch = useDispatch()
  const confirm = useConfirm()
  const [anchorElVisibility, setAnchorElVisibility] = useState(null)

  const handleOpenVisibilityMenu = (event) => setAnchorElVisibility(event.currentTarget)
  const handleCloseVisibilityMenu = () => setAnchorElVisibility(null)

  const handleToggleVisibility = async (newType) => {
    handleCloseVisibilityMenu()
    if (newType === board.type) return // Đang ở trạng thái này rồi

    try {
      if (newType === 'private') {
        await confirm({
          title: 'Make board private?',
          description: 'Only members will be able to access this board.',
          confirmationText: 'Confirm',
          cancellationText: 'Cancel'
        })
      } else if (newType === 'public') {
        await confirm({
          title: 'Make board public?',
          description: `Anyone with the link can view this board. Type "${board.title}" to confirm.`,
          confirmationText: 'Confirm',
          cancellationText: 'Cancel',
          confirmationKeyword: board.title,
          buttonOrder: ['confirm', 'cancel'],
          confirmationButtonProps: { color: 'error', variant: 'contained' },
          dialogProps: { maxWidth: 'xs' },
          confirmationKeywordTextFieldProps: {
            autoFocus: true,
            variant: 'outlined',
            size: 'small',
            sx: { 
              mt: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                },
                '&:hover fieldset': {
                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          }
        })
      }

      const res = await updateBoardVisibilityAPI(board._id, newType)
      dispatch(updateCurrentActiveBoard({ ...board, type: res.board?.type || newType }))
      toast.success(res.message)
    } catch (error) {
      if (!error) return // Hủy confirm
      toast.error('Failed to change board visibility!')
    }
  }

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
        
        {/* Toggle Public / Private */}
        <Chip
          sx={{
            ...MENU_STYLE,
            color: board?.type === 'public' ? 'info.main' : 'text.primary',
            '& .MuiSvgIcon-root': { color: board?.type === 'public' ? 'info.main' : 'text.primary' }
          }}
          icon={board?.type === 'public' ? <PublicIcon /> : <LockIcon />}
          label={capitalizeFirstLetter(board?.type)}
          clickable={!isReadOnly && isAuthorized && board.ownerIds?.includes(currentUser?._id)} // Chỉ cho phép chủ board toggle
          onClick={(e) => {
            if (!isReadOnly && isAuthorized && board.ownerIds?.includes(currentUser?._id)) {
              handleOpenVisibilityMenu(e)
            }
          }}
          disabled={!isAuthorized || !board.ownerIds?.includes(currentUser?._id)} // Không phải owner thì chỉ nhìn
        />

        <Menu
          anchorEl={anchorElVisibility}
          open={Boolean(anchorElVisibility)}
          onClose={handleCloseVisibilityMenu}
          sx={{ mt: 1 }}
        >
          <MenuItem 
            onClick={() => handleToggleVisibility('private')}
            selected={board?.type === 'private'}
          >
            <ListItemIcon><LockIcon sx={{ color: '#768390' }} fontSize="small" /></ListItemIcon>
            <ListItemText 
              primaryTypographyProps={{ fontSize: 14 }}
              primary="Private" 
            />
          </MenuItem>
          <MenuItem 
            onClick={() => handleToggleVisibility('public')}
            selected={board?.type === 'public'}
          >
            <ListItemIcon><PublicIcon sx={{ color: 'info.main' }} fontSize="small" /></ListItemIcon>
            <ListItemText 
              primaryTypographyProps={{ fontSize: 14 }}
              primary="Public" 
            />
          </MenuItem>
        </Menu>

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
          clickable={!isReadOnly}
          disabled={isReadOnly}
          onClick={() => {
            if (!isReadOnly) setIsArchivedDrawerOpen(true)
          }}
        />
        <Chip
          sx={MENU_STYLE}
          icon={<DashboardCustomizeOutlinedIcon />}
          label="Templates"
          clickable={!isReadOnly}
          disabled={isReadOnly}
          onClick={() => {
            if (!isReadOnly) setIsTemplateDrawerOpen(true)
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Nút share Board */}
        <Chip
          sx={MENU_STYLE}
          icon={<ShareIcon />}
          label="Share"
          clickable
          onClick={() => setIsShareModalOpen(true)}
        />

        {/* xử lý cho phép chủ sở hữu board mời thành viên khác vào board */}
        {!isReadOnly && <InviteBoardUser boardId={board._id} />}

        {/* xử lý hiển thị danh sách thành viên của board */}
        <BoardUserGroup boardUsers={board?.FE_allUser} />
      </Box>

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={window.location.href}
        title={board?.title}
        type="Board"
      />

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
