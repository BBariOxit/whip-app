import { useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
// import { mockData } from '~/apis/mock-data'
import { fetchBoardDetailAPI, createNewCardAPI, createNewColumnAPI } from '~/apis'

function Board() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    // tạm thời fix cứng boardId, sẽ sử dụng react-router-dom sau
    const boardId = '69996f5ffacfa157400e51df'
    // call api
    fetchBoardDetailAPI(boardId)
      .then((board) => {
        setBoard(board)
      })
  }, [])

  // func này có nhiệm vụ gọi API tạo mới column và làm lại dữ liệu state board
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId:board._id
    })
    console.log('createdColumn:', createdColumn)
    // cập nhật state board
  }

  // func này có nhiệm vụ gọi API tạo mới column và làm lại dữ liệu state board
  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId:board._id
    })
    console.log('createdCard:', createdCard)
    // cập nhật state board
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board}/>
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
      />
    </Container>
  )
}

export default Board