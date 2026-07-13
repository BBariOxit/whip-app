import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined'
import { Link, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { fetchSharedBoardAPI } from '~/apis'
import { getBoardThumbnailBackground } from '~/utils/formatters'
import { useSharedResource } from './useSharedResource'
import { ShareError, ShareLoading, SharePageShell } from './SharePageShell'

const orderByIds = (items = [], ids = []) => {
  const order = new Map(ids.map((id, index) => [id.toString(), index]))
  return [...items].sort((a, b) => (order.get(a._id.toString()) ?? Number.MAX_SAFE_INTEGER) - (order.get(b._id.toString()) ?? Number.MAX_SAFE_INTEGER))
}

const SharedCardPreview = ({ board, card }) => {
  const labels = (board.labels || []).filter((label) => card.labelIds?.includes(label._id))
  const members = (board.people || []).filter((person) => card.memberIds?.includes(person._id))

  return (
    <Paper
      component={Link}
      to={`/share/cards/${board._id}/${card._id}`}
      elevation={0}
      sx={{ display: 'block', overflow: 'hidden', border: '1px solid', borderColor: 'divider', borderRadius: 2, color: 'text.primary', textDecoration: 'none', bgcolor: 'background.paper', transition: 'transform .15s ease, border-color .15s ease', '&:hover': { transform: 'translateY(-2px)', borderColor: 'primary.main' } }}
    >
      {card.cover && <Box component="img" src={card.cover} alt="" sx={{ display: 'block', width: '100%', maxHeight: 140, objectFit: 'cover' }} />}
      <Box sx={{ p: 1.5 }}>
        {!!labels.length && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {labels.map((label) => <Box key={label._id} title={label.title} sx={{ width: 38, height: 7, borderRadius: 99, bgcolor: label.color }} />)}
          </Box>
        )}
        <Typography sx={{ fontWeight: 700, lineHeight: 1.35 }}>{card.title}</Typography>
        <Box sx={{ mt: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          {card.dueDate ? (
            <Chip icon={<AccessTimeOutlinedIcon />} label={dayjs(card.dueDate).format('DD MMM')} size="small" color={card.dueComplete ? 'success' : 'default'} />
          ) : <Box />}
          {!!members.length && (
            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: 11 } }}>
              {members.map((member) => <Avatar key={member._id} src={member.avatar} alt={member.displayName || member.username} />)}
            </AvatarGroup>
          )}
        </Box>
      </Box>
    </Paper>
  )
}

function SharedBoard() {
  const { boardId } = useParams()
  const resource = useSharedResource(() => fetchSharedBoardAPI(boardId), [boardId])

  if (resource.status === 'loading') return <SharePageShell><ShareLoading label="Loading shared board..." /></SharePageShell>
  if (resource.status === 'error') return <SharePageShell><ShareError error={resource.error} /></SharePageShell>

  const board = resource.data
  const columns = orderByIds(board.columns, board.columnOrderIds)

  return (
    <SharePageShell>
      <Box sx={{ minHeight: 'calc(100vh - 58px)', p: { xs: 2, md: 3 }, background: getBoardThumbnailBackground(board.background), backgroundAttachment: 'fixed' }}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, mb: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(16,20,27,.94)' : 'rgba(255,255,255,.94)', backdropFilter: 'blur(10px)' }}>
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 850 }}>{board.title}</Typography>
                <Chip icon={<LockOpenOutlinedIcon />} label="Shared read-only" color="success" variant="outlined" size="small" />
              </Box>
              <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>{board.description}</Typography>
            </Box>
            <Button component={Link} to={`/boards/${board._id}`} variant="outlined" endIcon={<OpenInNewOutlinedIcon />} sx={{ flexShrink: 0 }}>
              Open in Whip
            </Button>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, overflowX: 'auto', pb: 2 }}>
          {columns.map((column) => (
            <Paper key={column._id} elevation={0} sx={{ width: 310, minWidth: 310, maxHeight: 'calc(100vh - 205px)', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(15,19,25,.94)' : 'rgba(241,245,249,.96)' }}>
              <Typography sx={{ px: 2, py: 1.5, fontWeight: 800 }}>{column.title}</Typography>
              <Box sx={{ px: 1.25, pb: 1.25, display: 'flex', flexDirection: 'column', gap: 1.1, overflowY: 'auto' }}>
                {orderByIds(column.cards, column.cardOrderIds).map((card) => <SharedCardPreview key={card._id} board={board} card={card} />)}
                {!column.cards.length && <Typography sx={{ px: 1, py: 2, textAlign: 'center', color: 'text.secondary', fontSize: '0.82rem' }}>No cards</Typography>}
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </SharePageShell>
  )
}

export default SharedBoard
