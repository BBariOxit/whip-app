import Box from '@mui/material/Box'
import SandboxCard from './SandboxCard'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

function SandboxListCards({ cards }) {
  return (
    <SortableContext items={cards?.map(c => c._id)} strategy={verticalListSortingStrategy}>
      <Box sx={{
        p: '6px 5px 5px 5px',
        m: '0 5px',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        overflowX: 'hidden',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 166px)',
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#475569' : '#cbd5e1'),
          borderRadius: '8px'
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#64748b' : '#94a3b8')
        }
      }}>
        {cards?.map(card => (
          <SandboxCard key={card._id} card={card} />
        ))}
      </Box>
    </SortableContext>
  )
}

export default SandboxListCards
