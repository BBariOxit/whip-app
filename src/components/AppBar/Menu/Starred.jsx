import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getStarredBoardsAPI, toggleStarBoardAPI } from '~/apis'
import { getBoardThumbnailBackground } from '~/utils/formatters'

function Starred() {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [starredBoards, setStarredBoards] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const open = Boolean(anchorEl)
  const navigate = useNavigate()

  const handleClick = async (event) => {
    setAnchorEl(event.currentTarget)
    setLoading(true)
    try {
      const res = await getStarredBoardsAPI()
      setStarredBoards(res)
    } catch (error) {
      // Lỗi request đã được toast tập trung ở interceptor authorizeAxios, ở đây chỉ để list rỗng
      setStarredBoards([])
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => setAnchorEl(null)

  const handleNavigate = (boardId) => {
    navigate(`/boards/${boardId}`)
    handleClose()
  }

  // Gỡ sao nhanh ngay trên dropdown mà không cần vào board.
  const handleQuickUnstar = async (e, boardId) => {
    // Chặn sự kiện lan ra MenuItem cha (tránh điều hướng / đóng menu)
    e.stopPropagation()

    // Optimistic update: gỡ khỏi UI ngay, nếu API lỗi thì rollback
    const previousBoards = starredBoards
    setStarredBoards(prev => prev.filter(b => b._id !== boardId))

    try {
      await toggleStarBoardAPI(boardId)
    } catch (error) {
      setStarredBoards(previousBoards)
      toast.error('Failed to unstar board!')
    }
  }

  return (
    <Box>
      <Button
        sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#475569' }}
        id="basic-button-starred"
        aria-controls={open ? 'basic-menu-starred' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        Starred
      </Button>
      <Menu
        id="basic-menu-starred"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button-starred', sx: { py: 0.5 } }}
        PaperProps={{ sx: { width: 300, maxHeight: 420, borderRadius: '10px', mt: 1 } }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2.5 }}>
            <CircularProgress size={24} />
          </Box>
        ) : starredBoards.length === 0 ? (
          <Box sx={{ p: 2.5, textAlign: 'center' }}>
            <StarBorderIcon sx={{ color: 'text.secondary', mb: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              No starred boards yet.
            </Typography>
          </Box>
        ) : (
          starredBoards.map(board => (
            <MenuItem
              key={board._id}
              onClick={() => handleNavigate(board._id)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1 }}
            >
              {/* Thumbnail nền board */}
              <Box sx={{
                width: 40,
                height: 32,
                borderRadius: 1,
                flexShrink: 0,
                background: getBoardThumbnailBackground(board.background)
              }} />

              {/* Tên board + tên workspace */}
              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {board.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {board.workspaceName || 'Personal Board'}
                </Typography>
              </Box>

              {/* Gỡ sao nhanh */}
              <Tooltip title="Remove from starred">
                <IconButton size="small" onClick={(e) => handleQuickUnstar(e, board._id)} sx={{ p: 0.5 }}>
                  <StarIcon sx={{ color: '#e3b341', fontSize: '1.2rem' }} />
                </IconButton>
              </Tooltip>
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  )
}

export default Starred
