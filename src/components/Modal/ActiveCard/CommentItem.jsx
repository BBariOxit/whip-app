import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'

import { getCommentRepliesAPI, createCommentAPI } from '~/apis'

const CommentItem = ({ rootComment, cardId, currentUser, onNewCommentRefetch }) => {
  const [replies, setReplies] = useState([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  
  const [showReplies, setShowReplies] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isSending, setIsSending] = useState(false)

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
        parentId: rootComment._id
      })
      
      // Update UI
      setReplyText('')
      setIsReplying(false)
      setShowReplies(true)
      
      // Re-fetch replies
      await fetchReplies()
      
      // Tùy chọn: Gọi trigger refetch root để cập nhật replyCount nếu muốn
      if (onNewCommentRefetch) onNewCommentRefetch()

    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleReplyToChild = (childUserName) => {
    setIsReplying(true)
    setReplyText(`@${childUserName} `)
    setShowReplies(true)
  }

  // Hàm render text để highlight @username
  const renderContentWithHighlight = (content) => {
    // Tìm các từ bắt đầu bằng @ và in đậm
    const parts = content.split(/(@\S+)/g)
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return <Typography component="span" key={index} sx={{ fontWeight: 'bold', color: 'primary.main' }}>{part}</Typography>
      }
      return part
    })
  }

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {/* 1. RENDER ROOT COMMENT */}
      <Box sx={{ display: 'flex', gap: 1 }}>
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
          </Box>

          <Box sx={{
            display: 'inline-block',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : 'white',
            p: '8px 12px',
            mt: '4px',
            border: '0.5px solid rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            wordBreak: 'break-word',
            boxShadow: '0 0 1px rgba(0, 0, 0, 0.2)'
          }}>
            {rootComment.content}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
            <Typography 
              variant="caption" fontWeight="bold" 
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => { setIsReplying(!isReplying); setReplyText(''); }}
            >
              Trả lời
            </Typography>
            
            {(rootComment.replyCount > 0 || replies.length > 0) && (
              <Typography 
                variant="caption" color="primary" fontWeight="bold" 
                sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
                onClick={handleToggleReplies}
              >
                {showReplies ? 'Thu gọn' : `v ${Math.max(rootComment.replyCount, replies.length)} phản hồi`}
                {loadingReplies && <CircularProgress size={10} />}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* 2. RENDER REPLIES (Thụt lề 1 cấp) */}
      <Collapse in={showReplies}>
        <Box sx={{ ml: 5, mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {replies.map(reply => (
            <Box key={reply._id} sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={reply.userDisplayName}>
                <Avatar sx={{ width: 28, height: 28 }} src={reply.userAvatar} />
              </Tooltip>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="span" sx={{ fontWeight: 'bold', fontSize: '13px' }}>
                    {reply.userDisplayName}
                  </Typography>
                  <Typography variant="span" sx={{ fontSize: '11px', color: 'text.secondary' }}>
                    {dayjs(reply.createdAt).fromNow()}
                  </Typography>
                </Box>

                <Box sx={{ 
                  display: 'inline-block',
                  bgcolor: 'action.hover', 
                  p: '6px 10px', 
                  mt: '2px',
                  borderRadius: '4px', 
                  fontSize: '13px',
                  wordBreak: 'break-word'
                }}>
                  {renderContentWithHighlight(reply.content)}
                </Box>
                
                <Typography 
                  variant="caption" fontWeight="bold" 
                  sx={{ cursor: 'pointer', mt: 0.5, display: 'block', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => handleReplyToChild(reply.userDisplayName)}
                >
                  Trả lời
                </Typography>
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
               placeholder={`Trả lời ${rootComment.userDisplayName}...`}
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
