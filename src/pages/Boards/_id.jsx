import { useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { mapOrder } from '~/utils/sorts'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

// import { mockData } from '~/apis/mock-data'
import {
  fetchBoardDetailAPI,
  createNewCardAPI,
  createNewColumnAPI,
  updateBoardDetailAPI,
  updateColumnDetailAPI,
  moveCarDifferentColumnlAPI
} from '~/apis'
import { generatePlaceholderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash-es'

function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    // tạm thời fix cứng boardId, sẽ sử dụng react-router-dom sau
    const boardId = '69996f5ffacfa157400e51df'
    // call api
    fetchBoardDetailAPI(boardId)
      .then((board) => {
        // sắp xếp thứ tự các column luôn ở đây trước khi dữ liệu xuống dưới các comp con
        board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')

        board.columns.forEach(column => {
          // xử lý vấn đề kéo thả vào một column rỗng
          if (isEmpty(column.cards)) {
            column.cards = [generatePlaceholderCard(column)]
            column.cardOrderIds = [generatePlaceholderCard(column)._id]
          } else {
            // sắp xếp thứ tự các card luôn ở đây trước khi dữ liệu xuống dưới các comp con
            column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
          }
        })
        setBoard(board)
      })
  }, [])

  // func này có nhiệm vụ gọi API tạo mới column và làm lại dữ liệu state board
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId:board._id
    })
    // khi tạo column mới sẽ chưa có card => xử lý vấn đề kéo thả vào một column rỗng
    createdColumn.cards = [generatePlaceholderCard(createdColumn)]
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id]

    // cập nhật state board
    // Phía Front-end chúng ta phải tự làm đúng lại state data board (thay vì phải gọi lại api fetchBoardDetailsAPI)
    // Lưu ý: cách làm này phụ thuộc vào tùy lựa chọn và đặc thù dự án,
    // có nơi thì BE sẽ hỗ trợ trả về luôn toàn bộ Board dù đây có là api tạo Column hay Card đi chăng nữa.
    // => Lúc này FE sẽ nhàn hơn.
    const newBoard = { ...board }
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)
    setBoard(newBoard)
  }

  // func này có nhiệm vụ gọi API tạo mới column và làm lại dữ liệu state board
  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId:board._id
    })
    // cập nhật state board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === createdCard.columnId)
    if (columnToUpdate) {
      // nếu column rỗng (đang chứa 1 cái placeholder-card)
      if (columnToUpdate.cards.some(card => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard]
        columnToUpdate.cardOrderIds = [createdCard._id]
      } else {
        // ngược lại column đã có data thì push vào cuối mảng
        columnToUpdate.cards.push(createdCard)
        columnToUpdate.cardOrderIds.push(createdCard._id)
      }
    }
    console.log(columnToUpdate)
    setBoard(newBoard)
  }

  // func này có nhiệm vụ gọi API và xử lý khi kéo thả column xong
  // khi di chuyển column trong cùng một board
  // Chỉ cần gọi API để cập nhật mảng columnOrderIds của board chứa nó (thay đổi vị trí trong mảng)
  const moveColumn = (dndOrderedColumns) => {
    // cập nhật lại cho chuẩn dữ liệu state board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    setBoard(newBoard)

    // gọi API update board
    updateBoardDetailAPI(newBoard._id, { columnOrderIds: newBoard.columnOrderIds })
  }

  // khi di chuyển card trong cùng một column
  // Chỉ cần gọi API để cập nhật mảng cardOrderIds của Column chứa nó (thay đổi vị trí trong mảng)
  const moveCardSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    // cập nhật lại cho chuẩn dữ liệu state board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    setBoard(newBoard)

    // gọi API update Column
    updateColumnDetailAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }

  // Khi di chuyển card sang Column khác:
  // B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (bản chất là xóa cái _id của Card ra khỏi mảng cũ)
  // B2: Cập nhật mảng cardOrderIds của Column tiếp theo (bản chất là thêm _id của Card vào mảng mới)
  // B3: Cập nhật lại trường columnId mới của cái Card đã kéo
  const moveCardifferentColumn = (currCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {

    // cập nhật lại cho chuẩn dữ liệu state board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    setBoard(newBoard)

    // gọi API xư lý phía BE
    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds
    // xử lý vấn đề khi kéo card cuối cùng ra khỏi column, column rỗng sẽ có placeholder-card, cần xóa nó đi
    // trước khi gửi dữ liệu qua phía BE
    if (prevCardOrderIds[0].includes('placeholder-card')) {
      prevCardOrderIds = []
    }

    moveCarDifferentColumnlAPI({
      currCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nexCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds
    })
  }

  if (!board) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100vw',
        height: '100vh'
      }}>
        <CircularProgress />
        <Typography>Loading board...</Typography>
      </Box>
    )
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board}/>
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
        moveColumn={moveColumn}
        moveCardSameColumn={moveCardSameColumn}
        moveCardifferentColumn={moveCardifferentColumn}
      />
    </Container>
  )
}

export default Board