import AttachmentIcon from '@mui/icons-material/Attachment'
import CommentIcon from '@mui/icons-material/Comment'
import GroupIcon from '@mui/icons-material/Group'
import Button from '@mui/material/Button'
import MuiCard from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSelector, useDispatch } from 'react-redux'
import { updateCurrentActiveCard, showModalActiveCard } from '~/redux/activeCard/activeCardSlice'
import { selectCurrentActive } from '~/redux/activeBoard/activeBoardSlice'
import Box from '@mui/material/Box'

function Card({ card }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActive)
  const boardLabels = board?.labels || []
  const cardLabels = boardLabels.filter(label => card?.labelIds?.includes(label._id))

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card }
  })
  const dndKitCardStyles = {
    // touchAction: 'none', // dành cho sensor default dạng PointerSensor
    // Nếu sử dụng CSS.Transform như docs sẽ lỗi kiểu stretch
    // https://github.com/clauderic/dnd-kit/issues/117
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid' : undefined
  }

  const showCardAction = () => {
    return !!card?.memberIds?.length || !!card?.comments?.length || !!card?.attachments?.length
  }

  const setActiveCard = () => {
    // cập nhập data cho cái activeCard trong redux
    dispatch(updateCurrentActiveCard(card))
    // hiện modal
    dispatch(showModalActiveCard())
  }

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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {cardLabels.map(label => (
              <Box key={label._id} sx={{
                bgcolor: label.color,
                height: 8,
                width: 40,
                borderRadius: 1
              }} title={label.title} />
            ))}
          </Box>
        }
        <Typography>{card?.title}</Typography>
      </CardContent>
      {showCardAction() &&
        <CardActions sx={{ p: '0 4px 8px 12px' }}>
          {!!card?.memberIds?.length &&
            <Button size="small" startIcon={<GroupIcon />}>{card?.memberIds?.length}</Button>
          }
          {!!card?.comments?.length &&
            <Button size="small" startIcon={<CommentIcon />}>{card?.comments?.length}</Button>
          }
          {!!card?.attachments?.length &&
            <Button size="small" startIcon={<AttachmentIcon />}>{card?.attachments?.length}</Button>
          }
        </CardActions>
      }
    </MuiCard>
  )
}
export default Card