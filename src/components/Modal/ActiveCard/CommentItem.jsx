import { useState } from 'react'
import dayjs from 'dayjs'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ReplyIcon from '@mui/icons-material/Reply'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { useConfirm } from 'material-ui-confirm'

import { getCommentRepliesAPI, createCommentAPI, updateCommentAPI, deleteCommentAPI } from '~/apis'

const CommentActionMenu = ({ onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)

  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget)
  const handleCloseMenu = () => setAnchorEl(null)

  const handleEditClick = () => {
    handleCloseMenu()
    onEdit()
  }

  const handleDeleteClick = () => {
    handleCloseMenu()
    onDelete()
  }

  return (
    <Box className="action-menu" sx={{ opacity: openMenu ? 1 : 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center' }}>
      <IconButton size="small" onClick={handleOpenMenu} sx={{ p: 0.5 }}>
        <MoreVertIcon sx={{ fontSize: 18 }} />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEditClick} sx={{ fontSize: '14px' }}>
          <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ fontSize: '14px', color: 'error.main' }}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
          Xóa
        </MenuItem>
      </Menu>
    </Box>
  )
}

const CommentItem = ({ rootComment, cardId, currentUser, onNewCommentRefetch }) => {
  const [replies, setReplies] = useState([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  
  const [showReplies, setShowReplies] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [targetUser, setTargetUser] = useState(null)
  const [isSending, setIsSending] = useState(false)

  // Edit State
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const confirmDelete = useConfirm()

  const fetchReplies = async () => {
    if (loadingReplies) return
    try {
      setLoadingReplies(true)
      const result = await getCommentRepliesAPI(rootComment._id, 1, 50) // Fetch up to 50 replies
      setReplies(result.comments || [])
    } catch (error) {
      console.error('Failed to fetch replies:', error)
    } finally {
      setLoadingReplies(false)
    }
  }

  // Handle toggling show replies
  const handleToggleReplies = () => {
    if (!showReplies && replies.length === 0 && rootComment.replyCount > 0) {
      fetchReplies()
    }
    setShowReplies(!showReplies)
  }

  // Auto load if we have a new reply added by us
  const handleSendReply = async () => {
    if (!replyText.trim()) return
    try {
      setIsSending(true)
      await createCommentAPI({
        cardId: cardId,
        content: replyText.trim(),
        parentId: rootComment._id,
        replyToUserDisplayName: targetUser
      })
      
      // Update UI
      setReplyText('')
      setTargetUser(null)
      setIsReplying(false)
      setShowReplies(true)
      
      // Re-fetch replies
      await fetchReplies()
      
      // Update root to sync replyCount
      if (onNewCommentRefetch) onNewCommentRefetch()

    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleReplyToChild = (childUserName) => {
    setIsReplying(true)
    setTargetUser(childUserName)
    setReplyText('')
    setShowReplies(true)
  }

  const handleReplyToRoot = () => {
    setIsReplying(!isReplying)
    setTargetUser(null)
    setReplyText('')
  }

  // --- EDIT / DELETE HANDLERS ---
  const handleEditStart = (id, content) => {
    setEditingId(id)
    setEditContent(content)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleEditSave = async (id, isRoot) => {
    if (!editContent.trim()) return
    try {
      setIsSaving(true)
      await updateCommentAPI(id, { content: editContent.trim() })
      
      if (isRoot) {
        if (onNewCommentRefetch) onNewCommentRefetch()
      } else {
        setReplies(prev => prev.map(r => r._id === id ? { ...r, content: editContent.trim(), updatedAt: Date.now() } : r))
      }
      
      handleEditCancel()
    } catch (error) {
      console.error('Failed to update comment', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = async (id, isRoot) => {
    try {
      await confirmDelete({
        title: 'Xóa bình luận?',
        description: isRoot 
          ? 'Bạn có chắc muốn xóa bình luận này? Tất cả phản hồi bên trong cũng sẽ bị xóa vĩnh viễn!'
          : 'Bạn có chắc muốn xóa phản hồi này không?',
        confirmationText: 'Xóa',
        cancellationText: 'Hủy',
        confirmationButtonProps: { color: 'error', variant: 'contained' }
      })
    } catch (e) {
      // User pressed cancel or dismissed the dialog
      return
    }

    // If we reach here, user confirmed the deletion
    try {
      await deleteCommentAPI(id)
      if (isRoot) {
        if (onNewCommentRefetch) onNewCommentRefetch()
      } else {
        setReplies(prev => prev.filter(r => r._id !== id))
        if (onNewCommentRefetch) onNewCommentRefetch()
      }
    } catch (error) {
      console.error('Failed to delete comment', error)
    }
  }

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {/* 1. RENDER ROOT COMMENT */}
      <Box sx={{ display: 'flex', gap: 1, '&:hover .action-menu': { opacity: 1 } }}>
        <Tooltip title={rootComment.userDisplayName}>
          <Avatar sx={{ width: 36, height: 36 }} src={rootComment.userAvatar} />
        </Tooltip>
        
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="span" sx={{ fontWeight: 'bold' }}>
              {rootComment.userDisplayName}
            </Typography>
            <Typography variant="span" sx={{ fontSize: '12px', color: 'text.secondary' }}>
              {dayjs(rootComment.createdAt).fromNow()}
            </Typography>

            {editingId !== rootComment._id && currentUser?._id === rootComment.userId && (
               <CommentActionMenu 
                 onEdit={() => handleEditStart(rootComment._id, rootComment.content)} 
                 onDelete={() => handleDeleteClick(rootComment._id, true)} 
               />
            )}
          </Box>

          {editingId === rootComment._id ? (
            <Box sx={{ mt: 1 }}>
              <TextField
                fullWidth
                multiline
                size="small"
                autoFocus
                onFocus={(e) => {
                  const length = e.target.value.length
                  e.target.setSelectionRange(length, length)
                }}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                disabled={isSaving}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button variant="contained" size="small" onClick={() => handleEditSave(rootComment._id, true)} disabled={isSaving || !editContent.trim()}>Lưu</Button>
                <Button variant="text" size="small" onClick={handleEditCancel} disabled={isSaving}>Hủy</Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{
                width: 'fit-content',
                maxWidth: '100%',
                wordBreak: 'break-word',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#22272e' : '#f8f9fa',
                color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : 'text.primary',
                border: (theme) => theme.palette.mode === 'dark' ? '1px solid #444c56' : '1px solid #e1e4e8',
                p: '10px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                lineHeight: '1.5',
                mt: 0.5
              }}>
                {rootComment.content}
              </Box>
              {rootComment.updatedAt && (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '11px', mb: 0.5 }}>
                  (đã chỉnh sửa)
                </Typography>
              )}
            </Box>
          )}
          
          {editingId !== rootComment._id && (
            <Box sx={{ display: 'flex', gap: 2, mt: 0.5, alignItems: 'center' }}>
              <Typography 
                variant="caption" fontWeight="bold" color="text.secondary"
                sx={{ 
                  cursor: 'pointer',
                  p: '2px 8px',
                  borderRadius: '4px', 
                  '&:hover': { 
                    color: 'text.primary',
                    bgcolor: 'action.hover'
                  } 
                }}
                onClick={handleReplyToRoot}
              >
                Trả lời
              </Typography>
              
              {(rootComment.replyCount > 0 || replies.length > 0) && (
                <Typography 
                  variant="caption" color="primary" fontWeight="bold" 
                  sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
                  onClick={handleToggleReplies}
                >
                  {showReplies ? (
                    <>
                      <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                      Thu gọn
                    </>
                  ) : (
                    <>
                      <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                      {`${Math.max(rootComment.replyCount, replies.length)} phản hồi`}
                    </>
                  )}
                  {loadingReplies && <CircularProgress size={10} />}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* 2. RENDER REPLIES (Thụt lề 1 cấp) */}
      <Collapse in={showReplies}>
        <Box sx={{ ml: 5, mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {replies.map(reply => (
            <Box key={reply._id} sx={{ display: 'flex', gap: 1, '&:hover .action-menu': { opacity: 1 } }}>
              <Tooltip title={reply.userDisplayName}>
                <Avatar sx={{ width: 28, height: 28 }} src={reply.userAvatar} />
              </Tooltip>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="span" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                    {reply.userDisplayName}
                  </Typography>

                  {reply.replyToUserDisplayName && (
                    <>
                      <ReplyIcon sx={{ fontSize: 16, color: 'text.secondary', transform: 'scaleX(-1)' }} />
                      <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        {reply.replyToUserDisplayName}
                      </Typography>
                    </>
                  )}

                  <Typography variant="span" sx={{ fontSize: '11px', color: 'text.secondary', ml: 0.5 }}>
                    {dayjs(reply.createdAt).fromNow()}
                  </Typography>

                  {editingId !== reply._id && currentUser?._id === reply.userId && (
                    <CommentActionMenu 
                      onEdit={() => handleEditStart(reply._id, reply.content)} 
                      onDelete={() => handleDeleteClick(reply._id, false)} 
                    />
                  )}
                </Box>

                {editingId === reply._id ? (
                  <Box sx={{ mt: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      multiline
                      size="small"
                      autoFocus
                      onFocus={(e) => {
                        const length = e.target.value.length
                        e.target.setSelectionRange(length, length)
                      }}
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      disabled={isSaving}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button variant="contained" size="small" onClick={() => handleEditSave(reply._id, false)} disabled={isSaving || !editContent.trim()}>Lưu</Button>
                      <Button variant="text" size="small" onClick={handleEditCancel} disabled={isSaving}>Hủy</Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ 
                      width: 'fit-content',
                      maxWidth: '100%',
                      wordBreak: 'break-word',
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#22272e' : '#f8f9fa',
                      color: (theme) => theme.palette.mode === 'dark' ? '#adbac7' : 'text.primary',
                      border: (theme) => theme.palette.mode === 'dark' ? '1px solid #444c56' : '1px solid #e1e4e8',
                      p: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      mt: 0.5
                    }}>
                      {reply.content}
                    </Box>
                    {reply.updatedAt && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '11px', mb: 0.5 }}>
                        (đã chỉnh sửa)
                      </Typography>
                    )}
                  </Box>
                )}
                
                {editingId !== reply._id && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 0.5, alignItems: 'center' }}>
                    <Typography 
                      variant="caption" fontWeight="bold" color="text.secondary"
                      sx={{ 
                        cursor: 'pointer', 
                        display: 'block',
                        p: '2px 8px',
                        borderRadius: '4px', 
                        '&:hover': { 
                          color: 'text.primary',
                          bgcolor: 'action.hover'
                        } 
                      }}
                      onClick={() => handleReplyToChild(reply.userDisplayName)}
                    >
                      Trả lời
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>

      {/* 3. Ô NHẬP REPLIES (Nằm ngay dưới replies list) */}
      {isReplying && (
        <Box sx={{ ml: 5, mt: 1.5, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
           <Avatar src={currentUser?.avatar} sx={{ width: 28, height: 28 }} />
           <Box sx={{ width: '100%' }}>
             <TextField 
               size="small" 
               fullWidth 
               autoFocus
               placeholder={targetUser ? `Trả lời ${targetUser}...` : `Trả lời ${rootComment.userDisplayName}...`}
               value={replyText} 
               onChange={e => setReplyText(e.target.value)}
               multiline
               disabled={isSending}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault()
                   handleSendReply()
                 }
               }}
             />
             <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
               <Button variant="contained" size="small" onClick={handleSendReply} disabled={isSending || !replyText.trim()}>
                 {isSending ? 'Đang gửi...' : 'Gửi'}
               </Button>
               <Button variant="text" size="small" onClick={() => setIsReplying(false)}>Hủy</Button>
             </Box>
           </Box>
        </Box>
      )}
    </Box>
  )
}

export default CommentItem
