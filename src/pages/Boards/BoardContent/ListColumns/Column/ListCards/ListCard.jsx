import Box from '@mui/material/Box'
import Card from './Card/Card'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMemo } from 'react'

function ListCard({ cards, isReadOnly }) {
  const cardIds = useMemo(() => cards?.map(c => c._id) || [], [cards])

  return (
    <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
      <Box sx={{
        p: '6px 5px 5px 5px',
        m: '0 5px',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        overflowX: 'hidden',
        overflowY: 'auto',
        maxHeight: (theme) => `calc(
        ${theme.trello.boardContentHeight} -
        ${theme.spacing(5)} -
        ${theme.trello.columnHeaderHeight} -
        ${theme.trello.columnFooterHeight}
        )`,
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#475569' : '#cbd5e1')
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#64748b' : '#94a3b8')
        }
      }}>
        {cards?.map(card => (
          <Card key={card._id} card={card} isReadOnly={isReadOnly} />
        ))}
      </Box>
    </SortableContext>
  )
}

export default ListCard