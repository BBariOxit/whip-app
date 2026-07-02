import Container from '@mui/material/Container'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AppBar from '~/components/AppBar/AppBar'
import {
  fetchBoardDetailAPI,
  selectCurrentActive,
  updateCurrentActiveBoard,
  selectIsReadOnly
} from '~/redux/activeBoard/activeBoardSlice'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'

// import { mockData } from '~/apis/mock-data'
import { cloneDeep } from 'lodash-es'
import { useParams, useLocation } from 'react-router-dom'
import {
  moveCarDifferentColumnlAPI,
  updateBoardDetailAPI,
  updateColumnDetailAPI
} from '~/apis'
import ActiveCard from '~/components/Modal/ActiveCard/ActiveCard'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { updateCurrentActiveCard } from '~/redux/activeCard/activeCardSlice'

function Board() {
  const dispatch = useDispatch()
  // ko dùng state của component nữa, mà dùng redux
  // const [board, setBoard] = useState(null)
  const board = useSelector(selectCurrentActive)
  const currentUser = useSelector(selectCurrentUser)
  const isReadOnly = useSelector(selectIsReadOnly)
  const { boardId } = useParams()
  const location = useLocation()

  // State lưu trữ các điều kiện lọc
  const [filters, setFilters] = useState({
    searchKey: '',
    memberIds: [],
    labelIds: []
  })

  // Dùng useMemo để tính toán ra một board mới đã được lọc
  const filteredBoard = useMemo(() => {
    if (!board) return null

    // Nếu không có filter nào thì trả về board gốc luôn
    if (!filters.searchKey && filters.memberIds.length === 0 && filters.labelIds.length === 0) {
      return board
    }

    const clonedBoard = cloneDeep(board)

    clonedBoard.columns.forEach(column => {
      column.cards = column.cards.filter(card => {
        // Giữ lại placeholder card để Cột rỗng vẫn hoạt động kéo thả chuẩn
        if (card.FE_PlaceholderCard) return true

        const isMatchSearch = !filters.searchKey || card.title.toLowerCase().includes(filters.searchKey.toLowerCase())
        const isMatchMembers = filters.memberIds.length === 0 || filters.memberIds.some(id => card.memberIds?.includes(id))
        const isMatchLabels = filters.labelIds.length === 0 || filters.labelIds.some(id => card.labelIds?.includes(id))

        return isMatchSearch && isMatchMembers && isMatchLabels
      })

      // Cập nhật lại cardOrderIds sau khi filter
      column.cardOrderIds = column.cards.map(card => card._id)
    })

    return clonedBoard
  }, [board, filters])

  useEffect(() => {
    // Reset board data before fetching new board to prevent flashing previous board UI
    dispatch(updateCurrentActiveBoard(null))
    // call api
    dispatch(fetchBoardDetailAPI(boardId))
  }, [dispatch, boardId])

  // Xử lý Deep Link khi có ?cardId=... trên URL
  useEffect(() => {
    if (!board) return // Đợi load Board xong đã

    // Phân tích cái đuôi URL
    const searchParams = new URLSearchParams(location.search)
    const cardIdFromUrl = searchParams.get('cardId')

    if (cardIdFromUrl) {
      // Lùng sục tìm con Card trong Board
      let targetCard = null
      for (const column of board.columns) {
        const found = column.cards?.find(c => c._id === cardIdFromUrl)
        if (found) {
          targetCard = found
          break
        }
      }

      // Nếu tìm thấy card trong board thì cập nhật vào state để bật Modal lên
      if (targetCard) {
        dispatch(updateCurrentActiveCard(targetCard))
      }
    }
  }, [location.search, board, dispatch])

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
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 2, 
        width: '100vw', 
        height: '100vh', 
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#121212' : '#f4f5f7' 
      }}>
        <CircularProgress size={40} thickness={4} />
        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Loading Board...
        </Typography>
      </Box>
    )
  }

  const currentUserId = currentUser?._id
  const isOwner = board.userAccessRole === 'admin'
  const isMember = board.userAccessRole === 'member'
  const isAuthorized = isOwner || isMember

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      {/* Modal Active Card, check đóng/mở dựa theo state isShowModalActiveCard lưu trữ trong Redux*/}
      <ActiveCard />

      {/* các thành phần còn lại của board details*/}
      <AppBar />
      <BoardBar 
        board={board} 
        isAuthorized={isAuthorized} 
        filters={filters}
        setFilters={setFilters}
      />
      <BoardContent
        board={filteredBoard}

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