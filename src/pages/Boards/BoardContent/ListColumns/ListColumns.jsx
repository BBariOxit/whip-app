import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import CloseIcon from '@mui/icons-material/Close'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import Column from './Column/Column'
import { toast } from 'react-toastify'
import { cloneDeep } from 'lodash-es'
import { createNewColumnAPI } from '~/apis'
import { generatePlaceholderCard } from '~/utils/formatters'

import { useSelector, useDispatch } from 'react-redux'
import {
  selectCurrentActive,
  updateCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'

function ListColumns({ columns }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActive)

  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toogleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)

  const [newColumntitle, setNewColumntitle] = useState('')

  const addNewColumn = async () => {
    if (!newColumntitle) {
      toast.error('please enter column title', { position: 'bottom-left' })
      return
    }
    // tạo dữ liệu column để gọi
    const newColumnData = {
      title: newColumntitle
    }
    
    // gọi API tạo mới column và làm lại dữ liệu state board
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

    // const newBoard = { ...board }

    // * Đoạn này sẽ dính lỗi object is not extensible bởi dù đã copy/clone ra giá trị newBoard nhưng bản chất của spread operator là Shallow Copy/Clone,
    // nên dính phải rules Immutability trong Redux Toolkit không dùng được hàm PUSH (sửa giá trị mảng trực tiếp),
    // cách đơn giản nhanh gọn nhất ở trường hợp này của chúng ta là dùng tới Deep Copy/Clone toàn bộ cái Board cho dễ hiểu và code ngắn gọn.
    const newBoard = cloneDeep(board)
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)
    // cập nhập dữ liệu vào state redux
    dispatch(updateCurrentActiveBoard(newBoard))

    /**
     * Ngoài ra cách nữa là vẫn có thể dùng array.concat thay cho push như docs của Redux Toolkit ở trên vì
     * push như đã nói nó sẽ thay đổi giá trị mảng trực tiếp, còn thằng concat thì nó merge – ghép mảng lại và
     * tạo ra một mảng mới để chúng ta gán lại giá trị nên không vấn đề gì.
     */
    // const newBoard = { ...board }
    // // Dùng concat để tạo mảng mới cho columns
    // newBoard.columns = newBoard.columns.concat([createdColumn])
    // newBoard.columnOrderIds = newBoard.columnOrderIds.concat([createdColumn._id])

    // đóng trạng thái thêm column mới và clear input
    toogleOpenNewColumnForm()
    setNewColumntitle('')
  }
  /**
   * Thằng SortableContext yêu cầu items là một mảng dạng ['id-1', 'id-2'] chứ không phải [{id: 'id-1'}, {id: 'id-2'}]
   * Nếu không đúng thì vẫn kéo thả được nhưng không có animation
   * https://github.com/clauderic/dnd-kit/issues/183#issuecomment-812569512
   */
  return (
    <SortableContext items={columns?.map(c => c._id)} strategy={horizontalListSortingStrategy}>
      <Box sx={{
        bgcolor: 'inherit',
        width: '100%',
        height: '100%',
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        '&::-webkit-scrollbar-track': { m: 2 }
      }}>
        {columns?.map(column => {
          return <Column
            key={column._id}
            column={column}
          />
        })}

        {/* Box add new column */}
        {!openNewColumnForm
          ? <Box onClick= {toogleOpenNewColumnForm} sx={{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d'
          }}>
            <Button
              startIcon={<NoteAddIcon />}
              sx={{
                color: 'white',
                width: '100%',
                justifyContent: 'flex-start',
                pl: 2.5,
                py: 1
              }}
            >Add new column</Button>
          </Box>
          : <Box sx={{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            p: 1,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#333643' : '#ebecf0',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            <TextField
              label="Enter column title..."
              type="text"
              size='small'
              variant='outlined'
              autoFocus
              value={newColumntitle}
              onChange = {(e) => setNewColumntitle(e.target.value)}
              sx={{
                '& label': {
                  color: (theme) => theme.palette.mode === 'dark' ? '#B6C2CF' : '#333643'
                },
                '& input': {
                  color: (theme) => theme.palette.primary.main
                },
                '& label.Mui-focused': {
                  color: (theme) => theme.palette.mode === 'dark' ? '#B6C2CF' : '#333643'
                },
                '& .MuiOutlinedInput-root': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#B6C2CF' : '#333643',
                    transition: 'border-color 0.2s ease, border-width 0.2s ease'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333643',
                    borderWidth: '1px !important'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333643',
                    borderWidth: '1px !important'
                  }
                }
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                className='interceptor-loading'
                onClick={addNewColumn}
                variant='contained' color='primary' size='small'
                sx={{
                  boxShadow: 'none',
                  border: '0.5px solid',
                  borderColor: (theme) => theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.primary.main
                  }
                }}
              >Add column</Button>
              <CloseIcon
                onClick= {toogleOpenNewColumnForm}
                sx={{
                  color: (theme) => theme.palette.mode === 'dark' ? '#B6C2CF' : '#333643',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.7 }
                }}
                fontSize='small'
              />
            </Box>
          </Box>
        }
      </Box>
    </SortableContext>
  )
}

export default ListColumns