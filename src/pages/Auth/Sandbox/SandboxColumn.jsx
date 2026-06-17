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
    transition: transition || (isDragging ? undefined : 'transform 250ms ease'),
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
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#151b23' : theme.palette.background.column),
          backdropFilter: 'blur(12px)',
          border: (theme) => (theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #dbe3ee'),
          ml: 2,
          borderRadius: '20px',
          height: 'fit-content',
          maxHeight: 'calc(100vh - 100px)',
          color: 'text.primary',
          pb: 2
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
      </Box>
    </div>
  )
}

export default SandboxColumn
