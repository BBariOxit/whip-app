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
import Avatar from '@mui/material/Avatar'
import { capitalizeFirstLetter } from '~/utils/formatters'
import BoardUserGroup from './BoardUserGroup'
import InviteBoardUser from './InviteBoardUser'
import ArchivedItemsDrawer from './ArchivedItemsDrawer'
import TemplateManagerDrawer from './TemplateManagerDrawer'
import BoardFiltersPopover from './BoardFiltersPopover'
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
import BusinessIcon from '@mui/icons-material/Business'
import PersonIcon from '@mui/icons-material/Person'
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove'
import { useNavigate } from 'react-router-dom'
import { updateBoardDetailAPI, fetchWorkspacesAPI, joinBoardAPI } from '~/apis'
import Typography from '@mui/material/Typography'

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

export const BoardTitleIndicator = ({ board }) => {
  const isPersonal = !board.workspaceId
  const workspaceName = board.workspace?.title || 'Personal'

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={isPersonal ? "Personal Workspace" : workspaceName} arrow>
        <Box sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', p: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
          {isPersonal ? (
            <PersonIcon sx={{ color: 'text.secondary' }} />
          ) : (
            <Avatar variant="rounded" sx={{ width: 24, height: 24, fontSize: '12px', fontWeight: 'bold', bgcolor: 'primary.main' }}>
              {workspaceName.charAt(0).toUpperCase()}
            </Avatar>
          )}
        </Box>
      </Tooltip>
      
      <Typography sx={{ color: 'text.secondary', fontSize: '1.2rem', userSelect: 'none' }}>/</Typography>
      
      <Tooltip title={board?.title} arrow>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', cursor: 'pointer' }}>
          {board.title}
        </Typography>
      </Tooltip>
    </Box>
  )
}

function BoardBar({ board, isAuthorized, filters, setFilters }) {
  const [isArchivedDrawerOpen, setIsArchivedDrawerOpen] = useState(false)
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const currentUser = useSelector(selectCurrentUser)
  const isReadOnly = useSelector(selectIsReadOnly)
  const dispatch = useDispatch()
  const confirm = useConfirm()
  const [anchorElVisibility, setAnchorElVisibility] = useState(null)
  const [anchorElFilters, setAnchorElFilters] = useState(null)
  const [anchorElMove, setAnchorElMove] = useState(null)
  const [workspaces, setWorkspaces] = useState([])
  const navigate = useNavigate()

  const isJoined = currentUser && (board.memberIds?.includes(currentUser._id) || board.ownerIds?.includes(currentUser._id))

  const handleJoinInsideBoard = async () => {
    try {
      const res = await joinBoardAPI(board._id)
      toast.success('Joined board successfully!')
      
      const newBoard = { 
        ...board, 
        memberIds: [...(board.memberIds || []), currentUser._id],
        members: [...(board.members || []), res.newMember],
        FE_allUser: [...(board.FE_allUser || []), res.newMember],
        userAccessRole: 'member'
      }
      dispatch(updateCurrentActiveBoard(newBoard))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join board!')
    }
  }

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
      // Hủy confirm hoặc xử lý lỗi bổ sung nếu cần
      // (toast error đã được handle ở authorizeAxios interceptor)
    }
  }

  const handleOpenMoveMenu = async (event) => {
    setAnchorElMove(event.currentTarget)
    try {
      const res = await fetchWorkspacesAPI()
      setWorkspaces(res)
    } catch (error) {
      toast.error('Failed to fetch workspaces')
    }
  }

  const handleMoveBoard = async (newWorkspaceId) => {
    setAnchorElMove(null)
    try {
      await updateBoardDetailAPI(board._id, { workspaceId: newWorkspaceId })
      toast.success('Board moved successfully!')
      navigate(`/boards?workspaceId=${newWorkspaceId}`)
    } catch (error) {
      toast.error('Failed to move board')
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
        <Box sx={{ px: 1, py: 0.5 }}>
          <BoardTitleIndicator board={board} />
        </Box>
        
        {/* Toggle Public / Private */}
        <Chip
          sx={{
            ...MENU_STYLE,
            color: board?.type === 'public' ? 'info.main' : 'text.primary',
            '& .MuiSvgIcon-root': { color: board?.type === 'public' ? 'info.main' : 'text.primary' }
          }}
          icon={board?.type === 'public' ? <PublicIcon /> : <LockIcon />}
          label={capitalizeFirstLetter(board?.type)}
          clickable={!isReadOnly && isAuthorized && board?.userAccessRole === 'admin'} // Chỉ cho phép chủ board toggle
          onClick={(e) => {
            if (!isReadOnly && isAuthorized && board?.userAccessRole === 'admin') {
              handleOpenVisibilityMenu(e)
            }
          }}
          disabled={!isAuthorized || board?.userAccessRole !== 'admin'} // Không phải owner thì chỉ nhìn
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
          onClick={(e) => setAnchorElFilters(e.currentTarget)}
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
        <Chip
          sx={MENU_STYLE}
          icon={<DriveFileMoveIcon />}
          label="Move Board"
          clickable={!isReadOnly && isAuthorized && board?.userAccessRole === 'admin'}
          disabled={!isAuthorized || board?.userAccessRole !== 'admin'}
          onClick={(e) => {
            if (!isReadOnly && isAuthorized && board?.userAccessRole === 'admin') {
              handleOpenMoveMenu(e)
            }
          }}
        />
        
        {/* Menu cho Move Board */}
        <Menu
          anchorEl={anchorElMove}
          open={Boolean(anchorElMove)}
          onClose={() => setAnchorElMove(null)}
          MenuListProps={{ sx: { py: 0, pb: 1 } }}
          PaperProps={{ sx: { mt: 0.5, minWidth: 200, borderRadius: '8px' } }}
        >
          <Box sx={{ px: 2, pt: 1.5, pb: 1, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: '600', color: 'text.secondary', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Move to Workspace
            </Typography>
          </Box>
          <MenuItem 
            onClick={() => handleMoveBoard(null)}
            selected={!board.workspaceId}
            sx={{ gap: 1.5, px: 2, py: 1 }}
          >
            <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </Box>
            <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}>Personal Boards</ListItemText>
          </MenuItem>
          {workspaces.map(wsp => (
            <MenuItem 
              key={wsp._id} 
              onClick={() => handleMoveBoard(wsp._id)}
              selected={board.workspaceId === wsp._id}
              sx={{ gap: 1.5, px: 2, py: 1 }}
            >
              <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BusinessIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </Box>
              <ListItemText primaryTypographyProps={{ 
                fontSize: 14, 
                fontWeight: 500,
                sx: {
                  display: 'block',
                  maxWidth: '140px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              }}>{wsp.title}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {!isJoined && currentUser && board.type !== 'private' ? (
          <Button 
            variant="outlined" 
            onClick={handleJoinInsideBoard}
            sx={{
              color: 'text.primary',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#ffffff',
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'divider',
              borderWidth: '2px',
              '&:hover': { 
                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)', 
                borderWidth: '2px',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#161b22' : '#ffffff'
              }
            }}
          >
            Join Board
          </Button>
        ) : (
          <>
            {/* Nút share Board */}
            <Chip
              sx={MENU_STYLE}
              icon={<ShareIcon />}
              label="Share"
              clickable
              onClick={() => setIsShareModalOpen(true)}
            />

            {/* xử lý cho phép chủ sở hữu board mời thành viên khác vào board */}
            {!isReadOnly && <InviteBoardUser boardId={board._id} boardMembers={board.memberIds} workspaceMembers={board.workspaceMembers} />}
          </>
        )}

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

      <BoardFiltersPopover
        anchorEl={anchorElFilters}
        handleClose={() => setAnchorElFilters(null)}
        board={board}
        filters={filters}
        setFilters={setFilters}
      />
    </Box>
  )
}

export default BoardBar
