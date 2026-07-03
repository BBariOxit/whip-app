import {
  closestCorners,
  closestCenter,
  defaultDropAnimationSideEffects,
  getFirstCollision,
  pointerWithin,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MouseSensor, TouchSensor } from '~/customLibs/DndKitSensors'
import { generatePlaceholderCard } from '~/utils/formatters'

export const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

// Class đánh dấu "đang kéo thả" gắn lên <body>. CSS ở ListCard dựa vào class này để làm
// thumb scrollbar trong suốt lúc kéo — transform của dnd-kit làm nội dung tràn overflow
// khiến scrollbar của column chớp hiện/tắt rất xấu. Toggle bằng classList nên không tốn re-render nào.
export const DND_DRAGGING_BODY_CLASS = 'is-dnd-dragging'

export const useBoardDnd = (initialColumns, {
  onMoveColumn = () => {},
  onMoveCardSameColumn = () => {},
  onMoveCardDifferentColumn = () => {}
} = {}) => {
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
  // Đang kéo dở thì chặn sync từ initialColumns, tránh card bị nhảy về vị trí cũ giữa chừng
  const isDraggingRef = useRef(false)
  // Snapshot columns trước khi kéo, để khôi phục khi drag bị cancel (Esc) hoặc thả ra ngoài vùng droppable
  const columnsBeforeDragRef = useRef(null)

  useEffect(() => {
    if (isDraggingRef.current) return
    setOrderedColumns(initialColumns || [])
  }, [initialColumns])

  const findColumnByCardId = (cardId) => {
    return orderedColumns.find(column =>
      column?.cards?.some(card => card._id === cardId))
  }

  // Hàm pure, không setState / gọi API bên trong để dùng được trong functional updater
  const computeMoveCardBetweenColumns = (
    prevColumns, overColumn, overCardId, active, over,
    activeColumn, activeDraggingCardId, activeDraggingCardData
  ) => {
    const overCardIndex = overColumn?.cards.findIndex(card => card._id === overCardId)

    const isBelowOverItem = active.rect.current.translated &&
      active.rect.current.translated.top > over.rect.top + over.rect.height
    const modifier = isBelowOverItem ? 1 : 0
    const newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

    const nextColumns = [...prevColumns]

    const nextActiveColumnIndex = nextColumns.findIndex(column => column._id === activeColumn._id)
    const nextOverColumnIndex = nextColumns.findIndex(column => column._id === overColumn._id)

    if (nextActiveColumnIndex > -1) {
      nextColumns[nextActiveColumnIndex] = { ...nextColumns[nextActiveColumnIndex] }
      nextColumns[nextActiveColumnIndex].cards = nextColumns[nextActiveColumnIndex].cards.filter(card => card._id !== activeDraggingCardId)
      if (nextColumns[nextActiveColumnIndex].cards.length === 0) {
        nextColumns[nextActiveColumnIndex].cards = [generatePlaceholderCard(nextColumns[nextActiveColumnIndex])]
      }
      nextColumns[nextActiveColumnIndex].cardOrderIds = nextColumns[nextActiveColumnIndex].cards.map(card => card._id)
    }

    if (nextOverColumnIndex > -1) {
      nextColumns[nextOverColumnIndex] = { ...nextColumns[nextOverColumnIndex] }
      nextColumns[nextOverColumnIndex].cards = nextColumns[nextOverColumnIndex].cards.filter(card => card._id !== activeDraggingCardId)
      const rebuild_activeDraggingCardData = {
        ...activeDraggingCardData,
        columnId: nextColumns[nextOverColumnIndex]._id
      }
      nextColumns[nextOverColumnIndex].cards = nextColumns[nextOverColumnIndex].cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)
      nextColumns[nextOverColumnIndex].cards = nextColumns[nextOverColumnIndex].cards.filter(card => !card.FE_PlaceholderCard)
      nextColumns[nextOverColumnIndex].cardOrderIds = nextColumns[nextOverColumnIndex].cards.map(card => card._id)
    }

    return nextColumns
  }

  const resetDragState = () => {
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
    isDraggingRef.current = false
    columnsBeforeDragRef.current = null
    document.body.classList.remove(DND_DRAGGING_BODY_CLASS)
  }

  // Phòng hờ unmount giữa chừng khi đang kéo (chuyển trang...) thì gỡ class khỏi body
  useEffect(() => {
    return () => document.body.classList.remove(DND_DRAGGING_BODY_CLASS)
  }, [])

  const handleDragStart = (e) => {
    isDraggingRef.current = true
    columnsBeforeDragRef.current = orderedColumns
    document.body.classList.add(DND_DRAGGING_BODY_CLASS)

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
      // Functional updater để các event dragOver bắn liên tiếp luôn tính trên state mới nhất
      setOrderedColumns(prevColumns => computeMoveCardBetweenColumns(
        prevColumns, overColumn, overCardId, active, over,
        activeColumn, activeDraggingCardId, activeDraggingCardData
      ))
    }
  }

  const handleDragEnd = (e) => {
    const { active, over } = e

    if (!active || !over) {
      // Thả ra ngoài vùng droppable: chưa gọi API nào nên trả columns về trạng thái trước khi kéo
      if (columnsBeforeDragRef.current) setOrderedColumns(columnsBeforeDragRef.current)
      resetDragState()
      return
    }

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      const { id: overCardId } = over

      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      if (activeColumn && overColumn) {
        if (oldColumnWhenDraggingCard._id !== overColumn._id) {
          const nextColumns = computeMoveCardBetweenColumns(
            orderedColumns, overColumn, overCardId, active, over,
            activeColumn, activeDraggingCardId, activeDraggingCardData
          )
          setOrderedColumns(nextColumns)
          onMoveCardDifferentColumn(
            activeDraggingCardId,
            oldColumnWhenDraggingCard._id,
            overColumn._id,
            nextColumns
          )
        } else {
          const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex((c) => c._id === activeDragItemId)
          const newCardIndex = overColumn?.cards?.findIndex((c) => c._id === overCardId)
          const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)
          const dndOrderedCardIds = dndOrderedCards.map(card => card._id)

          setOrderedColumns(prevColumns => {
            const nextColumns = [...prevColumns]
            const targetColumnIndex = nextColumns.findIndex(c => c._id === overColumn._id)
            if (targetColumnIndex > -1) {
              nextColumns[targetColumnIndex] = { ...nextColumns[targetColumnIndex] }
              nextColumns[targetColumnIndex].cards = dndOrderedCards
              nextColumns[targetColumnIndex].cardOrderIds = dndOrderedCardIds
            }
            return nextColumns
          })

          onMoveCardSameColumn(dndOrderedCards, dndOrderedCardIds, oldColumnWhenDraggingCard._id)
        }
      }
    }

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (active.id !== over.id) {
        const oldColumnIndex = orderedColumns.findIndex((c) => c._id === active.id)
        const newColumnIndex = orderedColumns.findIndex((c) => c._id === over.id)
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
        setOrderedColumns(dndOrderedColumns)

        onMoveColumn(dndOrderedColumns)
      }
    }

    resetDragState()
  }

  const handleDragCancel = () => {
    // dragOver có thể đã di chuyển card sang cột khác trong local state, cancel thì phải trả về chỗ cũ
    if (columnsBeforeDragRef.current) setOrderedColumns(columnsBeforeDragRef.current)
    resetDragState()
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
    if (!pointerIntersections?.length) {
      return lastOverId.current ? [{ id: lastOverId.current }] : []
    }

    let overId = getFirstCollision(pointerIntersections, 'id')

    if (overId) {
      const overContainer = args.droppableContainers.find(c => c.id === overId)
      const checkColumn = overContainer?.data?.current?.cardOrderIds ? overContainer?.data?.current : undefined
      if (checkColumn) {
        overId = closestCenter({
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
  }, [activeDragItemType])

  return {
    orderedColumns,
    setOrderedColumns,
    dndProps: {
      sensors: mySensors,
      collisionDetection: collisionDetectionStrategy,
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragEnd: handleDragEnd,
      onDragCancel: handleDragCancel
    },
    activeDragItemId,
    activeDragItemType,
    activeDragItemData,
    customDropAnimation
  }
}
