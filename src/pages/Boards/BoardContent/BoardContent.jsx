import { DndContext, DragOverlay } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import { useEffect, useRef } from 'react'
import { useBoardDnd, ACTIVE_DRAG_ITEM_TYPE } from '~/customHooks/useBoardDnd'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import ListColumns from './ListColumns/ListColumns'
import { useDispatch, useSelector } from 'react-redux'
import { selectClipboard, selectHoveredItem, setClipboard, updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { duplicateCardAPI, duplicateColumnAPI } from '~/apis'
import { cloneDeep } from 'lodash-es'
import { toast } from 'sonner'

function BoardContent({
  board,
  moveColumn,
  moveCardSameColumn,
  moveCardifferentColumn,
  isReadOnly
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

  // Lưu trữ state mới nhất vào ref để event listener không bị tháo lắp liên tục khi rê chuột
  const stateRef = useRef({ board, clipboard, hoveredItem })
  useEffect(() => {
    stateRef.current = { board, clipboard, hoveredItem }
  }, [board, clipboard, hoveredItem])

  const isPasting = useRef(false)
  const isCopying = useRef(false)

  useEffect(() => {
    const executePasteCardHotkey = async (targetColumnId) => {
      if (isPasting.current) return
      isPasting.current = true

      const { board: currentBoard, clipboard: currentClipboard } = stateRef.current

      try {
        const newCard = await duplicateCardAPI({
          cardId: currentClipboard.data._id,
          targetColumnId: targetColumnId
        })
    
        const nextBoard = cloneDeep(currentBoard)
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

    const executePasteColumnHotkey = async (targetHoveredColumnId) => {
      if (isPasting.current) return
      isPasting.current = true

      const { board: currentBoard, clipboard: currentClipboard } = stateRef.current

      try {
        const nextBoard = cloneDeep(currentBoard)
        const currentIndex = nextBoard.columnOrderIds.indexOf(targetHoveredColumnId)
        const targetIndex = currentIndex !== -1 ? currentIndex + 1 : nextBoard.columnOrderIds.length

        const newColumnWithCards = await duplicateColumnAPI({
          columnId: currentClipboard.data._id,
          boardId: currentBoard._id,
          targetIndex: targetIndex
        })

        nextBoard.columns.splice(targetIndex, 0, newColumnWithCards)
        nextBoard.columnOrderIds.splice(targetIndex, 0, newColumnWithCards._id)

        dispatch(updateCurrentActiveBoard(nextBoard))
        toast.success('Pasted successfully!')
      } catch (error) {
        console.error(error)
        toast.error('Failed to paste column!')
      } finally {
        isPasting.current = false
      }
    }

    const handleKeyDown = (e) => {
      if (e.repeat) return
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

      const { board: currentBoard, clipboard: currentClipboard } = stateRef.current

      // Tự động dò tìm Item đang được chuột chỉ vào thông qua DOM (Chính xác 100%)
      let currentHoveredItem = null
      const hoveredCardNode = document.querySelector('[data-card-id]:hover')
      if (hoveredCardNode) {
        const cardId = hoveredCardNode.getAttribute('data-card-id')
        for (const col of currentBoard.columns) {
          const c = col.cards?.find(card => card._id === cardId)
          if (c) { currentHoveredItem = { type: 'CARD', data: c }; break }
        }
      } else {
        const hoveredColumnNode = document.querySelector('[data-column-id]:hover')
        if (hoveredColumnNode) {
          const colId = hoveredColumnNode.getAttribute('data-column-id')
          const col = currentBoard.columns.find(c => c._id === colId)
          if (col) { currentHoveredItem = { type: 'COLUMN', data: col } }
        }
      }

      // BẤM CTRL + C (HOẶC CMD + C)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (isReadOnly || isCopying.current) return
        if (currentHoveredItem) {
          isCopying.current = true
          dispatch(setClipboard(currentHoveredItem))
          toast.success(`Copied: ${currentHoveredItem.data.title}`)
          
          setTimeout(() => {
            isCopying.current = false
          }, 300) // Chống spam 300ms
        }
      }

      // BẤM CTRL + V (HOẶC CMD + V)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (isReadOnly || !currentClipboard || isPasting.current) return

        if (currentClipboard.type === 'CARD') {
          if (currentHoveredItem) {
            if (currentHoveredItem.type === 'COLUMN') {
              executePasteCardHotkey(currentHoveredItem.data._id)
            } else if (currentHoveredItem.type === 'CARD') {
              executePasteCardHotkey(currentHoveredItem.data.columnId)
            }
          }
        } else if (currentClipboard.type === 'COLUMN') {
          if (currentHoveredItem && currentHoveredItem.type === 'COLUMN') {
            executePasteColumnHotkey(currentHoveredItem.data._id)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch]) // Dependency rỗng để tránh tháo lắp Event Listener liên tục

  return (
    <DndContext {...dndProps}>
      <Box
        sx={{
          bgcolor: 'background.default',
          width: '100%',
          height: (theme) => theme.trello.boardContentHeight,
          p: '10px 0'
        }}>
        <ListColumns columns={orderedColumns} isReadOnly={isReadOnly} />
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
