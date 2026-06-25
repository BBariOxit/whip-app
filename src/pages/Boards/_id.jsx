import Container from '@mui/material/Container'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AppBar from '~/components/AppBar/AppBar'
import {
  fetchBoardDetailAPI,
  selectCurrentActive,
  updateCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'

// import { mockData } from '~/apis/mock-data'
import { cloneDeep } from 'lodash-es'
import { useParams } from 'react-router-dom'
import {
  moveCarDifferentColumnlAPI,
  updateBoardDetailAPI,
  updateColumnDetailAPI
} from '~/apis'
import PageLoadingSpinner from '~/components/Loading/pageLoadingSpinner'
import ActiveCard from '~/components/Modal/ActiveCard/ActiveCard'
import { selectCurrentUser } from '~/redux/user/userSlice'

function Board() {
  const dispatch = useDispatch()
  // ko dùng state của component nữa, mà dùng redux
  // const [board, setBoard] = useState(null)
  const board = useSelector(selectCurrentActive)
  const currentUser = useSelector(selectCurrentUser)
  const { boardId } = useParams()

  useEffect(() => {
    // Reset board data before fetching new board to prevent flashing previous board UI
    dispatch(updateCurrentActiveBoard(null))
    // call api
    dispatch(fetchBoardDetailAPI(boardId))
  }, [dispatch, boardId])

  // func này có nhiệm vụ gọi API và xử lý khi kéo thả column xong
  // khi di chuyển column trong cùng một board
  // Chỉ cần gọi API để cập nhật mảng columnOrderIds của board chứa nó (thay đổi vị trí trong mảng)
  const moveColumn = (dndOrderedColumns) => {
    if (isReadOnly) return // Không cho di chuyển nếu là readOnly

    // cập nhật lại cho chuẩn dữ liệu state board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    /**
     * Trường hợp dùng Spread Operator này thì lại không sao bởi vì ở đây chúng ta không dùng push như ở trên
     * làm thay đổi trực tiếp kiểu mở rộng mảng, mà chỉ đang gán lại toàn bộ giá trị columns và columnOrderIds
     * bằng 2 mảng mới. Tương tự như cách làm concat ở trường hợp createNewColumn thôi :))
     */
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // gọi API update board
    updateBoardDetailAPI(newBoard._id, { columnOrderIds: newBoard.columnOrderIds })
  }

  // khi di chuyển card trong cùng một column
  // Chỉ cần gọi API để cập nhật mảng cardOrderIds của Column chứa nó (thay đổi vị trí trong mảng)
  const moveCardSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    if (isReadOnly) return // Không cho di chuyển nếu là readOnly

    // cập nhật lại cho chuẩn dữ liệu state board

    /**
     * Cannot assign to read only property 'cards' of object
     * Trường hợp Immutability ở đây đã đụng tới giá trị cards đang được coi là chỉ đọc read only – (nested
     * object – can thiệp sâu dữ liệu)
     */
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // gọi API update Column
    updateColumnDetailAPI(columnId, { cardOrderIds: dndOrderedCardIds })
  }

  // Khi di chuyển card sang Column khác:
  // B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (bản chất là xóa cái _id của Card ra khỏi mảng cũ)
  // B2: Cập nhật mảng cardOrderIds của Column tiếp theo (bản chất là thêm _id của Card vào mảng mới)
  // B3: Cập nhật lại trường columnId mới của cái Card đã kéo
  const moveCardifferentColumn = (currCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    if (isReadOnly) return // Không cho di chuyển nếu là readOnly

    // cập nhật lại cho chuẩn dữ liệu state board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    // Tương tự đoạn xử lý chỗ hàm moveColumns nên không ảnh hưởng Redux Toolkit Immutability gì ở đây cả.
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

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
    return <PageLoadingSpinner caption="Loading board..." />
  }

  const currentUserId = currentUser?._id
  const isOwner = currentUserId && board.ownerIds?.includes(currentUserId)
  const isMember = currentUserId && board.memberIds?.includes(currentUserId)
  const isAuthorized = isOwner || isMember
  const isReadOnly = board.type === 'public' && !isAuthorized

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      {/* Modal Active Card, check đóng/mở dựa theo state isShowModalActiveCard lưu trữ trong Redux*/}
      <ActiveCard />

      {/* các thành phần còn lại của board details*/}
      <AppBar />
      <BoardBar board={board} isAuthorized={isAuthorized} isReadOnly={isReadOnly} />
      <BoardContent
        board={board}
        isReadOnly={isReadOnly}

        // createNewCard={createNewCard}
        // deleteColumnDetails={deleteColumnDetails}

        moveColumn={moveColumn}
        moveCardSameColumn={moveCardSameColumn}
        moveCardifferentColumn={moveCardifferentColumn}
      />
    </Container>
  )
}

export default Board