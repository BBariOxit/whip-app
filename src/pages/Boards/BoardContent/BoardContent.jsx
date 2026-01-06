import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import {
  DndContext,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useState, useEffect } from 'react'

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
  useEffect(() => {
    const oderedColumns = mapOrder(board?.columns, board?.columnOrderIds, '_id')
    setOrderedColumns(oderedColumns)
  }, [board])

  const handleDragEnd = (e) => {
    // console.log('handleDragEnd:', e)
    const { active, over } = e

    //kiểm tra nếu ko tồn tại over (kéo linh tinh ra ngoài thì return luôn tránh lỗi)
    if (!over) return

    //nếu vị trí sau khi kéo thả khác với vị trí ban đầu
    if (active.id != over.id) {
      //lấy vị trí cũ (từ thằng active)
      const oldIndex = orderedColumns.findIndex((c) => c._id === active.id)
      //lấy vị trí mới (từ thằng over)
      const newIndex = orderedColumns.findIndex((c) => c._id === over.id)
      // Dùng arrayMove của thằng dnd-kit để sắp xếp lại mảng Columns ban đầu
      // Code của arrayMove ở đây: dnd-kit/packages/sortable/src/utilities/arrayMove.ts
      const dndOrderedColumns = arrayMove(orderedColumns, oldIndex, newIndex)
      // 2 cái log dữ liệu này sau để gọi API
      // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
      // console.log('dndOrderedColumns: ', dndOrderedColumns)
      // console.log('dndOrderedColumnsIds: ', dndOrderedColumnsIds)

      //cập nhật lại state column ban đầu sau khi đã kéo thả
      setOrderedColumns(dndOrderedColumns)
    }
  }
  return (
    <DndContext onDragEnd={handleDragEnd} sensors={mySensors}>
      <Box
        sx={{
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
          width: '100%',
          height: (theme) => theme.trello.boardContentHeight,
          p: '10px 0'
        }}>
        <ListColumns columns={orderedColumns}/>
      </Box>
    </DndContext>
  )
}

export default BoardContent
