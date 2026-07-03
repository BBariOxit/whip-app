import AttachmentIcon from '@mui/icons-material/Attachment'
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined'
import CommentIcon from '@mui/icons-material/Comment'
import GroupIcon from '@mui/icons-material/Group'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import AddCardIcon from '@mui/icons-material/AddCard'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import MuiCard from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { selectCurrentActive } from '~/redux/activeBoard/activeBoardSlice'
import { getDueDateState, getDueDateColor, getDueDateTextColor } from '~/utils/getDueDateState'
import { getCardActionGridStyles } from '~/utils/formatters'

/**
 * Preview THUẦN HIỂN THỊ dùng riêng cho DragOverlay (vật thể bám theo con trỏ khi kéo).
 *
 * Perf: bản trước đây render nguyên <Card>/<Column> thật vào overlay — kéo theo useSortable
 * (đăng ký trùng id với item gốc), hàng loạt useSelector, state, handler, menu... trong khi
 * overlay chỉ cần "cái ảnh" của item. Preview này chỉ giữ phần nhìn thấy.
 *
 * Lưu ý bảo trì: phần sx bên dưới được sao chép từ Card.jsx / Column.jsx / ListCard.jsx —
 * nếu đổi giao diện card/column thì nhớ cập nhật lại đây cho khớp hình lúc kéo.
 */

const EMPTY_LABELS = []

// dragging: bật "bộ dạng đang được nhấc lên" (viền + đổ bóng) cho card bám theo con trỏ.
// KHÔNG làm mờ overlay — chỉ card giữ chỗ trong list (bản gốc, isDragging) mới mờ 0.5.
// Card nằm BÊN TRONG ColumnDragPreview thì không bật.
export function CardDragPreview({ card, dragging = false }) {
  const boardLabels = useSelector((state) => selectCurrentActive(state)?.labels || EMPTY_LABELS)
  const boardCustomFields = useSelector((state) => selectCurrentActive(state)?.customFields)

  const cardLabels = boardLabels.filter(label => card?.labelIds?.includes(label._id))
  const dueDateState = getDueDateState(card?.dueDate, card?.dueComplete)
  const totalChecklistItems = card?.checklists?.reduce((sum, cl) => sum + (cl.items?.length || 0), 0) || 0
  const completedChecklistItems = card?.checklists?.reduce((sum, cl) => sum + (cl.items?.filter(i => i.isCompleted)?.length || 0), 0) || 0
  const showCardAction = !!card?.memberIds?.length || !!card?.totalComments || !!card?.attachments?.length || !!card?.dueDate || !!totalChecklistItems || !!card?.customFieldValues?.length
  const layout = card?.layout || 'detailed'

  return (
    <MuiCard sx={{
      position: 'relative',
      cursor: 'pointer',
      overflow: 'hidden',
      display: card?.FE_PlaceholderCard ? 'none' : 'block',
      bgcolor: 'background.paper',
      flexShrink: 0,
      border: dragging ? '1px solid' : undefined,
      boxShadow: dragging ? '0 8px 24px rgba(0,0,0,0.35)' : undefined
    }}>
      {layout === 'detailed' && card?.cover &&
        <CardMedia sx={{ height: 140 }} image={card?.cover} />
      }
      <CardContent sx={{ p: layout === 'compact' ? 1 : 1.5, '&:last-child': { p: layout === 'compact' ? 1 : 1.5 } }}>
        {layout !== 'compact' && !!cardLabels.length &&
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.5, mb: 1 }}>
            {cardLabels.map(label => (
              <Box key={label._id} sx={{ bgcolor: label.color, height: 8, borderRadius: 1 }} />
            ))}
          </Box>
        }
        <Typography>{card?.title}</Typography>
      </CardContent>
      {layout !== 'compact' && showCardAction &&
        <CardActions sx={{
          p: '0 8px 8px 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 1,
          '& > *': { margin: '0 !important' }
        }}>
          <Box sx={getCardActionGridStyles(!!card?.dueDate)}>
            {card?.dueDate && (
              <Button
                size="small"
                startIcon={dueDateState === 'completed' ? <TaskAltOutlinedIcon /> : <WatchLaterOutlinedIcon />}
                sx={(theme) => ({
                  bgcolor: getDueDateColor(dueDateState, theme),
                  color: getDueDateTextColor(dueDateState, theme),
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 1,
                  minWidth: 'unset'
                })}
              >
                {dayjs(card.dueDate).format('DD MMM')}
              </Button>
            )}
            {!!card?.memberIds?.length &&
              <Button size="small" startIcon={<GroupIcon />} sx={{ minWidth: 'unset' }}>{card?.memberIds?.length}</Button>
            }
            {!!card?.totalComments &&
              <Button size="small" startIcon={<CommentIcon />} sx={{ minWidth: 'unset' }}>{card?.totalComments}</Button>
            }
            {!!totalChecklistItems &&
              <Button size="small" startIcon={<CheckBoxOutlinedIcon />} sx={{ minWidth: 'unset' }}>{completedChecklistItems}/{totalChecklistItems}</Button>
            }
            {!!card?.attachments?.length &&
              <Button size="small" startIcon={<AttachmentIcon />} sx={{ minWidth: 'unset' }}>{card?.attachments?.length}</Button>
            }
          </Box>
          {layout === 'detailed' && !!card?.customFieldValues?.length && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, width: '100%' }}>
              {card.customFieldValues.map(cfv => {
                if (!cfv.value && typeof cfv.value !== 'boolean') return null
                const fieldDef = boardCustomFields?.find(f => f._id === cfv.customFieldId)
                if (!fieldDef || !fieldDef.showOnFront) return null

                let displayValue = cfv.value
                if (fieldDef.type === 'dropdown') {
                  const opt = fieldDef.options?.find(o => o._id === cfv.value)
                  displayValue = opt ? opt.text : cfv.value
                } else if (fieldDef.type === 'checkbox') {
                  displayValue = cfv.value ? 'Yes' : 'No'
                }

                return (
                  <Box key={cfv.customFieldId} sx={{
                    display: 'inline-block',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2A2E33' : '#091e420f',
                    px: 1, py: 0.25, borderRadius: 1,
                    fontSize: '12px', fontWeight: 500, color: 'text.secondary',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {fieldDef.name}: {displayValue.toString()}
                  </Box>
                )
              })}
            </Box>
          )}
        </CardActions>
      }
    </MuiCard>
  )
}

export function ColumnDragPreview({ column }) {
  const cards = column?.cards?.filter(card => !card.FE_PlaceholderCard) || []

  return (
    // Overlay giữ nguyên độ đặc — chỉ column giữ chỗ trong list (bản gốc, isDragging) mới mờ 0.5
    <div style={{ height: '100%' }}>
      <Box sx={{
        minWidth: '18.75rem',
        maxWidth: '18.75rem',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(22,27,34,0.75)' : theme.palette.background.column),
        backdropFilter: 'blur(12px)',
        border: (theme) => (theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid #dbe3ee'),
        ml: 2,
        borderRadius: '20px',
        height: 'fit-content',
        maxHeight: (theme) => `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`,
        color: 'text.primary'
      }}>
        {/* Header: Typography giả lập ToggleFocusInput (fontSize/weight/padding khớp input thật) */}
        <Box sx={{
          height: (theme) => theme.trello.columnHeaderHeight,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography noWrap sx={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em', px: '6px', flexGrow: 1 }}>
            {column?.title}
          </Typography>
          <ExpandMoreIcon sx={{ color: 'text.primary' }} />
        </Box>

        {/* Danh sách card (khớp sx container của ListCard.jsx) */}
        <Box sx={{
          p: '6px 5px 5px 5px',
          m: '0 5px',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          overflowX: 'hidden',
          overflowY: 'auto',
          scrollbarGutter: 'stable',
          maxHeight: (theme) => `calc(
          ${theme.trello.boardContentHeight} -
          ${theme.spacing(5)} -
          ${theme.trello.columnHeaderHeight} -
          ${theme.trello.columnFooterHeight}
          )`
        }}>
          {cards.map(card => (
            <CardDragPreview key={card._id} card={card} />
          ))}
        </Box>

        {/* Footer tĩnh (khớp hàng footer của Column.jsx) */}
        <Box sx={{ height: (theme) => theme.trello.columnFooterHeight, p: 2 }}>
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button startIcon={<AddCardIcon />}>Add new card</Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <DashboardCustomizeOutlinedIcon fontSize="small" />
              </IconButton>
              <DragHandleIcon sx={{ cursor: 'pointer' }} />
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  )
}
