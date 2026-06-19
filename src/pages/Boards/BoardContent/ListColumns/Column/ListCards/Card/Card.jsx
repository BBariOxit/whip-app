import AttachmentIcon from '@mui/icons-material/Attachment'
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined'
import CommentIcon from '@mui/icons-material/Comment'
import GroupIcon from '@mui/icons-material/Group'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import Button from '@mui/material/Button'
import MuiCard from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import React, { useMemo, useCallback } from 'react'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSelector, useDispatch } from 'react-redux'
import { updateCurrentActiveCard, showModalActiveCard } from '~/redux/activeCard/activeCardSlice'
import { selectCurrentActive } from '~/redux/activeBoard/activeBoardSlice'
import Box from '@mui/material/Box'
import { getDueDateState, getDueDateColor, getDueDateTextColor } from '~/utils/getDueDateState'
import { getCardActionGridStyles } from '~/utils/formatters'

function Card({ card }) {
  const dispatch = useDispatch()
  const boardLabels = useSelector((state) => selectCurrentActive(state)?.labels || [])
  const cardLabels = useMemo(
    () => boardLabels.filter(label => card?.labelIds?.includes(label._id)),
    [boardLabels, card?.labelIds]
  )
  const board = useSelector(selectCurrentActive)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card },
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    }
  })
  const dndKitCardStyles = {
    // touchAction: 'none', // dành cho sensor default dạng PointerSensor
    // Nếu sử dụng CSS.Transform như docs sẽ lỗi kiểu stretch
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid' : undefined
  }

  const dueDateState = getDueDateState(card?.dueDate, card?.dueComplete)

  // Tính tổng checklist items
  const totalChecklistItems = card?.checklists?.reduce((sum, cl) => sum + (cl.items?.length || 0), 0) || 0
  const completedChecklistItems = card?.checklists?.reduce((sum, cl) => sum + (cl.items?.filter(i => i.isCompleted)?.length || 0), 0) || 0

  const showCardAction = () => {
    return !!card?.memberIds?.length || !!card?.totalComments || !!card?.attachments?.length || !!card?.dueDate || !!totalChecklistItems || !!card?.customFieldValues?.length
  }

  const setActiveCard = useCallback(() => {
    // cập nhập data cho cái activeCard trong redux
    dispatch(updateCurrentActiveCard(card))
    // hiện modal
    dispatch(showModalActiveCard())
  }, [dispatch, card])

  return (
    <MuiCard
      onClick={setActiveCard}
      ref={setNodeRef} style={dndKitCardStyles} {...attributes} {...listeners}
      sx={{
        cursor: 'pointer',
        overflow: 'hidden',
        display: card?.FE_PlaceholderCard ? 'none' : 'block',
        bgcolor: 'background.paper',
        flexShrink: 0, // Không cho card bị shrink khi list có nhiều card
        '&:hover': {
          borderColor: (theme) => theme.palette.primary.main
        }
        // overflow: card?.FE_PlaceholderCard ? 'hidden' : 'unset',
        // height: card?.FE_PlaceholderCard ? 'none' : 'unset'
      }}>
      {card?.cover &&
        <CardMedia sx={{ height: 140 }}image={card?.cover}/>
      }
      <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
        {!!cardLabels.length &&
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.5, mb: 1 }}>
            {cardLabels.map(label => (
              <Box key={label._id} sx={{
                bgcolor: label.color,
                height: 8,
                borderRadius: 1
              }} title={label.title} />
            ))}
          </Box>
        }
        <Typography>{card?.title}</Typography>
      </CardContent>
      {showCardAction() &&
        <CardActions sx={{ 
          p: '0 8px 8px 8px', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 1,
          '& > *': { margin: '0 !important' } // Fix MUI CardActions adding left margin to subsequent children
        }}>
          {/* Container cho các icon badges - Sử dụng util để thụt lề chuẩn xác khi không có Date */}
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
                  minWidth: 'unset',
                  '&:hover': { bgcolor: getDueDateColor(dueDateState, theme), opacity: 0.85 }
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
          {/* Container cho các custom fields */}
          {!!card?.customFieldValues?.length && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, width: '100%' }}>
              {card.customFieldValues.map(cfv => {
                if (!cfv.value && typeof cfv.value !== 'boolean') return null
                const fieldDef = board?.customFields?.find(f => f._id === cfv.customFieldId)
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
export default React.memo(Card)