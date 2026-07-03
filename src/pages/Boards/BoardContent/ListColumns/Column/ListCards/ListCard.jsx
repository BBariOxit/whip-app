import Box from '@mui/material/Box'
import Card from './Card/Card'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React, { useMemo } from 'react'
import { DND_DRAGGING_BODY_CLASS } from '~/customHooks/useBoardDnd'

function ListCard({ cards }) {
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
        // Chừa sẵn chỗ cho scrollbar: khi kéo card làm content tràn maxHeight, scrollbar hiện ra
        // sẽ không co bề ngang cards lại gây giật layout
        scrollbarGutter: 'stable',
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
        },
        // Đang kéo thả: transform của dnd-kit làm nội dung tràn maxHeight khiến scrollbar chớp hiện rất xấu.
        // Làm thumb TRONG SUỐT thay vì display:none để scrollbar giữ nguyên bề rộng (không xô layout)
        // và container vẫn scrollable (auto-scroll của dnd-kit trong cột dài vẫn hoạt động).
        [`body.${DND_DRAGGING_BODY_CLASS} &::-webkit-scrollbar-thumb, body.${DND_DRAGGING_BODY_CLASS} &::-webkit-scrollbar-thumb:hover`]: {
          backgroundColor: 'transparent'
        }
      }}>
        {cards?.map(card => (
          <Card key={card._id} card={card} />
        ))}
      </Box>
    </SortableContext>
  )
}

// memo: khi Column re-render vì context của dnd-kit lúc kéo, danh sách card bail-out nếu mảng cards không đổi
export default React.memo(ListCard)