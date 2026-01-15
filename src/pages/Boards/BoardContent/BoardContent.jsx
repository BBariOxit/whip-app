import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import Box from '@mui/material/Box'
import { useEffect, useState } from 'react'
import { mapOrder } from '~/utils/sorts'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import ListColumns from './ListColumns/ListColumns'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board }) {
  //https://docs.dndkit.com/api-documentation/sensors
  // nếu dùng Pointer sensor mặc định thì phải kết hợp với thuộc tính css touchAction: none ở những 
  // phần tử kéo thả- nhưng mà còn bug
  // const pointerSensor = useSensor(PointerSensor, {
  //   activationConstraint: {
  //     distance: 10
  //   }
  // })
  //yêu cầu chuột di chuyển 10px thì mới di chuyển event , fix trường hợp click bị gọi event
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10
    }
  })
  //nhấn giữ 250ms và dung sai cảm ứng 500px thì mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 500
    }
  })
  // const mySensors = useSensors(pointerSensor)
  // ưu tiên sử dụng kết hợp 2 loại sensors là mouse và touch để có trải nghiệm trên mobile tốt nhất, ko bị bug
  const mySensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])
  // cùng 1 thời điểm chỉ có 1 phần tử đang được kéo(column, card)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  useEffect(() => {
    const oderedColumns = mapOrder(board?.columns, board?.columnOrderIds, '_id')
    setOrderedColumns(oderedColumns)
  }, [board])

  //tìm 1 cái column theo cardId
  const findColumnByCardId = (cardId) => {
    // Đoạn này cần lưu ý, nên dùng c.cards thay vì c.cardOrderIds bởi vì ở bước handleDragOver chúng ta sẽ
    // làm dữ liệu cards hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới.
    return orderedColumns.find(column =>
      column?.cards?.some(card => card._id === cardId))
  }

  // Trigger khi bắt đầu kéo(drag) một phần tử
  const handleDragStart = (e) => {
    // console.log('handleDragStart:', e)
    setActiveDragItemId(e?.active?.id)
    setActiveDragItemType(e?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(e?.active?.data?.current)

    //nếu là kéo card thì mới thực hiện hành động set giá trị oldColumn
    if (e?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(e?.active?.id))
    }
  }

  //trigger trong quá trình kéo(drag) một phần tử
  const handleDragOver = (e) => {
    //ko làm gì thểm khi đang kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return
    }
    //còn nếu kéo card thì xử lý thêm để có thể kéo card qua các column
    // console.log('handleDragOver:', e)
    const { active, over } = e

    //cần đẳm bảo nếu ko tồn tại active hoặc over (khi kéo ra khỏi phạm vi container ) thì ko làm gì tránh crash trang
    if (!active || !over) return

    //activeDraggingCard là cái card đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    //overCard là cái card đang tương tác trên hoặc dưới so với cái card đang được kéo ở trên
    const { id: overCardId } = over

    //tìm 2 cái column theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId) //tìm column đang kéo(drag)
    const overColumn = findColumnByCardId(overCardId) //tìm column đang được drag tới

    //nếu ko tồn tại 1 trong 2 column thì ko làm gì hết tránh crash trang
    if (!activeColumn || !overColumn) return

    // Xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau,
    // còn nếu kéo card trong chính column ban đầu của nó thì không làm gì.
    // Vì đây đang là đoạn xử lý lúc kéo (handleDragOver),
    // còn xử lý lúc kéo xong xuôi thì nó lại là vấn đề khác ở (handleDragEnd)
    if (activeColumn._id !== overColumn._id) {
      setOrderedColumns(prevColumns => {
        // tìm vị trí (index) của cái overCard trong column đích (nơi mà activeCard sắp đc thả)
        const overCardIndex = overColumn?.cards.findIndex(card => card._id === overCardId)

        // Logic tính toán "cardIndex mới" (trên hoặc dưới của overCard), lấy chuẩn ra từ code của thư viện
        let newCardIndex
        const isBelowOverItem = active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height
        const modifier = isBelowOverItem ? 1 : 0
        newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

        //Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return – cập nhật lại OrderedColumnsState mới
        const nextColumn = structuredClone(prevColumns)
        const nextActiveColumn = nextColumn.find(column => column._id === activeColumn._id)
        const nextOverColumn = nextColumn.find(column => column._id === overColumn._id)

        //column cũ
        if (nextActiveColumn) {
          //Xóa card ở cái column active (cũng có thể hiểu là column cũ, cái lúc mà kéo card ra khỏi nó để sang column khác)
          nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
          //cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
          nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
        }

        //column mới
        if (nextOverColumn) {
          // Kiểm tra xem card đang kéo nó có tồn tại ở overColumn chưa, nếu có thì cần xóa nó trước
          nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)
          // Tiếp theo là thêm cái card đang kéo vào overColumn theo vị trí index mới
          nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, activeDraggingCardData)
          //cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
          nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
        }

        // console.log('isBelowOverItem: ', isBelowOverItem)
        // console.log('modifier: ', modifier)
        // console.log('newCardIndex: ', newCardIndex)
        return nextColumn
      })
    }
  }

  // Trigger khi thả(drop) một phần tử, khi kết thúc hành động kéo 1 phần tử
  const handleDragEnd = (e) => {
    // console.log('handleDragEnd:', e)

    const { active, over } = e

    //cần đẳm bảo nếu ko tồn tại active hoặc over (khi kéo ra khỏi phạm vi container ) thì ko làm gì tránh crash trang
    if (!active || !over) return

    //xử lý kéo thả card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      //activeDraggingCard là cái card đang được kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      //overCard là cái card đang tương tác trên hoặc dưới so với cái card đang được kéo ở trên
      const { id: overCardId } = over

      //tìm 2 cái column theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId) //tìm column đang kéo(drag)
      const overColumn = findColumnByCardId(overCardId) //tìm column đang được drag tới

      //nếu ko tồn tại 1 trong 2 column thì ko làm gì hết tránh crash trang
      if (!activeColumn || !overColumn) return

      console.log('activeDragItemData: ', activeDragItemData)

      // console.log('oldColumnWhenDraggingCard: ', oldColumnWhenDraggingCard)
      // console.log('overColumn: ', overColumn)
      // Phải dùng tới .columnId hoặc oldColumnWhenDraggingCard._id (set vào state từ bước handleDragStart) chứ không phải activeData
      // trong scope handleDragEnd này vì sau khi đi qua onDragOver tới đây là state của card đã bị cập nhật một lần rồi.
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        // Hành động kéo thả card giữa 2 column khác nhau
        setOrderedColumns(prevColumns => {
        // tìm vị trí (index) của cái overCard trong column đích (nơi mà activeCard sắp đc thả)
          const overCardIndex = overColumn?.cards.findIndex(card => card._id === overCardId)

          // Logic tính toán "cardIndex mới" (trên hoặc dưới của overCard), lấy chuẩn ra từ code của thư viện
          let newCardIndex
          const isBelowOverItem = active.rect.current.translated &&
            active.rect.current.translated.top > over.rect.top + over.rect.height
          const modifier = isBelowOverItem ? 1 : 0
          newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

          //Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return – cập nhật lại OrderedColumnsState mới
          const nextColumn = structuredClone(prevColumns)
          const nextActiveColumn = nextColumn.find(column => column._id === activeColumn._id)
          const nextOverColumn = nextColumn.find(column => column._id === overColumn._id)

          //column cũ
          if (nextActiveColumn) {
            //Xóa card ở cái column active (cũng có thể hiểu là column cũ, cái lúc mà kéo card ra khỏi nó để sang column khác)
            nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)
            //cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
            nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
          }

          //column mới
          if (nextOverColumn) {
            // Kiểm tra xem card đang kéo nó có tồn tại ở overColumn chưa, nếu có thì cần xóa nó trước
            nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)
            // Đối với trường hợp dragEnd thì phải cập nhật lại chuẩn dữ liệu columnId trong card 
            // sau khi kéo card giữa 2 column khác nhau.
            const rebuild_activeDraggingCardData = {
              ...activeDraggingCardData,
              columnId: nextOverColumn._id
            }
            // Tiếp theo là thêm cái card đang kéo vào overColumn theo vị trí index mới
            nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)
            //cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
            nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
          }

          // console.log('isBelowOverItem: ', isBelowOverItem)
          // console.log('modifier: ', modifier)
          // console.log('newCardIndex: ', newCardIndex)
          return nextColumn
        })
      } else {
        // Hành động kéo thả card trong cùng 1 cái column

        //lấy vị trí cũ (từ thằng oldColumnWhenDraggingCard)
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex((c) => c._id === activeDragItemId)
        //lấy vị trí mới (từ thằng over)
        const newCardIndex = overColumn?.cards?.findIndex((c) => c._id === overCardId)
        // Dùng arrayMove vì kéo card trong một cái column thì tương tự với logic kéo column trong một cái board content
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)
        // console.log(dndOrderedCards)
        setOrderedColumns(prevColumns => {
          //Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return – cập nhật lại OrderedColumnsState mới
          const nextColumns = structuredClone(prevColumns)

          //tìm tới cái column mà chúng ta đang thả
          const targetColumn = nextColumns.find(c => c._id === overColumn._id)
          //cập nhật lại 2 giá trị mới là card và cardOrderIds trong cái targetColumn
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map(card => card._id)

          //trả về giá trị state mới chuẩn vị trí
          return nextColumns
        })
      }
    }

    //xử lý kéo thả column trong boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      console.log('hành động kéo thả column')
      //nếu vị trí sau khi kéo thả khác với vị trí ban đầu
      if (active.id != over.id) {
        //lấy vị trí cũ (từ thằng active)
        const oldColumnIndex = orderedColumns.findIndex((c) => c._id === active.id)
        //lấy vị trí mới (từ thằng over)
        const newColumnIndex = orderedColumns.findIndex((c) => c._id === over.id)
        // Dùng arrayMove của thằng dnd-kit để sắp xếp lại mảng Columns ban đầu
        // Code của arrayMove ở đây: dnd-kit/packages/sortable/src/utilities/arrayMove.ts
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
        // 2 cái log dữ liệu này sau để gọi API
        // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
        // console.log('dndOrderedColumns: ', dndOrderedColumns)
        // console.log('dndOrderedColumnsIds: ', dndOrderedColumnsIds)

        //cập nhật lại state column ban đầu sau khi đã kéo thả
        setOrderedColumns(dndOrderedColumns)
      }
    }

    //những dữ liệu sau khi kéo thả này luôn phải đưa về giá trị null mặc định ban đầu
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }


  //animation khi thả(drop) phần tử
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }

  return (
    <DndContext
      sensors={mySensors}
      // Thuật toán phát hiện va chạm (nếu không có nó thì card với cover lớn sẽ không kéo qua Column được vì
      // lúc này nó đang bị conflict giữa card và column), chúng ta sẽ dùng closestCorners thay vì closestCenter
      // https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
          width: '100%',
          height: (theme) => theme.trello.boardContentHeight,
          p: '10px 0'
        }}>
        <ListColumns columns={orderedColumns}/>
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
