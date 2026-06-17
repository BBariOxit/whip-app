import AttachmentIcon from '@mui/icons-material/Attachment'
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined'
import CommentIcon from '@mui/icons-material/Comment'
import GroupIcon from '@mui/icons-material/Group'
import Button from '@mui/material/Button'
import MuiCard from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SandboxCard({ card }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card }
  })
  const dndKitCardStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid' : undefined
  }

  // Tính tổng checklist items
  const totalChecklistItems = card?.checklists?.reduce((sum, cl) => sum + (cl.items?.length || 0), 0) || 0
  const completedChecklistItems = card?.checklists?.reduce((sum, cl) => sum + (cl.items?.filter(i => i.isCompleted)?.length || 0), 0) || 0

  const showCardAction = () => {
    return !!card?.memberIds?.length || !!card?.totalComments || !!card?.attachments?.length || !!totalChecklistItems
  }

  return (
    <Tooltip title="Sign in to unlock full features" placement="top" arrow enterDelay={600}>
      <MuiCard
        ref={setNodeRef} style={dndKitCardStyles} {...attributes} {...listeners}
        sx={{
          cursor: 'grab',
          overflow: 'hidden',
          display: card?.FE_PlaceholderCard ? 'none' : 'block',
          bgcolor: 'background.paper',
          flexShrink: 0,
          '&:hover': {
            borderColor: (theme) => theme.palette.primary.main
          },
          '&:active': {
            cursor: 'grabbing'
          }
        }}>
        {/* Label Colors */}
        <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
          {!!card?.labelColors?.length &&
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
              {card.labelColors.map((color, index) => (
                <Box key={index} sx={{
                  bgcolor: color,
                  height: 8,
                  width: 40,
                  borderRadius: 1
                }} />
              ))}
            </Box>
          }
          <Typography sx={{ fontSize: '0.875rem' }}>{card?.title}</Typography>
        </CardContent>
        {showCardAction() &&
          <CardActions sx={{ p: '0 8px 8px 8px', gap: 0.5, flexWrap: 'wrap' }}>
            {!!card?.memberIds?.length &&
              <Button size="small" startIcon={<GroupIcon />} sx={{ fontSize: '12px', minWidth: 'unset', pointerEvents: 'none' }}>
                {card?.memberIds?.length}
              </Button>
            }
            {!!card?.totalComments &&
              <Button size="small" startIcon={<CommentIcon />} sx={{ fontSize: '12px', minWidth: 'unset', pointerEvents: 'none' }}>
                {card?.totalComments}
              </Button>
            }
            {!!totalChecklistItems &&
              <Button size="small" startIcon={<CheckBoxOutlinedIcon />} sx={{ fontSize: '12px', minWidth: 'unset', pointerEvents: 'none' }}>
                {completedChecklistItems}/{totalChecklistItems}
              </Button>
            }
            {!!card?.attachments?.length &&
              <Button size="small" startIcon={<AttachmentIcon />} sx={{ fontSize: '12px', minWidth: 'unset', pointerEvents: 'none' }}>
                {card?.attachments?.length}
              </Button>
            }
          </CardActions>
        }
      </MuiCard>
    </Tooltip>
  )
}

export default SandboxCard
