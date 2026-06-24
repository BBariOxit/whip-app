import { DndContext, DragOverlay } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import { useEffect, useRef } from 'react'
import { useBoardDnd, ACTIVE_DRAG_ITEM_TYPE } from '~/customHooks/useBoardDnd'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import ListColumns from './ListColumns/ListColumns'
import { useDispatch, useSelector } from 'react-redux'
import { selectClipboard, selectHoveredItem, setClipboard, updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { duplicateCardAPI } from '~/apis'
import { cloneDeep } from 'lodash-es'
import { toast } from 'sonner'

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

  const dispatch = useDispatch()
  const clipboard = useSelector(selectClipboard)
  const hoveredItem = useSelector(selectHoveredItem)

  const isPasting = useRef(false)

  useEffect(() => {
    const executePasteHotkey = async (targetColumnId) => {
      if (isPasting.current) return
      isPasting.current = true

      try {
        const newCard = await duplicateCardAPI({
          cardId: clipboard.data._id,
          targetColumnId: targetColumnId
        })
    
        const nextBoard = cloneDeep(board)
        const targetColumn = nextBoard.columns.find(c => c._id === targetColumnId)
        
        if (targetColumn) {
          if (targetColumn.cards.some(c => c.FE_PlaceholderCard)) {
            targetColumn.cards = [newCard]
            targetColumn.cardOrderIds = [newCard._id]
          } else {
            targetColumn.cards.push(newCard)
            targetColumn.cardOrderIds.push(newCard._id)
          }
        }
        dispatch(updateCurrentActiveBoard(nextBoard))
        toast.success('Pasted successfully!')
      } catch (error) { 
        console.error(error) 
        toast.error('Failed to paste card!')
      } finally {
        isPasting.current = false
      }
    }

    const handleKeyDown = (e) => {
      if (e.repeat) return
      // Nếu user đang gõ chữ vào input/textarea thì bỏ qua
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

      // BẤM CTRL + C (HOẶC CMD + C)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (hoveredItem && hoveredItem.type === 'CARD') {
          dispatch(setClipboard(hoveredItem))
          toast.success(`Copied: ${hoveredItem.data.title}`)
        }
      }

      // BẤM CTRL + V (HOẶC CMD + V)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (!clipboard || clipboard.type !== 'CARD') return

        if (hoveredItem) {
          if (hoveredItem.type === 'COLUMN') {
            executePasteHotkey(hoveredItem.data._id)
          } else if (hoveredItem.type === 'CARD') {
            executePasteHotkey(hoveredItem.data.columnId)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hoveredItem, clipboard, board, dispatch])

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
