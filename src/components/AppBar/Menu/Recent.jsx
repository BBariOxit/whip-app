import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import HistoryIcon from '@mui/icons-material/History'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { getRecentBoards } from '~/utils/recentBoards'
import { getBoardThumbnailBackground } from '~/utils/formatters'

function Recent() {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [recentBoards, setRecentBoards] = React.useState([])
  const open = Boolean(anchorEl)
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)

  const handleClick = (event) => {
    // Đọc lại từ localStorage mỗi lần mở để luôn hiển thị lịch sử mới nhất
    setRecentBoards(getRecentBoards(currentUser?._id))
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => setAnchorEl(null)

  const handleNavigate = (boardId) => {
    navigate(`/boards/${boardId}`)
    handleClose()
  }

  return (
    <Box>
      <Button
        sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#475569' }}
        id="basic-button-recent"
        aria-controls={open ? 'basic-menu-recent' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
      >
        Recent
      </Button>
      <Menu
        id="basic-menu-recent"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button-recent', sx: { py: 0.5 } }}
        PaperProps={{ sx: { width: 300, maxHeight: 420, borderRadius: '10px', mt: 1 } }}
      >
        {recentBoards.length === 0 ? (
          <Box sx={{ p: 2.5, textAlign: 'center' }}>
            <HistoryIcon sx={{ color: 'text.secondary', mb: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              No recently viewed boards.
            </Typography>
          </Box>
        ) : (
          recentBoards.map(board => (
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
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  )
}

export default Recent
