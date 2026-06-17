import {
  DndContext,
  DragOverlay,
  closestCorners,
  defaultDropAnimationSideEffects,
  getFirstCollision,
  pointerWithin,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MouseSensor, TouchSensor } from '~/customLibs/DndKitSensors'
import { generatePlaceholderCard } from '~/utils/formatters'
import SandboxColumn from './SandboxColumn'
import SandboxCard from './SandboxCard'
import { SANDBOX_BOARD } from './sandboxMockData'
import { cloneDeep } from 'lodash-es'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function SandboxBoard() {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 }
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 500 }
  })
  const mySensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  const lastOverId = useRef(null)

  useEffect(() => {
    setOrderedColumns(cloneDeep(SANDBOX_BOARD.columns))
  }, [])

  const findColumnByCardId = (cardId) => {
    return orderedColumns.find(column =>
      column?.cards?.some(card => card._id === cardId))
  }

  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    setOrderedColumns(prevColumns => {
      const overCardIndex = overColumn?.cards.findIndex(card => card._id === overCardId)

      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

      const nextColumns = structuredClone(prevColumns)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

      if (nextActiveColumn) {
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
        if (nextActiveColumn.cards.length === 0) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }

      if (nextOverColumn) {
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }

      return nextColumns
    })
  }

  const handleDragStart = (e) => {
    setActiveDragItemId(e?.active?.id)
    setActiveDragItemType(e?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(e?.active?.data?.current)

    if (e?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(e?.active?.id))
    }
  }

  const handleDragOver = (e) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    const { active, over } = e
    if (!active || !over) return

    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    const { id: overCardId } = over

    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    if (!activeColumn || !overColumn) return

    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn, overCardId, active, over,
        activeColumn, activeDraggingCardId, activeDraggingCardData
      )
    }
  }

  const handleDragEnd = (e) => {
    const { active, over } = e
    if (!active || !over) return

    // Xử lý kéo thả card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      const { id: overCardId } = over

      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      if (!activeColumn || !overColumn) return

      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn, overCardId, active, over,
          activeColumn, activeDraggingCardId, activeDraggingCardData
        )
      } else {
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex((c) => c._id === activeDragItemId)
        const newCardIndex = overColumn?.cards?.findIndex((c) => c._id === overCardId)
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)

        setOrderedColumns(prevColumns => {
          const nextColumns = structuredClone(prevColumns)
          const targetColumn = nextColumns.find(c => c._id === overColumn._id)
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map(card => card._id)
          return nextColumns
        })
      }
    }

    // Xử lý kéo thả column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (active.id !== over.id) {
        const oldColumnIndex = orderedColumns.findIndex((c) => c._id === active.id)
        const newColumnIndex = orderedColumns.findIndex((c) => c._id === over.id)
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
        setOrderedColumns(dndOrderedColumns)
      }
    }

    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } }
    })
  }

  const collisionDetectionStrategy = useCallback((args) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }

    const pointerIntersections = pointerWithin(args)
    // Nếu con trỏ đang ở khoảng trống giữa 2 cột, pointerIntersections sẽ rỗng.
    // Dùng rectIntersection sẽ làm overId nhảy qua nhảy lại giữa 2 cột gây ra hiện tượng "khựng" (stutter/flickering).
    // Giải pháp: Nếu pointerIntersections rỗng, giữ nguyên lastOverId.current để card ở yên cột cũ cho đến khi con trỏ thực sự chạm vào cột mới!
    if (!pointerIntersections?.length) {
      return lastOverId.current ? [{ id: lastOverId.current }] : []
    }

    let overId = getFirstCollision(pointerIntersections, 'id')

    if (overId) {
      // Kiểm tra xem overId có phải là một Column hay không.
      // Column sẽ có thuộc tính cardOrderIds, còn Card thì không.
      const overContainer = args.droppableContainers.find(c => c.id === overId)
      const checkColumn = overContainer?.data?.current?.cardOrderIds ? overContainer?.data?.current : undefined
      if (checkColumn) {
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (checkColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
        if (!overId) overId = checkColumn._id
      }

      lastOverId.current = overId
      return [{ id: overId }]
    }

    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragItemType, orderedColumns])

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* DnD Board */}
      <DndContext
        sensors={mySensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{
          width: '100%',
          flex: 1,
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          p: '60px 0 20px 0',
          '&::-webkit-scrollbar-track': { m: 2 }
        }}>
          <SortableContext items={orderedColumns?.map(c => c._id)} strategy={horizontalListSortingStrategy}>
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
