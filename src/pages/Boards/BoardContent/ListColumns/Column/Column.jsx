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
import AspectRatioIcon from '@mui/icons-material/AspectRatio'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CheckIcon from '@mui/icons-material/Check'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined'
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
import IconButton from '@mui/material/IconButton'
import React, { useState } from 'react'
import ListCard from './ListCards/ListCard'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { useConfirm } from 'material-ui-confirm'
import { toast } from 'sonner'

import { cloneDeep } from 'lodash-es'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import { useDispatch, useSelector } from 'react-redux'
import { createNewCardAPI, deleteColumnDetailAPI, updateColumnDetailAPI, clearAllCardsInColumnAPI, updateColumnCardsLayoutAPI, archiveColumnAPI, getCardTemplatesAPI, useCardTemplateAPI, deleteCardTemplateAPI, saveColumnAsTemplateAPI } from '~/apis'
import { selectCurrentActive, updateCurrentActiveBoard, clearCardsInColumnOptimistic, fetchBoardDetailAPI, selectClipboard, setHoveredItem, selectIsReadOnly } from '~/redux/activeBoard/activeBoardSlice'
import CardLayoutPopover from '~/components/Modal/ActiveCard/CardLayoutPopover'
import ColumnMoveDialog from './ColumnMoveDialog'
import { duplicateCardAPI, duplicateColumnAPI } from '~/apis'

function Column({ column }) {
  const dispatch = useDispatch()
  const board = useSelector(selectCurrentActive)
  const isReadOnly = useSelector(selectIsReadOnly)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column._id,
    data: { ...column },
    disabled: isReadOnly // Khóa Drag & Drop
  })
  const clipboard = useSelector(selectClipboard)
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
  
  const [subMenuAnchorEl, setSubMenuAnchorEl] = React.useState(null)
  const subMenuOpen = Boolean(subMenuAnchorEl)

  const [moveColumnModalOpen, setMoveColumnModalOpen] = React.useState(false)

  const handleClick = (event) => { setAnchorEl(event.currentTarget)}
  
  const handleOpenSubMenu = (e) => setSubMenuAnchorEl(e.currentTarget)
  const handleCloseSubMenu = () => setSubMenuAnchorEl(null)
  
  const handleCloseAll = () => {
    setSubMenuAnchorEl(null)
    setTemplateSubMenuAnchorEl(null)
    setAnchorEl(null)
  }

  const [templateSubMenuAnchorEl, setTemplateSubMenuAnchorEl] = React.useState(null)
  const templateSubMenuOpen = Boolean(templateSubMenuAnchorEl)

  const handleOpenTemplateSubMenu = async (e) => {
    setTemplateSubMenuAnchorEl(e.currentTarget)
    setTemplateLoading(true)
    try {
      const res = await getCardTemplatesAPI(board._id)
      setTemplates(res)
    } catch (err) {
      console.error(err)
    } finally {
      setTemplateLoading(false)
    }
  }
  const handleCloseTemplateSubMenu = () => setTemplateSubMenuAnchorEl(null)

  // cards đã được sắp xếp ở comp cha cao nhất
  const orderedCards = column.cards


  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toogleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm)

  const [newCardtitle, setNewCardtitle] = useState('')

  // ===== TEMPLATE MENU STATE =====
  const [templateAnchorEl, setTemplateAnchorEl] = useState(null)
  const [templates, setTemplates] = useState([])
  const [templateLoading, setTemplateLoading] = useState(false)
  const templateMenuOpen = Boolean(templateAnchorEl)

  const handleOpenTemplateMenu = async (e) => {
    setTemplateAnchorEl(e.currentTarget)
    setTemplateLoading(true)
    try {
      const res = await getCardTemplatesAPI(board._id)
      setTemplates(res)
    } catch (err) {
      console.error(err)
    } finally {
      setTemplateLoading(false)
    }
  }

  const handleCloseTemplateMenu = () => setTemplateAnchorEl(null)

  const handleUseTemplate = async (templateId) => {
    try {
      const newCard = await useCardTemplateAPI({
        templateId,
        targetColumnId: column._id,
        boardId: board._id
      })

      // Update state board
      const newBoard = cloneDeep(board)
      const targetColumn = newBoard.columns.find(c => c._id === column._id)
      if (targetColumn) {
        if (targetColumn.cards.some(c => c.FE_PlaceholderCard)) {
          targetColumn.cards = [newCard]
          targetColumn.cardOrderIds = [newCard._id]
        } else {
          targetColumn.cards.push(newCard)
          targetColumn.cardOrderIds.push(newCard._id)
        }
      }
      dispatch(updateCurrentActiveBoard(newBoard))
      toast.success('Card created from template!')
      handleCloseTemplateMenu()
    } catch (err) {
      console.error(err)
      toast.error('Failed to use template!')
    }
  }

  const handleDeleteTemplate = async (e, templateId) => {
    e.stopPropagation()
    try {
      await deleteCardTemplateAPI(templateId)
      setTemplates(prev => prev.filter(t => t._id !== templateId))
      toast.success('Template deleted!')
    } catch (err) {
      toast.error('Failed to delete template!')
    }
  }

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
    handleCloseAll()
    try {
      // Đợi người dùng nhấn xác nhận
      await confirmDeleteColumn({
        title: 'Delete column?',
        description: 'This action will permanently delete your Column and its Cards! Are you sure?',
        confirmationText: 'confirm'
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

  const handleClearAllCards = async () => {
    handleCloseAll()
    try {
      await confirmDeleteColumn({
        title: 'Clear all cards?',
        description: 'This action will permanently delete all cards in this column! Are you sure?',
        confirmationText: 'Confirm'
      })

      // Update UI immediately
      dispatch(clearCardsInColumnOptimistic(column._id))

      // Call API
      clearAllCardsInColumnAPI(column._id).then(res => {
        toast.success(res?.deleteResult)
      })
    } catch (error) {
      console.log('Action cancelled')
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

  const handleUpdateColumnCardsLayout = async (layout) => {
    try {
      await updateColumnCardsLayoutAPI(column._id, layout)
      
      const newBoard = cloneDeep(board)
      const targetColumn = newBoard.columns.find(c => c._id === column._id)
      if (targetColumn) {
        targetColumn.cards = targetColumn.cards.map(card => ({
          ...card,
          layout: layout
        }))
      }
      
      dispatch(updateCurrentActiveBoard(newBoard))
      toast.success('Successfully updated column cards layout!')
      handleCloseAll()
    } catch (error) {
      console.error(error)
    }
  }

  const handleSaveAsTemplate = async () => {
    try {
      await saveColumnAsTemplateAPI(column._id)
      toast.success('Column saved as template!')
      handleCloseAll()
    } catch (err) {
      toast.error('Failed to save column as template')
    }
  }

  const handleArchiveColumn = () => {
    handleCloseAll()
    confirmDeleteColumn({
      title: 'Archive this column?',
      description: 'This column and all its cards will be archived. You can restore them later.',
      confirmationText: 'Archive',
      confirmationButtonProps: { color: 'warning', variant: 'outlined' }
    }).then(() => {
      // Optimistic update: remove column from board UI
      const newBoard = { ...board }
      newBoard.columns = newBoard.columns.filter(c => c._id !== column._id)
      newBoard.columnOrderIds = newBoard.columnOrderIds.filter(_id => _id !== column._id)
      dispatch(updateCurrentActiveBoard(newBoard))

      // Call API
      archiveColumnAPI(column._id).then(res => {
        toast.success(res?.archiveResult)
      }).catch(() => {
        toast.error('Failed to archive column!')
        dispatch(fetchBoardDetailAPI(board._id))
      })
    }).catch(() => {
      console.log('Archive cancelled')
    })
  }

  const handlePasteCard = async () => {
    if (!clipboard || clipboard.type !== 'CARD') {
      return toast.info('Clipboard is empty or does not contain a card!')
    }

    try {
      const newCard = await duplicateCardAPI({
        cardId: clipboard.data._id,
        targetColumnId: column._id
      })

      const newBoard = cloneDeep(board)
      const targetColumn = newBoard.columns.find(c => c._id === column._id)
      if (targetColumn) {
        if (targetColumn.cards.some(c => c.FE_PlaceholderCard)) {
          targetColumn.cards = [newCard]
          targetColumn.cardOrderIds = [newCard._id]
        } else {
          targetColumn.cards.push(newCard)
          targetColumn.cardOrderIds.push(newCard._id)
        }
      }
      dispatch(updateCurrentActiveBoard(newBoard))
      toast.success('Pasted successfully!')
      handleCloseAll()
    } catch (error) {
      console.error(error)
      toast.error('Failed to paste card!')
    }
  }

  const handleCopyColumn = () => {
    dispatch(setClipboard({ type: 'COLUMN', data: column }))
    toast.success(`Copied column: ${column.title}`)
    handleCloseAll()
  }

  const handlePasteColumn = async () => {
    if (!clipboard || clipboard.type !== 'COLUMN') return

    try {
      const nextBoard = cloneDeep(board)
      const currentIndex = nextBoard.columnOrderIds.indexOf(column._id)
      const targetIndex = currentIndex !== -1 ? currentIndex + 1 : nextBoard.columnOrderIds.length

      const newColumnWithCards = await duplicateColumnAPI({
        columnId: clipboard.data._id,
        boardId: board._id,
        targetIndex: targetIndex
      })

      nextBoard.columns.splice(targetIndex, 0, newColumnWithCards)
      nextBoard.columnOrderIds.splice(targetIndex, 0, newColumnWithCards._id)

      dispatch(updateCurrentActiveBoard(nextBoard))
      toast.success('Pasted column successfully!')
      handleCloseAll()
    } catch (error) {
      console.error(error)
      toast.error('Failed to paste column!')
    }
  }

  const handlePasteGeneral = () => {
    if (!clipboard) return
    if (clipboard.type === 'CARD') {
      handlePasteCard()
    } else if (clipboard.type === 'COLUMN') {
      handlePasteColumn()
    }
  }

  return (
    //phải bọc div ở đây vì vấn đề chiều cao của column khi kéo thả sẽ có bug kiểu flickering
    <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes} data-column-id={column._id}>
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
            disabled={isReadOnly}
          />
          {/* dropdown menu */}
          {!isReadOnly && (
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
              onClose={handleCloseAll}
              disableScrollLock={true}
              disableAutoFocusItem
              autoFocus={false}
              onClick={(e) => {
                // Prevent closing menu when clicking submenu triggers
                if (!e.target.closest('#submenu-trigger') && !e.target.closest('#template-submenu-trigger')) {
                  handleCloseAll()
                }
              }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              MenuListProps={{
                'aria-labelledby': 'basic-column-dropdown',
                sx: { py: 1 }
              }}
              sx={{
                '& .MuiPaper-root': {
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#fff',
                  border: (theme) => theme.palette.mode === 'dark' ? '1px solid #373e47' : 'none',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  borderRadius: '10px',
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
              <MenuItem
                id="template-submenu-trigger"
                onClick={handleOpenTemplateSubMenu}
                sx={{ '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}
              >
                <ListItemIcon><DashboardCustomizeOutlinedIcon fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText>Add template</ListItemText>
                <ChevronRightIcon fontSize="small" sx={{ color: 'text.secondary', ml: 2 }} />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMoveColumnModalOpen(true)
                  handleCloseAll()
                }}
                sx={{ '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}
              >
                <ListItemIcon><DriveFileMoveOutlinedIcon fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText>Move</ListItemText>
              </MenuItem>
              
              <Divider sx={{ my: 1, borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }} />

              <MenuItem onClick={handleCopyColumn} sx={{ '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}>
                <ListItemIcon><ContentCopy fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText>Copy column</ListItemText>
              </MenuItem>
              <MenuItem 
                onClick={handlePasteGeneral}
                disabled={!clipboard || (clipboard.type !== 'CARD' && clipboard.type !== 'COLUMN')}
                sx={{
                  '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
                  '&.Mui-disabled': { opacity: 0.3 }
                }}
              >
                <ListItemIcon><ContentPaste fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>

              <Divider sx={{ my: 1, borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }} />
              
              <MenuItem
                id="submenu-trigger"
                onClick={handleOpenSubMenu}
                sx={{ '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}
              >
                <ListItemIcon><AspectRatioIcon fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText>Card Layout</ListItemText>
                <ChevronRightIcon fontSize="small" sx={{ color: 'text.secondary', ml: 2 }} />
              </MenuItem>

              <Divider sx={{ my: 1, borderColor: (theme) => theme.palette.mode === 'dark' ? '#30363d' : '#d0d7de' }} />

              <MenuItem
                onClick={handleClearAllCards}
                disabled={!column?.cards?.length || (column?.cards?.length === 1 && column?.cards[0]?.FE_PlaceholderCard)}
                sx={{
                  color: 'warning.main',
                  '&:hover': { bgcolor: 'rgba(237,108,2,0.1)' }
                }}
              >
                <ListItemIcon><DeleteForeverIcon fontSize="small" sx={{ color: 'warning.main' }} /></ListItemIcon>
                <ListItemText>Clear all cards</ListItemText>
              </MenuItem>

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
              <MenuItem
                onClick={handleArchiveColumn}
                sx={{ '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}
              >
                <ListItemIcon><Cloud fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={handleSaveAsTemplate}
                sx={{ '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } }}
              >
                <ListItemIcon><DashboardCustomizeOutlinedIcon fontSize="small" sx={{ color: 'inherit' }} /></ListItemIcon>
                <ListItemText>Save as Template</ListItemText>
              </MenuItem>
            </Menu>

            {/* Submenu for Layout Selection */}
            <CardLayoutPopover
              anchorEl={subMenuAnchorEl}
              handleClose={handleCloseSubMenu}
              onUpdateCardLayout={handleUpdateColumnCardsLayout}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              sxProps={{ ml: 1, minWidth: 200 }}
            />

            {/* Submenu for Add from Template */}
            <Menu
              anchorEl={templateSubMenuAnchorEl}
              open={templateSubMenuOpen}
              onClose={handleCloseTemplateSubMenu}
              disableScrollLock={true}
              disableAutoFocusItem
              autoFocus={false}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              MenuListProps={{
                sx: { p: 0 }
              }}
              sx={{
                '& .MuiPaper-root': {
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#fff',
                  border: (theme) => theme.palette.mode === 'dark' ? '1px solid #373e47' : 'none',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  borderRadius: '10px',
                  minWidth: 160,
                  maxHeight: 320,
                  ml: 1
                }
              }}
            >
              <Typography sx={{ px: 2, py: 1, fontSize: '12px', color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Card Templates
              </Typography>
              {templateLoading ? (
                <MenuItem disabled><Typography fontSize="13px">Loading...</Typography></MenuItem>
              ) : templates.length === 0 ? (
                <MenuItem disabled><Typography fontSize="13px">No templates yet.</Typography></MenuItem>
              ) : (
                templates.map(tmp => (
                  <MenuItem
                    key={tmp._id}
                    onClick={() => {
                      handleUseTemplate(tmp._id)
                      handleCloseAll()
                    }}
                    sx={{
                      py: 1, px: 2,
                      '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    <ListItemIcon><DashboardCustomizeOutlinedIcon fontSize="small" sx={{ color: '#e3b341' }} /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: 14, noWrap: true }}>{tmp.title}</ListItemText>
                  </MenuItem>
                ))
              )}
            </Menu>

            <ColumnMoveDialog
              isOpen={moveColumnModalOpen}
              onClose={() => setMoveColumnModalOpen(false)}
              column={column}
              board={board}
            />

          </Box>
          )}
        </Box>
        {/* ListCard */}
        <ListCard cards={orderedCards} />
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
              {!isReadOnly && <Button startIcon={<AddCardIcon />} onClick={toogleOpenNewCardForm}>Add new card</Button>}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                {!isReadOnly && (
                  <Tooltip title='Create from template'>
                    <IconButton
                      size="small"
                      onClick={handleOpenTemplateMenu}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': { color: '#e3b341', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2d333b' : 'rgba(0,0,0,0.04)' }
                      }}
                    >
                      <DashboardCustomizeOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title='Drag to move'>
                  <DragHandleIcon sx={{ cursor: 'pointer' }}/>
                </Tooltip>
              </Box>

              {/* Template Menu */}
              <Menu
                anchorEl={templateAnchorEl}
                open={templateMenuOpen}
                onClose={handleCloseTemplateMenu}
                disableScrollLock={true}
                disableAutoFocusItem
                autoFocus={false}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                sx={{
                  '& .MuiPaper-root': {
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#fff',
                    border: (theme) => theme.palette.mode === 'dark' ? '1px solid #373e47' : '1px solid #d0d7de',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    borderRadius: '10px',
                    minWidth: 160,
                    maxHeight: 320
                  }
                }}
              >
                <Typography sx={{ px: 2, py: 1, fontSize: '12px', color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Card Templates
                </Typography>
                {templateLoading ? (
                  <MenuItem disabled>
                    <Typography fontSize="13px">Loading...</Typography>
                  </MenuItem>
                ) : templates.length === 0 ? (
                  <MenuItem disabled>
                    <Typography fontSize="13px">No templates yet.</Typography>
                  </MenuItem>
                ) : (
                  templates.map(tmp => (
                    <MenuItem
                      key={tmp._id}
                      onClick={() => handleUseTemplate(tmp._id)}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }
                      }}
                    >
                      <Typography fontSize="14px" noWrap sx={{ flex: 1 }}>{tmp.title}</Typography>
                    </MenuItem>
                  ))
                )}
              </Menu>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addNewCard()
                    }
                  }}
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