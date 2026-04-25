import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
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
    const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
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
    }
  },
  // extraReducers: nơi xử lý các hành động bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailAPI.fulfilled, (state, action) => {
      // Lưu ý: Khi dùng extraReducers thì dữ liệu trả về ở action.payload chính là cái response.data đã được return từ bên trong hàm fetchBoardDetailAPI
      let board = action.payload
      
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
export const { updateCurrentActiveBoard } = activeBoardSlice.actions

// Selectors: Là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentActive = (state) => {
  return state.activeBoard.currentActiveBoard
}

// Cái file này tên là activeBoardSlice NHƯNG chúng ta sẽ export một thứ tên là Reducer
// export default activeBoardSlice.reducer
export const activeBoardReducer = activeBoardSlice.reducer