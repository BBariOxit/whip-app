import DragHandleIcon from '@mui/icons-material/DragHandle'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import SandboxListCards from './SandboxListCards'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SandboxColumn({ column }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data: { ...column }
  })
  const dndKitColumnStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: '100%',
    opacity: isDragging ? 0.5 : undefined
  }

  const orderedCards = column.cards

  return (
    <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes}>
      <Box
        {...listeners}
        sx={{
          minWidth: '280px',
          maxWidth: '280px',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(22,27,34,0.75)' : theme.palette.background.column),
          backdropFilter: 'blur(12px)',
          border: (theme) => (theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid #dbe3ee'),
          ml: 2,
          borderRadius: '20px',
          height: 'fit-content',
          maxHeight: 'calc(100vh - 200px)',
          color: 'text.primary'
        }}>

        {/* Column Header */}
        <Box sx={{
          height: '50px',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant='h6' sx={{
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' }
          }}>
            {column?.title}
          </Typography>
          <Tooltip title='Drag to move'>
            <DragHandleIcon sx={{ cursor: 'grab', color: 'text.secondary', fontSize: '20px' }} />
          </Tooltip>
        </Box>

        {/* ListCards */}
        <SandboxListCards cards={orderedCards} />

        {/* Column Footer - minimal */}
        <Box sx={{
          height: '40px',
          p: '8px 16px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Typography variant='body2' sx={{
            color: 'text.secondary',
            fontSize: '0.8rem',
            fontStyle: 'italic'
          }}>
            {column?.cards?.filter(c => !c.FE_PlaceholderCard)?.length || 0} cards
          </Typography>
        </Box>
      </Box>
    </div>
  )
}

export default SandboxColumn
