import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import AddToDriveOutlinedIcon from '@mui/icons-material/AddToDriveOutlined'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import AspectRatioOutlinedIcon from '@mui/icons-material/AspectRatioOutlined'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined'
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined'
import CancelIcon from '@mui/icons-material/Cancel'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import Modal from '@mui/material/Modal'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import dayjs from 'dayjs'

import React, { useState } from 'react'
import { styled } from '@mui/material/styles'
import { useConfirm } from 'material-ui-confirm'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { updateCardDetailsAPI, uploadCardAttachmentAPI, deleteCardAttachmentAPI, archiveCardAPI, saveCardAsTemplateAPI } from '~/apis'
import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import VisuallyHiddenInput from '~/components/Form/VisuallyHiddenInput'
import { updateCardInBoard, selectCurrentActive, deleteCardOptimistic, fetchBoardDetailAPI, selectIsReadOnly, setClipboard } from '~/redux/activeBoard/activeBoardSlice'
import {
  clearAndHideCurrentActiveCard,
  selectCurrentActiveCard,
  selectIsShowModalActiveCard,
  updateCurrentActiveCard,
  updateCurrentActiveCardChecklists
} from '~/redux/activeCard/activeCardSlice'
import { singleFileValidator, attachmentFileValidator } from '~/utils/validators'
import { getDueDateState, getDueDateColor, getDueDateTextColor } from '~/utils/getDueDateState'
import CardActivitySection from './CardActivitySection'
import CardAttachmentSection from './CardAttachmentSection'
import CardDescriptionMdEditor from './CardDescriptionMdEditor'
import CardUserGroup from './CardUserGroup'
import CardLabelsPopover from './CardLabelsPopover'
import CardDatesPopover from './CardDatesPopover'
import CardChecklistPopover from './CardChecklistPopover'
import CardChecklistSection from './CardChecklistSection'
import CardCustomFieldsPopover from './CardCustomFieldsPopover'
import CardCustomFieldsSection from './CardCustomFieldsSection'
import CardLayoutPopover from './CardLayoutPopover'
import CardMoveDialog from './CardMoveDialog'
import ShareModal from '~/components/Modal/ShareModal/ShareModal'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'

const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: theme.palette.mode === 'dark' ? '#adbac7' : '#57606a',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f6f8fa',
  border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #d0d7de',
  padding: '8px 12px',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
    color: theme.palette.mode === 'dark' ? '#fff' : '#24292f',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#1f2328'
  }
}))

/**
 * Note: Modal là một low-component mà bọn MUI sử dụng bên trong những thứ như Dialog, Drawer, Menu, Popover.
 * Ở đây dĩ nhiên chúng ta có thể sử dụng Dialog cũng không thành vấn đề gì,
 * nhưng sẽ sử dụng Modal để dễ linh hoạt tùy biến giao diện từ con số 0 cho phù hợp với mọi nhu cầu.
 */
function ActiveCard() {
  const dispatch = useDispatch()
  const activeCard = useSelector(selectCurrentActiveCard)
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard) 
  const currentUser = useSelector(selectCurrentUser)
  const board = useSelector(selectCurrentActive)
  const confirmArchiveCard = useConfirm()
  const [anchorElLabels, setAnchorElLabels] = useState(null)
  const [anchorElDates, setAnchorElDates] = useState(null)
  const [anchorElChecklist, setAnchorElChecklist] = useState(null)
  const [anchorElCustomFields, setAnchorElCustomFields] = useState(null)
  const [anchorElCardLayout, setAnchorElCardLayout] = useState(null)
  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  
  const boardLabels = board?.labels || []
  const cardLabels = boardLabels.filter(label => activeCard?.labelIds?.includes(label._id))

  const isOwner = currentUser?._id && board?.ownerIds?.includes(currentUser._id)
  const isMember = currentUser?._id && board?.memberIds?.includes(currentUser._id)
  const isAuthorized = isOwner || isMember
  const isReadOnly = useSelector(selectIsReadOnly)

  // Tính trạng thái due date
  const dueDateState = getDueDateState(activeCard?.dueDate, activeCard?.dueComplete)

  // const [isOpen, setIsOpen] = useState(true)
  // const handleOpenModal = () => setIsOpen(true)

  const handleCloseModal = () => {
    // setIsOpen(false)
    dispatch(clearAndHideCurrentActiveCard())
  }

  // func goi api dùng chung cho các trường hợp update card title, description, cover, comment...
  const callApiUpdateCard = async (updateData) => {
    const updatedCard = await updateCardDetailsAPI(activeCard._id, updateData)

    // B1: Cập nhật lại cái card đang active trong modal hiện tại
    dispatch(updateCurrentActiveCard(updatedCard))

    // B2: Cập nhật lại cái bản ghi card trong cái activeBoard (nested data)
    dispatch(updateCardInBoard(updatedCard))

    return updatedCard
  }

  const onUpdateCardTitle = (newTitle) => {
    callApiUpdateCard({ title: newTitle.trim() })
  }

  const onUpdateCardDescription = (newDescription) => {
    callApiUpdateCard({ description: newDescription })
  }

  const onUploadCardCover = (event) => {
    const error = singleFileValidator(event.target?.files[0])
    if (error) {
      toast.error(error)
      return
    }
    let reqData = new FormData()
    reqData.append('cardCover', event.target?.files[0])

    // Gọi API...
    toast.promise(
      callApiUpdateCard(reqData).finally(() => event.target.value = ''),
      { pending: 'Uploading...' }
    )
  }


  const onUpdateCardMembers = (incomingMemberInfo) => {
    callApiUpdateCard({incomingMemberInfo})
  }

  const onUpdateCardLabels = (newLabelIds) => {
    callApiUpdateCard({ labelIds: newLabelIds })
  }

  const onUpdateCardDates = (dateData) => {
    callApiUpdateCard(dateData)
  }

  const onToggleDueComplete = () => {
    callApiUpdateCard({ dueComplete: !activeCard?.dueComplete })
  }

  const onUpdateCardCustomFields = (newCustomFieldValues) => {
    callApiUpdateCard({ customFieldValues: newCustomFieldValues })
  }

  const onUpdateCardLayout = (newLayout) => {
    callApiUpdateCard({ layout: newLayout })
  }

  // ===== CHECKLIST HANDLERS =====
  const onAddChecklist = (title) => {
    const newChecklist = {
      _id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2),
      title,
      items: []
    }
    const newChecklists = [...(activeCard?.checklists || []), newChecklist]
    // Optimistic update
    dispatch(updateCurrentActiveCardChecklists(newChecklists))
    dispatch(updateCardInBoard({ ...activeCard, checklists: newChecklists }))
    // Persist to DB
    callApiUpdateCard({ checklists: newChecklists })
  }

  const onUpdateChecklists = (newChecklists) => {
    // Optimistic update
    dispatch(updateCurrentActiveCardChecklists(newChecklists))
    dispatch(updateCardInBoard({ ...activeCard, checklists: newChecklists }))
    // Persist to DB
    callApiUpdateCard({ checklists: newChecklists })
  }

  // ===== ATTACHMENT HANDLERS =====
  const onUploadAttachment = (event) => {
    const error = attachmentFileValidator(event.target?.files[0])
    if (error) {
      toast.error(error)
      return
    }
    let reqData = new FormData()
    reqData.append('attachmentFile', event.target?.files[0])

    toast.promise(
      uploadCardAttachmentAPI(activeCard._id, reqData).then((updatedCard) => {
        dispatch(updateCurrentActiveCard(updatedCard))
        dispatch(updateCardInBoard(updatedCard))
      }).finally(() => event.target.value = ''),
      { pending: 'Uploading attachment...' }
    )
  }

  const onDeleteAttachment = (publicId) => {
    toast.promise(
      deleteCardAttachmentAPI(activeCard._id, publicId).then((updatedCard) => {
        dispatch(updateCurrentActiveCard(updatedCard))
        dispatch(updateCardInBoard(updatedCard))
      }),
      { pending: 'Deleting attachment...' }
    )
  }

  // ===== ARCHIVE HANDLER =====
  const onArchiveCard = () => {
    confirmArchiveCard({
      title: 'Archive this card?',
      description: 'This card will be archived. You can restore it later.',
      confirmationText: 'Archive',
      confirmationButtonProps: { color: 'warning', variant: 'outlined' }
    }).then(() => {
      const cardId = activeCard._id
      const columnId = activeCard.columnId

      // Optimistic update: remove card from board UI instantly
      dispatch(deleteCardOptimistic({ cardId, columnId }))

      // Close modal
      dispatch(clearAndHideCurrentActiveCard())

      // Call API
      archiveCardAPI(cardId).then(() => {
        toast.success('Card has been archived!')
      }).catch(() => {
        toast.error('Failed to archive card!')
        // Reload board to restore state if API fails
        dispatch(fetchBoardDetailAPI(board._id))
      })
    }).catch(() => {
      // Do nothing on cancel
    })
  }

  // ===== SAVE AS TEMPLATE HANDLER =====
  const onSaveAsTemplate = async () => {
    try {
      await saveCardAsTemplateAPI(activeCard._id)
      toast.success('Saved as template successfully!')
    } catch (error) {
      toast.error('Failed to save as template!')
    }
  }

  // ===== COPY HANDLER =====
  const onCopyCard = () => {
    dispatch(setClipboard({ type: 'CARD', data: activeCard }))
    toast.success(`Copied card: ${activeCard.title}`)
  }

  return (
    <>
      <Modal
        disableScrollLock
      open={isShowModalActiveCard}
      onClose={handleCloseModal} // Sử dụng onClose trong trường hợp muốn đóng Modal bằng nút ESC hoặc click ra ngoài Modal
      sx={{ overflowY: 'auto' }}>
      <Box sx={{
        position: 'relative',
        width: 900,
        maxWidth: 900,
        bgcolor: 'white',
        boxShadow: 24,
        borderRadius: '8px',
        border: 'none',
        outline: 0,
        padding: '40px 20px 20px',
        margin: '50px auto',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1A2027' : '#fff'
      }}>
        <Box sx={{
          position: 'absolute',
          top: '12px',
          right: '10px',
          cursor: 'pointer'
        }}>
          <CancelIcon color="error" sx={{ '&:hover': { color: 'error.light' } }} onClick={handleCloseModal} />
        </Box>

        {activeCard?.cover &&
          <Box sx={{ mb: 4 }}>
            <img
              style={{ width: '100%', height: '320px', borderRadius: '6px', objectFit: 'cover' }}
              src={activeCard?.cover}
              alt="card-cover"
            />
          </Box>
        }


        <Box sx={{ mb: 1, mt: -3, pr: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCardIcon />

          {/* Feature 01: Xử lý tiêu đề của Card */}
          {isReadOnly ? (
            <Typography variant="h6" sx={{ fontSize: '22px', fontWeight: 600 }}>{activeCard?.title}</Typography>
          ) : (
            <ToggleFocusInput
              inputFontSize='22px'
              value={activeCard?.title}
              onChangedValue={onUpdateCardTitle} />
          )}
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Left side */}
          <Grid xs={12} sm={isReadOnly ? 12 : 9}>
            <Box sx={{ mb: 3, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box>
                <Typography sx={{ fontWeight: '600', color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : '#57606a', mb: 1 }}>Members</Typography>

                {/* Feature 02: Xử lý các thành viên của Card */}
                <CardUserGroup 
                  cardMemberIds={activeCard?.memberIds}
                  onUpdateCardMembers={onUpdateCardMembers}
                />
              </Box>
              
              {!!cardLabels.length && (
                <Box>
                  <Typography sx={{ fontWeight: '600', color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : '#57606a', mb: 1 }}>Labels</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {cardLabels.map(label => (
                      <Box key={label._id} sx={{
                        bgcolor: label.color, px: 1.5, py: 0.5, borderRadius: 1, color: 'white', fontWeight: 600, fontSize: 14
                      }}>
                        {label.title}
                      </Box>
                    ))}
                    {!isReadOnly && (
                      <Box onClick={(e) => setAnchorElLabels(e.currentTarget)} sx={{
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
                        px: 1.5, py: 0.5, borderRadius: 1, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300] }
                      }}>
                        <AddOutlinedIcon fontSize="small" />
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {activeCard?.dueDate && (
                <Box>
                  <Typography sx={{ fontWeight: '600', color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : '#57606a', mb: 1 }}>Dates</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Checkbox
                      disabled={isReadOnly}
                      checked={!!activeCard?.dueComplete}
                      onChange={onToggleDueComplete}
                      size="small"
                      sx={(theme) => ({
                        p: 0,
                        color: getDueDateColor(dueDateState, theme),
                        '&.Mui-checked': { color: getDueDateColor('completed', theme) }
                      })}
                    />
                    <Box sx={(theme) => ({
                      bgcolor: getDueDateColor(dueDateState, theme),
                      color: getDueDateTextColor(dueDateState, theme),
                      px: 1.5, py: 0.5, borderRadius: 1,
                      fontWeight: 600, fontSize: 14,
                      display: 'flex', alignItems: 'center', gap: 0.5,
                      cursor: isReadOnly ? 'default' : 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': { opacity: isReadOnly ? 1 : 0.85 }
                    })}
                    onClick={(e) => { if (!isReadOnly) setAnchorElDates(e.currentTarget) }}
                    >
                      {dueDateState === 'completed'
                        ? <TaskAltOutlinedIcon sx={{ fontSize: 16 }} />
                        : <WatchLaterOutlinedIcon sx={{ fontSize: 16 }} />
                      }
                      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>
                        {dayjs(activeCard.dueDate).format('DD MMM [at] HH:mm')}
                      </Box>
                      {dueDateState === 'overdue' && (
                        <Box component="span" sx={{ fontSize: 12, ml: 0.8, fontWeight: 700, display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>OVERDUE</Box>
                      )}
                      {dueDateState === 'completed' && (
                        <Box component="span" sx={{ fontSize: 12, ml: 0.8, fontWeight: 700, display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}>COMPLETE</Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Feature Custom Fields: Render dynamic fields */}
            <CardCustomFieldsSection 
              onUpdateCardCustomFields={onUpdateCardCustomFields} 
            />

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SubjectRoundedIcon />
                <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Description</Typography>
              </Box>

              {/* Feature 03: Xử lý mô tả của Card */}
              <CardDescriptionMdEditor
                cardDescriptionProp={activeCard?.description}
                handleUpdateCardDescription={onUpdateCardDescription}
              />
            </Box>

            {/* Feature Checklist: Render toàn bộ checklists của card */}
            {!!activeCard?.checklists?.length && (
              <Box sx={{ mb: 3 }}>
                <CardChecklistSection
                  checklists={activeCard?.checklists}
                  onUpdateChecklists={onUpdateChecklists}
                />
              </Box>
            )}

            {/* Feature Attachment: Render danh sách file đính kèm */}
            {!!activeCard?.attachments?.length && (
              <CardAttachmentSection
                attachments={activeCard?.attachments}
                onDeleteAttachment={onDeleteAttachment}
              />
            )}

            <Box sx={{ mb: 3 }}>
              {/* Feature 04: Xử lý các hành động, ví dụ comment vào Card */}
              <CardActivitySection
                cardId={activeCard?._id}
              />
            </Box>
          </Grid>

          {/* Right side */}
          {!isReadOnly && (
            <Grid xs={12} sm={3}>
              <Typography sx={{ fontWeight: '600', color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : '#57606a', mb: 1 }}>Add To Card</Typography>
            <Stack direction="column" spacing={1}>
              {/* Feature 05: Xử lý hành động bản thân user tự join vào card */}
              {/* Nếu user hiện tại đang đăng nhập chưa thuộc mảng memberIds của card thì mới cho hiện nút Join ra */}

              {/* Khi Click vào Join thì nó sẽ luôn là hành động ADD */}
              {!activeCard?.memberIds?.includes(currentUser._id) && 
                <SidebarItem 
                  className="active"
                  onClick={() => onUpdateCardMembers({
                    userId: currentUser._id,
                    action: CARD_MEMBER_ACTIONS.ADD
                  })}
                >
                  <PersonOutlineOutlinedIcon fontSize="small" />
                  Join
                </SidebarItem>
              }
              {/* Feature 06: Xử lý hành động cập nhật ảnh Cover của Card */}
              <SidebarItem className="active" component="label">
                <ImageOutlinedIcon fontSize="small" />
                Cover
                <VisuallyHiddenInput type="file" onChange={onUploadCardCover} />
              </SidebarItem>

              <SidebarItem className="active" component="label">
                <AttachFileOutlinedIcon fontSize="small" />Attachment
                <VisuallyHiddenInput type="file" onChange={onUploadAttachment} />
              </SidebarItem>
              <SidebarItem className="active" onClick={(e) => setAnchorElLabels(e.currentTarget)}>
                <LocalOfferOutlinedIcon fontSize="small" />Labels
              </SidebarItem>
              <CardLabelsPopover
                anchorEl={anchorElLabels}
                handleClose={() => setAnchorElLabels(null)}
                activeCard={activeCard}
                onUpdateCardLabels={onUpdateCardLabels}
              />
              <SidebarItem className="active" onClick={(e) => setAnchorElChecklist(e.currentTarget)}>
                <TaskAltOutlinedIcon fontSize="small" />Checklist
              </SidebarItem>
              <CardChecklistPopover
                anchorEl={anchorElChecklist}
                handleClose={() => setAnchorElChecklist(null)}
                onAddChecklist={onAddChecklist}
              />
              <SidebarItem className="active" onClick={(e) => setAnchorElDates(e.currentTarget)}>
                <WatchLaterOutlinedIcon fontSize="small" />Dates
              </SidebarItem>
              <CardDatesPopover
                anchorEl={anchorElDates}
                handleClose={() => setAnchorElDates(null)}
                activeCard={activeCard}
                onUpdateCardDates={onUpdateCardDates}
              />
              <SidebarItem className="active" onClick={(e) => setAnchorElCustomFields(e.currentTarget)}>
                <AutoFixHighOutlinedIcon fontSize="small" />Custom Fields
              </SidebarItem>
              <CardCustomFieldsPopover 
                anchorEl={anchorElCustomFields}
                handleClose={() => setAnchorElCustomFields(null)}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography sx={{ fontWeight: '600', color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : '#57606a', mb: 1 }}>Power-Ups</Typography>
            <Stack direction="column" spacing={1}>
              <SidebarItem className="active" onClick={(e) => setAnchorElCardLayout(e.currentTarget)}>
                <AspectRatioOutlinedIcon fontSize="small" />Card Layout
              </SidebarItem>
              <CardLayoutPopover
                anchorEl={anchorElCardLayout}
                handleClose={() => setAnchorElCardLayout(null)}
                onUpdateCardLayout={onUpdateCardLayout}
              />
              <SidebarItem><AddToDriveOutlinedIcon fontSize="small" />Google Drive</SidebarItem>
              <SidebarItem><AddOutlinedIcon fontSize="small" />Add Power-Ups</SidebarItem>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography sx={{ fontWeight: '600', color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : '#57606a', mb: 1 }}>Actions</Typography>
            <Stack direction="column" spacing={1}>
              <SidebarItem onClick={() => setMoveModalOpen(true)}><ArrowForwardOutlinedIcon fontSize="small" />Move</SidebarItem>
              <SidebarItem onClick={onCopyCard}><ContentCopyOutlinedIcon fontSize="small" />Copy</SidebarItem>
              <SidebarItem onClick={onSaveAsTemplate}><DashboardCustomizeOutlinedIcon fontSize="small" />Make Template</SidebarItem>
              <SidebarItem onClick={onArchiveCard}><ArchiveOutlinedIcon fontSize="small" />Archive</SidebarItem>
              <SidebarItem onClick={() => setIsShareModalOpen(true)}><ShareOutlinedIcon fontSize="small" />Share</SidebarItem>
            </Stack>
          </Grid>
          )}
        </Grid>
      </Box>
      </Modal>

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={`${window.location.origin}/boards/${board?._id}?cardId=${activeCard?._id}`}
        title={activeCard?.title}
        type="Card"
      />

      <CardMoveDialog
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        card={activeCard}
        board={board}
        isActiveCardModal={true}
      />
    </>
  )
}

export default ActiveCard
