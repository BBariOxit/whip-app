import AttachmentIcon from '@mui/icons-material/Attachment'
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined'
import CommentIcon from '@mui/icons-material/Comment'
import GroupIcon from '@mui/icons-material/Group'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentPaste from '@mui/icons-material/ContentPaste'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import Button from '@mui/material/Button'
import MuiCard from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import DeleteIcon from '@mui/icons-material/Delete'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import dayjs from 'dayjs'
import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { cloneDeep } from 'lodash-es'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSelector, useDispatch } from 'react-redux'
import { updateCurrentActiveCard, showModalActiveCard } from '~/redux/activeCard/activeCardSlice'
import { selectCurrentActive, setHoveredItem, setClipboard, selectClipboard, updateCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import Box from '@mui/material/Box'
import { getDueDateState, getDueDateColor, getDueDateTextColor } from '~/utils/getDueDateState'
import { getCardActionGridStyles } from '~/utils/formatters'
import { deleteCardAPI, archiveCardAPI, saveCardAsTemplateAPI, moveCardAPI, updateCardDetailsAPI, duplicateCardAPI } from '~/apis'
import { deleteCardOptimistic, moveCardOptimistic, updateCardInBoard } from '~/redux/activeBoard/activeBoardSlice'
import CardLayoutPopover from '~/components/Modal/ActiveCard/CardLayoutPopover'
import CardMoveDialog from '~/components/Modal/ActiveCard/CardMoveDialog'
import ViewComfyOutlinedIcon from '@mui/icons-material/ViewComfyOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useConfirm } from 'material-ui-confirm'
import { toast } from 'sonner'

function Card({ card }) {
  const dispatch = useDispatch()
  const confirm = useConfirm()
  const boardLabels = useSelector((state) => selectCurrentActive(state)?.labels || [])
  const cardLabels = useMemo(
    () => boardLabels.filter(label => card?.labelIds?.includes(label._id)),
    [boardLabels, card?.labelIds]
  )
  const board = useSelector(selectCurrentActive)
  const clipboard = useSelector(selectClipboard)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card },
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    }
  })
  const dndKitCardStyles = {
    // touchAction: 'none', // dành cho sensor default dạng PointerSensor
    // Nếu sử dụng CSS.Transform như docs sẽ lỗi kiểu stretch
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid' : undefined
  }

  const dueDateState = getDueDateState(card?.dueDate, card?.dueComplete)

  // Tính tổng checklist items
  const totalChecklistItems = card?.checklists?.reduce((sum, cl) => sum + (cl.items?.length || 0), 0) || 0
  const completedChecklistItems = card?.checklists?.reduce((sum, cl) => sum + (cl.items?.filter(i => i.isCompleted)?.length || 0), 0) || 0

  const showCardAction = () => {
    return !!card?.memberIds?.length || !!card?.totalComments || !!card?.attachments?.length || !!card?.dueDate || !!totalChecklistItems || !!card?.customFieldValues?.length
  }

  const setActiveCard = useCallback(() => {
    // cập nhập data cho cái activeCard trong redux
    dispatch(updateCurrentActiveCard(card))
    // hiện modal
    dispatch(showModalActiveCard())
  }, [dispatch, card])

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  // State cho Move Card Dialog
  const [moveModalOpen, setMoveModalOpen] = useState(false)

  // State cho Rename Card
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState(card.title)

  // Cập nhật local state khi prop card thay đổi (tránh chớp nháy UI khi rename)
  useEffect(() => {
    setNewTitle(card.title)
  }, [card.title])

  const handleRenameClick = (e) => {
    e.stopPropagation()
    handleCloseMenu()
    
    // Đợi MUI Menu đóng xong xuôi giải phóng Focus Trap rồi mới bật input
    setTimeout(() => {
      setIsEditingTitle(true)
      setNewTitle(card.title)
    }, 100)
  }

  const handleUpdateTitle = async () => {
    setIsEditingTitle(false)
    if (newTitle.trim() === card.title || !newTitle.trim()) {
      setNewTitle(card.title)
      return
    }
    const updatedTitle = newTitle.trim()
    dispatch(updateCardInBoard({ ...card, title: updatedTitle }))
    try {
      await updateCardDetailsAPI(card._id, { title: updatedTitle })
    } catch (error) {
      toast.error('Failed to update card title!')
    }
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleUpdateTitle()
    } else if (e.key === 'Escape') {
      setNewTitle(card.title)
      setIsEditingTitle(false)
    }
  }

  const handleOpenMenu = (e) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
  }

  const handleCloseMenu = (e) => {
    if (e) e.stopPropagation()
    setAnchorEl(null)
  }

  const [layoutAnchorEl, setLayoutAnchorEl] = useState(null)
  const handleOpenLayoutMenu = (e) => {
    e.stopPropagation()
    setLayoutAnchorEl(e.currentTarget)
  }
  const handleCloseLayoutMenu = (e) => {
    if (e && e.stopPropagation) e.stopPropagation()
    setLayoutAnchorEl(null)
  }

  const handleUpdateCardLayout = async (newLayout) => {
    dispatch(updateCardInBoard({ ...card, layout: newLayout }))
    await updateCardDetailsAPI(card._id, { layout: newLayout })
    setAnchorEl(null)
  }

  const handleDeleteCard = (e) => {
    e.stopPropagation()
    handleCloseMenu()
    confirm({
      title: 'Delete Card?',
      description: 'This action will permanently delete this Card! Are you sure?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    }).then(() => {
      // Gọi API xóa card
      deleteCardAPI(card._id)
      // Cập nhật Redux state ngay lập tức
      dispatch(deleteCardOptimistic({ cardId: card._id, columnId: card.columnId }))
    }).catch(() => {})
  }

  const handleArchiveCard = (e) => {
    e.stopPropagation()
    handleCloseMenu()
    confirm({
      title: 'Archive this card?',
      description: 'This card will be archived. You can restore it later.',
      confirmationText: 'Archive',
      confirmationButtonProps: { color: 'warning', variant: 'outlined' }
    }).then(() => {
      // Optimistic update
      dispatch(deleteCardOptimistic({ cardId: card._id, columnId: card.columnId }))
      
      // API Call
      archiveCardAPI(card._id).then(() => {
        toast.success('Card has been archived!')
      }).catch(() => {
        toast.error('Failed to archive card!')
      })
    }).catch(() => {})
  }

  const handleSaveAsTemplate = async (e) => {
    e.stopPropagation()
    handleCloseMenu()
    try {
      await saveCardAsTemplateAPI(card._id)
      toast.success('Saved as template successfully!')
    } catch (error) {
      toast.error('Failed to save as template!')
    }
  }

  // Mở dialog move card
  const handleOpenMoveModal = (e) => {
    e.stopPropagation()
    handleCloseMenu()
    setMoveModalOpen(true)
  }

  const handleCopyCard = (e) => {
    e.stopPropagation()
    dispatch(setClipboard({ type: 'CARD', data: card }))
    toast.success(`Copied card: ${card.title}`)
    handleCloseMenu()
  }

  const handlePasteCard = async (e) => {
    e.stopPropagation()
    if (!clipboard || clipboard.type !== 'CARD') {
      return toast.info('Clipboard is empty or does not contain a card!')
    }

    try {
      const newCard = await duplicateCardAPI({
        cardId: clipboard.data._id,
        targetColumnId: card.columnId
      })

      const newBoard = cloneDeep(board)
      const targetColumn = newBoard.columns.find(c => c._id === card.columnId)
      if (targetColumn) {
        if (targetColumn.cards.some(c => c.FE_PlaceholderCard)) {
          targetColumn.cards = [newCard]
          targetColumn.cardOrderIds = [newCard._id]
        } else {
          // Paste the copied card right after this current card
          const cardIndex = targetColumn.cards.findIndex(c => c._id === card._id)
          if (cardIndex !== -1) {
            targetColumn.cards.splice(cardIndex + 1, 0, newCard)
            targetColumn.cardOrderIds.splice(cardIndex + 1, 0, newCard._id)
          } else {
            targetColumn.cards.push(newCard)
            targetColumn.cardOrderIds.push(newCard._id)
          }
        }
      }
      dispatch(updateCurrentActiveBoard(newBoard))
      toast.success('Pasted successfully!')
      handleCloseMenu()
    } catch (error) {
      console.error(error)
      toast.error('Failed to paste card!')
    }
  }

  const layout = card?.layout || 'detailed'

  return (
    <MuiCard
      onClick={setActiveCard}
      onMouseEnter={() => dispatch(setHoveredItem({ type: 'CARD', data: card }))}
      onMouseLeave={() => dispatch(setHoveredItem(null))}
      ref={setNodeRef} style={dndKitCardStyles} {...attributes} {...listeners}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        display: card?.FE_PlaceholderCard ? 'none' : 'block',
        bgcolor: 'background.paper',
        flexShrink: 0, // Không cho card bị shrink khi list có nhiều card
        '&:hover': {
          borderColor: (theme) => theme.palette.primary.main
        },
        '&:hover .card-more-btn': { opacity: 1 }
      }}>
      
      {/* Nút 3 chấm */}
      <IconButton
        className="card-more-btn"
        onClick={handleOpenMenu}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0, // Mặc định ẩn
          transition: 'opacity 0.15s ease',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 39, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          color: 'text.secondary',
          zIndex: 10,
          '&:hover': { 
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#22272e' : '#f4f5f7', 
            color: 'text.primary' 
          }
        }}
        size="small"
      >
        <MoreHorizIcon fontSize="small" />
      </IconButton>

      {/* Menu thả xuống của Card */}
      <Menu
        id="basic-menu-card"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        onClick={(e) => e.stopPropagation()} // Chặn click vùng trống menu làm mở Modal Card
        disableRestoreFocus
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{
          sx: { py: 0 } // Xóa khoảng trắng dư thừa trên dưới
        }}
        sx={{
          '& .MuiPaper-root': {
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c2128' : '#fff',
            border: (theme) => theme.palette.mode === 'dark' ? '1px solid #373e47' : 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            borderRadius: '8px'
          }
        }}
      >
        <MenuItem
          onClick={handleRenameClick}
          sx={{
            py: 1,
            '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }
          }}
        >
          <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleOpenMoveModal}
          sx={{
            py: 1,
            '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }
          }}
        >
          <ListItemIcon><DriveFileMoveOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Move</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleCopyCard}
          sx={{
            py: 1,
            '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }
          }}
        >
          <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handlePasteCard}
          disabled={!clipboard || clipboard.type !== 'CARD'}
          sx={{
            py: 1,
            '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }
          }}
        >
          <ListItemIcon><ContentPaste fontSize="small" /></ListItemIcon>
          <ListItemText>Paste</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={handleArchiveCard} 
          sx={{ 
            py: 1,
            '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } 
          }}
        >
          <ListItemIcon><ArchiveOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Archive</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={handleOpenLayoutMenu} 
          sx={{ 
            py: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ListItemIcon><ViewComfyOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Layout</ListItemText>
          </Box>
          <ChevronRightIcon fontSize="small" sx={{ ml: 2, color: 'text.secondary' }} />
        </MenuItem>
        <MenuItem 
          onClick={handleSaveAsTemplate} 
          sx={{ 
            py: 1,
            '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' } 
          }}
        >
          <ListItemIcon><DashboardCustomizeOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Template</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={handleDeleteCard} 
          sx={{ 
            color: 'error.main',
            py: 1,
            '&:hover': { bgcolor: 'rgba(255,0,0,0.1)' } 
          }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}><DeleteIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Box onClick={(e) => e.stopPropagation()}>
        <CardLayoutPopover
          anchorEl={layoutAnchorEl}
          handleClose={handleCloseLayoutMenu}
          onUpdateCardLayout={handleUpdateCardLayout}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          sxProps={{ mt: -1, ml: 1 }}
        />
      </Box>

      {/* Move Card Dialog */}
      <CardMoveDialog
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        card={card}
        board={board}
      />


      {layout === 'detailed' && card?.cover &&
        <CardMedia sx={{ height: 140 }}image={card?.cover}/>
      }
      <CardContent sx={{ p: layout === 'compact' ? 1 : 1.5, '&:last-child': { p: layout === 'compact' ? 1 : 1.5 } }}>
        {layout !== 'compact' && !!cardLabels.length &&
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.5, mb: 1 }}>
            {cardLabels.map(label => (
              <Box key={label._id} sx={{
                bgcolor: label.color,
                height: 8,
                borderRadius: 1
              }} title={label.title} />
            ))}
          </Box>
        }
        {isEditingTitle ? (
          <ClickAwayListener onClickAway={handleUpdateTitle}>
            <Box 
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <input
                autoFocus
                onFocus={(e) => {
                  const val = e.target.value
                  e.target.value = ''
                  e.target.value = val
                }}
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  color: 'inherit',
                  padding: 0,
                  margin: 0
                }}
              />
            </Box>
          </ClickAwayListener>
        ) : (
          <Typography>{newTitle}</Typography>
        )}
      </CardContent>
      {layout !== 'compact' && showCardAction() &&
        <CardActions sx={{ 
          p: '0 8px 8px 8px', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 1,
          '& > *': { margin: '0 !important' } // Fix MUI CardActions adding left margin to subsequent children
        }}>
          {/* Container cho các icon badges - Sử dụng util để thụt lề chuẩn xác khi không có Date */}
          <Box sx={getCardActionGridStyles(!!card?.dueDate)}>
            {card?.dueDate && (
              <Button
                size="small"
                startIcon={dueDateState === 'completed' ? <TaskAltOutlinedIcon /> : <WatchLaterOutlinedIcon />}
                sx={(theme) => ({
                  bgcolor: getDueDateColor(dueDateState, theme),
                  color: getDueDateTextColor(dueDateState, theme),
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 1,
                  minWidth: 'unset',
                  '&:hover': { bgcolor: getDueDateColor(dueDateState, theme), opacity: 0.85 }
                })}
              >
                {dayjs(card.dueDate).format('DD MMM')}
              </Button>
            )}
            {!!card?.memberIds?.length &&
              <Button size="small" startIcon={<GroupIcon />} sx={{ minWidth: 'unset' }}>{card?.memberIds?.length}</Button>
            }
            {!!card?.totalComments &&
              <Button size="small" startIcon={<CommentIcon />} sx={{ minWidth: 'unset' }}>{card?.totalComments}</Button>
            }
            {!!totalChecklistItems &&
              <Button size="small" startIcon={<CheckBoxOutlinedIcon />} sx={{ minWidth: 'unset' }}>{completedChecklistItems}/{totalChecklistItems}</Button>
            }
            {!!card?.attachments?.length &&
              <Button size="small" startIcon={<AttachmentIcon />} sx={{ minWidth: 'unset' }}>{card?.attachments?.length}</Button>
            }
          </Box>
          {/* Container cho các custom fields */}
          {layout === 'detailed' && !!card?.customFieldValues?.length && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, width: '100%' }}>
              {card.customFieldValues.map(cfv => {
                if (!cfv.value && typeof cfv.value !== 'boolean') return null
                const fieldDef = board?.customFields?.find(f => f._id === cfv.customFieldId)
                if (!fieldDef || !fieldDef.showOnFront) return null

                let displayValue = cfv.value
                if (fieldDef.type === 'dropdown') {
                  const opt = fieldDef.options?.find(o => o._id === cfv.value)
                  displayValue = opt ? opt.text : cfv.value
                } else if (fieldDef.type === 'checkbox') {
                  displayValue = cfv.value ? 'Yes' : 'No'
                }

                return (
                  <Box key={cfv.customFieldId} sx={{
                    display: 'inline-block',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2A2E33' : '#091e420f',
                    px: 1, py: 0.25, borderRadius: 1,
                    fontSize: '12px', fontWeight: 500, color: 'text.secondary',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {fieldDef.name}: {displayValue.toString()}
                  </Box>
                )
              })}
            </Box>
          )}
        </CardActions>
      }
    </MuiCard>
  )
}
export default React.memo(Card)