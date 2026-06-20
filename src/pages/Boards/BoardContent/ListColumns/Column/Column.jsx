import AddCardIcon from '@mui/icons-material/AddCard'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import CloseIcon from '@mui/icons-material/Close'
import Cloud from '@mui/icons-material/Cloud'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentCut from '@mui/icons-material/ContentCut'
import ContentPaste from '@mui/icons-material/ContentPaste'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { useState } from 'react'
import ListCard from './ListCards/ListCard'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { useConfirm } from 'material-ui-confirm'
import { toast } from 'sonner'

import { cloneDeep } from 'lodash-es'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import { useDispatch, useSelector } from 'react-redux'
import { createNewCardAPI, deleteColumnDetailAPI, updateColumnDetailAPI } from '~/apis'
import { selectCurrentActive, updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'


function Column({ column }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActive)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data: { ...column }
  })
  const dndKitColumnStyles = {
    // touchAction: 'none', // dành cho sensor default dạng PointerSensor
    // Nếu sử dụng CSS.Transform như docs sẽ lỗi kiểu stretch
    // https://github.com/clauderic/dnd-kit/issues/117
    transform: CSS.Translate.toString(transform),
    transition: transition || (isDragging ? undefined : 'transform 250ms ease'),
    height: '100%',
    // Chiều cao phải luôn max 100% vì nếu không sẽ lỗi lúc kéo column ngắn qua một cái column dài thì phải kéo
    // ở khu vực giữa giữa rất khó chịu . Lưu ý lúc này phải kết hợp với {...listeners}
    // nằm ở Box chứ không phải ở div ngoài cùng để tránh trường hợp kéo vào vùng xanh.
    opacity: isDragging ? 0.5 : undefined
  }

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => { setAnchorEl(event.currentTarget)}
  const handleClose = () => {setAnchorEl(null)}

  // cards đã được sắp xếp ở comp cha cao nhất
  const orderedCards = column.cards


  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toogleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm)

  const [newCardtitle, setNewCardtitle] = useState('')

  const addNewCard = async () => {
    if (!newCardtitle) {
      toast.error('please enter Card title')
      return
    }

    // tạo dữ liệu card để gọi
    const newCardData = {
      title: newCardtitle,
      columnId: column._id
    }
    // gọi API tạo mới card và làm lại dữ liệu state board
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId:board._id
    })
    // cập nhật state board

    // tương tự hàm createNewColumn, chúng ta cũng cloneDeep
    const newBoard = cloneDeep(board)
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
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // đóng trạng thái thêm Card mới và clear input
    toogleOpenNewCardForm()
    setNewCardtitle('')
  }

  // xử lý xóa 1 column và cards bên trong nó
  const confirmDeleteColumn = useConfirm()
  const handleDeleteColumn = async () => {
    try {
      // Đợi người dùng nhấn xác nhận
      await confirmDeleteColumn({
        title: 'Delete column?',
        description: 'This action will permanently delete your Column and its Cards! Are you sure?',
        confirmationText: 'confirm'
        // cancellationText: 'Ko,
        // dialogProps: {
        //   sx: {
        //     '& .MuiDialogActions-root': {
        //       mt: 0,
        //       pt: 0,
        //       mb: 1
        //     }
        //   },
        //   PaperProps: {
        //     sx: (theme) => ({
        //       backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.background.paper,
        //       color: theme.palette.text.primary,
        //       backgroundImage: 'none'
        //     })
        //   }
        // },
        // buttonOrder: ['confirm', 'cancel'],
        // allowClose: false,
        // confirmationButtonProps: { color: 'primary', variant: 'outlined', border: '10px' },
        // cancellationButtonProps: { color: 'inherit' }
        // confirmationKeyword: 'phanBao'
      })

      // xử lý xóa 1 column và card bên trong nó
      // cập nhật lại cho chuẩn dữ liệu state board
      
      // Tương tự đoạn xử lý chỗ hàm moveColumns nên không ảnh hưởng Redux Toolkit Immutability gì ở đây cả.
      const newBoard = { ...board }
      newBoard.columns = newBoard.columns.filter(c => c._id !== column._id)
      newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== column._id)
      // setBoard(newBoard)
      dispatch(updateCurrentActiveBoard(newBoard))
  
      // gọi API xử lý phía BE
      deleteColumnDetailAPI(column._id).then(res => {
        toast.success(res?.deleteResult)
        console.log(res)
      })

    } catch (error) {
      console.log('Hú hồn, tí thì xóa nhầm!')
    }
  }

  const onUpdateColumnTitle = (newTitle) => {
    // gọi api update column và xử lý dữ liệu board ở redux
    updateColumnDetailAPI(column._id, { title: newTitle }).then(() => {
      const newBoard = cloneDeep(board)
      const columnToUpdate = newBoard.columns.find(c => column._id === c._id)
      if (columnToUpdate) {
        columnToUpdate.title = newTitle
      }
      // setBoard(newBoard)
      dispatch(updateCurrentActiveBoard(newBoard))
    })
  }

  return (
    //phải bọc div ở đây vì vấn đề chiều cao của column khi kéo thả sẽ có bug kiểu flickering
    <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes}>
      <Box
        {...listeners}
        sx={{
          minWidth: '18.75rem',
          maxWidth: '18.75rem',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(22,27,34,0.75)' : theme.palette.background.column),
          backdropFilter: 'blur(12px)',
          border: (theme) => (theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid #dbe3ee'),
          ml: 2,
          borderRadius: '20px',
          height: 'fit-content',
          maxHeight: (theme) => `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`,
          color: 'text.primary'
        }}>

        {/* header */}
        <Box sx={{
          height: (theme) => theme.trello.columnHeaderHeight,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* <Typography variant='h6' sx={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          >{column?.title}</Typography> */}
          <ToggleFocusInput
            value={column?.title}
            onChangedValue={onUpdateColumnTitle}
            data-no-dnd="true"
          />
          {/* dropdown menu */}
          <Box>
            <Tooltip title='more options'>
              <ExpandMoreIcon
                id="basic-column-dropdown"
                aria-controls={open ? 'basic-menu-column-dropdown' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                sx={{ color: 'text.primary', cursor: 'pointer' }}
              />
            </Tooltip>
            <Menu
              id="basic-menu-column-dropdown"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-column-dropdown',
                sx: { py: 1 }
              }}
              sx={{
                '& .MuiPaper-root': {
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1f242c' : '#fff',
                  border: (theme) => theme.palette.mode === 'dark' ? '1px solid #30363d' : 'none',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  borderRadius: '10px',
                  mt: 1,
                  minWidth: 220
                }
              }}
            >
              <MenuItem
                onClick={toogleOpenNewCardForm}
                sx={{ '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}
              >
                <ListItemIcon><AddCardIcon fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText>Add new card</ListItemText>
              </MenuItem>
              <MenuItem sx={{ '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}>
                <ListItemIcon><ContentCut fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem sx={{ '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}>
                <ListItemIcon><ContentCopy fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem sx={{ '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}>
                <ListItemIcon><ContentPaste fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>

              <Divider sx={{ my: 1, borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }} />
              
              <MenuItem
                onClick={handleDeleteColumn}
                sx={{
                  color: 'error.main',
                  '&:hover': { bgcolor: 'rgba(255,0,0,0.1)' }
                }}
              >
                <ListItemIcon><DeleteForeverIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                <ListItemText>Delete this column</ListItemText>
              </MenuItem>
              <MenuItem sx={{ '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}>
                <ListItemIcon><Cloud fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        {/* ListCard */}
        < ListCard cards={orderedCards}/>
        {/* footer */}
        <Box sx={{
          height: (theme) => theme.trello.columnFooterHeight,
          p: 2
        }}>
          {!openNewCardForm
            ? <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Button startIcon={<AddCardIcon />} onClick={toogleOpenNewCardForm}>Add new card</Button>
              <Tooltip title='Drag to move'>
                <DragHandleIcon sx={{ cursor: 'pointer' }}/>
              </Tooltip>
            </Box>
            : <ClickAwayListener onClickAway={() => setOpenNewCardForm(false)}>
              <Box sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <TextField
                  label="Enter Card title..."
                  type="text"
                  size='small'
                  variant='outlined'
                  autoFocus
                  data-no-dnd= 'true'
                  value={newCardtitle}
                  onChange = {(e) => setNewCardtitle(e.target.value)}
                  sx={{
                    '& label': { color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#334155' },
                    '& input': {
                      color: (theme) => theme.palette.primary.main,
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff')
                    },
                    '& label.Mui-focused': { color: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#0284c7' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: (theme) => theme.palette.mode === 'dark' ? '#475569' : '#cbd5e1'
                      },
                      '&:hover fieldset': {
                        borderColor: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#0284c7'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: (theme) => theme.palette.mode === 'dark' ? '#94a3b8' : '#0284c7'
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      borderRadius: 1
                    }
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    className='interceptor-loading'
                    onClick={addNewCard}
                    variant='contained' color='primary' size='small'
                    sx={{
                      boxShadow: 'none',
                      border: '0.5px solid',
                      borderColor: (theme) => theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: (theme) => theme.palette.primary.main
                      }
                    }}
                  >Add</Button>
                  <CloseIcon
                    onClick= {toogleOpenNewCardForm}
                    sx={{
                      color: 'text.secondary',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.7 }
                    }}
                    fontSize='small'
                  />
                </Box>
              </Box>
            </ClickAwayListener>
          }
        </Box>
      </Box>
    </div>
  )
}

export default Column