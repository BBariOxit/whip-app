import { DndContext, DragOverlay } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import { useEffect } from 'react'
import { useBoardDnd, ACTIVE_DRAG_ITEM_TYPE } from '~/customHooks/useBoardDnd'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import ListColumns from './ListColumns/ListColumns'

function BoardContent({
  board,
  moveColumn,
  moveCardSameColumn,
  moveCardifferentColumn
}) {
  const {
    orderedColumns,
    setOrderedColumns,
    dndProps,
    activeDragItemId,
    activeDragItemType,
    activeDragItemData,
    customDropAnimation
  } = useBoardDnd(board.columns, {
    onMoveColumn: moveColumn,
    onMoveCardSameColumn: moveCardSameColumn,
    onMoveCardDifferentColumn: moveCardifferentColumn
  })

  useEffect(() => {
    // column đã được sắp xếp ở comp cha cao nhất
    setOrderedColumns(board.columns)
  }, [board, setOrderedColumns])

  return (
    <DndContext {...dndProps}>
      <Box
        sx={{
          bgcolor: 'background.default',
          width: '100%',
          height: (theme) => theme.trello.boardContentHeight,
          p: '10px 0'
        }}>
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {(activeDragItemId && activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData}/>}
          {(activeDragItemId && activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData}/>}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
