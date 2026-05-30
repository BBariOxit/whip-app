import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { mapOrder } from '~/utils/sorts'
import { generatePlaceholderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash-es'

const initialState = {
  currentActiveBoard: null
}
// Các hành động gọi api (bất đồng bộ) và cập nhật dữ liệu vào Redux, dùng Middleware createAsyncThunk đi kèm với extraReducers
export const fetchBoardDetailAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailAPI', 
  async (boardId) => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
    // lưu ý: axios trả về kết quả qua property của nó là data
    return response.data  
  }  
) 

// khởi tạo slice trong kho lưu trữ redux
export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  // reducers: nơi xử lý dữ liệu đồng bộ
  reducers: {
    updateCurrentActiveBoard: (state, action) => {
      // action.payload laf chuẩn đặt tên nhận dữ liệu vào reducer, ở đây gán nó cho 1 biến có nghĩa hơn 
      const fullBoard = action.payload

      // xử lý dữ liệu nếu cần thiết

      //update dữ liệu của currentActiveBoard
      state.currentActiveBoard = fullBoard
    },
    updateCardInBoard: (state, action) => {
      // update nested data (cập nhật dữ liệu ở tầng sâu bên trong)
      const inComingCard = action.payload

      // tìm dần từ board > columns > cards
      const column = state.currentActiveBoard.columns.find(col => col._id === inComingCard.columnId)
      if (column) {
        const card = column.cards.find(card => card._id === inComingCard._id)
        if (card) {
          // card.title = inComingCard.title
          // card['title'] = inComingCard['title']

          // Đơn giản là dùng Object.keys để lấy toàn bộ các properties (keys) của incomingCard về một Array rồi forEach nó ra.
          // Sau đó tùy vào trường hợp cần thì kiểm tra thêm còn không thì cập nhật ngược lại giá trị vào card luôn như bên dưới.
          Object.keys(inComingCard).forEach(key => {
            card[key] = inComingCard[key]
          })
        }
      }     
    },
    addNewLabel: (state, action) => {
      const newLabel = action.payload
      if (!state.currentActiveBoard.labels) {
        state.currentActiveBoard.labels = []
      }
      state.currentActiveBoard.labels.push(newLabel)
    },
    updateLabelOptimistic: (state, action) => {
      const updatedLabel = action.payload
      const labelIndex = state.currentActiveBoard.labels.findIndex(l => l._id === updatedLabel._id)
      if (labelIndex !== -1) {
        state.currentActiveBoard.labels[labelIndex] = updatedLabel
      }
    },
    deleteLabelOptimistic: (state, action) => {
      const labelId = action.payload
      if (state.currentActiveBoard.labels) {
        state.currentActiveBoard.labels = state.currentActiveBoard.labels.filter(l => l._id !== labelId)
      }
      state.currentActiveBoard.columns.forEach(column => {
        column.cards.forEach(card => {
          if (card.labelIds) {
            card.labelIds = card.labelIds.filter(id => id !== labelId)
          }
        })
      })
    }
  },
  // extraReducers: nơi xử lý các hành động bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailAPI.fulfilled, (state, action) => {
      // Lưu ý: Khi dùng extraReducers thì dữ liệu trả về ở action.payload chính là cái response.data đã được return từ bên trong hàm fetchBoardDetailAPI
      let board = action.payload

      // thành viên trong board sẽ gộp lại của 2 mảng owners và members
      board.FE_allUser = [...board.owners, ...board.members]
      
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

      //update dữ liệu của currentActiveBoard
      state.currentActiveBoard = board
    })
  }
})

// Actions: Là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer (chạy đồng bộ)
// Để ý ở trên thì không thấy properties actions đâu cả, bởi vì những cái actions này đơn giản là được thằng redux tạo tự động theo tên của reducer nhé.
export const { updateCurrentActiveBoard, updateCardInBoard, addNewLabel, updateLabelOptimistic, deleteLabelOptimistic } = activeBoardSlice.actions

// Selectors: Là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentActive = (state) => {
  return state.activeBoard.currentActiveBoard
}

// Cái file này tên là activeBoardSlice NHƯNG chúng ta sẽ export một thứ tên là Reducer
// export default activeBoardSlice.reducer
export const activeBoardReducer = activeBoardSlice.reducer