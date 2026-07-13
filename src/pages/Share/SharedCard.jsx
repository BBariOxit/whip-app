import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'
import dayjs from 'dayjs'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { useColorScheme } from '@mui/material/styles'
import { fetchSharedCardAPI } from '~/apis'
import { useSharedResource } from './useSharedResource'
import { ShareError, ShareLoading, SharePageShell } from './SharePageShell'

const Checklist = ({ checklist }) => {
  const items = checklist.items || []
  const completed = items.filter((item) => item.isCompleted).length
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TaskAltOutlinedIcon fontSize="small" />
        <Typography sx={{ fontWeight: 750 }}>{checklist.title}</Typography>
        <Typography sx={{ ml: 'auto', color: 'text.secondary', fontSize: '0.8rem' }}>{progress}%</Typography>
      </Box>
      <LinearProgress variant="determinate" value={progress} sx={{ my: 1.25, height: 6, borderRadius: 99 }} />
      {items.map((item) => (
        <Box key={item._id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Checkbox checked={item.isCompleted} disabled size="small" />
          <Typography sx={{ color: item.isCompleted ? 'text.secondary' : 'text.primary', textDecoration: item.isCompleted ? 'line-through' : 'none' }}>{item.title}</Typography>
        </Box>
      ))}
    </Box>
  )
}

const formatCustomFieldValue = (field, value) => {
  if (value === null || value === undefined || value === '') return '—'
  if (field.type === 'checkbox') return value ? 'Yes' : 'No'
  if (field.type === 'date') return dayjs(value).isValid() ? dayjs(value).format('DD MMM YYYY') : '—'
  if (field.type === 'dropdown') {
    return field.options?.find((option) => option._id === value)?.text || '—'
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

function SharedCard() {
  const { boardId, cardId } = useParams()
  const { mode } = useColorScheme()
  const resource = useSharedResource(() => fetchSharedCardAPI(boardId, cardId), [boardId, cardId])

  if (resource.status === 'loading') return <SharePageShell><ShareLoading label="Loading shared card..." /></SharePageShell>
  if (resource.status === 'error') return <SharePageShell><ShareError error={resource.error} /></SharePageShell>

  const { board, column, card, labels, members, customFields } = resource.data
  const customFieldValues = new Map((card.customFieldValues || []).map((item) => [item.customFieldId, item.value]))

  return (
    <SharePageShell>
      <Box sx={{ minHeight: 'calc(100vh - 58px)', px: 2, py: { xs: 3, md: 5 } }}>
        <Paper elevation={0} sx={{ width: '100%', maxWidth: 900, mx: 'auto', overflow: 'hidden', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          {card.cover && <Box component="img" src={card.cover} alt="" sx={{ display: 'block', width: '100%', maxHeight: 340, objectFit: 'cover' }} />}
          <Box sx={{ p: { xs: 2.5, md: 4 } }}>
            <Breadcrumbs sx={{ mb: 2 }}>
              <Link component={RouterLink} to={`/share/boards/${board._id}`} underline="hover">{board.title}</Link>
              <Typography color="text.secondary">{column.title}</Typography>
            </Breadcrumbs>

            <Typography variant="h4" sx={{ fontWeight: 850, lineHeight: 1.2 }}>{card.title}</Typography>

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              {labels.map((label) => <Chip key={label._id} label={label.title || 'Label'} size="small" sx={{ bgcolor: label.color, color: '#fff', fontWeight: 700 }} />)}
              {card.dueDate && <Chip icon={<AccessTimeOutlinedIcon />} label={dayjs(card.dueDate).format('DD MMM YYYY, HH:mm')} color={card.dueComplete ? 'success' : 'default'} variant="outlined" />}
            </Box>

            {!!members.length && (
              <Box sx={{ mt: 2.5 }}>
                <Typography sx={{ mb: 1, color: 'text.secondary', fontSize: '0.8rem', fontWeight: 750, textTransform: 'uppercase' }}>Members</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {members.map((member) => (
                    <Chip key={member._id} avatar={<Avatar src={member.avatar} />} label={member.displayName || member.username} variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.25 }}>Description</Typography>
            {card.description ? (
              <Box data-color-mode={mode} sx={{ '& .wmde-markdown': { bgcolor: 'transparent' } }}>
                <MDEditor.Markdown source={card.description} rehypePlugins={[[rehypeSanitize]]} style={{ backgroundColor: 'transparent' }} />
              </Box>
            ) : <Typography color="text.secondary">No description.</Typography>}

            {!!customFields?.length && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>Custom fields</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.25 }}>
                  {customFields.map((field) => (
                    <Box key={field._id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 750 }}>{field.name}</Typography>
                      <Typography sx={{ mt: 0.35, fontWeight: 650 }}>{formatCustomFieldValue(field, customFieldValues.get(field._id))}</Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {!!card.checklists?.length && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Checklists</Typography>
                {card.checklists.map((checklist) => <Checklist key={checklist._id} checklist={checklist} />)}
              </>
            )}

            {!!card.attachments?.length && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>Attachments</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {card.attachments.map((attachment, index) => (
                    <Paper key={`${attachment.url}-${index}`} component="a" href={attachment.url} target="_blank" rel="noopener noreferrer" elevation={0} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.25, color: 'text.primary', textDecoration: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2, '&:hover': { borderColor: 'primary.main' } }}>
                      <AttachFileOutlinedIcon color="primary" />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap sx={{ fontWeight: 700 }}>{attachment.filename}</Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>{attachment.format?.toUpperCase()}</Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </SharePageShell>
  )
}

export default SharedCard
