import { DndContext, DragOverlay } from '@dnd-kit/core'
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import { useEffect, useMemo } from 'react'
import SandboxColumn from './SandboxColumn'
import SandboxCard from './SandboxCard'
import { SANDBOX_BOARD } from './sandboxMockData'
import { useBoardDnd, ACTIVE_DRAG_ITEM_TYPE } from '~/customHooks/useBoardDnd'

function SandboxBoard() {
  const {
    orderedColumns,
    setOrderedColumns,
    dndProps,
    activeDragItemId,
    activeDragItemType,
    activeDragItemData,
    customDropAnimation
  } = useBoardDnd(SANDBOX_BOARD.columns)

  useEffect(() => {
    // Sandbox uses a hardcoded initial board which we can optionally reset here
    // Use shallow copy if modifying
    setOrderedColumns([...SANDBOX_BOARD.columns])
  }, [setOrderedColumns])

  const columnIds = useMemo(() => orderedColumns?.map(c => c._id), [orderedColumns])

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* DnD Board */}
      <DndContext {...dndProps}>
        <Box sx={{
          width: '100%',
          flex: 1,
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          p: '60px 0 20px 0',
          '&::-webkit-scrollbar-track': { m: 2 }
        }}>
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {orderedColumns?.map(column => (
              <SandboxColumn key={column._id} column={column} />
            ))}
          </SortableContext>
        </Box>
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {(activeDragItemId && activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <SandboxColumn column={activeDragItemData} />}
          {(activeDragItemId && activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <SandboxCard card={activeDragItemData} />}
        </DragOverlay>
      </DndContext>
    </Box>
  )
}

export default SandboxBoard
